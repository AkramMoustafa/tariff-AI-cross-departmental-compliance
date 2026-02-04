from src.api.db import engine
from src.api.models import TariffLine

print(" Fixing database schema...")


try:
    TariffLine.__table__.drop(engine)
    print("    Dropped old 'tariff_lines' table.")
except Exception as e:
    print(f"   ℹ️ Table might not exist or couldn't be dropped: {e}")


try:
    TariffLine.__table__.create(engine)
    print("    Created new 'tariff_lines' table with correct schema.")
except Exception as e:
    print(f"    Creation failed: {e}")

print(" Ready to import data.")