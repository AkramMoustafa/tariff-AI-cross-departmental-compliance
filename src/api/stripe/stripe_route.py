# src/api/routes/stripe.py

import os
import stripe
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.API_USER.client_user_tokens import get_client_user_session
from src.api.db import get_db
from src.api.models import UserPayment

# --------------------------------
# Stripe config
# --------------------------------
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

router = APIRouter(prefix="/api/stripe", tags=["stripe"])


# --------------------------------
# Pricing (SERVER CONTROLLED)
# --------------------------------
PRICE_TABLE = {
    "tariff_basic": {
        "name": "Tariff Calculator Pro",
        "amount_cents": 9900,
    }
}


# --------------------------------
# Request Models
# --------------------------------
class CreateCheckoutRequest(BaseModel):
    product_key: str


# --------------------------------
# Checkout
# --------------------------------
@router.post("/checkout")
def create_checkout(
    payload: CreateCheckoutRequest,
    session=Depends(get_client_user_session),
):
    # 🔑 IMPORTANT: this is the correct key
    client_user_id = session.get("client_user_id")
    if not client_user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    product = PRICE_TABLE.get(payload.product_key)
    if not product:
        raise HTTPException(status_code=400, detail="Invalid product")

    stripe_session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": product["name"],
                    },
                    "unit_amount": product["amount_cents"],
                },
                "quantity": 1,
            }
        ],
        metadata={
            # store client-user id explicitly
            "client_user_id": str(client_user_id),
            "product_key": payload.product_key,
        },
        success_url="http://localhost:5173/payment/success",
        cancel_url="http://localhost:5173/payment/cancel",
    )

    return {"url": stripe_session.url}


# --------------------------------
# Payment Status (USED BY FRONTEND)
# --------------------------------
@router.get("/status")
def stripe_payment_status(
    session=Depends(get_client_user_session),
    db: Session = Depends(get_db),
):
    client_user_id = session.get("client_user_id")
    if not client_user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    paid = (
        db.query(UserPayment)
        .filter(
            UserPayment.user_id == client_user_id,
            UserPayment.status == "paid",
        )
        .first()
        is not None
    )

    return {"paid": paid}


# --------------------------------
# Webhook (SOURCE OF TRUTH)
# --------------------------------
@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig,
            os.environ["STRIPE_WEBHOOK_SECRET"],
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        client_user_id = session["metadata"].get("client_user_id")
        stripe_session_id = session["id"]

        if not client_user_id:
            return {"status": "missing_client_user"}

        exists = (
            db.query(UserPayment)
            .filter(UserPayment.stripe_session_id == stripe_session_id)
            .first()
        )
        if exists:
            return {"status": "duplicate"}

        payment = UserPayment(
            user_id=client_user_id,
            stripe_session_id=stripe_session_id,
            stripe_customer_id=session.get("customer"),
            amount_cents=session["amount_total"],
            currency=session["currency"],
            status="paid",
        )

        db.add(payment)
        db.commit()

        print(f"✅ Payment recorded for client_user {client_user_id}")

    return {"status": "ok"}