# update_supplier_port.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.api.models import SupplierProfile

# --- DATABASE CONNECTION ---
DATABASE_URL = "sqlite:///./suppliers.db"   # change if using postgres

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def update_export_port(supplier_id: int, new_port: str):
    db = SessionLocal()

    try:
        profile = (
            db.query(SupplierProfile)
            .filter(SupplierProfile.supplier_id == supplier_id)
            .first()
        )

        if not profile:
            print(f"Supplier profile not found for supplier_id={supplier_id}")
            return

        print(f"Current port: {profile.export_port}")

        profile.export_port = new_port

        db.commit()

        print(f"Updated export port to: {new_port}")

    except Exception as e:
        db.rollback()
        print("Error updating port:", e)

    finally:
        db.close()


# --- RUN SCRIPT ---
if __name__ == "__main__":
    supplier_id = 2       
    new_port = "TORONTO"  

    update_export_port(supplier_id, new_port)