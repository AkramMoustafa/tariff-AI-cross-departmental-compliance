from src.api.po.predictions import run_prediction

payload = {
    "origin_city": "Shenzhen",
    "origin_country": "China",
    "destination_city": "Rotterdam",
    "destination_country": "Netherlands",
    "shipping_method": "sea",
    "route_type": "Suez",
    "product_category": "Industrial Equipment",
    "shipping": 75000,
    "weight": 1000
}

geo_result = {
    "geopolitical_risk": 0.4
}

weather_risk = 0.4  # IMPORTANT: your function expects a number

origin_macro = {
    "combined_risk_score": 0.28
}

result = run_prediction(
    payload,
    geo_result,
    weather_risk,
    origin_macro
)

print("Prediction Result:", result)