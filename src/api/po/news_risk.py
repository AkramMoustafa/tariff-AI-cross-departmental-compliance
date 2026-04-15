
import requests
import json
import pandas as pd
from datetime import datetime
from openai import OpenAI

NEWS_TRACKER = {

    "countries": {
        "China": {
            "keywords": [
                "china export", "china manufacturing", "china port",
                "shanghai lockdown", "china trade restriction",
                "china tariff", "china slowdown"
            ],
            "risk_type": "manufacturing + export"
        },

        "United States": {
            "keywords": [
                "us tariff", "trade war", "import restriction",
                "port strike", "west coast port congestion"
            ],
            "risk_type": "policy + ports"
        },

        "Germany": {
            "keywords": [
                "germany manufacturing slowdown",
                "europe recession",
                "factory shutdown germany"
            ],
            "risk_type": "industrial demand"
        },

        "Iran": {
            "keywords": [
                "iran sanctions", "iran conflict",
                "military escalation iran", "strait of hormuz tension"
            ],
            "risk_type": "geopolitical hotspot"
        },

        "Egypt": {
            "keywords": [
                "suez canal blockage",
                "red sea attack",
                "shipping disruption egypt"
            ],
            "risk_type": "chokepoint control"
        }
    },

    "chokepoints": {
        "Suez Canal": {
            "keywords": [
                "suez canal blockage",
                "red sea shipping attack",
                "houthi attack shipping",
                "container stuck suez"
            ],
            "base_risk": 0.8
        },

        "Strait of Hormuz": {
            "keywords": [
                "hormuz tension",
                "iran navy",
                "oil tanker seizure",
                "persian gulf conflict"
            ],
            "base_risk": 0.9
        },

        "Panama Canal": {
            "keywords": [
                "panama canal drought",
                "low water levels panama",
                "shipping delay panama"
            ],
            "base_risk": 0.6
        },

        "South China Sea": {
            "keywords": [
                "south china sea tension",
                "naval dispute",
                "china philippines conflict"
            ],
            "base_risk": 0.7
        }
    },

    "routes": {
        "Asia_to_Europe_Suez": {
            "keywords": [
                "asia europe shipping delay",
                "container delay europe",
                "freight rate asia europe",
                "red sea disruption"
            ],
            "linked_chokepoints": ["Suez Canal"]
        },

        "Asia_to_US_West": {
            "keywords": [
                "trans pacific shipping delay",
                "los angeles port congestion",
                "container rates pacific"
            ],
            "linked_chokepoints": []
        },

        "MiddleEast_Oil": {
            "keywords": [
                "oil supply disruption",
                "middle east oil risk",
                "tanker disruption"
            ],
            "linked_chokepoints": ["Strait of Hormuz"]
        }
    }
}
from datetime import datetime, timedelta

today = datetime.utcnow()
days_back = 5
past = today - timedelta(days=days_back)

from_date = past.strftime("%Y-%m-%d")
to_date = today.strftime("%Y-%m-%d")

import os
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


client = OpenAI(api_key=OPENAI_API_KEY)

NEWS_URL = "https://newsapi.org/v2/everything"

RISK_KEYWORDS = [
    "strike","shutdown","port","sanctions","war",
    "earthquake","flood","factory","tariff",
    "disruption","blockade","shipping","oil",
    "pipeline","export","import","supply chain",
    "tanker","embargo","canal","strait","red sea",
    "hormuz","suez","taiwan","chips","semiconductor"
]

severity_map = {
    "low": 0.33,
    "medium": 0.66,
    "high": 1.0
}

CHOKEPOINTS = {
    "strait of hormuz": "oil",
    "suez canal": "shipping",
    "panama canal": "shipping",
    "red sea": "shipping",
    "malacca strait": "shipping"
}

