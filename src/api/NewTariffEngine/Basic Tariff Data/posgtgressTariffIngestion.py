import os
import pandas as pd
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    TIMESTAMP,
    func,
    create_engine,
)
from sqlalchemy.orm import Session, sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

from sqlalchemy import text
def drop_tariffs_table():
    print("💣 DROPPING tariffs_basic_data...")
    with engine.begin() as conn:
        conn.execute(text("""
            DROP TABLE IF EXISTS public.tariffs_basic_data CASCADE;
        """))
    print("✅ DROP COMPLETE")

def clean_hs_cell(v):
    if v is None:
        return None
    s = str(v).strip()
    if s.endswith(".0"):
        s = s[:-2]
    return s if s else None

from sqlalchemy import text

def truncate_tariffs_table():
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE TABLE tariffs_basic_data RESTART IDENTITY CASCADE;"))
    print("🧹 tariffs_basic_data truncated")

def clean_text(v):
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None


def clean_units(v):
    if v is None:
        return None
    s = str(v)
    return s.replace('", "', '","').replace("'", '"')

RATE_COLUMNS = [
    "general_rate",
    "special_rate",
    "column2_rate",
    "quota_quantity",
    "additional_duties",
]

class HTSLine(Base):
    __tablename__ = "tariffs_basic_data"

    id = Column(Integer, primary_key=True)

    hts_number = Column(String)
    clean_hs = Column(String(12), nullable=True, index=True)
    level = Column(Integer, nullable=False)
    parent_code = Column(String(12), index=True)

    indent = Column(Integer)
    description = Column(Text)

    unit_of_quantity = Column(Text)
    general_rate = Column(Text)
    special_rate = Column(Text)
    column2_rate = Column(Text)
    special_programs = Column(Text)
    quota_quantity = Column(Text)
    additional_duties = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())

CSV_PATH = "output_hts_enriched.csv"
def normalize_programs(v):
    if v is None:
        return None

    s = str(v).strip()
    if s.lower() in {"nan", "", "none"}:
        return None

    programs = []
    for p in s.split("|"):
        p = p.strip()

        # Normalize CBP variants
        if p.startswith("E"):   # E or E*
            p = "E"
        if p.startswith("A"):   # A or A+
            p = "A"

        programs.append(p)

    return "|".join(sorted(set(programs)))

def import_hts_csv():
    drop_tariffs_table()      
    print("📥 Starting HTS ingestion...")
    Base.metadata.create_all(bind=engine)
    truncate_tariffs_table()

    df = pd.read_csv(
        CSV_PATH,
        low_memory=False,
        dtype=str
    )

    # 1️⃣ Normalize column names
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    # 2️⃣ Explicit column mapping (CRITICAL)
    COLUMN_RENAME_MAP = {
        "general_rate_of_duty": "general_rate",
        "special_rate_of_duty": "special_rate",
        "column_2_rate_of_duty": "column2_rate",
        "quota_quantity": "quota_quantity",
        "additional_duties": "additional_duties",
        "unit_of_quantity": "unit_of_quantity",
    }

    df = df.rename(columns=COLUMN_RENAME_MAP)

    # 3️⃣ Remove duplicate columns
    df = df.loc[:, ~df.columns.duplicated()]

    print("📌 Columns after normalization:")
    print(df.columns.tolist())

    # 4️⃣ HS hierarchy cleanup
    df["clean_hs"] = df["clean_hs"].apply(clean_hs_cell)
    df["parent_code"] = df["parent_code"].apply(clean_hs_cell)

    # 5️⃣ Text cleanup
    df["hts_number"] = df["hts_number"].apply(clean_text)
    df["description"] = df["description"].apply(clean_text)
    df["unit_of_quantity"] = df["unit_of_quantity"].apply(clean_units)

    for col in RATE_COLUMNS:
        if col in df.columns:
            df[col] = df[col].apply(clean_text)

    # 6️⃣ Numeric fields
    df = df[df["level"].notna()]
    df["level"] = df["level"].astype(int)
    df["indent"] = df["indent"].astype("Int64")
    if "special_programs" in df.columns:
        df["special_programs"] = df["special_programs"].apply(normalize_programs)
    # 🔍 SANITY CHECK (do NOT skip this)
    print(
        df[df["special_programs"].notna()][
            ["clean_hs", "special_programs"]
        ].head(20)
    )
    db: Session = SessionLocal()
    try:
        rows = []
        for _, r in df.iterrows():
           rows.append(
                HTSLine(
                    hts_number=r.get("hts_number"),
                    indent=r.get("indent"),
                    description=r.get("description"),
                    unit_of_quantity=r.get("unit_of_quantity"),
                    general_rate=r.get("general_rate"),
                    special_rate=r.get("special_rate"),
                    column2_rate=r.get("column2_rate"),

                    special_programs=r.get("special_programs"),  # ✅ ADD THIS

                    quota_quantity=r.get("quota_quantity"),
                    additional_duties=r.get("additional_duties"),
                    clean_hs=r.get("clean_hs"),
                    level=int(r["level"]),
                    parent_code=r.get("parent_code"),
                )
            )


        db.bulk_save_objects(rows)
        db.commit()
        print(f"✅ Imported {len(rows)} HTS lines")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import_hts_csv()
