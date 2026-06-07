"""Anthropic AI helpers for CV processing and scoring."""

import json
import re

import anthropic
import certifi
import httpx
from docx import Document
from pypdf import PdfReader

from config import ANTHROPIC_API_KEY, ANTHROPIC_SSL_VERIFY, MODEL_HAIKU, MODEL_SONNET


def _build_client() -> anthropic.Anthropic:
    verify = certifi.where() if ANTHROPIC_SSL_VERIFY else False
    http_client = httpx.Client(verify=verify, timeout=120.0)
    return anthropic.Anthropic(api_key=ANTHROPIC_API_KEY, http_client=http_client)


_client = _build_client()


def _parse_json_response(text: str) -> dict:
    text = (text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


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
    system = "You are a recruitment screening assistant. Return JSON only."
    user = (
        "Check if this candidate meets the MINIMUM requirements for the role.\n"
        f"Minimum requirements: {min_requirements or 'None specified'}\n"
        f"CV text:\n{cv_text[:12000]}\n\n"
        'Return JSON only: {"gate1_passed": true/false, "reason": "brief explanation"}'
    )
    raw = _call_model(MODEL_HAIKU, system, user, max_tokens=400)
    return _parse_json_response(raw)


def score_cv(cv_text: str, job_spec_text: str) -> dict:
    system = "You are an expert recruitment consultant. Return JSON only."
    user = (
        "Score this CV against the job specification on a scale of 0-100.\n"
        f"Job Spec:\n{job_spec_text[:12000]}\n\n"
        f"CV:\n{cv_text[:12000]}\n\n"
        "Return JSON only:\n"
        '{"score": number, "analysis": string, "matched": [list], "gaps": [list], '
        '"recommendation": "Strong Match/Good Match/Possible Match"}'
    )
    raw = _call_model(MODEL_SONNET, system, user, max_tokens=1200)
    return _parse_json_response(raw)


def generate_questions(cv_text: str, job_spec_text: str, score: int) -> list:
    system = "You are an expert recruitment consultant. Return JSON only."
    user = (
        "Generate 5 interview questions for this candidate based on their CV "
        "and the job requirements. Focus on their gaps and key competencies.\n"
        f"Job spec:\n{job_spec_text[:8000]}\n\n"
        f"CV:\n{cv_text[:8000]}\n\n"
        f"Score: {score}%\n\n"
        'Return JSON only: {"questions": ["question 1", "..."]}'
    )
    raw = _call_model(MODEL_SONNET, system, user, max_tokens=1200)
    data = _parse_json_response(raw)
    questions = data.get("questions") or []
    return [str(q).strip() for q in questions if str(q).strip()]


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
