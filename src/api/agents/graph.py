from langgraph.graph import StateGraph, END

from src.api.agents.state import POState
from src.api.agents.nodes.extract_node import extract_node
from src.api.agents.nodes.risk_node import risk_node
from src.api.agents.nodes.prediction_node import prediction_node
from src.api.agents.nodes.simulation_node import simulation_node
from src.api.agents.nodes.decision_node import decision_node


def build_graph() -> StateGraph:
    graph = StateGraph(POState)

    graph.add_node("extract", extract_node)
    graph.add_node("risk", risk_node)
    graph.add_node("prediction", prediction_node)
    graph.add_node("scenario", simulation_node)
    graph.add_node("decision_llm", decision_node)

    graph.set_entry_point("extract")
    graph.add_edge("extract", "risk")
    graph.add_edge("risk", "prediction")
    graph.add_edge("prediction", "scenario")
    graph.add_edge("scenario", "decision_llm")
    graph.add_edge("decision_llm", END)

    return graph.compile()


# Singleton compiled graph — imported by agent_routes.py
po_agent = build_graph()
