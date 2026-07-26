from __future__ import annotations

import json
import re
from io import BytesIO
from typing import Any, Dict, List, Tuple

import pdfplumber
from docx import Document

from models.schemas import CandidateProfile
from utils.text import clean_text, extract_first, split_lines, unique_preserve


KNOWN_SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "node",
    "fastapi",
    "django",
    "flask",
    "sql",
    "postgresql",
    "mongodb",
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "tensorflow",
    "pytorch",
    "machine learning",
    "nlp",
    "langchain",
    "faiss",
    "git",
]


def parse_resume_file(filename: str, content: bytes) -> CandidateProfile:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        text = _extract_pdf_text(content)
    elif lower.endswith(".docx"):
        text = _extract_docx_text(content)
    else:
        raise ValueError("Unsupported resume type. Upload PDF or DOCX.")
    return _candidate_from_text(text, source_type="resume", source_name=filename)


def parse_linkedin_text(text: str, source_name: str = "linkedin-text") -> CandidateProfile:
    return _candidate_from_text(text, source_type="linkedin_text", source_name=source_name)


def parse_linkedin_json(content: bytes, source_name: str) -> CandidateProfile:
    payload = json.loads(content.decode("utf-8"))
    normalized = _linkedin_json_to_text(payload)
    profile = _candidate_from_text(normalized, source_type="linkedin_json", source_name=source_name)
    if isinstance(payload, dict):
        profile.name = payload.get("name") or profile.name
        profile.headline = payload.get("headline") or profile.headline
    return profile


def _extract_pdf_text(content: bytes) -> str:
    chunks: List[str] = []
    with pdfplumber.open(BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                chunks.append(page_text)
    return "\n".join(chunks)


def _extract_docx_text(content: bytes) -> str:
    doc = Document(BytesIO(content))
    return "\n".join(para.text for para in doc.paragraphs if para.text.strip())


def _candidate_from_text(text: str, source_type: str, source_name: str) -> CandidateProfile:
    raw = clean_text(text)
    lines = split_lines(text)
    email = extract_first(r"([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})", raw)
    phone = extract_first(r"(\+?\d[\d\-\s\(\)]{8,}\d)", raw)
    name = _infer_name(lines)
    skills = _extract_skills(raw)
    education = _extract_section(lines, ["education", "academic"])
    certs = _extract_section(lines, ["certification", "certificate", "licenses"])
    projects = _extract_section(lines, ["project", "portfolio"])
    experience = _extract_section(lines, ["experience", "work history", "employment"])
    years = _extract_years_of_experience(raw, experience)
    communication = _communication_indicators(raw)
    headline = lines[1] if len(lines) > 1 and len(lines[1]) < 120 else None

    return CandidateProfile(
        source_type=source_type,
        source_name=source_name,
        name=name,
        email=email,
        phone=phone,
        headline=headline,
        skills=skills,
        education=education,
        certifications=certs,
        projects=projects,
        experience=experience,
        years_of_experience=years,
        communication_indicators=communication,
        raw_text=raw,
    )


def _infer_name(lines: List[str]) -> str:
    for line in lines[:5]:
        if "@" in line or any(ch.isdigit() for ch in line):
            continue
        if 2 <= len(line.split()) <= 4:
            return line.strip()
    return "Unknown Candidate"


def _extract_skills(text: str) -> List[str]:
    found = []
    lowered = text.lower()
    for skill in KNOWN_SKILLS:
        if re.search(rf"\b{re.escape(skill)}\b", lowered):
            found.append(skill.title())
    return unique_preserve(found)


def _extract_section(lines: List[str], section_keywords: List[str]) -> List[str]:
    out: List[str] = []
    capture = False
    for line in lines:
        lower = line.lower()
        if any(keyword in lower for keyword in section_keywords):
            capture = True
            continue
        if capture and len(line.split()) <= 2 and line.isupper():
            break
        if capture:
            out.append(line)
            if len(out) >= 5:
                break
    return unique_preserve(out)


def _extract_years_of_experience(text: str, experience_lines: List[str]) -> float:
    explicit = re.findall(r"(\d+(?:\.\d+)?)\+?\s+years?", text.lower())
    if explicit:
        return max(float(x) for x in explicit)
    date_spans = re.findall(r"(20\d{2})\s*[-to]+\s*(20\d{2}|present|current)", text.lower())
    years = []
    for start, end in date_spans:
        start_year = int(start)
        end_year = 2026 if end in {"present", "current"} else int(end)
        if end_year >= start_year:
            years.append(end_year - start_year)
    if years:
        return float(max(years))
    return 0.0


def _communication_indicators(text: str) -> List[str]:
    indicators: List[str] = []
    sentence_count = len(re.findall(r"[.!?]", text))
    if sentence_count >= 8:
        indicators.append("Uses complete descriptive sentences")
    if len(text) > 1800:
        indicators.append("Detailed profile depth")
    if re.search(r"\b(led|managed|presented|collaborated|stakeholders)\b", text.lower()):
        indicators.append("Contains collaboration and leadership language")
    return indicators or ["Limited communication evidence"]


def _linkedin_json_to_text(payload: Dict[str, Any]) -> str:
    segments: List[str] = []
    for key in ["name", "headline", "about"]:
        val = payload.get(key)
        if isinstance(val, str):
            segments.append(val)
    for section in ["skills", "experience", "education", "certifications", "projects"]:
        value = payload.get(section)
        if isinstance(value, list):
            segments.extend([str(item) for item in value])
        elif isinstance(value, str):
            segments.append(value)
    return "\n".join(segments)
