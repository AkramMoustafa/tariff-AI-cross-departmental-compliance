# api/routes/hs.py
from fastapi import APIRouter, Query
from src.api.New.loader import hybrid_search
import src.api.New.tariffmodel as tariffmodel
from src.api.New.loader import get_10_digit_children
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