def extract_events_from_passages(text):

    prompt = f"""
Analyze the following news passages.

Extract ONLY supply chain or geopolitical disruption events.

Return STRICT JSON:

{{
  "events":[
    {{
      "event": "...",
      "location": "...",
      "countries": ["..."],
      "severity": "low|medium|high"
    }}
  ]
}}

News:
{text}
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return response.output_text

def enrich_events(events):

    enriched = []

    for event in events:
        location = event.get("location", "").lower()
        text = event.get("event", "").lower()

        # severity → numeric
        sev = event.get("severity", "low").lower()
        severity_score = severity_map.get(sev, 1)

        # detect chokepoint
        chokepoint = None
        for cp in CHOKEPOINTS:
            if cp in location:
                chokepoint = cp
                break

        # detect category
        if "ship" in text or "tanker" in text:
            category = "shipping"
        elif "oil" in text:
            category = "energy"
        elif "chip" in text or "semiconductor" in text:
            category = "semiconductor"
        elif "war" in text:
            category = "conflict"
        else:
            category = "general"

        enriched.append({
            **event,
            "severity_score": severity_score,
            "chokepoint": chokepoint,
            "category": category
        })

    return enriched

def run_global_news_pipeline():

    

    params = {
        "q": "(war OR sanctions OR port OR shipping OR disruption OR blockade OR tariff OR factory OR oil OR tanker OR canal OR strait OR red sea OR suez OR hormuz OR taiwan OR semiconductor OR chips)",
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 50,
        "from": from_date,   # ✅ ADD THIS
        "to": to_date,       # ✅ ADD THIS
        "apiKey": NEWS_API_KEY
    }
    all_articles = []

    for page in range(1, 4):   # gets 3 pages = 150 articles
        params["page"] = page
        response = requests.get(NEWS_URL, params=params)
        data = response.json()
        all_articles.extend(data.get("articles", []))

    articles = all_articles

    passages = []

    for article in articles:
        title = article.get("title") or ""
        desc = article.get("description") or ""

        text = (title + " " + desc).lower()

        if not any(k in text for k in RISK_KEYWORDS):
            continue
        if len(text) < 40:
            continue
        passages.append(f"{title}. {desc}")

    print("📰 Filtered Articles:", len(passages))

    if not passages:
        return {
            "events": [],
            "event_count": 0,
            "global_risk": 0,
            "timestamp": datetime.utcnow().isoformat()
        }

    print("\n📰 SAMPLE ARTICLES:\n")
    for i, p in enumerate(passages[:10]):
        print(f"{i+1}. {p}\n")

    combined_text = "\n\n".join(passages[:20])

    try:
        raw = extract_events_from_passages(combined_text)
        print("\n🧠 RAW LLM OUTPUT:\n", raw)

        parsed = json.loads(raw)
        events = parsed.get("events", [])

        events = enrich_events(events)

    except Exception as e:
        print("❌ LLM Error:", e)
        events = []

    if not events:
        return {
            "events": [],
            "event_count": 0,
            "global_risk": 0,
            "timestamp": datetime.utcnow().isoformat()
        }

    avg_severity = sum(e["severity_score"] for e in events) / len(events)

    frequency_factor = min(len(events) / 5, 1.0)

    global_risk = round((avg_severity / 3) * frequency_factor, 3)

    return {
        "events": events,
        "event_count": len(events),
        "global_risk": global_risk,
        "timestamp": datetime.utcnow().isoformat()
    }

def print_results(result):

    print("\n" + "="*60)
    print("🌍 GLOBAL SUPPLY CHAIN RISK REPORT")
    print("="*60)

    print(f"\n🔥 Global Risk Score: {result['global_risk']}")
    print(f"📊 Event Count: {result['event_count']}\n")

    for e in result["events"]:
        print(f"🚨 {e['event']}")
        print(f"   📍 Location: {e['location']}")
        print(f"   🌎 Countries: {e['countries']}")
        print(f"   ⚠️ Severity: {e['severity']} ({e['severity_score']})")
        print(f"   🔗 Chokepoint: {e['chokepoint']}")
        print(f"   🧠 Category: {e['category']}")
        print()



def compute_country_risk_from_news(result, target_country):

    events = result["events"]
    target = target_country.lower()

    relevant_events = []

    for e in events:
        text = e["event"].lower()
        location = (e.get("location") or "").lower()
        countries = [c.lower() for c in e.get("countries", [])]

        if (
            target in countries
            or target in text
            or target in location
        ):
            relevant_events.append(e)
    if not relevant_events:
        return {
            "country": target_country,
            "event_count": 0,
            "risk": 0.1,  # baseline
            "events": []
        }

    avg_severity = sum(e["severity_score"] for e in relevant_events) / len(relevant_events)
    frequency = min(len(relevant_events) / 5, 1.0)

    base_risk = (avg_severity / 3) * frequency

    # 🔥 chokepoint boost
    chokepoint_boost = sum(
        0.1 for e in relevant_events if e.get("chokepoint")
    )
    chokepoint_boost = min(chokepoint_boost, 0.3)

    final_risk = min(base_risk + chokepoint_boost, 1.0)

    return {
        "country": target_country,
        "event_count": len(relevant_events),
        "risk": round(final_risk, 3),
        "events": relevant_events
    }




from collections import defaultdict
from datetime import datetime, timezone

COUNTRY_ALIASES = {
    "uae": "united arab emirates",
    "u.a.e": "united arab emirates",
    "united arab emirates": "united arab emirates",
    "usa": "united states",
    "us": "united states"
}

def normalize_country(name):
    return COUNTRY_ALIASES.get(name.lower().strip(), name.lower().strip())

GULF_COUNTRIES = {
    "bahrain",
    "kuwait",
    "united arab emirates",
    "qatar",
    "oman",
    "saudi arabia"
}

def get_all_country_risks(events):

    country_scores = defaultdict(list)

    for e in events:
        countries = [normalize_country(c) for c in e.get("countries", [])]
        severity = e["severity_score"]

        for c in countries:
            country_scores[c].append(severity)

        if "iran" in countries:
            for g in GULF_COUNTRIES:
                country_scores[g].append(severity * 0.9)

        if e.get("chokepoint") == "strait of hormuz":
            for g in GULF_COUNTRIES:
                country_scores[g].append(severity * 1.0)

    # 🔹 FINAL AGGREGATION
    final_risk = {}

    for country, scores in country_scores.items():

        avg = sum(scores) / len(scores)
        freq = min(len(scores) / 5, 1.0)
        max_s = max(scores)

        risk = max(
            0.6 * avg + 0.4 * freq,
            0.7 * max_s
        )

        final_risk[country] = round(min(risk, 1.0), 3)

    return final_risk

def find_country_risk(country_risks, country_name):

    country_name = normalize_country(country_name)

    return {
        "country": country_name,
        "risk": country_risks.get(country_name, 0.0),
        "found": country_name in country_risks
    }

def get_country_risks():
    result = run_global_news_pipeline()
    return get_all_country_risks(result["events"])

def get_news_risk(country, country_risks):
    country_key = normalize_country(country)
    risk = country_risks.get(country_key, 0.0)

    return {
        "country": country_key,
        "news_risk": round(risk, 3),
        "found": country_key in country_risks
    }


