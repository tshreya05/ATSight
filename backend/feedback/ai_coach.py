import json

from langchain_core.prompts import PromptTemplate

from services.gemini_service import GeminiService


def get_ai_resume_critique(resume_text, jd_text):
    try:
        prompt = PromptTemplate.from_template(
            "Act as an ATS consultant. Evaluate resume against JD and return strict JSON with keys:\n"
            "summary, perfect_matches, missing_gaps, actionable_improvements, formatting_check, strategic_tip.\n"
            "All list-like fields must be arrays of strings. No markdown.\n\n"
            "RESUME:\n{resume_text}\n\n"
            "JD:\n{jd_text}"
        )
        llm = GeminiService(model_name="gemini-1.5-pro")
        built_prompt = prompt.format(resume_text=resume_text, jd_text=jd_text)
        return llm.generate_json(built_prompt)

    except Exception as e:
        return {
            "summary": "Gemini coach fallback response due to API error.",
            "missing_parts": [f"Details: {str(e)}"],
            "strategic_tip": "Verify GEMINI_API_KEY and internet connectivity.",
        }