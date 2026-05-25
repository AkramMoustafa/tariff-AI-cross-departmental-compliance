import os
from sqlalchemy import create_engine, text
from openai import OpenAI
from collections import defaultdict

DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set")

print("Connecting to DB:", DATABASE_URL.split("@")[-1])

engine = create_engine(DATABASE_URL)
client = OpenAI(api_key=OPENAI_API_KEY)


def embed(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def preload_hierarchy(conn):
    """
    Load all HS rows into memory to avoid recursive SQL per row.
    """
    rows = conn.execute(text("""
        SELECT clean_hs, parent_code, description, level
        FROM tariffs_basic_data
    """)).fetchall()

    data = {}
    children_map = defaultdict(list)

    for r in rows:
        data[r.clean_hs] = {
            "parent": r.parent_code,
            "description": r.description,
            "level": r.level
        }
        if r.parent_code:
            children_map[r.parent_code].append(r.clean_hs)

    return data

def build_search_text(code, data):
    node = data[code]

    parts = []
    current = code

    while current and len(current) >= 4:
        n = data.get(current)
        if not n:
            break
        if n["description"]:
            parts.append(n["description"].lower())
        current = n["parent"]

    parts = list(reversed(parts))

    leaf = parts[-1] if parts else ""
    category = " > ".join(parts[:-1]) if len(parts) > 1 else ""

    return f"""
Product: {leaf}.
Category path: {category}.
HS Code: {code}.
"""


def build_full_hierarchy(clean_hs, data):
    """
    Build full breadcrumb in memory for semantic embedding.
    """

    parts = []
    current = clean_hs

    while current:
        node = data.get(current)
        if not node:
            break

        if node["description"]:
            parts.append(node["description"])

        current = node["parent"]

    parts = list(reversed(parts))

    breadcrumb_text = f"HS Code {clean_hs}. "

    for i, p in enumerate(parts):
        if i == 0:
            breadcrumb_text += f"Category: {p}. "
        elif i == len(parts) - 1:
            breadcrumb_text += f"Specific product: {p}. "
        else:
            breadcrumb_text += f"Subcategory: {p}. "

    return breadcrumb_text


def generate_embeddings(batch_size=100):

    with engine.connect() as conn:

        # sanity check
        total = conn.execute(text("SELECT COUNT(*) FROM tariffs_basic_data")).scalar()
        print("Total rows in DB:", total)

        rows = conn.execute(text("""
            SELECT clean_hs
            FROM tariffs_basic_data
            WHERE embedding IS NULL
            AND LENGTH(clean_hs) >= 4
        """)).fetchall()

        print(f"Rows missing embeddings: {len(rows)}")

        if not rows:
            print("Nothing to embed.")
            return

        data = preload_hierarchy(conn)

        clean_codes = [r.clean_hs for r in rows]

        for i in range(0, len(clean_codes), batch_size):

            batch_codes = clean_codes[i:i+batch_size]

            texts = [build_search_text(code, data) for code in batch_codes]

            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=texts
            )

            embeddings = [d.embedding for d in response.data]

            for code, vector in zip(batch_codes, embeddings):
                conn.execute(text("""
                    UPDATE tariffs_basic_data
                    SET embedding = :embedding
                    WHERE clean_hs = :clean_hs
                """), {
                    "embedding": vector,
                    "clean_hs": code
                })

            conn.commit()  # ← IMPORTANT

            print(f"[{min(i+batch_size, len(clean_codes))}/{len(clean_codes)}] embedded")

    print("Done.")


if __name__ == "__main__":
    generate_embeddings()
