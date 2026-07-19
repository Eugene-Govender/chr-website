"""Anthropic AI helpers for CV processing and scoring.

Stage 1 scoring matches the Recruitment Bot (same prompt, truncation,
today-date context, and interview-question generation) so website and
Telegram uploads produce consistent scores for the same CV + role.
"""

import json
import logging
import re
from datetime import datetime
from zoneinfo import ZoneInfo

import anthropic
import certifi
import httpx
from docx import Document
from pypdf import PdfReader

from config import ANTHROPIC_API_KEY, ANTHROPIC_SSL_VERIFY, MODEL_HAIKU, MODEL_SONNET

log = logging.getLogger(__name__)

# Hybrid Stage 1: same windows as Recruitment Bot (bot prompt + long context)
STAGE1_SPEC_CHARS = 12_000
STAGE1_CV_CHARS = 12_000
GATE1_REQ_CHARS = 6_000
GATE1_CV_CHARS = 12_000


def _build_client() -> anthropic.Anthropic:
    verify = certifi.where() if ANTHROPIC_SSL_VERIFY else False
    http_client = httpx.Client(verify=verify, timeout=120.0)
    return anthropic.Anthropic(api_key=ANTHROPIC_API_KEY, http_client=http_client)


_client = _build_client()


def _now_sast() -> datetime:
    return datetime.now(ZoneInfo("Africa/Johannesburg"))


def today_context() -> str:
    """Current date for the AI — same wording as the Recruitment Bot."""
    now = _now_sast()
    return (
        f"Today's date is {now.strftime('%d %B %Y (%A)')}, South Africa time. "
        f"The current calendar year is {now.year}. "
        f"Any month in {now.year} that is before {now.strftime('%B %Y')} is already in the past."
    )


def today_context_block() -> str:
    now = _now_sast()
    return (
        f"{today_context()} "
        "Compare every employment start/end date on the CV against this date. "
        "Do not describe a date that is before today as being in the future. "
        f"Example: March {now.year} is before {now.strftime('%B %Y')} and is NOT in the future."
    )


def _month_already_passed(month_name: str, year: int, now: datetime) -> bool:
    months = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12,
    }
    month = months.get(month_name.lower())
    if not month:
        return False
    return (year, month) < (now.year, now.month)


def sanitize_interview_questions(questions: list) -> list:
    """Drop questions that wrongly call an already-past month 'in the future'."""
    if not questions:
        return []
    now = _now_sast()
    cleaned = []
    pattern = re.compile(
        r"\b(january|february|march|april|may|june|july|august|september|october|november|december)"
        r"\s+(20\d{2}).{0,80}\bfuture\b",
        re.IGNORECASE | re.DOTALL,
    )
    for q in questions:
        text = str(q or "").strip()
        if not text:
            continue
        drop = False
        for match in pattern.finditer(text):
            month_name, year_s = match.group(1), match.group(2)
            if _month_already_passed(month_name, int(year_s), now):
                log.warning(
                    "Dropped bad date question (past month marked as future): %s",
                    text[:120],
                )
                drop = True
                break
        if not drop:
            cleaned.append(text)
    return cleaned


def _parse_json_response(text: str, fallback: dict | None = None) -> dict:
    text = (text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except Exception:
        if fallback is not None:
            return fallback
        raise


def _call_model(model: str, system: str, user: str, max_tokens: int = 2000) -> str:
    response = _client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return response.content[0].text.strip()


def extract_cv_text(file_path: str) -> str:
    lower = file_path.lower()
    if lower.endswith(".pdf"):
        reader = PdfReader(file_path)
        parts = []
        for page in reader.pages:
            parts.append(page.extract_text() or "")
        return "\n".join(parts).strip()
    if lower.endswith(".docx"):
        doc = Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs if p.text).strip()
    raise ValueError("Unsupported file type")


