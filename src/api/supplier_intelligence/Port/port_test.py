from src.api.db import engine
from sqlalchemy import text

def list_tables():
    query = text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)

    with engine.connect() as conn:
        result = conn.execute(query)

        print("Tables in public schema:\n")
        for row in result:
            print(row[0])

if __name__ == "__main__":
    list_tables()