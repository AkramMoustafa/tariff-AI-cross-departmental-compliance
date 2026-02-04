import pandas as pd
from sqlalchemy import create_engine
import os

# -------------------------
# Database connection
# -------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)

# -------------------------
# CSV paths
# -------------------------
SCOPE_CSV_PATH = "china_section_301_only.csv"
CH99_CSV_PATH  = "extracted_9903_88_only.csv"

# ============================================================
# Load Section 301 SCOPE (HS → Chapter 99 mapping)
# ============================================================
print("Loading Section 301 scope (HS-based)...")

df_scope = pd.read_csv(SCOPE_CSV_PATH)

# Expect: HTS_Code, Chapter99_Code
if "HTS_Code" not in df_scope.columns:
    raise RuntimeError("Expected column 'HTS_Code' not found in scope CSV")

# Preserve legal HTS + create normalized clean_hs
df_scope["HTS_Code"] = df_scope["HTS_Code"].astype(str).str.strip()
df_scope["clean_hs"] = df_scope["HTS_Code"].str.replace(".", "", regex=False)

df_scope.to_sql(
    "section301_scope",
    engine,
    if_exists="append",
    index=False
)

print(f"Loaded {len(df_scope)} rows into section301_scope")

# ============================================================
# Load Section 301 Chapter 99 DUTY table
# ============================================================
print("Loading Section 301 Chapter 99 mappings...")

df_ch99 = pd.read_csv(CH99_CSV_PATH)

# Normalize Chapter 99 code if present
if "Chapter99_Code" in df_ch99.columns:
    df_ch99["Chapter99_Code"] = (
        df_ch99["Chapter99_Code"]
        .astype(str)
        .str.strip()
    )

# Optional normalized column (future-proofing)
df_ch99["clean_chapter99"] = (
    df_ch99["Chapter99_Code"]
    .str.replace(".", "", regex=False)
)

df_ch99.to_sql(
    "section301_chapter99",
    engine,
    if_exists="append",
    index=False
)

print(f"Loaded {len(df_ch99)} rows into section301_chapter99")

print("\n✅ Section 301 datasets loaded successfully.")
