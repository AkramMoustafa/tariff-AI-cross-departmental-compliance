import json
import re
from  src.api.NewTariffEngine.rules.SteelIron.section232 import resolve_section_232
from src.api.NewTariffEngine.rules.cars_rules import Vehicle9903PercentageEngine
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def load_json(filename):
    path = BASE_DIR / filename
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

VEHICLE_RULES = load_json("vehicles_9903_94.json")
VEHICLE_ENGINE = Vehicle9903PercentageEngine(
    str(BASE_DIR / "vehicles_9903_94.json")
)
VEHICLE_SCOPE = set(
    VEHICLE_RULES["9903.94.01"]["product_scope"]
)

def normalize_hs(hs):
    return re.sub(r"\D", "", hs)

def resolve_vehicle(
    hs_code,
    country_code,
    base_rate_percent=None,
    vehicle_age_years=None,
    is_passenger_vehicle=None
):
    hs_digits = normalize_hs(hs_code)
    
    vehicle_scope_normalized = {normalize_hs(x) for x in VEHICLE_SCOPE}

    if hs_digits not in vehicle_scope_normalized:
        return None

    
    vehicle_result = VEHICLE_ENGINE.get_percentage(
        hs_code=hs_code,
        country_of_origin=country_code,
        base_rate_percent=base_rate_percent,
        vehicle_age_years=vehicle_age_years,
        is_passenger_vehicle=is_passenger_vehicle
    )

    if vehicle_result.get("heading_applied"):
        return {
            "heading": vehicle_result["heading_applied"],
            "rate": vehicle_result["percentage"],
            "reason": vehicle_result.get("note", "Vehicle trade action applied."),
            "source": "vehicle_9903_94"
        }

    return None





def matches_note37_override(hs_digits, override_rule):
    """
    Checks if HS matches scope of a 9903.76.xx override rule.
    Returns (percentage, description) if match.
    Returns (None, None) if no match.
    """

    scope = override_rule.get("scope", {})

    if scope.get("type") != "hs_list":
        return None, None

    for item in scope.get("items", []):
        if normalize_hs(item) == hs_digits:

            percentage = override_rule["duty"]["additional_rate"]
            heading = override_rule["heading"]
            rule_desc = override_rule.get("description", "Product-specific override")
            note = override_rule.get("legal_trigger", {})
            stacking = override_rule.get("duty", {}).get("stacking", {})
            calc_basis = override_rule.get("duty", {}).get("calculation_basis", "")

            description = (
                f"HS {item} matches {heading}. "
                f"{rule_desc}. "
                f"Legal basis: U.S. Note {note.get('us_note')} subdivision {note.get('subdivision')}. "
                f"Additional duty: {percentage}% ad valorem. "
            )

            if stacking.get("with_chapters_1_97"):
                description += "This duty is applied in addition to Chapters 1–97 duties. "

            if stacking.get("with_other_chapter_99") is False:
                description += "This override replaces other Chapter 99 additional duties. "

            if calc_basis:
                description += f"Calculation basis: {calc_basis}. "

            return percentage, description.strip()

    return None, None

def resolve_canada(hs_code):
    hs_digits = normalize_hs(hs_code)

    canada_rules = load_json("Canada.json")
    overrides = load_json("9903.76.xx.json")

    # 1️⃣ Product-specific overrides (9903.76.xx – Note 37)
    for rule in overrides.get("rules", []):
        percentage, description = matches_note37_override(hs_digits, rule)

        if percentage is not None:
            return {
                "heading": rule["heading"],
                "rate": percentage,
                "reason": description,
                "note": "Note 37 override applies. Canada default rule does not apply."
            }

    for rule in canada_rules.get("rules", []):
        if rule["heading"] == "9903.01.10":

            excluded = rule.get("conditions", {}).get("excluded_headings", [])
            potential = []

            for ex_heading in excluded:
                # Find full rule details for each excluded heading
                for r in canada_rules.get("rules", []):
                    if r["heading"] == ex_heading:
                        potential.append({
                            "heading": r["heading"],
                            "description": r.get("description", "Statutory carve-out may apply.")
                        })

            return {
                "heading": "9903.01.10",
                "rate": rule["rate"],
                "reason": "Default Canada additional duty applies unless modified by carve-outs.",
                "potential_exemptions": potential
            }
    
