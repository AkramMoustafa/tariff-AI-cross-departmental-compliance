
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
    APIRouter,
    Query,
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

# from src.api.supplier_intelligence.Port.port_insights import router as port_activity_router

import asyncio
import json
import websockets
import socket
import pyodbc
import math

from src.api.country_risk.services import run_news_pipeline
from src.api.country_risk.routes import router as news_risk_router
from src.api.New.newRoute import router as hs_router
from src.api.New.newRoute import router as hs_router
from src.api.New.tariffmodel import init_hs

from cfr_data.normalize import extract_cfr_references, is_definition_section
from src.api.models import WorkspaceRegulation
from src.core.regulations.gov_reg.local_search import (
    get_package_ids,
    load_granules_for_package,
    load_all_granules,
    search_granules_in_package,
    search_local_granules,
)
from src.api.obligations_ingest import (
    extract_obligations_from_text,
    upsert_obligations_neo4j,
)


from  src.api.stripe.stripe_route import router as stripe_router
from src.api.models import WorkspaceRegulation
from src.core.regulations.state_regulations.state_engine  import normalize_regulation
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from src.core.store_file_data import save_extraction
from src.core.regulations.state_regulations.state_engine import search_state_regulations,normalize_regulation
from src.api.models import FileExtraction

from src.core.regulations.gov_reg.package_cache import (
    refresh_package_cache,
    get_cached_packages,
)

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

import fitz 
import io
from src.core.regulations.gov_reg.fulltext_cache import read_file
from uuid import uuid4
from datetime import datetime
from fastapi import Request, Response, HTTPException
from src.api.db import engine
from src.api.models import Base

from src.core.nomi_file_hub import get_direct_file_url
from fastapi.responses import FileResponse
from src.core.regulations.gov_reg.main_router import route
import mimetypes
from typing import List, Optional, Dict, Any
from uuid import uuid4
from pathlib import Path
from datetime import datetime, timezone, timedelta
from src.api.supplier_intelligence.linkedin import router as linkedin_router
from src.api.supplier_intelligence.supplier_intelligence import router as supplier_intelligence_router

from src.core.nomi_file_hub import get_direct_file_url
from src.api.models import User
from dotenv import load_dotenv, dotenv_values

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from src.api.models import (
    Supplier,
    SupplierProfile
)
from PyPDF2 import PdfReader

from src.core.LLM import (
    generate_market_insight,
    extract_document_metadata,
    extract_regulation,
    run_full_extraction,
    generate_gap_summary,
)

from src.core.nomi_file_hub import (
    save_user_file,
    list_user_files,
    get_user_file_path,
    delete_user_file,
    get_direct_file_url,
)
from src.core.backend import fetch_files_from_source
from src.core.work import DowComplianceDataFetcher
from src.core.RAG import ComplianceChecker as RAGComplianceChecker
from src.core.extract_keywords import read_policy_text, extract_keywords
from src.core.find_competitors import find_competitors, clean_names, get_company_filings

from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.auth.exceptions import RefreshError

from fastapi import HTTPException
from src.api.obligations_ingest import router as obligations_router

from src.api.sanctions import search_sanctions
from google.auth.exceptions import RefreshError
from src.core.extract_keywords import read_policy_text, extract_keywords
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from src.core.find_competitors import find_competitors, clean_names, get_company_filings
from fastapi import APIRouter
# Replace direct OpenAI usage with safe wrapper
from src.core.client import safe_chat_completion
import os
from uuid import uuid4
from fastapi import Request, Response
from fastapi import Query
from fastapi import FastAPI
# from .graph_api import router as graph_router
import sys, subprocess, os
from typing import Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from src.api.audit_ingest import router as audit_router, upsert_audit_to_neo4j, ensure_audit_indexes
from src.api.cfr_api import router as cfr_router
from contextlib import asynccontextmanager
from src.api.order_routes import router as order_router
import threading
import time
from src.api.auth_backend import router as auth_router, get_current_user, get_me
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from src.core.logger import logger, log_api_call, log_error, log_security_event, log_compliance_check
from src.api.validators import (
    FileUploadValidation,
    ComplianceCheckValidation,
    validate_file_size,
    validate_file_extension
)
from src.api.models import Regulation
from fastapi.responses import StreamingResponse
from src.api.tariff_routes import router as tariff_router

from src.api.Commodities.metal_price_route import router as commodities_router

from src.api.Commodities.ai_router import router as ai_router
from src.api.auth_backend import router as auth_router
from src.api.Registry.registry import router as filing_router

from src.api.cli.team_routes.control_owner_route import router as control_owner_router
from src.api.cli.team_routes.auditor_route import router as auditor_router
from src.api.cli.team_routes.department_owner_route import router as department_owner_router
from src.api.cli.team_routes.executive_route import router as executive_router
from src.api.cli.team_routes.tenant_admin_route import router as compliance_owner_router
from src.api.API_CLIENT.api_client_router import router as api_client_router
from src.api.API_USER.client_users import router as client_user_routes
from src.api.public.v1 import router as public_v1_router
from src.api.NewTariffEngine.tariff_pdf import router as tariff_pdf_router
from src.api.intelligence.router import router as all_suppliers_router


def cache_refresher():
    while True:
        time.sleep(60 * 60 * 24)  # 24 hours
        print("[CacheRefresher] Refreshing Federal Register package cache...")
        refresh_package_cache()

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
    refresh_package_cache()

    print("[Startup] Loading sanctions from S3...")
    try:
        load_sanctions()
        start_background_refresh(interval_hours=24)
    except Exception as e:
        print(f"[WARN] Sanctions failed to load at startup: {e}")

    print("[Startup] Launching 24h refresher...")
    threading.Thread(target=cache_refresher, daemon=True).start()

    print("[Startup] Ensuring Neo4j audit indexes...")
    try:
        ensure_audit_indexes()
    except Exception as e:
        print(f"Warning: Could not initialize audit indexes: {e}")

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
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.include_router(tariff_router, prefix="/api/v1/tariff", tags=["Tariff"])
app.include_router(public_v1_router)
app.include_router(tariff_new_engine_router)


@app.get("/api/sanctions/search")
def sanctions_search(
    q: str | None = None,
    entity_type: str | None = None,
    country: str | None = None,
):
    return search_sanctions(q, entity_type, country)

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
app.include_router(news_risk_router)
app.include_router(supplier_intelligence_router)
# app.include_router(port_activity_router, prefix="/api/v1", tags=["Ports"])
app.include_router(filing_router)
app.include_router(commodities_router)
app.include_router(ai_router)
app.include_router(all_suppliers_router)

@app.get("/api/sanctions/search")
def sanctions_search(
    q: str | None = None,
    entity_type: str | None = None,
    country: str | None = None,
):
    return search_sanctions(q, entity_type, country)




@app.get("/api/sanctions/search")
def sanctions_search(
    q: str | None = None,
    entity_type: str | None = None,
    country: str | None = None,
):
    return search_sanctions(q, entity_type, country)

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
app.include_router(obligations_router)
app.include_router(audit_router)
app.include_router(cfr_router)
app.include_router(order_router)

app.include_router(hs_router)
app.include_router(linkedin_router)

router = APIRouter()

@app.on_event("startup")
def startup_event():
    start_scheduler()

