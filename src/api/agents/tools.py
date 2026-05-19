"""
Thin wrappers around existing service functions.
All business logic stays in the original modules — no duplication here.
"""
from src.api.po.po_extractor import process_po
from src.api.sanctions import get_sanctions_risk_for_country
from src.api.po.geo_risk import compute_geopolitical_risk
from src.api.po.news_risk import get_country_risks, get_news_risk
from src.api.po.weather_risk import compute_weather_from_shipment
from src.api.po.country_risk import get_combined_country_risk
from src.api.po.predictions import run_prediction
from src.api.country_risk.services import risk_map


def tool_process_po(file_path: str) -> dict:
    return process_po(file_path)


def tool_get_sanctions_risk(country: str) -> dict:
    return get_sanctions_risk_for_country(country)


def tool_compute_geo_risk(country: str) -> dict:
    country_risks = get_country_risks()
    return compute_geopolitical_risk(country, country_risks, risk_map)


def tool_get_news_risk(country: str) -> dict:
    country_risks = get_country_risks()
    return get_news_risk(country, country_risks)


def tool_compute_weather_risk(
    origin_city: str,
    origin_iso: str,
    dest_city: str,
    dest_iso: str,
) -> float:
    user_input = {
        "Origin_City": f"{origin_city}, {origin_iso}",
        "Destination_City": f"{dest_city}, {dest_iso}",
    }
    risk, _ = compute_weather_from_shipment(user_input)
    return risk


def tool_get_macro_risk(country: str) -> dict:
    return get_combined_country_risk(country)


def tool_run_prediction(po_obj) -> dict:
    return run_prediction(po_obj)
