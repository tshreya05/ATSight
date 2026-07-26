from __future__ import annotations

import asyncio
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from models.schemas import OverridePayload
from parsers.candidate_parser import parse_linkedin_json, parse_linkedin_text, parse_resume_file
from parsers.jd_parser import parse_job_description
from services.override_store import append_override, read_override_logs
from services.report_service import build_json_report, build_pdf_report
from services.shortlist_service import evaluate_candidates

router = APIRouter(prefix="/api/v1", tags=["shortlisting"])

_LAST_SHORTLIST = None
_RESUME_FILES = {}
MAX_FILES = 20
MAX_FILE_SIZE = 10 * 1024 * 1024


async def _parse_resume_upload(resume: UploadFile):
    if not resume.filename:
        return None, "Unnamed file was skipped.", None
    if not resume.filename.lower().endswith((".pdf", ".docx")):
        return None, f"{resume.filename}: Unsupported format.", None
    content = await resume.read()
    if len(content) > MAX_FILE_SIZE:
        return None, f"{resume.filename}: File exceeds 10MB limit.", None
    profile = await asyncio.to_thread(parse_resume_file, resume.filename, content)
    return profile, None, content


@router.post("/shortlist")
async def shortlist_candidates(
    jd_text: str = Form(...),
    resumes: List[UploadFile] = File(default=[]),
    linkedin_text: Optional[str] = Form(default=None),
    linkedin_json: Optional[UploadFile] = File(default=None),
):
    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")
    if len(resumes) > MAX_FILES:
        raise HTTPException(status_code=400, detail="Maximum 20 resumes allowed per request.")

    profiles = []
    errors = []
    file_contents = {}

    resume_results = await asyncio.gather(*[_parse_resume_upload(resume) for resume in resumes], return_exceptions=True)
    for result in resume_results:
        if isinstance(result, Exception):
            errors.append(str(result))
            continue
        profile, error, content = result
        if error:
            errors.append(error)
            continue
        if profile:
            profiles.append(profile)
            if content:
                file_contents[profile.source_name] = content

    if linkedin_text and linkedin_text.strip():
        profiles.append(parse_linkedin_text(linkedin_text.strip()))
    if linkedin_json and linkedin_json.filename:
        try:
            content = await linkedin_json.read()
            profiles.append(parse_linkedin_json(content, linkedin_json.filename))
            file_contents[linkedin_json.filename] = content
        except Exception as exc:
            errors.append(f"{linkedin_json.filename}: {str(exc)}")

    if not profiles:
        raise HTTPException(status_code=400, detail="No valid candidates uploaded.")

    jd = parse_job_description(jd_text)
    shortlist = evaluate_candidates(jd=jd, jd_text=jd_text, profiles=profiles)
    shortlist.overrides = read_override_logs()
    
    global _LAST_SHORTLIST, _RESUME_FILES
    _LAST_SHORTLIST = shortlist
    
    _RESUME_FILES.clear()
    for cand in shortlist.candidates:
        src = cand.profile.source_name
        if src in file_contents:
            _RESUME_FILES[cand.candidate_id] = {
                "filename": src,
                "content": file_contents[src]
            }

    payload = shortlist.model_dump()
    payload["errors"] = errors
    return payload


@router.post("/override")
async def override_candidate(payload: OverridePayload):
    log = append_override(payload)
    return {"status": "ok", "override": log.model_dump()}


@router.get("/report/pdf")
async def download_pdf_report():
    if _LAST_SHORTLIST is None:
        raise HTTPException(status_code=404, detail="No shortlist generated yet.")
    pdf_bytes = build_pdf_report(_LAST_SHORTLIST)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ATSight_shortlist_report.pdf"},
    )


@router.get("/report/json")
async def download_json_report():
    if _LAST_SHORTLIST is None:
        raise HTTPException(status_code=404, detail="No shortlist generated yet.")
    json_bytes = build_json_report(_LAST_SHORTLIST)
    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=ATSight_shortlist_report.json"},
    )


@router.get("/resume-preview/{candidate_id}")
async def get_resume_preview(candidate_id: str):
    file_data = _RESUME_FILES.get(candidate_id)
    if not file_data:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    filename = file_data["filename"].lower()
    content = file_data["content"]
    
    if filename.endswith(".pdf"):
        return Response(content=content, media_type="application/pdf")
    elif filename.endswith(".docx"):
        from backend.resume_parser.docx_parser import extract_text_from_docx
        from io import BytesIO
        text = extract_text_from_docx(BytesIO(content))
        if isinstance(text, tuple):
            text = text[0]
        return Response(content=text, media_type="text/plain")
    elif filename.endswith(".json"):
        return Response(content=content, media_type="application/json")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")


@router.get("/resume-download/{candidate_id}")
async def download_resume(candidate_id: str):
    file_data = _RESUME_FILES.get(candidate_id)
    if not file_data:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    filename = file_data["filename"]
    content = file_data["content"]
    
    media_type = "application/octet-stream"
    if filename.lower().endswith(".pdf"):
        media_type = "application/pdf"
    elif filename.lower().endswith(".docx"):
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif filename.lower().endswith(".json"):
        media_type = "application/json"
        
    return Response(
        content=content, 
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