TOKEN_FILE = "token.json"
G_SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
]
# Folder where files will be stored
FILEHUB_DIR = os.path.abspath("filehub_storage")
os.makedirs(FILEHUB_DIR, exist_ok=True)

# SECURITY IMPROVEMENT: Remove store_user_if_new (handled by auth_backend.py)

class RegulationImport(BaseModel):
    id: str
    name: str
    code: str | None
    region: str | None
    category: str | None
    description: str | None
    source: str | None

class ImportRequest(BaseModel):
    regulations: list[RegulationImport]
    
@app.post("/api/regulations/import")
@limiter.limit("10/minute")
def import_regulations(
    request: Request,  
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    print("\n================ IMPORT REGULATIONS CALLED ================")
    print("RAW PAYLOAD:", payload)

    user_uid = current_user.uid
    regulations = payload.get("regulations", [])

    print(f"User UID: {user_uid}")
    print(f"Incoming regulations count: {len(regulations)}")

    if not regulations:
        print("NO regulations provided. Aborting.")
        return {"error": "No regulations provided"}

    created_ids = []

    for reg in regulations:
        print("\n--- Processing regulation ---")
        print("Reg ID:", reg.get("id"))
        print("Reg Name:", reg.get("name"))

        existing = (
            db.query(WorkspaceRegulation)
            .filter(
                WorkspaceRegulation.user_uid == user_uid,
                WorkspaceRegulation.regulation_id == reg["id"]
            )
            .first()
        )

        if existing:
            print(f"SKIPPED — Regulation {reg['id']} already exists in workspace.")
            continue

        print(f"ADDING new regulation {reg['id']} to workspace...")

        entry = WorkspaceRegulation(
            regulation_id = reg["id"],
            user_uid = user_uid,
            workspace_status = "added",
            name = reg.get("name"),
            code = reg.get("code"),
            region = reg.get("region"),
            category = reg.get("category"),
            risk = reg.get("risk"),
            description = reg.get("description"),
            recommended = reg.get("recommended", False),
            source = reg.get("source"),
            full_text = reg.get("full_text", "")
        )

        db.add(entry)
        created_ids.append(reg["id"])

    print("Committing to DB...")
    db.commit()
    print("COMMIT COMPLETE.")

    print(f"Successfully added {len(created_ids)} new regulations:")
    print(created_ids)
    print("================ END IMPORT ================\n")
    log_api_call(user_uid, "/api/regulations/import", "POST", "success")


    return {
        "success": True,
        "added": created_ids,
        "count": len(created_ids)
    }

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
    
@app.get("/api/state/search")
async def api_state_search(state: str, query: str):
    try:
        raw = search_state_regulations(state, query)
        normalized = [normalize_regulation(r) for r in raw]
        return {"results": normalized}
    except Exception as e:
        log_error(current_user.uid, "/api/regulations/import", e)
        raise HTTPException(status_code=500, detail="Failed to import regulations")
        return {"error": str(e)}

@app.get("/api/workspace/{user_uid}/regulations")
def get_workspace(
    user_uid: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # SECURITY IMPROVEMENT: Verify user can only access their own workspace
    if user_uid != current_user.uid:
        log_security_event("unauthorized_access", current_user.uid, f"Attempted to access workspace: {user_uid}")
        raise HTTPException(status_code=403, detail="Access denied")

    
    regs = (
        db.query(WorkspaceRegulation)
        .filter(WorkspaceRegulation.user_uid == user_uid)
        .all()
    )

    return [
        {
            "id": r.regulation_id,     
            "workspace_status": r.workspace_status,
            "name": r.name,
            "code": r.code,
            "region": r.region,
            "category": r.category,
            "risk": r.risk,
            "description": r.description,
            "recommended": r.recommended,
            "source": r.source,
        }
        for r in regs
    ]

@app.post("/api/regulations/wizard_search")
@limiter.limit("30/minute")
def wizard_search(request: Request, payload: dict):
    source_type = payload.get("sourceType")
    query = payload.get("query", "")
    mode = payload.get("mode", "")
    state = payload.get("state", "michigan")

    if not query:
        return {"error": "Missing query"}

    if source_type == "state":
        raw = search_state_regulations(state, query)
        return raw

    source = payload.get("sourceType")
    mode = payload.get("mode")
    query = payload.get("query")

    # Utility: convert a granule to frontend shape
    def map_granule(g):
        return {
            "id": g.get("granuleId"),
            "name": g.get("title"),
            "code": g.get("cfrCitation"),
            "region": "Federal",
            "category": g.get("type"),
            "risk": None,
            "description": g.get("summary"),
            "source": ", ".join(g.get("agencyNames", [])) if g.get("agencyNames") else "Federal Register",
        }

    if source == "government" and mode == "topic":
        data = search_local_granules(query)
        return [map_granule(x) for x in data]

    # --- PACKAGE ID SEARCH ---
    if source == "government" and mode == "packageId":
        data = load_granules_for_package(query)
        return [map_granule(x) for x in data]

    return []

@app.get("/api/users/profile/{uid}")
def get_user_profile(
    uid: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a user's profile for use in the onboarding screen.
    """
    # SECURITY IMPROVEMENT: Verify user can only access their own profile
    if uid != current_user.uid:
        log_security_event("unauthorized_access", current_user.uid, f"Attempted to access profile: {uid}")
        raise HTTPException(status_code=403, detail="Access denied")

    
    user = db.query(User).filter(User.uid == uid).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "uid": user.uid,
        "display_name": user.display_name or "",
        "full_name": user.full_name or "",
        "company_name": user.company_name or "",
        "job_title": user.job_title or "",
        "department": user.department or "",
        "industry": user.industry or "",
    }

@app.get("/api/regulations/local/granules")
def api_all_granules():
    data = load_all_granules()
    return {
        "count": len(data),
        "granules": data
    } 

@app.get("/api/regulations/local_search")
@limiter.limit("30/minute")
def local_regulation_search(
    request: Request,
    q: str = Query(..., description="Search topic across local granules")
):
    try:
        results = search_local_granules(q)
        return {"query": q,"results_count": len(results), "results": results,}
    except Exception as e:
        return JSONResponse( content={"error": str(e)},status_code=500 )

@app.get("/api/regulations/local/granules/{package_id}")
def list_package_granules(package_id: str):
    data = load_granules_for_package(package_id)

    return {
        "package_id": package_id,
        "count": len(data),
        "granules": data
    }

@app.get("/api/regulations/local/packages")
def list_local_packages():
    ids = get_package_ids()
    return {
        "count": len(ids),
        "packages": ids
    }

@app.get("/api/regulations/search")
@limiter.limit("30/minute")
def search_regulations(
    request: Request,
    q: str = Query(..., description="Topic, package ID, CFR, or doc number")
):
    """
    Unified regulation search across:
    - Federal Register topics
    - GovInfo package IDs
    - CFR citations
    - Document numbers
    """
    try:
        result = route(q)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )

import threading
import time

@app.get("/api/regulation/{granule_id}")
async def get_regulation_text(granule_id: str):
    """
    Return the full text AND auto-ingest obligations
    WITHOUT making internal HTTP requests.
    """
    filename = f"{granule_id}.txt"
    text = read_file(filename)

    if not text or text.startswith("Error"):
        raise HTTPException(status_code=404, detail="Granule not found or unreadable")

    meta = {
        "fetch_date": datetime.utcnow().isoformat(),
        "package_id": None,
        "chunk_id": None,
    }

    obligations = extract_obligations_from_text(
        doc_id=granule_id,
        raw_text=text,
        meta=meta
    )
    print(f"🔍 Extracted {len(obligations)} potential obligations.")
    print(obligations)

    try:
        created_count = upsert_obligations_neo4j(obligations)
    except Exception as e:
        created_count = 0
        print("❌ Neo4j error during ingest:", e)

    return {
        "granule_id": granule_id,
        "text": text,
        "ingested": {
            "ok": True,
            "created_count": created_count,
            "obligations": obligations,
        }
    }

@app.post("/api/rag/run_compliance")
@limiter.limit("5/hour")
async def run_rag_compliance(
    request: Request,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Runs RAG compliance check on a user's uploaded file
    against selected workspace regulations.
    """
    try:
        
        validation_data = ComplianceCheckValidation(**payload)
        
        user_uid = current_user.uid
        file_id = validation_data.file_id
        regulation_ids = validation_data.regulation_ids
        supplier_id = validation_data.supplier_id
        
        logger.info(f"Compliance check started | User: {user_uid} | File: {file_id} | Regulations: {len(regulation_ids)}")

        result = get_user_file_path(user_uid, file_id)
        if not result:
            raise HTTPException(status_code=404, detail="File not found")

        file_path, file_entry = result

       
        regs = (
            db.query(WorkspaceRegulation)
            .filter(
                WorkspaceRegulation.user_uid == user_uid,
                WorkspaceRegulation.regulation_id.in_(regulation_ids)
            )
            .all()
        )

        if not regs:
            raise HTTPException(status_code=404, detail="No matching regulations found")

        
        regulation_objs = []
        for reg in regs:
            regulation_objs.append({
                "Reg_ID": reg.regulation_id,
                "Requirement_Text": reg.description or reg.name or "",
                "Risk_Rating": reg.risk or "",
                "Target_Area": reg.category or "",
                "Dow_Focus": reg.region or ""
            })

       
        error_msg = None
        try:
            checker = RAGComplianceChecker(
                pdf_path=file_path,
                regulations=regulation_objs
            )

            results = checker.run_check()
            summary = checker.dashboard_summary(results)

        except Exception as e:
            print("RAG ERROR:", e)
            traceback.print_exc()
            error_msg = str(e)
            results = []

            
            summary = {
                "status": "error",
                "action": "RAG Compliance Check",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "industry": None,
                "regulations_checked": len(regulation_objs),
                "compliance_score": 0.0,
                "high_risk_gaps": 0,
                "gap_details": [],
                "details": "Compliance engine failed. Please retry or review logs."
            }

        try:
            audit_save_result = upsert_audit_to_neo4j(
                user_uid=user_uid,
                file_id=file_id,
                supplier_id=supplier_id,
                results=results,
                summary=summary,
                metadata={
                    "file_name": file_entry.get("original_name"),
                    "regulation_count": len(regulation_objs)
                }
            )
            if not audit_save_result.get("ok"):
                print(f"Failed to save audit to Neo4j: {audit_save_result.get('error')}")
            else:
                print(f" Audit saved to Neo4j: {audit_save_result.get('audit_id')}")
        except Exception as e:
           
            print(f" Neo4j save error (non-fatal): {e}")
            traceback.print_exc()
            audit_save_result = {"ok": False}

        
        score = summary.get("compliance_score", 0)
        log_compliance_check(user_uid, file_id, len(regulation_objs), score)

        return {
            "status": "success" if error_msg is None else "error",
            "file": file_entry["original_name"],
            "results": results,
            "summary": summary,
            "audit_id": audit_save_result.get("audit_id") if audit_save_result.get("ok") else None,
            "error": error_msg,
        }
        
    except ValueError as ve:
        logger.warning(f"Validation error | User: {current_user.uid} | Error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        log_error(current_user.uid, "/api/rag/run_compliance", e)
        raise HTTPException(status_code=500, detail="Compliance check failed")

@router.get("/api/v1/obligations/all")
def get_all_obligations():
    driver = get_neo4j_driver()
    with driver.session() as session:
        result = session.run("""
            MATCH (o:Obligation)
            RETURN o ORDER BY o.created_at DESC
        """)
        obligations = [record["o"] for record in result]

    driver.close()

    return {
        "count": len(obligations),
        "obligations": obligations
    }



@app.post("/api/workspace/{user_uid}/toggle/{regulation_id}")
def toggle_regulation(
    user_uid: str, 
    regulation_id: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
 
    if user_uid != current_user.uid:
        log_security_event("unauthorized_access", current_user.uid, f"Attempted to toggle regulation for: {user_uid}")
        raise HTTPException(status_code=403, detail="Access denied")

    
    item = (
        db.query(WorkspaceRegulation)
        .filter(
            WorkspaceRegulation.regulation_id == regulation_id,
            WorkspaceRegulation.user_uid == user_uid
        )
        .first()
    )

    if item:
        item.workspace_status = (
            "removed" if item.workspace_status == "added" else "added"
        )
    else:
        item = WorkspaceRegulation(
            regulation_id=regulation_id,
            user_uid=user_uid,
            workspace_status="added"
        )
        db.add(item)

    db.commit()
    db.refresh(item)

    return {"status": item.workspace_status}

@app.get("/api/user/{user_uid}/granules")
def get_user_granules(
    user_uid: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # SECURITY IMPROVEMENT: Verify user can only access their own granules
    if user_uid != current_user.uid:
        log_security_event("unauthorized_access", current_user.uid, f"Attempted to access granules for: {user_uid}")
        raise HTTPException(status_code=403, detail="Access denied")

    
    regs = (
        db.query(Regulation)
        .filter(Regulation.user_uid == user_uid)
        .all()
    )

    return {
        "user_uid": user_uid,
        "granule_ids": [r.id for r in regs],
        "count": len(regs),
    }

# SECURITY IMPROVEMENT: Remove old session login (now handled by auth_backend.py)
# @app.post("/session/login") - REMOVED

@app.get("/api/regulations/state")
def api_state_regulations(state: str, q: str):
    try:
        raw = search_state_regulations(state, q)
        results = [normalize_regulation(r) for r in raw]
        return {"state": state, "query": q, "results": results}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

@app.get("/api/users/basic_info/{uid}")
def get_basic_user_info(
    uid: str,
    current_user: User = Depends(get_current_user)
):
    # SECURITY IMPROVEMENT: Verify user can only access their own info
    if uid != current_user.uid:
        log_security_event("unauthorized_access", current_user.uid, f"Attempted to access basic info for: {uid}")
        raise HTTPException(status_code=403, detail="Access denied")

    
    db = SessionLocal()
    user = db.query(User).filter(User.uid == uid).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "uid": user.uid,
        "display_name": user.display_name,
        "department": user.department,
        "email": user.email
    }

@app.get("/regulations")
async def regulations_query(q: str = ""):
    """
    Example: /regulations?q=FR-2025-09-16
    """
    try:
        result = route(q)  
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )

# SECURITY IMPROVEMENT: Remove old session endpoints (handled by auth_backend.py)
# @app.get("/session/me") - REMOVED
# @app.post("/session/logout") - REMOVED

@app.get("/api/filehub/{file_id}/direct")
async def filehub_direct(
    file_id: str, 
    current_user: User = Depends(get_current_user)
):
    user_uid = current_user.uid
    result = get_user_file_path(user_uid, file_id)

    if not result:
        raise HTTPException(status_code=404, detail="File not found")

    file_path, entry = result

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=entry["original_name"],
        headers={"Content-Disposition": "inline"}
    )

def extract_text_from_pdf_bytes(pdf_bytes):
    import io

    # 1. Try PyMuPDF
    try:
        import fitz
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = "".join([page.get_text("text") for page in doc])
        if text.strip():
            return text
    except Exception as e:
        print("PyMuPDF failed:", e)

    # 2. Try PDFMiner
    try:
        from pdfminer.high_level import extract_text as pdfminer_extract
        text = pdfminer_extract(io.BytesIO(pdf_bytes))
        if text.strip():
            return text
    except Exception as e:
        print("PDFMiner failed:", e)

    # 3. Fallback: PyPDF2
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print("PyPDF2 failed:", e)

    return ""

@app.get("/api/filehub/{file_id}")
async def filehub_get(
    file_id: str, 
    current_user: User = Depends(get_current_user)
):
    """
    Returns the actual file (PDF, OUT file, etc.)
    Used by the frontend preview system.
    """
    user_uid = current_user.uid

    result = get_user_file_path(user_uid, file_id)
    if not result:
        raise HTTPException(status_code=404, detail="File not found")

    file_path, entry = result

    mime_type, _ = mimetypes.guess_type(entry["original_name"])
    if not mime_type:
        mime_type = "application/octet-stream"

    return FileResponse(
        file_path,
        media_type=mime_type,
        filename=entry["original_name"],
        headers={"Content-Disposition": "inline"}
    )

def run_ingest_script(audit_path: str) -> Dict[str, Any]:
    project_root = ROOT
    script_path = project_root / "scripts" / "ingest_audit_to_neo4j.py"
    if not script_path.exists():    
        raise FileNotFoundError(f"Ingest script not found at {script_path}")

    python_bin = os.environ.get("PYTHON_BIN", sys.executable)
    cmd = [python_bin, str(script_path), str(audit_path)]
    # run and capture
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=str(project_root))
    # log to server console for debugging
    print(f"[INGEST] cmd: {cmd}")
    print(f"[INGEST] returncode: {proc.returncode}")
    print(f"[INGEST] stdout:\n{proc.stdout}")
    print(f"[INGEST] stderr:\n{proc.stderr}")
    return {
        "returncode": proc.returncode,
        "stdout": proc.stdout,
        "stderr": proc.stderr
    }

# SECURITY IMPROVEMENT: File upload size limit
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

@app.post("/api/filehub/upload")
@limiter.limit("10/minute")
async def filehub_upload(
    request: Request,
    file: UploadFile = File(...),
    file_type: str = Form(...),
    used_for: str = Form(...),
    department: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    try:
        user_uid = current_user.uid
        
        # SECURITY ENHANCEMENT: Validate input
        validation_data = FileUploadValidation(
            file_type=file_type,
            department=department,
            used_for=used_for
        )
        
        logger.info(f"File upload | User: {user_uid} | File: {file.filename} | Type: {file_type}")
        
        # SECURITY ENHANCEMENT: Validate file extension
        validate_file_extension(file.filename)
        
        # SECURITY IMPROVEMENT: Check file size
        file.file.seek(0, 2)
        size = file.file.tell()
        await file.seek(0)
        
        # SECURITY ENHANCEMENT: Validate file size
        validate_file_size(size)

        # Read file
        contents = await file.read()

        # Save metadata + file
        entry = save_user_file(
            contents,
            file.filename,
            user_uid,
            file_type,
            used_for,
            department
        )

        file_id = entry["id"]

        # Get actual saved file path
        file_path, _ = get_user_file_path(user_uid, file_id)
        pdf_path = file_path

        # Extract text
        try:
            reader = PdfReader(pdf_path)
            text = "\n".join([(p.extract_text() or "") for p in reader.pages])
        except Exception as e:
            print("⚠️ PDF extraction failed:", e)
            text = ""

        # LLM extraction
        from src.core.metadata_extractor import run_full_extraction
        extracted = run_full_extraction(text)

        # Save to DB
        db = SessionLocal()
        row = db.query(FileExtraction).filter_by(file_id=file_id).first()
        if row:
            row.extraction = extracted
        else:
            db.add(FileExtraction(
                file_id=file_id,
                user_uid=user_uid,
                extraction=extracted
            ))
        db.commit()
        db.close()
        
        # SECURITY ENHANCEMENT: Log successful upload
        log_api_call(user_uid, "/api/filehub/upload", "POST", "success")

        return {
            "status": "success",
            "file": entry,
            "extraction": extracted
        }
        
    except ValueError as ve:
        logger.warning(f"Validation error | User: {current_user.uid} | Error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        log_error(current_user.uid, "/api/filehub/upload", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/filehub/{file_id}")
async def filehub_delete(
    file_id: str, 
    current_user: User = Depends(get_current_user)
):
    user_uid = current_user.uid

    ok = delete_user_file(user_uid, file_id)
    if not ok:
        raise HTTPException(status_code=404, detail="File not found")

    log_api_call(user_uid, f"/api/filehub/{file_id}", "DELETE", "success")
    return {"status": "deleted", "file_id": file_id}


def get_gdrive_credentials():
    """Safely load Google Drive credentials, auto-delete invalid token.json"""
    creds = None
    if os.path.exists(TOKEN_FILE):
        try:
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, G_SCOPES)
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(GoogleAuthRequest())
        except (ValueError, RefreshError) as e:
            print(f"Invalid or expired token.json: {e}")
            try:
                os.remove(TOKEN_FILE)
                print("Removed corrupted token.json; will re-auth next time.")
            except Exception:
                pass
            creds = None

    if not creds:
        flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", G_SCOPES)
        creds = flow.run_local_server(
            port=8080,
            access_type="offline",
            prompt="consent",
            include_granted_scopes="true",
        )
        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return creds

# Load GCP settings
PROJECT_ID = "compliance-473813"
ROLE = "roles/storage.objectAdmin"

# Load service account credentials
SERVICE_ACCOUNT_FILE = "admin-key.json"

class UserAccessRequest(BaseModel):
    email: str

# Constants
G_SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
]
G_CLIENT_SECRET = "client_secret.json"
TOKEN_FILE = "token.json"
STORED_FILES = "stored_drive_files.json"

# Setup logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

# Processed regulations cache
processed_regulations = set()

REGULATORY_SOURCES = {
    "FEDERAL_REGISTER": "https://www.federalregister.gov/api/v1/documents.json?fields[]=title&fields[]=publication_date&per_page=10"
}

REGULATION_TEMPLATES = {
    "GDPR": [
        {
            "description": "Implement data retention and deletion policies",
            "tasks": [
                {"role": "Legal", "title": "Draft data retention policy"},
                {"role": "IT", "title": "Implement automated deletion workflows"}
            ]
        },
        {
            "description": "Establish consent management system",
            "tasks": [
                {"role": "IT", "title": "Deploy consent tracking tool"},
                {"role": "Legal", "title": "Review consent language"}
            ]
        },
        {
            "description": "Implement data breach notification procedures",
            "tasks": [
                {"role": "Security", "title": "Create incident response plan"},
                {"role": "Legal", "title": "Draft breach notification templates"}
            ]
        }
    ],
    "SOX": [
        {
            "description": "SOX 404 internal controls assessment",
            "tasks": [
                {"role": "Finance", "title": "Document financial controls"},
                {"role": "IT", "title": "IT general controls review"}
            ]
        },
        {
            "description": "Financial statement certification process",
            "tasks": [
                {"role": "Finance", "title": "Prepare certification documentation"},
                {"role": "Audit", "title": "Review financial disclosures"}
            ]
        }
    ],
    "SOC2": [
        {
            "description": "Access control management",
            "tasks": [
                {"role": "IT", "title": "Implement MFA"},
                {"role": "Security", "title": "Review access logs"}
            ]
        },
        {
            "description": "Vulnerability management program",
            "tasks": [
                {"role": "Security", "title": "Schedule quarterly pen tests"},
                {"role": "IT", "title": "Deploy patch management system"}
            ]
        }
    ],
    "HIPAA": [
        {
            "description": "PHI encryption requirements",
            "tasks": [
                {"role": "IT", "title": "Implement encryption at rest"},
                {"role": "Security", "title": "Configure TLS for transit"}
            ]
        },
        {
            "description": "Business associate agreements",
            "tasks": [
                {"role": "Legal", "title": "Draft BAA templates"},
                {"role": "Compliance", "title": "Vendor BAA collection"}
            ]
        }
    ]
}

ROLE_ASSIGNMENTS = {
    "Legal": "legal@company.com",
    "IT": "it@company.com",
    "Finance": "finance@company.com",
    "Security": "security@company.com",
    "Audit": "audit@company.com",
    "Compliance": "compliance@company.com"
}

from src.api.models import Supplier  

@app.post("/api/users/setup_profile")
def setup_profile(
    display_name: str = Form(None),
    full_name: str = Form(None),
    company_name: str = Form(None),
    job_title: str = Form(None),
    department: str = Form(None),
    industry: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.uid
    user = db.query(User).filter(User.uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields (only if provided)
    if full_name: 
        user.full_name = full_name
    if display_name:
        user.display_name = display_name
    if company_name:
        user.company_name = company_name
    if job_title:
        user.job_title = job_title
    if department:
        user.department = department
    if industry:
        user.industry = industry

    db.commit()

    log_api_call(uid, "/api/users/setup_profile", "POST", "success")
    return {"status": "success", "user_uid": uid}


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

@app.post("/api/competitors")
async def get_competitors(
    company_name: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """
    Given a company name, return its competitors and their recent filings.
    """
    try:
        competitors = find_competitors(company_name)
        cleaned = clean_names(competitors)
        filings = get_company_filings(cleaned)
        return {"company": company_name, "competitors": cleaned, "filings": filings}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/analyze")
async def analyze_company(
    company_name: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-based insights for a company using GPT-4o.
    """
    try:
        competitors = clean_names(find_competitors(company_name))
        filings = get_company_filings(competitors)
        insight = generate_market_insight(company_name, competitors, filings)
        return {"company": company_name, "insight": insight}
    except Exception as e:
        return {"error": str(e)}

def analyze_regulation_impact(regulation: dict):
    """Analyze regulation impact"""
    impact_analysis = {
        "affected_departments": regulation.get("impact_areas", ["Legal"]),
        "required_actions": [],
        "risk_level": "Medium"
    }
    
    # Simple keyword matching
    title_lower = regulation.get("title", "").lower()
    if any(word in title_lower for word in ["security", "cybersecurity", "data"]):
        impact_analysis["affected_departments"].extend(["IT", "Security"])
        impact_analysis["required_actions"] = [
            "Review security controls",
            "Update security documentation",
            "Implement required changes"
        ]
        impact_analysis["risk_level"] = "High"
    elif any(word in title_lower for word in ["financial", "audit", "reporting"]):
        impact_analysis["affected_departments"].extend(["Finance", "Audit"])
        impact_analysis["required_actions"] = [
            "Review financial controls",
            "Update reporting procedures"
        ]
    else:
        impact_analysis["required_actions"] = [
            "Review regulation requirements",
            "Assess compliance impact"
        ]
    
    return impact_analysis

def regulatory_monitoring_job():
    """Background job for regulatory monitoring"""
    logging.info("Running regulatory monitoring job...")
    db = SessionLocal()
    
    try:
        new_regulations = check_federal_register()
        
        for regulation in new_regulations:
            logging.info(f"Processing: {regulation['title'][:50]}...")
            impact = analyze_regulation_impact(regulation)
            obligation_id = auto_create_from_detected_regulation(regulation, impact, db)
            logging.info(f"Created obligation #{obligation_id}")
        
        if new_regulations:
            logging.info(f"Processed {len(new_regulations)} new regulations")
    except Exception as e:
        logging.error(f"Regulatory monitoring failed: {e}")
    finally:
        db.close()

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(regulatory_monitoring_job, 'interval', hours=12)
scheduler.start()

async def extract_keywords_api(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Automatically extract compliance-related keywords from uploaded file."""
    # Save uploaded file temporarily
    file_path = os.path.join(SHARED_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        text = read_policy_text(file_path)
        keywords = extract_keywords(text)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    return {"filename": file.filename, "keywords": keywords}

@app.post("/api/fetch_files")
async def fetch_files(
    source: str = Form(...),
    folder_id: str = Form(default="root"),
    current_user: User = Depends(get_current_user)
):

    logging.info(f"Fetching files from source: {source}, folder_id: {folder_id}")

    creds = get_gdrive_credentials()
    service = build("drive", "v3", credentials=creds)
    result = fetch_files_from_source(source, folder_id, service)

    try:
        upload_for_audit(result)
    except Exception as e:
        logging.warning(f"Upload for audit failed: {e}")

    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR, exist_ok=True)

    downloaded_files = [os.path.join(DOWNLOAD_DIR, f) for f in os.listdir(DOWNLOAD_DIR) if os.path.isfile(os.path.join(DOWNLOAD_DIR, f))]
    if not downloaded_files:
        logging.warning("No downloaded files found in shared_downloads.")
        return {"files": result, "keywords": [], "message": "No files found to analyze."}

    latest_file = max(downloaded_files, key=os.path.getmtime)
    logging.info(f"Latest downloaded file detected: {latest_file}")

    # Extract text + keywords
    try:
        text = read_policy_text(latest_file)
        keywords = extract_keywords(text)
        logging.info(f"Extracted {len(keywords)} keywords from {os.path.basename(latest_file)}")
    except Exception as e:
        logging.error(f"Keyword extraction failed: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

    # Return clean response
    return {
        "files": result,
        "keywords": keywords,
        "analyzed_file": os.path.basename(latest_file),
        "download_path": latest_file
    }

def load_stored_files(response_model=None):
    if os.path.exists(STORED_FILES):
        with open(STORED_FILES, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@app.post("/api/download_file", response_model=None)
async def download_gdrive_file(
    file_id: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    try:
        creds = None
        if os.path.exists("token.json"):
            creds = get_gdrive_credentials()
        else:
            return {"error": "Not authenticated with Google Drive."}

        service = build("drive", "v3", credentials=creds)
        file = service.files().get(fileId=file_id, fields="name").execute()
        file_name = file["name"]

        request = service.files().get_media(fileId=file_id)
        file_path = os.path.join(DOWNLOAD_DIR, file_name)

        fh = io.FileIO(file_path, "wb")
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()

        return {"message": "Downloaded successfully", "path": file_path}
    except Exception as e:
        return {"error": str(e)}

def save_stored_files(data, response_model=None):
    with open(STORED_FILES, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

@app.post("/api/internal_compliance_audit")
async def internal_compliance_audit(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user),
    response_model=None
):
    try:
        # Step 1: Save the uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Step 2: Load the regulations file
        if not os.path.exists("sample_regulations.json"):
            raise FileNotFoundError("sample_regulations.json not found in backend directory")

        with open("sample_regulations.json", "r", encoding="utf-8") as f:
            regulations = json.load(f)

        # Step 3: Run the compliance checker
        from src.core.RAG import ComplianceChecker 
        checker = ComplianceChecker(pdf_path=tmp_path, regulations=regulations)
        results = checker.run_check()

        # Step 4: Summarize results
        summary = checker.dashboard_summary(results)
        
        # Step 5: Return structured response
        return JSONResponse(content={
            "status": "success",
            "total_requirements": len(results),
            "results": results
        })

    except Exception as e:
        # Print full traceback to console for debugging
        print("INTERNAL ERROR in /internal_compliance_audit:\n", traceback.format_exc())

        # Return structured JSON error for the frontend
        return JSONResponse(
            content={"status": "error", "message": str(e)},
            status_code=500
        )

class ComplianceRequest(BaseModel):
    user_uid: str
    file_id: str
    regulation_ids: list[str]

@app.post("/api/rag/run_compliance_payload")
async def run_compliance_payload(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Runs RAG compliance check on a user's uploaded file
    against selected workspace regulations.
    """
    # SECURITY IMPROVEMENT: Use authenticated user UID
    user_uid = current_user.uid
    file_id = payload.get("file_id")
    regulation_ids = payload.get("regulation_ids", [])
    
    if not file_id:
        raise HTTPException(status_code=400, detail="Missing file_id")
    
    if not regulation_ids:
        raise HTTPException(status_code=400, detail="No regulations selected")
    
    result = get_user_file_path(user_uid, file_id)
    if not result:
        raise HTTPException(status_code=404, detail="Evidence file not found")
    
    pdf_path, entry = result

    
    print("\n========== RAG INPUT DEBUG ==========")
    print("PDF PATH:", pdf_path)
    print("PDF EXISTS:", os.path.exists(pdf_path))
    print("PDF SIZE (bytes):",
          os.path.getsize(pdf_path) if os.path.exists(pdf_path) else "N/A")
    print("====================================\n")
    
    regs = db.query(WorkspaceRegulation).filter(
        WorkspaceRegulation.user_uid == user_uid,
        WorkspaceRegulation.regulation_id.in_(regulation_ids)
    ).all()
    
    if not regs:
        raise HTTPException(status_code=404, detail="No regulations found")
    
    regulation_objs = []

    for idx, reg in enumerate(regs, start=1):
        print("\n===================================================")
        print(f"🔎 START REGULATION [{idx}/{len(regs)}]")
        print("Regulation ID:", reg.regulation_id)
        print("Name:", reg.name)
        print("===================================================")

        try:
            from src.api.obligations_ingest import extract_obligations_from_text

            # --- Load full text ---
            full_text = reg.full_text or ""
            print("📄 Full text loaded:", bool(full_text))
            print("📏 Full text length:", len(full_text))
            print("📏 Full textttttttttttttttttttttttt:", full_text)

            if not full_text or full_text.startswith("Error"):
                print(f"⚠️ SKIP — Invalid or empty text for {reg.regulation_id}")
                continue

            # --- CFR Cross References ---
            print("🔗 Extracting CFR cross-references...")
            cfr_refs = extract_cfr_references(
                text=full_text,
                source_id=reg.regulation_id
            )
            print("🔗 Cross-reference count:", len(cfr_refs))
            if cfr_refs:
                print("🔗 Sample reference:", cfr_refs[0])

            # --- Definition Detection ---
            print("📘 Checking if definition section...")
            is_definition = is_definition_section({
                "heading": reg.name or "",
                "text_paragraphs": full_text.split("\n")
            })
            print("📘 Is definition:", is_definition)

            # --- Obligation Extraction ---
            print("📌 Extracting obligations...")
            obligations = extract_obligations_from_text(
                doc_id=reg.regulation_id,
                raw_text=full_text,
                meta={}
            ) or []

            print("📌 Obligation count:", len(obligations))
            if obligations:
                print("📌 Sample obligation:", obligations[0])
            requirement_text = full_text
            print("🧠 Requirement text length:", len(requirement_text))

            # --- Append final regulation object ---
            regulation_obj = {
                "Reg_ID": reg.regulation_id,
                "Requirement_Text": requirement_text,
                "Risk_Rating": reg.risk or "",
                "Target_Area": reg.category or "",
                "Dow_Focus": reg.region or "",

                "Has_Cross_References": bool(cfr_refs),
                "Cross_References": cfr_refs,
                "Is_Definition": is_definition,
            }

            regulation_objs.append(regulation_obj)

            print("✅ Regulation appended successfully")
            print("📦 Payload preview keys:", list(regulation_obj.keys()))

        except Exception as e:
            print("❌ EXCEPTION OCCURRED")
            print("Regulation ID:", reg.regulation_id)
            print("Error type:", type(e).__name__)
            print("Error message:", str(e))
            traceback.print_exc()
            continue

    print("TOTAL REGULATIONS PASSED TO RAG:", len(regulation_objs))
    print("====================================\n")

    # Run compliance check
    error_msg = None
    try:
        checker = RAGComplianceChecker(
            pdf_path=pdf_path,
            regulations=regulation_objs
        )
        results = checker.run_check()

        # 🔽 ADD THIS BLOCK
        file_department = entry.get("department", "Other")
        for r in results:
            if not r.get("department"):
                r["department"] = file_department

        summary = checker.dashboard_summary(results)

        print("✅ DEBUG: RESULT COUNT:", len(results))
        print("✅ DEBUG: COMPLIANT COUNT:",
              sum(1 for r in results if r.get("Is_Compliant")))
    except Exception as e:
        print("❌ RAG ERROR:", e)
        traceback.print_exc()
        error_msg = str(e)
        results = []
        summary = {
            "status": "error",
            "action": "RAG Compliance Check",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "industry": None,
            "regulations_checked": len(regulation_objs),
            "compliance_score": 0.0,
            "high_risk_gaps": 0,
            "gap_details": [],
            "details": "Compliance engine failed. Please retry or review logs."
        }

    audit_save = upsert_audit_to_neo4j(
        user_uid=user_uid,
        file_id=file_id,
        supplier_id=None,
        results=results,
        summary=summary,
        metadata={}
    )

    if not audit_save["ok"]:
        raise HTTPException(status_code=500, detail=audit_save["error"])
    print(file_id)
    return {
        "status": "success" if error_msg is None else "error",
        "audit_id": audit_save["audit_id"] if error_msg is None else None,
        "file": entry["original_name"],
        "results": results,
        "file_id": file_id,                     # ✅ ADD THIS
        "summary": summary,
        "compliance_score": summary.get("compliance_score"),
        "total_requirements": summary.get("regulations_checked"),
        "gap_count": len([r for r in results if not r.get("Is_Compliant")]),
        "high_risk_count": summary.get("high_risk_gaps"),
        "flagged_departments": summary.get("departments_flagged", []),
        "error": error_msg,
    }

# external_intelligence endpoint updated to use safe_chat_completion
@app.get("/api/external_intelligence", response_model=None)
async def external_intelligence(
    industry: str,
    current_user: User = Depends(get_current_user)
):
    prompt = (
        f"Generate structured JSON on compliance, risk trends, and new regulations for the {industry} industry. "
        "Format as: {"
        '"source": "MarketReport",'
        '"headline": "...",'
        '"key_risks": ["...", "..."],'
        '"regulation_news": ['
            '{"regulation": "...", "summary": "...", "link": "..."}'
        ']}'
    )
    messages = [
        {"role": "system", "content": "You are an enterprise compliance assistant."},
        {"role": "user", "content": prompt}
    ]
    # call safe wrapper
    resp = safe_chat_completion(messages=messages, model="gpt-4o", max_tokens=600, temperature=0.2)
    # handle wrapper response format (robust)
    if isinstance(resp, dict):
        if resp.get("ok"):
            content = resp.get("text")
        else:
            content = resp.get("error") or str(resp)
    else:
        content = resp

    import json
    try:
        findings = [json.loads(content)]
    except Exception:
        findings = [{"headline": "Parsing error", "error": content}]
    return JSONResponse(content={"status": "success", "details": findings})

@app.get("/api/source_graph")
async def source_graph(
    platform: str,
    current_user: User = Depends(get_current_user)
):
    graph_data = {"nodes": ["A", "B"], "edges": [("A", "B")]}
    return JSONResponse(content=graph_data)

# Evidence Management
@app.post("/api/task/{task_id}/evidence")
async def add_evidence(
    task_id: int, 
    evidence_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(RemediationTask).filter(
        RemediationTask.id == task_id,
        RemediationTask.user_uid == current_user.uid
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    evidence_bytes = await evidence_file.read()
    evidence_id = hashlib.sha256(evidence_bytes).hexdigest()[:16]
    chromadb_id = f"chroma_{evidence_id}"
    
    artifact = EvidenceArtifact(
        task_id=task_id,
        chromadb_id=chromadb_id,
        valid=True,
        validation_errors=[],
        user_uid=current_user.uid
    )
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    log_audit(db, "EvidenceArtifact", artifact.id, "upload", current_user.uid, f"Uploaded evidence for task {task_id}")
    return artifact

@app.get("/api/task/{task_id}/evidence")
async def get_evidence(
    task_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # SECURITY IMPROVEMENT: Verify user owns the task
    task = db.query(RemediationTask).filter(
        RemediationTask.id == task_id,
        RemediationTask.user_uid == current_user.uid
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    evidence = db.query(EvidenceArtifact).filter(EvidenceArtifact.task_id == task_id).all()
    return evidence

@app.post("/api/evidence/{evidence_id}/attest")
async def attest_evidence(
    evidence_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    artifact = db.query(EvidenceArtifact).filter(
        EvidenceArtifact.id == evidence_id,
        EvidenceArtifact.user_uid == current_user.uid
    ).first()
    
    if not artifact:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    if not artifact.valid:
        raise HTTPException(status_code=400, detail="Cannot approve invalid evidence")
    
    artifact.approved_by = current_user.email
    artifact.approved_on = datetime.utcnow()
    artifact.attestation_hash = hashlib.sha256(
        json.dumps({"id": artifact.id, "chromadb_id": artifact.chromadb_id, "user": current_user.email}, sort_keys=True).encode()
    ).hexdigest()
    
    db.commit()
    log_audit(db, "EvidenceArtifact", artifact.id, "attest", current_user.uid, "Evidence approved and attested")
    return artifact

@app.get("/api/dashboard/summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_tasks = db.query(RemediationTask).filter(RemediationTask.user_uid == current_user.uid).count()
    done_tasks = db.query(RemediationTask).filter(
        RemediationTask.user_uid == current_user.uid,
        RemediationTask.state == TaskState.DONE
    ).count()
    breached_tasks = db.query(RemediationTask).filter(
        RemediationTask.user_uid == current_user.uid,
        RemediationTask.breach_flag == True
    ).count()
    overdue_tasks = db.query(RemediationTask).filter(
        RemediationTask.user_uid == current_user.uid,
        RemediationTask.sla_due < datetime.utcnow(),
        RemediationTask.state != TaskState.DONE
    ).count()
    
    return {
        "total_tasks": total_tasks,
        "done": done_tasks,
        "breached": breached_tasks,
        "overdue": overdue_tasks
    }


@app.get("/api/audit/run/{file_id}")
async def run_audit_on_file(
    file_id: str, 
    current_user: User = Depends(get_current_user)
):
    """
    Runs full compliance audit on a stored FileHub file.
    """
    user_uid = current_user.uid
    result = get_user_file_path(user_uid, file_id)
    if not result:
        raise HTTPException(status_code=404, detail="File not found")

    file_path, entry = result

    with open(file_path, "rb") as f:
        pdf_bytes = f.read()

    text = extract_text_from_pdf_bytes(pdf_bytes)

    if not os.path.exists("sample_regulations.json"):
        raise HTTPException(status_code=500, detail="sample_regulations.json missing")

    with open("sample_regulations.json", "r") as f:
        regulations = json.load(f)
    from src.core.RAG import ComplianceChecker
    checker = ComplianceChecker(pdf_path=file_path, regulations=regulations)

    results = checker.run_check()
    
    return {
        "status": "success",
        "file": entry["original_name"],
        "results": results,
        "total": len(results)
    }

@app.post("/api/trigger_regulatory_scan")
async def trigger_regulatory_scan(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Manually trigger regulatory monitoring"""
    background_tasks.add_task(regulatory_monitoring_job)
    return {"status": "success", "message": "Regulatory scan triggered"}

@app.get("/api/detected_regulations")
async def get_detected_regulations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recently auto-detected regulations"""
    recent_detections = db.query(AuditLog).filter(
        AuditLog.action == "auto_detect",
        AuditLog.timestamp > datetime.utcnow() - timedelta(days=30)
    ).order_by(AuditLog.timestamp.desc()).limit(20).all()
    
    return recent_detections

# Helper
def log_audit(db: Session, entity_type: str, entity_id: int, action: str, user: str, detail: str):
    entry = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        user=user,
        timestamp=datetime.utcnow(),
        detail=detail
    )
    db.add(entry)
    db.commit()

@app.get("/api/regulations/library")
def get_regulation_library():
    """
    Loads and returns a flat list of regulations from sample_regulations.json.
    Works whether JSON is a list OR a dict of categories.
    """
    json_path = "sample_regulations.json"

    if not os.path.exists(json_path):
        raise HTTPException(status_code=500, detail="sample_regulations.json not found")

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            raw = json.load(f)

        # If file is LIST → return directly
        if isinstance(raw, list):
            library = []
            for r in raw:
                library.append({
                    "id": r.get("id"),
                    "name": r.get("title"),
                    "region": r.get("regulation_type", "N/A"),
                    "description": r.get("text", "No description provided."),
                })

            return {"library": library}

        # If file is DICT with categories → flatten structure
        if isinstance(raw, dict):
            library = []
            for region, regs in raw.items():
                for r in regs:
                    library.append({
                        "id": r.get("id"),
                        "name": r.get("title"),
                        "region": region,
                        "description": r.get("text", "No description provided."),
                    })
            return {"library": library}

        raise HTTPException(status_code=500, detail="Invalid regulations JSON format")

    except Exception as e:
        print("REGULATIONS ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to load regulations")

@app.get("/")
async def root():
    return {"status": "online", "service": "ComplianceAI Platform API", "version": "1.0.0"}

@app.post("/add_user_to_gcs")
async def add_user_to_gcs(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    try:
        data = await request.json()
        email = data.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email missing")

        print(f"✅ Received user email: {email}")

        # Get current IAM policy
        policy = service.projects().getIamPolicy(
            resource=PROJECT_ID, body={}
        ).execute()

        new_member = f"user:{email}"
        binding_found = False

        # Search if role exists
        for binding in policy.get("bindings", []):
            if binding["role"] == ROLE:
                if new_member not in binding["members"]:
                    binding["members"].append(new_member)
                    print(f"✅ Added {new_member} to existing {ROLE}")
                binding_found = True
                break

        # If role not found, create new binding
        if not binding_found:
            policy["bindings"].append({"role": ROLE, "members": [new_member]})
            print(f"✅ Created new binding for {ROLE}")

        # Update IAM policy
        service.projects().setIamPolicy(
            resource=PROJECT_ID,
            body={"policy": policy}
        ).execute()

        print(f"🎯 Successfully granted {ROLE} to {email}")
        return JSONResponse(content={
            "status": "success",
            "message": f"✅ {email} added to project {PROJECT_ID} as {ROLE}"
        })

    except Exception as e:
        print(f"❌ Error adding user: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to add user: {e}")
    

# rag_analysis: replaced direct OpenAI call with safe_chat_completion
@app.post("/api/rag_compliance_analysis", response_model=None)
async def rag_analysis(
    file: UploadFile = File(...),
    regulations: str = Form(...),
    supplierid: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    pdf_bytes = await file.read()
    pdf_text = extract_text_from_pdf_bytes(pdf_bytes)

    prompt = (
        "Given this supplier evidence text:\n"
        f"{pdf_text[:3000]}\n\n"
        f"And these regulations: {regulations}.\n"
        "For each regulation, return a JSON object with: requirement, status (Compliant/Risk/Violation), details, evidence (summarized as section/page). "
        "Always return a JSON array, even for one regulation. Do not return a single object. Array of JSON objects, nothing else."
    )

    messages = [
        {"role": "system", "content": "You are a compliance audit expert."},
        {"role": "user", "content": prompt}
    ]

    resp = safe_chat_completion(messages=messages, model="gpt-4o", max_tokens=800, temperature=0.2)
    if isinstance(resp, dict):
        if resp.get("ok"):
            content = resp.get("text")
        else:
            content = resp.get("error") or str(resp)
    else:
        content = resp

    import json
    try:
        findings = json.loads(content)
        if not isinstance(findings, list):
            findings = [findings]
    except Exception:
        findings = [{"requirement": "Parsing error", "error": content}]

    return JSONResponse(content={
        "status": "success",
        "supplier_id": supplierid,
        "file_name": file.filename,
        "findings": findings
    })

def check_federal_register():
    """Check Federal Register for new regulations"""
    try:
        import requests
        response = requests.get(REGULATORY_SOURCES["FEDERAL_REGISTER"])
        data = response.json()
        
        new_regulations = []
        for item in data.get("results", []):
            reg_id = item.get("document_number")
            
            if reg_id and reg_id not in processed_regulations:
                new_regulations.append({
                    "source": "Federal Register",
                    "regulation_type": "Federal",
                    "title": item.get("title", ""),
                    "url": item.get("html_url", ""),
                    "publication_date": item.get("publication_date", ""),
                    "document_number": reg_id
                })
                processed_regulations.add(reg_id)
        
        return new_regulations
    except Exception as e:
        logging.error(f"Federal Register check failed: {e}")
        return []

def start_scheduler():
    """Start the background scheduler for regulatory monitoring"""
    if not scheduler.running:
        try:
            scheduler.start()
            logging.info("Background scheduler started successfully")
        except Exception as e:
            logging.error(f"Failed to start scheduler: {e}")

@app.on_event("shutdown")
def shutdown_scheduler():
    """Shutdown the scheduler gracefully"""
    if scheduler.running:
        scheduler.shutdown()
        logging.info("Background scheduler shut down")

# SECURITY IMPROVEMENT: Add missing imports and definitions
ROOT = Path(__file__).resolve().parents[1]
DOWNLOAD_DIR = os.path.abspath("shared_downloads")
SHARED_DIR = os.path.abspath("shared_files")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(SHARED_DIR, exist_ok=True)

def upload_for_audit(files_data):
    """Upload files for audit processing"""
    try:
        for file_info in files_data:
            file_id = file_info.get("id")
            file_name = file_info.get("name")
            
            if file_id and file_name:
                logging.info(f"Processing file for audit: {file_name}")
    except Exception as e:
        logging.error(f"Audit upload failed: {e}")

def get_neo4j_driver():
    """Get Neo4j driver instance"""
    from neo4j import GraphDatabase
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PW = os.getenv("NEO4J_PW")
    
    if not NEO4J_PW:
        raise RuntimeError("NEO4J_PW not set in .env")
    
    return GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PW))


try:
    if os.path.exists(SERVICE_ACCOUNT_FILE):
        credentials_gcs = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        from googleapiclient.discovery import build as gcp_build
        service = gcp_build('cloudresourcemanager', 'v1', credentials=credentials_gcs)
        logging.info("GCS service account initialized successfully")
    else:
        logging.warning(f"Service account file not found: {SERVICE_ACCOUNT_FILE}")
        service = None
except Exception as e:
    logging.error(f"Failed to initialize GCS service account: {e}")
    service = None

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ComplianceAI Platform API"
    }

# Metrics endpoint
@app.get("/api/metrics")
async def get_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get platform metrics for the current user"""
    total_files = len(list_user_files(current_user.uid))
    total_suppliers = db.query(Supplier).filter(Supplier.user_uid == current_user.uid).count()
    total_regulations = db.query(WorkspaceRegulation).filter(
        WorkspaceRegulation.user_uid == current_user.uid
    ).count()
    total_tasks = db.query(RemediationTask).filter(
        RemediationTask.user_uid == current_user.uid
    ).count()
    
    return {
        "user_uid": current_user.uid,
        "total_files": total_files,
        "total_suppliers": total_suppliers,
        "total_regulations": total_regulations,
        "total_tasks": total_tasks,
        "timestamp": datetime.utcnow().isoformat()
    }
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

# Cleanup on shutdown
@app.on_event("shutdown")
def cleanup():
    """Cleanup resources on shutdown"""
    try:
        if 'driver' in globals():
            driver.close()
            logging.info("Neo4j driver closed")
    except Exception as e:
        logging.error(f"Error during cleanup: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
