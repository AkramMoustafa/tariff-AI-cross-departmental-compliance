# src/api/cli/tokens.py

import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.api.db import get_db
from src.api.models import User
from src.api.cli.authorization import Role


TOKEN_EXPIRY_HOURS = 24  # API session lifetime

def create_access_token(
    user_uid: str,
    db: Session,
    expires_in_hours: int = TOKEN_EXPIRY_HOURS
) -> str:
    """
    Create and persist a bearer token for API authentication.
    """
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_in_hours)

    db.execute(
        text("""
            INSERT INTO auth_tokens (token, user_uid, expires_at, revoked)
            VALUES (:token, :user_uid, :expires_at, FALSE)
        """),
        {
            "token": token,
            "user_uid": user_uid,
            "expires_at": expires_at,
        },
    )
    db.commit()

    return token


def get_user_by_token(token: str, db: Session) -> Optional[User]:
    """
    Validate bearer token and return associated User.
    """
    row = db.execute(
        text("""
            SELECT u.*
            FROM auth_tokens t
            JOIN users u ON u.uid = t.user_uid
            WHERE t.token = :token
              AND t.revoked = FALSE
              AND t.expires_at > NOW()
        """),
        {"token": token},
    ).fetchone()

    if not row:
        return None

    return db.query(User).filter(User.uid == row.uid).first()


def revoke_token(token: str, db: Session) -> None:
    """
    Revoke a bearer token (logout).
    """
    db.execute(
        text("""
            UPDATE auth_tokens
            SET revoked = TRUE
            WHERE token = :token
        """),
        {"token": token},
    )
    db.commit()


def revoke_all_tokens_for_user(user_uid: str, db: Session) -> None:
    """
    Force logout from all devices.
    """
    db.execute(
        text("""
            UPDATE auth_tokens
            SET revoked = TRUE
            WHERE user_uid = :user_uid
        """),
        {"user_uid": user_uid},
    )
    db.commit()

def get_session(
    request: Request,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Resolve the current request into a session dict using a Bearer token.
    """

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header.replace("Bearer ", "", 1).strip()
    user = get_user_by_token(token, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return {
        "user_id": user.id,
        "user_uid": user.uid,
        "email": user.email,
        "tenant_id": user.tenant_id,
        "tenant_name": user.tenant.name if user.tenant else None,
        "roles": [role.name for role in user.roles],
        "active_role": Role[user.roles[0].name] if user.roles else None,
    }
