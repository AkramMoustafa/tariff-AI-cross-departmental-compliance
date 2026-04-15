# import asyncio
# import json
# import websockets
# import socket
# import pyodbc
# import pandas as pd
# import math
# from src.api.db import SessionLocal
# from src.api.models import SupplierPortSignal
# from fastapi import APIRouter, HTTPException
# from src.api.models import Supplier
# import time

# router = APIRouter()

# import os

# PORT_API_KEY = os.getenv("PORT_API_KEY")

# from pathlib import Path

# BASE_DIR = Path(__file__).resolve().parent
# db_file = BASE_DIR / "WPI.mdb"

# conn = pyodbc.connect(
#     r"Driver={Microsoft Access Driver (*.mdb, *.accdb)};"
#     rf"DBQ={db_file};"
# )

# ports_df = pd.read_sql("SELECT * FROM [WPI Import]", conn)


# def get_port_coordinates(port_name: str):

#     port = ports_df[
#         ports_df["MAIN_PORT_NAME"].str.upper().str.contains(port_name.upper())
#     ]

#     if port.empty:
#         raise ValueError("Port not found")

#     port = port.iloc[0]

#     lat = port["LATITUDE_DEGREES"] + port["LATITUDE_MINUTES"] / 60
#     lon = port["LONGITUDE_DEGREES"] + port["LONGITUDE_MINUTES"] / 60

#     if port["LATITUDE_HEMISPHERE"] == "S":
#         lat = -lat

#     if port["LONGITUDE_HEMISPHERE"] == "W":
#         lon = -lon

#     return lat, lon
# import traceback

# async def get_port_activity(port_name: str):

#     lat, lon = get_port_coordinates(port_name)

#     delta = 0.1

#     bbox = [
#         [lat - delta, lon - delta],
#         [lat + delta, lon + delta]
#     ]

#     uri = "wss://stream.aisstream.io/v0/stream"

#     ships = {}

#     try:
#         async with websockets.connect(
#             uri,
#             open_timeout=60,
#             family=socket.AF_INET
#         ) as websocket:

#             subscription = {
#                 "APIKey": PORT_API_KEY,
#                 "BoundingBoxes": [bbox]
#             }

#             await websocket.send(json.dumps(subscription))
#             start = time.time()

#             while time.time() - start < 40:   # collect AIS data for 8 seconds

#                 try:
#                     message = await asyncio.wait_for(websocket.recv(), timeout=2)
#                 except asyncio.TimeoutError:
#                     continue
#                 data = json.loads(message)

#                 meta = data.get("MetaData", {})

#                 ship = meta.get("MMSI")
#                 lat_ship = meta.get("latitude")
#                 lon_ship = meta.get("longitude")

#                 if ship is None or lat_ship is None:
#                     continue

#                 msg = data.get("Message", {})
#                 speed = 0

#                 if "PositionReport" in msg:
#                     speed = msg["PositionReport"].get("Sog", 0)

#                 elif "StandardClassBPositionReport" in msg:
#                     speed = msg["StandardClassBPositionReport"].get("Sog", 0)

#                 ships[ship] = {
#                     "lat": lat_ship,
#                     "lon": lon_ship,
#                     "speed": speed
#                 }



#     except Exception:
#         print(f"AIS failed for {port_name}")
#         traceback.print_exc()

#         return {
#             "port": port_name,
#             "ships_in_area": 0,
#             "moving": 0,
#             "anchored": 0,
#             "entering": 0,
#             "leaving": 0,
#             "anchorage_ratio": 0,
#             "mobility_ratio": 0,
#             "estimated_wait_hours": 0,
#             "health_score": 0,
#             "status": "No Data Available"
#         }

#     ships_in_port = len(ships)
#     if ships_in_port == 0:
#         return {
#                 "port": port_name,
#                 "ships_in_area": 0,
#                 "moving": 0,
#                 "anchored": 0,
#                 "entering": 0,
#                 "leaving": 0,
#                 "anchorage_ratio": 0,
#                 "mobility_ratio": 0,
#                 "estimated_wait_hours": 0,
#                 "health_score": 0,
#                 "status": "No Data Available"
#             }

#     moving = 0
#     anchored = 0
#     entering = 0
#     leaving = 0

#     for s in ships.values():

#         spd = s["speed"]

#         if spd > 1:
#             moving += 1
#         else:
#             anchored += 1

