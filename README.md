# ATSight - AI Resume Intelligence Platform

# One Platform. Two Perspectives.
### Candidate ATS Optimization + Recruiter AI Shortlisting

An AI-powered Resume Intelligence Platform that helps **job seekers optimize resumes for Applicant Tracking Systems (ATS)** while enabling **recruiters to intelligently shortlist candidates** using semantic search, AI-powered scoring, and explainable hiring recommendations.

---

# Table of Contents

- Overview
- Features
- Candidate Portal
- Recruiter Portal
- AI Pipeline
- Architecture
- Technology Stack
- Folder Structure
- Installation
- Workflows
- ATS Scoring Methodology
- Security
- Future Improvements

---

# Overview

Modern recruitment has two major challenges:

- **Candidates** often get rejected by Applicant Tracking Systems because of missing keywords, weak formatting, or poor resume optimization.
- **Recruiters** spend hours manually reviewing hundreds of resumes for a single job posting.

ATSight solves both problems within a single AI-powered platform.

## Candidate Portal

Candidates can:

- Upload resumes
- Compare resumes against Job Descriptions
- Measure ATS compatibility
- Identify missing keywords
- Receive AI suggestions
- Download ATS reports

## Recruiter Portal

Recruiters can:

- Upload multiple resumes
- Parse candidate information
- Rank applicants
- Compare candidates
- Receive explainable hiring recommendations
- Export reports

---

# Features

## Candidate ATS Analyzer

### Resume Upload

- PDF Resume Support
- DOCX Resume Support
- Drag-and-Drop Upload
- Resume Validation

---

### ATS Score Analysis

Measures

- ATS Compatibility Score
- Resume Formatting
- Keyword Density
- Keyword Match
- Missing Skills
- Semantic Similarity
- Experience Relevance
- Education Score
- Project Score
- Communication Score

---

### AI Resume Improvement

Gemini generates suggestions for

- Better resume summary
- Better action verbs
- Resume restructuring
- Missing technologies
- Missing certifications
- Better project descriptions
- Resume formatting improvements
- Keyword optimization

---

### Resume vs Job Description Matching

Uses Sentence Transformers to calculate

- Semantic Match %
- Skill Match %
- Experience Match %
- Overall ATS Score

---

### Downloadable Reports

- ATS Report PDF
- JSON Report
- Resume Insights

---

# Recruiter AI Shortlisting

## Resume Parsing

Automatically extracts

- Candidate Name
- Contact Details
- Skills
- Experience
- Projects
- Education
- Certifications
- Years of Experience

---

## LinkedIn Parsing

Supports

- LinkedIn Text
- LinkedIn JSON Export

(No scraping required)

---

## AI Job Description Parser

Automatically extracts

- Required Skills
- Experience
- Certifications
- Responsibilities
- Education Requirements

using LangChain Prompt Templates and structured JSON outputs.

---

## Semantic Matching

Uses

- SentenceTransformer
- Cosine Similarity
- TF-IDF

to understand semantic similarity instead of keyword matching.

---

## Weighted Rubric Scoring

| Category | Weight |
|-----------|---------|
| Skills Match | 30% |
| Experience | 25% |
| Projects | 20% |
| Education & Certifications | 15% |
| Communication | 10% |

---

## AI Recommendations

Candidates are automatically classified as

- Hire
- Maybe
- Reject

along with detailed AI explanations.

---

## Candidate Ranking Dashboard

Features

- Ranking Table
- Candidate Cards
- Missing Skills
- Score Breakdown
- Recruiter Notes
- HR Override Logging

---

## Report Generation

Download

- PDF Reports
- JSON Reports

---

# AI Pipeline

## Candidate Pipeline

```
Resume
     │
     ▼
Resume Parser
     │
     ▼
Job Description Parser
     │
     ▼
Keyword Extraction
     │
     ▼
Sentence Embeddings
     │
     ▼
Semantic Matching
     │
     ▼
ATS Score Engine
     │
     ▼
Gemini AI Suggestions
     │
     ▼
ATS Report
```

---

## Recruiter Pipeline

```
Multiple Resumes
        │
        ▼
Resume Parser
        │
        ▼
Candidate Extraction
        │
        ▼
LinkedIn Parsing
        │
        ▼
Job Description Parsing
        │
        ▼
Sentence Embeddings
        │
        ▼
Semantic Matching
        │
        ▼
Weighted Rubric
        │
        ▼
Ranking Engine
        │
        ▼
Gemini Hiring Explanation
        │
        ▼
Recruiter Dashboard
```

---

# Architecture

