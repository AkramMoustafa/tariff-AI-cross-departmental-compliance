import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.getcwd())

from src.api.db import SessionLocal, engine
from src.api.models_tariff import TariffSchedule, HSCode 
from src.api.models import Base

def seed_data():
    db = SessionLocal()
    print("🌱 Seeding Tariff Data...")

    try:
        # 1. Ensure tables exist
        Base.metadata.create_all(bind=engine)

        # 2. Add the HS Code (8542.31)
        hs_code = "854231"
        existing_code = db.query(HSCode).filter_by(code=hs_code).first()
        
        if not existing_code:
            new_code = HSCode(
                code=hs_code,
                # REMOVED 'section' and 'chapter' to prevent TypeError
                description="Electronic integrated circuits: Processors and controllers"
            )
            db.add(new_code)
            db.commit()
            print(f"   ✅ Added HS Code: {hs_code}")
        else:
            print(f"   ℹ️ HS Code {hs_code} already exists.")

        # 3. Add the Tariff (25% Rate)
        existing_tariff = db.query(TariffSchedule).filter_by(
            hs_code=hs_code,
            origin_country="CN",
            destination_country="US"
        ).first()

        if not existing_tariff:
            tariff = TariffSchedule(
                hs_code=hs_code,
                origin_country="CN",
                destination_country="US",
                rate=0.25,  # 25% Tariff
                effective_date=datetime(2024, 1, 1),
                authority="US Section 301",
                notes="Trade War Tariff on Semiconductors"
            )
            db.add(tariff)
            db.commit()
            print("   ✅ Added 25% Tariff (CN -> US)")
        else:
            print("   ℹ️ Tariff already exists.")

        print("\n✅ SEEDING COMPLETE! Your API is ready.")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()