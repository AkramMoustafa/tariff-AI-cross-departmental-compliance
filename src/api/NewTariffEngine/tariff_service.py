import csv
import sys
from sqlalchemy import create_engine, text
import os
from src.api.New.loader import load_hs_tree
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def get_full_chain(node, hs_tree):
    chain = []
    current_code = node.code

    while True:

        if not current_code:
            break

        current_node = hs_tree.get(current_code)

        if current_node:
            chain.append({
                "hs_code": current_node.code,
                "description": current_node.description,
                "level": current_node.level
            })

            parent_code = current_node.parent_code

            # stop if parent is null or empty
            if not parent_code:
                break

            current_code = parent_code

        else:
            # fallback: trim 2 digits
            if not isinstance(current_code, str):
                break

            if len(current_code) <= 2:
                break

            current_code = current_code[:-2]

    return list(reversed(chain))

def normalize_hs(hs: str) -> str:
    if not hs:
        return ""
    return hs.replace(".", "").strip()

def load_agoa_countries(path: str) -> set:
    countries = set()
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            countries.add(row["country_code"].strip().upper())
    return countries


def load_cbi_countries(path: str) -> set:
    countries = set()
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            countries.add(row["country_code"].strip().upper())
    return countries

def load_fta_programs(path: str) -> dict:
    """
    Returns:
    {
        "AU": {"AU"},
        "KR": {"KR"},
        "P": {"CA","MX"},
        ...
    }
    """
    programs = {}

    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row["program_code"].strip()
            country = row["country_code"].strip().upper()
            programs.setdefault(code, set()).add(country)

    return programs


def applies_agoa(origin: str, special_programs: set, agoa_countries: set) -> bool:
    return "D" in special_programs and origin in agoa_countries

def applies_cbi(origin: str, special_programs: set, cbi_countries: set) -> bool:
    return "E" in special_programs and origin in cbi_countries

def applicable_fta_programs(origin: str, special_programs: set, fta_programs: dict) -> set:
    applicable = set()
    for program in special_programs:
        if program in fta_programs and origin in fta_programs[program]:
            applicable.add(program)
    return applicable

def determine_tariff(profile: dict, origin_country: str,
                     agoa_countries: set,
                     cbi_countries: set,
                     fta_programs: dict) -> dict:
    """
    Returns:
    {
        rate,
        basis,
        applied_program
    }
    """

    t = profile["effective_tariff"]
    origin = origin_country.upper()

    if t["column2_rate"] and origin in {"CU", "IR", "KP", "RU"}:
        return {
            "rate": t["column2_rate"],
            "basis": "column_2",
            "applied_program": "COLUMN_2"
        }

    if applies_agoa(origin, set(t["special_programs"]), agoa_countries):
        return {
            "rate": t["special_rate"],
            "basis": "special",
            "applied_program": "AGOA"
        }

    if applies_cbi(origin, set(t["special_programs"]), cbi_countries):
        return {
            "rate": t["special_rate"],
            "basis": "special",
            "applied_program": "CBI"
        }

    fta_matches = applicable_fta_programs(origin, set(t["special_programs"]), fta_programs)
    if fta_matches:
        return {
            "rate": t["special_rate"],
            "basis": "special",
            "applied_program": sorted(fta_matches)[0]
        }

    return {
        "rate": t["general_rate"],
        "basis": "general",
        "applied_program": "MFN"
    }

