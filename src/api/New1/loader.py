class HSNode:
    def __init__(self, code, description, level, parent_code):
        self.code = code
        self.description = description
        self.level = level
        self.parent_code = parent_code
        self.children = []


from src.api.New1.embeddings import embed
from sqlalchemy import text
from src.api.db import get_db, engine, SessionLocal
import json
import numpy as np


with open("intent_vectors.json") as f:
    INTENT_ANCHORS = json.load(f)

print("ohivjs ojeivoewfjpovkwjpokgpoekgpoekgpwojgpoj")
INTENT_CHAPTER_MAP = {
    "apparel": {"61", "62", "42"},
    "raw_material": {"28", "29", "41", "50", "51", "52", "72", "74"},
    "machinery": {"84"},
    "electronics": {"85"},
    "food": {"01", "02", "03", "04", "07", "08", "09", "16", "19"},
}

def detect_domain_prefix(query: str):
    q = query.lower()

    if "mill" in q:
        return "8459"
    if "lathe" in q or "turning" in q:
        return "8458"
    if "drill" in q:
        return "8459"

    return None

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def detect_intent(query_embedding):
    best_intent = None
    best_score = -1
    for intent, anchor_vec in INTENT_ANCHORS.items():
        score = cosine_similarity(query_embedding, anchor_vec)
        if score > best_score:
            best_score = score
            best_intent = intent
    return best_intent


def retrieve_candidates(query_embedding, prefix=None, limit=120):

    embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"

    if prefix:
        sql = text("""
            SELECT clean_hs,
                   parent_code,
                   description,
                   level,
                   1 - (embedding <=> CAST(:embedding AS vector)) AS semantic_score
            FROM tariffs_basic_data
            WHERE embedding IS NOT NULL
              AND clean_hs LIKE :prefix
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
        """)
        params = {"embedding": embedding_str, "limit": limit, "prefix": f"{prefix}%"}
    else:
        sql = text("""
            SELECT clean_hs,
                   parent_code,
                   description,
                   level,
                   1 - (embedding <=> CAST(:embedding AS vector)) AS semantic_score
            FROM tariffs_basic_data
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
        """)
        params = {"embedding": embedding_str, "limit": limit}

    with engine.connect() as conn:
        return conn.execute(sql, params).fetchall()

def load_hs_tree():
    nodes = {}

    sql = text("""
        SELECT clean_hs, parent_code, description, level
        FROM tariffs_basic_data
        WHERE clean_hs IS NOT NULL
    """)

    with engine.connect() as conn:
        for r in conn.execute(sql):
            code = r.clean_hs.replace(".", "").strip()
            parent = r.parent_code.replace(".", "").strip() if r.parent_code else None

            nodes[code] = HSNode(
                code=code,
                description=r.description,
                level=r.level,
                parent_code=parent
            )

    # link parents
    for node in nodes.values():
        if node.parent_code and node.parent_code in nodes:
            nodes[node.parent_code].children.append(node)

    return nodes


STOPWORDS = {"machine", "machines", "industrial", "equipment", "device"}

def normalize(text: str) -> list[str]:
    return [
        t.lower()
        for t in text.split()
        if len(t) > 2 and t.lower() not in STOPWORDS
    ]


def keyword_score(query: str, description: str) -> float:
    tokens = normalize(query)
    desc = description.lower()
    score = 0

    if query.lower() in desc:
        score += 5

    for t in tokens:
        if t in desc:
            score += 1

    return score


def detect_gender(query_lower: str):
    if any(x in query_lower for x in ["men", "man", "male", "boys"]):
        return "male"
    if any(x in query_lower for x in ["women", "woman", "female", "girls"]):
        return "female"
    if any(x in query_lower for x in ["infant", "baby", "babies"]):
        return "infant"
    return None

