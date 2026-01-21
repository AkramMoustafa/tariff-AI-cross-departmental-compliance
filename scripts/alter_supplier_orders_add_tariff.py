
import os
import sys
from sqlalchemy import text

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.api.db import engine  # same engine used in your app

def main():
    with engine.connect() as conn:
        # SQLite is lenient: FLOAT is fine
        conn.execute(text("ALTER TABLE supplier_orders ADD COLUMN estimated_duty FLOAT"))
        conn.execute(text("ALTER TABLE supplier_orders ADD COLUMN duty_effective_rate FLOAT"))
        conn.execute(text("ALTER TABLE supplier_orders ADD COLUMN tariff_log_id INTEGER"))
        conn.commit()

    print("Added duty columns to supplier_orders")

if __name__ == "__main__":
    main()
