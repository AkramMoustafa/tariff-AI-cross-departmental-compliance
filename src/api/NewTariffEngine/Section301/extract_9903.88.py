import pandas as pd

# Input / output files
INPUT_FILE = "htsdata.csv"
OUTPUT_FILE = "extracted_9903_88_only.csv"

# Load CSV as strings (important for HTS codes)
df = pd.read_csv(INPUT_FILE, dtype=str)

# Clean column names (Excel likes hidden spaces)
df.columns = df.columns.str.strip()

# Explicit HS column
hs_col = "HTS Number"

# Normalize HTS values
df[hs_col] = (
    df[hs_col]
    .astype(str)
    .str.strip()
    .str.replace(r"\.00$", "", regex=True)
)

# Target Chapter 99 codes
target_codes = {
    "9903.88.01",
    "9903.88.02",
    "9903.88.03",
    "9903.88.15",
}

# Extract rows
filtered = df[df[hs_col].isin(target_codes)]

# Save extracted rows
filtered.to_csv(OUTPUT_FILE, index=False)

print(f"Extracted {len(filtered)} rows -> {OUTPUT_FILE}")
print(filtered)
