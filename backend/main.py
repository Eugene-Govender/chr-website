"""CHR Consulting recruitment website API."""

import json
import logging
import sys
import traceback
from datetime import datetime
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import ai_engine
import database as db
import notifications
from config import CV_STORAGE_PATH, FRONTEND_URL, WEBSITE_PORT
from models import JobResponse, SubmitAnswersRequest
from spec_utils import is_yazoo_spec, strip_salary_from_text

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI(title="CHR Consulting Recruitment API", version="1.0.0")


def _cors_origins() -> list[str]:
    origins = [
        "http://localhost:5173",
        "https://chr-website-production.up.railway.app",
        "https://appealing-elegance-production-5d3c.up.railway.app",
        "https://chrconsulting.co.za",
        "https://www.chrconsulting.co.za",
    ]
    if FRONTEND_URL:
        url = FRONTEND_URL.rstrip("/")
        if url not in origins:
            origins.append(url)
    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_CV_BYTES = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def _public_job(job: dict) -> JobResponse:
    payload = dict(job)
    client_name = payload.pop("client_name", None)
    if is_yazoo_spec({**payload, "client_name": client_name}):
        payload["salary_range"] = None
        if payload.get("raw_text"):
            payload["raw_text"] = strip_salary_from_text(payload["raw_text"])
    return JobResponse(**payload)


@app.get("/health")
def health_check():
    try:
        db.check_connection()
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        log.exception("Health check failed")
        return {"status": "error", "database": str(exc)}


@app.get("/")
def root():
    return {
        "service": "CHR Consulting Recruitment API",
        "website": "http://localhost:5173",
        "docs": "/docs",
        "endpoints": ["/api/jobs", "/api/stats", "/api/apply"],
    }


@app.get("/api/jobs", response_model=list[JobResponse])
def list_jobs():
    jobs = db.get_open_jobs()
    return [_public_job(job) for job in jobs]


@app.get("/api/jobs/{spec_id}", response_model=JobResponse)
def get_job(spec_id: int):
    job = db.get_job_by_id(spec_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _public_job(job)


@app.get("/api/stats")
def get_stats():
    counts = db.get_stats_counts()
    candidates = counts["candidates"]
    candidates_label = f"{candidates}+" if candidates >= 100 else str(max(candidates, 1))
    return {
        "candidates_in_network": candidates_label,
        "client_retention": "92%",
        "industries_served": "6",
        "years_experience": "15+",
    }


def _safe_filename(name: str) -> str:
    base = Path(name or "cv").name
    return "".join(c if c.isalnum() or c in "._-" else "_" for c in base)


@app.post("/api/apply")
async def apply(
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    spec_id: int = Form(...),
    cv_file: UploadFile = File(...),
):
    suffix = Path(cv_file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are accepted")

    content = await cv_file.read()
    if len(content) > MAX_CV_BYTES:
        raise HTTPException(status_code=400, detail="CV file must be 5MB or smaller")

    if db.check_duplicate(email):
        return {
            "status": "duplicate",
            "message": "An application with this email already exists",
        }

    job = db.get_job_apply_context(spec_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    storage_dir = Path(CV_STORAGE_PATH)
    storage_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    stored_name = f"website_{timestamp}_{_safe_filename(cv_file.filename or 'cv' + suffix)}"
    file_path = storage_dir / stored_name
    file_path.write_bytes(content)

    try:
        cv_text = ai_engine.extract_cv_text(str(file_path))
    except Exception as exc:
        log.exception("CV extraction failed")
        raise HTTPException(status_code=400, detail=f"Could not read CV file: {exc}") from exc

    if not cv_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from CV")

    job_spec_text = (job.get("raw_text") or "").strip() or job.get("title", "")
    min_requirements = job.get("min_requirements") or ""

    try:
        gate1 = ai_engine.check_gate1(cv_text, min_requirements)
    except Exception:
        log.exception("Gate 1 check failed")
        gate1 = {"gate1_passed": True, "reason": "Automatic pass after screening error"}

    if not gate1.get("gate1_passed"):
        return {
            "status": "below_requirements",
            "gate1_passed": False,
            "message": (
                "Thank you for your interest. Unfortunately your profile "
                "does not meet the minimum requirements for this role at this time."
            ),
        }

    try:
        scoring = ai_engine.score_cv(cv_text, job_spec_text)
    except Exception as exc:
        log.exception("CV scoring failed")
        raise HTTPException(status_code=500, detail=f"CV scoring failed: {exc}") from exc

    score = int(round(float(scoring.get("score", 0))))
    recommendation = str(scoring.get("recommendation") or "")
    analysis = str(scoring.get("analysis") or "")
    matched = scoring.get("matched") or []
    gaps = scoring.get("gaps") or []

    questions: list[str] = []
    if score >= 60:
        try:
            questions = ai_engine.generate_questions(cv_text, job_spec_text, score)
        except Exception:
            log.exception("Question generation failed")
            questions = []

    analysis_payload = {
        "score": score,
        "analysis": analysis,
        "matched": matched,
        "gaps": gaps,
        "recommendation": recommendation,
        "gate1_reason": gate1.get("reason", ""),
    }

    candidate_id = db.save_candidate(
        full_name=full_name.strip(),
        email=email.strip(),
        phone=phone.strip(),
        cv_file_path=str(file_path),
        raw_cv_text=cv_text,
    )
    submission_id = db.save_submission(
        candidate_id=candidate_id,
        spec_id=spec_id,
        stage1_score=float(score),
        stage1_analysis=json.dumps(analysis_payload),
        stage1_questions=json.dumps(questions) if questions else None,
        gate1_passed=True,
    )

    role_title = job.get("title") or "Role"
    try:
        await notifications.notify_new_application(
            full_name.strip(), role_title, score, submission_id,
        )
    except Exception:
        log.exception("Telegram notification failed")

    return {
        "status": "success",
        "gate1_passed": True,
        "submission_id": submission_id,
        "candidate_name": full_name.strip(),
        "score": score,
        "recommendation": recommendation,
        "analysis": analysis,
        "matched": matched,
        "gaps": gaps,
        "questions": questions,
        "role_title": role_title,
        "job_spec_text": job_spec_text,
        "cv_text": cv_text,
    }


@app.post("/api/submit-answers")
async def submit_answers(body: SubmitAnswersRequest):
    answers = [item.model_dump() for item in body.answers]

    try:
        db.save_interview_answers(body.submission_id, answers)
        scoring = ai_engine.score_answers(
            body.cv_text,
            body.job_spec_text,
            answers,
        )
        stage2_score = float(scoring.get("stage2_score", 0))
        combined_score = float(scoring.get("combined_score", 0))
        summary = str(scoring.get("summary") or "")
        db.update_stage2_score(
            body.submission_id,
            stage2_score,
            combined_score,
            summary,
        )
        try:
            await notifications.notify_answers_submitted(
                body.candidate_name,
                body.role_title,
                stage2_score,
                combined_score,
                body.submission_id,
            )
        except Exception:
            log.exception("Telegram notification failed")
    except Exception as exc:
        log.exception("Submit answers failed")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "status": "complete",
        "message": "Application received. We will be in touch within 3 business days.",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=WEBSITE_PORT, reload=False)
