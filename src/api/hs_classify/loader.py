"""
hs_classify/loader.py

Attribute-aware HS code classification.
Pipeline: LLM attribute extraction → hybrid semantic+keyword search
→ family ranking → 10-digit resolution.

Differs from hs_search (simple semantic lookup) by accepting structured
product attributes (domain, CNC flag, process type, etc.) to narrow the
prefix before vector search.
"""

import json
import numpy as np
from openai import OpenAI
from sqlalchemy import text

from src.api.db import engine
from src.api.hs_classify.embeddings import embed


# ---------------------------------------------------------------------------
# Domain schemas
# ---------------------------------------------------------------------------

MACHINERY_SCHEMA = {
    "product_type": ["machining_center", "milling_machine", "lathe", "grinder"],
    "process": ["milling", "drilling", "turning", "grinding"],
    "cnc": [True, False],
    "axes": ["3", "4", "5", "unknown"],
    "material": ["metal", "wood", "plastic", "unknown"],
    "condition": ["new", "used", "rebuilt", "unknown"],
    "size_mm": "number_or_null",
}

FOOD_SCHEMA = {
    "category": ["fruit", "vegetable", "meat", "fish", "dairy", "grain", "beverage", "prepared_food"],
    "subtype": None,  # free text
    "state": ["fresh", "frozen", "dried", "chilled", "live"],
    "processed": [True, False],
    "processing_type": ["raw", "cut", "cooked", "canned", "preserved", "smoked", "fermented"],
    "preservation_method": ["none", "salt", "sugar", "vinegar", "oil", "brine"],
    "packaging": ["bulk", "retail", "vacuum", "canned"],
    "organic": [True, False],
    "mixture": [True, False],
}

APPAREL_SCHEMA = {
    "type": ["shirt", "pants", "jacket", "dress", "coat", "suit", "underwear", "sweater"],
    "material": ["cotton", "wool", "polyester", "silk", "synthetic", "blended"],
    "knit_or_woven": ["knit", "woven"],
    "gender": ["men", "women", "unisex", "children"],
    "age_group": ["adult", "children", "infant"],
    "use": ["casual", "formal", "sportswear", "protective"],
    "coated": [True, False],
    "contains_elastane": [True, False],
    "set": [True, False],
}

DOMAIN_SCHEMAS = {
    "machinery": MACHINERY_SCHEMA,
    "apparel": APPAREL_SCHEMA,
    "food": FOOD_SCHEMA,
}

# ---------------------------------------------------------------------------
# Intent anchors + chapter map
# ---------------------------------------------------------------------------

with open("intent_vectors.json") as f:
    INTENT_ANCHORS = json.load(f)

INTENT_CHAPTER_MAP = {
    "apparel": {"61", "62", "42"},
    "raw_material": {"28", "29", "41", "50", "51", "52", "72", "74"},
    "machinery": {"84"},
    "electronics": {"85"},
    "food": {"01", "02", "03", "04", "07", "08", "09", "16", "19"},
}

STOPWORDS = {"machine", "machines", "industrial", "equipment", "device"}

# ---------------------------------------------------------------------------
# OpenAI client (shared within this module)
# ---------------------------------------------------------------------------

_openai_client = OpenAI()


# ---------------------------------------------------------------------------
# Tree node
# ---------------------------------------------------------------------------

