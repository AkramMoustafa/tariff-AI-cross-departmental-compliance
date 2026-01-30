import uuid
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.requests import Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.api.db import get_db, SessionLocal
from src.api.models import User, AuthToken  # Combine these imports
from src.api.cli.admin_cli import get_conn
from src.api.cli.authentication import verify_password
from src.api.cli.auth_service import generate_token, verify_token
from src.api.cli.email_service import send_auth_token_email

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

# Pydantic Models for Requests
class LoginRequest(BaseModel):
    email: str
    password: str
    otp: str | None = None

class SetActiveRolePayload(BaseModel):
    role: str

# Helper Functions
def fetch_user_roles(user_id: UUID) -> list[str]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.name
                FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE ur.user_id = %s
                """,
                (user_id,),
            )
            return [row[0] for row in cur.fetchall()]

def fetch_user_tenants(email: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.tenant_id, t.name
                FROM users u
                JOIN tenants t ON t.id = u.tenant_id
                WHERE u.email = %s
                  AND u.is_active = TRUE
                """,
                (email,),
            )
            return cur.fetchall()

# Dependency to get current user
def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    if request.method == "OPTIONS":
        return None
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing Authorization header") 
    
    token_str = credentials.credentials
    
    # Direct Postgres query using SQLAlchemy
    token_record = db.query(AuthToken).filter(
        AuthToken.token == token_str,
        AuthToken.revoked == False,
        AuthToken.expires_at > datetime.utcnow()
    ).first()

    if not token_record:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return token_record.user

# --- API ENDPOINTS ---

@router.post("/login")
def login_api(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()

    tenants = fetch_user_tenants(email)
    if not tenants:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id, tenant_id, tenant_name = tenants[0]

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT password_hash FROM users WHERE id = %s",
                (user_id,),
            )
            row = cur.fetchone()
            if not row or not verify_password(payload.password, row[0]):
                raise HTTPException(status_code=401, detail="Invalid credentials")

    # 1. Generate a secure random token string
    token_str = f"api_{uuid.uuid4().hex}_{uuid.uuid4().hex}"

    # 2. Save the token to the PostgreSQL auth_tokens table
    new_token = AuthToken(
        user_uid=user_id,
        token=token_str,
        expires_at=datetime.utcnow() + timedelta(days=30),
        revoked=False
    )
    
    try:
        db.add(new_token)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

    return {
        "access_token": token_str,
        "token_type": "bearer",
    }

@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token_record = db.query(AuthToken).filter(AuthToken.token == credentials.credentials).first()
    if token_record:
        token_record.revoked = True
        db.commit()
    
    return {"status": "logged_out"}

@router.get("/me")
def get_me(
    user: User | None = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    tenant = db.execute(
        text("SELECT name FROM tenants WHERE id = :id"),
        {"id": user.tenant_id},
    ).fetchone()

    if not tenant:
        raise HTTPException(status_code=500, detail="Tenant not found")

    roles = fetch_user_roles(user.id)

    return {
        "user_id": str(user.id),
        "email": user.email,
        "tenant_id": str(user.tenant_id),
        "tenant_name": tenant.name,
        "roles": roles,
        "active_role": user.active_role,
    }

@router.post("/set-active-role")
def set_active_role(
    payload: SetActiveRolePayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    roles = fetch_user_roles(user.id)
    if payload.role not in roles:
        raise HTTPException(status_code=403, detail="Role not assigned to user")

    db.execute(
        text("""
            UPDATE users
            SET active_role = :role
            WHERE id = :id
        """),
        {"role": payload.role, "id": user.id},
    )
    db.commit()
    return {"active_role": payload.role}

@router.post("/clear-active-role")
def clear_active_role(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.execute(
        text("UPDATE users SET active_role = NULL WHERE id = :id"),
        {"id": user.id},
    )
    db.commit()
    return {"active_role": None}