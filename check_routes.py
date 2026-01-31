
from src.api.main_api import app
from fastapi.routing import APIRoute

print(" Listing all active API routes:")
print("-" * 50)
for route in app.routes:
    if isinstance(route, APIRoute):
        print(f"{route.methods}  {route.path}")
print("-" * 50)