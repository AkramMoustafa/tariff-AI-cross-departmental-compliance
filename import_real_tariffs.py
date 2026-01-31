import os
import pandas as pd
import requests
from io import BytesIO
from sqlalchemy.orm import Session
from src.api.db import SessionLocal, engine
from src.api.models_tariff import TariffLine  


LOCAL_CSV_PATH = "scripts/hts_2026_basic.csv"

def import_tariffs():
    db: Session = SessionLocal()
    
    print(" Starting Tariff Ingestion...")
    
    # 1. Load Data
    if os.path.exists(LOCAL_CSV_PATH):
        print(f"   Reading from local file: {LOCAL_CSV_PATH}")
        df = pd.read_csv(LOCAL_CSV_PATH)
    else:
        print(f" File not found at {LOCAL_CSV_PATH}")
        return

    
    print(f"   Raw rows: {len(df)}")
    
   
    df['clean_hs'] = df['HTS Number'].astype(str).str.replace('.', '', regex=False).str.strip()
    
    # Filter for valid 8-digit or 10-digit codes (exclude category headers like "0101")
    # We look for strings that are exactly 8 or 10 digits
    df = df[df['clean_hs'].str.match(r'^\d{8,10}$')]
    print(f"   Valid codes to ingest: {len(df)}")

    # . Bulk Insert Loop
    count = 0
    batch_size = 1000
    batch = []

    for index, row in df.iterrows():
       
        tariff_item = TariffLine(
            hs_code=row['clean_hs'],
            description=row.get('Description', 'No description'),
            unit_of_measure=row.get('Unit of Quantity', 'kg'),
            # 'General Rate of Duty' corresponds to the MFN rate
            base_rate=clean_rate(row.get('General Rate of Duty', '0')) 
        )
        batch.append(tariff_item)
        
        if len(batch) >= batch_size:
            # Upsert logic could go here, but for now we assume empty table or append
            try:
                db.bulk_save_objects(batch)
                db.commit()
                count += len(batch)
                print(f"    Inserted {count} rows...")
            except Exception as e:
                db.rollback()
                print(f"    Batch failed: {e}")
            batch = []

    # Insert remaining
    if batch:
        try:
            db.bulk_save_objects(batch)
            db.commit()
            print(f"    Inserted final batch. Total: {count + len(batch)}")
        except Exception as e:
            db.rollback()
            print(f"    Final batch failed: {e}")

    db.close()
    print(" Tariff Ingestion Complete")

def clean_rate(rate_str):
    """ Helper to convert 'Free' or '2.5%' to float 0.0 or 0.025 """
    if not isinstance(rate_str, str): return 0.0
    if 'Free' in rate_str: return 0.0
    # Clean string: remove '%' and handle "2.5% on value" cases
    clean = rate_str.replace('%', '').split(' ')[0].strip()
    try:
        return float(clean) / 100.0
    except:
        return 0.0

if __name__ == "__main__":
    import_tariffs()