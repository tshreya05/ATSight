# ATSight - AI Resume & LinkedIn Shortlisting Agent

ATSight is a full-stack FastAPI + React application for HR teams to shortlist candidates using multi-resume ingestion, LinkedIn profile ingestion, semantic matching, rubric scoring, ranking, AI explanations, and downloadable shortlist reports.

## Features
- Multi-file resume upload (`.pdf`, `.docx`) with upload progress and validation
- LinkedIn profile ingestion via pasted text or JSON upload (no scraping)
- Structured candidate extraction (name, contacts, skills, education, certifications, projects, experience, years)
- Job description parser using LangChain PromptTemplate + structured JSON output
- Semantic similarity with Sentence Transformers (`all-MiniLM-L6-v2`) + cosine similarity
- Secondary TF-IDF similarity included for additional signal
- Rubric-based scoring with weighted categories:
  - Skills Match (30%)
  - Experience Relevance (25%)
  - Education & Certifications (15%)
  - Projects / Portfolio (20%)
  - Communication Quality (10%)
- Recommendation engine: `Hire` / `Maybe` / `Reject`
- Candidate ranking table and candidate detail cards
- AI-generated hiring explanations powered by `Gemini 1.5 Pro` via official Google SDK
- Human-in-the-loop override logging
- Downloadable shortlist reports in PDF and JSON

## Architecture
- **Routes:** `backend/routes/shortlist.py`
- **Services:** shortlisting, report generation, override persistence
- **Parsers:** JD parser, resume parser, LinkedIn parser
- **Embeddings:** SentenceTransformer semantic matcher
- **Scoring:** rubric engine with weighted categories
- **Models:** Pydantic schemas for structured payloads
- **Frontend:** single dashboard for input, ranking, candidate cards, exports, overrides

## Tech Stack
- Backend: FastAPI, Pydantic, python-dotenv, LangChain, Google Generative AI SDK, Sentence Transformers, scikit-learn, pdfplumber, python-docx, ReportLab
- Frontend: React + Vite + Axios
- Optional vector tooling: FAISS

## Folder Structure (Key Paths)
- `backend/main.py` - app entrypoint and middleware
- `backend/routes/shortlist.py` - shortlist/report/override APIs
- `backend/parsers/candidate_parser.py` - resume + LinkedIn parsing
- `backend/parsers/jd_parser.py` - JD extraction
- `backend/embeddings/semantic_matcher.py` - embeddings + similarity
- `backend/scoring/rubric.py` - weighted rubric scoring
- `backend/services/shortlist_service.py` - ranking + explanations
- `backend/services/report_service.py` - PDF/JSON reports
- `backend/services/override_store.py` - override logs
- `frontend/src/components/ShortlistDashboard.jsx` - main HR UI

## Setup
1. Create Python env and install dependencies:
   - `pip install -r requirements.txt`
2. Configure environment:
   - copy `.env.example` to `.env`
   - set `GEMINI_API_KEY`
   - optionally set `AT_SIGHT_API_KEY` for API auth middleware
3. Run backend:
   - `uvicorn backend.main:app --reload`
4. Run frontend:
   - `cd frontend && npm install && npm run dev`

## Workflow
1. Paste JD.
2. Upload multiple resumes.
3. Add LinkedIn text or JSON (optional).
4. Run shortlisting.
5. Review ranking table + score cards + missing skills.
6. Apply HR overrides.
7. Download PDF/JSON reports.

## AI Architecture Rationale
- **LangChain:** standardized prompts, deterministic structured outputs, cleaner model chaining
- **SentenceTransformer embeddings:** robust semantic matching for sparse resume keyword variation
- **`Gemini 1.5 Pro`:** deterministic, concise generation for JD parsing and hiring explanations
- **TF-IDF fallback:** interpretable lexical baseline for sanity checking semantic scores

## Security Mitigations
- **Prompt injection mitigation**
  - sanitize/normalize inputs before scoring
  - use structured JSON output parsing for JD extraction
  - validate request payloads with Pydantic
- **Data privacy / PII**
  - avoid persisting raw resumes by default
  - persist only minimal override metadata for auditability
- **API key security**
  - `.env` based key loading (`GEMINI_API_KEY`, optional `AT_SIGHT_API_KEY`)
  - no hardcoded secrets in code
- **Hallucination reduction**
  - low temperature deterministic prompting
  - bounded and schema-validated output fields
- **Unauthorized access**
  - optional `x-api-key` middleware in `backend/main.py`

## Environment Variables
- `GEMINI_API_KEY` - required for AI explanations/JD chain
- `AT_SIGHT_API_KEY` - optional backend route protection

## Future Improvements
- Persistent database-backed candidate and override history
- Batch async processing queue for very large hiring drives
- Better NER extraction and custom skill ontology tuning
- Recruiter calibration mode for score threshold tuning

