import requests
from collections import defaultdict
import os
API_KEY = os.getenv("OPENWEATHER_API_KEY")

ROUTE_TEMPLATES = {
    "TRANS_PACIFIC_WEST": [
        {"name": "Shanghai", "lat": 31.2, "lon": 121.5},
        {"name": "Mid Pacific", "lat": 25.0, "lon": -150.0},
        {"name": "Los Angeles", "lat": 34.0, "lon": -118.2},
    ],
    "TRANS_PACIFIC_EAST": [
        {"name": "Shanghai", "lat": 31.2, "lon": 121.5},
        {"name": "Panama Canal", "lat": 9.1, "lon": -79.7},
        {"name": "New York", "lat": 40.7, "lon": -74.0},
    ],
    "ASIA_TO_EUROPE_SUEZ": [
        {"name": "Shanghai", "lat": 31.2, "lon": 121.5},
        {"name": "Singapore", "lat": 1.3, "lon": 103.8},
        {"name": "Suez", "lat": 30.0, "lon": 32.5},
        {"name": "Rotterdam", "lat": 51.9, "lon": 4.5},
    ],
    "ASIA_TO_MEXICO": [
        {"name": "Shanghai", "lat": 31.2, "lon": 121.5},
        {"name": "Mid Pacific", "lat": 20.0, "lon": -130.0},
        {"name": "Manzanillo", "lat": 19.1, "lon": -104.3},
    ]
}

def get_region(country_code):
    ASIA = ["CN", "JP", "KR", "SG"]
    US = ["US"]
    MEXICO = ["MX"]
    EUROPE = ["DE", "FR", "NL", "IT", "ES", "UK"]

    if country_code in ASIA:
        return "ASIA"
    elif country_code in US:
        return "US"
    elif country_code in MEXICO:
        return "MEXICO"
    elif country_code in EUROPE:
        return "EUROPE"
    else:
        return "OTHER"

def select_route(origin_country, destination_country, destination_city=None):
    origin_region = get_region(origin_country)
    dest_region = get_region(destination_country)

    if origin_region == "ASIA" and dest_region == "US":
        if destination_city and destination_city.lower() in ["los angeles", "long beach"]:
            return "TRANS_PACIFIC_WEST"
        else:
            return "TRANS_PACIFIC_EAST"

    if origin_region == "ASIA" and dest_region == "MEXICO":
        return "ASIA_TO_MEXICO"

    if origin_region == "ASIA" and dest_region == "EUROPE":
        return "ASIA_TO_EUROPE_SUEZ"

    return "TRANS_PACIFIC_WEST"  # fallback

def extract_country(city_string):
    return city_string.split(",")[1].strip()

def extract_city(city_string):
    return city_string.split(",")[0].strip()

def get_weather_forecast(lat, lon):
    url = "https://api.openweathermap.org/data/2.5/forecast"

    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY,
        "units": "metric"
    }

    response = requests.get(url, params=params)
    data = response.json()

    if "list" not in data:
        print("❌ API ERROR:", data)
        return None

    return data

def compute_severity(day):
    severity = 0

    wind = day.get("wind_speed", 0)
    rain = day.get("rain", 0)
    weather_main = day["weather"][0]["main"]

    if wind > 15:
        severity += 3
    elif wind > 8:
        severity += 2

    if rain > 10:
        severity += 3
    elif rain > 3:
        severity += 2

    if weather_main == "Thunderstorm":
        severity += 4
    elif weather_main == "Rain":
        severity += 2
    elif weather_main == "Snow":
        severity += 3

    return min(severity, 10) / 10.0

def analyze_route(route_points):
    route_result = {}

    for point in route_points:
        forecast = get_weather_forecast(point["lat"], point["lon"])

        if forecast is None:
            continue

        daily_severity = defaultdict(list)

        for item in forecast["list"]:
            date = item["dt_txt"].split(" ")[0]

            wind = item["wind"]["speed"]
            weather_main = item["weather"][0]["main"]
            rain = item.get("rain", {}).get("3h", 0)

            severity = compute_severity({
                "wind_speed": wind,
                "rain": rain,
                "weather": [{"main": weather_main}]
            })

            daily_severity[date].append(severity)

        daily_max = {
            date: max(values)
            for date, values in daily_severity.items()
        }

        max_risk = max(daily_max.values()) if daily_max else 0

        route_result[point["name"]] = {
            "max_5day_risk": round(max_risk, 3)
        }

    return route_result

def compute_weather_from_shipment(user_input):
    origin_country = extract_country(user_input["Origin_City"])
    destination_country = extract_country(user_input["Destination_City"])
    destination_city = extract_city(user_input["Destination_City"])

    # 🔥 select route
    route_key = select_route(origin_country, destination_country, destination_city)

    route_points = ROUTE_TEMPLATES[route_key]

    route_data = analyze_route(route_points)

    route_max = max(
        point["max_5day_risk"] for point in route_data.values()
    ) if route_data else 0

    return round(route_max, 3), route_key

