from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile

from src.api.po.po_extractor import extract_po_data

router = APIRouter()

@router.post("/extract-po")
async def extract_po(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF supported")

    # save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        result = extract_po_data(tmp_path)

        return {
            "status": "success",
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))