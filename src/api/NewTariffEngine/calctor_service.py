def calculate_total_duty_payable(
    customs_value: float,
    freight: float = 0.0,
    insurance: float = 0.0,
    total_ad_valorem_rate: float = 0.0
):
    """
    Calculates total duty payable in USD.
    """

    dutiable_value = customs_value + freight + insurance

    duty_payable = dutiable_value * (total_ad_valorem_rate / 100)

    return {
        "dutiable_value": round(dutiable_value, 2),
        "total_duty_payable": round(duty_payable, 2),
        "effective_rate": total_ad_valorem_rate
    }