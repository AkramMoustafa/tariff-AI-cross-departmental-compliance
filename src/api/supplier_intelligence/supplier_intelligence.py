from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from src.api.db import get_db
from src.api.API_USER.client_user_tokens import get_client_user_session
from src.api.models import Supplier

router = APIRouter()

class SupplierCreate(BaseModel):
    legalName: str
    countryIncorporation: str
    manufacturingCountry: str
    invoicingCurrency: str
    materialCategory: str
    products: list[str]  # 🔥 CRITICAL

@router.post("/suppliers")
def create_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    session = Depends(get_client_user_session)
):

    supplier = Supplier(
        client_user_id=session["client_user_id"],
        name=data.legalName,
        country=data.manufacturingCountry,
        products=data.products   # 🔥 THIS IS THE FIX
    )

    db.add(supplier)
    

    db.commit()

    return {"supplier_id": supplier.id}

@router.get("/suppliers/{supplier_id}")
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    session = Depends(get_client_user_session)
):

    supplier = (
    db.query(Supplier)
    .filter(
        Supplier.id == supplier_id,
        Supplier.client_user_id == session["client_user_id"]
    )
    .first()
)

    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    return {
        "id": supplier.id,
        "name": supplier.name,
        "country": supplier.country,

    }

@router.get("/suppliers")
def get_suppliers(
    db: Session = Depends(get_db),
    session = Depends(get_client_user_session)
):

    suppliers = (
        db.query(Supplier)
        .filter(Supplier.client_user_id == session["client_user_id"])
        .all()
    )
    result = []

    for s in suppliers:

        result.append({
            "id": s.id,
            "name": s.name,
            "country": s.country
        })

    return result
