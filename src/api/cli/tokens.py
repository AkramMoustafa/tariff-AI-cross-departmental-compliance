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
    expires_in_hours: int = TOKEN_EXPIRY_HOURS,
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
            JOIN users u ON u.id = t.user_uid
            WHERE t.token = :token
              AND t.revoked = FALSE
              AND t.expires_at > NOW()
        """),
        {"token": token},
    ).fetchone()

    if not row:
        return None

    return db.query(User).filter(User.id == row.id).first()


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
    Resolve the current HTTP request into a session dict using a Bearer token.
    """

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header.split(" ", 1)[1].strip()

    row = db.execute(
        text("""
            SELECT
                u.id,
                u.email,
                u.tenant_id,
                u.is_active
            FROM auth_tokens t
            JOIN users u ON u.id = t.user_uid
            WHERE t.token = :token
            AND t.revoked = FALSE
            AND t.expires_at > NOW()
        """),
        {"token": token},
    ).fetchone()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    if not row.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    roles = db.execute(
        text("""
            SELECT r.name
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = :user_id
        """),
        {"user_id": row.id},
    ).fetchall()

    role_names = [r[0] for r in roles]

    if not role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User has no assigned roles",
        )

    return {
        "user_id": row.id,
        "email": row.email,
        "tenant_id": row.tenant_id,
        "roles": role_names,
        "active_role": Role[role_names[0]],
    }