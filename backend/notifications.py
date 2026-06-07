"""Telegram notifications via Bot API."""

import httpx

from config import ADMIN_TELEGRAM_ID, ANTHROPIC_SSL_VERIFY, IT_OWNER_ID, TELEGRAM_BOT_TOKEN

_API_BASE = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"


def _review_keyboard(submission_id: int, include_stage2: bool = False) -> dict:
    rows = [
        [
            {"text": "👀 Profile", "callback_data": f"view_candidate_{submission_id}"},
            {"text": "📊 CV Summary", "callback_data": f"view_sub_{submission_id}"},
        ],
    ]
    if include_stage2:
        rows.append([
            {"text": "📋 Interview Summary", "callback_data": f"view_stage2_{submission_id}"},
        ])
    return {"inline_keyboard": rows}


async def _send_telegram(chat_id: str, text: str, reply_markup: dict | None = None) -> None:
    if not TELEGRAM_BOT_TOKEN or not chat_id:
        return
    verify = False if not ANTHROPIC_SSL_VERIFY else True
    payload = {"chat_id": chat_id, "text": text}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    async with httpx.AsyncClient(timeout=15.0, verify=verify) as client:
        await client.post(
            f"{_API_BASE}/sendMessage",
            json=payload,
        )


async def notify_new_application(
    candidate_name: str,
    role_title: str,
    score: float,
    submission_id: int,
) -> None:
    text = (
        "🌐 New Website Application\n"
        f"👤 {candidate_name}\n"
        f"🎯 Role: {role_title}\n"
        f"⭐ Match Score: {score}%\n"
        f"📋 Submission ID: {submission_id}"
    )
    keyboard = _review_keyboard(submission_id)
    for chat_id in {ADMIN_TELEGRAM_ID, IT_OWNER_ID}:
        if chat_id:
            await _send_telegram(str(chat_id), text, keyboard)


async def notify_answers_submitted(
    candidate_name: str,
    role_title: str,
    stage2_score: float,
    combined_score: float,
    submission_id: int,
) -> None:
    text = (
        "✅ Interview Answers Received\n"
        f"👤 {candidate_name}\n"
        f"🎯 Role: {role_title}\n"
        f"📊 Stage 2 Score: {stage2_score}%\n"
        f"🏆 Combined Score: {combined_score}%\n"
        f"📋 Submission ID: {submission_id}"
    )
    keyboard = _review_keyboard(submission_id, include_stage2=True)
    if ADMIN_TELEGRAM_ID:
        await _send_telegram(str(ADMIN_TELEGRAM_ID), text, keyboard)
