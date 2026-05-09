from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from backend.models.schemas import OverrideLog, OverridePayload


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
OVERRIDE_FILE = DATA_DIR / "override_logs.json"


def read_override_logs() -> List[OverrideLog]:
    if not OVERRIDE_FILE.exists():
        return []
    raw = json.loads(OVERRIDE_FILE.read_text(encoding="utf-8"))
    return [OverrideLog(**row) for row in raw]


def append_override(payload: OverridePayload) -> OverrideLog:
    DATA_DIR.mkdir(exist_ok=True, parents=True)
    log = OverrideLog(
        candidate_id=payload.candidate_id,
        total_score=payload.total_score,
        recommendation=payload.recommendation,
        category_updates=payload.category_updates,
        reason=payload.reason,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    logs = read_override_logs()
    logs.append(log)
    OVERRIDE_FILE.write_text(json.dumps([item.model_dump() for item in logs], indent=2), encoding="utf-8")
    return log
