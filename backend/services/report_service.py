from __future__ import annotations

import json
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from models.schemas import ShortlistResponse


def build_pdf_report(shortlist: ShortlistResponse) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, title="ATSight Shortlist Report")
    styles = getSampleStyleSheet()
    elements = [Paragraph("ATSight - HR Shortlist Report", styles["Title"]), Spacer(1, 10)]
    elements.append(Paragraph(f"Role Domain: {shortlist.jd.role_domain}", styles["Normal"]))
    elements.append(Paragraph(f"Total Candidates: {len(shortlist.candidates)}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    table_data = [["Rank", "Candidate", "Score", "Recommendation", "Strengths", "Missing Skills"]]
    for candidate in shortlist.candidates:
        table_data.append(
            [
                str(candidate.rank or "-"),
                candidate.profile.name,
                f"{candidate.total_score:.2f}",
                candidate.recommendation,
                ", ".join(candidate.strengths[:3]) or "-",
                ", ".join(candidate.missing_skills[:3]) or "-",
            ]
        )
    table = Table(table_data, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ALIGN", (0, 0), (3, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
            ]
        )
    )
    elements.extend([table, Spacer(1, 14)])

    for c in shortlist.candidates:
        elements.append(Paragraph(f"{c.rank}. {c.profile.name} - {c.recommendation}", styles["Heading4"]))
        elements.append(Paragraph(c.ai_explanation, styles["BodyText"]))
        elements.append(Spacer(1, 6))

    if shortlist.overrides:
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("Override Logs", styles["Heading3"]))
        for row in shortlist.overrides:
            line = (
                f"{row.created_at} | {row.candidate_id} | recommendation: {row.recommendation or '-'} | "
                f"score: {row.total_score if row.total_score is not None else '-'} | reason: {row.reason}"
            )
            elements.append(Paragraph(line, styles["BodyText"]))
            elements.append(Spacer(1, 3))

    doc.build(elements)
    return buffer.getvalue()


def build_json_report(shortlist: ShortlistResponse) -> bytes:
    return json.dumps(shortlist.model_dump(), indent=2).encode("utf-8")
