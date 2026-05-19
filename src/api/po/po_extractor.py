
from openai import OpenAI
import base64
import json
import re
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

import os

def extract_po_with_vision(file_path):

    with open(file_path, "rb") as f:
        uploaded_file = client.files.create(
            file=f,
            purpose="assistants"
        )
    print(f"✅ File uploaded. File ID: {uploaded_file.id}")

    print("🧠 Sending request to OpenAI...")

    response = client.responses.create(
        model="gpt-4o-mini",
        input=[{
            "role": "user",

            "content": [
                {
                    "type": "input_text",
                    "text": """
                    Extract purchase order data and return ONLY valid JSON.

                    FIELDS TO EXTRACT:

                    {
                      "origin_city": string or null,
                      "origin_country": string or null,
                      "destination_city": string or null,
                      "destination_country": string or null,
                      "shipping_method": string or null,
                      "items": [
                        {
                          "description": string,
                          "quantity": number,
                          "unit_price": number
                        }
                      ],
                      "subtotal": number or null,
                      "tax": string or number or null,
                      "shipping": number or null,
                      "total": number or null
                    }

                    IMPORTANT RULES:

                    1. LOCATION:
                    - Extract origin from "SHIP FROM", "VENDOR", or sender address
                    - Extract destination from "SHIP TO"
                    - Extract country if visible, otherwise null

                    2. SHIPPING METHOD:
                    - Extract values like Air, Sea, Ground, Express
                    - Return lowercase

                    3. TAX:
                    - If percentage → keep as string (e.g., "8%")

                    4. SHIPPING:
                    - Only numeric value

                    5. NEVER guess:
                    - If unsure → null

                    Return JSON only.
                    """
                },
                {
                    "type": "input_file",
                    "file_id": uploaded_file.id
                }
            ]
        }]
    )

    return response.output_text

def clean_llm_output(result):
    print("🧹 Cleaning LLM output...")
    print("RAW OUTPUT:", result[:500])  # first 500 chars
    print("FULL LENGTH:", len(result))
    print("ENDS WITH:", result[-50:])
    result = re.sub(r"```json|```", "", result).strip()
    result = re.sub(r'(?<=\d),(?=\d)', '', result)
    return json.loads(result)

def validate_po(po):

    fields = [
        "origin_city",
        "origin_country",
        "destination_city",
        "destination_country",
        "shipping_method",
        "items",
        "subtotal",
        "tax",
        "shipping",
        "total"
    ]

    for f in fields:
        if f not in po:
            po[f] = None

    if not isinstance(po["items"], list):
        po["items"] = []

    return po


# ---------- STEP 5: Fix Financials ----------
def fix_po_data(po_data):

    subtotal = sum(
        item["quantity"] * item["unit_price"]
        for item in po_data.get("items", [])
    )
    po_data["subtotal"] = subtotal

    total = po_data.get("total", 0)

    # If total is clearly wrong, ignore it
    if total < subtotal:
        total = 0

    tax = po_data.get("tax", 0)

    if isinstance(tax, str) and "%" in tax:
        percent = float(tax.replace("%", "")) / 100
        tax = subtotal * percent

    elif isinstance(tax, (int, float)):

        if tax > subtotal:
            tax = 0

    else:
        tax = 0

    po_data["tax"] = tax

    shipping = po_data.get("shipping", 0)

    if shipping > total:
        shipping = 0

    if total > 0:
        derived_shipping = total - subtotal - tax

        if derived_shipping >= 0 and derived_shipping < subtotal:
            shipping = derived_shipping

    po_data["shipping"] = shipping

    po_data["total"] = subtotal + tax + shipping

    return po_data


def process_po(file_path):
    print("🚀 Starting PO processing...")
    raw_output = extract_po_with_vision(file_path)

    po_data = clean_llm_output(raw_output)

    if "purchase_order" in po_data:
        po_data = po_data["purchase_order"]

    po_data = validate_po(po_data)

    po_data = fix_po_data(po_data)

    return {
        "po": po_data,
        "financials": {
            "subtotal": po_data.get("subtotal", 0),
            "tax": po_data.get("tax", 0),
            "shipping": po_data.get("shipping", 0),
            "total": po_data.get("total", 0),
            "tax_rate": (
                po_data["tax"] / po_data["subtotal"]
                if po_data.get("subtotal", 0) > 0 else 0
            ),
            "shipping_ratio": (
                po_data["shipping"] / po_data["subtotal"]
                if po_data.get("subtotal", 0) > 0 else 0
            )
        }
}

if __name__ == "__main__":
    process_po()