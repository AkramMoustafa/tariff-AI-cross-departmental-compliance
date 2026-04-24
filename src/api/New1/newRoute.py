# api/routes/hs.py
from fastapi import APIRouter, Query
from src.api.New1.loader import hybrid_search
import src.api.New1.tariffmodel as tariffmodel
from src.api.New1.loader import get_10_digit_children
from src.api.New1.loader import resolve_to_10_digit
from src.api.New1.loader import load_hs_tree
from src.api.New1.loader import improve_description_llm
from pydantic import BaseModel

router = APIRouter(prefix="/hs1", tags=["HS Lookup"])

@router.get("/search1")
def hs_search(q: str = Query(..., min_length=3)):
     
    hs_tree = load_hs_tree()

    print("HS TREE SIZE:", len(hs_tree))

    return hybrid_search(q, hs_tree)
@router.get("/drilldown1")
def drilldown(code: str):
    results = get_10_digit_children(code)
    return {
        "parent": code,
        "results": results
    }

class AutoClassifyRequest(BaseModel):
    description: str

@router.post("/auto-classify1")
def auto_classify(req: AutoClassifyRequest):
    hs_tree = load_hs_tree()

    results = resolve_to_10_digit(req.description, hs_tree)

    if not results:
        return {
            "hs_code": None,
            "confidence": "LOW",
            "suggested": None,
            "alternatives": []
        }
    print(results)
    top_results = results[:5]
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

        "hs_description": best.get("description"),

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

class ImproveDescriptionRequest(BaseModel):
    description: str


@router.post("/improve-description")
def improve_description(req: ImproveDescriptionRequest):

    improved = improve_description_llm(req.description)

    return {
        "description": improved
    }