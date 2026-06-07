"""PostgreSQL read/write access for CHR website tables."""

import json
from typing import Any

from sqlalchemy import text

from db import engine


def _row_to_dict(row) -> dict | None:
    if row is None:
        return None
    return dict(row._mapping)


def get_open_jobs() -> list[dict]:
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT id, title, salary_range, closing_date, urgent
                FROM web_jobs
                WHERE status = 'open'
                ORDER BY urgent DESC, id DESC
            """)
        ).fetchall()
        jobs = []
        for row in rows:
            item = dict(row._mapping)
            item["urgent"] = bool(item.get("urgent"))
            jobs.append(item)
        return jobs


def get_job_by_id(spec_id: int) -> dict | None:
    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT id, title, salary_range, closing_date,
                       min_requirements, raw_text
                FROM web_jobs
                WHERE id = :spec_id
            """),
            {"spec_id": spec_id},
        ).fetchone()
        return _row_to_dict(row)


def get_job_apply_context(spec_id: int) -> dict | None:
    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT id, title, salary_range, closing_date,
                       min_requirements, raw_text
                FROM web_jobs
                WHERE id = :spec_id AND status = 'open'
            """),
            {"spec_id": spec_id},
        ).fetchone()
        return _row_to_dict(row)


def check_duplicate(email: str) -> bool:
    if not (email or "").strip():
        return False
    with engine.connect() as conn:
        count = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM web_candidates
                WHERE LOWER(TRIM(email)) = LOWER(TRIM(:email))
            """),
            {"email": email.strip()},
        ).scalar()
        return int(count or 0) > 0


def save_candidate(
    full_name: str,
    email: str,
    phone: str,
    cv_file_path: str,
    raw_cv_text: str,
) -> int:
    with engine.begin() as conn:
        row = conn.execute(
            text("""
                INSERT INTO web_candidates
                    (full_name, email, phone, cv_file_path, raw_cv_text)
                VALUES
                    (:full_name, :email, :phone, :cv_file_path, :raw_cv_text)
                RETURNING id
            """),
            {
                "full_name": full_name,
                "email": email,
                "phone": phone,
                "cv_file_path": cv_file_path,
                "raw_cv_text": raw_cv_text,
            },
        ).fetchone()
        return int(row[0])


def save_submission(
    candidate_id: int,
    spec_id: int,
    stage1_score: float,
    stage1_analysis: str,
    stage1_questions: str | None,
    gate1_passed: bool,
) -> int:
    analysis_payload: Any
    try:
        analysis_payload = json.loads(stage1_analysis)
        if not isinstance(analysis_payload, dict):
            analysis_payload = {"analysis": stage1_analysis}
    except (TypeError, json.JSONDecodeError):
        analysis_payload = {"analysis": stage1_analysis}

    analysis_payload["gate1_passed"] = gate1_passed
    analysis_payload["source"] = "website"
    stored_analysis = json.dumps(analysis_payload)

    with engine.begin() as conn:
        row = conn.execute(
            text("""
                INSERT INTO web_submissions
                    (candidate_id, job_id, stage1_score, stage1_analysis,
                     stage1_questions, gate1_passed)
                VALUES
                    (:candidate_id, :job_id, :stage1_score, :stage1_analysis,
                     :stage1_questions, :gate1_passed)
                RETURNING id
            """),
            {
                "candidate_id": candidate_id,
                "job_id": spec_id,
                "stage1_score": int(round(float(stage1_score))),
                "stage1_analysis": stored_analysis,
                "stage1_questions": stage1_questions,
                "gate1_passed": gate1_passed,
            },
        ).fetchone()
        return int(row[0])


def save_interview_answers(submission_id: int, answers_json: list | dict) -> None:
    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO web_interview_answers (submission_id, answers_json)
                VALUES (:submission_id, :answers_json)
            """),
            {
                "submission_id": submission_id,
                "answers_json": json.dumps(answers_json),
            },
        )


def get_stats_counts() -> dict[str, int]:
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM web_candidates")).scalar()
        return {"candidates": int(count or 0)}


def update_stage2_score(
    submission_id: int,
    stage2_score: float,
    combined_score: float,
    stage2_analysis: str = "",
) -> None:
    del stage2_analysis
    with engine.begin() as conn:
        conn.execute(
            text("""
                UPDATE web_submissions
                SET stage2_score = :stage2_score,
                    combined_score = :combined_score,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :submission_id
            """),
            {
                "stage2_score": int(round(float(stage2_score))),
                "combined_score": int(round(float(combined_score))),
                "submission_id": submission_id,
            },
        )


def upsert_web_jobs(jobs: list[dict]) -> int:
    synced = 0
    with engine.begin() as conn:
        for job in jobs:
            conn.execute(
                text("""
                    INSERT INTO web_jobs (
                        id, title, salary_range, closing_date, urgent,
                        min_requirements, raw_text, status, synced_at
                    )
                    VALUES (
                        :id, :title, :salary_range, :closing_date, :urgent,
                        :min_requirements, :raw_text, :status, CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        salary_range = EXCLUDED.salary_range,
                        closing_date = EXCLUDED.closing_date,
                        urgent = EXCLUDED.urgent,
                        min_requirements = EXCLUDED.min_requirements,
                        raw_text = EXCLUDED.raw_text,
                        status = EXCLUDED.status,
                        synced_at = CURRENT_TIMESTAMP
                """),
                {
                    "id": job["id"],
                    "title": job["title"],
                    "salary_range": job.get("salary_range"),
                    "closing_date": job.get("closing_date"),
                    "urgent": bool(job.get("urgent")),
                    "min_requirements": job.get("min_requirements"),
                    "raw_text": job.get("raw_text"),
                    "status": job.get("status", "open"),
                },
            )
            synced += 1
    return synced
