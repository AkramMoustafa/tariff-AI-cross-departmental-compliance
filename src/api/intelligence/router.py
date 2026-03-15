from src.api.db import SessionLocal
from src.api.models import SupplierPortSignal, Supplier

from src.api.country_risk.services import (
    run_news_pipeline,
    get_risk_country,
    get_country_risk_simple
)
from src.api.Commodities.metal_price_services import (
    get_metal_prices_from_db,
    get_forex_rates_from_db,
    get_energy_prices_from_db
)

from src.api.supplier_intelligence.supplier_intelligence import get_supplier_intelligence
from src.api.Registry.registry import get_registry_insight_from_db


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

    db.close()

    country = supplier.country

    news_risk = run_news_pipeline(country)
    country_risk = get_risk_country(country)
    baseline_risk = get_country_risk_simple(country)

    return {
        "supplier": supplier.company_name,
        "country": country,

        "port": {
            "status": port_signal.status if port_signal else None,
            "score": port_signal.health_score if port_signal else None,
            "wait_hours": port_signal.estimated_wait_hours if port_signal else None
        },

        "registry": registry,

        "commodities": {
            "metals": metals,
            "forex": forex,
            "energy": energy
        },

        "country_risk": country_risk,
        "baseline_risk": baseline_risk,
        "news_risk": news_risk
    }


from fastapi import APIRouter

router = APIRouter(
    prefix="/suppliers",
    tags=["Supplier Intelligence"]
)


@router.get("/{supplier_id}/intelligence")
def supplier_intelligence(supplier_id: int):

    result = get_all_intelligence(supplier_id)

    return result