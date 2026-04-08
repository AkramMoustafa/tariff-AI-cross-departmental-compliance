from pydantic import BaseModel
from typing import Optional, List, Any
from sqlalchemy.orm import Session
from src.api.models import (
    Supplier,
    SupplierProfile,
    SupplierPortSignal,
    SupplierHiringInsight,
)
from src.api.models import SupplierRiskSnapshot

class RiskFlagItem(BaseModel):
    key: str
    label: str
    value: Any
    unit: Optional[str] = None
    status: str  # ok, warning, critical, unknown
    message: str

class RiskSectionSummary(BaseModel):
    score: float
    level: str
    items: List[RiskFlagItem]

class OverallRiskSummary(BaseModel):
    score: float
    level: str
    primary_driver: Optional[str] = None

class SupplierProfileSummaryResponse(BaseModel):
    supplier_id: int
    supplier_name: str
    overall_supplier_risk: OverallRiskSummary
    sections: dict[str, RiskSectionSummary]

def classify_score(score: float) -> str:
    if score >= 75:
        return "HIGH"
    if score >= 40:
        return "MODERATE"
    return "LOW"

def bool_flag(value: bool | None, true_status="warning", false_status="ok", true_msg="", false_msg=""):
    if value is None:
        return "unknown", "Value not available"
    if value:
        return true_status, true_msg
    return false_status, false_msg

def range_flag(value, warn_at=None, critical_at=None, higher_is_worse=True):
    if value is None:
        return "unknown"
    if higher_is_worse:
        if critical_at is not None and value >= critical_at:
            return "critical"
        if warn_at is not None and value >= warn_at:
            return "warning"
        return "ok"
    else:
        if critical_at is not None and value <= critical_at:
            return "critical"
        if warn_at is not None and value <= warn_at:
            return "warning"
        return "ok"
    

def build_operational_section(profile: SupplierProfile) -> dict:
    items = []
    score = 0

    lead_status = range_flag(profile.avg_lead_time_days, warn_at=30, critical_at=60, higher_is_worse=True)
    lead_msg = {
        "ok": "Lead time is healthy",
        "warning": "Lead time is elevated",
        "critical": "Lead time is critically high",
        "unknown": "Lead time unavailable",
    }[lead_status]
    items.append({
        "key": "avg_lead_time_days",
        "label": "Average Lead Time",
        "value": profile.avg_lead_time_days,
        "unit": "days",
        "status": lead_status,
        "message": lead_msg,
    })
    score += {"ok": 5, "warning": 20, "critical": 35, "unknown": 10}[lead_status]

    otd_status = range_flag(profile.on_time_delivery_pct, warn_at=95, critical_at=90, higher_is_worse=False)
    otd_msg = {
        "ok": "On-time delivery is strong",
        "warning": "On-time delivery is below preferred threshold",
        "critical": "On-time delivery is poor",
        "unknown": "On-time delivery unavailable",
    }[otd_status]
    items.append({
        "key": "on_time_delivery_pct",
        "label": "On-time Delivery",
        "value": profile.on_time_delivery_pct,
        "unit": "%",
        "status": otd_status,
        "message": otd_msg,
    })
    score += {"ok": 5, "warning": 20, "critical": 35, "unknown": 10}[otd_status]

    quality_status = range_flag(profile.quality_issues_pct, warn_at=2.0, critical_at=5.0, higher_is_worse=True)
    quality_msg = {
        "ok": "Quality issues are within acceptable range",
        "warning": "Quality issue rate needs monitoring",
        "critical": "Quality issue rate is high",
        "unknown": "Quality issue rate unavailable",
    }[quality_status]
    items.append({
        "key": "quality_issues_pct",
        "label": "Quality Issues",
        "value": profile.quality_issues_pct,
        "unit": "%",
        "status": quality_status,
        "message": quality_msg,
    })
    score += {"ok": 5, "warning": 15, "critical": 30, "unknown": 10}[quality_status]

    single_site_status, single_site_msg = bool_flag(
        profile.single_site,
        true_status="warning",
        false_status="ok",
        true_msg="Single-site manufacturing increases disruption risk",
        false_msg="Multi-site structure reduces disruption risk",
    )
    items.append({
        "key": "single_site",
        "label": "Single-site Manufacturing",
        "value": profile.single_site,
        "status": single_site_status,
        "message": single_site_msg,
    })
    score += {"ok": 0, "warning": 20, "critical": 30, "unknown": 10}[single_site_status]

    backup_status, backup_msg = bool_flag(
        profile.backup_facility,
        true_status="ok",
        false_status="critical",
        true_msg="Backup facility exists",
        false_msg="No backup facility configured",
    )
    items.append({
        "key": "backup_facility",
        "label": "Backup Facility",
        "value": profile.backup_facility,
        "status": backup_status,
        "message": backup_msg,
    })
    score += {"ok": 0, "warning": 15, "critical": 35, "unknown": 10}[backup_status]

    score = min(score, 100)

    return {
        "score": score,
        "level": classify_score(score),
        "items": items,
    }

