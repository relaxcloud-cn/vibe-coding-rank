#!/usr/bin/env python3
"""Summarize Vibe Coding rank evidence from collected JSONL records."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


SIGNALS: dict[str, list[str]] = {
    "snippet_generation": [
        r"\bfunction\b",
        r"\bregex\b",
        r"小函数",
        r"代码片段",
        r"补全",
    ],
    "demo_generation": [
        r"demo",
        r"prototype",
        r"原型",
        r"跑起来",
        r"页面",
        r"截图",
        r"vibe",
    ],
    "bug_loop": [
        r"再修",
        r"还是不对",
        r"仍然失败",
        r"still fail",
        r"fix again",
        r"继续修",
    ],
    "context_boundary": [
        r"验收",
        r"acceptance",
        r"非目标",
        r"non-goal",
        r"不要改",
        r"do not touch",
        r"文件范围",
        r"scope",
        r"约束",
        r"constraint",
    ],
    "plan_before_edit": [
        r"先.*计划",
        r"先.*方案",
        r"plan before",
        r"before editing",
        r"ask mode",
    ],
    "validation": [
        r"\btest\b",
        r"\blint\b",
        r"\bbuild\b",
        r"测试",
        r"类型检查",
        r"回归",
        r"smoke",
        r"截图验证",
    ],
    "architecture": [
        r"架构",
        r"模块",
        r"边界",
        r"data model",
        r"auth",
        r"权限",
        r"支付",
        r"queue",
        r"重构",
        r"系统设计",
    ],
    "ownership": [
        r"解释.*结构",
        r"关键路径",
        r"接管",
        r"维护",
        r"上线",
        r"生产",
        r"monitor",
        r"rollback",
        r"backup",
        r"日志",
    ],
    "workflow_asset": [
        r"AGENTS\.md",
        r"CLAUDE\.md",
        r"\.cursor/rules",
        r"skill",
        r"rules",
        r"workflow",
        r"checklist",
        r"hook",
        r"MCP",
    ],
    "agent_orchestration": [
        r"多个 agent",
        r"multi-agent",
        r"subagent",
        r"reviewer",
        r"tester",
        r"Best-of-N",
        r"并行",
        r"分工",
    ],
    "team_system": [
        r"团队",
        r"team",
        r"playbook",
        r"共享",
        r"培训",
        r"组织",
    ],
}

RANKS = [
    (0, "零品 · 门外汉"),
    (1, "一品 · 初识真气"),
    (2, "二品 · 初窥门径"),
    (3, "三品 · 小有所成"),
    (4, "四品 · 登堂入室"),
    (5, "五品 · 炉火纯青"),
    (6, "六品 · 已有大成"),
    (7, "七品 · 已臻化境"),
    (8, "八品 · 半步宗师"),
    (9, "九品 · 大宗师"),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Collected JSONL evidence")
    parser.add_argument("--output", required=True, help="Summary JSON path")
    parser.add_argument("--max-evidence", type=int, default=4)
    return parser.parse_args()


def compile_patterns() -> dict[str, list[re.Pattern[str]]]:
    return {
        name: [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
        for name, patterns in SIGNALS.items()
    }


def load_records(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return records


def detect_signals(text: str, patterns: dict[str, list[re.Pattern[str]]]) -> list[str]:
    found: list[str] = []
    for signal, compiled in patterns.items():
        if any(pattern.search(text) for pattern in compiled):
            found.append(signal)
    return found


def snippet(text: str, length: int = 180) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    return compact[:length]


def choose_rank(counts: Counter[str], total_records: int) -> tuple[int, str, list[str]]:
    caps: list[str] = []
    if total_records == 0:
        return 0, RANKS[0][1], ["没有可分析记录。"]

    has_boundary = counts["context_boundary"] > 0
    has_validation = counts["validation"] > 0
    has_architecture = counts["architecture"] > 0
    has_ownership = counts["ownership"] > 0
    has_workflow = counts["workflow_asset"] > 0
    has_orchestration = counts["agent_orchestration"] > 0
    has_team = counts["team_system"] > 0

    level = 1
    if counts["demo_generation"] > 0:
        level = 2
    if counts["bug_loop"] > 0 or counts["validation"] > 0:
        level = max(level, 3)
    if has_boundary or counts["plan_before_edit"] > 0:
        level = max(level, 4)
    if has_architecture and has_validation:
        level = max(level, 5)
    if has_architecture and has_ownership and (has_workflow or has_orchestration):
        level = max(level, 6)
    if has_architecture and has_ownership and has_validation and has_orchestration:
        level = max(level, 7)
    if has_team and has_workflow:
        level = max(level, 8)

    if level >= 7 and not has_ownership:
        level = 6
        caps.append("缺少系统接管、关键路径解释、上线/回滚/维护等 ownership 证据。")
    if level >= 6 and not has_validation:
        level = 5
        caps.append("缺少测试、构建、lint、回归或人工验收证据。")
    if level >= 5 and not has_architecture:
        level = 4
        caps.append("缺少架构、模块边界、数据/权限/生产边界证据。")
    if level >= 8 and not has_team:
        level = 7
        caps.append("缺少团队级 playbook、共享 workflow 或方法复制证据。")

    caps.append("九品 · 大宗师 需要公开范式影响证据，不能仅凭私有会话自动判定。")
    return level, RANKS[level][1], caps


def confidence(total_records: int, signal_total: int) -> str:
    if total_records < 10 or signal_total < 5:
        return "low"
    if total_records < 50 or signal_total < 20:
        return "medium"
    return "high"


def main() -> int:
    args = parse_args()
    records = load_records(Path(args.input))
    patterns = compile_patterns()
    counts: Counter[str] = Counter()
    evidence: dict[str, list[dict[str, str]]] = defaultdict(list)

    for record in records:
        text = str(record.get("text", ""))
        path = str(record.get("path", ""))
        role = str(record.get("role", "unknown"))
        for signal in detect_signals(text, patterns):
            counts[signal] += 1
            if len(evidence[signal]) < args.max_evidence:
                evidence[signal].append(
                    {
                        "source": path,
                        "role": role,
                        "snippet": snippet(text),
                    }
                )

    level, label, caps = choose_rank(counts, len(records))
    signal_total = sum(counts.values())
    summary = {
        "analysis_version": "0.1",
        "record_count": len(records),
        "signal_count": signal_total,
        "signal_counts": dict(sorted(counts.items())),
        "heuristic_rank": {
            "level": level,
            "label": label,
            "score": min(99, max(1, level * 11 + min(10, signal_total // 5))),
            "confidence": confidence(len(records), signal_total),
        },
        "evidence": evidence,
        "rank_caps": caps,
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote summary to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
