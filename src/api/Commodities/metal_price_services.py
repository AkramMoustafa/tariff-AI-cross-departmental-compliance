# import requests
# import pandas as pd
# import time
# from datetime import datetime
# from dateutil.relativedelta import relativedelta


# API_KEY = "44b8abe03ad57c8027cde482bbcd916a"
# BASE_URL = "https://api.metalpriceapi.com/v1/"


# def fetch_price_data(symbols, weeks=20, base="USD"):

#     if isinstance(symbols, str):
#         symbols = [symbols]

#     end_date = datetime.today()
#     start_date = end_date - relativedelta(weeks=weeks)

#     all_data = []
#     current_date = start_date

#     while current_date <= end_date:

#         date_str = current_date.strftime("%Y-%m-%d")
#         url = f"{BASE_URL}{date_str}"

#         params = {
#             "api_key": API_KEY,
#             "base": base,
#             "currencies": ",".join(symbols)
#         }

#         try:

#             response = requests.get(url, params=params, timeout=10)
#             response.raise_for_status()

#             data = response.json()

#             if data.get("success"):

#                 row = {"date": date_str}
#                 row.update(data.get("rates", {}))

#                 all_data.append(row)

#                 print(f"[DEBUG] fetched {date_str}")

#             else:

#                 print(f"[WARNING] API error {date_str}: {data.get('error')}")

#         except requests.exceptions.RequestException as e:

#             print(f"[ERROR] request failed {date_str}: {e}")
#             time.sleep(5)

#         current_date += relativedelta(weeks=1)

#     df = pd.DataFrame(all_data)

#     df["date"] = pd.to_datetime(df["date"])
#     df.set_index("date", inplace=True)

#     return df

# gold_df = fetch_price_data("XAU")

# print(gold_df.tail())

# gold_df.to_csv("gold_prices.csv")
import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta
import os
import requests
from dotenv import load_dotenv

from sqlalchemy.orm import Session
from src.api.db import SessionLocal
from src.api.models import ForexRate
from src.api.models import MetalPrice
from src.api.models import EnergyPrice
load_dotenv()  # loads .env file

API_KEY = os.getenv("METAL_API_KEY")
BASE_URL = os.getenv("METAL_API_BASE_URL")


def fetch_price_data(symbols, weeks=20, base="USD"):

    if isinstance(symbols, str):
        symbols = [symbols]

    end_date = datetime.today()
    start_date = end_date - relativedelta(weeks=weeks)

    all_data = []
    current_date = start_date

    while current_date <= end_date:

        date_str = current_date.strftime("%Y-%m-%d")
        url = f"{BASE_URL}{date_str}"

        params = {
            "api_key": API_KEY,
            "base": base,
            "currencies": ",".join(symbols)
        }

        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if data.get("success"):

            row = {"date": date_str}
            row.update(data.get("rates", {}))

            all_data.append(row)

        current_date += relativedelta(weeks=1)
    # print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

    

    df = pd.DataFrame(all_data)
    if df.empty:
        # print(f"No data returned for symbol: {symbols}")
        return df

    # print(df)
    df["date"] = pd.to_datetime(df["date"])
    df.set_index("date", inplace=True)

    return df

def save_forex_rates(df, supplier_id):
    db: Session = SessionLocal()

    try:
        for observation_date, row in df.iterrows():
            for currency_code, rate in row.items():
                forex_rate = ForexRate(
                    supplier_id=supplier_id,
                    observation_date=observation_date,
                    currency_code=currency_code,
                    rate=float(rate)
                )
                db.add(forex_rate)

        db.commit()

        return df.reset_index().to_dict(orient="records")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

def save_to_metalprice(df, supplier_id, symbol):
    db: Session = SessionLocal()

    try:
        for observation_date, row in df.iterrows():

            rate = row[symbol]

            metal = MetalPrice(
                supplier_id=supplier_id,
                observation_date=observation_date,
                metal_code=symbol,
                price=float(rate)
            )

            db.add(metal)

        db.commit()

        return df.reset_index().to_dict(orient="records")

    finally:
        db.close()

def get_metal_prices_from_db(supplier_id: int, db: Session):

    prices = (
        db.query(MetalPrice)
        .filter(MetalPrice.supplier_id == supplier_id)
        .order_by(MetalPrice.observation_date.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "date": p.observation_date,
            "metal": p.metal_code,
            "price": p.price
        }
        for p in prices
    ]

def get_forex_rates_from_db(supplier_id: int, db: Session):

    rates = (
        db.query(ForexRate)
        .filter(ForexRate.supplier_id == supplier_id)
        .order_by(ForexRate.observation_date.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "date": r.observation_date,
            "currency": r.currency_code,
            "rate": r.rate
        }
        for r in rates
    ]

