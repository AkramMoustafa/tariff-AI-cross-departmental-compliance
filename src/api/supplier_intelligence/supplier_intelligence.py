from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from src.api.db import get_db
from src.api.API_USER.client_user_tokens import get_client_user_session
from src.api.models import Supplier, SupplierProfile, SupplierHiringInsight

router = APIRouter()

class SupplierCreate(BaseModel):

    legalName: str
    linkedinCompanyName: str | None = None
    countryIncorporation: str

    manufacturingCountry: str | None = None
    exportPort: str | None = None
    invoicingCurrency: str | None = None

    materialCategory: str | None = None
    supplierTier: str | None = None
    
    incoterm: str | None = None
    paymentTermsDays: int | None = None

    yearsInOperation: int | None = None
    revenueBand: str | None = None

    hasTradeComplianceCerts: bool | None = None
    hasInsurance: bool | None = None

    singleSite: bool | None = None
    backupFacility: bool | None = None

    avgLeadTimeDays: int | None = None
    onTimeDeliveryPct: float | None = None
    qualityIssuesPct: float | None = None

    categoryVolumeSharePct: float | None = None
    commodityLinkedPricing: bool | None = None

@router.post("/suppliers")
def create_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    session = Depends(get_client_user_session)
):

    supplier = Supplier(
        client_user_id=session["client_user_id"],
        name=data.legalName,
        country=data.countryIncorporation,
        linkedin_company_name=data.linkedinCompanyName
    )


    db.add(supplier)
    db.flush()  # gives supplier.id without committing

    profile = SupplierProfile(
        supplier_id=supplier.id,

        country_incorporation=data.countryIncorporation,
        manufacturing_country=data.manufacturingCountry,
        export_port=data.exportPort,
        invoicing_currency=data.invoicingCurrency,

        material_category=data.materialCategory,
        supplier_tier=data.supplierTier,

        incoterm=data.incoterm,
        payment_terms_days=data.paymentTermsDays,
        years_in_operation=data.yearsInOperation,
        revenue_band=data.revenueBand,

        has_trade_compliance_certs=data.hasTradeComplianceCerts,
        has_insurance=data.hasInsurance,

        single_site=data.singleSite,
        backup_facility=data.backupFacility,

        avg_lead_time_days=data.avgLeadTimeDays,
        on_time_delivery_pct=data.onTimeDeliveryPct,
        quality_issues_pct=data.qualityIssuesPct,

        category_volume_share_pct=data.categoryVolumeSharePct,
        commodity_linked_pricing=data.commodityLinkedPricing
    )

    db.add(profile)

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
        
        "profile": {
            "material_category": supplier.profile.material_category if supplier.profile else None,
            "supplier_tier": supplier.profile.supplier_tier if supplier.profile else None,
            "country_incorporation": supplier.profile.country_incorporation if supplier.profile else None,
            "manufacturing_country": supplier.profile.manufacturing_country if supplier.profile else None,
            "export_port": supplier.profile.export_port if supplier.profile else None,
            "invoicing_currency": supplier.profile.invoicing_currency if supplier.profile else None,
            "incoterm": supplier.profile.incoterm if supplier.profile else None,
            "payment_terms_days": supplier.profile.payment_terms_days if supplier.profile else None,
            "years_in_operation": supplier.profile.years_in_operation if supplier.profile else None,
            "revenue_band": supplier.profile.revenue_band if supplier.profile else None,
        }
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
    return [
        {
            "id": s.id,
            "name": s.name,
            "country": s.country
        }
        for s in suppliers
    ]

@router.get("/suppliers/{supplier_id}/dashboard")
def get_supplier_dashboard(
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
        "profile": {
            "country_incorporation": supplier.profile.country_incorporation,
            "manufacturing_country": supplier.profile.manufacturing_country,
            "export_port": supplier.profile.export_port,
            "invoicing_currency": supplier.profile.invoicing_currency,
            "incoterm": supplier.profile.incoterm,
            "payment_terms_days": supplier.profile.payment_terms_days,
            "years_in_operation": supplier.profile.years_in_operation,
            "revenue_band": supplier.profile.revenue_band,

            "has_trade_compliance_certs": supplier.profile.has_trade_compliance_certs,
            "has_insurance": supplier.profile.has_insurance,
            "single_site": supplier.profile.single_site,
            "backup_facility": supplier.profile.backup_facility,
            "avg_lead_time_days": supplier.profile.avg_lead_time_days,
            "on_time_delivery_pct": supplier.profile.on_time_delivery_pct,
            "quality_issues_pct": supplier.profile.quality_issues_pct,
            "category_volume_share_pct": supplier.profile.category_volume_share_pct,
            "commodity_linked_pricing": supplier.profile.commodity_linked_pricing
        }
    }

@router.get("/suppliers/{supplier_id}/hiring-insights/history")
def get_hiring_insight_history(
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

    insights = (
        db.query(SupplierHiringInsight)
        .filter(SupplierHiringInsight.supplier_id == supplier_id)
        .order_by(SupplierHiringInsight.snapshot_date.desc())
        .limit(12)
        .all()
    )

    return [
    {
        "snapshot_date": i.snapshot_date,
        "current_jobs": i.current_jobs,
        "previous_jobs": i.previous_jobs,
        "trend": i.trend,
        "risk_level": i.risk_level,
        "insight": i.insight
    }
    for i in insights
]

@router.get("/suppliers/{supplier_id}/hiring-insight")
def get_latest_hiring_insight(
    supplier_id: int,
    db: Session = Depends(get_db),
    session = Depends(get_client_user_session)
):

    insight = (
        db.query(SupplierHiringInsight)
        .filter(SupplierHiringInsight.supplier_id == supplier_id)
        .order_by(SupplierHiringInsight.snapshot_date.desc())
        .first()
    )

    supplier = (
    db.query(Supplier)
    .filter(
        Supplier.id == supplier_id,
        Supplier.client_user_id == session["client_user_id"]
    )
    .first()
)

    if not insight:
        return {"message": "No hiring insights available"}

    return {
        "supplier_id": supplier.id,
        "linkedin_company_name": supplier.linkedin_company_name,
        "snapshot_date": insight.snapshot_date,
        "current_jobs": insight.current_jobs,
        "previous_jobs": insight.previous_jobs,
        "trend": insight.trend,
        "risk_level": insight.risk_level,
        "insight": insight.insight
    }

@router.post("/suppliers/{supplier_id}/linkedin")
def set_linkedin_company(
    supplier_id: int,
    name: str,
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

    supplier.linkedin_company_name = name
    db.commit()

    return {"status": "saved"}