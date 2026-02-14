from uuid import UUID
from src.api.db import SessionLocal
from src.api.models import UserPayment
import uuid

db = SessionLocal()

client_user_id = UUID("de893ab1-4a9b-46c8-b1d8-e4e3fbf83430")

payment = UserPayment(
    client_user_id=client_user_id,
    stripe_session_id=f"manual_cli_{uuid.uuid4()}",
    stripe_customer_id=None,
    amount_cents=0,
    currency="usd",
    status="paid",
)

db.add(payment)
db.commit()

print("✅ User marked as PAID")