def build_dependency_section(profile: SupplierProfile) -> dict:
    value = profile.category_volume_share_pct
    status = range_flag(value, warn_at=20, critical_at=40, higher_is_worse=True)
    msg = {
        "ok": "Supplier dependency is limited",
        "warning": "Meaningful dependency on this supplier",
        "critical": "High concentration risk on this supplier",
        "unknown": "Dependency data unavailable",
    }[status]
    score = {"ok": 10, "warning": 40, "critical": 75, "unknown": 20}[status]

    return {
        "score": score,
        "level": classify_score(score),
        "items": [
            {
                "key": "category_volume_share_pct",
                "label": "Category Volume Share",
                "value": value,
                "unit": "%",
                "status": status,
                "message": msg,
            }
        ],
    }

def build_structural_section(profile: SupplierProfile) -> dict:
    items = []
    score = 0

    years_status = range_flag(profile.years_in_operation, warn_at=5, critical_at=2, higher_is_worse=False)
    years_msg = {
        "ok": "Supplier operating history is established",
        "warning": "Operating history is still limited",
        "critical": "Very limited operating history",
        "unknown": "Years in operation unavailable",
    }[years_status]
    items.append({
        "key": "years_in_operation",
        "label": "Years in Operation",
        "value": profile.years_in_operation,
        "unit": "years",
        "status": years_status,
        "message": years_msg,
    })
    score += {"ok": 5, "warning": 20, "critical": 35, "unknown": 10}[years_status]

    cert_status, cert_msg = bool_flag(
        profile.has_trade_compliance_certs,
        true_status="ok",
        false_status="warning",
        true_msg="Trade/compliance certifications available",
        false_msg="Trade/compliance certifications missing or unknown",
    )
    items.append({
        "key": "has_trade_compliance_certs",
        "label": "Trade Compliance Certifications",
        "value": profile.has_trade_compliance_certs,
        "status": cert_status,
        "message": cert_msg,
    })
    score += {"ok": 0, "warning": 20, "critical": 30, "unknown": 10}[cert_status]

    insurance_status, insurance_msg = bool_flag(
        profile.has_insurance,
        true_status="ok",
        false_status="warning",
        true_msg="Insurance coverage available",
        false_msg="Insurance coverage missing or unknown",
    )
    items.append({
        "key": "has_insurance",
        "label": "Insurance Coverage",
        "value": profile.has_insurance,
        "status": insurance_status,
        "message": insurance_msg,
    })
    score += {"ok": 0, "warning": 15, "critical": 30, "unknown": 10}[insurance_status]

    if not profile.revenue_band or profile.revenue_band.lower() == "unknown":
        rev_status = "warning"
        rev_msg = "Revenue band is unknown"
        rev_score = 15
    else:
        rev_status = "ok"
        rev_msg = "Revenue band available"
        rev_score = 0

    items.append({
        "key": "revenue_band",
        "label": "Revenue Band",
        "value": profile.revenue_band,
        "status": rev_status,
        "message": rev_msg,
    })
    score += rev_score

    score = min(score, 100)

    return {
        "score": score,
        "level": classify_score(score),
        "items": items,
    }

def build_logistics_section(profile: SupplierProfile, latest_port_signal: SupplierPortSignal | None) -> dict:
    items = []
    score = 0

    items.append({
        "key": "incoterm",
        "label": "Incoterm",
        "value": profile.incoterm,
        "status": "warning" if profile.incoterm == "FOB" else "ok",
        "message": "FOB increases buyer logistics exposure" if profile.incoterm == "FOB" else "Incoterm has normal risk profile",
    })
    score += 15 if profile.incoterm == "FOB" else 5

    items.append({
        "key": "export_port",
        "label": "Primary Export Port",
        "value": profile.export_port,
        "status": "unknown" if not profile.export_port else "ok",
        "message": "Export port available" if profile.export_port else "Export port not configured",
    })

    if latest_port_signal:
        port_status = "critical" if latest_port_signal.status == "Critical" else "warning" if latest_port_signal.status in {"Warning", "Elevated"} else "ok"
        port_msg = (
            f"Port status is {latest_port_signal.status} with estimated wait {latest_port_signal.estimated_wait_hours}h"
            if latest_port_signal.estimated_wait_hours is not None
            else f"Port status is {latest_port_signal.status}"
        )
        items.append({
            "key": "port_status",
            "label": "Port Congestion",
            "value": latest_port_signal.status,
            "status": port_status,
            "message": port_msg,
        })
        score += {"ok": 5, "warning": 30, "critical": 50, "unknown": 10}[port_status]

    score = min(score, 100)

    return {
        "score": score,
        "level": classify_score(score),
        "items": items,
    }
