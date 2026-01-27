# src/api/cli/client_tokens.py

import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.api.db import get_db
CLIENT_TOKEN_PREFIX = "cu_"
CLIENT_TOKEN_EXPIRY_HOURS = 24
from src.api.cli.authentication import verify_password, hash_password

def create_client_user_token(
    client_user_id: str,
    db: Session,
    expires_in_hours: int = CLIENT_TOKEN_EXPIRY_HOURS,
) -> str:
    """
    Create and persist a bearer token for a CLIENT USER.
    """
    token = CLIENT_TOKEN_PREFIX + secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_in_hours)

    db.execute(
        text("""
            INSERT INTO client_user_tokens (
                token,
                client_user_id,
                expires_at,
                revoked
            )
            VALUES (
                :token,
                :client_user_id,
                :expires_at,
                FALSE
            )
        """),
        {
            "token": token,
            "client_user_id": client_user_id,
            "expires_at": expires_at,
        },
    )
    db.commit()

    return token


def get_client_user_session(
    request: Request,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Resolve the HTTP request into a CLIENT USER session using Bearer token.
    """

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header.split(" ", 1)[1].strip()

    # Enforce token namespace
    if not token.startswith(CLIENT_TOKEN_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid client-user token",
        )

    row = db.execute(
        text("""
            SELECT
                cu.id,
                cu.email,

                cu.is_active
            FROM client_user_tokens t
            JOIN client_users cu
              ON cu.id = t.client_user_id
            WHERE t.token = :token
              AND t.revoked = FALSE
              AND t.expires_at > NOW()
        """),
        {"token": token},
    ).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired client token",
        )

    if not row.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client user is inactive",
        )

    return {
        "client_user_id": row.id,
        "email": row.email,

    }


def revoke_client_user_token(
    token: str,
    db: Session,
) -> None:
    """
    Revoke a single client-user token.
    """
    db.execute(
        text("""
            UPDATE client_user_tokens
            SET revoked = TRUE
            WHERE token = :token
        """),
        {"token": token},
    )
    db.commit()


def revoke_all_tokens_for_client_user(
    client_user_id: str,
    db: Session,
) -> None:
    """
    Force logout of a client user from all sessions.
    """
    db.execute(
        text("""
            UPDATE client_user_tokens
            SET revoked = TRUE
            WHERE client_user_id = :client_user_id
        """),
        {"client_user_id": client_user_id},
    )
    db.commit()

def register_client_user(
    *,
    email: str,
    password: str,
    db: Session,
) -> Dict[str, Any]:
    """
    Register a new CLIENT USER (signup).
    """

    existing = db.execute(
        text("""
            SELECT 1
            FROM client_users
            WHERE email = :email

        """),
        { "email": email},
    ).fetchone()


    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Client user with this email already exists",
        )


    password_hash = hash_password(password)


    row = db.execute(
        text("""
            INSERT INTO client_users (
              
                email,
                password_hash,
                is_active
            )
            VALUES (
            
                :email,
                :password_hash,
                TRUE
            )
            RETURNING id, email
        """),
        {
        
            "email": email,
            "password_hash": password_hash,
        },
    ).fetchone()


    db.commit()


    # Auto-login after signup (optional but common)
    token = create_client_user_token(
        client_user_id=row.id,
        db=db,
    )


    return {
        "client_user_id": row.id,
        "email": row.email,
      
        "access_token": token,
        "token_type": "bearer",
    }

def login_client_user(
    *,
   
    email: str,
    password: str,
    db: Session,
) -> Dict[str, Any]:
    """
    Authenticate a CLIENT USER (signin).
    """

    row = db.execute(
        text("""
            SELECT
                id,
                email,
         
                password_hash,
                is_active
            FROM client_users
            WHERE email = :email

        """),
        {"email": email},
    ).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not row.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client user is inactive",
        )

    if not verify_password(password, row.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Update last login timestamp
    db.execute(
        text("""
            UPDATE client_users
            SET last_login_at = NOW()
            WHERE id = :id
        """),
        {"id": row.id},
    )

    token = create_client_user_token(
        client_user_id=row.id,
        db=db,
    )

    db.commit()

    return {
        "client_user_id": row.id,
        "email": row.email,
      
        "access_token": token,
        "token_type": "bearer",
    }
