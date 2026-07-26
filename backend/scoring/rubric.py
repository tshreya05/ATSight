from __future__ import annotations

from typing import Dict, Tuple

from embeddings.semantic_matcher import overlap_ratio, semantic_similarity
from models.schemas import CandidateProfile, ParsedJobDescription, RubricCategoryScore


WEIGHTS = {
    "skills_match": 30,
    "experience_relevance": 25,
    "education_certifications": 15,
    "projects_portfolio": 20,
    "communication_quality": 10,
}


def score_candidate(profile: CandidateProfile, jd: ParsedJobDescription) -> Tuple[Dict[str, RubricCategoryScore], float]:
    skills_raw = min(10.0, (overlap_ratio(profile.skills, jd.required_skills or jd.keywords) * 10) + 2.0)
    exp_ratio = 1.0 if jd.years_of_experience <= 0 else min(profile.years_of_experience / jd.years_of_experience, 1.2)
    exp_raw = min(10.0, round(exp_ratio * 8.3, 2))
    edu_hits = overlap_ratio(profile.education + profile.certifications, jd.education_requirements + jd.certifications)
    edu_raw = min(10.0, round((edu_hits * 10) + (1.5 if profile.certifications else 0), 2))
    projects_raw = min(10.0, 4 + min(len(profile.projects), 6))
    comm_raw = min(10.0, 4 + min(len(profile.communication_indicators) * 2, 6))

    rubric = {
        "skills_match": _row(skills_raw, WEIGHTS["skills_match"], "Alignment between candidate skills and JD requirements."),
        "experience_relevance": _row(exp_raw, WEIGHTS["experience_relevance"], "Relevant years and domain alignment for the target role."),
        "education_certifications": _row(edu_raw, WEIGHTS["education_certifications"], "Academic and certification fit for role expectations."),
        "projects_portfolio": _row(projects_raw, WEIGHTS["projects_portfolio"], "Project depth and demonstrable portfolio quality."),
        "communication_quality": _row(comm_raw, WEIGHTS["communication_quality"], "Clarity, structure, and impact language in profile."),
    }
    total = round(sum(item.weighted for item in rubric.values()), 2)
    return rubric, total


def recommendation_from_score(total_score: float) -> str:
    if total_score >= 80:
        return "Hire"
    if total_score >= 60:
        return "Maybe"
    return "Reject"


def _row(score: float, weight: int, reason: str) -> RubricCategoryScore:
    return RubricCategoryScore(score=round(score, 2), weighted=round((score / 10.0) * weight, 2), reason=reason)
