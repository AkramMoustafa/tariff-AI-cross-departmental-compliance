from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict

from src.api.cli.team_service.control_owner_service import ControlOwnerService
from src.api.cli.tokens import get_session 
router = APIRouter(
    prefix="/control-owner",
    tags=["Control Owner"],
)


@router.get("/evidence-tasks")
def fetch_evidence_tasks(session: Dict[str, Any] = Depends(get_session)):
    try:
        return ControlOwnerService.fetch_evidence_tasks(session)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.post("/evidence/{request_id}/submit")
def submit_evidence(
    request_id: int,
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    note = payload.get("note")
    if not note:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'note' is required.",
        )

    try:
        ControlOwnerService.submit_evidence(session, request_id, note)
        return {"status": "submitted"}
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.get("/control-executions")
def fetch_control_executions(session: Dict[str, Any] = Depends(get_session)):
    try:
        return ControlOwnerService.fetch_control_executions(session)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.post("/control-executions/{execution_id}/complete")
def complete_execution(
    execution_id: int,
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        ControlOwnerService.complete_execution(session, execution_id)
        return {"status": "completed"}
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.get("/departments")
def fetch_departments(session: Dict[str, Any] = Depends(get_session)):
    try:
        return ControlOwnerService.fetch_departments(session)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
