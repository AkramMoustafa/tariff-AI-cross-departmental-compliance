# api/routes/hs.py
from fastapi import APIRouter, Query
from src.api.New1.loader import hybrid_search
import src.api.New1.tariffmodel as tariffmodel
from src.api.New1.loader import get_10_digit_children
from pydantic import BaseModel

router = APIRouter(prefix="/hs", tags=["HS Lookup"])

@router.get("/search")
def hs_search(q: str = Query(..., min_length=3)):
    hs_tree = tariffmodel.HS_TREE

    print("HS TREE SIZE:", len(hs_tree))

    return hybrid_search(q, hs_tree)
@router.get("/drilldown")
def drilldown(code: str):
    results = get_10_digit_children(code)
    return {
        "parent": code,
        "results": results
    }

class AutoClassifyRequest(BaseModel):
    description: str

@router.post("/auto-classify")
def auto_classify(req: AutoClassifyRequest):
    hs_tree = tariffmodel.HS_TREE

    results = hybrid_search(req.description, hs_tree)

    if not results:
        return {
            "hs_code": None,
            "confidence": "LOW",
            "suggested": None,
            "alternatives": []
        }
    print(results)
    top_results = results["results"][:5]
    best = top_results[0]

    score = best.get("score", 0)

    if score > 0.8:
        confidence = "HIGH"
    elif score > 0.5:
        confidence = "MEDIUM"
    else:
        confidence = "LOW"

    return {
        "hs_code": best.get("hs_code"),
        "description": best.get("description"),
        "confidence": confidence,

        "suggested": {
            "code": best.get("hs_code"),
            "description": best.get("description"),
            "score": best.get("score")
        },

        "alternatives": [
            {
                "code": r.get("hs_code"),
                "description": r.get("description"),
                "score": r.get("score")
            }
            for r in top_results[1:5]
            ]
    }