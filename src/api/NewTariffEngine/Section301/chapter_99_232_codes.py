import pandas as pd

INPUT_FILE = "chapter99.csv"          # your source CSV
OUTPUT_FILE = "chapter_99_232.csv"
HTS_COL = "HTS Number"


def normalize_code(code):
    if pd.isna(code):
        return ""
    return str(code).strip()


def main():
    df = pd.read_csv(INPUT_FILE)

    df[HTS_COL] = df[HTS_COL].apply(normalize_code)

    filtered = df[
        df[HTS_COL].str.startswith("9903.80") |
        df[HTS_COL].str.startswith("9903.85")
    ]

    filtered.to_csv(OUTPUT_FILE, index=False)

    print(f"Done. Output written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
