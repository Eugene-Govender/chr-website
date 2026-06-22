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


def check_duplicate_application(email: str, spec_id: int) -> bool:
    """True if this email already has a website application for this role."""
    if not (email or "").strip() or not spec_id:
        return False
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) AS count
                FROM submissions s
                JOIN candidates c ON c.id = s.candidate_id
                WHERE LOWER(TRIM(c.email)) = LOWER(TRIM(%s))
                  AND s.spec_id = %s
                  AND s.submitted_by = '0'
                """,
                (email.strip(), spec_id),
            )
            row = cur.fetchone()
            return int(row["count"] or 0) > 0


def get_candidate_by_email(email: str) -> dict | None:
    if not (email or "").strip():
        return None
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, full_name, email, phone
                FROM candidates
                WHERE LOWER(TRIM(email)) = LOWER(TRIM(%s))
                ORDER BY id DESC
                LIMIT 1
                """,
                (email.strip(),),
            )
            return _one(cur)


def save_or_update_candidate(
    full_name: str,
    email: str,
    phone: str,
    cv_file_path: str,
    raw_cv_text: str,
) -> int:
    existing = get_candidate_by_email(email)
    if existing:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE candidates
                    SET full_name = %s,
                        phone = %s,
                        cv_file_path = %s,
                        raw_cv_text = %s
                    WHERE id = %s
                    RETURNING id
                    """,
                    (
                        full_name,
                        phone,
                        cv_file_path,
                        raw_cv_text,
                        existing["id"],
                    ),
                )
                row = cur.fetchone()
                return int(row["id"])
    return save_candidate(full_name, email, phone, cv_file_path, raw_cv_text)


def log_audit(action: str, detail: str, telegram_id: str = "0") -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO audit_log (telegram_id, action, detail)
                VALUES (%s, %s, %s)
                """,
                (telegram_id, action, detail),
            )


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


def get_submission_cv_path(submission_id: int) -> dict | None:
    """Return CV path for a website submission (submitted_by=0)."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT c.cv_file_path, c.full_name
                FROM submissions s
                JOIN candidates c ON c.id = s.candidate_id
                WHERE s.id = %s AND s.submitted_by = '0'
                """,
                (submission_id,),
            )
            return _one(cur)


def get_candidate_cv_path(candidate_id: int) -> dict | None:
    """Return CV path for a website candidate."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT c.cv_file_path, c.full_name, s.id AS submission_id
                FROM candidates c
                JOIN submissions s ON s.candidate_id = c.id
                WHERE c.id = %s AND s.submitted_by = '0'
                ORDER BY s.submitted_at DESC
                LIMIT 1
                """,
                (candidate_id,),
            )
            return _one(cur)


def mark_website_application_complete(submission_id: int) -> None:
    """Mark a website submission as fully submitted (CV + questions done)."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT stage1_analysis FROM submissions WHERE id = %s",
                (submission_id,),
            )
            row = cur.fetchone()
            if not row:
                return
            raw = row.get("stage1_analysis") or "{}"
            try:
                payload = json.loads(raw)
                if not isinstance(payload, dict):
                    payload = {"analysis": raw}
            except (TypeError, json.JSONDecodeError):
                payload = {"analysis": raw}
            payload["website_complete"] = True
            cur.execute(
                "UPDATE submissions SET stage1_analysis = %s WHERE id = %s",
                (json.dumps(payload), submission_id),
            )


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
