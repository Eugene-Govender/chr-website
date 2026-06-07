"""SQLite read/write access to the shared recruitment database."""

import json
import sqlite3
from typing import Any

from config import DATABASE_PATH


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def _row_to_dict(row: sqlite3.Row | None) -> dict | None:
    return dict(row) if row else None


def _rows_to_dicts(rows: list[sqlite3.Row]) -> list[dict]:
    return [dict(r) for r in rows]


def get_open_jobs() -> list[dict]:
    conn = get_conn()
    try:
        rows = conn.execute(
            """
            SELECT js.id, js.title, js.salary_range, js.closing_date, js.urgent,
                   c.name AS client_name
            FROM job_specs js
            LEFT JOIN clients c ON js.client_id = c.id
            WHERE js.status = 'open'
            ORDER BY js.urgent DESC, js.title
            """
        ).fetchall()
        jobs = []
        for row in rows:
            item = dict(row)
            item["urgent"] = bool(item.get("urgent"))
            jobs.append(item)
        return jobs
    finally:
        conn.close()


def get_job_by_id(spec_id: int) -> dict | None:
    conn = get_conn()
    try:
        row = conn.execute(
            """
            SELECT js.id, js.title, js.salary_range, js.closing_date,
                   js.min_requirements, js.raw_text, c.name AS client_name
            FROM job_specs js
            LEFT JOIN clients c ON js.client_id = c.id
            WHERE js.id = ? AND js.status = 'open'
            """,
            (spec_id,),
        ).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()


def get_job_apply_context(spec_id: int) -> dict | None:
    """Internal: job fields needed for website apply scoring."""
    conn = get_conn()
    try:
        row = conn.execute(
            """
            SELECT js.id, js.title, js.salary_range, js.closing_date,
                   js.min_requirements, js.raw_text, c.name AS client_name
            FROM job_specs js
            LEFT JOIN clients c ON js.client_id = c.id
            WHERE js.id = ? AND js.status = 'open'
            """,
            (spec_id,),
        ).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()


def check_duplicate(email: str) -> bool:
    if not (email or "").strip():
        return False
    conn = get_conn()
    try:
        row = conn.execute(
            """
            SELECT 1 FROM candidates
            WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))
            LIMIT 1
            """,
            (email.strip(),),
        ).fetchone()
        return row is not None
    finally:
        conn.close()


def save_candidate(
    full_name: str,
    email: str,
    phone: str,
    cv_file_path: str,
    raw_cv_text: str,
) -> int:
    conn = get_conn()
    try:
        cur = conn.execute(
            """
            INSERT INTO candidates
                (full_name, email, phone, skills, experience,
                 raw_cv_text, cv_file_path, added_by, status)
            VALUES (?, ?, ?, '', '', ?, ?, '0', 'web_submission')
            """,
            (full_name, email, phone, raw_cv_text, cv_file_path),
        )
        conn.commit()
        return int(cur.lastrowid)
    finally:
        conn.close()


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

    conn = get_conn()
    try:
        cur = conn.execute(
            """
            INSERT INTO submissions
                (candidate_id, spec_id, submitted_by, stage1_score,
                 stage1_analysis, stage1_questions, stage1_draft_email, is_pool)
            VALUES (?, ?, '0', ?, ?, ?, NULL, 0)
            """,
            (
                candidate_id,
                spec_id,
                stage1_score,
                stored_analysis,
                stage1_questions,
            ),
        )
        conn.commit()
        return int(cur.lastrowid)
    finally:
        conn.close()


def save_interview_answers(submission_id: int, answers_json: list | dict) -> None:
    conn = get_conn()
    try:
        conn.execute(
            """
            INSERT INTO interview_answers (submission_id, raw_answer_text, logged_by)
            VALUES (?, ?, 'website')
            """,
            (submission_id, json.dumps(answers_json)),
        )
        conn.commit()
    finally:
        conn.close()


def get_stats_counts() -> dict[str, int]:
    conn = get_conn()
    try:
        candidates = conn.execute("SELECT COUNT(*) FROM candidates").fetchone()[0]
        return {"candidates": int(candidates)}
    finally:
        conn.close()


def update_stage2_score(
    submission_id: int,
    stage2_score: float,
    combined_score: float,
    stage2_analysis: str = "",
) -> None:
    conn = get_conn()
    try:
        conn.execute(
            """
            UPDATE submissions
            SET stage2_score = ?,
                combined_score = ?,
                stage2_analysis = ?,
                stage2_at = datetime('now'),
                status = 'stage2_complete'
            WHERE id = ?
            """,
            (stage2_score, combined_score, stage2_analysis, submission_id),
        )
        conn.commit()
    finally:
        conn.close()
