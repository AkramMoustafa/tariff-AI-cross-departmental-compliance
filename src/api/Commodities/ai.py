import pandas as pd
from sqlalchemy.orm import Session
from src.api.db import SessionLocal
from src.api.models import MetalPrice, ForexRate, EnergyPrice
import pandas as pd
import torch
from chronos import ChronosPipeline

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

def predict_trend(df, target_feature, weeks_ahead=3):

    if target_feature not in df.columns:
        raise ValueError(f"{target_feature} not found")

    series = torch.tensor(df[target_feature].values, dtype=torch.float32)

    pipeline = ChronosPipeline.from_pretrained(
        "amazon/chronos-t5-small"
    )

    forecast = pipeline.predict(
        series,
        prediction_length=weeks_ahead
    )

    forecast_values = forecast[0][0].tolist()

    last_price = series[-1].item()
    future_price = forecast_values[-1]

    if future_price > last_price:
        trend = "UP"
    elif future_price < last_price:
        trend = "DOWN"
    else:
        trend = "FLAT"

    return {
        "latest_price": last_price,
        "forecast": forecast_values,
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


