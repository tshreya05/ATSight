def generate_suggestions(resume_skills, jd_skills, resume_text):
    """
    Generates structured suggestions and categorizes matched/missing keywords.
    Provides 'target_text' for frontend PDF highlighting.
    """
    resume_skill_set = set()
    jd_skill_set = set()

    # Flatten nested skill categories into sets
    for skills in resume_skills.values():
        resume_skill_set.update([s.lower() for s in skills])

    for skills in jd_skills.values():
        jd_skill_set.update([s.lower() for s in skills])

    # Calculate Matched and Missing
    matched_skills = list(resume_skill_set & jd_skill_set)
    missing_skills = list(jd_skill_set - resume_skill_set)

    detailed_suggestions = []

    # --- 1. Skill-Based Suggestions ---
    if missing_skills:
        detailed_suggestions.append({
            "label": "Missing Core Skills",
            "target_text": None, # General suggestion, no highlight
            "message": f"The JD specifically looks for {', '.join(missing_skills[:3])}. Consider adding these to your skills section.",
            "type": "error"
        })

    # --- 2. Action Verb Highlighting (The 'Instead of this, do that' logic) ---
    # We map weak verbs to a message suggesting a stronger alternative
    weak_to_strong = {
        "developed": "Engineered",
        "helped": "Facilitated",
        "worked": "Spearheaded",
        "responsible": "Accountable for",
        "managed": "Orchestrated"
    }

    resume_text_lower = resume_text.lower()
    for weak, strong in weak_to_strong.items():
        if weak in resume_text_lower:
            detailed_suggestions.append({
                "label": "Stronger Impact",
                "target_text": weak, # Frontend will find this word in the PDF
                "message": f"Replace the passive verb '{weak}' with '{strong}' to show more leadership and initiative.",
                "type": "warning"
            })

    # --- 3. Formatting & Completeness ---
    critical_sections = {
        "education": "Education",
        "experience": "Professional Experience",
        "project": "Projects"
    }
    
    for key, label in critical_sections.items():
        if key not in resume_text_lower:
            detailed_suggestions.append({
                "label": "Formatting",
                "target_text": None,
                "message": f"Section '{label}' was not detected. Ensure your headers are clear and standard.",
                "type": "error"
            })

    return {
        "matched": matched_skills,
        "missing": missing_skills,
        "detailed": detailed_suggestions
    }