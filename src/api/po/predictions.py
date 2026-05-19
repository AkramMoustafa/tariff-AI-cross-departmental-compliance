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

COUNTRY_MAP = {

    "china": "CN",

    "germany": "DE",

    "india": "IN",

    "japan": "JP",

    "brazil": "BR",

    "netherlands": "NL",

    "united states": "US",

    "singapore": "SG",

    "uk": "UK"
}
def normalize_transport(method):

    method = (method or "").lower()

    if "air" in method:
        return "Air"

    elif "sea" in method:
        return "Sea"

    return "Land"


def normalize_route(route):

    mapping = {

        "Panama":
        "Pacific",

        "Transpacific":
        "Pacific",

        "Transatlantic":
        "Atlantic",

        "Suez":
        "Suez",

        "Asia-Europe":
        "Suez"
    }

    return mapping.get(
        route,
        "Pacific"
    )


def normalize_product(product):

    mapping = {

        "Machinery":
        "Raw Materials",

        "Electronics":
        "Consumer Electronics",

        "Food":
        "Perishable Foods",

        "Pharmaceuticals":
        "Pharmaceuticals"
    }

    return mapping.get(
        product,
        "Raw Materials"
    )
def run_prediction(po):

    print("\n" + "="*60)
    print("🚀 START PREDICTION")
    print("="*60)

    # 🔥 SAFE extraction
    origin_city = po.origin_city

    origin_country = COUNTRY_MAP.get(
        (po.origin_country or "").lower(),
        po.origin_country
    )

    destination_city = po.destination_city

    destination_country = COUNTRY_MAP.get(
        (po.destination_country or "").lower(),
        po.destination_country
    )

    geo_val = po.geo_risk or 0
    weather_val = po.weather_risk or 0
    macro_val = po.macro_risk or 0

    print("\n===== RAW VALUES =====")

    print("Origin:", origin_city, origin_country)
    print("Destination:", destination_city, destination_country)

    print("Geo:", geo_val)
    print("Weather:", weather_val)
    print("Macro:", macro_val)

    print("Shipping:", po.shipping)
    print("Weight:", po.weight)

    print("Route:", po.route_type)
    print("Transport:", po.shipping_method)

    print("\nTRAIN COUNTRIES")

    print([
        c for c in training_columns
        if "Origin_Country" in c
    ])

    print("\nTRAIN COUNTRIES")

    print([
        c for c in training_columns
        if "Origin_Country" in c
    ])

    print("\nTRAIN DEST COUNTRIES")

    print([
        c for c in training_columns
        if "Destination_Country" in c
    ])

    print("\nTRAIN ROUTES")

    print([
        c for c in training_columns
        if "Route_Type" in c
    ])

    print("\nTRAIN TRANSPORT")

    print([
        c for c in training_columns
        if "Transportation_Mode" in c
    ])

    print("\nTRAIN PRODUCTS")

    print([
        c for c in training_columns
        if "Product_Category" in c
    ])
    # --- MODEL INPUT ---
    model_input = {

        "Origin_City":
        f"{origin_city}, {origin_country}",

        "Destination_City":
        f"{destination_city}, {destination_country}",

        "Route_Type":
        normalize_route(
            po.route_type
        ),

        "Transportation_Mode":
        normalize_transport(
            po.shipping_method
        ),

        "Product_Category":
        normalize_product(
            po.product_category
        ),

        "Order_Date":
        "2026-01-01",

        "Base_Lead_Time_Days":
        28,

        "Scheduled_Lead_Time_Days":
        31,

        "Geopolitical_Risk_Index":
        float(geo_val),

        "Weather_Severity_Index":
        float(weather_val),

        "Inflation_Rate_Pct":
        float(macro_val),

        "Shipping_Cost_USD":
        float(po.shipping or 0),

        "Order_Weight_Kg":
        float(po.weight or 0)
    }

    print("\n===== MODEL INPUT =====")

    for k, v in model_input.items():
        print(k, ":", v)

    # --- DATAFRAME PREP ---
    df = pd.DataFrame([model_input])

    # SAME preprocessing as training
    df[
        ["Origin_City_Name", "Origin_Country"]
    ] = df[
        "Origin_City"
    ].str.split(
        ",",
        n=1,
        expand=True
    )

    df[
        [
            "Destination_City_Name",
            "Destination_Country"
        ]
    ] = df[
        "Destination_City"
    ].str.split(
        ",",
        n=1,
        expand=True
    )

    df["Origin_Country"] = (
        df["Origin_Country"]
        .str.strip()
    )

    df["Destination_Country"] = (
        df["Destination_Country"]
        .str.strip()
    )
    df["Order_Date"] = pd.to_datetime(
    df["Order_Date"]
    )

    df["Order_Year"] = (
        df["Order_Date"].dt.year
    )

    df["Order_Month"] = (
        df["Order_Date"].dt.month
    )

    df["Order_Day"] = (
        df["Order_Date"].dt.day
    )

    df["Order_DayOfWeek"] = (
        df["Order_Date"].dt.dayofweek
    )

    # remove cities exactly like training
    df = df.drop(
        columns=[
            "Origin_City",
            "Destination_City",
            "Origin_City_Name",
            "Destination_City_Name",
            "Order_Date"
        ]
    )

    # same encoding as training
    df = pd.get_dummies(
        df,
        columns=[
            "Origin_Country",
            "Destination_Country",
            "Route_Type",
            "Transportation_Mode",
            "Product_Category"
        ]
    )

    print("\n===== ENCODED COLUMNS =====")
    print(df.columns.tolist())

    extra = set(df.columns) - set(training_columns)

    print("\n===== EXTRA COLUMNS =====")
    print(extra)

    df = df.reindex(
        columns=training_columns,
        fill_value=0
    )

    print("\nTRAIN ROUTES")

    print([
        c for c in training_columns
        if "Route_Type" in c
    ])

    print("\nTRAIN PRODUCTS")

    print([
        c for c in training_columns
        if "Product_Category" in c
    ])

    important = [

        "Weather_Severity_Index",

        "Geopolitical_Risk_Index",

        "Inflation_Rate_Pct",

        "Base_Lead_Time_Days",

        "Scheduled_Lead_Time_Days",

        "Shipping_Cost_USD",

        "Order_Weight_Kg"
    ]

    print("\n===== BEFORE SCALING =====")
    print(df[important].T)

    # --- SCALE (same as Colab) ---
    df["Weather_Severity_Index"] *= 10
    df["Geopolitical_Risk_Index"] *= 10
    df["Inflation_Rate_Pct"] *= 10

    print("\n===== FINAL MODEL VALUES =====")
    print(df[important].T)

    print("\n===== FINAL DATA SENT TO MODEL =====")

    print(df.T)

    print("\n===== ACTIVE FEATURES =====")

    for col in df.columns:

        val = df.iloc[0][col]

        if val != 0:
            print(col, "=", val)

    print("\n===== COUNTRY FEATURES ENTERING MODEL =====")

    for c in df.columns:

        if "Origin_Country" in c:

            if df.iloc[0][c] == 1:
                print("ORIGIN:", c)

    for c in df.columns:

        if "Destination_Country" in c:

            if df.iloc[0][c] == 1:
                print("DEST:", c)

    print("\n===== SHAPE =====")

    print(df.shape)
    # --- PREDICT DELAY ---
    delay_pred = xgb_model.predict(df)

    delay = float(
        np.clip(
            delay_pred[0],
            0,
            None
        )
    )

    print("\n===== DELAY =====")
    print(delay)

    # --- PREDICT ACTION ---
    df_cls = df.copy()

    df_cls[
        "predicted_delay"
    ] = delay

    df_cls = df_cls.reindex(
        columns=cls_columns,
        fill_value=0
    )

    action_pred = action_model.predict(
        df_cls
    )

    action = action_pred[0]

    print("\n===== ACTION =====")
    print(action)

    print("\n" + "="*60)
    print("✅ DONE")
    print("="*60)

    return {
        "delay": round(delay, 2),
        "action": action
    }