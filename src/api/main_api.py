
from src.api.email_service import send_demo_email
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException,
    BackgroundTasks,
    Request,
    Response,
    APIRouter,Query,
)
from src.api.po.po_routes import router as po_router
from src.api.db import get_db, engine, SessionLocal
from src.api.NewTariffEngine.tariff_route import router as tariff_new_engine_router
from src.api.sanctions import (
    load_sanctions,
    get_sanctions,
    sanctions_health,
    start_background_refresh,
)

from src.api.supplier_intelligence.supplier_intelligence import router as supplier_intelligence

import asyncio
import json
import websockets
import socket
import pyodbc
import math
import logging
logger = logging.getLogger(__name__)
from src.api.country_risk.services import run_news_pipeline
from src.api.country_risk.routes import router as news_risk_router
from src.api.New.newRoute import router as hs_router

from src.api.New.tariffmodel import init_hs
from src.api.New1.newRoute import router as hs_router1
from src.api.New.tariffmodel import init_hs

from  src.api.stripe.stripe_route import router as stripe_router

from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from src.core.store_file_data import save_extraction

from src.api.models import FileExtraction

import os
import sys
import io
import json
import tempfile
import hashlib
import logging
import traceback
import subprocess
from src.api.models import DemoRequest

import io

from uuid import uuid4
from datetime import datetime
from fastapi import Request, HTTPException


from uuid import uuid4
from pathlib import Path

from src.api.models import User
from dotenv import load_dotenv

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from src.api.models import (
    Supplier
)
from PyPDF2 import PdfReader


from fastapi import HTTPException

from src.api.sanctions import search_sanctions
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi import APIRouter
from src.core.client import safe_chat_completion
import os
from uuid import uuid4
from fastapi import Request, Response
import sys, subprocess, os

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from contextlib import asynccontextmanager
from src.api.order_routes import router as order_router
import threading
import time
from src.api.auth_backend import router as auth_router, get_current_user

from src.api.tariff_routes import router as tariff_router

from src.api.Commodities.metal_price_route import router as commodities_router

from src.api.Commodities.ai_router import router as ai_router
from src.api.auth_backend import router as auth_router

from src.api.cli.team_routes.control_owner_route import router as control_owner_router
from src.api.cli.team_routes.department_owner_route import router as department_owner_router
from src.api.cli.team_routes.executive_route import router as executive_router
from src.api.cli.team_routes.tenant_admin_route import router as compliance_owner_router
from src.api.API_CLIENT.api_client_router import router as api_client_router
from src.api.API_USER.client_users import router as client_user_routes
from src.api.public.v1 import router as public_v1_router
from src.api.NewTariffEngine.tariff_pdf import router as tariff_pdf_router
from src.api.agents.agent_routes import router as agent_router


def cache_refresher():
    while True:
        time.sleep(60 * 60 * 24)  # 24 hours
        print("[CacheRefresher] Refreshing Federal Register package cache...")

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("[Startup] Initializing HS Tree...")
    try:
        init_hs()
        print("[Startup] HS Tree loaded successfully")
    except Exception as e:
        print(f"[ERROR] HS initialization failed: {e}")

    print("[Startup] Building Federal Register cache...")

    print("[Startup] Loading sanctions from S3...")
    try:
        load_sanctions()
        start_background_refresh(interval_hours=24)
    except Exception as e:
        print(f"[WARN] Sanctions failed to load at startup: {e}")

    print("[Startup] Launching 24h refresher...")
    threading.Thread(target=cache_refresher, daemon=True).start()



    print("[Startup] Starting news risk pipeline scheduler...")

    scheduler.add_job(
        run_news_pipeline,
        trigger="interval",
        hours=1,
        args=["germany"],
        id="news_pipeline",
        replace_existing=True
    )

    if not scheduler.running:
        scheduler.start()

    yield

    print("[Shutdown] Stopping scheduler...")
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)


logging.basicConfig(level=logging.INFO)
app.include_router(tariff_router, prefix="/api/v1/tariff", tags=["Tariff"])
app.include_router(public_v1_router)
app.include_router(tariff_new_engine_router)
app.include_router(supplier_intelligence)

@app.get("/api/sanctions/search")
def sanctions_search(
    q: str | None = None,
    entity_type: str | None = None,
    country: str | None = None,
):
    return search_sanctions(q, entity_type, country)

# Check if Render secret file exists, else fallback to local
if os.path.exists("/etc/secrets/.env"):
    load_dotenv("/etc/secrets/.env", override=True)
    print("Loaded environment from /etc/secrets/.env (Render)")
else:
    load_dotenv(".env", override=True)
    print("Loaded environment from local .env")


# SECURITY IMPROVEMENT: Load CORS origins from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
if not ALLOWED_ORIGINS or ALLOWED_ORIGINS == [""]:
    # Fallback for development only
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://localhost:8501",
    ]
    print("WARNING: Using default CORS origins (development mode)")
else:
    print(f"Using CORS origins from environment: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=3600,
)
app.include_router(auth_router)
app.include_router(stripe_router)
app.include_router(control_owner_router)
app.include_router(department_owner_router)
app.include_router(executive_router)
app.include_router(compliance_owner_router)
app.include_router(api_client_router)
app.include_router(client_user_routes)
app.include_router(tariff_pdf_router, prefix="/api")
app.include_router(po_router, prefix="/api/po", tags=["PO Extraction"])
app.include_router(agent_router, prefix="/api/po", tags=["PO Agent"])
app.include_router(news_risk_router)

