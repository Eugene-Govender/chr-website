"""End-to-end tests for the CHR Consulting website API."""

from unittest.mock import AsyncMock, patch

import pytest

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


class TestPublicEndpoints:
    def test_list_jobs_returns_open_positions(self, client):
        response = client.get("/api/jobs")
        assert response.status_code == 200
        jobs = response.json()
        assert isinstance(jobs, list)
        assert len(jobs) > 0
        job = jobs[0]
        assert "id" in job
        assert "title" in job
        assert isinstance(job.get("urgent"), bool)

    def test_get_job_by_id(self, client, open_spec_id):
        response = client.get(f"/api/jobs/{open_spec_id}")
        assert response.status_code == 200
        job = response.json()
        assert job["id"] == open_spec_id
        assert job["title"]
        assert "min_requirements" in job
        assert "raw_text" in job

    def test_get_job_not_found(self, client):
        response = client.get("/api/jobs/999999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Job not found"

    def test_stats_returns_expected_fields(self, client):
        response = client.get("/api/stats")
        assert response.status_code == 200
        stats = response.json()
        assert set(stats.keys()) == {
            "candidates_in_network",
            "client_retention",
            "industries_served",
            "years_experience",
        }
        assert stats["client_retention"] == "92%"
        assert stats["industries_served"] == "6"
        assert stats["years_experience"] == "15+"
        assert stats["candidates_in_network"].endswith("+")

    def test_yazoo_jobs_hide_salary(self, client):
        response = client.get("/api/jobs")
        assert response.status_code == 200
        jobs_by_id = {job["id"]: job for job in response.json()}
        for spec_id in (3, 4, 5):
            if spec_id in jobs_by_id:
                assert jobs_by_id[spec_id]["salary_range"] is None


class TestDuplicateEmailDetection:
    def test_duplicate_email_returns_duplicate_status(
        self, client, apply_form, cv_upload, ai_mocks,
    ):
        with patch("main.db.check_duplicate", return_value=True):
            response = client.post("/api/apply", data=apply_form, files=cv_upload)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "duplicate"
        assert "email already exists" in body["message"].lower()
        ai_mocks["extract"].assert_not_called()


class TestGate1Rejection:
    def test_gate1_failure_returns_below_requirements(
        self, client, apply_form, cv_upload, ai_mocks,
    ):
        ai_mocks["gate1"].return_value = {
            "gate1_passed": False,
            "reason": "Missing required professional qualification",
        }

        with patch("main.db.check_duplicate", return_value=False):
            response = client.post("/api/apply", data=apply_form, files=cv_upload)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "below_requirements"
        assert body["gate1_passed"] is False
        assert "minimum requirements" in body["message"].lower()
        ai_mocks["score"].assert_not_called()


class TestFullApplyFlow:
    def test_apply_and_submit_answers_completes(
        self, client, apply_form, cv_upload, ai_mocks, telegram_mocks,
    ):
        import uuid

        apply_form = {**apply_form, "email": f"e2e-flow-{uuid.uuid4().hex[:8]}@chr-test.local"}

        with patch("main.db.check_duplicate", return_value=False):
            apply_response = client.post("/api/apply", data=apply_form, files=cv_upload)

        assert apply_response.status_code == 200
        apply_body = apply_response.json()
        assert apply_body["status"] == "success"
        assert apply_body["gate1_passed"] is True
        assert apply_body["submission_id"]
        assert apply_body["score"] == MOCK_SCORE_RESULT["score"]
        assert apply_body["questions"] == MOCK_QUESTIONS
        assert apply_body["requires_questions"] is True
        assert apply_body["candidate_name"] == apply_form["full_name"]
        assert apply_body["cv_text"] == SAMPLE_CV_TEXT

        ai_mocks["extract"].assert_called_once()
        ai_mocks["gate1"].assert_called_once()
        ai_mocks["score"].assert_called_once()
        ai_mocks["questions"].assert_called_once()

        telegram_mocks["notify_apply"].assert_not_awaited()

        answers_payload = {
            "submission_id": apply_body["submission_id"],
            "candidate_name": apply_body["candidate_name"],
            "role_title": apply_body["role_title"],
            "cv_text": apply_body["cv_text"],
            "job_spec_text": apply_body["job_spec_text"],
            "answers": [
                {"question": q, "answer": "Detailed answer with more than twenty characters here."}
                for q in MOCK_QUESTIONS
            ],
        }
        submit_response = client.post("/api/submit-answers", json=answers_payload)

        assert submit_response.status_code == 200
        submit_body = submit_response.json()
        assert submit_body["status"] == "complete"
        assert "Application received" in submit_body["message"]

        ai_mocks["score_answers"].assert_called_once()
        telegram_mocks["notify_answers"].assert_awaited_once()
        answers_args = telegram_mocks["notify_answers"].await_args.args
        assert answers_args[0] == apply_body["candidate_name"]
        assert answers_args[2] == MOCK_STAGE2_RESULT["stage2_score"]
        assert answers_args[3] == MOCK_STAGE2_RESULT["combined_score"]
        assert answers_args[4] == apply_body["submission_id"]


class TestTelegramNotifications:
    @pytest.mark.asyncio
    async def test_notify_new_application_sends_to_admin_and_owner(self):
        import notifications as notify_mod

        with (
            patch.object(notify_mod, "ADMIN_TELEGRAM_ID", "111"),
            patch.object(notify_mod, "IT_OWNER_ID", "222"),
            patch.object(notify_mod, "TELEGRAM_BOT_TOKEN", "test-token"),
            patch.object(notify_mod, "_send_telegram", new_callable=AsyncMock) as send,
        ):
            await notify_mod.notify_new_application("Alice Test", "HR Manager", 85, 42)

        assert send.await_count == 2
        chat_ids = {call.args[0] for call in send.await_args_list}
        assert chat_ids == {"111", "222"}

        first_payload = send.await_args_list[0]
        assert "Alice Test" in first_payload.args[1]
        assert "HR Manager" in first_payload.args[1]
        assert "85" in first_payload.args[1]
        keyboard = first_payload.kwargs.get("reply_markup") or first_payload.args[2]
        assert keyboard["inline_keyboard"][0][0]["callback_data"] == "view_candidate_42"

    @pytest.mark.asyncio
    async def test_notify_answers_submitted_includes_stage2_keyboard(self):
        import notifications as notify_mod

        with (
            patch.object(notify_mod, "ADMIN_TELEGRAM_ID", "111"),
            patch.object(notify_mod, "TELEGRAM_BOT_TOKEN", "test-token"),
            patch.object(notify_mod, "_send_telegram", new_callable=AsyncMock) as send,
        ):
            await notify_mod.notify_answers_submitted("Bob Test", "Payroll Lead", 80, 75, 99)

        send.assert_awaited_once()
        text = send.await_args.args[1]
        keyboard = send.await_args.kwargs.get("reply_markup") or send.await_args.args[2]
        assert "Bob Test" in text
        assert "80" in text
        assert "75" in text
        callback_data = [btn["callback_data"] for row in keyboard["inline_keyboard"] for btn in row]
        assert "view_stage2_99" in callback_data
        assert "view_candidate_99" in callback_data

    @pytest.mark.asyncio
    async def test_send_telegram_skips_when_token_missing(self):
        import notifications as notify_mod

        with patch.object(notify_mod, "TELEGRAM_BOT_TOKEN", ""):
            with patch("notifications.httpx.AsyncClient") as mock_client:
                await notify_mod._send_telegram("123", "hello")
                mock_client.assert_not_called()
