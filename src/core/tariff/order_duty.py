
from sqlalchemy.orm import Session
from src.core.tariff.engine import calculate_tariff
from src.api.models import SupplierOrder, Supplier  # adjust import path
from src.api.models_tariff import HSCode, TariffSchedule, TariffLine, TariffCalculationLog

def calculate_order_duty(db: Session, order: SupplierOrder, supplier: Supplier):
    hs_code = (supplier.tariff_code or "").replace(".", "").strip() or "01013000"
    origin_country = (supplier.country or "CN").upper()
    destination_country = "US"  # later from workspace/company settings
    customs_value = float(order.total_value or 0.0)

    if customs_value <= 0:
        return

    schedule = (
        db.query(TariffSchedule)
        .filter(TariffSchedule.country == destination_country)
        .order_by(TariffSchedule.effective_from.desc())
        .first()
    )
    if not schedule:
        return

    hs = db.query(HSCode).filter(HSCode.code == hs_code).first()
    if not hs:
        return

    lines = (
        db.query(TariffLine)
        .filter(
            TariffLine.tariff_schedule_id == schedule.id,
            TariffLine.hs_code_id == hs.id,
        )
        .all()
    )
    if not lines:
        return

    engine_input = [
        {
            "duty_type": line.duty_type,
            "rate_type": line.rate_type,
            "rate_value": line.rate_value,
            "priority": line.priority or 100,
        }
        for line in lines
    ]

    result = calculate_tariff(
        tariff_lines=engine_input,
        customs_value=customs_value,
        freight=0.0,
        insurance=0.0,
        quantity=1.0,
    )

    log = TariffCalculationLog(
        user_uid=order.user_uid,
        hs_code=hs_code,
        origin_country=origin_country,
        destination_country=destination_country,
        customs_value=customs_value,
        freight=0.0,
        insurance=0.0,
        quantity=1.0,
        currency=order.currency,
        result_json=result,
        total_duty=result["total_duty"],
        effective_rate=result["effective_rate"],
        tariff_schedule_id=schedule.id,
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    order.estimated_duty = result["total_duty"]
    order.duty_effective_rate = result["effective_rate"]
    order.tariff_log_id = log.id
    db.add(order)
    db.commit()
