# src/api/routes/stripe.py

import os
import stripe
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.API_USER.client_user_tokens import get_client_user_session
from src.api.db import get_db
from src.api.models import UserPayment
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

router = APIRouter(prefix="/api/stripe", tags=["stripe"])
PRICE_TABLE = {
    "tariff_basic": {
        "name": "Tariff Calculator Pro",
        "amount_cents": 9900,
    }
}

class CreateCheckoutRequest(BaseModel):
    product_key: str

@router.post("/checkout")
def create_checkout(
    payload: CreateCheckoutRequest,
    session=Depends(get_client_user_session),
):
    client_user_id = session.get("client_user_id")
    if not client_user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    product = PRICE_TABLE.get(payload.product_key)
    if not product:
        raise HTTPException(status_code=400, detail="Invalid product")
    FRONTEND_URL = os.environ["FRONTEND_URL"]
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
            "client_user_id": str(client_user_id),
            "product_key": payload.product_key,
        },

        success_url=f"{FRONTEND_URL}/payment/success",
        cancel_url=f"{FRONTEND_URL}/payment/cancel",
    )

    return {"url": stripe_session.url}
    
@router.get("/status")
def stripe_status(
    session=Depends(get_client_user_session),
    db: Session = Depends(get_db),
):
    client_user_id = session.get("client_user_id")
    if not client_user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    paid = (
        db.query(UserPayment)
        .filter(
            UserPayment.client_user_id == client_user_id,
            UserPayment.status == "paid",
        )
        .first()
        is not None
    )

    return {"paid": paid}
 
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
        session_obj = event["data"]["object"]

        client_user_id = session_obj["metadata"].get("client_user_id")
        stripe_session_id = session_obj["id"]

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
            client_user_id=client_user_id,
            stripe_session_id=stripe_session_id,
            stripe_customer_id=session_obj.get("customer"),
            amount_cents=session_obj["amount_total"],
            currency=session_obj["currency"],
            status="paid",
        )

        db.add(payment)
        db.commit()

        print(f"✅ Payment recorded for client_user {client_user_id}")

    return {"status": "ok"}