# app.include_router(port_activity_router, prefix="/api/v1", tags=["Ports"])
app.include_router(commodities_router)
app.include_router(ai_router)

@app.get("/api/internal/sanctions/health")
def sanctions_health_check():
    return sanctions_health()
# Check if Render secret file exists, else fallback to local
if os.path.exists("/etc/secrets/.env"):
    load_dotenv("/etc/secrets/.env", override=True)
    print("Loaded environment from /etc/secrets/.env (Render)")
else:
    load_dotenv(".env", override=True)
    print("Loaded environment from local .env")


# SECURITY ENHANCEMENT: Global exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    logger.warning(f"HTTP {exc.status_code} | Path: {request.url.path} | Detail: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "path": str(request.url.path)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unhandled exception | Path: {request.url.path} | Error: {str(exc)}", exc_info=True)
    
    # Don't expose internal errors in production
    if os.getenv("ENV") == "production":
        detail = "An internal error occurred"
    else:
        detail = str(exc)
    
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": detail,
            "path": str(request.url.path)
        }
    )

@app.exception_handler(ValueError)
async def validation_exception_handler(request: Request, exc: ValueError):
    """Handle validation errors"""
    logger.warning(f"Validation error | Path: {request.url.path} | Error: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "message": "Validation failed",
            "detail": str(exc)
        }
    )

@app.options("/{rest_of_path:path}")
async def cors_preflight_handler(rest_of_path: str):
    return PlainTextResponse("", status_code=200)

# Include routers
app.include_router(auth_router)
#app.include_router(graph_router)

app.include_router(order_router)

app.include_router(hs_router)
app.include_router(hs_router1)


router = APIRouter()


TOKEN_FILE = "token.json"
G_SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
]
# Folder where files will be stored
FILEHUB_DIR = os.path.abspath("filehub_storage")
os.makedirs(FILEHUB_DIR, exist_ok=True)

# SECURITY IMPROVEMENT: Remove store_user_if_new (handled by auth_backend.py)

from fastapi import Query
from src.api.sanctions import get_sanctions_entities, search_sanctions

@app.get("/api/sanctions")
def list_sanctions(
    q: str | None = None,
    entity_type: str | None = None,
    country: str | None = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    # If filters are provided, reuse search logic
    if q or entity_type or country:
        results = search_sanctions(
            q=q,
            entity_type=entity_type,
            country=country,
        )
    else:
        results = get_sanctions_entities()

    total = len(results)

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "results": results[offset : offset + limit],
    }

class DemoRequestCreate(BaseModel):
    company_name: str
    full_name: str
    email: EmailStr
    phone: str

@app.post("/api/demo-request")
def create_demo_request(
    payload: DemoRequestCreate,
    db: Session = Depends(get_db),
):
    print("🔥 Demo request received:", payload.dict())

    demo = DemoRequest(
        company_name=payload.company_name,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
    )

    # 1️⃣ Save to DB first (source of truth)
    db.add(demo)
    db.commit()
    db.refresh(demo)
    print("📨 About to call send_demo_email()")

    try:
        send_demo_email(demo)
        print("✅ send_demo_email() returned normally")
    except Exception as e:
        print("❌ Failed to send demo email:", e)
    return {
        "status": "success",
        "id": demo.id,
    }




G_CLIENT_SECRET = "client_secret.json"
TOKEN_FILE = "token.json"
STORED_FILES = "stored_drive_files.json"

# Setup logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

# Processed regulations cache
processed_regulations = set()

ROLE_ASSIGNMENTS = {
    "Legal": "legal@company.com",
    "IT": "it@company.com",
    "Finance": "finance@company.com",
    "Security": "security@company.com",
    "Audit": "audit@company.com",
    "Compliance": "compliance@company.com"
}

from src.api.models import Supplier  


@app.post("/api/suppliers/{supplier_id}/upload")
def upload_supplier_file(
    supplier_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # SECURITY IMPROVEMENT: Verify user owns the supplier
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.user_uid == current_user.uid
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    file_location = f"uploads/supplier_{supplier_id}_{file.filename}"
    with open(file_location, "wb") as f:
        f.write(file.file.read())
   
    return {"supplier_id": supplier_id, "filename": file.filename, "message": "File uploaded"}




@app.get("/")
async def root():
    return {"status": "online", "service": "ComplianceAI Platform API", "version": "1.0.0"}



@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception):
    print("🔥🔥🔥 404 HANDLER TRIGGERED 🔥🔥🔥")
    print("REQUEST METHOD:", request.method)
    print("REQUEST URL:", request.url)
    print("REQUEST HEADERS:", dict(request.headers))

    # VERY IMPORTANT: log the exception
    print("EXCEPTION TYPE:", type(exc))
    print("EXCEPTION REPR:", repr(exc))

    traceback.print_exc()

    return JSONResponse(
        status_code=404,
        content={
            "status": "error",
            "message": "Resource not found (debug)",
            "path": str(request.url.path),
            "method": request.method,
            "exception": repr(exc),
        },
    )
    

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    """Handle 500 errors"""
    logging.error(f"Internal error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": str(exc) if os.getenv("ENV") == "dev" else "An error occurred"
        }
    )



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
