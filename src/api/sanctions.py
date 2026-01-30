import threading
import time
import os
from typing import Dict, Any
from src.core.SANCTIONS.s3_loader import load_sanctions_data_from_s3
from src.core.SANCTIONS.sanctions_service import (
    extract_entities,
    search_entities,
)

_SANCTIONS_ENTITIES: list[Dict[str, Any]] = []
_SANCTIONS_CACHE: Dict[str, Any] = {}
_LAST_REFRESH: float | None = None
LOCAL_SANCTIONS_FILE = "sdn.xml"

def load_sanctions(force: bool = False) -> Dict[str, Any]:
    global _SANCTIONS_CACHE, _SANCTIONS_ENTITIES, _LAST_REFRESH

    # 1. If already in memory, skip everything
    if _SANCTIONS_ENTITIES and not force:
        return _SANCTIONS_CACHE

    data = None

    # 2. OPTIMIZATION: Check for local file FIRST
    if os.path.exists(LOCAL_SANCTIONS_FILE):
        print(f"[Sanctions] Found local file: {LOCAL_SANCTIONS_FILE}")
        # We pass the filename string. extract_entities (which we fixed earlier)
        # knows how to handle a filename.
        data = LOCAL_SANCTIONS_FILE
    else:
        # 3. Fallback to S3 only if local file is missing
        print("[Sanctions] Local file not found. Downloading from S3...")
        try:
            data = load_sanctions_data_from_s3()
        except Exception as e:
            print(f"[Sanctions] ⚠️ S3 Download failed: {e}")
            # If S3 fails, we stop here to avoid crashing
            return {}

    # 4. Process the data (XML Parsing)
    print("[Sanctions] Extracting sanctions entities...")
    try:
        entities = extract_entities(data)
        
        _SANCTIONS_ENTITIES = entities
        _LAST_REFRESH = time.time()
        print(f"[Sanctions] Loaded successfully ({len(entities)} entities)")
        
    except Exception as e:
        print(f"[Sanctions]      Extraction failed: {e}")
        _SANCTIONS_ENTITIES = []

    return _SANCTIONS_CACHE

def get_sanctions() -> Dict[str, Any]:
    # This is a legacy accessor, mostly unused now that we rely on entities list
    return _SANCTIONS_CACHE

def sanctions_health() -> Dict[str, Any]:
    return {
        "loaded": bool(_SANCTIONS_ENTITIES),
        "count": len(_SANCTIONS_ENTITIES),
        "last_refresh": _LAST_REFRESH,
        "source": "Local XML" if os.path.exists(LOCAL_SANCTIONS_FILE) else "S3"
    }

def start_background_refresh(interval_hours: int = 24):
    def _loop():
        while True:
            time.sleep(interval_hours * 3600)
            try:
                print("[Sanctions] Running background refresh...")
                # In background, maybe we DO want to force S3? 
                # For now, let's keep using local to save bandwidth.
                load_sanctions(force=True)
            except Exception as e:
                print("[Sanctions][WARN] Background refresh failed:", e)

    threading.Thread(target=_loop, daemon=True).start()

def get_sanctions_entities() -> list[Dict[str, Any]]:
    # Allow empty return if startup failed, rather than crashing
    return _SANCTIONS_ENTITIES

def search_sanctions(
    q: str | None = None,
    entity_type: str | None = None,
    country: str | None = None,
) -> list[Dict[str, Any]]:
    entities = get_sanctions_entities()
    return search_entities(
        entities,
        q=q,
        entity_type=entity_type,
        country=country,
    )