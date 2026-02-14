from src.api.New.embeddings import embed
from sqlalchemy import text
from src.api.db import engine

def test_query(q):
    vec = embed(q)
    print("Vector length:", len(vec))  # sanity check

    embedding_str = "[" + ",".join(map(str, vec)) + "]"

    sql = """
        SELECT clean_hs,
               description,
               1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
        FROM tariffs_basic_data
        WHERE embedding IS NOT NULL
          AND NOT clean_hs LIKE '99%%'
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT 10
    """

    with engine.connect() as conn:
        rows = conn.execute(text(sql), {"embedding": embedding_str}).fetchall()

    for r in rows:
        print(r.clean_hs, r.description, r.similarity)


if __name__ == "__main__":
    test_query("leather jacket")
