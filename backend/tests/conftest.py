"""Shared fixtures for CHR website API end-to-end tests."""

import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

_BACKEND = Path(__file__).resolve().parent.parent
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from main import app  # noqa: E402

SAMPLE_CV_TEXT = (
    "Jane TestCandidate — HR Manager with 8 years experience in payroll, "
    "compliance, and human capital business partnering across South Africa."
)

MOCK_SCORE_RESULT = {
    "score": 78,
    "analysis": "Strong HR background with relevant payroll and compliance experience.",
    "matched": ["HR management", "Payroll systems", "Compliance"],
    "gaps": ["Limited executive exposure"],
    "recommendation": "Good Match",
}

MOCK_QUESTIONS = [
    "Describe your experience managing payroll for 500+ employees.",
    "How have you handled compliance audits in your previous role?",
    "Tell us about a difficult stakeholder situation you resolved.",
    "What HRIS platforms have you implemented?",
    "Why are you interested in this specific role?",
]

MOCK_STAGE2_RESULT = {
    "stage2_score": 82.0,
    "combined_score": 80.0,
    "summary": "Candidate provided detailed, relevant answers demonstrating strong fit.",
}


@pytest.fixture(scope="session", autouse=True)
def ensure_database():
    import os

    if not os.getenv("DATABASE_URL"):
        pytest.skip("DATABASE_URL not set — skipping Postgres-backed API tests")

    from db import init_db

    init_db()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def open_spec_id(client):
    response = client.get("/api/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert jobs, "No open jobs in database — cannot run apply flow tests"
    return jobs[0]["id"]


@pytest.fixture
def apply_form(open_spec_id):
    return {
        "full_name": "E2E Test Candidate",
        "email": "e2e-test-candidate@chr-test.local",
        "phone": "+27 82 000 0000",
        "spec_id": str(open_spec_id),
    }


@pytest.fixture
def cv_upload():
    return {
        "cv_file": (
            "e2e_test_cv.docx",
            b"PK e2e test cv placeholder content",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    }


@pytest.fixture
def ai_mocks():
    """Patch AI engine so tests do not call Anthropic."""
    with (
        patch("main.ai_engine.extract_cv_text", return_value=SAMPLE_CV_TEXT) as extract,
        patch(
            "main.ai_engine.check_gate1",
            return_value={"gate1_passed": True, "reason": "Meets minimum requirements"},
        ) as gate1,
        patch("main.ai_engine.score_cv", return_value=MOCK_SCORE_RESULT) as score,
        patch("main.ai_engine.generate_questions", return_value=MOCK_QUESTIONS) as questions,
        patch("main.ai_engine.score_answers", return_value=MOCK_STAGE2_RESULT) as score_answers,
    ):
        yield {
            "extract": extract,
            "gate1": gate1,
            "score": score,
            "questions": questions,
            "score_answers": score_answers,
        }


@pytest.fixture
def telegram_mocks():
    """Capture Telegram notification calls without hitting the Bot API."""
    with (
        patch(
            "main.notifications.notify_new_application",
            new_callable=AsyncMock,
        ) as notify_apply,
        patch(
            "main.notifications.notify_answers_submitted",
            new_callable=AsyncMock,
        ) as notify_answers,
        patch(
            "notifications._send_telegram",
            new_callable=AsyncMock,
        ) as send_telegram,
    ):
        yield {
            "notify_apply": notify_apply,
            "notify_answers": notify_answers,
            "send_telegram": send_telegram,
        }
