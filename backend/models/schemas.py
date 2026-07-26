from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class RubricCategoryScore(BaseModel):
    score: float = Field(ge=0, le=10)
    weighted: float = Field(ge=0, le=100)
    reason: str


class CandidateProfile(BaseModel):
    source_type: Literal["resume", "linkedin_text", "linkedin_json"]
    source_name: str
    name: str = "Unknown Candidate"
    email: Optional[str] = None
    phone: Optional[str] = None
    headline: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    education: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)
    experience: List[str] = Field(default_factory=list)
    years_of_experience: float = 0
    communication_indicators: List[str] = Field(default_factory=list)
    raw_text: str


class ParsedJobDescription(BaseModel):
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    years_of_experience: float = 0
    education_requirements: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    role_domain: str = "General"


class CandidateEvaluation(BaseModel):
    candidate_id: str
    profile: CandidateProfile
    rubric: Dict[str, RubricCategoryScore]
    semantic_similarity: float = Field(ge=0, le=1)
    tfidf_similarity: float = Field(ge=0, le=1)
    strengths: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    ai_explanation: str = ""
    recommendation: Literal["Hire", "Maybe", "Reject"]
    total_score: float = Field(ge=0, le=100)
    rank: Optional[int] = None


class OverridePayload(BaseModel):
    candidate_id: str
    total_score: Optional[float] = Field(default=None, ge=0, le=100)
    recommendation: Optional[Literal["Hire", "Maybe", "Reject"]] = None
    reason: str = Field(min_length=3)
    category_updates: Dict[str, float] = Field(default_factory=dict)


class OverrideLog(BaseModel):
    candidate_id: str
    total_score: Optional[float] = None
    recommendation: Optional[str] = None
    category_updates: Dict[str, float] = Field(default_factory=dict)
    reason: str
    created_at: str


class ShortlistResponse(BaseModel):
    jd: ParsedJobDescription
    candidates: List[CandidateEvaluation]
    overrides: List[OverrideLog] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
