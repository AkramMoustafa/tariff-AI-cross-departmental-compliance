from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict

from src.api.cli.team_service.auditor_service import AuditorService
from src.api.cli.tokens import get_session  


router = APIRouter(
    prefix="/auditor",
    tags=["Auditor"],
)


@router.get("/evidence-requests")
def list_evidence_requests(
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        return AuditorService.list_evidence_requests(session)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.post("/evidence-requests/{evidence_request_id}/request-access")
def request_evidence_access(
    evidence_request_id: int,
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        AuditorService.request_evidence_access(session, evidence_request_id)
        return {"status": "requested"}
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/evidence-requests/{evidence_request_id}/files")
def list_evidence_files(
    evidence_request_id: int,
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        return AuditorService.list_evidence_files(session, evidence_request_id)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.get("/evidence-requests/{evidence_request_id}/audit-log")
def list_evidence_audit_log(
    evidence_request_id: int,
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        return AuditorService.list_evidence_audit_log(session, evidence_request_id)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
