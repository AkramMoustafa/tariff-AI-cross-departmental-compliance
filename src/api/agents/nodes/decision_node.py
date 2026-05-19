import json
import os
import re

from langchain_openai import ChatOpenAI

from src.api.agents.state import POState

_llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.2,
    openai_api_key=os.getenv("OPENAI_API_KEY"),
)

_PROMPT = """\
You are a supply chain decision analyst.

Evaluate the shipment below and choose the best mitigation action from the candidate list.
Be specific about why, the expected impact, tradeoffs, and urgency level.

--- SHIPMENT ---
Origin: {origin_city}, {origin_country}
Destination: {destination_city}, {destination_country}
Shipping method: {shipping_method}
Product category: {product_category}
Route type: {route_type}

--- RISK SCORES (0-1 scale) ---
Geopolitical risk: {geo_risk}
Weather risk:      {weather_risk}
Macro / FX risk:   {macro_risk}
Sanctions risk:    {sanctions_risk}

--- ML PREDICTION ---
Predicted delay: {delay} days
ML recommended action: {ml_action}

--- CANDIDATE ACTIONS ---
{actions}

Return ONLY valid JSON with this exact shape:
{{
  "recommendation": "<chosen action from the candidate list>",
  "reasoning": "<2-4 sentences explaining why this action is best>",
  "urgency": "<LOW | MEDIUM | HIGH | CRITICAL>",
  "alternatives": ["<action>: <one-line tradeoff>", ...]
}}
"""


def decision_node(state: POState) -> dict:
    po = state["po"]
    prediction = state.get("prediction", {})
    sanctions = state.get("sanctions_risk", {})

    prompt = _PROMPT.format(
        origin_city=po.get("origin_city", "Unknown"),
        origin_country=po.get("origin_country", "Unknown"),
        destination_city=po.get("destination_city", "Unknown"),
        destination_country=po.get("destination_country", "Unknown"),
        shipping_method=po.get("shipping_method", "Unknown"),
        product_category=po.get("product_category", "Unknown"),
        route_type=po.get("route_type", "Unknown"),
        geo_risk=round(state.get("geo_risk", 0.0), 3),
        weather_risk=round(state.get("weather_risk", 0.0), 3),
        macro_risk=round(state.get("macro_risk", 0.0), 3),
        sanctions_risk=round(sanctions.get("sanctions_risk", 0.0), 3),
        delay=round(prediction.get("delay", 0.0), 1),
        ml_action=prediction.get("action", "monitor"),
        actions="\n".join(f"- {a}" for a in state.get("actions", [])),
    )

    response = _llm.invoke(prompt)
    raw = response.content.strip()

    # Strip markdown fences if the model wraps the JSON
    raw = re.sub(r"^```(?:json)?|```$", "", raw, flags=re.MULTILINE).strip()

    try:
        decision = json.loads(raw)
    except json.JSONDecodeError:
        decision = {
            "recommendation": "review_manually",
            "reasoning": raw,
            "urgency": "MEDIUM",
            "alternatives": [],
        }

    return {"decision": decision}
