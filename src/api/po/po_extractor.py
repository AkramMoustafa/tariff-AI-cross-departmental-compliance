from pdf2image import convert_from_path
import pytesseract
from openai import OpenAI
import json
import re
import cv2
import numpy as np

# ---------- CONFIGURATION ----------

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH = r"C:\poppler\poppler-25.12.0\Library\bin"

client = OpenAI()


# ---------- STEP 1: PDF → Images ----------

def pdf_to_images(pdf_path):
    return convert_from_path(
        pdf_path,
        dpi=400,
        poppler_path=POPPLER_PATH
    )


# ---------- STEP 2: OCR Extraction ----------

def extract_ocr_text(images):

    ocr_text = ""

    for img in images:

        # Convert PIL → OpenCV
        img = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2GRAY)

        # Better threshold for boxed text
        img = cv2.adaptiveThreshold(
            img,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            31,
            2
        )

        # Pass 1: table layout
        config_table = r'--oem 3 --psm 6'
        text_table = pytesseract.image_to_string(img, config=config_table)

        # Pass 2: word detection
        config_columns = r'--oem 3 --psm 4'
        data = pytesseract.image_to_data(
            img,
            config=config_columns,
            output_type=pytesseract.Output.DICT
        )

        text_columns = " ".join([w for w in data["text"] if w.strip() != ""])

        # Combine both OCR passes
        ocr_text += text_table + "\n" + text_columns + "\n"

    # Fix OCR currency errors
    ocr_text = re.sub(r'(\d)S', r'\1$', ocr_text)

    print("\n----- OCR TEXT -----")
    print(ocr_text)

    return ocr_text


# ---------- STEP 3: LLM Extraction ----------

def extract_with_llm(ocr_text):

    prompt = f"""
Extract purchase order data from the text below.

Return ONLY valid JSON.
Do NOT include markdown.

Numbers must NOT contain commas.

If a field is missing return null.

If total is missing calculate:
total = subtotal + tax + shipping

Supplier appears under the VENDOR section.
Origin country appears in the supplier address.

Ship-to information appears under the SHIP TO section.
Destination country appears in that address.

Shipping terms, shipping method, and delivery date appear under the row:

SHIPPING TERMS | SHIPPING METHOD | DELIVERY DATE

Extract values beneath those headings.

Format example:

{{
 "po_number": "",
 "date": "",
 "supplier": "",
 "origin_country": "",
 "ship_to": "",
 "destination_country": "",
 "shipping_terms": "",
 "shipping_method": "",
 "delivery_date": "",
 "items":[
   {{"item":"","description":"","hs_code":null,"qty":0,"price":0}}
 ],
 "subtotal":0,
 "tax":0,
 "shipping":0,
 "total":0
}}

TEXT:
{ocr_text}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content


# ---------- STEP 4: Clean JSON ----------

def clean_llm_output(result):

    result = re.sub(r"```json|```", "", result).strip()
    result = re.sub(r'(?<=\d),(?=\d)', '', result)

    return json.loads(result)


# ---------- MAIN PIPELINE ----------

def extract_po_data(pdf_path):

    images = pdf_to_images(pdf_path)

    ocr_text = extract_ocr_text(images)

    result = extract_with_llm(ocr_text)

    data = clean_llm_output(result)

    return data


# ---------- TEST RUN ----------

if __name__ == "__main__":

    data = extract_po_data("po.pdf")

    print("\n----- PARSED JSON -----")
    print(json.dumps(data, indent=2))