#         dist_now = math.sqrt(
#             (s["lat"] - lat)**2 + (s["lon"] - lon)**2
#         )

#         if spd > 1:
#             if dist_now < 0.05:
#                 entering += 1
#             else:
#                 leaving += 1

#     anchorage_ratio = anchored / ships_in_port if ships_in_port else 0
#     mobility_ratio = moving / ships_in_port if ships_in_port else 0

#     wait_time = anchored / max(entering, 1)

#     health_score = int(
#         100 * (
#             0.4 * mobility_ratio +
#             0.3 * (1 - anchorage_ratio) +
#             0.3 * min(1, (entering + leaving) / 20)
#         )
#     )


#     if health_score >= 80:
#         status = "Healthy"
#     elif health_score >= 60:
#         status = "Moderate"
#     elif health_score >= 40:
#         status = "Degraded"
#     elif health_score >= 20:
#         status = "High Risk"
#     else:
#         status = "Critical"

#     return {
#         "port": port_name,
#         "ships_in_area": ships_in_port,
#         "moving": moving,
#         "anchored": anchored,
#         "entering": entering,
#         "leaving": leaving,
#         "anchorage_ratio": round(anchorage_ratio, 2),
#         "mobility_ratio": round(mobility_ratio, 2),
#         "estimated_wait_hours": round(wait_time, 1),
#         "health_score": health_score,
#         "status": status
#     }

   
# @router.post("/suppliers/{supplier_id}/port-analysis")
# async def analyze_supplier_port(supplier_id: int, payload: dict):

#     port = payload.get("port")

#     if not port:
#         raise HTTPException(status_code=400, detail="Port is required")

#     try:

#         data = await get_port_activity(port)

#         db = SessionLocal()

#         signal = SupplierPortSignal(
#             supplier_id=supplier_id,
#             port_name=data["port"],
#             ships_in_area=data["ships_in_area"],
#             moving=data["moving"],
#             anchored=data["anchored"],
#             entering=data["entering"],
#             leaving=data["leaving"],
#             anchorage_ratio=data["anchorage_ratio"],
#             mobility_ratio=data["mobility_ratio"],
#             estimated_wait_hours=data["estimated_wait_hours"],
#             health_score=data["health_score"],
#             status=data["status"]
#         )

#         db.add(signal)
#         db.commit()
#         db.close()

#         return data

#     except ValueError as e:
#         raise HTTPException(status_code=404, detail=str(e))
# @router.get("/ports/list")
# async def list_ports():

#     ports = (
#         ports_df["MAIN_PORT_NAME"]
#         .dropna()
#         .str.upper()
#         .sort_values()
#         .unique()
#         .tolist()
#     )

#     return {"ports": ports}


# def get_first_n_ports(n: int = 10):
#     return (
#         ports_df["MAIN_PORT_NAME"]
#         .dropna()
#         .str.upper()
#         .sort_values()
#         .unique()
#         .tolist()[:n]
#     )
# async def analyze_multiple_ports(limit: int = 10):
#     semaphore = asyncio.Semaphore(2)
#     ports = get_first_n_ports(limit)

#     print("Ports being analyzed:")
#     for p in ports:
#         print(p)

#     async def safe_get_port_activity(port):
#         async with semaphore:
#             return await get_port_activity(port)

#     tasks = [safe_get_port_activity(port) for port in ports]

#     results = await asyncio.gather(*tasks, return_exceptions=True)

#     clean_results = []

#     for port, result in zip(ports, results):

#         if isinstance(result, Exception):
#             print(f"Error processing {port}: {result}")
#             continue

#         clean_results.append(result)

#     return clean_results

# from src.api.models import PortSignal  

# async def save_ports_to_port_signals(limit: int = 10):

#     results = await analyze_multiple_ports(limit)

#     db = SessionLocal()

#     try:
#         for data in results:

#             signal = PortSignal(
#                 port_name=data["port"],
#                 ships_in_area=data["ships_in_area"],
#                 moving=data["moving"],
#                 anchored=data["anchored"],
#                 entering=data["entering"],
#                 leaving=data["leaving"],
#                 anchorage_ratio=data["anchorage_ratio"],
#                 mobility_ratio=data["mobility_ratio"],
#                 estimated_wait_hours=data["estimated_wait_hours"],
#                 health_score=data["health_score"],
#                 status=data["status"]
#             )

#             db.add(signal)

#         db.commit()

#     finally:
#         db.close()

#     return {"saved_ports": len(results)}