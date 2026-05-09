import io
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from backend.nlp.jd_matcher import calculate_jd_similarity
from backend.nlp.preprocess import preprocess_text
from backend.nlp.skill_extractor import extract_skills
from backend.resume_parser.docx_parser import extract_text_from_docx
from backend.resume_parser.pdf_parser import extract_text_from_pdf
from backend.scoring.ats_score import calculate_ats_score
from backend.feedback.suggestions import generate_suggestions
from backend.feedback.ai_coach import get_ai_resume_critique

router = APIRouter(prefix="/api/v1/candidate", tags=["Candidate"])

@router.post("/analyze")
async def analyze_candidate_resume(
    resume: UploadFile = File(...),
    jd_text: str = Form("")
):
    try:
        file_bytes = await resume.read()
        filename = resume.filename.lower()
        
        # Extract text based on file type
        if filename.endswith(".pdf"):
            pdf_result = extract_text_from_pdf(io.BytesIO(file_bytes))
            resume_text = pdf_result[0] if isinstance(pdf_result, tuple) else pdf_result
        elif filename.endswith(".docx"):
            docx_result = extract_text_from_docx(io.BytesIO(file_bytes))
            resume_text = docx_result[0] if isinstance(docx_result, tuple) else docx_result
        elif filename.endswith(".txt"):
            resume_text = file_bytes.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the uploaded resume.")

        # If JD is empty, we will provide a generic JD or process without it.
        # But our current logic requires a JD for matching keywords. Let's use a dummy generic JD if empty,
        # or handle it gracefully. The prompt implies we use existing ATS logic.
        actual_jd = jd_text if jd_text.strip() else "Software Engineer Developer Team Player Communication Leadership"
        
        cleaned_resume = preprocess_text(resume_text)
        cleaned_jd = preprocess_text(actual_jd)
        
        resume_skills = extract_skills(cleaned_resume)
        jd_skills = extract_skills(cleaned_jd)
        
        # To avoid division by zero or weird scores if JD is purely empty/dummy,
        # calculate_jd_similarity usually handles it.
        jd_similarity = calculate_jd_similarity(cleaned_resume, cleaned_jd)
        
        ats_score = calculate_ats_score(resume_skills, jd_skills, jd_similarity, resume_text)
        feedback = generate_suggestions(resume_skills, jd_skills, resume_text)
        ai_coach_report = get_ai_resume_critique(resume_text, actual_jd)

        return {
            "ats_score": ats_score,
            "matched_keywords": feedback.get("matched", []),
            "missing_keywords": feedback.get("missing", []),
            "detailed_suggestions": feedback.get("detailed", []),
            "ai_coach": ai_coach_report
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
