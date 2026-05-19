from types import SimpleNamespace

from src.api.agents.state import POState
from src.api.agents.tools import tool_run_prediction


def prediction_node(state: POState) -> dict:
    po = state["po"]

    # run_prediction() expects an object with attribute access, not a dict
    po_obj = SimpleNamespace(
        origin_city=po.get("origin_city"),
        origin_country=po.get("origin_country"),
        destination_city=po.get("destination_city"),
        destination_country=po.get("destination_country"),
        shipping_method=po.get("shipping_method"),
        product_category=po.get("product_category"),
        route_type=po.get("route_type"),
        shipping=po.get("shipping", 0.0),
        weight=po.get("weight", 0.0),
        # Use freshly computed risks from risk_node
        geo_risk=state.get("geo_risk", 0.0),
        weather_risk=state.get("weather_risk", 0.0),
        macro_risk=state.get("macro_risk", 0.0),
    )

    prediction = tool_run_prediction(po_obj)

    return {"prediction": prediction}
