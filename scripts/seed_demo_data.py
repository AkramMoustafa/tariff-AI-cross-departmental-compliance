
import sys
import os
from datetime import datetime

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

from src.api.db import SessionLocal, engine
from src.api.models_tariff import TariffSchedule, HSCode, TariffLine
from src.api.models import Base

def seed_data():
    db = SessionLocal()
    print("🌱 Seeding Demo Data (China Chips)...")

    try:
        # 1. Ensure tables exist
        Base.metadata.create_all(bind=engine)

        # 2. Create/Get the US Schedule
        schedule = db.query(TariffSchedule).filter_by(name="US Demo Schedule").first()
        if not schedule:
            schedule = TariffSchedule(
                country="US",
                name="US Demo Schedule",
                effective_from=datetime(2024, 1, 1),
                source_url="https://hts.usitc.gov"
            )
            db.add(schedule)
            db.commit()
            db.refresh(schedule)
            print("   ✅ Created Schedule: US Demo Schedule")

        # 3. Add the HS Code (8542.31)
        hs_code_str = "854231"
        hs_obj = db.query(HSCode).filter_by(code=hs_code_str).first()
        
        if not hs_obj:
            hs_obj = HSCode(
                code=hs_code_str,
                description="Electronic integrated circuits: Processors and controllers",
                chapter="85" # Correct field from your models_tariff.py
            )
            db.add(hs_obj)
            db.commit()
            db.refresh(hs_obj)
            print(f"   ✅ Created HS Code: {hs_code_str}")

        # 4. Add the 25% Trade War Tariff (Line Item)
        # Check if it exists first
        existing_line = db.query(TariffLine).filter_by(
            tariff_schedule_id=schedule.id,
            hs_code_id=hs_obj.id,
            origin_country="CN"
        ).first()

        if not existing_line:
            line = TariffLine(
                tariff_schedule_id=schedule.id,
                hs_code_id=hs_obj.id,
                duty_type="SECTION_301",
                rate_type="AD_VALOREM",
                rate_value=25.0, # 25.0 means 25% in your engine.py logic
                priority=10,     # High priority
                origin_country="CN",
                applies_on="CIF"
            )
            db.add(line)
            db.commit()
            print("   ✅ Added 25% Tariff Line for China -> US")
        else:
            print("   ℹ️ Tariff line already exists.")

        print("\n✅ DEMO DATA READY!")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()