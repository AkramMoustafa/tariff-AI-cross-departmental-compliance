import pandas as pd

# Load the Excel file
df = pd.read_excel("section301_hts_mapping.xlsx")

# Get unique Chapter 99 codes
unique_values = df["Chapter99_Code"].dropna().astype(str).unique()

print(f"Unique values ({len(unique_values)}):")
for v in sorted(unique_values):
    print(v)
