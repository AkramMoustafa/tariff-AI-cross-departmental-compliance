from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import requests
from src.api.API_USER.client_user_tokens import get_client_user_session
from src.api.models import SupplierJobPosting, SupplierHiringInsight
from src.api.db import get_db
from src.api.models import Supplier
from src.api.models import SupplierJobPosting
from src.api.models import User
from fastapi import APIRouter, Depends, HTTPException
from src.api.models import ClientUser
router = APIRouter()
import os

THEIRSTACK_API_KEY = os.getenv("THEIRSTACK_API_KEY")
class SupplierRequest(BaseModel):
    supplier_id: int

def calculate_hiring_trend(current_jobs, previous_jobs):

    if previous_jobs == 0:
        return {
            "trend": "NEW_ACTIVITY",
            "risk_level": "LOW",
            "insight": "Initial hiring activity detected. Baseline workforce signal established."
        }

    change = (current_jobs - previous_jobs) / previous_jobs

    if change > 1.0:
        return {
            "trend": "HIRING_SURGE",
            "risk_level": "MEDIUM",
            "insight": "Significant hiring surge detected. Supplier may be expanding operations or undergoing structural change."
        }

    if change > 0.3:
        return {
            "trend": "EXPANSION",
            "risk_level": "LOW",
            "insight": "Moderate workforce expansion detected. Supplier capacity may be increasing."
        }

    if change < -0.5:
        return {
            "trend": "HIRING_DROP",
            "risk_level": "HIGH",
            "insight": "Sharp hiring decline detected. Potential operational slowdown or financial distress."
        }

    return {
        "trend": "STABLE",
        "risk_level": "LOW",
        "insight": "Hiring activity remains stable."
    }


@router.post("/suppliers/preview-jobs")
def preview_jobs(
    request: SupplierRequest,
    db: Session = Depends(get_db),
    session = Depends(get_client_user_session)
):

    supplier_id = request.supplier_id

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

    company_name = supplier.linkedin_company_name
    if not supplier.linkedin_company_name:
        raise HTTPException(status_code=400, detail="LinkedIn company name not set")
    url = "https://api.theirstack.com/v1/jobs/search"

    payload = {
        "company_name_or": [company_name],
        "posted_at_max_age_days": 30,
        "limit": 2
    }

    headers = {
        "Authorization": f"Bearer {THEIRSTACK_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        raise HTTPException(
        status_code=500,
        detail=f"TheirStack API error: {response.text}"
    )

    print("STATUS:", response.status_code)
    print("BODY:", response.text)
    data = response.json()

    jobs = data.get("data", [])
    snapshot_time = datetime.utcnow()
    # Store jobs
    for job in jobs:

        job_record = SupplierJobPosting(
            supplier_id=supplier_id,
            external_job_id=job.get("id"),
            job_title=job.get("job_title"),
            location=job.get("location"),
            country=job.get("country"),
            job_url=job.get("url"),
            discovered_at=snapshot_time,
            snapshot_date=snapshot_time
        )

        db.add(job_record)

    db.commit()

    # Calculate hiring trend

    snapshots = (
        db.query(SupplierJobPosting.snapshot_date)
        .filter(SupplierJobPosting.supplier_id == supplier_id)
        .distinct()
        .order_by(SupplierJobPosting.snapshot_date.desc())
        .limit(2)
        .all()
    )

    current_jobs = 0
    previous_jobs = 0

    if len(snapshots) >= 1:
        current_jobs = db.query(func.count()).filter(
            SupplierJobPosting.supplier_id == supplier_id,
            SupplierJobPosting.snapshot_date == snapshots[0][0]
        ).scalar()

    if len(snapshots) >= 2:
        previous_jobs = db.query(func.count()).filter(
            SupplierJobPosting.supplier_id == supplier_id,
            SupplierJobPosting.snapshot_date == snapshots[1][0]
        ).scalar()
    analysis = calculate_hiring_trend(current_jobs, previous_jobs)
    insight_record = SupplierHiringInsight(
        supplier_id=supplier_id,
        snapshot_date=snapshot_time,
        current_jobs=current_jobs,
        previous_jobs=previous_jobs,
        trend=analysis["trend"],
        risk_level=analysis["risk_level"],
        insight=analysis["insight"]
    )

    db.add(insight_record)
    db.commit()
    return {
        "jobs_found": len(jobs),
        "current_jobs": current_jobs,
        "previous_jobs": previous_jobs,
        "trend": analysis["trend"],
        "risk_level": analysis["risk_level"],
        "insight": analysis["insight"]
    }
@router.patch("/suppliers/{supplier_id}/linkedin-name")
def update_linkedin_name(
    supplier_id: int,
    data: dict,
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

    supplier.linkedin_company_name = data.get("linkedin_company_name")

    db.commit()

    return {
        "supplier_id": supplier.id,
        "linkedin_company_name": supplier.linkedin_company_name
    }

def get_hiring_insight(supplier_id: int, db, client_user_id: int):

    supplier = (
        db.query(Supplier)
        .filter(
            Supplier.id == supplier_id,
            Supplier.client_user_id == client_user_id
        )
        .first()
    )

    if not supplier:
        return None

    insight = (
        db.query(SupplierHiringInsight)
        .filter(SupplierHiringInsight.supplier_id == supplier_id)
        .order_by(SupplierHiringInsight.snapshot_date.desc())
        .first()
    )

    if not insight:
        return {"message": "No hiring insights available"}

    return {
        "supplier_id": supplier_id,
        "linkedin_company_name": supplier.linkedin_company_name,
        "trend": insight.trend,
        "risk_level": insight.risk_level,
        "insight": insight.insight,
        "current_jobs": insight.current_jobs,
        "previous_jobs": insight.previous_jobs,
        "snapshot_date": insight.snapshot_date
    }