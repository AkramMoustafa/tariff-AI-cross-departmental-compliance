import os
import sys
import uuid
# Make project root importable so `src` works
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from src.api.main_api import app
from src.api.auth_backend import get_current_user
from src.api.models import User, Supplier
from src.api.models_tariff import HSCode, TariffSchedule, TariffLine
from src.api.db import SessionLocal
from datetime import datetime


# Add project root to sys.path so 'src' package is importable


client = TestClient(app)


def override_get_current_user():
    return User(uid="test-user", email="test@example.com")


app.dependency_overrides[get_current_user] = override_get_current_user


def ensure_test_supplier_and_tariff():
    db = SessionLocal()
    try:
        # Supplier
        supplier = (
            db.query(Supplier)
            .filter(Supplier.id == 1, Supplier.user_uid == "test-user")
            .first()
        )
        if not supplier:
            supplier = Supplier(
                id=1,
                name="Test Supplier",
                email="test-supplier@example.com",
                industry="Test",
                region="Test",
                country="CN",
                user_uid="test-user",
                tariff_code="01013000",
            )
            db.add(supplier)
            db.commit()
            db.refresh(supplier)

        # HS code
        hs = db.query(HSCode).filter(HSCode.code == "01013000").first()
        if not hs:
            hs = HSCode(
                code="01013000",
                description="Live horses, other than pure-bred breeding animals",
                chapter="01",
            )
            db.add(hs)
            db.commit()
            db.refresh(hs)

        # Tariff schedule for US
        schedule = (
            db.query(TariffSchedule)
            .filter(TariffSchedule.country == "US")
            .order_by(TariffSchedule.effective_from.desc())
            .first()
        )
        if not schedule:
            schedule = TariffSchedule(
                country="US",
                name="US MFN Test Schedule",
                effective_from=datetime(2020, 1, 1),
                effective_to=None,
                source_url="test",
            )
            db.add(schedule)
            db.commit()
            db.refresh(schedule)

        # Tariff line linking schedule + HS with simple ad-valorem duty
        line = (
            db.query(TariffLine)
            .filter(
                TariffLine.tariff_schedule_id == schedule.id,
                TariffLine.hs_code_id == hs.id,
            )
            .first()
        )
        if not line:
            line = TariffLine(
                tariff_schedule_id=schedule.id,
                hs_code_id=hs.id,
                duty_type="MFN",
                rate_type="AD_VALOREM",
                rate_value=5.0,  # 5% duty
                specific_uom=None,
                applies_on="CIF",
                priority=1,
                origin_country=None,
            )
            db.add(line)
            db.commit()
    finally:
        db.close()



def test_create_order_sets_duty():
    ensure_test_supplier_and_tariff()

    order_number = f"TEST-{uuid.uuid4()}"  # unique every run

    payload = {
        "supplier_id": 1,
        "order_number": order_number,
        "expected_delivery_date": "2026-01-31T00:00:00Z",
        "item_count": 10,
        "total_value": 10000.0,
        "currency": "USD",
        "stock_availability_on_order": True,
    }

    response = client.post("/api/orders/", json=payload)
    assert response.status_code in (200, 201)
    data = response.json()

    assert data["estimated_duty"] is not None
    assert data["duty_effective_rate"] is not None
    assert data["estimated_duty"] > 0
    assert data["duty_effective_rate"] > 0
