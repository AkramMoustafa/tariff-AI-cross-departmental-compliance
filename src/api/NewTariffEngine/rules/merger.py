from Note2 import evaluate_duty   # your global imposing + exceptions engine
from mexico import resolve_additional_duty  # your CA/MX/CN logic


RATE_CAP_COUNTRIES = {"LI", "SK", "CH"}
RATE_CAP_VALUE = 15.0


def resolve_total_additional_duty(country_code: str, hs_code: str):

    country = country_code.upper()
    total_rate = 0.0
    breakdown = []

    country_result = resolve_additional_duty(country, hs_code)

    if country_result and country_result.get("rate", 0) > 0:
        total_rate += float(country_result["rate"])
        breakdown.append({
            "source": "Country Rule",
            "heading": country_result.get("heading"),
            "rate": country_result["rate"],
            "reason": country_result.get("reason")
        })

    global_rate = evaluate_duty(country, hs_code)

    if global_rate > 0:
        total_rate += float(global_rate)
        breakdown.append({
            "source": "Global Rule",
            "heading": "CH99_GLOBAL_AD_VALOREM_DEFAULT",
            "rate": global_rate,
            "reason": "Global additional ad valorem duty applied."
        })

    if country in RATE_CAP_COUNTRIES and total_rate > RATE_CAP_VALUE:
        breakdown.append({
            "source": "Rate Cap",
            "heading": None,
            "rate": RATE_CAP_VALUE,
            "reason": f"Rate capped at {RATE_CAP_VALUE}% for {country}."
        })
        total_rate = RATE_CAP_VALUE

    return {
        "country": country,
        "hs_code": hs_code,
        "total_additional_rate": total_rate,
        "breakdown": breakdown
    }

if __name__ == "__main__":

    print("=== Chapter 99 Stacked Duty CLI ===")

    while True:
        country = input("\nEnter country code (or 'exit'): ").strip()
        if country.lower() == "exit":
            break

        hs_code = input("Enter HS code: ").strip()

        result = resolve_total_additional_duty(country, hs_code)

        print("\n--- FINAL RESULT ---")
        print("Country:", result["country"])
        print("HS Code:", result["hs_code"])
        print("Total Additional Rate:", f"{result['total_additional_rate']}%")

        print("\nBreakdown:")
        for item in result["breakdown"]:
            print(f"- {item['source']} | {item['rate']}% | {item['reason']}")

        print("------------------------------")
