# debug_sanctions.py
import sys
import os
import requests
import xml.etree.ElementTree as ET

# URL used by US Treasury (OFAC)
SANCTIONS_URL = "https://www.treasury.gov/ofac/downloads/sdn.xml"
LOCAL_FILE = "sdn.xml"

def test_sanctions_logic():
    print("1. Checking local file...")
    if not os.path.exists(LOCAL_FILE):
        print(f"    {LOCAL_FILE} not found. Attempting download...")
        try:
            resp = requests.get(SANCTIONS_URL, stream=True)
            with open(LOCAL_FILE, 'wb') as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)
            print("    Download complete.")
        except Exception as e:
            print(f"    Download failed: {e}")
            return
    else:
        print(f"    {LOCAL_FILE} exists ({os.path.getsize(LOCAL_FILE) / 1024 / 1024:.2f} MB).")

    print("\n2. Parsing XML (This mimics the API startup)...")
    try:
        tree = ET.parse(LOCAL_FILE)
        root = tree.getroot()
        # OFAC XML namespace
        ns = {'ns': 'https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/XML'}
        
        count = 0
        huawei_found = False
        
        # Simple scan
        for entry in root.findall('ns:sdnEntry', ns):
            count += 1
            lastName = entry.find('ns:lastName', ns)
            name = lastName.text if lastName is not None else "Unknown"
            
            if "HUAWEI" in name.upper():
                huawei_found = True
                print(f"    FOUND: {name}")
                
        print(f"\n3. Summary:")
        print(f"   - Total Entities Loaded: {count}")
        print(f"   - Huawei Found: {huawei_found}")
        
        if count < 1000:
            print("\n CRITICAL: The list is too short. Your file might be corrupted.")
        elif not huawei_found:
            print("\n CRITICAL: Loaded entries, but 'Huawei' is missing. Logic error.")
        else:
            print("\n SUCCESS: Data layer is working. If API fails, it's a code issue.")

    except Exception as e:
        print(f" XML Parsing Error: {e}")

if __name__ == "__main__":
    test_sanctions_logic()