def get_hs_tree(hs_code: str) -> list[dict]:
    hs = hs_code.replace(".", "").strip()

    sql = text("""
        SELECT clean_hs, level, description
        FROM tariffs_basic_data
        WHERE :hs LIKE clean_hs || '%'
        ORDER BY LENGTH(clean_hs) ASC
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql, {"hs": hs}).fetchall()

    return [
        {
            "hs_code": r.clean_hs,
            "level": r.level,
            "description": r.description
        }
        for r in rows
    ]

def get_hs_hierarchy_only(hs_code: str):
    hs_tree = load_hs_tree()

    normalized = hs_code.replace(".", "").strip()

    node = hs_tree.get(normalized)

    if not node:
        return []

    return get_full_chain(node, hs_tree)

def parse_programs(programs_text: str) -> set:
    """
    Converts pipe-delimited program list into a set
    Example: "A|AU|BH" -> {"A", "AU", "BH"}
    """
    if not programs_text:
        return set()

    return {p.strip() for p in programs_text.split("|") if p.strip()}

def resolve_starting_hs(hs_code: str, rows: dict) -> str:
    """
    If user enters 8-digit HS and only 10-digit exists,
    find the first matching 10-digit child.
    """
    if hs_code in rows:
        return hs_code

    # Try to find a 10-digit child
    for k in rows.keys():
        if k.startswith(hs_code) and len(k) > len(hs_code):
            return k

    return hs_code

def load_hs_from_postgres() -> dict:
    rows = {}

    sql = text("""
        SELECT
            clean_hs,
            parent_code,
            description,
            general_rate,
            special_rate,
            column2_rate,
            special_programs,
            additional_duties,
            level
        FROM tariffs_basic_data
        WHERE clean_hs IS NOT NULL
    """)

    with engine.connect() as conn:
        result = conn.execute(sql)

        for r in result:
            clean_hs = r.clean_hs

            rows[clean_hs] = {
                "clean_hs": clean_hs,
                "parent_code": r.parent_code,
                "description_clean": r.description,
                "general_rate": clean_rate(r.general_rate),
                "special_rate": clean_rate(r.special_rate),
                "column2_rate": clean_rate(r.column2_rate),
                "special_programs": parse_programs(
                    "" if r.special_programs in (None, "nan", "NaN") else r.special_programs
                ),
            }

    return rows

def build_product_profile(hs_code: str, rows: dict):
    profile = {
        "hs_chain": [],
        "descriptions": [],
        "tariff_chain": [],
        "special_programs": set(),
        "effective_tariff": None
    }

    code = hs_code

    while len(code) >= 2:
        row = rows.get(code)

        if row:
            profile.setdefault("hierarchy", []).append({
                "hs_code": code,
                "description": row.get("description_clean"),
                "level": len(code)
            })


            # Capture tariff info (most specific first)
            if (
                row["general_rate"]
                or row["special_rate"]
                or row["column2_rate"]
            ):
                profile["tariff_chain"].append({
                    "hs": code,
                    "general_rate": row["general_rate"],
                    "special_rate": row["special_rate"],
                    "column2_rate": row["column2_rate"],
                    "special_programs": sorted(row["special_programs"])
                })

            # Accumulate programs (NOT countries)
            if row["special_programs"]:
                profile["special_programs"].update(row["special_programs"])

        code = code[:-2]
    if "hierarchy" in profile:
        profile["hierarchy"] = list(reversed(profile["hierarchy"]))

    # Effective tariff = most specific HS (first hit)
    if profile["tariff_chain"]:
        effective_hs = profile["tariff_chain"][0]["hs"]
        profile["effective_tariff"] = profile["tariff_chain"][0]

        # Capture description for effective HS
        for hs, desc in zip(profile["hs_chain"], profile["descriptions"]):
            if hs == effective_hs:
                profile["effective_description"] = desc
                break
    else:
        profile["effective_description"] = None

    return profile


# -------------------------
# DOWNWARD traversal
# -------------------------

def get_descendants(prefix: str, rows: dict):
    results = []

    for hs, row in rows.items():
        if hs.startswith(prefix):
            results.append(row)

    results.sort(key=lambda r: (len(r["clean_hs"]), r["clean_hs"]))
    return results
def load_agoa_countries_from_sql() -> set:
    sql = text("SELECT country_code FROM agoa_countries")

    with engine.connect() as conn:
        result = conn.execute(sql)
        return {r.country_code.upper() for r in result if r.country_code}


def load_cbi_countries_from_sql() -> set:
    sql = text("SELECT country_code FROM cbi_countries")

    with engine.connect() as conn:
        result = conn.execute(sql)
        return {r.country_code.upper() for r in result if r.country_code}

def load_fta_programs_from_sql() -> dict:
    """
    Returns:
    {
        "AU": {"AU"},
        "P": {"CA", "MX"},
        ...
    }
    """
    programs = {}

    sql = text("""
        SELECT program_code, country_code
        FROM fta_programs
    """)

    with engine.connect() as conn:
        result = conn.execute(sql)
        for r in result:
            code = r.program_code.strip()
            country = r.country_code.strip().upper()
            programs.setdefault(code, set()).add(country)

    return programs
import math

def clean_rate(value):
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    if isinstance(value, str) and value.lower() == "nan":
        return ""
    return value

def get_tariff_api(hs_code: str, origin_country: str) -> dict:
    rows = load_hs_from_postgres()

    AGOA_COUNTRIES = load_agoa_countries_from_sql()
    CBI_COUNTRIES  = load_cbi_countries_from_sql()
    FTA_PROGRAMS   = load_fta_programs_from_sql()

    hs_code = normalize_hs(hs_code)

    hs_code = resolve_starting_hs(hs_code, rows)
    origin = origin_country.upper()

    if not hs_code.isdigit():
        raise ValueError("Invalid HTS code")

    if len(origin) != 2:
        raise ValueError("Invalid country code")

    profile = build_product_profile(hs_code, rows)

    if not profile["effective_tariff"]:
        raise ValueError("No tariff data found")

    tariff_result = determine_tariff(
        profile,
        origin_country=origin,
        agoa_countries=AGOA_COUNTRIES,
        cbi_countries=CBI_COUNTRIES,
        fta_programs=FTA_PROGRAMS
    )

    t = profile["effective_tariff"]

    return {
        "hs_code": hs_code,
        "origin_country": origin,
        "product": {
            "hierarchy": profile.get("hierarchy", []),
            "effective_description": profile.get("effective_description"),
        },

        "base_tariff": {
            "general_rate": t["general_rate"],
            "special_rate": t["special_rate"],
            "column2_rate": t["column2_rate"],
            "eligible_programs": t["special_programs"],
        },
        "final_tariff": {
            "rate": tariff_result["rate"],
            "basis": tariff_result["basis"],
            "applied_program": tariff_result["applied_program"],
        }
    }