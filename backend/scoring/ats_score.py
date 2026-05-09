def calculate_ats_score(resume_skills, jd_skills, jd_similarity, resume_text):
    """
    Calculates ATS score out of 100.
    """

    # -------- Skill Match Score --------
    resume_skill_set = set()
    jd_skill_set = set()

    for skills in resume_skills.values():
        resume_skill_set.update(skills)

    for skills in jd_skills.values():
        jd_skill_set.update(skills)

    if jd_skill_set:
        skill_match_ratio = len(resume_skill_set & jd_skill_set) / len(jd_skill_set)
    else:
        skill_match_ratio = 0

    skill_score = skill_match_ratio * 40

    # -------- JD Similarity Score --------
    similarity_score = jd_similarity * 40

    # -------- Resume Completeness --------
    sections = ["skill", "education", "experience", "project"]
    completeness_hits = sum(1 for sec in sections if sec in resume_text.lower())
    completeness_score = (completeness_hits / len(sections)) * 20

    total_score = skill_score + similarity_score + completeness_score

    return round(total_score, 2)
