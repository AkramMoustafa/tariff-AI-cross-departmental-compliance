from sqlalchemy import create_engine, text
import os
from src.api.NewTariffEngine.calctor_service import calculate_total_duty_payable
from src.api.NewTariffEngine.tariff_service import get_tariff_api
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def normalize_hs(hs: str) -> str:
    """Remove dots and whitespace from HS code"""
    if not hs:
        return ""
    return hs.replace(".", "").strip()


def get_8_digit_hts(hs_code: str) -> str:
    """
    Section 301 scope is evaluated at the 8-digit HTSUS level
    """
    hs = normalize_hs(hs_code)
    if len(hs) >= 10:
        return hs[:8]
    return hs


import re

def parse_ad_valorem_rate(rate) -> float:
    """
    Extracts ad valorem percentage from HTS legal duty text.

    Handles:
    - "Free"
    - "25%"
    - "7.5 %"
    - "The duty provided in the applicable subheading + 25"
    - "The duty provided in the applicable subheading + 7.5%"
    """

    if not rate:
        return 0.0

    # Already numeric
    if isinstance(rate, (int, float)):
        return float(rate)

    rate = rate.strip().lower()

    if rate == "free":
        return 0.0

    # Find first number in the string (integer or decimal)
    match = re.search(r"(\d+(\.\d+)?)", rate)

    if match:
        return float(match.group(1))

    # Fallback: no numeric duty found
    return 0.0


def is_subject_to_section301(hs_code: str, origin_country: str) -> bool:
    """
    Section 301 applies if:
    - Origin = China
    - 8-digit HTSUS code is listed in scope table
    """
    origin_country = origin_country.upper()
    if origin_country != "CN":
        return False

    hs_8 = get_8_digit_hts(hs_code)

    sql = text("""
        SELECT 1
        FROM section301_scope
        WHERE REPLACE("HTS_Code", '.', '') LIKE :hs || '%'
        LIMIT 1
    """)

    with engine.connect() as conn:
        row = conn.execute(sql, {"hs": hs_8}).first()

    return row is not None


def get_section301_duty(hs_code: str, origin_country: str) -> dict | None:
    """
    Returns Section 301 Chapter 99 duty info if applicable
    """
    origin_country = origin_country.upper()
    hs_8 = get_8_digit_hts(hs_code)

    if not is_subject_to_section301(hs_8, origin_country):
        return None

    scope_sql = text("""
        SELECT "Chapter99_Code"
        FROM section301_scope
        WHERE REPLACE("HTS_Code", '.', '') LIKE :hs || '%'
        ORDER BY LENGTH("HTS_Code") DESC
        LIMIT 1
    """)

    with engine.connect() as conn:
        scope_row = conn.execute(scope_sql, {"hs": hs_8}).first()

    if not scope_row:
        return None

    chapter99_code = scope_row.Chapter99_Code

    chapter99_sql = text("""
        SELECT
            "HTS Number" AS chapter_99_code,
            "Description" AS description,
            "General Rate of Duty" AS additional_duties
        FROM section301_chapter99
        WHERE "HTS Number" = :code
        LIMIT 1
    """)

    with engine.connect() as conn:
        row = conn.execute(chapter99_sql, {"code": chapter99_code}).first()

    if not row:
        return None

    return {
        "applies": True,
        "chapter_99_code": row.chapter_99_code,
        "additional_duties_text": row.additional_duties,
        "legal_description": row.description
    }



def calculate_total_ad_valorem(base_tariff_rate, section301: dict | None) -> dict:
    """
    Adds base tariff + Section 301 duty (ad valorem only)
    """

    base_rate = parse_ad_valorem_rate(base_tariff_rate)

    section301_rate = 0.0
    if section301:
        section301_rate = parse_ad_valorem_rate(
            section301.get("additional_duties_text")
        )

    return {
        "base_rate_percent": base_rate,
        "section301_rate_percent": section301_rate,
        "total_rate_percent": base_rate + section301_rate
    }

def get_tariff_with_duty_payable(
    hs_code: str,
    origin_country: str,
    customs_value: float,
    freight: float = 0.0,
    insurance: float = 0.0
) -> dict:

    # Existing tariff logic
    tariff = get_tariff_api(hs_code, origin_country)

    # Section 301
    section301 = get_section301_duty(hs_code, origin_country)

    # Percent math (already correct in your system)
    rates = calculate_total_ad_valorem(
        base_tariff_rate=tariff["base_tariff"]["rate"],
        section301=section301
    )

    # 💰 Final USD calculation
    duty_payable = calculate_total_duty_payable(
        customs_value=customs_value,
        freight=freight,
        insurance=insurance,
        total_ad_valorem_rate=rates["total_rate_percent"]
    )

    # 🔗 Attach without breaking anything
    return {
        **tariff,
        "section_301": section301 or {"applies": False},
        "calculated_duties": rates,
        "duty_payable": duty_payable
    }


def get_tariff_with_duty_payable(
    hs_code: str,
    origin_country: str,
    customs_value: float,
    freight: float = 0.0,
    insurance: float = 0.0
) -> dict:

    # Existing tariff logic
    tariff = get_tariff_api(hs_code, origin_country)

    # Section 301
    section301 = get_section301_duty(hs_code, origin_country)

    # Percent math (already correct in your system)
    rates = calculate_total_ad_valorem(
        base_tariff_rate=tariff["final_tariff"]["rate"],
        section301=section301
    )

    # 💰 Final USD calculation
    duty_payable = calculate_total_duty_payable(
        customs_value=customs_value,
        freight=freight,
        insurance=insurance,
        total_ad_valorem_rate=rates["total_rate_percent"]
    )


    return {
        **tariff,
        "section_301": section301 or {"applies": False},
        "calculated_duties": rates,
        "duty_payable": duty_payable
    }


if __name__ == "__main__":

    hs_input = "01019040"   
    origin = "CN"
    
    tariff = get_tariff_api(hs_input, origin)
    base_tariff_rate = tariff["final_tariff"]["rate"]
    print("GGGGGGGGGGGGGGGGGGGGGGGGGGGG", get_tariff_api(hs_input, origin))


    print("\n🔎 INPUT")
    print("HS Code:", hs_input)
    print("Origin:", origin)

    section301 = get_section301_duty(hs_input, origin)

    if section301:
        print("\n✅ Section 301 applies")
        print(section301)
    else:
        print("\n❌ Section 301 does NOT apply")

    result = calculate_total_ad_valorem(
        base_tariff_rate=base_tariff_rate,
        section301=section301
    )

    print("\n💰 DUTY CALCULATION")
    print(f"Base Duty: {result['base_rate_percent']}%")
    print(f"Section 301: {result['section301_rate_percent']}%")
    print(f"TOTAL DUTY: {result['total_rate_percent']}%")
