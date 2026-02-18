import json


# Country groups (can later move to JSON)
EU_COUNTRIES = {
    "DE","FR","IT","ES","NL","BE","SE","PL","AT","FI","DK",
    "IE","PT","GR","CZ","HU","RO","BG","HR","SI","SK",
    "LT","LV","EE","LU","MT","CY"
}


class Vehicle9903PercentageEngine:

    def __init__(self, rules_file: str):
        with open(rules_file, "r") as f:
            self.rules = json.load(f)

        # Sort rules by priority (highest first)
        self.sorted_rules = sorted(
            self.rules.items(),
            key=lambda x: x[1]["priority"],
            reverse=True
        )

    def _country_matches(self, country_of_origin, conditions):
        if not conditions:
            return True

        # Single country
        if "country_of_origin" in conditions:
            return country_of_origin == conditions["country_of_origin"]

        # Country group
        if "country_group" in conditions:
            if conditions["country_group"] == "EU":
                return country_of_origin in EU_COUNTRIES

        return True
    def get_percentage(
        self,
        hs_code: str,
        country_of_origin: str = None,
        base_rate_percent: float = None,
        usmca_eligible: bool = False,
        commerce_approval: bool = False,
        documentation_submitted: bool = False,
        vehicle_age_years: int = None,
        is_passenger_vehicle: bool = None
    ):

        if base_rate_percent is None:
            return {
                "applies": False,
                "reason": "Base MFN rate is required."
            }
        if vehicle_age_years is not None and vehicle_age_years >= 25:
            return {
                "heading_applied": "9903.94.04",
                "percentage": base_rate_percent,
                "note": "Age ≥ 25 years – no additional duty applies"
            }

        for heading, rule in self.sorted_rules:

            # 1️⃣ Product scope check
            if "product_scope" in rule:
                if hs_code not in rule["product_scope"]:
                    continue

            conditions = rule.get("conditions", {})

            # 2️⃣ Country match
            if not self._country_matches(country_of_origin, conditions):
                continue

            # 3️⃣ Age-based exemption (9903.94.04)
            if rule["type"] == "age_based_exemption":
                min_age = conditions.get("vehicle_age_years_minimum")
                if (
                    vehicle_age_years is not None
                    and min_age is not None
                    and vehicle_age_years >= min_age
                ):
                    return {
                        "heading_applied": heading,
                        "percentage": base_rate_percent,  # MFN only
                        "note": "Age-based exemption applied – no additional duty"
                    }

            if rule["type"] == "scope_alternative":

                # This heading applies ONLY if it is NOT a passenger vehicle
                if is_passenger_vehicle is False:

                    additional_rate = rule["rate"]["value"]

                    return {
                        "heading_applied": heading,
                        "percentage": base_rate_percent + additional_rate,
                        "note": "9903.94.02 applied – 25% additional duty"
                    }

                # If it IS passenger vehicle, skip this rule
                else:
                    continue

            # 5️⃣ Country-specific rate floor
            if rule["type"] == "country_specific_rate_floor":
                threshold = conditions.get("column_1_rate_less_than_percent")
                if threshold is not None and base_rate_percent < threshold:
                    return {
                        "heading_applied": heading,
                        "percentage": rule["rate"]["value"],  # total override
                        "note": "Rate floor applied"
                    }

            # 6️⃣ Country-specific exemption
            if rule["type"] == "country_specific_exemption":
                threshold = conditions.get("column_1_rate_minimum_percent")
                if threshold is not None and base_rate_percent >= threshold:
                    return {
                        "heading_applied": heading,
                        "percentage": base_rate_percent,
                        "note": "Exemption applied"
                    }

            # 7️⃣ Conditional override (USMCA)
            if rule["type"] == "conditional_override":
                if usmca_eligible and commerce_approval and documentation_submitted:
                    return {
                        "heading_applied": heading,
                        "percentage": rule["rate"]["value"],  # total override
                        "note": "USMCA conditional override applied"
                    }

            # 8️⃣ Reduced rate (e.g. UK 7.5%)
            if rule["type"] == "country_specific_reduced_rate":
                return {
                    "heading_applied": heading,
                    "percentage": base_rate_percent + rule["rate"]["value"],
                    "note": "Reduced rate applied"
                }

            # 9️⃣ Default trade action (9903.94.01)
            if rule["type"] == "chapter_99_trade_action_vehicle":
                return {
                    "heading_applied": heading,
                    "percentage": base_rate_percent + rule["rate"]["value"],
                    "note": "Default 25% applied"
                }
        print("DEBUG → Vehicle scope check failed")
        return {
            "applies": False,
            "reason": "No applicable rule."
        }

if __name__ == "__main__":

    engine = Vehicle9903PercentageEngine("vehicles_9903_94.json")

    hs = input("Enter HS Code: ")
    country = input("Enter Country (e.g., KR, JP, DE): ")
    base = float(input("Enter Base MFN Rate (%): "))

    age_input = input("Enter vehicle age in years (or leave blank): ")
    age = int(age_input) if age_input.strip() else None

    passenger_input = input("Is this a passenger vehicle? (y/n or blank): ")
    if passenger_input.lower() == "y":
        is_passenger = True
    elif passenger_input.lower() == "n":
        is_passenger = False
    else:
        is_passenger = None

    result = engine.get_percentage(
        hs_code=hs,
        country_of_origin=country,
        base_rate_percent=base,
        vehicle_age_years=age,
        is_passenger_vehicle=is_passenger
    )

    print("\nResult:")
    print(json.dumps(result, indent=4))
