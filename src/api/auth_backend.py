from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID
from src.api.db import get_db, SessionLocal
from src.api.models import User
from src.api.cli.admin_cli import get_conn
from src.api.cli.authentication import verify_password
from src.api.cli.auth_service import generate_token, verify_token
from src.api.cli.email_service import send_auth_token_email
from src.api.cli.tokens import (
    create_access_token,
    get_user_by_token,
    revoke_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

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

class LoginRequest(BaseModel):
    email: str
    password: str
    otp: str | None = None

from fastapi import Request

def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    # ✅ Allow CORS preflight
    if request.method == "OPTIONS":
        return None

    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    user = get_user_by_token(credentials.credentials, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user

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

    access_token = create_access_token(
        user_uid=str(user_id),
        db=db,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
    
@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing token")

    revoke_token(credentials.credentials, db)
    return {"status": "logged_out"}

def fetch_user_tenants(email):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.tenant_id, t.name
                FROM users u
                JOIN tenants t ON t.id = u.tenant_id
                WHERE u.email = %s AND u.is_active = TRUE
                """,
                (email,),
            )
            return cur.fetchall()



def login_user():
    email = input("Email: ").strip().lower()
    password = input("Password: ").strip()

    tenants = fetch_user_tenants(email)
    if not tenants:
        print("Invalid credentials")
        return None

    user_id, tenant_id, tenant_name = tenants[0]

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT password_hash FROM users WHERE id = %s",
                (user_id,)
            )
            if not verify_password(password, cur.fetchone()[0]):
                print("Invalid credentials")
                return None

    token = generate_token(email)
    send_auth_token_email(email, token)

    otp = input("Enter email token: ").strip()
    if not verify_token(email, otp):
        print("Invalid or expired token")
        return None
    # Create API session token (bearer token)
    db = SessionLocal()
    access_token = create_access_token(
        user_uid=str(user_id),  # IMPORTANT: must match users.uid
        db=db
    )
    db.close()

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET last_login_at = %s WHERE id = %s",
                (datetime.now(timezone.utc), user_id)
            )
            conn.commit()

    roles = fetch_user_roles(user_id)

    return {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "tenant_name": tenant_name,
        "email": email,
        "roles": roles,
        "access_token": access_token,  
    }

from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import Depends

@router.get("/me")
def get_me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tenant = db.execute(
        text("SELECT name FROM tenants WHERE id = :id"),
        {"id": user.tenant_id},
    ).fetchone()

    if not tenant:
        raise HTTPException(status_code=500, detail="Tenant not found")

    roles = fetch_user_roles(user.id)

    return {
        "user_id": user.id,
        "email": user.email,
        "tenant_id": user.tenant_id,
        "tenant_name": tenant.name,
        "roles": roles,
        "active_role": roles[0],
    }

def main():
    session = login_user()
    if session:
        print("Login successful")
        print(session)


if __name__ == "__main__":
    main()
