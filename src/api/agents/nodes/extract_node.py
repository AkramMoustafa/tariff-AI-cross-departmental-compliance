from src.api.agents.state import POState
from src.api.db import SessionLocal
from src.api.models import PurchaseOrder


def extract_node(state: POState) -> dict:
    po_id = state["po"].get("po_id")

    db = SessionLocal()
    try:
        record = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
        if not record:
            raise ValueError(f"PO {po_id} not found")

        po_dict = {
            "po_id": record.id,
            "origin_city": record.origin_city,
            "origin_country": record.origin_country,
            "destination_city": record.destination_city,
            "destination_country": record.destination_country,
            "shipping_method": record.shipping_method,
            "items": record.items or [],
            "subtotal": record.subtotal or 0.0,
            "tax": record.tax or 0.0,
            "shipping": record.shipping or 0.0,
            "total": record.total or 0.0,
            "weight": record.weight or 0.0,
            "route_type": record.route_type,
            "product_category": record.product_category,
            # Stored risks (may be overwritten by risk_node)
            "stored_geo_risk": record.geo_risk or 0.0,
            "stored_weather_risk": record.weather_risk or 0.0,
            "stored_macro_risk": record.macro_risk or 0.0,
        }
    finally:
        db.close()

    return {"po": po_dict}
