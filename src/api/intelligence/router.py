from src.api.db import SessionLocal
from src.api.models import SupplierPortSignal, Supplier
from src.api.intelligence.service import get_supplier_profile_summary, build_risk_driver_mix
from src.api.country_risk.services import (
    get_news_risk_from_db,
    get_risk_country,
    get_country_risk_simple
)
from src.api.intelligence.service import get_supplier_risk_from_db
from src.api.Commodities.metal_price_services import (
    get_metal_prices_from_db,
    get_forex_rates_from_db,
    get_energy_prices_from_db
)
from src.api.supplier_intelligence.linkedin import get_hiring_insight
from src.api.Registry.registry import get_registry_insight_from_db
from src.api.Commodities.market_pressure import compute_market_pressure, SUPPLIER_EXPOSURES
from src.api.API_USER.client_users import get_client_user_session   
def get_all_intelligence(supplier_id: int):

    db = SessionLocal()

    supplier = db.query(Supplier).filter_by(id=supplier_id).first()

    if not supplier:
        db.close()
        return {"error": "supplier not found"}

    port_signal = (
        db.query(SupplierPortSignal)
        .filter_by(supplier_id=supplier_id)
        .order_by(SupplierPortSignal.id.desc())
        .first()
    )


    # ADD THIS LINE
    registry = get_registry_insight_from_db(supplier_id, db)
    
    metals = get_metal_prices_from_db(supplier_id, db)
    forex = get_forex_rates_from_db(supplier_id, db)
    energy = get_energy_prices_from_db(db)
    hiring = get_hiring_insight(
    supplier_id,
    db,
    supplier.client_user_id
)
    extra_supplier_insights = get_supplier_profile_summary(db, supplier_id)

    country = supplier.country
    exposures = SUPPLIER_EXPOSURES.get(
        supplier_id,
        {
            "metal": 0.30,
            "energy": 0.25,
            "forex": 0.25,
            "transport": 0.20
        }
    )

    market_pressure = compute_market_pressure(
        metals,
        forex,
        energy,
        exposures
    )
    news_risk = get_news_risk_from_db(country, db)

    country_risk = get_risk_country(country)
    baseline_risk = get_country_risk_simple(country)
    risk_driver_mix = build_risk_driver_mix(
        port_signal,
        news_risk,
        market_pressure,
        registry,
        hiring,
        forex
    )
    result = {
            "supplier": supplier.name,
            "country": country,

            "market_pressure": market_pressure,

            "port": {
                "name": port_signal.port_name if port_signal else None,
                "status": port_signal.status if port_signal else None,
                "score": port_signal.health_score if port_signal else None,
                "wait_hours": port_signal.estimated_wait_hours if port_signal else None
            },
            "risk_driver_mix": risk_driver_mix,

            "registry": registry,

            "hiring": hiring,
            "supplier_insights": extra_supplier_insights,

            "commodities": {
                "metals": metals,
                "forex": forex,
                "energy": energy
            },

            "country_risk": country_risk,
            "baseline_risk": baseline_risk,
            "news_risk": news_risk
        }
    db.close()
    return result
from fastapi import APIRouter

router = APIRouter(
    prefix="/suppliers",
    tags=["Supplier Intelligence"]
)
# from fastapi import Depends
# from src.api.db import get_db
# from sqlalchemy.orm import Session
# @router.get("/risk-drivers")
# def get_risk_drivers(
#     db: Session = Depends(get_db),
#     session = Depends(get_client_user_session)
# ):
#     suppliers = (
#         db.query(Supplier)
#         .filter(Supplier.client_user_id == session["client_user_id"])
#         .all()
#     )

#     driver_totals = {}

#     for s in suppliers:
#         # ✅ pass db, DO NOT open new sessions inside
#         intelligence = get_all_intelligence(s.id, db)

#         # safety check
#         if not intelligence or "error" in intelligence:
#             continue

#         drivers = intelligence.get("risk_driver_mix", [])

#         # optional: weight by supplier risk (recommended)
#         risk_score = (
#             intelligence.get("supplier_insights", {})
#             .get("overall_supplier_risk", {})
#             .get("score", 1)
#         )

#         for d in drivers:
#             label = d.get("label")
#             value = d.get("value", 0)

#             if not label:
#                 continue

#             # weighted aggregation
#             driver_totals[label] = driver_totals.get(label, 0) + (value * risk_score)

#     total = sum(driver_totals.values())

#     if total == 0:
#         return []

#     result = [
#         {
#             "label": label,
#             "value": round((value / total) * 100)
#         }
#         for label, value in driver_totals.items()
#     ]

#     result.sort(key=lambda x: x["value"], reverse=True)

#     return result
@router.get("/{supplier_id}/intelligence")
def supplier_intelligence(supplier_id: int):

    result = get_all_intelligence(supplier_id)

    return result


@router.get("/{supplier_id}/risk")
def supplier_risk(supplier_id: int):

    db = SessionLocal()

    try:
        result = get_supplier_risk_from_db(db, supplier_id)
        return result
    finally:
        db.close()