from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict

from src.api.cli.team_service.executive_service import ExecutiveService
from src.api.cli.tokens import get_session 


router = APIRouter(
    prefix="/executive",
    tags=["Executive"],
)


# ---------- request routes ----------


@router.post("/requests/information")
def request_information(
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    subject = payload.get("subject")
    details = payload.get("details")

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'subject' is required.",
        )

    try:
        ExecutiveService.request_information(
            session=session,
            subject=subject,
            details=details,
        )
        return {"status": "requested"}
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.post("/requests/follow-up")
def request_follow_up(
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    department_id = payload.get("department_id")
    message = payload.get("message")

    if not department_id or not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fields 'department_id' and 'message' are required.",
        )

    try:
        ExecutiveService.request_follow_up(
            session=session,
            department_id=department_id,
            message=message,
        )
        return {"status": "requested"}
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


# ---------- supervision & notifications ----------


@router.post("/supervision/enable")
def enable_supervise_mode(
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    scope = payload.get("scope")

    if not scope:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'scope' is required.",
        )

    try:
        ExecutiveService.enable_supervise_mode(
            session=session,
            scope=scope,
        )
        return {"status": "enabled", "scope": scope}
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


@router.post("/notifications/subscribe")
def subscribe_to_notifications(
    payload: Dict[str, Any],
    session: Dict[str, Any] = Depends(get_session),
):
    topic = payload.get("topic")

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'topic' is required.",
        )

    try:
        ExecutiveService.subscribe_to_notifications(
            session=session,
            topic=topic,
        )
        return {"status": "subscribed", "topic": topic}
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
