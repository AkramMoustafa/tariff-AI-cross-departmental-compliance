import requests
import pandas as pd
import datetime
import json
import os
from openai import OpenAI
from src.api.db import SessionLocal
from src.api.models import NewsEvent
from datetime import datetime
from pathlib import Path
from fastapi import HTTPException
import pandas as pd

severity_map = {
    "low": 1,
    "medium": 2,
    "high": 3
}
from src.api.models import NewsEvent
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

NEWS_URL = "https://newsapi.org/v2/everything"

RISK_KEYWORDS = [
    "strike","shutdown","port","sanctions","war",
    "earthquake","flood","factory","tariff",
    "disruption","blockade","shipping","oil",
    "pipeline","export","import","supply chain",
    "tanker","embargo"
]

CHOKEPOINTS = {
    "strait of hormuz": [
        "saudi arabia",
        "uae",
        "kuwait",
        "qatar",
        "bahrain",
        "iraq",
        "oman"
    ],
    "suez canal": [
        "egypt",
        "saudi arabia",
        "europe",
        "global shipping"
    ],
    "panama canal": [
        "united states",
        "latin america",
        "global shipping"
    ]
}

def get_news_risk_from_db(country: str, db):

    events = (
        db.query(NewsEvent)
        .filter(NewsEvent.country.ilike(country))
        .order_by(NewsEvent.discovered_at.desc())
        .limit(10)
        .all()
    )

    if not events:
        return {
            "country": country,
            "risk_level": "LOW",
            "risk_score": 0,
            "event_count": 0,
            "events": []
        }

    severity_map = {"low":1,"medium":2,"high":3}

    scores = [severity_map.get(e.severity.lower(),1) for e in events]

    avg_score = sum(scores)/len(scores)
    risk_score = round((avg_score/3)*10,2)

    if risk_score >= 7:
        level = "HIGH"
    elif risk_score >= 4:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "country": country,
        "risk_level": level,
        "risk_score": risk_score,
        "event_count": len(events),
        "events": [
            {
                "event": e.event,
                "location": e.location,
                "severity": e.severity
            } for e in events
        ]
    }

