import re
import json

GLOBAL_RULE_FILE = "imposing.json"
JSON_FILE_PATH = "exceptions.json"
BASE_RATE = 10.0  # Default additional duty percent

RATE_CAP_COUNTRIES = {"LI", "SK", "CH"}
RATE_CAP_VALUE = 15.0

def normalize_hts(hts: str) -> str:
    return re.sub(r"\D", "", hts)


def load_exceptions():
    with open(JSON_FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("exceptions", [])


def hts_matches(input_hts, candidate_hts):
    input_norm = normalize_hts(input_hts)
    candidate_norm = normalize_hts(candidate_hts)
    return input_norm.startswith(candidate_norm)

def get_country_rate(country_code):
    with open(GLOBAL_RULE_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    imposing = data.get("imposing_headings", [])

    for item in imposing:

        # Country-specific headings
        if "heading_country_specific" in item:
            for entry in item["heading_country_specific"]:
                if entry.get("country") == country_code:
                    return entry.get("rate")

        # Country scope version
        if "country_scope" in item:
            if country_code in item.get("country_scope", []):
                return item.get("rate")

    return None

def evaluate_duty(country_code: str, hts_code: str):

    country = country_code.upper()
    hts = hts_code

    # STEP 1 — Check product/origin exclusions
    exceptions = load_exceptions()

    for rule in exceptions:

        rule_countries = rule.get("countries", [])
        rule_type = rule.get("type")

        country_match = (
            "ALL" in rule_countries or country in rule_countries
        )

        if not country_match:
            continue

        if rule_type == "origin_exception":
            return 0.0

        for product in rule.get("applies_to", []):
            if hts_matches(hts, product):
                return 0.0

        embedded = rule.get("embedded_note")
        if embedded:
            for product in embedded.get("applies_to", []):
                if hts_matches(hts, product):
                    return 0.0

    # STEP 2 — Determine rate
    country_rate = get_country_rate(country)

    if country_rate is not None:
        rate = float(country_rate)
    else:
        rate = BASE_RATE

    # STEP 3 — Apply 15% cap rule
    if country in RATE_CAP_COUNTRIES and rate > RATE_CAP_VALUE:
        rate = RATE_CAP_VALUE

    return rate

def main():

    print("=== Tariff Duty CLI ===")

    country = input("Enter country code (e.g., CN, CA, MX): ").strip()
    hts = input("Enter HTS code (e.g., 7403.22.00): ").strip()

    if not country or not hts:
        print("Error: Both country and HTS code are required.")
        return

    rate = evaluate_duty(country, hts)

    print("\n--- Duty Result ---")
    print(f"Country: {country.upper()}")
    print(f"HTS Code: {hts}")
    print(f"Additional Duty: {rate}%")
    

if __name__ == "__main__":
    main()
