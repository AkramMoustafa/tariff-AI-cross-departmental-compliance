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
    text,
)
from sqlalchemy.orm import Session, sessionmaker, declarative_base
from dotenv import load_dotenv

def drop_tariffs_table():
    print("DROPPING tariffs_basic_data...")
    with engine.begin() as conn:
        conn.execute(text("""
            DROP TABLE IF EXISTS public.fta_programs CASCADE;
        """))
        conn.execute(text("""
            DROP TABLE IF EXISTS public.agoa_countries CASCADE;
        """))
        conn.execute(text("""
            DROP TABLE IF EXISTS public.cbi_countries CASCADE;
        """))
    print("✅ DROP COMPLETE")

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class FTAProgram(Base):
    __tablename__ = "fta_programs"

    id = Column(Integer, primary_key=True)
    program_code = Column(String(10), index=True)   # A, AU, CL, etc.
    program_name = Column(Text)
    country_code = Column(String(2), index=True)
    country_name = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())


class AGOAProgram(Base):
    __tablename__ = "agoa_countries"

    id = Column(Integer, primary_key=True)
    country_code = Column(String(2), index=True)
    country_name = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())


class CBIProgram(Base):
    __tablename__ = "cbi_countries"
    path="cbi_beneficiaries.csv",
    id = Column(Integer, primary_key=True)
    country_code = Column(String(2), index=True)
    country_name = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

def ingest_csv(
    csv_path: str,
    model,
    column_map: dict,
    truncate: bool = True,
):
    print(f"\n📥 Ingesting {csv_path} → {model.__tablename__}")

    Base.metadata.create_all(bind=engine)

    if truncate:
        with engine.begin() as conn:
            conn.execute(
                text(f"TRUNCATE TABLE {model.__tablename__} RESTART IDENTITY CASCADE;")
            )
        print(f"🧹 {model.__tablename__} truncated")

    df = pd.read_csv(csv_path, dtype=str).fillna("")

    # Normalize column names
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    # Rename columns to model fields
    df = df.rename(columns=column_map)

    db: Session = SessionLocal()
    try:
        rows = []
        for _, r in df.iterrows():
            rows.append(
                model(**{k: r.get(k) for k in column_map.values()})
            )

        db.bulk_save_objects(rows)
        db.commit()
        print(f"✅ Imported {len(rows)} rows into {model.__tablename__}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def run():
    ingest_csv(
        csv_path="fta_programs.csv",
        model=FTAProgram,
        column_map={
            "program_code": "program_code",
            "program_name": "program_name",
            "country_code": "country_code",
            "country_name": "country_name",
        },
    )

    ingest_csv(
        csv_path="agoa_beneficiaries.csv",
        model=AGOAProgram,
        column_map={
            "country_code": "country_code",
            "country_name": "country_name",
        },
    )

    ingest_csv(
        csv_path="cbi_beneficiaries.csv",
        model=CBIProgram,
        column_map={
            "country_code": "country_code",
            "country_name": "country_name",
        },
    )

if __name__ == "__main__":
    run()
