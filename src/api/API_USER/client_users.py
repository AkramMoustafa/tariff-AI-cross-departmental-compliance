# src/api/routers/client_users.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from src.api.db import get_db
from src.api.API_USER.client_user_tokens import (
    register_client_user,
    login_client_user,
    get_client_user_session,
)

router = APIRouter(
    prefix="/api/client-users",
    tags=["client-users"],
)
class ClientUserSignup(BaseModel):

    email: EmailStr
    password: str


class ClientUserLogin(BaseModel):

    email: EmailStr
    password: str

@router.post("/signup")
def signup_client_user(
    payload: ClientUserSignup,
    db: Session = Depends(get_db),
):
    return register_client_user(

        email=payload.email,
        password=payload.password,
        db=db,
    )


@router.post("/login-user")
def login_client_user_route(
    payload: ClientUserLogin,
    db: Session = Depends(get_db),
):
    return login_client_user(

        email=payload.email,
        password=payload.password,
        db=db,
    )


@router.get("/me")
def get_current_client_user(
    session=Depends(get_client_user_session),
):
    """
    Requires:
    Authorization: Bearer cu_...
    """
    return session