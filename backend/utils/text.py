from __future__ import annotations

import re
from typing import List


def clean_text(text: str) -> str:
    text = (text or "").replace("\x00", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def split_lines(text: str) -> List[str]:
    return [line.strip() for line in (text or "").splitlines() if line.strip()]


def extract_first(pattern: str, text: str, flags: int = 0) -> str | None:
    match = re.search(pattern, text or "", flags)
    return match.group(1).strip() if match else None


def unique_preserve(items: List[str]) -> List[str]:
    seen = set()
    output: List[str] = []
    for item in items:
        key = item.lower().strip()
        if not key or key in seen:
            continue
        seen.add(key)
        output.append(item.strip())
    return output
