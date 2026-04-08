from urllib.parse import urlparse
import pandas as pd
from src.api.db import SessionLocal
from src.api.models import new_suppliers
import os

from src.api.db import get_db
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(BASE_DIR, "NYSERDA_New_York_Offshore_Wind_Supply_Chain_Dataset.csv")

def clean_text(val):
    if val is None or pd.isna(val):
        return None

    val = str(val).strip()
    return val if val else None

def clean_contact(val):
    if val is None or pd.isna(val):
        return None

    return str(val).strip().title()

def clean_website(url):
    if url is None or pd.isna(url):
        return None

    url = str(url).strip()

    if url.lower() in ["not provided", ""]:
        return None

    if not url.startswith("http"):
        return f"https://{url}"

    return url
def parse_bool(val):
    if not val:
        return None

    val = str(val).strip().lower()

    if val in ["yes", "true", "1"]:
        return True
    if val in ["no", "false", "0"]:
        return False

    return None

def parse_point(geo_str):
    if geo_str is None or pd.isna(geo_str):
        return None, None

    geo_str = str(geo_str)

    if "POINT" not in geo_str:
        return None, None

    try:
        coords = (
            geo_str.replace("POINT", "")
            .replace("(", "")
            .replace(")", "")
            .strip()
        )

        lon, lat = map(float, coords.split())

        return lat, lon

    except Exception:
        return None, None


def normalize_state(state):
    if state is None or pd.isna(state):
        return None

    state = str(state).strip()

    STATE_MAP = {
        "NY": "New York",
        "N.Y.": "New York",
    }

    return STATE_MAP.get(state, state)

def clean_name(val):
    return clean_text(val)

def clean_postal_code(val):
    return clean_text(val)
def clean_contact(val):
    text = clean_text(val)
    return text.title() if text else None


def extract_domain(url):
    if not url:
        return None
    try:
        return urlparse(url).netloc
    except:
        return None
    
BATCH_SIZE = 500


def transform_row(row):
    lat, lon = parse_point(row.get("Georeference"))

    return new_suppliers(
        name=clean_text(row.get("Organization Name")),
        main_category=clean_text(row.get("Organization Type (Main Category)")),
        website=clean_website(row.get("Website")),
        country=clean_text(row.get("Country")),
        state=normalize_state(row.get("State or Province")),
        city=clean_text(row.get("City")),
        address_line1=clean_text(row.get("Street Address 1")),
        address_line2=clean_text(row.get("Street Address 2")),
        postal_code=clean_postal_code(row.get("Postal Code")),
        contact_first_name=clean_contact(row.get("Contact First Name")),
        contact_last_name=clean_contact(row.get("Contact Last Name")),
        email=clean_text(row.get("Email")),
        phone=clean_text(row.get("Phone_1")),
        bio=clean_text(row.get("Organization Bio")),
        certified_mwbe=parse_bool(row.get("Certified MWBE")),
        certified_sdvob=parse_bool(row.get("Certified_SDVOB")),
        us_steel=parse_bool(row.get("US_Steel")),
        latitude=lat,
        longitude=lon,
    )


def run_import(file_path):
    df = pd.read_csv(file_path)

    db = SessionLocal()

    buffer = []
    count = 0

    for _, row in df.iterrows():
        supplier = transform_row(row)

        # skip bad rows
        if not supplier.name:
            continue

        buffer.append(supplier)

        if len(buffer) >= BATCH_SIZE:
            db.bulk_save_objects(buffer)
            db.commit()
            buffer = []
            print(f"Inserted {count} records...")

        count += 1

    # insert remaining
    if buffer:
        db.bulk_save_objects(buffer)
        db.commit()

    db.close()
    print(f"✅ Import complete: {count} records")


if __name__ == "__main__":
    
    run_import(file_path)