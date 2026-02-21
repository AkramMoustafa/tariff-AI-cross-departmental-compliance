import json
from pathlib import Path
# Load rules
# Resolve path relative to this file
BASE_DIR = Path(__file__).resolve().parent
RULES_PATH = BASE_DIR / "rules_for_steel_iron.json"

with RULES_PATH.open("r", encoding="utf-8") as f:
    RULES = json.load(f)

def normalize(code: str) -> str:
    return code.replace(".", "").strip()


def matches_scope(hs_code: str, scope_list):
    hs_code = normalize(hs_code)
    for scope in scope_list:
        if hs_code.startswith(normalize(scope)):
            return True
    return False

def resolve_section_232(hs_code: str, country: str):
    hs_code = normalize(hs_code)
    country = country.upper()

    for rule_code, rule in RULES.items():
        if matches_scope(hs_code, rule.get("product_scope", [])):

            if country == "GB":
                rate = 25
            elif country == "RU" and rule_code.startswith("9903.85"):
                rate = 200
            else:
                rate = 50

            return {
                "heading": rule_code,
                "rate": rate,
                "type": "section_232"
            }

    return None
    
def evaluate_rule(hs_code: str, country: str):
    hs_code = normalize(hs_code)
    country = country.upper()

    for rule_code, rule in RULES.items():

        if matches_scope(hs_code, rule.get("product_scope", [])):

            applies_to = rule["rate"]["applies_to"]

            if country == "GB":
                rate = 25

            elif country == "RU" and rule_code.startswith("9903.85"):
                rate = 200

            else:
                rate = 50

            print(f"Rule applied: {rule_code}")
            print(f"Additional duty: {rate}%")
            print(f"Applies to: {applies_to}")
            return

    print("No Section 232 rule applies.")


if __name__ == "__main__":
    user_hs = input("Enter HS Code: ")
    user_country = input("Enter Country Code (e.g., CN, GB, RU): ")

    evaluate_rule(user_hs, user_country)