```
                    ATSight

        ┌──────────────────────────┐
        │        Frontend          │
        │       React + Vite       │
        └────────────┬─────────────┘
                     │
                     ▼
             FastAPI Backend
                     │
 ┌──────────────┬──────────────┬──────────────┐
 │              │              │              │
 ▼              ▼              ▼              ▼

Resume      JD Parser     LinkedIn      ATS Engine
Parser                      Parser

 │              │              │
 └──────────────┴──────────────┘
                │
                ▼
     Sentence Transformer Embeddings
                │
                ▼
         Cosine Similarity Engine
                │
                ▼
         Rubric Scoring Engine
                │
                ▼
      Gemini AI Explanation Engine
                │
                ▼
          Recruiter Dashboard
                │
                ▼
          Candidate Dashboard
```

---

# Technology Stack

## Backend

- FastAPI
- Pydantic
- LangChain
- Google Gemini 1.5 Pro
- Sentence Transformers
- Scikit-learn
- pdfplumber
- python-docx
- ReportLab
- python-dotenv

---

## Frontend

- React
- Vite
- Axios
- Tailwind CSS
- Framer Motion

---

## Machine Learning

- SentenceTransformer (all-MiniLM-L6-v2)
- Cosine Similarity
- TF-IDF
- Weighted Rubric Scoring
- Prompt Engineering
- Semantic Search

---

# Folder Structure

```
ATSight

backend/
│
├── routes/
│   ├── candidate.py
│   ├── recruiter.py
│   ├── shortlist.py
│
├── parsers/
│   ├── resume_parser.py
│   ├── linkedin_parser.py
│   ├── jd_parser.py
│
├── embeddings/
│   └── semantic_matcher.py
│
├── scoring/
│   ├── ats_score.py
│   ├── rubric.py
│   └── keyword_engine.py
│
├── services/
│   ├── candidate_service.py
│   ├── recruiter_service.py
│   ├── report_service.py
│   └── override_store.py
│
frontend/
│
├── Candidate Dashboard
├── Recruiter Dashboard
├── ATS Report
├── Candidate Cards
├── Ranking Table
```

---

# Installation

## Backend

```bash
git clone https://github.com/yourusername/ATSight.git

cd ATSight

pip install -r requirements.txt
```

Run

```bash
uvicorn backend.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Candidate Workflow

```
Upload Resume
      │
      ▼
Paste Job Description
      │
      ▼
Resume Parsing
      │
      ▼
Keyword Analysis
      │
      ▼
Semantic Matching
      │
      ▼
ATS Score Generation
      │
      ▼
Gemini Suggestions
      │
      ▼
Download ATS Report
```

---

# Recruiter Workflow

```
Upload Multiple Resumes
            │
            ▼
Paste Job Description
            │
            ▼
Resume Parsing
            │
            ▼
LinkedIn Parsing
            │
            ▼
Semantic Matching
            │
            ▼
Rubric Scoring
            │
            ▼
Candidate Ranking
            │
            ▼
Gemini Hiring Explanation
            │
            ▼
Export Reports
```

---

# ATS Scoring Methodology

The Candidate ATS Score is generated using a weighted scoring engine.

| Component | Weight |
|------------|---------|
| Keyword Match | 30% |
| Semantic Match | 25% |
| Experience Match | 20% |
| Education Match | 10% |
| Projects | 10% |
| Resume Formatting | 5% |

Final ATS Score

```
ATS Score =
0.30 × Keyword Match +
0.25 × Semantic Match +
0.20 × Experience +
0.10 × Education +
0.10 × Projects +
0.05 × Formatting
```

---

# Security

- Prompt Injection Protection
- Schema Validation using Pydantic
- Environment Variable Protection
- Optional API Authentication
- Hallucination Reduction
- Minimal Resume Storage
- Explainable AI Outputs

---

# Future Improvements

- AI Mock Interview
- Resume Heatmap
- GitHub Profile Analysis
- Portfolio Analyzer
- AI Cover Letter Generator
- LinkedIn Optimizer
- Skill Gap Learning Roadmap
- AI Career Coach
- Multi-language Resume Support
- FAISS Vector Database
- Recruiter Analytics Dashboard
- Persistent Candidate Database

---

# Why ATSight?

Unlike traditional ATS systems that only help recruiters, ATSight serves **both sides of the hiring process**.

### For Candidates

- Measure ATS compatibility
- Improve resume quality
- Optimize keywords
- Increase interview chances
- Receive AI-powered resume suggestions

### For Recruiters

- Screen hundreds of resumes automatically
- Rank candidates intelligently
- Explain hiring decisions using AI
- Export structured hiring reports
- Reduce manual screening time

---

## ⭐ If you found this project useful, don't forget to Star the repository!
