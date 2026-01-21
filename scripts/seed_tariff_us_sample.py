
import os
import sys
from datetime import datetime
from sqlalchemy.orm import Session

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.api.db import SessionLocal
from src.api.models_tariff import HSCode, TariffSchedule, TariffLine


def main():
    db: Session = SessionLocal()

    schedule = (
        db.query(TariffSchedule)
        .filter(
            TariffSchedule.country == "US",
            TariffSchedule.name == "HTSUS 2026 (sample)",
        )
        .first()
    )
    if not schedule:
        schedule = TariffSchedule(
            country="US",
            name="HTSUS 2026 (sample)",
            effective_from=datetime(2026, 1, 1),
            source_url="https://hts.usitc.gov",
        )
        db.add(schedule)
        db.commit()
        db.refresh(schedule)

    
    sample_hs = [
        ("847130", "Portable automatic data processing machines, laptops"),
        ("851712", "Telephones for cellular networks or other wireless networks"),
    ]

    hs_map = {}
    for code, desc in sample_hs:
        hs = db.query(HSCode).filter(HSCode.code == code).first()
        if not hs:
            hs = HSCode(code=code, description=desc, chapter=code[:2])
            db.add(hs)
            db.commit()
            db.refresh(hs)
        hs_map[code] = hs

    
    mfn_rates = {
        "847130": 0.0,
        "851712": 0.0,
    }

    for code, hs in hs_map.items():
        existing = (
            db.query(TariffLine)
            .filter(
                TariffLine.tariff_schedule_id == schedule.id,
                TariffLine.hs_code_id == hs.id,
                TariffLine.duty_type == "MFN",
            )
            .first()
        )
        if existing:
            continue

        line = TariffLine(
            tariff_schedule_id=schedule.id,
            hs_code_id=hs.id,
            duty_type="MFN",
            rate_type="AD_VALOREM",
            rate_value=mfn_rates.get(code, 0.0) * 100,  
            applies_on="CIF",
            priority=1,
        )
        db.add(line)

    db.commit()
    db.close()
    print("Seeded sample US HTS data.")


if __name__ == "__main__":
    main()
