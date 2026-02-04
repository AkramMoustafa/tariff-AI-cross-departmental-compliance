from sqlalchemy import create_engine, text
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def normalize_hs(hs: str) -> str:
    """
    Normalize HS codes by removing dots and whitespace.
    Example: 8504.40.00 -> 85044000
    """
    if not hs:
        return ""
    return hs.replace(".", "").strip()

def is_subject_to_section301(hs_code: str, origin_country: str) -> bool:
    """
    Returns True if:
    - Origin is China (CN)
    - HS code exists in section301_scope
    """

    origin_country = origin_country.upper()
    hs_code = normalize_hs(hs_code)

    # Section 301 applies ONLY to China
    if origin_country != "CN":
        return False

    sql = text("""
        SELECT 1
        FROM section301_scope
        WHERE REPLACE("HTS_Code", '.', '') LIKE :hs_prefix || '%'
        LIMIT 1
    """)

    with engine.connect() as conn:
        result = conn.execute(
            sql,
            {"hs_prefix": hs_code}
        ).first()

    return result is not None
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
def get_section301_duty(hs_code: str, origin_country: str) -> dict | None:
    """
    Returns Section 301 duty details if applicable, otherwise None
    """

    origin_country = origin_country.upper()
    hs_code = normalize_hs(hs_code)

    if not is_subject_to_section301(hs_code, origin_country):
        return None

    # Step 1: find the Chapter 99 code mapped to this HS
    scope_sql = text("""
        SELECT "Chapter99_Code"
        FROM section301_scope
        WHERE REPLACE("HTS_Code", '.', '') LIKE :hs_prefix || '%'
        ORDER BY LENGTH("HTS_Code") DESC
        LIMIT 1
    """)

    with engine.connect() as conn:
        scope_row = conn.execute(
            scope_sql,
            {"hs_prefix": hs_code}
        ).first()

    if not scope_row:
        return None

    chapter99_code = scope_row.Chapter99_Code

    # Step 2: pull Chapter 99 legal text
    chapter99_sql = text("""
        SELECT
            "HTS Number"      AS chapter_99_code,
            "Description"    AS description,
            "General Rate of Duty" AS additional_duties
        FROM section301_chapter99
        WHERE "HTS Number" = :chapter99
        LIMIT 1
    """)

    with engine.connect() as conn:
        chapter99_row = conn.execute(
            chapter99_sql,
            {"chapter99": chapter99_code}
        ).first()

    if not chapter99_row:
        return None

    return {
        "applies": True,
        "legal_basis": "USTR Section 301",
        "origin_country": origin_country,
        "hs_code": hs_code,
        "chapter_99_code": chapter99_row.chapter_99_code,
        "additional_duties_text": chapter99_row.additional_duties,
        "legal_description": chapter99_row.description,
        "explanation": (
            "Product is listed under USTR Section 301 and originates in China. "
            "An additional duty applies under HTSUS Chapter 99."
        )
    }

if __name__ == "__main__":
    
    hs = "1213.00.00.10"
    origin = "CN"

    normalized_hs = normalize_hs(hs)
    hs_8_digit = get_8_digit_hts(normalized_hs)
    hs = hs_8_digit
    if is_subject_to_section301(hs, origin):
        duty = get_section301_duty(hs, origin)
        print("✅ Section 301 applies:")
        print(duty)
    else:
        print("❌ No Section 301 duty applies.")
