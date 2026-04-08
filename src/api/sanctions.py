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

from collections import defaultdict
from collections import defaultdict
import numpy as np

def build_country_sanction_scores():
    entities = get_sanctions_entities()
    
    country_counts = defaultdict(int)

    # Step 1: count entities per country
    HIGH_RISK_PROGRAMS = {
        "IRAN", "RUSSIA", "SYRIA", "CUBA", "NKOREA"
    }

    for e in entities:
        programs = e.get("sanctionsProgram", [])
        
        programs = [p.upper() for p in e.get("sanctionsProgram", [])]

        # 🚨 HARD FILTER (not weighting)
        if not any(p in HIGH_RISK_PROGRAMS for p in programs):
            continue   # ❌ completely skip this entity

        weight = 1.0  # everything left is real geopolitical

        countries = e.get("countries", [])
        programs = e.get("sanctionsProgram", [])

        selected_country = None

        # ✅ Step 1: try to match country with sanctions program
        for c in countries:
            if any(c.upper() in p.upper() for p in programs):
                selected_country = c
                break

        # ✅ Step 2: fallback → ONLY first country
        if not selected_country and countries:
            selected_country = countries[0]

        # ✅ Step 3: count ONLY ONE country
        if selected_country:
            country_counts[selected_country.strip()] += weight

    if not country_counts:
        return {}

    # Step 2: log normalization (fixes Russia dominance)
    max_log = max(np.log1p(v) for v in country_counts.values())

    # Step 3: real-world sanctions severity (CRITICAL)
    SANCTIONS_SEVERITY = {
        "Iran": 1.0,
        "North Korea": 1.0,
        "Syria": 0.9,
        "Cuba": 0.9,
        "Russia": 0.7,
        "China": 0.4,
    }

    country_scores = {}

    for country, count in country_counts.items():
        density = np.log1p(count) / max_log   # ✅ FIX 1
        severity = SANCTIONS_SEVERITY.get(country, 0.3)  # ✅ FIX 2

        # final score (balanced)
        score = 0.6 * severity + 0.4 * density  # ✅ FIX 3

        country_scores[country] = score

    return country_scores

if __name__ == "__main__":
    if os.path.exists(LOCAL_SANCTIONS_FILE):
        print(f"[Sanctions] Found local file: {LOCAL_SANCTIONS_FILE}")
        data = LOCAL_SANCTIONS_FILE
    else:
        print("[Sanctions] Local file not found. Downloading from S3...")
        data = load_sanctions_data_from_s3()
    print("\n=== LOADING SANCTIONS ===")
    load_sanctions()

    print("\n=== BUILDING COUNTRY SCORES ===")
    scores = build_country_sanction_scores()

    print("\n=== SAMPLE SCORES ===")
    for k, v in list(scores.items())[:10]:
        print(k, ":", round(v, 3))

    print("\n=== TOP 10 COUNTRIES ===")
    top = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:10]
    for c, s in top:
        print(c, ":", round(s, 3))