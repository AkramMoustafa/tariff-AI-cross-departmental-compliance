from src.api.agents.state import POState


def simulation_node(state: POState) -> dict:
    return {
        "actions": [
            "proceed",
            "expedite_air",
            "alternate_supplier",
            "hold_shipment",
        ]
    }
