import json
import traceback
from datetime import datetime
from typing import List, Dict, Any, Optional, Union
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

# Import Database and Models
from src.api.db import get_db, SessionLocal
from src.api.models import ComplianceAudit, AuditFinding

router = APIRouter()

# PostgreSQL Ingestion Logic 

def upsert_audit_to_postgres(
    user_uid: str,
    file_id: str,
    supplier_id: Optional[Union[str, int]], 
    results: List[Dict[str, Any]],
    summary: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Save audit run and its findings to PostgreSQL.
    Replaces the old Neo4j implementation.
    """
    db = SessionLocal()
    try:
        # Handle supplier_id parsing
        supp_id_int = None
        if supplier_id:
            if isinstance(supplier_id, int):
                supp_id_int = supplier_id
            elif isinstance(supplier_id, str) and supplier_id.isdigit():
                supp_id_int = int(supplier_id)

        # 1. Create Audit Record
        audit = ComplianceAudit(
            user_uid=user_uid,
            file_id=file_id,
            supplier_id=supp_id_int,
            compliance_score=float(summary.get("compliance_score", 0.0)),
            total_requirements=len(results),
            high_risk_gaps=int(summary.get("high_risk_gaps", 0)),
            summary_json=summary
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)

        # 2. Create Findings
        findings = []
        for r in results:
            # Ensure evidence is a string
            evidence_text = r.get("Evidence_Chunk", "")
            if not isinstance(evidence_text, str):
                evidence_text = str(evidence_text)

            finding = AuditFinding(
                audit_id=audit.id,
                regulation_id=r.get("Reg_ID"),
                status="Compliant" if r.get("Is_Compliant") else "Non-Compliant",
                score=float(r.get("Compliance_Score", 0.0)),
                risk_rating=r.get("Risk_Rating"),
                narrative=r.get("Narrative_Gap"),
                evidence_chunk=evidence_text[:5000] if evidence_text else None
            )
            findings.append(finding)
        
        if findings:
            db.bulk_save_objects(findings)
            db.commit()
        
        return {"ok": True, "audit_id": str(audit.id)}
        
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        return {"ok": False, "error": str(e)}
    finally:
        db.close()

# Alias for backward compatibility with main_api.py
upsert_audit_to_neo4j = upsert_audit_to_postgres


def ensure_audit_indexes():
    """No-op for Postgres migration (Indexes handled by SQLAlchemy models)."""
    # This keeps the startup script from crashing if it calls this function
    print("✅ Audit Postgres indexes are managed by SQLAlchemy models.")
    return


# --- API Routes (Updated for Postgres) ---

@router.get("/api/v1/audit/user/{user_uid}")
async def get_user_audits(
    user_uid: str,
    limit: int = Query(50, gt=0, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get all audits initiated by a user (Postgres version)."""
    try:
        audits = (
            db.query(ComplianceAudit)
            .filter(ComplianceAudit.user_uid == user_uid)
            .order_by(desc(ComplianceAudit.timestamp))
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        # Serialize results to match old Neo4j format
        result_list = []
        for a in audits:
            result_list.append({
                "audit_id": str(a.id),
                "timestamp": a.timestamp.isoformat(),
                "compliance_score": a.compliance_score,
                "high_risk_count": a.high_risk_gaps,
                "file_id": a.file_id,
                "supplier_id": a.supplier_id,
                "summary": a.summary_json or {},
                "results": [] # List empty for list view to save bandwidth
            })

        return JSONResponse(content={
            "ok": True,
            "count": len(result_list),
            "audits": result_list
        })
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={
            "ok": False,
            "error": str(e)
        }, status_code=500)


@router.get("/api/v1/audit/supplier/{supplier_id}")
async def get_supplier_audits(
    supplier_id: str,
    limit: int = Query(50, gt=0, le=100),
    db: Session = Depends(get_db)
):
    """Get all audits for a specific supplier (Postgres version)."""
    try:
        # Handle string vs int ID
        if supplier_id.isdigit():
            supp_id_int = int(supplier_id)
        else:
            # If supplier_id is not an int, return empty or handle error
            return JSONResponse(content={"ok": True, "count": 0, "audits": []})

        audits = (
            db.query(ComplianceAudit)
            .filter(ComplianceAudit.supplier_id == supp_id_int)
            .order_by(desc(ComplianceAudit.timestamp))
            .limit(limit)
            .all()
        )
        
        result_list = []
        for a in audits:
            result_list.append({
                "audit_id": str(a.id),
                "timestamp": a.timestamp.isoformat(),
                "compliance_score": a.compliance_score,
                "high_risk_count": a.high_risk_gaps,
                "file_id": a.file_id,
                "summary": a.summary_json or {}
            })

        return JSONResponse(content={
            "ok": True,
            "count": len(result_list),
            "supplier_id": supplier_id,
            "audits": result_list
        })
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={
            "ok": False,
            "error": str(e)
        }, status_code=500)


@router.get("/api/v1/audit/run/{audit_id}")
async def get_audit_details(
    audit_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed audit including all findings/gaps (Postgres version)."""
    try:
        # 1. Fetch Audit
        audit = db.query(ComplianceAudit).filter(ComplianceAudit.id == audit_id).first()
        if not audit:
            raise HTTPException(status_code=404, detail="Audit not found")
        
        # 2. Fetch Findings
        findings = db.query(AuditFinding).filter(AuditFinding.audit_id == audit_id).all()
        
        # 3. Format Gaps (for the 'gaps' tab in UI)
        gaps = []
        for f in findings:
            if f.status == "Non-Compliant":
                gaps.append({
                    "obligation_id": f.regulation_id, # Mapping reg_id to obligation_id for UI compat
                    "text": f.narrative, # Use narrative as text fallback
                    "regulation_id": f.regulation_id,
                    "compliance_score": f.score,
                    "risk_rating": f.risk_rating,
                    "narrative": f.narrative,
                    "evidence_chunk": f.evidence_chunk
                })
        
        # 4. Extract metadata & Flagged Departments
        summary = audit.summary_json or {}
        
        # Reconstruct "flagged_departments" from findings or summary
        # If not in summary, we can try to infer (though usually summary has it)
        flagged_departments = summary.get("departments_flagged", [])

        # 5. Reconstruct 'results' list for full table view
        full_results = []
        for f in findings:
            full_results.append({
                "Reg_ID": f.regulation_id,
                "Is_Compliant": (f.status == "Compliant"),
                "Compliance_Score": f.score,
                "Risk_Rating": f.risk_rating,
                "Narrative_Gap": f.narrative,
                "Evidence_Chunk": f.evidence_chunk
            })

        audit_data = {
            "audit_id": str(audit.id),
            "timestamp": audit.timestamp.isoformat(),
            "compliance_score": audit.compliance_score,
            "high_risk_count": audit.high_risk_gaps,
            "file_id": audit.file_id,
            "supplier_id": audit.supplier_id,
            "summary": summary,
            "gaps": gaps,
            "flagged_departments": flagged_departments,
            "results": full_results
        }

        return JSONResponse(content={
            "ok": True,
            "audit": audit_data
        })
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={
            "ok": False,
            "error": str(e)
        }, status_code=500)