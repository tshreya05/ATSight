from __future__ import annotations

import uuid
from typing import List

from langchain_core.prompts import PromptTemplate

from embeddings.semantic_matcher import semantic_similarity, tfidf_similarity
from models.schemas import CandidateEvaluation, CandidateProfile, ParsedJobDescription, ShortlistResponse
from scoring.rubric import recommendation_from_score, score_candidate
from services.gemini_service import GeminiService


def evaluate_candidates(jd: ParsedJobDescription, jd_text: str, profiles: List[CandidateProfile]) -> ShortlistResponse:
    results: List[CandidateEvaluation] = []
    for profile in profiles:
        rubric, total = score_candidate(profile, jd)
        rubric = _ai_rubric_reasons(jd, profile, rubric)
        sem = semantic_similarity(jd_text, profile.raw_text)
        tfidf = tfidf_similarity(jd_text, profile.raw_text)
        strengths, missing = _derive_strengths_and_gaps(jd, profile)
        explanation = _generate_ai_explanation(jd, profile, total, strengths, missing)
        results.append(
            CandidateEvaluation(
                candidate_id=str(uuid.uuid4()),
                profile=profile,
                rubric=rubric,
                semantic_similarity=sem,
                tfidf_similarity=tfidf,
                strengths=strengths,
                missing_skills=missing,
                ai_explanation=explanation,
                recommendation=recommendation_from_score(total),
                total_score=total,
            )
        )
    ranked = sorted(results, key=lambda c: c.total_score, reverse=True)
    for idx, candidate in enumerate(ranked, start=1):
        candidate.rank = idx
    return ShortlistResponse(
        jd=jd,
        candidates=ranked,
        metadata={"total_candidates": len(ranked), "scoring_model": "rubric-v1"},
    )


def _ai_rubric_reasons(jd: ParsedJobDescription, profile: CandidateProfile, rubric):
    try:
        prompt = PromptTemplate.from_template(
            "You are an HR evaluator. Generate concise reasons (max 16 words each) for these rubric categories:\n"
            "skills_match, experience_relevance, education_certifications, projects_portfolio, communication_quality.\n"
            "Return strict JSON object with those five keys and string values only.\n"
            "Role: {role}\nCandidate: {name}\nSkills: {skills}\nExperience: {experience}\nEducation: {education}\n"
            "Certifications: {certs}\nProjects: {projects}\nCommunication signals: {communication}"
        )
        llm = GeminiService(model_name="gemini-1.5-pro")
        reason_map = llm.generate_json(
            prompt.format(
                role=jd.role_domain,
                name=profile.name,
                skills=", ".join(profile.skills) or "None",
                experience=", ".join(profile.experience) or "None",
                education=", ".join(profile.education) or "None",
                certs=", ".join(profile.certifications) or "None",
                projects=", ".join(profile.projects) or "None",
                communication=", ".join(profile.communication_indicators) or "None",
            )
        )
        for key in rubric:
            if key in reason_map and isinstance(reason_map[key], str) and reason_map[key].strip():
                rubric[key].reason = reason_map[key].strip()
    except Exception:
        pass
    return rubric


def _derive_strengths_and_gaps(jd: ParsedJobDescription, profile: CandidateProfile):
    required = {item.lower() for item in (jd.required_skills or jd.keywords)}
    actual = {item.lower() for item in profile.skills}
    strengths = sorted(actual.intersection(required))
    missing = sorted(required - actual)
    strengths = [s.title() for s in strengths[:8]]
    missing = [s.title() for s in missing[:8]]
    return strengths, missing


def _generate_ai_explanation(
    jd: ParsedJobDescription,
    profile: CandidateProfile,
    total_score: float,
    strengths: List[str],
    missing: List[str],
) -> str:
    try:
        prompt = PromptTemplate.from_template(
            "You are an HR shortlisting assistant. Provide a concise deterministic explanation (max 90 words). "
            "Include fit, strengths, and key improvement area.\n"
            "Role: {role}\n"
            "Candidate: {name}\n"
            "Score: {score}\n"
            "Strengths: {strengths}\n"
            "Missing: {missing}"
        )
        llm = GeminiService(model_name="gemini-1.5-pro")
        built_prompt = prompt.format(
            role=jd.role_domain,
            name=profile.name,
            score=total_score,
            strengths=", ".join(strengths) or "None",
            missing=", ".join(missing) or "None",
        )
        return llm.generate_text(built_prompt)
    except Exception:
        return (
            f"{profile.name} shows relevant alignment for {jd.role_domain}. "
            f"Core strengths: {', '.join(strengths) or 'general profile fit'}. "
            f"Primary improvement area: {', '.join(missing[:3]) or 'deeper role-specific examples'}."
        )
