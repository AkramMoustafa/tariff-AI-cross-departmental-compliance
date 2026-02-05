from fastapi import APIRouter, HTTPException, Query
from src.api.NewTariffEngine.tariff_service import get_tariff_api
from src.api.NewTariffEngine.engine import get_section301_duty, calculate_total_ad_valorem, get_tariff_with_duty_payable
from pydantic import BaseModel, Field
from decimal import Decimal
import logging

logger = logging.getLogger("nomi_api.tariffs")

router = APIRouter(prefix="/tariffs", tags=["Tariffs"])

@router.get("/new_engine/calculate")
def calculate_tariff(
    hs_code: str = Query(..., min_length=2, description="HTS code"),
    origin_country: str = Query(..., min_length=2, max_length=2, description="ISO-2 country code"),
):
    try:
        return get_tariff_api(
            hs_code=hs_code,
            origin_country=origin_country
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal tariff calculation error")

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

class DutyCalculationRequest(BaseModel):
    hs_code: str = Field(..., min_length=2, max_length=14)
    origin_country: str = Field(..., min_length=2, max_length=2)
    customs_value: Decimal = Field(..., gt=0)
    freight: Decimal = Field(0, ge=0)
    insurance: Decimal = Field(0, ge=0)

class TariffRequest(BaseModel):
    hs_code: str
    origin_country: str

from uuid import uuid4

@router.post("/calculate_duty")
def calculate_duty(req: DutyCalculationRequest):
    print("\n================= calculate_duty CALLED =================")
    
    try:
        print("RAW REQUEST OBJECT:", req)
        print("REQUEST DICT:", req.model_dump())

        print("HS CODE:", req.hs_code)
        print("ORIGIN:", req.origin_country)
        print("CUSTOMS VALUE:", req.customs_value)
        print("FREIGHT:", req.freight)
        print("INSURANCE:", req.insurance)

        hs_normalized = req.hs_code.replace(".", "").strip()
        print("HS NORMALIZED:", hs_normalized, "LEN:", len(hs_normalized))

        print("CALLING get_tariff_with_duty_payable()...")

        result = get_tariff_with_duty_payable(
            hs_code=hs_normalized,
            origin_country=req.origin_country,
            customs_value=float(req.customs_value),
            freight=float(req.freight),
            insurance=float(req.insurance),
        )

        print("FUNCTION RETURNED SUCCESSFULLY")
        print("RESULT TYPE:", type(result))
        print("RESULT VALUE:")
        print(result)

        print("================= END calculate_duty =================\n")
        return result

    except Exception as e:
        print("!!!!!!!!!!!!!! ERROR IN calculate_duty !!!!!!!!!!!!!!")
        print("ERROR TYPE:", type(e))
        print("ERROR VALUE:", e)
        raise
@router.post("/calculate")
def calculate_tariff(req: TariffRequest):
    hs_code = req.hs_code
    origin = req.origin_country.upper()

  
    base_tariff = get_tariff_api(hs_code, origin)

    base_rate = base_tariff["final_tariff"]["rate"]
    section301 = get_section301_duty(hs_code, origin)
    total = calculate_total_ad_valorem(
        base_tariff_rate=base_rate,
        section301=section301
    )

    return {
        "hs_code": hs_code,
        "origin_country": origin,

        "base_tariff": {
            "rate_text": base_rate,
            "details": base_tariff
        },

        "section_301": section301 or {
            "applies": False
        },

        "calculated_duties": total
    }