class HSNode:
    """Single node in the HS code hierarchy tree."""

    def __init__(self, code: str, description: str, level: int, parent_code: str | None):
        self.code = code
        self.description = description
        self.level = level
        self.parent_code = parent_code
        self.children: list["HSNode"] = []


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Return cosine similarity between two embedding vectors."""
    a_arr = np.array(a)
    b_arr = np.array(b)
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr)))


def normalize_tokens(text: str) -> list[str]:
    """Lowercase-tokenize a string, removing stopwords and short tokens."""
    return [
        t.lower()
        for t in text.split()
        if len(t) > 2 and t.lower() not in STOPWORDS
    ]


def keyword_score(query: str, description: str) -> float:
    """Score a description by keyword overlap with the query."""
    tokens = normalize_tokens(query)
    desc = description.lower()
    score = 5.0 if query.lower() in desc else 0.0
    score += sum(1 for t in tokens if t in desc)
    return score


def detect_gender(query_lower: str) -> str | None:
    """Return 'male', 'female', 'infant', or None based on query terms."""
    if any(x in query_lower for x in ["men", "man", "male", "boys"]):
        return "male"
    if any(x in query_lower for x in ["women", "woman", "female", "girls"]):
        return "female"
    if any(x in query_lower for x in ["infant", "baby", "babies"]):
        return "infant"
    return None


def expand_query(query: str) -> str:
    """Expand abbreviations in the query for better embedding coverage."""
    q = query.lower()
    if "cnc" in q:
        q += " numerically controlled"
    return q


def safe_json_parse(text: str) -> dict:
    """Parse JSON from a string, with a fallback substring search."""
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}") + 1
        try:
            return json.loads(text[start:end])
        except Exception:
            return {}


# ---------------------------------------------------------------------------
# Domain / prefix detection
# ---------------------------------------------------------------------------

def detect_domain(query: str) -> str:
    """Return a domain key ('machinery', 'apparel', 'food') for the query."""
    q = query.lower()
    if any(x in q for x in ["cnc", "machine", "lathe", "mill"]):
        return "machinery"
    if any(x in q for x in ["shirt", "jacket", "pants"]):
        return "apparel"
    if any(x in q for x in ["apple", "meat", "fish", "rice"]):
        return "food"
    return "machinery"  # default


def detect_domain_prefix(query: str) -> str | None:
    """Return a hard-coded HS chapter prefix for known machinery keywords."""
    q = query.lower()
    if "lathe" in q or "turning" in q:
        return "8458"
    if "mill" in q or "drill" in q:
        return "8459"
    return None


def choose_prefix_from_attributes(attrs: dict) -> str | None:
    """Map structured product attributes to a chapter/heading prefix."""
    if attrs.get("cnc") and attrs.get("process") == "milling":
        return "8457"  # machining center
    if attrs.get("process") == "milling":
        return "8459"
    if attrs.get("process") == "turning":
        return "8458"
    return None


# ---------------------------------------------------------------------------
# Intent detection
# ---------------------------------------------------------------------------

def detect_intent(query_embedding: list[float]) -> str:
    """Return the intent label whose anchor vector is closest to the query."""
    best_intent = None
    best_score = -1.0
    for intent, anchor_vec in INTENT_ANCHORS.items():
        score = cosine_similarity(query_embedding, anchor_vec)
        if score > best_score:
            best_score = score
            best_intent = intent
    return best_intent


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

def load_hs_tree() -> dict[str, HSNode]:
    """Load the full HS hierarchy from the DB and return a code→HSNode map."""
    nodes: dict[str, HSNode] = {}

    sql = text("""
        SELECT clean_hs, description, level
        FROM tariffs_basic_data
        WHERE clean_hs IS NOT NULL
    """)

    # Pass 1: create all nodes
    with engine.connect() as conn:
        for r in conn.execute(sql):
            code = str(r.clean_hs).replace(".", "").strip()
            nodes[code] = HSNode(
                code=code,
                description=r.description,
                level=r.level,
                parent_code=None,
            )

    # Pass 2: link parents (longest matching prefix)
    for code, node in nodes.items():
        for length in [8, 6, 4, 2]:
            parent_code = code[:length]
            if parent_code != code and parent_code in nodes:
                node.parent_code = parent_code
                nodes[parent_code].children.append(node)
                break

    return nodes


def retrieve_candidates(
    query_embedding: list[float],
    prefix: str | None = None,
    limit: int = 120,
) -> list:
    """Fetch the top-N most semantically similar HS rows from the DB."""
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


def get_10_digit_children(family_code: str) -> list[dict]:
    """Return all 10-digit HS codes that start with *family_code*."""
    sql = text("""
        SELECT clean_hs, description
        FROM tariffs_basic_data
        WHERE clean_hs LIKE :prefix
          AND LENGTH(clean_hs) = 10
        ORDER BY clean_hs
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql, {"prefix": f"{family_code}%"}).fetchall()
    return [{"hs_code": r.clean_hs, "description": r.description} for r in rows]


# ---------------------------------------------------------------------------
# Hierarchy helpers
# ---------------------------------------------------------------------------

