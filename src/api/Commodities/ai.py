import pandas as pd
from sqlalchemy.orm import Session
from src.api.db import SessionLocal
from src.api.models import MetalPrice, ForexRate, EnergyPrice
import pandas as pd
import torch
# from chronos import ChronosPipeline
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

path = os.path.abspath(
    os.path.join(BASE_DIR, "../../../forex_currencies_cleaned.csv")
)
currency_to_country = {
    "AED": "United Arab Emirates",
    "ALL": "Albania",
    "ARS": "Argentina",
    "AUD": "Australia",
    "BDT": "Bangladesh",
    "BGN": "Bulgaria",
    "BHD": "Bahrain",
    "BOB": "Bolivia",
    "BRL": "Brazil",
    "CAD": "Canada",
    "CHF": "Switzerland",
    "CLP": "Chile",
    "CNY": "China",
    "COP": "Colombia",
    "CZK": "Czech Republic",
    "EGP": "Egypt",
    "ETB": "Ethiopia",
    "EUR": "Eurozone",
    "GBP": "United Kingdom",
    "HKD": "Hong Kong",
    "HUF": "Hungary",
    "IDR": "Indonesia",
    "INR": "India",
    "ISK": "Iceland",
    "JMD": "Jamaica",
    "JPY": "Japan",
    "KES": "Kenya",
    "KHR": "Cambodia",
    "KRW": "South Korea",
    "KWD": "Kuwait",
    "KZT": "Kazakhstan",
    "LAK": "Laos",
    "LKR": "Sri Lanka",
    "MAD": "Morocco",
    "MMK": "Myanmar",
    "MNT": "Mongolia",
    "MXN": "Mexico",
    "MYR": "Malaysia",
    "NGN": "Nigeria",
    "NOK": "Norway",
    "NZD": "New Zealand",
    "OMR": "Oman",
    "PEN": "Peru",
    "PHP": "Philippines",
    "PLN": "Poland",
    "PYG": "Paraguay",
    "QAR": "Qatar",
    "RON": "Romania",
    "RUB": "Russia",
    "SAR": "Saudi Arabia",
    "SGD": "Singapore",
    "THB": "Thailand",
    "TRY": "Turkey",
    "TTD": "Trinidad and Tobago",
    "TWD": "Taiwan",
    "TZS": "Tanzania",
    "UAH": "Ukraine",
    "UGX": "Uganda",
    "VND": "Vietnam",
    "ZAR": "South Africa"
}

def load_macro_dataset():

    db: Session = SessionLocal()

    metals = pd.read_sql(db.query(MetalPrice).statement, db.bind)
    forex = pd.read_sql(db.query(ForexRate).statement, db.bind)
    energy = pd.read_sql(db.query(EnergyPrice).statement, db.bind)

    db.close()

    metals = metals.pivot(
        index="observation_date",
        columns="metal_code",
        values="price"
    )

    forex = forex.pivot(
        index="observation_date",
        columns="currency_code",
        values="rate"
    )

    energy = energy.set_index("observation_date")

    df = metals.join(forex, how="outer")
    df = df.join(energy, how="outer")

    df = df.sort_index()

    return df

# def predict_trend(df, target_feature, weeks_ahead=3):

#     if target_feature not in df.columns:
#         raise ValueError(f"{target_feature} not found")

#     series = torch.tensor(df[target_feature].values, dtype=torch.float32)

#     pipeline = ChronosPipeline.from_pretrained(
#         "amazon/chronos-t5-small"
#     )

#     forecast = pipeline.predict(
#         series,
#         prediction_length=weeks_ahead
#     )

#     forecast_values = forecast[0][0].tolist()

#     last_price = series[-1].item()
#     future_price = forecast_values[-1]

#     if future_price > last_price:
#         trend = "UP"
#     elif future_price < last_price:
#         trend = "DOWN"
#     else:
#         trend = "FLAT"

#     return {
#         "latest_price": last_price,
#         "forecast": forecast_values,
#         "trend": trend
#     }

