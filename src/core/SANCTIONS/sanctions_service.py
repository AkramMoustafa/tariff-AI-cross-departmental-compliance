import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional
import os

# Updated Namespace for OFAC XML (Jan 2026)
NS = {'ns': 'https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/XML'}

def extract_entities(data: Any) -> List[Dict[str, Any]]:
    """
    Parses OFAC SDN XML and returns normalized entities.
    Accepts: File path (str), XML string (str), or Bytes.
    """
    entities_out = []
    root = None
    
    try:
        # 1. Determine Input Type and Parse
        if isinstance(data, dict):
            print("⚠️ Warning: Received Dict but expected XML. Loader might be parsing JSON.")
            return [] # Fail gracefully if JSON loader is used
            
        if isinstance(data, (str, bytes)):
            # Check if it's a file path that exists
            if isinstance(data, str) and os.path.exists(data) and data.endswith(".xml"):
                tree = ET.parse(data)
                root = tree.getroot()
            # Check if it's raw XML content
            elif isinstance(data, bytes) or (isinstance(data, str) and "<sdnList" in data[:200]):
                if isinstance(data, bytes):
                    # Remove potential BOM
                    if data.startswith(b'\xef\xbb\xbf'): 
                        data = data[3:]
                root = ET.fromstring(data)
        
        if root is None:
            # Fallback: Try reading local sdn.xml if input was empty/invalid
            if os.path.exists("sdn.xml"):
                tree = ET.parse("sdn.xml")
                root = tree.getroot()
            else:
                print("❌ Error: Could not parse input as XML and sdn.xml not found.")
                return []

        # 2. Iterate Entries
        count = 0
        for entry in root.findall('ns:sdnEntry', NS):
            count += 1
            
            # Extract basic fields
            uid = entry.find('ns:uid', NS)
            uid_val = uid.text if uid is not None else "N/A"
            
            lastName = entry.find('ns:lastName', NS)
            firstName = entry.find('ns:firstName', NS)
            full_name = lastName.text if lastName is not None else "Unknown"
            if firstName is not None:
                full_name += f", {firstName.text}"

            sdnType = entry.find('ns:sdnType', NS)
            entity_type = sdnType.text if sdnType is not None else "Entity"

            # Programs (e.g., CUBA, IRAN)
            programs = []
            progList = entry.find('ns:programList', NS)
            if progList is not None:
                for p in progList.findall('ns:program', NS):
                    programs.append(p.text)

            # Aliases
            aliases = []
            akaList = entry.find('ns:akaList', NS)
            if akaList is not None:
                for aka in akaList.findall('ns:aka', NS):
                    ln = aka.find('ns:lastName', NS)
                    fn = aka.find('ns:firstName', NS)
                    name = ln.text if ln is not None else ""
                    if fn is not None:
                        name += f", {fn.text}"
                    if name: aliases.append(name)

            # Countries
            countries = set()
            addrList = entry.find('ns:addressList', NS)
            if addrList is not None:
                for addr in addrList.findall('ns:address', NS):
                    c = addr.find('ns:country', NS)
                    if c is not None:
                        countries.add(c.text)

            entities_out.append({
                "uid": uid_val,
                "name": full_name,
                "entityType": entity_type,
                "aliases": aliases,
                "sanctionsProgram": programs,
                "countries": list(countries),
                "source": "OFAC SDN"
            })
            
    except Exception as e:
        print(f"❌ XML Parsing Error: {e}")
        return []

    return entities_out

def search_entities(
    entities: List[Dict[str, Any]],
    q: Optional[str] = None,
    entity_type: Optional[str] = None,
    country: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Search in memory.
    """
    results = []
    q = q.lower() if q else None
    e_type = entity_type.lower() if entity_type else None
    c_filter = country.lower() if country else None

    for e in entities:
        # 1. Type Match
        if e_type and e.get("entityType", "").lower() != e_type:
            continue
            
        # 2. Country Match
        if c_filter:
            entity_countries = [c.lower() for c in e.get("countries", [])]
            if c_filter not in entity_countries:
                continue

        # 3. Name Match (Fuzzy)
        if q:
            found = False
            if q in e.get("name", "").lower():
                found = True
            else:
                for alias in e.get("aliases", []):
                    if q in alias.lower():
                        found = True
                        break
            if not found:
                continue
        
        results.append(e)
        
    return results