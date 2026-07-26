from __future__ import annotations

import re

from langchain_core.prompts import PromptTemplate

from backend.models.schemas import ParsedJobDescription
from backend.services.gemini_service import GeminiService
from backend.utils.text import clean_text, unique_preserve


def parse_job_description(jd_text: str) -> ParsedJobDescription:
    text = clean_text(jd_text)
    if not text:
        raise ValueError("Job description is required.")
    try:
        return _parse_with_llm(text)
    except Exception:
        return _parse_with_regex(text)


def _parse_with_llm(jd_text: str) -> ParsedJobDescription:
    prompt = PromptTemplate.from_template(
        "Extract hiring requirements from the Job Description.\n"
        "Return strict JSON only with keys:\n"
        "required_skills, preferred_skills, years_of_experience, education_requirements, certifications, keywords, role_domain.\n"
        "All list values must be arrays of strings. years_of_experience must be numeric.\n"
        "Do not return markdown.\n\n"
        "JD:\n{jd_text}"
    )
    llm = GeminiService(model_name="gemini-1.5-pro")
    built_prompt = prompt.format(jd_text=jd_text)
    parsed = llm.generate_json(built_prompt)
    return ParsedJobDescription(**parsed)


def _parse_with_regex(jd_text: str) -> ParsedJobDescription:
    lowered = jd_text.lower()
    skills = re.findall(r"\b(python|java|javascript|react|node|fastapi|sql|aws|docker|kubernetes|langchain|nlp|machine learning)\b", lowered)
    pref = re.findall(r"preferred[:\s]+([^.]+)", lowered)
    edu = re.findall(r"\b(bachelor|master|phd|b\.tech|m\.tech)\b", lowered)
    certs = re.findall(r"\b(certified|certification|aws certified|pmp|scrum)\b", lowered)
    yrs = re.findall(r"(\d+(?:\.\d+)?)\+?\s+years?", lowered)
    role = "General"
    role_match = re.search(r"(data scientist|ml engineer|software engineer|backend engineer|frontend engineer|product manager)", lowered)
    if role_match:
        role = role_match.group(1).title()
    keywords = unique_preserve(skills + edu + certs)
    return ParsedJobDescription(
        required_skills=unique_preserve([s.title() for s in skills]),
        preferred_skills=unique_preserve([part.strip().title() for group in pref for part in group.split(",")]),
        years_of_experience=max([float(y) for y in yrs], default=0.0),
        education_requirements=unique_preserve([e.title() for e in edu]),
        certifications=unique_preserve([c.title() for c in certs]),
        keywords=[k.title() for k in keywords],
        role_domain=role,
    )
