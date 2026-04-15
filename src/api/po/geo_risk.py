from src.api.sanctions import get_country_sanctions_risk, build_country_sanction_scores

ISO_TO_COUNTRY = {
    "US": "United States of America",  # important fix
    "CN": "China",
    "IN": "India",
    "DE": "Germany",
    "FR": "France",
}

def normalize_country(country):
    return ISO_TO_COUNTRY.get(country.upper(), country)

def compute_geopolitical_risk(country, country_risks, risk_map ):
    country_key = normalize_country(country)
    news = max(country_risks.get(country_key, 0.0),0.25)
    sanctions_scores = build_country_sanction_scores()
    sanctions_data = get_country_sanctions_risk(sanctions_scores, country)
    sanctions = sanctions_data["sanctions_risk"]
    static_record = risk_map.get(country_key)

    if static_record:
        static = float(static_record.get("final_risk_score", 0.5))
    else:
        static = 0.5

    geo_risk = (
        0.35 * news +
        0.45 * sanctions +
        0.2 * static
    )
    return {
        "country": country_key,
        "news_risk": round(news, 3),
        "sanctions_risk": round(sanctions, 3),
        "static_risk": round(static, 3),
        "geopolitical_risk": round(min(geo_risk, 1.0), 3)
    }