def check_gate1(cv_text: str, min_requirements: str) -> dict:
    """
    Minimum-requirements gate — same lenient standard as Recruitment Bot.
    Returns website-shaped keys: gate1_passed + reason.
    """
    system = """You review a CV against minimum requirements for a role.

Be fair and lenient: only mark a requirement as failed if the CV clearly does NOT
meet it (missing qualification, clearly insufficient years, etc.).
If the CV is ambiguous, partially meets, or could reasonably qualify, do NOT fail it.

Return ONLY valid JSON with these exact keys:
{
  "passes": true or false,
  "failed_requirements": ["exact requirement text that was not met"],
  "notes": "one sentence summary"
}
Return only the JSON object, no other text."""

    prompt = f"""MINIMUM REQUIREMENTS (all must be met):
{(min_requirements or 'None specified')[:GATE1_REQ_CHARS]}

CANDIDATE CV:
{cv_text[:GATE1_CV_CHARS]}"""

    raw = _call_model(MODEL_HAIKU, system, prompt, max_tokens=800)
    data = _parse_json_response(
        raw,
        {"passes": True, "failed_requirements": [], "notes": ""},
    )
    passed = bool(data.get("passes", True))
    notes = str(data.get("notes") or "")
    failed = data.get("failed_requirements") or []
    if failed and not notes:
        notes = "; ".join(str(x) for x in failed[:3])
    return {"gate1_passed": passed, "reason": notes}


def score_cv(cv_text: str, job_spec_text: str, candidate_name: str = "Candidate") -> dict:
    """
    Hybrid Stage 1 — same as Recruitment Bot `score_cv_against_spec`:
    structured analyst prompt + SAST today-date + 12k CV/spec windows.
    """
    system = f"""You are an expert recruitment analyst. Analyse a CV against a job specification.

IMPORTANT — {today_context_block()}

Return ONLY valid JSON with these exact keys:
{{
  "score": number between 0-100,
  "matched_skills": ["list", "of", "matched", "skills"],
  "gaps": ["list", "of", "gaps", "or", "missing", "requirements"],
  "partial_matches": ["list", "of", "partial", "matches"],
  "summary": "2-3 sentence assessment",
  "recommendation": "strong match | possible match | weak match",
  "interview_questions": [
    "Question 1 addressing a specific gap or area to probe?",
    "Question 2...",
    "...up to 8 targeted questions total"
  ]
}}
Generate 5-8 targeted interview questions in the same response that address gaps and verify claims.
Questions must be specific to this candidate and role, not generic.
Do not ask the candidate to explain employment dates that are already clearly in the past relative to today.
Only question a date if it is actually in the future, or if the timeline is genuinely unclear or inconsistent.
Use the full job specification and CV text provided — weigh both early career and recent roles.
Return only the JSON object."""

    prompt = f"""{today_context()}

Candidate: {candidate_name}

JOB SPECIFICATION:
{job_spec_text[:STAGE1_SPEC_CHARS]}

CANDIDATE CV:
{cv_text[:STAGE1_CV_CHARS]}"""

    raw = _call_model(MODEL_SONNET, system, prompt, max_tokens=3000)
    result = _parse_json_response(
        raw,
        {
            "score": 0,
            "matched_skills": [],
            "gaps": ["Analysis failed — please retry"],
            "partial_matches": [],
            "summary": raw[:300],
            "interview_questions": [],
            "recommendation": "unknown",
        },
    )

    questions = result.get("interview_questions") or []
    if isinstance(questions, list):
        questions = sanitize_interview_questions(questions)
    else:
        questions = []

    matched = result.get("matched_skills") or result.get("matched") or []
    summary = str(result.get("summary") or result.get("analysis") or "")
    gaps = result.get("gaps") or []
    recommendation = str(result.get("recommendation") or "")

    return {
        "score": float(result.get("score") or 0),
        "matched_skills": matched,
        "matched": matched,
        "gaps": gaps,
        "partial_matches": result.get("partial_matches") or [],
        "summary": summary,
        "analysis": summary,
        "recommendation": recommendation,
        "interview_questions": questions,
        "questions": questions,
    }


def generate_questions(cv_text: str, job_spec_text: str, score: int) -> list:
    """
    Fallback question generation. Prefer score_cv() which already returns questions
    from the same call as the Recruitment Bot.
    """
    scoring = score_cv(cv_text, job_spec_text)
    return list(scoring.get("questions") or [])


def score_answers(
    cv_text: str,
    job_spec_text: str,
    questions_and_answers: list,
) -> dict:
    system = "You are an expert recruitment consultant. Return JSON only."
    user = (
        "Score these interview answers. CV counts 40%, answers count 60%.\n"
        f"Job spec:\n{job_spec_text[:6000]}\n\n"
        f"CV summary:\n{cv_text[:500]}\n\n"
        f"Questions and answers:\n{json.dumps(questions_and_answers, indent=2)[:8000]}\n\n"
        "Return JSON only:\n"
        '{"stage2_score": number, "combined_score": number, '
        '"summary": "brief assessment string"}'
    )
    raw = _call_model(MODEL_SONNET, system, user, max_tokens=800)
    return _parse_json_response(raw)
