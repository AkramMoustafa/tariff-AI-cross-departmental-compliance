import threading
import time
from typing import Dict, Any
from src.core.SANCTIONS.s3_loader import load_sanctions_data_from_s3
from src.core.SANCTIONS.sanctions_service import (
    extract_entities,
    search_entities,
)
_SANCTIONS_ENTITIES: list[Dict[str, Any]] = []
_SANCTIONS_CACHE: Dict[str, Any] = {}
_LAST_REFRESH: float | None = None


def load_sanctions(force: bool = False) -> Dict[str, Any]:
    global _SANCTIONS_CACHE, _SANCTIONS_ENTITIES, _LAST_REFRESH

    if _SANCTIONS_CACHE and not force:
        return _SANCTIONS_CACHE

    print("[Sanctions] Loading sanctions from S3...")
    data = load_sanctions_data_from_s3()

    print("[Sanctions] Extracting sanctions entities...")
    entities = extract_entities(data)

    _SANCTIONS_CACHE = data
    _SANCTIONS_ENTITIES = entities
    _LAST_REFRESH = time.time()

    print(f"[Sanctions] Sanctions loaded successfully ({len(entities)} entities)")
    return _SANCTIONS_CACHE

def get_sanctions() -> Dict[str, Any]:
    if not _SANCTIONS_CACHE:
        raise RuntimeError("Sanctions not loaded yet")
    return _SANCTIONS_CACHE


def sanctions_health() -> Dict[str, Any]:
    return {
        "loaded": bool(_SANCTIONS_CACHE),
        "last_refresh": _LAST_REFRESH,
        "top_level_keys": list(_SANCTIONS_CACHE.keys())[:5] if _SANCTIONS_CACHE else []
    }


def start_background_refresh(interval_hours: int = 24):
    def _loop():
        while True:
            time.sleep(interval_hours * 3600)
            try:
                load_sanctions(force=True)
            except Exception as e:
                print("[Sanctions][WARN] Background refresh failed:", e)

    threading.Thread(target=_loop, daemon=True).start()
def get_sanctions_entities() -> list[Dict[str, Any]]:
    if not _SANCTIONS_ENTITIES:
        raise RuntimeError("Sanctions not loaded yet")
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