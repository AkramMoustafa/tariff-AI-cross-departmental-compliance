from sqlalchemy import create_engine, text
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def normalize_hs(hs: str) -> str:
    if not hs:
        return ""
    return hs.replace(".", "").strip()

def get_8_digit_hts(hs_code: str) -> str:
    """
    Returns the 8-digit HTSUS code used for Section 301 scope checks.
    - If input is 10 digits → truncate to 8
    - If input is 8 digits → unchanged
    - If shorter → unchanged
    """
    hs = normalize_hs(hs_code)

    if len(hs) >= 10:
        return hs[:8]

    return hs
    
def is_subject_to_section301(hs_code: str, origin_country: str) -> bool:
    """
    Returns True if the HS code is covered by Section 301 AND origin is China.
    """

    hs_code = normalize_hs(hs_code)
    origin_country = origin_country.upper()

    # Section 301 applies ONLY to China
    if origin_country != "CN":
        return False

    sql = text("""
        SELECT 1
        FROM section301_scope
        WHERE hs_code = :hs_code
        LIMIT 1
    """)

    with engine.connect() as conn:
        result = conn.execute(sql, {"hts_code": hts_code}).first()

    return result is not None

def get_section301_duty(hs_code: str, origin_country: str) -> dict | None:
    """
    Returns Section 301 duty details if applicable, otherwise None
    """

    hs_code = normalize_hs(hs_code)
    origin_country = origin_country.upper()

    if not is_subject_to_section301(hs_code, origin_country):
        return None

    sql = text("""
        SELECT
            c.chapter_99_code,
            c.rate,
            c.rate_type,
            c.description
        FROM section301_chapter99 c
        ORDER BY c.chapter_99_code
        LIMIT 1
    """)

    with engine.connect() as conn:
        row = conn.execute(sql).first()

    if not row:
        return None

    return {
        "applies": True,
        "origin_country": origin_country,
        "chapter_99_code": row.chapter_99_code,
        "additional_rate": row.rate,
        "rate_type": row.rate_type,
        "legal_description": row.description,
        "explanation": (
            "Product is listed under USTR Section 301 and originates in China. "
            "An additional duty applies under HTSUS Chapter 99."
        )
    }
