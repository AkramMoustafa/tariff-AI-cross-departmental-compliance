# scripts/import_htsus_mfn_2025.py
import os
import sys
import csv
from datetime import datetime
from sqlalchemy.orm import Session

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.api.db import SessionLocal
from src.api.models_tariff import HSCode, TariffSchedule, TariffLine


CSV_PATH = os.path.join(PROJECT_ROOT, "data", "tariff_database_2025.txt")


def parse_date(s: str) -> datetime | None:
    s = (s or "").strip()
    if not s:
        return None
    for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%Y%m%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def main():
    db: Session = SessionLocal()

    # 1) Create/lookup schedule
    schedule = (
        db.query(TariffSchedule)
        .filter(
            TariffSchedule.country == "US",
            TariffSchedule.name == "HTSUS 2025 MFN",
        )
        .first()
    )
    if not schedule:
        schedule = TariffSchedule(
            country="US",
            name="HTSUS 2025 MFN",
            effective_from=datetime(2025, 1, 1),
            source_url="https://hts.usitc.gov",
        )
        db.add(schedule)
        db.commit()
        db.refresh(schedule)

    created = 0
    skipped = 0

    with open(CSV_PATH, newline="", encoding="cp1252", errors="replace") as f:
        reader = csv.DictReader(f, delimiter=",")

        for row in reader:
            code_raw = row.get("hts8", "")
            desc = row.get("brief_description", "")
            rate_type_code = (row.get("mfn_rate_type_code") or "").strip()
            ad_val_str = row.get("mfn_ad_val_rate") or ""
            spec_str = row.get("mfn_specific_rate") or ""
            begin_str = row.get("begin_effect_date") or ""
            end_str = row.get("end_effective_date") or ""

            code = code_raw.replace(".", "").strip()
            if not code:
                continue

            # Determine rate_type + rate_value
            rate_type_enum = None
            rate_value = None

            if rate_type_code == "0":
                # Free
                rate_type_enum = "AD_VALOREM"
                rate_value = 0.0
            elif rate_type_code == "7":
                # Ad valorem: mfn_ad_val_rate is like 0.045 for 4.5%
                try:
                    rate_value = float(ad_val_str) * 100.0
                    rate_type_enum = "AD_VALOREM"
                except (TypeError, ValueError):
                    pass
            elif rate_type_code in {"1", "2"}:
                # Specific: per unit (e.g. $/kg, cents/kg, per head)
                try:
                    rate_value = float(spec_str)
                    rate_type_enum = "SPECIFIC"
                except (TypeError, ValueError):
                    pass

            if rate_type_enum is None or rate_value is None:
                skipped += 1
                continue

            # Upsert HSCode
            hs = db.query(HSCode).filter(HSCode.code == code).first()
            if not hs:
                hs = HSCode(
                    code=code,
                    description=desc,
                    chapter=code[:2] if len(code) >= 2 else None,
                )
                db.add(hs)
                db.commit()
                db.refresh(hs)

            # Avoid duplicate MFN line for same schedule + HS
            exists = (
                db.query(TariffLine)
                .filter(
                    TariffLine.tariff_schedule_id == schedule.id,
                    TariffLine.hs_code_id == hs.id,
                    TariffLine.duty_type == "MFN",
                )
                .first()
            )
            if exists:
                continue

            line = TariffLine(
                tariff_schedule_id=schedule.id,
                hs_code_id=hs.id,
                duty_type="MFN",
                rate_type=rate_type_enum,   # "AD_VALOREM" or "SPECIFIC"
                rate_value=rate_value,      # percent or per unit
                applies_on="CIF",
                priority=1,
            )

            db.add(line)
            created += 1

    db.commit()
    db.close()
    print(f"Imported HTSUS 2025 MFN: created={created}, skipped_no_simple_rate={skipped}")


if __name__ == "__main__":
    main()
