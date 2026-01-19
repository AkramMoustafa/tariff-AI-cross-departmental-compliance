from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict

from src.api.cli.team_service.department_owner_service import DepartmentOwnerService
from src.api.cli.tokens import get_session 


router = APIRouter(
    prefix="/department-owner",
    tags=["Department Owner"],
)

@router.get("/overview")
def view_department_overview(
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        return DepartmentOwnerService.view_department_overview(session)
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


@router.get("/health")
def view_department_health(
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        return DepartmentOwnerService.view_department_health(session)
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


# ---------- write routes ----------


@router.post("/evidence-requests")
def issue_evidence_request(
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    required_fields = {"requested_from_id", "description", "due_date"}
    missing = required_fields - payload.keys()
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing fields: {', '.join(missing)}",
        )

    try:
        DepartmentOwnerService.issue_evidence_request(
            session=session,
            requested_from_id=payload["requested_from_id"],
            description=payload["description"],
            due_date=payload["due_date"],
        )
        return {"status": "created"}
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


@router.post("/control-executions")
def create_control_execution(
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    required_fields = {
        "control_owner_id",
        "period_start",
        "period_end",
        "due_at",
    }
    missing = required_fields - payload.keys()
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing fields: {', '.join(missing)}",
        )

    try:
        control_id = DepartmentOwnerService.create_control_execution(
            session=session,
            control_owner_id=payload["control_owner_id"],
            period_start=payload["period_start"],
            period_end=payload["period_end"],
            due_at=payload["due_at"],
        )
        return {
            "status": "created",
            "control_id": control_id,
        }
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


@router.post("/control-executions/{control_id}/nominate")
def nominate_control_owner(
    control_id: str,
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    nominated_user_id = payload.get("nominated_user_id")
    if not nominated_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'nominated_user_id' is required.",
        )

    try:
        DepartmentOwnerService.nominate_control_owner(
            session=session,
            control_id=control_id,
            nominated_user_id=nominated_user_id,
        )
        return {"status": "nominated"}
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
