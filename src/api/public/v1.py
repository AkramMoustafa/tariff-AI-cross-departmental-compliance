from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime

# Authentication & DB
from src.api.db import get_db
from src.api.API_CLIENT.client_api_tokens import get_api_client_session

# Core Business Logic
from src.api.sanctions import search_sanctions
from src.core.tariff.engine import calculate_tariff

# Models
from src.api.models_tariff import (
    HSCode, TariffSchedule, TariffLine, TariffCalculationLog
)

# --- CONFIGURATION (Dynamic Defaults) ---
# In a real dynamic system, these could also be loaded from a DB table "api_pricing"
PRICING_TABLE = {
    "sanctions_screen": 1,
    "tariff_calculate": 5
}

router = APIRouter(
    prefix="/v1",
    tags=["Public API Product"],
    responses={
        429: {"description": "Quota Exceeded"},
        401: {"description": "Unauthorized"},
    }
)

# --- HELPER: Dynamic Billing ---
def bill_request(db: Session, client_id: str, endpoint_key: str):
    """
    Dynamically charges the client based on the endpoint's configured cost.
    """
    cost = PRICING_TABLE.get(endpoint_key, 1)  # Default to 1 if not found
    
    # Atomic DB Update
    db.execute(
        text("""
            UPDATE api_clients 
            SET current_period_usage = current_period_usage + :cost, 
                last_used_at = NOW() 
            WHERE id = :id
        """),
        {"cost": cost, "id": client_id}
    )
    db.commit()

# --- DATA MODELS ---

class SanctionsScreeningRequest(BaseModel):
    name: str = Field(..., description="Entity name to screen")
    country: Optional[str] = Field(None, description="ISO 2-letter country code")

class TariffCalculatorRequest(BaseModel):
    hs_code: str = Field(..., min_length=2, max_length=12, description="Harmonized System Code")
    origin_country: str = Field(..., min_length=2, max_length=2, description="Origin Country (ISO 2)")
    destination_country: str = Field(..., min_length=2, max_length=2, description="Destination Country (ISO 2)")
    customs_value: Decimal = Field(..., gt=0, description="Declared Value")
    freight: Decimal = Field(Decimal("0.0"), ge=0, description="Freight Cost")
    insurance: Decimal = Field(Decimal("0.0"), ge=0, description="Insurance Cost")
    quantity: Decimal = Field(Decimal("1.0"), ge=0, description="Item Quantity")
    currency: str = Field("USD", min_length=3, max_length=3, description="Currency ISO Code")

# --- ENDPOINTS ---

@router.post("/sanctions/screen")
def screen_entity(
    payload: SanctionsScreeningRequest,
    db: Session = Depends(get_db),
    client: Dict[str, Any] = Depends(get_api_client_session)
):
    """
    Real-time Sanctions Screening.
    """
    # 1. Dynamic Billing
    bill_request(db, client["api_client_id"], "sanctions_screen")

    # 2. Dynamic Search
    results = search_sanctions(q=payload.name, country=payload.country)
    
    return {
        "meta": {
            "query": payload.dict(exclude_none=True),
            "timestamp": datetime.utcnow()
        },
        "match_found": len(results) > 0,
        "matches": results
    }


@router.post("/tariff/calculate")
def calculate_landed_cost(
    payload: TariffCalculatorRequest,
    db: Session = Depends(get_db),
    client: Dict[str, Any] = Depends(get_api_client_session)
):
    """
    Total Landed Cost Calculator (Dynamic Schedule Resolution).
    """
    # 1. Dynamic Billing
    bill_request(db, client["api_client_id"], "tariff_calculate")

    # 2. Input Normalization
    hs_code_str = payload.hs_code.replace(".", "").strip()
    origin = payload.origin_country.upper()
    dest = payload.destination_country.upper()

    # 3. DYNAMIC SCHEDULE RESOLUTION
    # Instead of hardcoding "US" -> "HTSUS", we query the latest active schedule for the destination
    schedule = (
        db.query(TariffSchedule)
        .filter(TariffSchedule.country == dest)
        .order_by(TariffSchedule.effective_from.desc())  # Get the most recent one
        .first()
    )
    
    if not schedule:
        raise HTTPException(
            status_code=404, 
            detail=f"No active tariff schedule found for destination: {dest}"
        )

    # 4. Dynamic HS Code Lookup
    hs = db.query(HSCode).filter(HSCode.code == hs_code_str).first()
    if not hs:
        raise HTTPException(status_code=404, detail=f"HS Code {hs_code_str} not found in schedule")

    # 5. Fetch Rates
    lines = db.query(TariffLine).filter(
        TariffLine.tariff_schedule_id == schedule.id,
        TariffLine.hs_code_id == hs.id,
    ).all()
    
    if not lines:
        raise HTTPException(status_code=404, detail="HS Code found but no active duty rates available")

    # 6. Prepare Engine Input
    engine_input = [
        {
            "duty_type": line.duty_type,
            "rate_type": line.rate_type,
            "rate_value": line.rate_value,
            "priority": line.priority or 100, # Fallback only if NULL in DB
        }
        for line in lines
    ]

    # 7. Execute Calculation
    result = calculate_tariff(
        tariff_lines=engine_input,
        customs_value=float(payload.customs_value),
        freight=float(payload.freight),
        insurance=float(payload.insurance),
        quantity=float(payload.quantity),
    )

    # 8. Log the Transaction (Machine User)
    try:
        log = TariffCalculationLog(
            user_uid=None, 
            hs_code=hs_code_str,
            origin_country=origin,
            destination_country=dest,
            customs_value=float(payload.customs_value),
            freight=float(payload.freight),
            insurance=float(payload.insurance),
            quantity=float(payload.quantity),
            currency=payload.currency,
            result_json=result,
            total_duty=result["total_duty"],
            effective_rate=result["effective_rate"],
            tariff_schedule_id=schedule.id,
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Logging warning: {e}")

    return result