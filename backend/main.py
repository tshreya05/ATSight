import os
import sys
from pathlib import Path

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

# Supports `uvicorn main:app --reload` when run inside `backend/`.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from feedback.auto_correct import html_to_docx, improve_docx
from feedback.ai_coach import get_ai_resume_critique
from nlp.jd_matcher import calculate_jd_similarity
from nlp.preprocess import preprocess_text
from nlp.skill_extractor import extract_skills
from resume_parser.docx_parser import extract_text_from_docx
from resume_parser.pdf_parser import extract_text_from_pdf
from scoring.ats_score import calculate_ats_score
from feedback.suggestions import generate_suggestions
from routes.shortlist import router as shortlist_router, shortlist_candidates
from routes.candidate import router as candidate_router

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    # Keeps app bootable even before dependency installation.
    pass

app = FastAPI(title="ATSight - HR Resume & LinkedIn Shortlisting Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def optional_api_key_guard(request, call_next):
    expected_key = os.getenv("AT_SIGHT_API_KEY", "").strip()
    if not expected_key:
        return await call_next(request)
    incoming = request.headers.get("x-api-key", "").strip()
    if incoming != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized.")
    return await call_next(request)


app.include_router(shortlist_router)
app.include_router(candidate_router)


@app.get("/")
def root():
    return {"status": "ATSight backend is running.", "docs": "/docs"}


@app.post("/analyze-resume")
async def analyze_resume_compat(file: UploadFile = File(...), jd_text: str = Form(...)):
    """Compatibility endpoint retained for existing UI flow."""
    response = await shortlist_candidates(jd_text=jd_text, resumes=[file], linkedin_text=None, linkedin_json=None)
    first = response["candidates"][0]
    return {
        "filename": file.filename,
        "ats_score": first["total_score"],
        "matched_keywords": first["strengths"],
        "missing_keywords": first["missing_skills"],
        "detailed_suggestions": [{"label": "Gap", "message": x} for x in first["missing_skills"]],
        "ai_coach": {"summary": first["ai_explanation"], "missing_parts": first["missing_skills"], "strategic_tip": "Close key skill gaps."},
        "word_map": [],
    }


@app.post("/improve-resume")
async def improve_resume_endpoint(file: UploadFile = File(...), suggestions_json: str = Form(...)):
    try:
        import json

        suggestions = json.loads(suggestions_json)
        file_bytes = await file.read()
        improved_bytes = improve_docx(file_bytes, suggestions)
        return Response(
            content=improved_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=Improved_{file.filename}"},
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Auto-correction failed: {str(exc)}")


@app.post("/download-resume")
async def download_resume(html_content: str = Form(...), filename: str = Form(...)):
    try:
        docx_bytes = html_to_docx(html_content)
        return StreamingResponse(
            iter([docx_bytes]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=Improved_{filename}"},
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(exc)}")


@app.post("/save-and-rerun")
async def save_and_rerun(html_content: str = Form(...), jd_text: str = Form(...), filename: str = Form(...)):
    try:
        docx_bytes = html_to_docx(html_content)
        from io import BytesIO

        fake_file = BytesIO(docx_bytes)
        resume_text = extract_text_from_docx(fake_file)
        cleaned_resume = preprocess_text(resume_text)
        cleaned_jd = preprocess_text(jd_text)
        resume_skills = extract_skills(cleaned_resume)
        jd_skills = extract_skills(cleaned_jd)
        jd_similarity = calculate_jd_similarity(cleaned_resume, cleaned_jd)
        ats_score = calculate_ats_score(resume_skills, jd_skills, jd_similarity, resume_text)
        feedback = generate_suggestions(resume_skills, jd_skills, resume_text)
        ai_coach_report = get_ai_resume_critique(resume_text, jd_text)
        return {
            "ats_score": ats_score,
            "matched_keywords": feedback["matched"],
            "missing_keywords": feedback["missing"],
            "detailed_suggestions": feedback["detailed"],
            "ai_coach": ai_coach_report,
            "new_docx_content": docx_bytes.hex(),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))