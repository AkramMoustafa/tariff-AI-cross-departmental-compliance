import sqlite3

db_path = "complianceai.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

queries = [
    "SELECT * FROM tariff_schedules WHERE country = 'US';",
    "SELECT COUNT(*) FROM hs_codes;",
    "SELECT COUNT(*) FROM tariff_lines;",
    """
    SELECT * FROM tariff_lines tl
    JOIN hs_codes h ON tl.hs_code_id = h.id
    JOIN tariff_schedules s ON tl.tariff_schedule_id = s.id
    WHERE h.code = '01013000' AND s.name = 'HTSUS 2025 MFN';
    """
]

for q in queries:
    print("\n=== QUERY ===")
    print(q.strip())
    cur.execute(q)
    rows = cur.fetchall()
    print(f"Rows: {len(rows)}")
    for r in rows[:20]:
        print(r)

conn.close()