def get_10_digit_children(family_code: str):
    sql = text("""
        SELECT clean_hs, description
        FROM tariffs_basic_data
        WHERE clean_hs LIKE :prefix
          AND LENGTH(clean_hs) = 10
        ORDER BY clean_hs
    """)

    with engine.connect() as conn:
        rows = conn.execute(
            sql,
            {"prefix": f"{family_code}%"}
        ).fetchall()

    return [
        {
            "hs_code": r.clean_hs,
            "description": r.description
        }
        for r in rows
    ]


# def hybrid_search1(query: str, hs_tree: dict):
#     ql = query.lower()
#     gender_intent = detect_gender(ql)

#     # Numeric shortcut
#     if query.replace(".", "").isdigit():
#         node = hs_tree.get(query)
#         if node:
#             return {
#                 "query": query,
#                 "results": [{
#                     "hs_code": node.code,
#                     "description": node.description,
#                     "level": node.level,
#                     "hierarchy": get_full_chain(node, hs_tree)
#                 }]
#             }

#     query_embedding = embed(query)
#     intent = detect_intent(query_embedding)
#     prefix = detect_domain_prefix(query)
#     rows = retrieve_candidates(query_embedding, prefix=prefix, limit=200)


#     results = []
#     tokens = normalize(query)
#     main_token = max(tokens, key=len) if tokens else None

#     for r in rows:
#         desc_lower = (r.description or "").lower()

#         kw = keyword_score(query, r.description or "")
#         kw_norm = min(kw / 10, 1)

#         level_boost = (r.level or 0) * 0.25

#         semantic_part = 0.75 * (r.semantic_score or 0)
#         keyword_part = 0.20 * kw_norm
#         specificity_part = 0.05 * level_boost

#         final = semantic_part + keyword_part + specificity_part

#         chapter = r.clean_hs[:2]

#         if intent in INTENT_CHAPTER_MAP:
#             if chapter in INTENT_CHAPTER_MAP[intent]:
#                 final += 0.35
#             else:
#                 final -= 0.20

#         if intent == "apparel":
#             print("Inside intent")

#         # Gender logic
#         if gender_intent == "male":
#             if any(x in desc_lower for x in ["men", "boys"]):
#                 final += 0.35
#             else:
#                 final -= 0.15

#         elif gender_intent == "female":
#             if any(x in desc_lower for x in ["women", "girls"]):
#                 final += 0.35
#             else:
#                 final -= 0.15

#         elif gender_intent == "infant":
#             if "infant" in desc_lower:
#                 final += 0.35
#             else:
#                 final -= 0.15

#         else:
#             if any(x in desc_lower for x in ["men", "women", "boys", "girls", "infant"]):
#                 final += 0.15

#         if "parts" in desc_lower and "parts" not in ql:
#             final -= 0.1

#         if len(desc_lower.split()) <= 3:
#             final -= 0.5

#         if main_token and main_token in desc_lower:
#             final += 0.2

#         results.append({
#             "hs_code": r.clean_hs,
#             "description": r.description,
#             "level": r.level,
#             "score": final
#         })

#     results.sort(key=lambda x: x["score"], reverse=True)
#     top_candidates = results[:50]

#     families = {}

#     for r in top_candidates:
#         family = r["hs_code"][:4]

#         if family not in families:
#             families[family] = {
#                 "family_code": family,
#                 "family_description": hs_tree[family].description if family in hs_tree else None,
#                 "max_score": r["score"],
#                 "products": []
#             }
#         node = hs_tree.get(r["hs_code"])

#         hierarchy = get_full_chain(node, hs_tree) if node else []
#         families[family]["products"].append({
#             "hs_code": r["hs_code"],
#             "description": r["description"],
#             "level": r["level"],
#             "score": r["score"],
#             "hierarchy": hierarchy
#         })

#         families[family]["max_score"] = max(
#             families[family]["max_score"],
#             r["score"]
#         )

#     sorted_families = sorted(
#         families.values(),
#         key=lambda x: x["max_score"],
#         reverse=True
#     )

#     final_families = sorted_families[:5]

