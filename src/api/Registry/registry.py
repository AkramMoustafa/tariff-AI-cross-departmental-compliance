# URL = "https://ised-isde.canada.ca/cc/lgcy/fdrlCrpDtls.html?corpId=10611638"
import requests
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends
from datetime import datetime

from src.api.db import get_db
from src.api.API_USER.client_user_tokens import get_client_user_session
from src.api.models import Supplier
from src.api.models import SupplierRegistryInsight

router = APIRouter()
def get_registry_insight_from_db(
    supplier_id: int,
    db: Session
):
    insight = (
        db.query(SupplierRegistryInsight)
        .filter(SupplierRegistryInsight.supplier_id == supplier_id)
        .first()
    )

    if not insight:
        return None

    return {
        "snapshot_date": insight.snapshot_date,
        "health_score": insight.health_score,
        "status": insight.status,
        "signals": insight.signals,
        "risks": insight.risks,
        "directors_count": insight.directors_count,
        "filings_count": insight.filings_count,
        "history_count": insight.history_count
    }
def evaluate_registry_health(data: dict):

    signals = []
    risks = []
    score = 100

    directors = data.get("Directors", [])
    filings = data.get("Annual filings", {}).get("details", [])
    history = data.get("Corporate history", [])

    if data.get("Registered office address"):
        signals.append("Registered office verified")
    else:
        risks.append("No registered office address found")
        score -= 15

    if directors:
        signals.append(f"{len(directors)} directors registered")

        if len(directors) == 1:
            signals.append("Single director structure")
    else:
        risks.append("No directors listed")
        score -= 20

    if filings:
        signals.append("Annual filings available")
    else:
        risks.append("No annual filings detected")
        score -= 20

    # --- Corporate history ---
    if history:
        signals.append(f"{len(history)} corporate events recorded")

    # --- Negative legal signals ---
    negative_terms = [
        "dissolved",
        "liquidation",
        "bankrupt",
        "strike off",
        "inactive",
        "revoked",
        "insolvency"
    ]

    for key, value in data.items():

        if isinstance(value, str):
            if any(term in value.lower() for term in negative_terms):
                risks.append(value)
                score -= 40

        if isinstance(value, list):
            for item in value:
                if isinstance(item, str) and any(term in item.lower() for term in negative_terms):
                    risks.append(item)
                    score -= 40

    # --- Normalize score ---
    score = max(0, min(score, 100))

    # --- Determine status ---
    if score >= 75:
        status = "HEALTHY"
    elif score >= 50:
        status = "WATCH"
    else:
        status = "RISK"

    return {
        "health_score": score,
        "status": status,
        "signals": signals,
        "risks": risks,
        "directors": directors,
        "filings": filings,
        "history_count": len(history)
    }

def run_registry_scan(
    supplier_id: int,
    url: str,
    db: Session
):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(url, headers=headers, timeout=90)

    if response.status_code != 200:
        raise Exception("Failed to fetch page")

    soup = BeautifulSoup(response.text, "html.parser")

    data = {}

    # --- Extract key/value fields ---
    for row in soup.select(".panel-body .row"):
        cols = row.find_all("div")

        if len(cols) >= 2:
            key = cols[0].get_text(strip=True)
            val = cols[1].get_text(" ", strip=True)

            if key.endswith(":"):
                data[key.replace(":", "")] = val

    # --- Address ---
    addr_section = soup.find("span", string="Registered office address")

    if addr_section:
        header = addr_section.find_parent("header")
        if header:
            section = header.find_next("section")
            if section:
                address = section.get_text("\n", strip=True)
                data["Registered office address"] = address

    # --- Directors ---
    directors = []
    for li in soup.select("ul li"):
        name = li.find("b")
        if name:
            directors.append(name.get_text(strip=True))

    if directors:
        data["Directors"] = directors

    # --- Annual filings ---
    annual = {}
    for row in soup.select("#annualfilingId ~ .row"):
        cols = row.find_all("div")

        if len(cols) >= 1:
            text = cols[0].get_text(strip=True)
            if text:
                annual.setdefault("details", []).append(text)

    if annual:
        data["Annual filings"] = annual

    # --- Corporate history ---
    history = []
    for row in soup.select("table tbody tr"):
        cols = [c.get_text(strip=True) for c in row.find_all("td")]
        if cols:
            history.append(cols)

    if history:
        data["Corporate history"] = history

    # --- Evaluate ---
    analysis = evaluate_registry_health(data)

    # --- Persist ---
    record = db.query(SupplierRegistryInsight).filter_by(
        supplier_id=supplier_id
    ).first()

    if record:
        record.snapshot_date = datetime.utcnow()
        record.health_score = analysis["health_score"]
        record.status = analysis["status"]
        record.signals = analysis["signals"]
        record.risks = analysis["risks"]
        record.directors_count = len(analysis["directors"])
        record.filings_count = len(analysis["filings"])
        record.history_count = analysis["history_count"]
    else:
        record = SupplierRegistryInsight(
            supplier_id=supplier_id,
            snapshot_date=datetime.utcnow(),
            health_score=analysis["health_score"],
            status=analysis["status"],
            signals=analysis["signals"],
            risks=analysis["risks"],
            directors_count=len(analysis["directors"]),
            filings_count=len(analysis["filings"]),
            history_count=analysis["history_count"]
        )
        db.add(record)

    db.commit()

    return analysis
    
@router.post("/suppliers/{supplier_id}/registry-scan")
def scrape_company(
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

    if not supplier.company_registration_number:
        raise HTTPException(status_code=400, detail="Missing registration number")
    url = f"https://ised-isde.canada.ca/cc/lgcy/fdrlCrpDtls.html?corpId={supplier.company_registration_number}"

    try:
        return run_registry_scan(
            supplier_id=supplier.id,
            url=url,
            db=db
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))