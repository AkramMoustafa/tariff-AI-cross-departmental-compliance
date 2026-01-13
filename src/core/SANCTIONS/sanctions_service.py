import json
import sys

# src/core/SANCTIONS/sanctions_service.py

from typing import Dict, Any, List, Optional


def extract_entities(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Normalize OFAC sanctions JSON into a flat list of entities.
    """
    entities_out: List[Dict[str, Any]] = []

    sanctions_data = data.get("sanctionsData", {})
    entities_block = sanctions_data.get("entities", {})
    entity_data = entities_block.get("entity", [])

    # Handle single-entity edge case
    if isinstance(entity_data, dict):
        entity_data = [entity_data]

    for ent in entity_data:
        info = ent.get("generalInfo", {})
        entity_type = info.get("entityType")

        # ---------- Names ----------
        primary_name: Optional[str] = None
        aliases: List[str] = []

        names = ent.get("names", {}).get("name", [])
        if isinstance(names, dict):
            names = [names]

        for n in names:
            translations = n.get("translations", {}).get("translation", [])
            if isinstance(translations, dict):
                translations = [translations]

            for t in translations:
                name_value = t.get("formattedFullName")
                if not name_value:
                    continue

                if n.get("isPrimary"):
                    primary_name = name_value
                else:
                    aliases.append(name_value)

        # ---------- Sanctions ----------
        sanctions_list = ent.get("sanctionsLists", {}).get("sanctionsList")
        sanctions_type = ent.get("sanctionsTypes", {}).get("sanctionsType")
        sanctions_program = ent.get("sanctionsPrograms", {}).get("sanctionsProgram")

        # ---------- Countries (contextual, NOT sanctioned countries) ----------
        countries = set()

        addresses = ent.get("addresses", {}).get("address", [])
        if isinstance(addresses, dict):
            addresses = [addresses]

        for addr in addresses:
            country = addr.get("country")
            if country:
                countries.add(country)

        features = ent.get("features", {}).get("feature", [])
        if isinstance(features, dict):
            features = [features]

        for feat in features:
            if feat.get("type") in ("Nationality Country", "Place of Birth"):
                value = feat.get("value")
                if value:
                    countries.add(value)

        entities_out.append({
            "name": primary_name,
            "aliases": aliases,
            "entityType": entity_type,
            "sanctionsList": sanctions_list,
            "sanctionsType": sanctions_type,
            "sanctionsProgram": sanctions_program,
            "countries": sorted(countries),
        })

    return entities_out


def entity_matches_filters(
    entity: Dict[str, Any],
    q: Optional[str] = None,
    entity_type: Optional[str] = None,
    country: Optional[str] = None,
) -> bool:
    """
    Apply search filters to a normalized sanctions entity.
    """
    if q:
        q = q.lower()
        name = (entity.get("name") or "").lower()
        aliases = [a.lower() for a in entity.get("aliases", []) if a]

        if q not in name and not any(q in a for a in aliases):
            return False

    if entity_type and entity.get("entityType") != entity_type:
        return False

    if country and country not in entity.get("countries", []):
        return False

    return True


def search_entities(
    entities: List[Dict[str, Any]],
    q: Optional[str] = None,
    entity_type: Optional[str] = None,
    country: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Filter entities using optional search criteria.
    """
    return [
        e for e in entities
        if entity_matches_filters(e, q=q, entity_type=entity_type, country=country)
    ]

def load_data(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
def extract_entities(data):
    entities_out = []

    sanctions_data = data.get("sanctionsData", {})
    entities_block = sanctions_data.get("entities", {})
    entity_data = entities_block.get("entity", [])

    # Handle single-entity edge case
    if isinstance(entity_data, dict):
        entity_data = [entity_data]

    for ent in entity_data:
        info = ent.get("generalInfo", {})
        entity_type = info.get("entityType")

        # -------- Names --------
        primary_name = None
        aliases = []

        names = ent.get("names", {}).get("name", [])
        if isinstance(names, dict):
            names = [names]

        for n in names:
            translations = n.get("translations", {}).get("translation", [])
            if isinstance(translations, dict):
                translations = [translations]

            for t in translations:
                name_value = t.get("formattedFullName")
                if not name_value:
                    continue

                if n.get("isPrimary"):
                    primary_name = name_value
                else:
                    aliases.append(name_value)

        # -------- Sanctions --------
        sanctions_list = ent.get("sanctionsLists", {}).get("sanctionsList")
        sanctions_type = ent.get("sanctionsTypes", {}).get("sanctionsType")
        sanctions_program = ent.get("sanctionsPrograms", {}).get("sanctionsProgram")

        # -------- Countries (contextual) --------
        countries = set()

        addresses = ent.get("addresses", {}).get("address", [])
        if isinstance(addresses, dict):
            addresses = [addresses]

        for addr in addresses:
            if "country" in addr:
                countries.add(addr["country"])

        features = ent.get("features", {}).get("feature", [])
        if isinstance(features, dict):
            features = [features]

        for feat in features:
            if feat.get("type") in ("Nationality Country", "Place of Birth"):
                countries.add(feat.get("value"))

        entities_out.append({
            "name": primary_name,
            "aliases": aliases,
            "entityType": entity_type,
            "sanctionsList": sanctions_list,
            "sanctionsType": sanctions_type,
            "sanctionsProgram": sanctions_program,
            "countries": sorted(countries)
        })

    return entities_out
def matches(entity, q, entity_type, country):
    if q:
        q = q.lower()
        if entity["name"] and q in entity["name"].lower():
            pass
        elif any(q in (a or "").lower() for a in entity["aliases"]):
            pass
        else:
            return False

    if entity_type and entity["entityType"] != entity_type:
        return False

    if country and country not in entity["countries"]:
        return False

    return True

def run_ui(entities):
    print("\n=== Sanctions Search UI (v1) ===\n")

    q = input("Search name or alias (blank for all): ").strip()
    entity_type = input("Entity type [Individual / Entity / Vessel / Aircraft] (blank = all): ").strip()
    country = input("Associated country (blank = all): ").strip()

    print("\n--- Results ---\n")

    count = 0
    for e in entities:
        if matches(e, q, entity_type, country):
            count += 1
            print(f"Name: {e['name']}")
            print(f"Type: {e['entityType']}")
            print(f"Sanctions: {e['sanctionsType']} ({e['sanctionsList']})")
            print(f"Program: {e['sanctionsProgram']}")
            print(f"Countries: {', '.join(e['countries']) or 'N/A'}")
            if e["aliases"]:
                print(f"Aliases: {', '.join(e['aliases'])}")
            print("-" * 50)

    print(f"\nTotal results: {count}\n")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python sanctions_ui.py <sanctions_json>")
        sys.exit(1)

    raw_data = load_data(sys.argv[1])
    entities = extract_entities(raw_data)
    run_ui(entities)
