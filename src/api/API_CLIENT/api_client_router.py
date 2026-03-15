# src/api/routers/api_clients.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import Request, HTTPException

from src.api.db import get_db
from src.api.API_USER.client_user_tokens import get_client_user_session
from src.api.API_CLIENT.client_api_tokens import (
    create_api_client_token,
    revoke_api_client_token,
    revoke_all_tokens_for_api_client,
)

router = APIRouter(
    prefix="/api/api-clients",
    tags=["api-clients"],
)

class CreateApiClientTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RevokeTokenRequest(BaseModel):
    token: str

@router.post("/{api_client_id}/tokens", response_model=CreateApiClientTokenResponse)
def issue_api_client_token(
    api_client_id: str,
    session=Depends(get_client_user_session),
    db: Session = Depends(get_db),
):
    """
    Create an API CLIENT token.
    Requires:
    Authorization: Bearer cu_...
    """

    token = create_api_client_token(
        api_client_id=api_client_id,
        requesting_client_user_id=session["client_user_id"],
        db=db,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.delete("/tokens")
def revoke_single_api_client_token(
    payload: RevokeTokenRequest,
    session=Depends(get_client_user_session),
    db: Session = Depends(get_db),
):
    """
    Revoke ONE API client token.
    """

    revoke_api_client_token(
        token=payload.token,
        requesting_client_user_id=session["client_user_id"],
        db=db,
    )

    return {"status": "revoked"}


@router.delete("/{api_client_id}/tokens")
def revoke_all_api_client_tokens(
    api_client_id: str,
    session=Depends(get_client_user_session),
    db: Session = Depends(get_db),
):
    """
    Revoke ALL tokens for an API client.
    """

    revoke_all_tokens_for_api_client(
        api_client_id=api_client_id,
        requesting_client_user_id=session["client_user_id"],
        db=db,
    )

    return {"status": "all tokens revoked"}