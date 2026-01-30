# src/api/cli/api_client_tokens.py

import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.api.db import get_db

API_CLIENT_TOKEN_PREFIX = "api_"
API_CLIENT_TOKEN_EXPIRY_HOURS = 24


def create_api_client_token(
    *,
    api_client_id: str,
    requesting_client_user_id: str,
    db: Session,
    expires_in_hours: int = API_CLIENT_TOKEN_EXPIRY_HOURS,
) -> str:

    owner = db.execute(
        text("""
            SELECT 1
            FROM api_clients
            WHERE id = :api_client_id
              AND owner_client_user_id = :owner_id
              AND is_active = TRUE
        """),
        {
            "api_client_id": api_client_id,
            "owner_id": requesting_client_user_id,
        },
    ).fetchone()

    if not owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this API client",
        )

    token = API_CLIENT_TOKEN_PREFIX + secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_in_hours)

    db.execute(
        text("""
            INSERT INTO api_client_tokens (
                token,
                api_client_id,
                expires_at,
                revoked
            )
            VALUES (
                :token,
                :api_client_id,
                :expires_at,
                FALSE
            )
        """),
        {
            "token": token,
            "api_client_id": api_client_id,
            "expires_at": expires_at,
        },
    )

    db.commit()
    return token

def get_api_client_session(
    request: Request,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Resolve the HTTP request into an API CLIENT session using Bearer token.
    Enforces Quotas and Rate Limits.
    """

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header.split(" ", 1)[1].strip()

    #  Enforce machine token namespace
    if not token.startswith(API_CLIENT_TOKEN_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API client token",
        )

    # 1. Fetch Client + Quota Data
    row = db.execute(
        text("""
            SELECT
                ac.id,
                ac.name,
                ac.scopes,
                ac.is_active,
                ac.monthly_quota,
                ac.current_period_usage,
                ac.tier
            FROM api_client_tokens t
            JOIN api_clients ac
              ON ac.id = t.api_client_id
            WHERE t.token = :token
              AND t.revoked = FALSE
              AND t.expires_at > NOW()
        """),
        {"token": token},
    ).fetchone()

    # 2. Basic Validation
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired API client token",
        )

    if not row.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API client is disabled",
        )

    # 3.  QUOTA CHECK (The Billing Gate)
    # Check if usage has met or exceeded the quota
    if row.monthly_quota is not None and row.current_period_usage >= row.monthly_quota:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Monthly quota of {row.monthly_quota} requests exceeded. Upgrade your plan to continue."
        )

    # 4. INCREMENT USAGE (The Meter)
    # Atomic update to prevent race conditions in basic deployments
    db.execute(
        text("""
            UPDATE api_clients 
            SET current_period_usage = current_period_usage + 1, 
                last_used_at = NOW() 
            WHERE id = :id
        """),
        {"id": row.id}
    )
    
    # Update the token last_used_at as well
    db.execute(
        text("""
            UPDATE api_client_tokens 
            SET last_used_at = NOW() 
            WHERE token = :token
        """),
        {"token": token},
    )
    
    db.commit()

    return {
        "api_client_id": row.id,
        "name": row.name,
        "scopes": row.scopes,
        "tier": row.tier,
    }

def revoke_api_client_token(
    *,
    token: str,
    requesting_client_user_id: str,
    db: Session,
) -> None:
    """
    Revoke a single API-client token (ownership enforced).
    """

    result = db.execute(
        text("""
            UPDATE api_client_tokens t
            SET revoked = TRUE
            FROM api_clients ac
            WHERE t.api_client_id = ac.id
              AND t.token = :token
              AND ac.owner_client_user_id = :owner_id
        """),
        {
            "token": token,
            "owner_id": requesting_client_user_id,
        },
    )

    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to revoke this token",
        )

    db.commit()


def revoke_all_tokens_for_api_client(
    *,
    api_client_id: str,
    requesting_client_user_id: str,
    db: Session,
) -> None:
    """
    Revoke ALL tokens for an API client (ownership enforced).
    """

    result = db.execute(
        text("""
            UPDATE api_client_tokens t
            SET revoked = TRUE
            FROM api_clients ac
            WHERE t.api_client_id = ac.id
              AND ac.id = :api_client_id
              AND ac.owner_client_user_id = :owner_id
        """),
        {
            "api_client_id": api_client_id,
            "owner_id": requesting_client_user_id,
        },
    )

    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to revoke tokens for this API client",
        )

    db.commit()