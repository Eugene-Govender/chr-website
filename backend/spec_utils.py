"""Helpers for job spec display rules (e.g. Yazoo salary privacy)."""

from __future__ import annotations

import re

_SALARY_LINE_PATTERNS = (
    re.compile(r"\bsalary\b", re.IGNORECASE),
    re.compile(r"\bctc\b", re.IGNORECASE),
    re.compile(r"\bremuneration\b", re.IGNORECASE),
    re.compile(r"\bcompensation\b", re.IGNORECASE),
    re.compile(r"\bpackage\s*:", re.IGNORECASE),
    re.compile(r"R\s?\d[\d,.\s]*(?:k|m)?\s*(?:ctc|per annum|p\.?a\.?)", re.IGNORECASE),
)


def is_yazoo_spec(spec: dict | None) -> bool:
    if not spec:
        return False
    for field in ("client_name", "title", "raw_text"):
        value = (spec.get(field) or "").strip()
        if value and "yazoo" in value.lower():
            return True
    return False


def _line_looks_like_salary(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    return any(pattern.search(stripped) for pattern in _SALARY_LINE_PATTERNS)


def strip_salary_from_text(text: str | None) -> str:
    if not text:
        return ""
    lines = text.splitlines()
    filtered = [line for line in lines if not _line_looks_like_salary(line)]
    cleaned = re.sub(r"\n{3,}", "\n\n", "\n".join(filtered)).strip()
    return cleaned
