from typing import TypedDict


class POState(TypedDict):
    po: dict
    sanctions_risk: dict
    geo_risk: float
    weather_risk: float
    macro_risk: float
    prediction: dict
    actions: list   # candidate actions from scenario_node
    decision: dict  # LLM reasoning from decision_node