def get_full_chain(node: HSNode, hs_tree: dict[str, HSNode]) -> list[dict]:
    """Walk the parent chain from *node* to root and return an ordered list."""
    chain = []
    current = node
    while current:
        chain.append({
            "hs_code": current.code,
            "description": current.description,
            "level": current.level,
        })
        if not current.parent_code:
            break
        current = hs_tree.get(current.parent_code)
    return list(reversed(chain))


def build_full_description(node: HSNode, hs_tree: dict[str, HSNode]) -> str:
    """Concatenate all ancestor descriptions into a single search string."""
    chain = get_full_chain(node, hs_tree)
    return " ".join(c["description"] for c in chain if c["description"])


# ---------------------------------------------------------------------------
# LLM helpers
# ---------------------------------------------------------------------------

def improve_description_llm(description: str) -> str:
    """Rewrite a raw HS description into a concise commercial product description."""
    prompt = (
        "Rewrite the product description into a precise commercial description.\n\n"
        "RULES:\n"
        "- One sentence only\n"
        "- Include product type + function + use\n"
        "- NO HS codes\n"
        "- NO hierarchy (no arrows, no categories)\n"
        "- Keep it factual, no guessing\n\n"
        f"INPUT:\n{description}"
    )
    try:
        response = _openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You write clean commercial product descriptions."},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return description  # fallback to original


def validate_attributes(attrs: dict, schema: dict) -> dict:
    """Filter/normalise *attrs* so every value conforms to *schema*."""
    validated = {}
    for key, allowed in schema.items():
        value = attrs.get(key)
        if isinstance(allowed, list):
            validated[key] = value if value in allowed else "unknown"
        else:
            validated[key] = value  # free-text or numeric — pass through
    return validated


def ai_extract_attributes(query: str, schema: dict) -> dict:
    """Use OpenAI to extract structured product attributes from *query*."""
    schema_lines = []
    for key, val in schema.items():
        if isinstance(val, list):
            schema_lines.append(f"{key}: {val}")
        else:
            schema_lines.append(f"{key}: free value ({val})")
    schema_description = "\n".join(schema_lines)

    prompt = (
        "Extract structured attributes from the product description.\n\n"
        "STRICT RULES:\n"
        "- Return ONLY valid JSON\n"
        "- Use ONLY values from the schema where applicable\n"
        "- If unknown, use \"unknown\" or null\n"
        "- Do NOT add extra fields\n\n"
        f"SCHEMA:\n{schema_description}\n\n"
        f"INPUT:\n\"{query}\""
    )
    try:
        response = _openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a strict data extraction engine."},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
        )
        raw = response.choices[0].message.content.strip()
        attrs = safe_json_parse(raw)
        return validate_attributes(attrs, schema)
    except Exception:
        return {}


# ---------------------------------------------------------------------------
# Core search
# ---------------------------------------------------------------------------

