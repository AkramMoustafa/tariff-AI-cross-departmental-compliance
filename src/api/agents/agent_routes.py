from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.db import get_db
from src.api.models import PurchaseOrder
from src.api.API_USER.client_user_tokens import get_client_user_session
from src.api.agents.graph import po_agent

router = APIRouter()


class AnalyzePORequest(BaseModel):
    po_id: int


@router.post("/agent/analyze-po")
def analyze_po(
    request: AnalyzePORequest,
    db: Session = Depends(get_db),
    session=Depends(get_client_user_session),
):
    if not session:
        raise HTTPException(status_code=401, detail="User not authenticated")

    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == request.po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")

    initial_state = {
        "po": {"po_id": request.po_id},
        "sanctions_risk": {},
        "geo_risk": 0.0,
        "weather_risk": 0.0,
        "macro_risk": 0.0,
        "prediction": {},
        "actions": [],
        "decision": {},
    }

    result = po_agent.invoke(initial_state)

    return {
        "po": result["po"],
        "risks": {
            "sanctions": result["sanctions_risk"],
            "geo_risk": result["geo_risk"],
            "weather_risk": result["weather_risk"],
            "macro_risk": result["macro_risk"],
        },
        "prediction": result["prediction"],
        "actions": result["actions"],
        "decision": result["decision"],
    }
