"""Load shared CHR Platform environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

_PLATFORM_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(_PLATFORM_ROOT / ".env")

DATABASE_PATH = os.getenv("DATABASE_PATH", "")
CV_STORAGE_PATH = os.getenv(
    "CV_STORAGE_PATH",
    str(_PLATFORM_ROOT / "chr_website" / "uploads"),
)
WEBSITE_PORT = int(os.getenv("WEBSITE_PORT", "8000"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_SSL_VERIFY = os.getenv("ANTHROPIC_SSL_VERIFY", "true").lower() not in (
    "0",
    "false",
    "no",
)
TELEGRAM_BOT_TOKEN = os.getenv("BOT1_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN", "")
ADMIN_TELEGRAM_ID = os.getenv("ADMIN_TELEGRAM_ID", "")
IT_OWNER_ID = os.getenv("IT_OWNER_ID", "")

COMPANY_NAME = os.getenv("COMPANY_NAME", "CHR Consulting")
COMPANY_PHONE = os.getenv("COMPANY_PHONE", "")
COMPANY_WEBSITE = os.getenv("COMPANY_WEBSITE", "")
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "")

MODEL_HAIKU = "claude-haiku-4-5"
MODEL_SONNET = "claude-sonnet-4-5"
