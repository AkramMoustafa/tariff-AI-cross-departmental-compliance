from src.api.country_risk.services import get_country_score, risk_map
from src.api.Commodities.ai import get_country_risk_score, currency_to_country, path

def get_combined_country_risk(country):

    # FX risk (from your forex model)
    fx = get_country_risk_score(country, path, currency_to_country)

    # Structural country risk
    structural = get_country_score(country)

    if not fx["found"] or not structural["found"]:
        return {
            "found": False,
            "country": country,
            "message": "Missing data"
        }

    # 🔥 Combine (you can tune weights later)
    combined_score = (
        0.6 * fx["risk_score"] +
        0.4 * structural["risk_score"]
    )

    return {
        "found": True,
        "country": country,
        "currency": fx["currency"],
        "fx_risk": fx["risk_score"],
        "structural_risk": structural["risk_score"],
        "combined_risk_score": round(combined_score, 3),
        "risk_level": structural["risk_level"]  # optional reuse
    }
