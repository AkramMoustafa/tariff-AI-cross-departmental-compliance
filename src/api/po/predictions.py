import os
import pandas as pd
import numpy as np
import joblib

# --- LOAD MODELS ONCE ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "ml")

xgb_model = joblib.load(os.path.join(MODEL_DIR, "xgb_model.pkl"))
action_model = joblib.load(os.path.join(MODEL_DIR, "action_model.pkl"))

training_columns = joblib.load(os.path.join(MODEL_DIR, "columns.pkl"))
cls_columns = joblib.load(os.path.join(MODEL_DIR, "cls_columns.pkl"))


# --- HELPER FUNCTION ---
def normalize_transport(method):
    method = (method or "").lower()
    if "air" in method:
        return "Air"
    elif "sea" in method:
        return "Sea"
    return "Land"


# --- MAIN PIPELINE ---
def run_prediction(po):

    # 🔥 SAFE extraction
    origin_city = po.origin_city
    origin_country = po.origin_country
    destination_city = po.destination_city
    destination_country = po.destination_country

    geo_val = po.geo_risk or 0
    weather_val = po.weather_risk or 0
    macro_val = po.macro_risk or 0

    # --- MODEL INPUT ---
    model_input = {
        "Origin_City": f"{origin_city}, {origin_country}",
        "Destination_City": f"{destination_city}, {destination_country}",
        "Route_Type": po.route_type,
        "Transportation_Mode": normalize_transport(po.shipping_method),
        "Product_Category": po.product_category,
        "Order_Date": "2026-01-01",

        "Base_Lead_Time_Days": 28,
        "Scheduled_Lead_Time_Days": 31,

        "Geopolitical_Risk_Index": float(geo_val),
        "Weather_Severity_Index": float(weather_val),
        "Inflation_Rate_Pct": float(macro_val),

        "Shipping_Cost_USD": float(po.shipping or 0),
        "Order_Weight_Kg": float(po.weight or 0)
    }

    # --- DATAFRAME PREP ---
    df = pd.DataFrame([model_input])

    df[["Origin_City_Name", "Origin_Country"]] = df["Origin_City"].str.split(", ", expand=True)
    df[["Destination_City_Name", "Destination_Country"]] = df["Destination_City"].str.split(", ", expand=True)

    df.drop(columns=["Origin_City", "Destination_City"], inplace=True)

    df = pd.get_dummies(df)
    df = df.reindex(columns=training_columns, fill_value=0)

    # --- SCALE (same as Colab) ---
    df["Weather_Severity_Index"] *= 10
    df["Geopolitical_Risk_Index"] *= 10
    df["Inflation_Rate_Pct"] *= 10

    # --- PREDICT DELAY ---
    delay_pred = xgb_model.predict(df)
    delay = float(np.clip(delay_pred[0], 0, None))

    # --- PREDICT ACTION ---
    df_cls = df.copy()
    df_cls["predicted_delay"] = delay
    df_cls = df_cls.reindex(columns=cls_columns, fill_value=0)

    action_pred = action_model.predict(df_cls)
    action = action_pred[0]

    return {
        "delay": round(delay, 2),
        "action": action
    }