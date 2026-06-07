"""PostgreSQL read/write access for CHR website (unified recruitment tables)."""

import json
from contextlib import contextmanager
from typing import Any

import psycopg2
import psycopg2.extras

from config import DATABASE_URL


def _fix_postgres_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


@contextmanager
def get_conn():
    conn = psycopg2.connect(
        _fix_postgres_url(DATABASE_URL),
        cursor_factory=psycopg2.extras.RealDictCursor,
    )
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def check_connection() -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")


def _rows(cur) -> list[dict]:
    return [dict(row) for row in cur.fetchall()]


def _one(cur) -> dict | None:
    row = cur.fetchone()
    return dict(row) if row else None


def get_open_jobs() -> list[dict]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT js.id, js.title, js.salary_range, js.closing_date, js.urgent,
                       COALESCE(cl.name, 'No client') AS client_name
                FROM job_specs js
                LEFT JOIN clients cl ON js.client_id = cl.id
                WHERE js.status = 'open'
                ORDER BY js.urgent DESC, js.id DESC
                """
            )
            jobs = _rows(cur)
    for job in jobs:
        job["urgent"] = bool(job.get("urgent"))
    return jobs


def get_job_by_id(spec_id: int) -> dict | None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT js.id, js.title, js.salary_range, js.closing_date,
                       js.min_requirements, js.raw_text,
                       COALESCE(cl.name, 'No client') AS client_name
                FROM job_specs js
                LEFT JOIN clients cl ON js.client_id = cl.id
                WHERE js.id = %s
                """,
                (spec_id,),
            )
            return _one(cur)


def get_job_apply_context(spec_id: int) -> dict | None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT js.id, js.title, js.salary_range, js.closing_date,
                       js.min_requirements, js.raw_text,
                       COALESCE(cl.name, 'No client') AS client_name
                FROM job_specs js
                LEFT JOIN clients cl ON js.client_id = cl.id
                WHERE js.id = %s AND js.status = 'open'
                """,
                (spec_id,),
            )
            return _one(cur)


def check_duplicate(email: str) -> bool:
    if not (email or "").strip():
        return False
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) AS count
                FROM candidates
                WHERE LOWER(TRIM(email)) = LOWER(TRIM(%s))
                """,
                (email.strip(),),
            )
            row = cur.fetchone()
            return int(row["count"] or 0) > 0


def save_candidate(
    full_name: str,
    email: str,
    phone: str,
    cv_file_path: str,
    raw_cv_text: str,
) -> int:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO candidates
                    (full_name, email, phone, cv_file_path, raw_cv_text,
                     added_by, status)
                VALUES (%s, %s, %s, %s, %s, '0', 'web_submission')
                RETURNING id
                """,
                (full_name, email, phone, cv_file_path, raw_cv_text),
            )
            row = cur.fetchone()
            return int(row["id"])


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

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO submissions
                    (candidate_id, spec_id, submitted_by, stage1_score,
                     stage1_analysis, stage1_questions)
                VALUES (%s, %s, '0', %s, %s, %s)
                RETURNING id
                """,
                (
                    candidate_id,
                    spec_id,
                    float(stage1_score),
                    stored_analysis,
                    stage1_questions,
                ),
            )
            row = cur.fetchone()
            return int(row["id"])


def save_interview_answers(submission_id: int, answers_json: list | dict) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO interview_answers (submission_id, raw_answer_text, logged_by)
                VALUES (%s, %s, '0')
                """,
                (submission_id, json.dumps(answers_json)),
            )


def get_stats_counts() -> dict[str, int]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS count FROM candidates")
            row = cur.fetchone()
            return {"candidates": int(row["count"] or 0)}


def update_stage2_score(
    submission_id: int,
    stage2_score: float,
    combined_score: float,
    stage2_analysis: str = "",
) -> None:
    del stage2_analysis
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE submissions
                SET stage2_score = %s,
                    combined_score = %s,
                    stage2_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (
                    float(stage2_score),
                    float(combined_score),
                    submission_id,
                ),
            )
