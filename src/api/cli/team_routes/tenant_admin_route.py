from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict
from src.api.cli.team_service.tenant_admin_service import ComplianceOwnerService
from src.api.cli.tokens import get_session 
from uuid import UUID

router = APIRouter(
    prefix="/compliance-owner",
    tags=["Compliance Owner"],
)
@router.get("/me")
def get_compliance_owner_context(
    session: Dict[str, Any] = Depends(get_session),
):
    """
    Returns the authenticated user's context:
    roles + active_role.
    Safe, read-only.
    """
    try:
        return ComplianceOwnerService.get_user_context(session)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    
@router.get("/frameworks")
def fetch_frameworks(
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        return ComplianceOwnerService.fetch_frameworks(session["tenant_id"])
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
@router.get("/controls/overview")
def get_controls_overview(
    session: Dict[str, Any] = Depends(get_session),
):
    """
    High-level overview of control executions for Compliance Owner
    """
    try:
        return ComplianceOwnerService.get_controls_overview(session)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/inbox")
def get_compliance_owner_inbox(
    session: Dict[str, Any] = Depends(get_session),
):
    """
    Unified inbox for Compliance Owner
    """
    try:
        return ComplianceOwnerService.get_inbox(session)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/frameworks/{framework_id}/status")
def set_framework_status(
    framework_id: UUID,
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    status_value = payload.get("status")
    if not status_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'status' is required.",
        )

    try:
        ComplianceOwnerService.set_framework_status(
            session=session,
            framework_id=framework_id,
            status=status_value,
        )
        return {"status": "updated"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/dashboard")
def get_compliance_dashboard(
    session: Dict[str, Any] = Depends(get_session),
):
    return ComplianceOwnerService.get_dashboard_summary(
        session["tenant_id"]
    )


@router.get("/executive-compliance/snapshot")
def get_executive_compliance_snapshot(
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        return ComplianceOwnerService.get_executive_compliance_snapshot(session)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
@router.post("/executive-compliance/send")
def send_executive_compliance_report(
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        return ComplianceOwnerService.send_executive_compliance_report(session)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
        
@router.post("/frameworks/custom")
def create_custom_framework(
    
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    name = payload.get("name")
    description = payload.get("description")

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'name' is required.",
        )

    ComplianceOwnerService.create_custom_framework(
        tenant_id=session["tenant_id"],
        user_id=session["user_id"],
        name=name,
        description=description,
    )

    return {"status": "created"}

@router.get("/users")
def fetch_users_for_tenant(
    session: Dict[str, Any] = Depends(get_session),
):
    try:
        return ComplianceOwnerService.fetch_users_for_tenant(session["tenant_id"])
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.post("/users/{user_id}/roles")
def assign_role(
    user_id: UUID,
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    role_name = payload.get("role")
    if not role_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'role' is required.",
        )

    ComplianceOwnerService.assign_role(user_id, role_name)
    return {"status": "assigned"}


@router.delete("/users/{user_id}/roles")
def remove_role(
    user_id: UUID,
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    role_name = payload.get("role")
    if not role_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'role' is required.",
        )

    ComplianceOwnerService.remove_role(user_id, role_name)
    return {"status": "removed"}

@router.post("/departments")
def create_department(
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    name = payload.get("name")
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'name' is required.",
        )

    try:
        ComplianceOwnerService.create_department(session, name)
        return {"status": "created"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.post("/departments/{department_id}/users/{user_id}")
def assign_user_to_department(
    department_id: int,
    user_id: int,
):
    ComplianceOwnerService.assign_user_to_department(user_id, department_id)
    return {"status": "assigned"}

@router.post("/evidence-requests")
def issue_compliance_request(
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    required = {"requested_from_id", "description", "due_date"}
    missing = required - payload.keys()
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing fields: {', '.join(missing)}",
        )

    ComplianceOwnerService.issue_compliance_request(
        session=session,
        requested_from_id=payload["requested_from_id"],
        description=payload["description"],
        due_date=payload["due_date"],
    )

    return {"status": "created"}


@router.post("/evidence-requests/{request_id}/review")
def review_evidence_submission(
    request_id: int,
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    accept = payload.get("accept")
    note = payload.get("note")

    if accept is None:
        raise HTTPException(
            status_code=400,
            detail="Field 'accept' is required.",
        )

    try:
        ComplianceOwnerService.review_evidence_submission(
            session=session,
            request_id=request_id,
            accept=accept,
            note=note,
        )
        return {"status": "reviewed"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/auditor-access/pending")
def fetch_pending_auditor_requests(
    session: Dict[str, Any] = Depends(get_session),
):
    return ComplianceOwnerService.fetch_pending_auditor_requests(
        session["tenant_id"]
    )


@router.post("/auditor-access/{access_id}/review")
def review_auditor_request(
    access_id: int,
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    required = {"evidence_request_id", "auditor_email", "approve"}
    missing = required - payload.keys()
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing fields: {', '.join(missing)}",
        )

    try:
        ComplianceOwnerService.review_auditor_request(
            session=session,
            access_id=access_id,
            evidence_request_id=payload["evidence_request_id"],
            auditor_email=payload["auditor_email"],
            approve=payload["approve"],
        )
        return {"status": "reviewed"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
@router.get("/departments")
def fetch_departments(
    session: Dict[str, Any] = Depends(get_session),
):
    """
    List all departments for the tenant (Compliance Owner only)
    """
    try:
        return ComplianceOwnerService.fetch_departments_for_tenant(
            session["tenant_id"]
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/control-owner-nominations/pending")
def fetch_pending_control_owner_nominations(
    session: Dict[str, Any] = Depends(get_session),
):
    return ComplianceOwnerService.fetch_pending_control_owner_nominations(
        session["tenant_id"]
    )


@router.post("/control-owner-nominations/{nomination_id}/review")
def review_control_owner_nomination(
    nomination_id: int,
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    required = {"nominee_user_id", "approve"}
    missing = required - payload.keys()
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing fields: {', '.join(missing)}",
        )

    try:
        ComplianceOwnerService.review_control_owner_nomination(
            session=session,
            nomination_id=nomination_id,
            nominee_user_id=payload["nominee_user_id"],
            approve=payload["approve"],
        )
        return {"status": "reviewed"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
