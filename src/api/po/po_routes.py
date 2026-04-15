from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
from src.api.po.po_extractor import process_po
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.api.db import get_db
from src.api.models import PurchaseOrder
from src.api.API_USER.client_user_tokens import get_client_user_session
from src.api.sanctions import get_sanctions_risk_for_country
from src.api.po.news_risk import get_country_risks, get_news_risk
from src.api.po.weather_risk import compute_weather_from_shipment
from src.api.country_risk.services import get_country_score
from src.api.Commodities.ai import get_country_risk_score, currency_to_country, path
from src.api.po.country_risk import get_combined_country_risk
from src.api.po.geo_risk import compute_geopolitical_risk
from src.api.po.predictions import run_prediction

from src.api.country_risk.services import risk_map
router = APIRouter()
COUNTRY_TO_ISO = {
    "china": "CN",
    "united states": "US",
    "usa": "US",
    "netherlands": "NL",
    "japan": "JP",
    "germany": "DE",
    "mexico": "MX"
}

@router.post("/extract-po")
async def extract_po(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF supported")

    # save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        result = process_po(tmp_path)

        return {
            "status": "success",
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-po")
def save_po(
    payload: dict,
    db: Session = Depends(get_db),
    session = Depends(get_client_user_session),
):
    if not session:
            raise HTTPException(status_code=401, detail="User not authenticated")
    origin_country = payload.get("origin_country")
    sanctions_result = get_sanctions_risk_for_country(origin_country)

    country_risks = get_country_risks()
    geo_result = compute_geopolitical_risk(
        origin_country,
        country_risks,
        risk_map
    )

    print("🌍 GEO RISK:", geo_result)
    news_result = get_news_risk(origin_country, country_risks)

    print("NEWS RESULT:", news_result)
    print("SANCTIONS RESULT:", sanctions_result)

    origin_city = payload.get("origin_city")
    origin_country = payload.get("origin_country")

    destination_city = payload.get("destination_city")
    destination_country = payload.get("destination_country")

    origin_code = COUNTRY_TO_ISO.get(origin_country.lower(), "US")
    dest_code = COUNTRY_TO_ISO.get(destination_country.lower(), "US")

    weather_input = {
        "Origin_City": f"{origin_city}, {origin_code}",
        "Destination_City": f"{destination_city}, {dest_code}"
    }

    weather_risk, route_used = compute_weather_from_shipment(weather_input)

    print("🌦️ WEATHER INPUT:", weather_input)
    print("🌦️ WEATHER ROUTE:", route_used)
    print("🌦️ WEATHER RISK:", weather_risk)
    origin_structural = get_country_score(origin_country)
    origin_macro = get_combined_country_risk(origin_country)
    print("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG")
    print(origin_macro)
    # print(origin_structural)
    try:
        forex_result = get_country_risk_score(
            origin_country,
            path,
            currency_to_country
        )

        # print("💱 FOREX RISK RESULT:", forex_result)
        geo_val = geo_result.get("geopolitical_risk", 0)


        macro_val = origin_macro.get("combined_risk_score", 0)
        print(geo_val, weather_risk, macro_val )
    except Exception as e:
        print("❌ FOREX ERROR:", str(e))
    po = PurchaseOrder(
        client_user_id=session["client_user_id"],

        supplier=payload.get("supplier"),

        origin_city=payload.get("origin_city"),
        origin_country=payload.get("origin_country"),

        destination_city=payload.get("destination_city"),
        destination_country=payload.get("destination_country"),

        shipping_method=payload.get("shipping_method"),

        items=payload.get("items"),

        subtotal=payload.get("subtotal"),
        tax=payload.get("tax"),
        shipping=payload.get("shipping"),
        total=payload.get("total"),

        weight=payload.get("weight"),
        route_type=payload.get("route_type"),
        product_category=payload.get("product_category"),

        # 🔥 ADD THESE (even if temporary)
        delay_days=0,
        recommended_action="pending",
        
        geo_risk=geo_val,
        weather_risk=weather_risk,
        macro_risk=macro_val,
    )

    db.add(po)
    db.commit()
    db.refresh(po)

    return {
        "status": "saved",
        "po_id": po.id
    }

from pydantic import BaseModel

class PredictPORequest(BaseModel):
    po_id: int

@router.post("/predict-po")
def predict_po(
    request: PredictPORequest,
    db: Session = Depends(get_db),
    session = Depends(get_client_user_session),
):
    
    if not session:
        raise HTTPException(status_code=401, detail="User not authenticated")
    po_id = request.po_id
    # 1. Fetch PO
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()

    if not po:
        raise HTTPException(status_code=404, detail="PO not found")

    # 2. Build payload
    payload = {
        "origin_city": po.origin_city,
        "origin_country": po.origin_country,
        "destination_city": po.destination_city,
        "destination_country": po.destination_country,
        "shipping_method": po.shipping_method,
        "product_category": po.product_category,
        "route_type": po.route_type,
        "shipping": po.shipping,
        "weight": po.weight
    }

    # 3. Reuse stored risks
    geo_result = {"geopolitical_risk": po.geo_risk}
    weather_risk = po.weather_risk
    origin_macro = {"combined_risk_score": po.macro_risk}

    # 4. Run prediction
    prediction = run_prediction(po)

    # 5. Save results
    po.delay_days = prediction["delay"]
    po.recommended_action = prediction["action"]

    db.commit()
    db.refresh(po)

    return {
        "po_id": po.id,
        "prediction": prediction
    }