def hybrid_search(query: str, hs_tree: dict[str, HSNode], attrs: dict) -> dict:
    """
    Attribute-aware hybrid search.

    Combines semantic similarity, keyword overlap, level specificity, intent
    chapter boosting, and gender filtering.  Returns top-5 HS families.
    """
    query = expand_query(query)
    ql = query.lower()
    gender_intent = detect_gender(ql)

    # Fast path for direct HS code lookups
    if query.replace(".", "").isdigit():
        node = hs_tree.get(query)
        if node:
            return {
                "query": query,
                "results": [{
                    "hs_code": node.code,
                    "description": node.description,
                    "level": node.level,
                    "hierarchy": get_full_chain(node, hs_tree),
                }],
            }

    query_embedding = embed(query)
    intent = detect_intent(query_embedding)
    prefix = choose_prefix_from_attributes(attrs)
    rows = retrieve_candidates(query_embedding, prefix=prefix, limit=200)

    tokens = normalize_tokens(query)
    main_token = max(tokens, key=len) if tokens else None

    scored_results = []
    for r in rows:
        node = hs_tree.get(r.clean_hs)
        full_desc = build_full_description(node, hs_tree) if node else (r.description or "")
        desc_lower = full_desc.lower()

        kw_norm = min(keyword_score(query, full_desc) / 10, 1.0)
        level_boost = (r.level or 0) * 0.25

        score = (
            0.75 * (r.semantic_score or 0)
            + 0.20 * kw_norm
            + 0.05 * level_boost
        )

        if "milling" in ql and "milling" in desc_lower:
            score += 0.8

        chapter = r.clean_hs[:2]
        if intent in INTENT_CHAPTER_MAP:
            if chapter in INTENT_CHAPTER_MAP[intent]:
                score += 0.35
            else:
                score -= 0.6

        # Gender boosting
        if gender_intent == "male":
            score += 0.35 if any(x in desc_lower for x in ["men", "boys"]) else -0.15
        elif gender_intent == "female":
            score += 0.35 if any(x in desc_lower for x in ["women", "girls"]) else -0.15
        elif gender_intent == "infant":
            score += 0.35 if "infant" in desc_lower else -0.15
        else:
            if any(x in desc_lower for x in ["men", "women", "boys", "girls", "infant"]):
                score += 0.15

        if "parts" in desc_lower and "parts" not in ql:
            score -= 0.1
        if len(desc_lower.split()) <= 3:
            score -= 0.5
        if main_token and main_token in desc_lower:
            score += 0.2

        scored_results.append({
            "hs_code": r.clean_hs,
            "description": full_desc,
            "level": r.level,
            "score": score,
        })

    scored_results.sort(key=lambda x: x["score"], reverse=True)

    # Group top candidates into 4-digit families
    families: dict[str, dict] = {}
    for r in scored_results[:50]:
        family = r["hs_code"][:4]
        if family not in families:
            families[family] = {
                "family_code": family,
                "family_description": hs_tree[family].description if family in hs_tree else None,
                "max_score": r["score"],
                "products": [],
            }
        node = hs_tree.get(r["hs_code"])
        families[family]["products"].append({
            "hs_code": r["hs_code"],
            "description": r["description"],
            "level": r["level"],
            "score": r["score"],
            "hierarchy": get_full_chain(node, hs_tree) if node else [],
        })
        families[family]["max_score"] = max(families[family]["max_score"], r["score"])

    top_families = sorted(families.values(), key=lambda x: x["max_score"], reverse=True)[:5]

    for fam in top_families:
        fam["children"] = sorted(fam["products"], key=lambda x: x["score"], reverse=True)[:5]

    return {
        "query": query,
        "results": [
            {
                "hs_code": fam["family_code"],
                "description": fam["family_description"],
                "score": fam["max_score"],
            }
            for fam in top_families
        ],
    }


# ---------------------------------------------------------------------------
# 10-digit resolution
# ---------------------------------------------------------------------------

def resolve_to_10_digit(query: str, hs_tree: dict[str, HSNode]) -> list[dict] | None:
    """
    Full pipeline: attribute extraction → family search → 10-digit ranking.

    Returns up to 5 scored 10-digit HS code candidates, or None.
    """
    domain = detect_domain(query)
    schema = DOMAIN_SCHEMAS[domain]
    attrs = ai_extract_attributes(query, schema)

    results = hybrid_search(query, hs_tree, attrs)
    if not results or not results.get("results"):
        return None

    family_code = results["results"][0]["hs_code"]
    candidates = get_10_digit_children(family_code)
    if not candidates:
        return None

    # Re-rank 10-digit children by embedding similarity
    expanded_query = expand_query(query)
    query_embedding = embed(expanded_query)

    scored: list[dict] = []
    for c in candidates:
        code = str(c["hs_code"]).replace(".", "").strip()

        # Find the deepest ancestor node present in the tree
        node = None
        for length in [10, 8, 6, 4, 2]:
            candidate_key = code[:length]
            if candidate_key in hs_tree:
                node = hs_tree[candidate_key]
                break

        if node:
            chain = get_full_chain(node, hs_tree)
            hs_desc = " ".join(x["description"] for x in chain if x["description"])
            full_desc = " → ".join(x["description"] for x in chain if x["description"])
        else:
            hs_desc = c["description"] or ""
            full_desc = hs_desc

        desc_for_embedding = expanded_query + " " + hs_desc
        desc_embedding = embed(desc_for_embedding)
        score = cosine_similarity(query_embedding, desc_embedding)

        scored.append({
            "hs_code": c["hs_code"],
            "description": full_desc,
            "score": score,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:5]
