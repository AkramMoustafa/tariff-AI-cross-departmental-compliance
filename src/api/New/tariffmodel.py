from sqlalchemy import text
from src.api.db import engine

class HSNode:
    def __init__(self, code, description, level, parent_code):
        self.code = code
        self.description = description
        self.level = level
        self.parent_code = parent_code
        self.children = []

def load_hs_tree():
    nodes = {}

    sql = text("""
        SELECT clean_hs, parent_code, description, level
        FROM tariffs_basic_data
        WHERE clean_hs IS NOT NULL
    """)

    with engine.connect() as conn:
        for r in conn.execute(sql):
            nodes[r.clean_hs] = HSNode(
                code=r.clean_hs,
                description=r.description,
                level=r.level,
                parent_code=r.parent_code
            )

    for node in nodes.values():
        if node.parent_code and node.parent_code in nodes:
            nodes[node.parent_code].children.append(node)

    return nodes

HS_TREE = {}

def init_hs():
    global HS_TREE
    HS_TREE = load_hs_tree()
