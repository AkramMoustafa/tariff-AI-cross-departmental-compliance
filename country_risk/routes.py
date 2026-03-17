from fastapi import APIRouter
from src.api.country_risk.services import (
    get_events,
    get_risk_country,
    get_country_list,
    get_country_risk_simple
)

router = APIRouter()

@router.get("/news/events/{country}")
def get_events_route(country: str):
    return get_events(country)


@router.get("/risk/country/{country}")
def get_country_risk_route(country: str):
    return get_risk_country(country)


@router.get("/country-risk/list")
def get_country_list_route():
    return get_country_list()


@router.get("/country-risk/{country}")
def get_country_risk_simple_route(country: str):
    return get_country_risk_simple(country)