def get_supplier_profile_summary(db: Session, supplier_id: int) -> dict:
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise ValueError("Supplier not found")

    profile = db.query(SupplierProfile).filter(SupplierProfile.supplier_id == supplier_id).first()
    if not profile:
        raise ValueError("Supplier profile not found")

    latest_port_signal = (
        db.query(SupplierPortSignal)
        .filter(SupplierPortSignal.supplier_id == supplier_id)
        .order_by(SupplierPortSignal.captured_at.desc())
        .first()
    )

    sections = {
        "operational": build_operational_section(profile),
        "dependency": build_dependency_section(profile),
        "structural": build_structural_section(profile),
        "logistics": build_logistics_section(profile, latest_port_signal),
    }

    overall_score = round(
        sections["operational"]["score"] * 0.35
        + sections["dependency"]["score"] * 0.20
        + sections["structural"]["score"] * 0.20
        + sections["logistics"]["score"] * 0.25,
        2,
    )

    primary_driver = max(sections.items(), key=lambda x: x[1]["score"])[0]
 
    overall_level = classify_score(overall_score)

    snapshot = SupplierRiskSnapshot(
        supplier_id=supplier.id,
        overall_score=overall_score,
        overall_level=overall_level,
        primary_driver=primary_driver,
        sections=sections,
        input_snapshot={
            "avg_lead_time_days": profile.avg_lead_time_days,
            "on_time_delivery_pct": profile.on_time_delivery_pct,
            "quality_issues_pct": profile.quality_issues_pct,
            "category_volume_share_pct": profile.category_volume_share_pct,
        }
    )

    db.add(snapshot)
    db.commit()
  
    return {
        "supplier_id": supplier.id,
        "supplier_name": supplier.name,
        "overall_supplier_risk": {
            "score": overall_score,
            "level": classify_score(overall_score),
            "primary_driver": primary_driver,
        },
        "sections": sections,
    }
def normalize(value, min_val, max_val):
    if value is None:
        return 0
    return max(0, min(100, int((value - min_val) / (max_val - min_val) * 100)))

def build_risk_driver_mix(port_signal, news_risk, market_pressure, registry, hiring, forex):

    drivers = []

    # 1. Port / Logistics
    port_score = port_signal.health_score if port_signal and port_signal.health_score else 0
    drivers.append({
        "label": "Port / Logistics",
        "value": int(port_score)
    })
    news_score = news_risk.get("risk_score", 0) if isinstance(news_risk, dict) else (news_risk or 0)
    # 2. Negative News
    drivers.append({
        "label": "Negative News",
        "value": int(news_score)
    })

    # 3. FX Volatility
    fx_score = forex.get("volatility_index", 0) if isinstance(forex, dict) else 0
    drivers.append({
        "label": "FX Volatility",
        "value": int(fx_score)
    })

    # 4. Ownership Changes
    ownership_score = registry.get("risk_score", 0) if isinstance(registry, dict) else 0
    drivers.append({
        "label": "Ownership Changes",
        "value": int(ownership_score)
    })

    print("market_pressure =", market_pressure)
    print("type =", type(market_pressure))
    # 5. Commodity Pricing
    mp_value = market_pressure.get("score", 0) if isinstance(market_pressure, dict) else (market_pressure or 0)
    commodity_score = int(mp_value * 100)
    drivers.append({
        "label": "Commodity Pricing",
        "value": commodity_score
    })

    # 6. Hiring / Workforce
    hiring_score = hiring.get("risk_score", 0) if isinstance(hiring, dict) else 0
    drivers.append({
        "label": "Hiring / Workforce Signals",
        "value": int(hiring_score)
    })

    return drivers

def get_supplier_risk_from_db(db: Session, supplier_id: int) -> dict:
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise ValueError("Supplier not found")

    snapshot = (
        db.query(SupplierRiskSnapshot)
        .filter(SupplierRiskSnapshot.supplier_id == supplier_id)
        .order_by(SupplierRiskSnapshot.computed_at.desc())
        .first()
    )

    if not snapshot:
        raise ValueError("No risk snapshot found for this supplier")

    return {
        "supplier_id": supplier.id,
        "supplier_name": supplier.name,
        "overall_supplier_risk": {
            "score": snapshot.overall_score,
            "level": snapshot.overall_level,
            "primary_driver": snapshot.primary_driver,
        },
        "sections": snapshot.sections,
    }


def compute_country_risk(user_input):
    inflation = user_input.get("Inflation_Rate_Pct", 0)

    # simple normalization
    inflation_risk = min(100, max(0, inflation * 10))  # 5% → 50 risk

    return inflation_risk