# scripts/tariff_tables.py
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.api.db import engine, Base
from src.api import models  # existing models (this is why you see "Loaded models.py (end)")
from src.api import models_tariff  # import tariff models so they register on Base


def main():
    # Log visible tables before creation
    print("Tables BEFORE create_all:", Base.metadata.tables.keys())

    Base.metadata.create_all(
        bind=engine,
        tables=[
            models_tariff.HSCode.__table__,
            models_tariff.TariffSchedule.__table__,
            models_tariff.TariffCalculationLog.__table__,
        ],
    )

    print("Tables AFTER create_all:", Base.metadata.tables.keys())
    print("Tariff tables created (if they didn't already exist).")


if __name__ == "__main__":
    main()