def extract_events_from_passages(text):

    prompt = f"""
Analyze the following news passages.

Extract geopolitical or supply chain disruption events.

Return STRICT JSON like:

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

News passages:
{text}
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    raw = response.output_text

    return raw
def expand_chokepoints(events):

    expanded_events = []

    for event in events:

        location = event.get("location","").lower()

        for chokepoint in CHOKEPOINTS:
            if chokepoint in location or location in chokepoint:
                affected = CHOKEPOINTS[chokepoint]
                countries = [c.lower() for c in event.get("countries",[])]
                countries += affected
                event["countries"] = list(set(countries))

        expanded_events.append(event)

    return expanded_events
def run_news_pipeline(country: str):

    params = {

        "q": "war OR strike OR sanctions OR shipping OR port OR disruption OR oil OR tanker",
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 50,
        "apiKey": NEWS_API_KEY
    }

    response = requests.get(NEWS_URL, params=params, timeout=10)
    data = response.json()

    if "articles" not in data:
        print("NewsAPI error:", data)
        return []

    articles = data["articles"]
    print("TOTAL ARTICLES:", len(articles))

    passages = []

    for article in articles:
        title = article.get("title") or ""
        description = article.get("description") or ""

        print("\n--- ARTICLE ---")
        print("TITLE:", title)
        print("DESCRIPTION:", description)

        text = (title + " " + description).lower()

        if not any(k in text for k in RISK_KEYWORDS):
            continue

        passages.append(f"{title}. {description}")

    if not passages:
        return []

    combined_text = "\n\n".join(passages[:10])

    try:

        raw = extract_events_from_passages(combined_text)

        print("RAW LLM OUTPUT:", raw)

        result = json.loads(raw)

        events = result.get("events", [])

        events = expand_chokepoints(events)

    except Exception as e:

        print("Error:", e)

        events = []
    filtered_events = []

    for event in events:
        countries = [c.lower() for c in event.get("countries", [])]

        if country.lower() in countries:

            sev = event.get("severity", "low").lower()
            event["severity_score"] = severity_map.get(sev, 1)

            filtered_events.append(event)

    # If nothing found
    if not filtered_events:
        return {
            "country": country,
            "risk_level": "LOW",
            "risk_score": 0,
            "event_count": 0,
            "events": []
        }

    # Calculate risk score
    total_severity = sum(e["severity_score"] for e in filtered_events)
    avg_score = total_severity / len(filtered_events)

    # Normalize score to 10
    risk_score = round((avg_score / 3) * 10, 2)
    # Risk level
    if risk_score >= 7:
        risk_level = "HIGH"
    elif risk_score >= 4:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # SAVE EVENTS TO DATABASE
    db = SessionLocal()

    for event in filtered_events:
        record = NewsEvent(
            country=country,
            event=event.get("event"),
            location=event.get("location"),
            severity=event.get("severity"),
            detected_at=datetime.utcnow()
        )

        db.add(record)

    db.commit()
    db.close()

    return {
        "country": country,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "event_count": len(filtered_events),
        "events": filtered_events,
        "last_updated": datetime.utcnow().isoformat()
    }



ISO_TO_COUNTRY = {
    "AE": "United Arab Emirates",
    "AL": "Albania",
    "AR": "Argentina",
    "AU": "Australia",
    "BD": "Bangladesh",
    "BG": "Bulgaria",
    "BH": "Bahrain",
    "BO": "Bolivia",
    "BR": "Brazil",
    "CA": "Canada",
    "CH": "Switzerland",
    "CL": "Chile",
    "CN": "China",
    "CO": "Colombia",
    "CZ": "Czech Republic",
    "EG": "Egypt",
    "ET": "Ethiopia",
    "EU": "European Union",
    "GB": "United Kingdom",
    "HK": "Hong Kong",
    "HU": "Hungary",
    "ID": "Indonesia",
    "IN": "India",
    "IS": "Iceland",
    "JM": "Jamaica",
    "JP": "Japan",
    "KE": "Kenya",
    "KR": "South Korea",
    "KW": "Kuwait",
    "MX": "Mexico",
    "MY": "Malaysia",
    "NG": "Nigeria",
    "NO": "Norway",
    "NZ": "New Zealand",
    "PE": "Peru",
    "PH": "Philippines",
    "PL": "Poland",
    "QA": "Qatar",
    "RO": "Romania",
    "RU": "Russia",
    "SA": "Saudi Arabia",
    "SG": "Singapore",
    "TH": "Thailand",
    "TR": "Turkey",
    "TW": "Taiwan",
    "UA": "Ukraine",
    "UG": "Uganda",
    "VN": "Vietnam",
    "ZA": "South Africa",
}


def normalize_country(country: str) -> str:
    return ISO_TO_COUNTRY.get(country.upper(), country)


def get_events(country: str):
    return run_news_pipeline(country)


def get_risk_country(country: str):

    country = normalize_country(country)

    master = pd.read_csv("country_master_risk.csv")

    row = master[master["country"].str.lower() == country.lower()]

    if row.empty:
        return {"verified": False}

    db = SessionLocal()

    country_events = db.query(NewsEvent).filter(
        NewsEvent.country.ilike(country)
    ).all()

    db.close()

    return {
        "verified": True,
        "country": row.iloc[0]["country"],
        "risk_level": row.iloc[0]["risk_level"],
        "disaster_risk": row.iloc[0]["disaster_risk"],
        "governance_risk": row.iloc[0]["governance_risk"],
        "logistics_risk": row.iloc[0]["logistics_risk"],
        "news_risk": row.iloc[0]["news_risk"],
        "recent_events": len(country_events)
    }


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "country_master_risk.csv"

def get_country_list():
    return {"countries": sorted(df["country"].unique().tolist())}

def get_country_risk_simple(country: str):
    country = normalize_country(country)  
    record = risk_map.get(country.lower())

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Country '{country}' not found in risk dataset"
        )

    return {
        "country": country,
        "risk_score": float(record["final_risk_score"]),
        "risk_level": record["risk_level"]
    }

def load_country_risk_data(path):
    df = pd.read_csv(path)

    df = df[[
        "country",
        "disaster_risk",
        "governance_risk",
        "logistics_risk"
    ]]

    for col in ["disaster_risk", "governance_risk", "logistics_risk"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.fillna(0.5)

    return df

def compute_country_risk(df):

    # Step 1: raw weighted score
    df["raw_risk_score"] = (
        0.3 * df["disaster_risk"] +
        0.4 * df["governance_risk"] +
        0.3 * df["logistics_risk"]
    )

    # Step 2: MIN-MAX NORMALIZATION (THIS IS THE KEY FIX)
    min_val = df["raw_risk_score"].min()
    max_val = df["raw_risk_score"].max()

    range_val = max_val - min_val

    if range_val == 0:
        df["final_risk_score"] = 0.5
    else:
        df["final_risk_score"] = (
            (df["raw_risk_score"] - min_val) / range_val
        )

    return df

def assign_risk_level(df):

    def level(score):
        if score >= 0.66:
            return "HIGH"
        elif score >= 0.33:
            return "MEDIUM"
        else:
            return "LOW"

    df["risk_level"] = df["final_risk_score"].apply(level)

    return df

def build_risk_map(df):
    return df.set_index(df["country"].str.lower()).to_dict("index")

ISO_TO_COUNTRY = {
    "US": "United States of America",  # important fix
    "CN": "China",
    "IN": "India",
    "DE": "Germany",
    "FR": "France",
}

def normalize_country(country):
    return ISO_TO_COUNTRY.get(country.upper(), country)

def build_country_risk_pipeline(path):
    df = load_country_risk_data(path)
    df = compute_country_risk(df)
    df = assign_risk_level(df)

    risk_map = build_risk_map(df)

    return df, risk_map

df, risk_map = build_country_risk_pipeline(DATA_PATH)

def get_country_score(country):
    country = normalize_country(country)

    record = risk_map.get(country.lower())

    if not record:
        return {
            "found": False,
            "message": f"{country} not found"
        }

    return {
        "found": True,
        "country": country,
        "risk_score": float(record["final_risk_score"]),
        "risk_level": record["risk_level"],
        "components": {
            "disaster": float(record["disaster_risk"]),
            "governance": float(record["governance_risk"]),
            "logistics": float(record["logistics_risk"])
        }
    }

def get_all_country_risks(df):
    return df[["country", "final_risk_score"]] \
        .sort_values(by="final_risk_score", ascending=False)
