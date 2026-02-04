from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import LETTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO

router = APIRouter()

@router.post("/tariff/pdf")
def generate_tariff_pdf(payload: dict):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("<b>Tariff Calculation Report</b>", styles["Title"]))
    elements.append(Paragraph(f"HS Code: {payload['hs_code']}", styles["Normal"]))
    elements.append(Paragraph(f"Origin: {payload['origin_country']}", styles["Normal"]))
    elements.append(Paragraph("<br/>", styles["Normal"]))

    # ---- SUMMARY ----
    elements.append(Paragraph("<b>Summary</b>", styles["Heading2"]))
    elements.append(
        Paragraph(
            f"Effective Rate: {payload['calculated_duties']['total_rate_percent']}%",
            styles["Normal"],
        )
    )
    elements.append(
        Paragraph(
            f"Total Duty Payable: ${payload['duty_payable']['total_duty_payable']}",
            styles["Normal"],
        )
    )

    # ---- TABLE ----
    table_data = [
        ["Duty Type", "Rate", "Reference", "Amount"]
    ]

    for line in payload["applied_tariff_lines"]:
        table_data.append([
            line["dutyType"],
            line["rate"],
            line["reference"],
            f"${line['amount']}",
        ])

    table = Table(table_data, colWidths=[120, 80, 160, 80])
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=tariff_calculation.pdf"
        },
    )
