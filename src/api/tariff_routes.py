from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from src.api.db import get_db
from src.api.models_tariff import HSCode, TariffSchedule, TariffLine, TariffCalculationLog
from src.core.tariff.engine import calculate_tariff

router = APIRouter()

class TariffRequest(BaseModel):
    hs_code: str = Field(..., min_length=2, max_length=12)
    origin_country: str = Field(..., min_length=2, max_length=2)
    destination_country: str = Field(..., min_length=2, max_length=2)
    customs_value: Decimal = Field(..., gt=0, max_digits=18, decimal_places=4)
    freight: Decimal = Field(Decimal("0.0"), ge=0, max_digits=18, decimal_places=4)
    insurance: Decimal = Field(Decimal("0.0"), ge=0, max_digits=18, decimal_places=4)
    quantity: Decimal = Field(Decimal("1.0"), ge=0, max_digits=18, decimal_places=4)
    currency: str = Field("USD", min_length=3, max_length=3)
    user_uid: Optional[str] = None

# ? SIMPLIFIED: Just "/calculate". The prefix comes from main_api.py
@router.post("/calculate")
def calculate_tariff_api(payload: TariffRequest, db: Session = Depends(get_db)):
    hs_code_str = payload.hs_code.replace(".", "").strip()
    origin = payload.origin_country.upper()
    dest = payload.destination_country.upper()

    schedule = db.query(TariffSchedule).filter(TariffSchedule.country == dest).order_by(TariffSchedule.effective_from.desc()).first()
    if not schedule: raise HTTPException(404, "Schedule not found")

    hs = db.query(HSCode).filter(HSCode.code == hs_code_str).first()
    if not hs: raise HTTPException(404, "HS Code not found")

    lines = db.query(TariffLine).filter(TariffLine.tariff_schedule_id == schedule.id, TariffLine.hs_code_id == hs.id).all()
    if not lines: raise HTTPException(404, "No tariff lines")

    # ? FILTER LOGIC: Verify Origin to prevent accidental Trade War taxes
    engine_input = []
    for line in lines:
        if line.origin_country and line.origin_country != origin:
            continue
        engine_input.append({"duty_type": line.duty_type, "rate_type": line.rate_type, "rate_value": line.rate_value, "priority": line.priority or 100})

    result = calculate_tariff(engine_input, float(payload.customs_value), float(payload.freight), float(payload.insurance), float(payload.quantity))

    # Log it
    log = TariffCalculationLog(
        user_uid=payload.user_uid, hs_code=hs_code_str, origin_country=origin, destination_country=dest,
        customs_value=float(payload.customs_value), freight=float(payload.freight), insurance=float(payload.insurance),
        quantity=float(payload.quantity), currency=payload.currency, result_json=result,
        total_duty=result["total_duty"], effective_rate=result["effective_rate"], tariff_schedule_id=schedule.id
    )
    db.add(log); db.commit()
    return result
