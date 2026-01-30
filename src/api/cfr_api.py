from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

# Import Database and Models
from src.api.db import get_db
from src.api.auth_backend import get_current_user
from src.api.models import User, CFRTitle, CFRSection, ComplianceAudit, AuditFinding
from src.core.regulations.cfr_loader import cfr_loader

router = APIRouter(prefix="/api/v1/cfr", tags=["CFR Regulations"])

@router.get("/titles")
async def list_cfr_titles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available CFR titles (1-50) from Postgres."""
    try:
        titles = db.query(CFRTitle).order_by(CFRTitle.title_number).all()
        result = [
            {
                "title_number": t.title_number,
                "title_name": t.name,
                "amendment_date": t.amendment_date
            } for t in titles
        ]
        return JSONResponse(content={
            "ok": True,
            "count": len(result),
            "titles": result
        })
    except Exception as e:
        return JSONResponse(content={"ok": False, "error": str(e)}, status_code=500)


@router.get("/title/{title_number}")
async def get_cfr_title(
    title_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific CFR title with its chapters and parts from Postgres."""
    try:
        title = db.query(CFRTitle).filter(CFRTitle.title_number == title_number).first()
        if not title:
            raise HTTPException(status_code=404, detail=f"Title {title_number} not found")
        
        return JSONResponse(content={
            "ok": True,
            "title": {
                "title_number": title.title_number,
                "title_name": title.name,
                "amendment_date": title.amendment_date,
                "chapter_count": len(title.chapters)
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(content={"ok": False, "error": str(e)}, status_code=500)


@router.get("/section")
async def get_cfr_section(
    title: int = Query(..., ge=1, le=50),
    part: str = Query(...),
    section: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific CFR section text from Postgres."""
    try:
        full_id = f"{title}-{part}-{section}"
        sec_data = db.query(CFRSection).filter(CFRSection.full_id == full_id).first()
        
        if not sec_data:
            raise HTTPException(status_code=404, detail="Section not found")
        
        return JSONResponse(content={
            "ok": True,
            "section": {
                "id": sec_data.full_id,
                "heading": sec_data.heading,
                "regulation_text": sec_data.full_text.split("\n"),
                "citations": sec_data.citations
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(content={"ok": False, "error": str(e)}, status_code=500)


@router.get("/search")
async def search_cfr_regulations(
    query: str = Query(..., min_length=2),
    title: Optional[int] = Query(None, ge=1, le=50),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search CFR regulations using Postgres indexed text search."""
    try:
        # Using the helper we updated in cfr_loader
        results = cfr_loader.search_regulations(query, title_number=title, limit=limit)
        
        return JSONResponse(content={
            "ok": True,
            "query": query,
            "count": len(results),
            "results": results
        })
    except Exception as e:
        return JSONResponse(content={"ok": False, "error": str(e)}, status_code=500)


@router.get("/audit/{audit_id}/gaps")
async def get_audit_regulation_gaps(
    audit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch gaps for a specific audit, joining with regulation text in Postgres."""
    try:
        # Join AuditFindings with CFRSections to get the actual regulation text/heading
        gaps = db.query(AuditFinding, CFRSection).join(
            CFRSection, AuditFinding.regulation_id == CFRSection.full_id
        ).filter(
            AuditFinding.audit_id == audit_id,
            AuditFinding.status == "Non-Compliant"
        ).all()
        
        result_gaps = []
        for finding, section in gaps:
            result_gaps.append({
                "regulation_id": finding.regulation_id,
                "heading": section.heading,
                "section_number": section.section_number,
                "regulation_text": section.full_text,
                "risk_rating": finding.risk_rating,
                "narrative": finding.narrative,
                "compliance_score": finding.score,
                "evidence_chunk": finding.evidence_chunk
            })
        
        return JSONResponse(content={
            "ok": True,
            "audit_id": audit_id,
            "gap_count": len(result_gaps),
            "gaps": result_gaps
        })
    except Exception as e:
        return JSONResponse(content={"ok": False, "error": str(e)}, status_code=500)


@router.get("/regulation/{regulation_id}/audits")
async def get_regulation_audit_history(
    regulation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Find all audits where this specific regulation was flagged as a gap."""
    try:
        history = db.query(AuditFinding, ComplianceAudit).join(
            ComplianceAudit, AuditFinding.audit_id == ComplianceAudit.id
        ).filter(
            AuditFinding.regulation_id == regulation_id,
            ComplianceAudit.user_uid == current_user.id
        ).order_by(ComplianceAudit.timestamp.desc()).all()
        
        audits = []
        for finding, audit in history:
            audits.append({
                "audit_id": str(audit.id),
                "compliance_score": audit.compliance_score,
                "created_at": audit.timestamp.isoformat(),
                "risk_rating": finding.risk_rating,
                "narrative": finding.narrative
            })
            
        return JSONResponse(content={
            "ok": True,
            "regulation_id": regulation_id,
            "audit_count": len(audits),
            "audits": audits
        })
    except Exception as e:
        return JSONResponse(content={"ok": False, "error": str(e)}, status_code=500)

# --- DEPRECATED ADMIN TOOLS (Neo4j gone) ---

@router.post("/admin/ensure-indexes")
async def ensure_indexes():
    return {"ok": True, "message": "Postgres indexes are managed via SQLAlchemy models."}