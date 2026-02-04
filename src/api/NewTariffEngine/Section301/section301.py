import pandas as pd

# Load the Excel file
df = pd.read_excel("section301_hts_mapping.xlsx")

# The China Section 301 Chapter 99 codes we care about
china_301_codes = {
    "9903.88.01",
    "9903.88.02",
    "9903.88.03",
    "9903.88.15",
}

# Make sure the column is string
df["Chapter99_Code"] = df["Chapter99_Code"].astype(str)

# Filter only China Section 301 rows
china_301_df = df[df["Chapter99_Code"].isin(china_301_codes)]

# Save to CSV
china_301_df.to_csv("china_section_301_only.csv", index=False)

print(f"Extracted {len(china_301_df)} rows to china_section_301_only.csv")