def resolve_mexico(hs_code):
    hs_digits = normalize_hs(hs_code)

    mexico_rules = load_json("Mexico.json")
    overrides = load_json("9903.76.xx.json")

    for rule in overrides.get("rules", []):
        percentage, description = matches_note37_override(hs_digits, rule)

        if percentage is not None:
            return {
                "heading": rule["heading"],
                "rate": percentage,
                "reason": description,
                "potential_exemptions": []
            }

    # 2️⃣ Default 9903.01.01 (25%)
    for rule in mexico_rules.get("rules", []):
        if rule["heading"] == "9903.01.01":

            return {
                "heading": "9903.01.01",
                "rate": rule["rate"],
                "reason": "Default Mexico additional duty (25%) applies.",
                "potential_exemptions": [
                    {
                        "heading": "9903.01.03",
                        "description": (
                            "If the product qualifies as informational material "
                            "(e.g., publication, film, artwork, media content, news wire feed), "
                            "the additional duty may be exempt under 9903.01.03."
                        )
                    }
                ]
            }

    return None

def resolve_china(hs_code):
    china_rules = load_json("china.json")
    rule = china_rules["headings"][0]

    return {
        "heading": rule["heading"],
        "rate": rule["additional_duty"]["rate"],
        "reason": (
            f"China/Hong Kong emergency additional duty applies under heading {rule['heading']}."
        ),
        "potential_exemptions": [
            {
                "heading": "9903.01.21",
                "description": "May not apply if the product qualifies as a humanitarian donation."
            },
            {
                "heading": "9903.01.22",
                "description": "May not apply if the product qualifies as informational material."
            }
        ]
    }
def resolve_additional_duty(
    country_code,
    hs_code,
    base_rate_percent=None,
    vehicle_age_years=None,
    is_passenger_vehicle=None
):
    
    country_code = country_code.upper()
    vehicle_result = resolve_vehicle(
    hs_code,
    country_code,
    base_rate_percent,
    vehicle_age_years,
    is_passenger_vehicle
)

    if vehicle_result:
        return vehicle_result
      
    section_232_result = resolve_section_232(hs_code, country_code)

    if section_232_result:
        return {
            "heading": section_232_result["heading"],
            "rate": section_232_result["rate"],
            "reason": "Section 232 duty applies. Country-based Chapter 99 duties do not apply due to statutory stacking rules.",
            "source": "section_232"
        }

    if country_code == "MX":
        return resolve_mexico(hs_code)

    if country_code == "CA":
        return resolve_canada(hs_code)

    if country_code in ["CN", "HK"]:
        return resolve_china(hs_code)

    return {
        "heading": None,
        "rate": 0,
        "reason": "No Chapter 99 rule for this country"
    }

if __name__ == "__main__":
    print("=== Chapter 99 Mexico Test CLI ===")

    while True:
        country = input("\nEnter country code (or 'exit'): ").strip()
        if country.lower() == "exit":
            break

        hs_code = input("Enter HS code: ").strip()

        result = resolve_additional_duty(country, hs_code)

        print("\n--- RESULT ---")
        print("Heading:", result["heading"])
        print("Additional Rate:", f"{result['rate']}%")
        print("Reason:", result["reason"])

        if result.get("potential_exemptions"):
            print("\n⚠ Potential Exemption Review:")
            for ex in result["potential_exemptions"]:
                rate_text = f"{ex['rate']}%" if ex.get("rate") is not None else "See statute"
                print(f"- {ex['heading']} ({rate_text}): {ex['description']}")
        print("----------------")
