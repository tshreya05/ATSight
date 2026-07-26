import json
import re
from pathlib import Path

# Get absolute path to this file's directory
BASE_DIR = Path(__file__).resolve().parent.parent
SKILL_FILE = BASE_DIR / "data" / "skills.json"

with open(SKILL_FILE, "r", encoding="utf-8") as f:
    SKILLS_DB = json.load(f)

def extract_skills(cleaned_text: str):
    """
    Aggressively extracts skills from text.
    Uses regex boundary matching to avoid partial word matches 
    (e.g., 'Java' inside 'Javascript').
    """
    found_skills = {}
    # Use the cleaned text but keep it as a single string for phrase matching
    text = cleaned_text.lower()

    for category, skills in SKILLS_DB.items():
        matched = []
        for skill in skills:
            skill_lower = skill.lower()
            
            # AGGRESSIVE MATCHING: 
            # Use regex word boundaries (\b) to ensure 'C' doesn't match every word with a 'c'
            # Also handles multi-word skills like 'Machine Learning'
            pattern = rf"\b{re.escape(skill_lower)}\b"
            if re.search(pattern, text):
                matched.append(skill)

        if matched:
            found_skills[category] = list(set(matched)) # Ensure uniqueness

    return found_skills