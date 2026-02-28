"""PDF report generation service for patient summaries."""

import io
from datetime import datetime
from typing import Dict, Any

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT


PRIMARY_COLOR = HexColor("#0F766E")
ACCENT_COLOR = HexColor("#14B8A6")
LIGHT_BG = HexColor("#F0FDFA")
DARK_TEXT = HexColor("#1E293B")


def generate_patient_report(
    patient_data: Dict[str, Any],
    prediction: Dict[str, Any],
) -> bytes:
    """
    Generate a professional PDF patient summary report.

    Returns:
        PDF content as bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=22,
        textColor=PRIMARY_COLOR,
        spaceAfter=6,
        alignment=TA_CENTER,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=HexColor("#64748B"),
        alignment=TA_CENTER,
        spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=PRIMARY_COLOR,
        spaceBefore=18,
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
    )

    elements = []

    # ── Header ───────────────────────────────────────────────────────────
    elements.append(Paragraph("Patient Health Summary Report", title_style))
    elements.append(Paragraph(
        f"Generated on {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')}",
        subtitle_style,
    ))
    elements.append(HRFlowable(
        width="100%", thickness=2, color=ACCENT_COLOR, spaceAfter=12
    ))

    # ── Patient Demographics ─────────────────────────────────────────────
    elements.append(Paragraph("Patient Demographics", heading_style))
    demo_data = [
        ["Age", str(patient_data.get("age", "N/A"))],
        ["Gender", str(patient_data.get("gender", "N/A"))],
        ["BMI", str(patient_data.get("bmi", "N/A"))],
        ["Blood Pressure", f"{patient_data.get('blood_pressure', 'N/A')} mmHg"],
        ["Cholesterol", f"{patient_data.get('cholesterol_level', 'N/A')} mg/dL"],
        ["Glucose Level", f"{patient_data.get('glucose_level', 'N/A')} mg/dL"],
        ["Smoking", "Yes" if patient_data.get("smoking_habit") else "No"],
        ["Activity Level", str(patient_data.get("physical_activity_level", "N/A"))],
        ["Family History", "Yes" if patient_data.get("family_medical_history") else "No"],
        ["Hospital Visits", str(patient_data.get("previous_hospital_visits", "N/A"))],
    ]
    demo_table = Table(demo_data, colWidths=[2.5 * inch, 3.5 * inch])
    demo_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("TEXTCOLOR", (0, 0), (-1, -1), DARK_TEXT),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E1")),
    ]))
    elements.append(demo_table)
    elements.append(Spacer(1, 12))

    # ── Prediction Results ───────────────────────────────────────────────
    elements.append(Paragraph("Prediction Results", heading_style))

    risk_color = {
        "Low": "#22C55E",
        "Medium": "#F59E0B",
        "High": "#EF4444",
    }.get(prediction.get("risk_category", ""), "#64748B")

    pred_data = [
        ["Disease Presence", "Yes" if prediction.get("disease_presence") else "No"],
        ["Disease Probability", f"{prediction.get('disease_probability', 0) * 100:.1f}%"],
        ["Risk Category", prediction.get("risk_category", "N/A")],
        ["Risk Score", f"{prediction.get('risk_score', 0):.1f} / 100"],
        ["Est. Medical Expenses", f"${prediction.get('predicted_medical_expenses', 0):,.2f}"],
    ]
    pred_table = Table(pred_data, colWidths=[2.5 * inch, 3.5 * inch])
    pred_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("TEXTCOLOR", (0, 0), (-1, -1), DARK_TEXT),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E1")),
    ]))
    elements.append(pred_table)
    elements.append(Spacer(1, 12))

    # ── Risk Explanation ─────────────────────────────────────────────────
    elements.append(Paragraph("Risk Assessment", heading_style))
    explanation = prediction.get("risk_explanation", "No explanation available.")
    elements.append(Paragraph(explanation, body_style))
    elements.append(Spacer(1, 12))

    # ── Risk Probabilities ───────────────────────────────────────────────
    risk_probs = prediction.get("risk_probabilities", {})
    if risk_probs:
        elements.append(Paragraph("Risk Category Probabilities", heading_style))
        prob_data = [[cat, f"{prob * 100:.1f}%"] for cat, prob in risk_probs.items()]
        prob_table = Table(prob_data, colWidths=[2.5 * inch, 3.5 * inch])
        prob_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
            ("TEXTCOLOR", (0, 0), (-1, -1), DARK_TEXT),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E1")),
        ]))
        elements.append(prob_table)

    # ── Footer ───────────────────────────────────────────────────────────
    elements.append(Spacer(1, 30))
    elements.append(HRFlowable(
        width="100%", thickness=1, color=HexColor("#CBD5E1"), spaceAfter=8
    ))
    elements.append(Paragraph(
        "This report is auto-generated by the Smart Healthcare Risk Prediction System. "
        "It is intended for informational purposes only and does not constitute medical advice.",
        ParagraphStyle("Disclaimer", parent=body_style, fontSize=8,
                        textColor=HexColor("#94A3B8"), alignment=TA_CENTER),
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
