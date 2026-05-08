#!/usr/bin/env python3
"""Collect and redact AI coding session evidence into JSONL.

This script intentionally uses only the Python standard library.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
from pathlib import Path
from typing import Any, Iterable


TEXT_KEYS = {
    "content",
    "text",
    "message",
    "prompt",
    "response",
    "summary",
    "command",
    "cmd",
    "stdout",
    "stderr",
}

NON_CONVERSATION_TYPES = {
    "agent_reasoning",
    "reasoning",
    "turn_context",
}

SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9_\-]{20,}"),
    re.compile(r"sk-ant-[A-Za-z0-9_\-]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"),
    re.compile(r"xox[baprs]-[A-Za-z0-9\-]{20,}"),
    re.compile(r"(?i)(api[_-]?key|token|secret|password)\s*[:=]\s*['\"]?[^'\"\s]+"),
    re.compile(r"Bearer\s+[A-Za-z0-9_\-.=]{20,}", re.IGNORECASE),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", choices=["codex", "claude", "generic"], required=True)
    parser.add_argument("--root", required=True, help="Directory or file to scan")
    parser.add_argument("--output", required=True, help="Output JSONL path")
    parser.add_argument("--since", help="Only include files modified on/after YYYY-MM-DD")
    parser.add_argument("--limit", type=int, default=5000, help="Max records to write")
    parser.add_argument("--max-chars", type=int, default=1800, help="Max chars per evidence text")
    return parser.parse_args()


def parse_since(value: str | None) -> float | None:
    if not value:
        return None
    day = dt.date.fromisoformat(value)
    return dt.datetime.combine(day, dt.time.min).timestamp()


def iter_files(root: Path, since_ts: float | None) -> Iterable[Path]:
    allowed = {".jsonl", ".json", ".txt", ".md", ".log"}
    if root.is_file():
        yield root
        return

    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in allowed:
            continue
        try:
            stat = path.stat()
        except OSError:
            continue
        if since_ts and stat.st_mtime < since_ts:
            continue
        yield path


def redact(text: str) -> str:
    redacted = text
    for pattern in SECRET_PATTERNS:
        redacted = pattern.sub("[REDACTED_SECRET]", redacted)
    return redacted


def flatten_text(value: Any) -> list[str]:
    texts: list[str] = []
    if isinstance(value, str):
        if value.strip():
            texts.append(value)
        return texts
    if isinstance(value, list):
        for item in value:
            texts.extend(flatten_text(item))
        return texts
    if isinstance(value, dict):
        for key, item in value.items():
            if key in TEXT_KEYS:
                texts.extend(flatten_text(item))
            elif isinstance(item, (dict, list)):
                texts.extend(flatten_text(item))
        return texts
    return texts


def normalize_role(role: str) -> str:
    value = role.strip().lower()
    if value in {"human"}:
        return "user"
    if value in {"agent_message"}:
        return "assistant"
    if value in {"agent_reasoning", "reasoning"}:
        return "reasoning"
    if value in {"function_call"}:
        return "assistant_tool"
    if value in {"function_call_output"}:
        return "tool_result"
    if value in {"user_message"}:
        return "user"
    return role[:40] if role else "unknown"


def extract_role(value: Any) -> str:
    if not isinstance(value, dict):
        return "unknown"
    if "toolUseResult" in value:
        return "tool_result"

    payload = value.get("payload")
    if isinstance(payload, dict):
        for key in ("role", "speaker", "author"):
            role = payload.get(key)
            if isinstance(role, str) and role:
                return normalize_role(role)
        payload_type = payload.get("type")
        if isinstance(payload_type, str) and payload_type:
            return normalize_role(payload_type)

    message = value.get("message")
    if isinstance(message, dict):
        role = message.get("role")
        if isinstance(role, str) and role:
            return normalize_role(role)

    for key in ("role", "speaker", "author", "type"):
        role = value.get(key)
        if isinstance(role, str) and role:
            return normalize_role(role)
    return "unknown"


def should_skip_record(value: Any) -> bool:
    if not isinstance(value, dict):
        return False
    if value.get("type") in NON_CONVERSATION_TYPES:
        return True
    payload = value.get("payload")
    if isinstance(payload, dict) and payload.get("type") in NON_CONVERSATION_TYPES:
        return True
    return False


def to_int(value: Any) -> int:
    if isinstance(value, bool):
        return 0
    if isinstance(value, int):
        return max(0, value)
    if isinstance(value, float):
        return max(0, int(value))
    return 0


def usage_payload(value: Any) -> dict[str, int] | None:
    if not isinstance(value, dict):
        return None

    source: dict[str, Any] | None = None
    payload = value.get("payload")
    if isinstance(payload, dict) and payload.get("type") == "token_count":
        info = payload.get("info")
        if isinstance(info, dict):
            source = info.get("last_token_usage") or info.get("total_token_usage")

    message = value.get("message")
    if source is None and isinstance(message, dict):
        usage = message.get("usage")
        if isinstance(usage, dict):
            source = usage

    if not isinstance(source, dict):
        return None

    input_tokens = to_int(source.get("input_tokens"))
    cached_tokens = to_int(source.get("cached_input_tokens")) + to_int(source.get("cache_read_input_tokens"))
    cache_creation_tokens = to_int(source.get("cache_creation_input_tokens"))
    output_tokens = to_int(source.get("output_tokens"))
    reasoning_tokens = to_int(source.get("reasoning_output_tokens"))
    total_tokens = to_int(source.get("total_tokens"))
    if total_tokens == 0:
        total_tokens = input_tokens + cached_tokens + cache_creation_tokens + output_tokens + reasoning_tokens

    if total_tokens == 0:
        return None

    return {
        "input_tokens": input_tokens,
        "cached_input_tokens": cached_tokens,
        "cache_creation_input_tokens": cache_creation_tokens,
        "output_tokens": output_tokens,
        "reasoning_output_tokens": reasoning_tokens,
        "total_tokens": total_tokens,
    }


def extract_records_from_json(value: Any, path: Path) -> Iterable[dict[str, Any]]:
    if isinstance(value, list):
        for item in value:
            yield from extract_records_from_json(item, path)
        return

    usage = usage_payload(value)
    if usage:
        yield {
            "role": "usage_stats",
            "text": json.dumps(usage, ensure_ascii=False, sort_keys=True),
            "path": str(path),
            "usage": usage,
        }
        return

    if should_skip_record(value):
        return

    texts = flatten_text(value)
    if not texts:
        return

    yield {
        "role": extract_role(value),
        "text": "\n".join(texts),
        "path": str(path),
    }


def read_jsonl(path: Path) -> Iterable[dict[str, Any]]:
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line_no, line in enumerate(handle, 1):
            line = line.strip()
            if not line:
                continue
            try:
                value = json.loads(line)
            except json.JSONDecodeError:
                yield {"role": "unknown", "text": line, "path": f"{path}:{line_no}"}
                continue
            for record in extract_records_from_json(value, path):
                record["path"] = f"{path}:{line_no}"
                yield record


def read_json(path: Path) -> Iterable[dict[str, Any]]:
    try:
        value = json.loads(path.read_text(encoding="utf-8", errors="replace"))
    except json.JSONDecodeError:
        return []
    return extract_records_from_json(value, path)


def read_text(path: Path) -> Iterable[dict[str, Any]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    return [{"role": "unknown", "text": text, "path": str(path)}]


def read_records(path: Path) -> Iterable[dict[str, Any]]:
    suffix = path.suffix.lower()
    if suffix == ".jsonl":
        return read_jsonl(path)
    if suffix == ".json":
        return read_json(path)
    return read_text(path)


def main() -> int:
    args = parse_args()
    root = Path(os.path.expanduser(args.root)).resolve()
    since_ts = parse_since(args.since)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    written = 0
    usage_written = 0
    with output.open("w", encoding="utf-8") as out:
        for path in iter_files(root, since_ts):
            try:
                mtime = dt.datetime.fromtimestamp(path.stat().st_mtime).isoformat()
                for record in read_records(path):
                    text = redact(str(record.get("text", ""))).strip()
                    if not text:
                        continue
                    payload = {
                        "source": args.source,
                        "path": record.get("path", str(path)),
                        "mtime": mtime,
                        "role": record.get("role", "unknown"),
                        "text": text[: args.max_chars],
                    }
                    is_usage = record.get("role") == "usage_stats"
                    if isinstance(record.get("usage"), dict):
                        payload["usage"] = record["usage"]
                    if not is_usage and written >= args.limit:
                        continue
                    out.write(json.dumps(payload, ensure_ascii=False) + "\n")
                    if is_usage:
                        usage_written += 1
                    else:
                        written += 1
            except OSError:
                continue

    print(f"wrote {written} records and {usage_written} usage stats to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
