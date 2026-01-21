
from decimal import Decimal
from typing import List, Dict, Any, Literal


TariffRateType = Literal["AD_VALOREM", "SPECIFIC", "MIXED"]


def calculate_tariff(
    tariff_lines: List[Dict[str, Any]],
    customs_value: float | Decimal,
    freight: float | Decimal = 0.0,
    insurance: float | Decimal = 0.0,
    quantity: float | Decimal = 1.0,
) -> Dict[str, Any]:
    """
    Generic tariff engine.
    - tariff_lines is a list of plain dicts:
      {
        "duty_type": "MFN",
        "rate_type": "AD_VALOREM",
        "rate_value": 10.0,   # percent for AD_VALOREM, per-unit for SPECIFIC
        "priority": 1
      }
    - No country-specific logic here.
    """

    customs_val = Decimal(str(customs_value))
    freight_val = Decimal(str(freight))
    insurance_val = Decimal(str(insurance))
    quantity_val = Decimal(str(quantity))

    cif = customs_val + freight_val + insurance_val
    running_base = cif
    components: List[Dict[str, Any]] = []
    total_duty = Decimal("0.00")

    for line in sorted(tariff_lines, key=lambda x: x.get("priority", 100)):
        rate_type: TariffRateType = line["rate_type"]
        rate_value = Decimal(str(line["rate_value"]))

        if rate_type == "AD_VALOREM":
            amount = running_base * (rate_value / Decimal("100"))
        elif rate_type == "SPECIFIC":
            amount = quantity_val * rate_value
        elif rate_type == "MIXED":
            amount = running_base * (rate_value / Decimal("100")) + quantity_val * rate_value
        else:
            continue

        amount = amount.quantize(Decimal("0.01"))

        components.append(
            {
                "duty_type": line["duty_type"],
                "rate_type": rate_type,
                "rate": float(rate_value),
                "base": float(running_base),
                "amount": float(amount),
            }
        )

        total_duty += amount
        running_base += amount

    total_duty = total_duty.quantize(Decimal("0.01"))
    effective_rate = float((total_duty / cif).quantize(Decimal("0.0001"))) if cif > 0 else 0.0

    return {
        "components": components,
        "total_duty": float(total_duty),
        "effective_rate": effective_rate,
    }