def predict_trend(df, target_feature, weeks_ahead=3):

    if target_feature not in df.columns:
        raise ValueError(f"{target_feature} not found")

    series = df[target_feature].dropna()

    last_price = series.iloc[-1]
    prev_price = series.iloc[-5]  # 4 weeks ago

    if last_price > prev_price:
        trend = "UP"
    elif last_price < prev_price:
        trend = "DOWN"
    else:
        trend = "FLAT"

    return {
        "latest_price": float(last_price),
        "forecast": [],
        "trend": trend
    }

def calculate_macro_risks(df):

    latest = df.iloc[-1]      # most recent week
    past = df.iloc[-5]        # 4 weeks ago

    oil_move = ((latest["brent"] - past["brent"]) / past["brent"]) * 100
    gas_move = ((latest["natgas"] - past["natgas"]) / past["natgas"]) * 100

    return [
        {
            "label": "Oil",
            "change": round(oil_move, 2),
            "detail": "4-week move"
        },
        {
            "label": "Natural Gas",
            "change": round(gas_move, 2),
            "detail": "4-week move"
        }
    ]

def load_forex_data(path):
    df = pd.read_csv(path)

    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()

    df = df.select_dtypes(include=["number"])
    df = df.loc[:, df.isna().mean() < 0.25]
    df = df.ffill().bfill()

    cutoff_date = df.index.max() - pd.DateOffset(months=26)
    df = df.loc[df.index >= cutoff_date]

    return df

def compute_forex_features(df):
    returns = df.pct_change()

    volatility = returns.rolling(7).std()
    shock = returns.abs().rolling(3).mean()
    trend = returns.rolling(7).mean()
    weakness = (-trend).clip(lower=0)

    latest_vol = volatility.mean()
    latest_shock = shock.mean()
    latest_weakness = weakness.mean()

    return latest_vol, latest_shock, latest_weakness


def minmax(s):
    denom = s.max() - s.min()
    if pd.isna(denom) or denom == 0:
        return pd.Series(0.0, index=s.index)
    return (s - s.min()) / denom

def normalize_scores(vol, shock, weakness):
    vol_score = minmax(vol.fillna(0))
    shock_score = minmax(shock.fillna(0))
    weakness_score = minmax(weakness.fillna(0))

    return vol_score, shock_score, weakness_score

def compute_country_risk_scores(vol_score, shock_score, weakness_score):
    return (
        0.5 * vol_score +
        0.3 * shock_score +
        0.2 * weakness_score
    )

def build_country_risk_df(country_risk_score, vol_score, shock_score, weakness_score, currency_map):
    df = pd.DataFrame({
        "Currency": country_risk_score.index,
        "Country": [currency_map.get(c, c) for c in country_risk_score.index],
        "Volatility": vol_score.values,
        "Shock": shock_score.values,
        "Weakness": weakness_score.values,
        "Country_Risk_Score": country_risk_score.values
    })

    return df.sort_values("Country_Risk_Score", ascending=False)
def build_forex_risk_pipeline(path, currency_map):
    df = load_forex_data(path)

    vol, shock, weakness = compute_forex_features(df)

    vol_score, shock_score, weakness_score = normalize_scores(vol, shock, weakness)

    country_risk_score = compute_country_risk_scores(
        vol_score, shock_score, weakness_score
    )

    country_risk_df = build_country_risk_df(
        country_risk_score,
        vol_score,
        shock_score,
        weakness_score,
        currency_map
    )

    global_risk = country_risk_score.mean()

    return country_risk_df, global_risk

def get_country_risk_score(country_name, path, currency_map):
    
    # STEP 1: Build pipeline
    country_risk_df, _ = build_forex_risk_pipeline(path, currency_map)

    # STEP 2: Normalize input
    country_name = country_name.lower().strip()

    df_copy = country_risk_df.copy()
    df_copy["Country_lower"] = df_copy["Country"].str.lower()

    row = df_copy[df_copy["Country_lower"] == country_name]

    if row.empty:
        return {
            "found": False,
            "country": country_name,
            "message": "Country not found"
        }

    row = row.iloc[0]

    return {
        "found": True,
        "country": row["Country"],
        "currency": row["Currency"],
        "risk_score": float(row["Country_Risk_Score"]),
        "volatility": float(row["Volatility"]),
        "shock": float(row["Shock"]),
        "weakness": float(row["Weakness"])
    }