#     for fam in final_families:
#         fam["children"] = sorted(
#             fam["products"],
#             key=lambda x: x["score"],
#             reverse=True
#         )[:5]

#     return {
#     "query": query,
#     "results": [
#         {
#             "hs_code": fam["family_code"],
#             "description": fam["family_description"],
#             "score": fam["max_score"]
#         }
#         for fam in final_families
#     ]
# }

def expand_query(query: str):
    q = query.lower()
    if "cnc" in q:
        q += " numerically controlled"
    return q

def hybrid_search(query: str, hs_tree: dict):
    query = expand_query(query)
    ql = query.lower()
    gender_intent = detect_gender(ql)

    # Numeric shortcut
    if query.replace(".", "").isdigit():
        node = hs_tree.get(query)
        if node:
            return {
                "query": query,
                "results": [{
                    "hs_code": node.code,
                    "description": node.description,
                    "level": node.level,
                    "hierarchy": get_full_chain(node, hs_tree)
                }]
            }

    # STEP 1: expand query

    # STEP 2: embed
    query_embedding = embed(query)

    # STEP 3: detect intent
    intent = detect_intent(query_embedding)

    # STEP 4: detect domain (CRITICAL)
    prefix = detect_domain_prefix(query)

    print("DEBUG PREFIX:", prefix)  # ← add this

    # STEP 5: restrict search space
    rows = retrieve_candidates(query_embedding, prefix=prefix, limit=200)

    results = []
    tokens = normalize(query)
    main_token = max(tokens, key=len) if tokens else None

    for r in rows:
        node = hs_tree.get(r.clean_hs)

        if node:
            full_desc = build_full_description(node, hs_tree)
        else:
            full_desc = r.description or ""

        desc_lower = full_desc.lower()

        kw = keyword_score(query, full_desc)
        kw_norm = min(kw / 10, 1)

        level_boost = (r.level or 0) * 0.25

        semantic_part = 0.75 * (r.semantic_score or 0)
        keyword_part = 0.20 * kw_norm
        specificity_part = 0.05 * level_boost

        final = semantic_part + keyword_part + specificity_part
        if "milling" in ql and "milling" in desc_lower:
            final += 0.8
        chapter = r.clean_hs[:2]

        if intent in INTENT_CHAPTER_MAP:
            if chapter in INTENT_CHAPTER_MAP[intent]:
                final += 0.35
            else:
                final -= 0.6

        if intent == "apparel":
            print("Inside intent")

        # Gender logic
        if gender_intent == "male":
            if any(x in desc_lower for x in ["men", "boys"]):
                final += 0.35
            else:
                final -= 0.15

        elif gender_intent == "female":
            if any(x in desc_lower for x in ["women", "girls"]):
                final += 0.35
            else:
                final -= 0.15

        elif gender_intent == "infant":
            if "infant" in desc_lower:
                final += 0.35
            else:
                final -= 0.15

        else:
            if any(x in desc_lower for x in ["men", "women", "boys", "girls", "infant"]):
                final += 0.15

        if "parts" in desc_lower and "parts" not in ql:
            final -= 0.1

        if len(desc_lower.split()) <= 3:
            final -= 0.5

        if main_token and main_token in desc_lower:
            final += 0.2

        results.append({
            "hs_code": r.clean_hs,
            "description": full_desc,
            "level": r.level,
            "score": final
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    top_candidates = results[:50]

    families = {}

    for r in top_candidates:
        family = r["hs_code"][:4]

        if family not in families:
            families[family] = {
                "family_code": family,
                "family_description": hs_tree[family].description if family in hs_tree else None,
                "max_score": r["score"],
                "products": []
            }
        node = hs_tree.get(r["hs_code"])

        hierarchy = get_full_chain(node, hs_tree) if node else []
        families[family]["products"].append({
            "hs_code": r["hs_code"],
            "description": r["description"],
            "level": r["level"],
            "score": r["score"],
            "hierarchy": hierarchy
        })

        families[family]["max_score"] = max(
            families[family]["max_score"],
            r["score"]
        )

    sorted_families = sorted(
        families.values(),
        key=lambda x: x["max_score"],
        reverse=True
    )

    final_families = sorted_families[:5]

    for fam in final_families:
        fam["children"] = sorted(
            fam["products"],
            key=lambda x: x["score"],
            reverse=True
        )[:5]

    return {
    "query": query,
    "results": [
        {
            "hs_code": fam["family_code"],
            "description": fam["family_description"],
            "score": fam["max_score"]
        }
        for fam in final_families
    ]
}



def group_by_parent(results, hs_tree):
    grouped = {}

    for r in results:
        node = hs_tree[r["hs_code"]]
        parent_code = node.parent_code or "ROOT"
        parent_node = hs_tree.get(parent_code)

        if parent_code not in grouped:
            grouped[parent_code] = {
                "parent_code": parent_code,
                "parent_description": parent_node.description if parent_node else None,
                "products": []
            }

        grouped[parent_code]["children"].append(r)

    return grouped

def build_full_description(node, hs_tree):
    chain = get_full_chain(node, hs_tree)
    return " ".join([c["description"] for c in chain if c["description"]])

def get_full_chain(node, hs_tree):
    chain = []
    current = node

    while current:
        chain.append({
            "hs_code": current.code,
            "description": current.description,
            "level": current.level
        })

        parent_code = current.parent_code

        if not parent_code:
            break

        # 🔥 IMPORTANT: use EXACT match (no padding, no slicing)
        current = hs_tree.get(parent_code)

    return list(reversed(chain))

def resolve_to_10_digit(query: str, hs_tree: dict):
    """
    Takes a query and returns the best 10-digit HS code.
    """

    results = hybrid_search(query, hs_tree)
    # results = hybrid_search1(query, hs_tree)
    if not results or not results.get("results"):
        return None

    top_family = results["results"][0]
    family_code = top_family["hs_code"]  # currently 4-digit

    # 🔥 Get all 10-digit children
    candidates = get_10_digit_children(family_code)

    if not candidates:
        return None

    # Optional: rank them again using embeddings
    query = expand_query(query)
    query_embedding = embed(query)

    scored = []
    for c in candidates:
        node = hs_tree.get(c["hs_code"])

        print("\n=== TEST CHAIN ===")
        print("HS:", c["hs_code"])

        # 🔥 FIX: fallback to parent if 10-digit not found
        if not node:
            parent_code = c["hs_code"][:8]   # try 8-digit
            node = hs_tree.get(parent_code)

        if not node:
            parent_code = c["hs_code"][:6]   # try 6-digit
            node = hs_tree.get(parent_code)

        if not node:
            parent_code = c["hs_code"][:4]   # try 4-digit
            node = hs_tree.get(parent_code)

        # DEBUG
        if node:
            chain = get_full_chain(node, hs_tree)
            print("CHAIN:", chain)
            desc = " → ".join([x["description"] for x in chain if x["description"]])
        else:
            print("STILL NOT FOUND ❌")
            desc = c["description"]
                    
        desc_embedding = embed(desc)

        score = cosine_similarity(query_embedding, desc_embedding)

        node = hs_tree.get(c["hs_code"])
        print("\n=== TEST CHAIN ===")
        print("HS:", c["hs_code"])

        if node:
            chain = get_full_chain(node, hs_tree)
            print("CHAIN:", chain)
        else:
            print("NODE NOT FOUND")
        if node:
            chain = get_full_chain(node, hs_tree)
            full_desc = " → ".join([x["description"] for x in chain if x["description"]])
        else:
            full_desc = desc
        print("DEBUG FINAL OUTPUT:")
        for s in scored[:5]:
            print(s)

        scored.append({
            "hs_code": c["hs_code"],
            "description": full_desc,
            "score": score
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    return scored[:5]  # top 5 best 10-digit matches
