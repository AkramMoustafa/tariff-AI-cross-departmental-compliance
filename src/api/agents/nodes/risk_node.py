from src.api.agents.state import POState
from src.api.agents.tools import (
    tool_get_sanctions_risk,
    tool_compute_geo_risk,
    tool_get_news_risk,
    tool_compute_weather_risk,
    tool_get_macro_risk,
)

# Same mapping used in po_routes.py — kept in sync without duplication of logic
COUNTRY_TO_ISO = {
    "china": "CN",
    "united states": "US",
    "usa": "US",
    "netherlands": "NL",
    "japan": "JP",
    "germany": "DE",
    "mexico": "MX",
    "canada": "CA",
    "south korea": "KR",
    "france": "FR",
    "united kingdom": "GB",
    "india": "IN",
    "singapore": "SG",
}


def _to_iso(country: str) -> str:
    return COUNTRY_TO_ISO.get((country or "").lower(), "US")


def risk_node(state: POState) -> dict:
    po = state["po"]
    origin = po.get("origin_country", "")
    origin_city = po.get("origin_city", "")
    dest = po.get("destination_country", "")
    dest_city = po.get("destination_city", "")

    # --- sanctions ---
    sanctions_result = tool_get_sanctions_risk(origin)

    # --- geopolitical (includes news internally) ---
    geo_result = tool_compute_geo_risk(origin)
    geo_risk = float(geo_result.get("geopolitical_risk", 0.0))

    # --- weather ---
    try:
        weather_risk = tool_compute_weather_risk(
            origin_city, _to_iso(origin),
            dest_city, _to_iso(dest),
        )
    except Exception:
        weather_risk = po.get("stored_weather_risk", 0.0)

    # --- macro / FX ---
    macro_result = tool_get_macro_risk(origin)
    macro_risk = float(macro_result.get("combined_risk_score", 0.0))

    return {
        "sanctions_risk": sanctions_result,
        "geo_risk": geo_risk,
        "weather_risk": float(weather_risk),
        "macro_risk": macro_risk,
    }