def get_energy_prices_from_db(db: Session):

    energy = (
        db.query(EnergyPrice)
        .order_by(EnergyPrice.observation_date.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "date": e.observation_date,
            "brent": e.brent,
            "natgas": e.natgas,
            "coal": e.coal
        }
        for e in energy
    ]


def extract_energy_data():

    db: Session = SessionLocal()

    try:

        # ---- DATA EXTRACTION ----
        brent_url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILBRENTEU"
        gas_url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DHHNGSP"
        coal_url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=PCOALAUUSDM"

        brent = pd.read_csv(brent_url)
        gas = pd.read_csv(gas_url)
        coal = pd.read_csv(coal_url)

        # ---- rename columns ----
        brent.columns = ["observation_date", "brent"]
        gas.columns = ["observation_date", "natgas"]
        coal.columns = ["observation_date", "coal"]

        # ---- ensure datetime ----
        brent["observation_date"] = pd.to_datetime(brent["observation_date"])
        gas["observation_date"] = pd.to_datetime(gas["observation_date"])
        coal["observation_date"] = pd.to_datetime(coal["observation_date"])

        # ---- convert values to numeric ----
        brent["brent"] = pd.to_numeric(brent["brent"], errors="coerce")
        gas["natgas"] = pd.to_numeric(gas["natgas"], errors="coerce")
        coal["coal"] = pd.to_numeric(coal["coal"], errors="coerce")

        # ---- sort ----
        brent = brent.sort_values("observation_date")
        gas = gas.sort_values("observation_date")
        coal = coal.sort_values("observation_date")
        # print(gas,coal, brent)
        brent = (
            brent.set_index("observation_date")
            .resample("W")
            .last()
            .reset_index()
        )

        gas = (
            gas.set_index("observation_date")
            .resample("W")
            .last()
            .reset_index()
        )

        # ---- keep only last 20 weeks ----
        brent = brent.tail(20)
        gas = gas.tail(20)
        # ---- last 20 weeks ----


        # ---- merge oil + gas ----
        merged = pd.merge_asof(
            brent,
            gas,
            on="observation_date",
            direction="nearest"
        )
        # print("Weekly Brent")
        # print(brent.tail(10))

        # print("Weekly Gas")
        # print(gas.tail(10))
        # ---- attach coal (monthly → last known price) ----
        merged = pd.merge_asof(
            merged.sort_values("observation_date"),
            coal.sort_values("observation_date"),
            on="observation_date",
            direction="backward"
        )

        merged = merged.sort_values("observation_date").reset_index(drop=True)
        
        # print("NaN check:")
        # print(merged.isna().sum())
        # ---- INSERT INTO DATABASE ----
        for _, row in merged.iterrows():
            energy = EnergyPrice(
                observation_date=row["observation_date"],
                brent=row["brent"],
                natgas=row["natgas"],
                coal=row["coal"]
            )

            db.add(energy)

        db.commit()

        return merged.to_dict(orient="records")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


from collections import defaultdict


def calculate_percentage_change(prices):
    """
    Calculates % change between newest and oldest observation.
    prices = [{"date":..., "price":...}]
    """

    if not prices or len(prices) < 2:
        return 0

    newest = prices[0]["price"]
    oldest = prices[-1]["price"]

    if oldest == 0:
        return 0

    return ((newest - oldest) / oldest) * 100


def calculate_forex_change(rates):

    if not rates or len(rates) < 2:
        return 0

    newest = rates[0]["rate"]
    oldest = rates[-1]["rate"]

    if oldest == 0:
        return 0

    return ((newest - oldest) / oldest) * 100


def calculate_energy_change(energy):

    if not energy or len(energy) < 2:
        return 0

    newest = energy[0]["brent"]
    oldest = energy[-1]["brent"]

    if oldest == 0:
        return 0

    return ((newest - oldest) / oldest) * 100


def compute_market_pressure(metals, forex, energy, exposures):

    """
    exposures example:
    {
        "metal": 0.45,
        "energy": 0.25,
        "forex": 0.20,
        "transport": 0.10
    }
    """

    metal_change = calculate_percentage_change(metals)
    forex_change = calculate_forex_change(forex)
    energy_change = calculate_energy_change(energy)

    metal_pressure = exposures["metal"] * metal_change
    forex_pressure = exposures["forex"] * forex_change
    energy_pressure = exposures["energy"] * energy_change

    total_pressure = metal_pressure + forex_pressure + energy_pressure

    score = min(100, abs(total_pressure) * 4)

    drivers = []

    if abs(metal_pressure) > 2:
        drivers.append(f"Metal price change {metal_change:.1f}%")

    if abs(forex_pressure) > 2:
        drivers.append(f"FX movement {forex_change:.1f}%")

    if abs(energy_pressure) > 2:
        drivers.append(f"Energy change {energy_change:.1f}%")

    return {
        "score": round(score, 1),
        "cost_pressure_percent": round(total_pressure, 2),
        "drivers": drivers
    }