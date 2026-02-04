import pdfplumber
import pandas as pd
import re

PDF_PATH = "China Tariffs_2024HTSRev5.pdf"
OUTPUT_XLSX = "section301_hts_mapping.xlsx"

hts_pattern = re.compile(r"^\d{4}\.\d{2}\.\d{2}$")
chapter99_pattern = re.compile(r"^9903\.(88|91|92)\.\d{2}$")

rows = []

with pdfplumber.open(PDF_PATH) as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        if not text:
            continue

        lines = text.split("\n")

        for line in lines:
            parts = line.split()
            if len(parts) < 2:
                continue

            left = parts[0].strip()
            right = parts[-1].strip()

            if hts_pattern.match(left) and chapter99_pattern.match(right):
                rows.append({
                    "HTS_Code": left,
                    "Chapter99_Code": right
                })

df = pd.DataFrame(rows).drop_duplicates()

df.to_excel(OUTPUT_XLSX, index=False)

print(f"✅ Mapping written to {OUTPUT_XLSX}")
