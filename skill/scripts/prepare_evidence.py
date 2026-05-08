#!/usr/bin/env python3
"""Prepare Vibe Coding rank evidence from collected JSONL records.

This script is intentionally conservative. It does not try to be the final
judge for high ranks. It cleans records, builds behavior evidence cards, and
returns a capped preliminary rank for the CLI preview.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from datetime import date
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

SIGNAL_META: dict[str, dict[str, Any]] = {
    "snippet_generation": {
        "type": "片段生成证据",
        "dimension": "局部实现",
        "supports_levels": [1],
        "strength": "弱",
        "proves": "能把 AI 用在函数、正则、补全等局部实现上，但不能证明系统控制力。",
    },
    "demo_generation": {
        "type": "Demo 生成证据",
        "dimension": "结果生成",
        "supports_levels": [2],
        "strength": "弱",
        "proves": "能用 AI 快速搭出可运行结果，但还不能证明验证闭环和系统归属。",
    },
    "bug_loop": {
        "type": "Bug 循环证据",
        "dimension": "迭代控制",
        "supports_levels": [3],
        "strength": "中",
        "proves": "能推动 AI 处理失败和报错；若缺少根因分析，通常会被封顶在三品附近。",
    },
    "context_boundary": {
        "type": "边界控制证据",
        "dimension": "目标与边界",
        "supports_levels": [4, 5],
        "strength": "强",
        "proves": "开始定义目标、非目标、验收条件或文件范围，AI 的行为被人的边界约束。",
    },
    "plan_before_edit": {
        "type": "计划先行证据",
        "dimension": "协作控制",
        "supports_levels": [4, 5],
        "strength": "中",
        "proves": "不急着让 AI 改代码，而是先要求计划、方案或执行路径。",
    },
    "validation": {
        "type": "验证闭环证据",
        "dimension": "验证判断",
        "supports_levels": [3, 5, 6],
        "strength": "强",
        "proves": "用测试、构建、lint、回归或人工验收确认结果，而不是只看能不能跑。",
    },
    "architecture": {
        "type": "架构判断证据",
        "dimension": "系统设计",
        "supports_levels": [5, 6, 7],
        "strength": "强",
        "proves": "关注模块边界、权限、数据模型、重构或系统设计，开始从系统层面判断结果。",
    },
    "ownership": {
        "type": "系统归属证据",
        "dimension": "结果责任",
        "supports_levels": [6, 7],
        "strength": "强",
        "proves": "关注上线、日志、回滚、维护、关键路径和生产责任，是拥有系统的关键证据。",
    },
    "workflow_asset": {
        "type": "工作流沉淀证据",
        "dimension": "方法资产",
        "supports_levels": [6, 7, 8],
        "strength": "中",
        "proves": "把一次协作沉淀成 rules、skill、workflow 或 checklist，开始把能力资产化。",
    },
    "agent_orchestration": {
        "type": "Agent 编排证据",
        "dimension": "协作编排",
        "supports_levels": [6, 7],
        "strength": "中",
        "proves": "能让多个 Agent 或不同角色分工协作，而不是只和单个窗口来回修。",
    },
    "team_system": {
        "type": "团队复制证据",
        "dimension": "方法复制",
        "supports_levels": [8],
        "strength": "候选",
        "proves": "方法可能正在被团队复用；八品还需要他人使用、团队落地或组织影响的强证据确认。",
    },
}

DIMENSIONS: list[dict[str, Any]] = [
    {
        "id": "problem_definition",
        "label": "目标定义",
        "signals": ["plan_before_edit", "context_boundary"],
        "question": "能否把模糊目标变成 AI 可执行任务。",
    },
    {
        "id": "boundary_control",
        "label": "边界控制",
        "signals": ["context_boundary", "architecture"],
        "question": "能否定义非目标、文件范围、模块边界和验收标准。",
    },
    {
        "id": "validation_loop",
        "label": "验证闭环",
        "signals": ["validation"],
        "question": "是否用测试、构建、lint、截图、diff review 或人工验收确认结果。",
    },
    {
        "id": "architecture_judgment",
        "label": "架构判断",
        "signals": ["architecture"],
        "question": "是否能判断模块边界、数据模型、权限、安全、重构和系统演进。",
    },
    {
        "id": "system_ownership",
        "label": "系统归属",
        "signals": ["ownership", "architecture", "validation"],
        "question": "是否理解关键路径，能为上线、维护、回滚和结果负责。",
    },
    {
        "id": "method_replication",
        "label": "方法复制",
        "signals": ["workflow_asset", "agent_orchestration", "team_system"],
        "question": "是否把个人方法沉淀成团队可复用的 rules、skill、workflow、playbook 或评测。",
    },
]

BEHAVIOR_CLASSES: dict[str, str] = {
    "user_instruction": "用户指令",
    "user_decision": "用户决策",
    "assistant_execution": "助手执行",
    "assistant_summary": "助手自述",
    "other": "其他",
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

RANK_LABELS = {level: label for level, label in RANKS}

SCORE_BANDS = {
    0: (0, 9),
    1: (10, 19),
    2: (20, 34),
    3: (35, 49),
    4: (50, 59),
    5: (60, 69),
    6: (70, 79),
    7: (80, 87),
    8: (88, 94),
    9: (95, 100),
}

TOOL_EVENT_ROLES = {
    "assistant_tool",
    "exec_command",
    "exec_command_begin",
    "exec_command_end",
    "patch_apply_begin",
    "patch_apply_end",
    "web_search_call",
    "web_search_result",
    "item_completed",
    "error",
}

EXCLUDED_ROLES = {
    "assistant_tool",
    "system",
    "developer",
    "session_meta",
    "compacted",
    "reasoning",
    "turn_context",
    "progress",
    "attachment",
    "queue-operation",
    "tool_result",
    "usage_stats",
} | TOOL_EVENT_ROLES

EXCLUDED_TEXT_PATTERNS: list[tuple[str, str]] = [
    ("codex_system_prompt", r"\bYou are Codex, a coding agent\b"),
    ("chatgpt_system_prompt", r"\bYou are ChatGPT\b"),
    ("permissions_context", r"<permissions instructions>|Filesystem sandboxing defines"),
    ("agents_context", r"# AGENTS\.md instructions for|<INSTRUCTIONS>"),
    ("environment_context", r"<environment_context>|</environment_context>"),
    ("collaboration_context", r"<collaboration_mode>|</collaboration_mode>"),
    ("skills_context", r"<skills_instructions>|</skills_instructions>|## Skills\s+A skill is"),
    ("tool_schema", r"^# Tools\b|Namespace:\s+\w+|tool for accessing the internet"),
    ("system_policy", r"Knowledge cutoff:|Current date:|system message|developer message"),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Collected JSONL evidence")
    parser.add_argument("--output", required=True, help="Summary JSON path")
    parser.add_argument("--max-evidence", type=int, default=4)
    parser.add_argument(
        "--allow-team-rank",
        action="store_true",
        help="Allow automatic 八品 preview when strong team replication evidence exists.",
    )
    return parser.parse_args()


def compile_patterns() -> dict[str, list[re.Pattern[str]]]:
    return {
        name: [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
        for name, patterns in SIGNALS.items()
    }


def compile_excluded_patterns() -> list[tuple[str, re.Pattern[str]]]:
    return [
        (name, re.compile(pattern, re.IGNORECASE | re.MULTILINE))
        for name, pattern in EXCLUDED_TEXT_PATTERNS
    ]


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


def record_source(record: dict[str, Any]) -> str:
    source = str(record.get("source", "")).strip()
    path = str(record.get("path", "")).strip()
    if source and path:
        return f"{source}:{path}"
    return path or source


def source_session(record: dict[str, Any]) -> str:
    path = str(record.get("path", "")).strip()
    if ":" in path:
        path = path.rsplit(":", 1)[0]
    return path or record_source(record)


def source_day(record: dict[str, Any]) -> str:
    mtime = str(record.get("mtime", "")).strip()
    if len(mtime) >= 10:
        return mtime[:10]
    path = str(record.get("path", ""))
    match = re.search(r"/(\d{4})/(\d{2})/(\d{2})/", path)
    if match:
        return "-".join(match.groups())
    return "unknown"


def is_promotion_signal(signal: str) -> bool:
    return signal not in {"snippet_generation", "demo_generation", "bug_loop", "team_system"}


def is_user_role(role: str) -> bool:
    return role.strip().lower() == "user"


def classify_behavior(record: dict[str, Any], text: str, signals: list[str] | None = None) -> str:
    role = str(record.get("role", "")).strip().lower()
    signal_set = set(signals or [])
    if role == "user":
        if (
            signal_set.intersection({"architecture", "ownership", "workflow_asset", "agent_orchestration"})
            or re.search(r"重构|不要|非目标|验收|边界|架构|权限|rollback|回滚|沉淀|playbook|workflow|rules|整体替换", text, re.IGNORECASE)
        ):
            return "user_decision"
        return "user_instruction"
    if role == "assistant":
        if re.search(r"已|完成|运行|通过|验证|复查|补充|记录|生成|updated|implemented|ran|passed", text, re.IGNORECASE):
            return "assistant_execution"
        return "assistant_summary"
    return "other"


def usage_from_record(record: dict[str, Any]) -> dict[str, int] | None:
    usage = record.get("usage")
    if not isinstance(usage, dict):
        try:
            usage = json.loads(str(record.get("text", "")))
        except json.JSONDecodeError:
            return None
    total = int(usage.get("total_tokens") or 0)
    if total <= 0:
        return None
    return {
        "input_tokens": int(usage.get("input_tokens") or 0),
        "cached_input_tokens": int(usage.get("cached_input_tokens") or 0),
        "cache_creation_input_tokens": int(usage.get("cache_creation_input_tokens") or 0),
        "output_tokens": int(usage.get("output_tokens") or 0),
        "reasoning_output_tokens": int(usage.get("reasoning_output_tokens") or 0),
        "total_tokens": total,
    }


def ratio(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return round(numerator / denominator, 4)


def parse_iso_day(day: str) -> date | None:
    try:
        return date.fromisoformat(day)
    except ValueError:
        return None


def day_span(days: set[str]) -> tuple[str, str, int]:
    known_days = sorted(day for day in days if day != "unknown")
    if not known_days:
        return "", "", 0
    first = known_days[0]
    last = known_days[-1]
    first_date = parse_iso_day(first)
    last_date = parse_iso_day(last)
    if first_date and last_date:
        return first, last, (last_date - first_date).days + 1
    return first, last, len(known_days)


def build_usage_stats(records: list[dict[str, Any]]) -> dict[str, Any]:
    totals: Counter[str] = Counter()
    by_day: Counter[str] = Counter()
    by_session: Counter[str] = Counter()
    usage_records = 0
    peak_record = 0

    for record in records:
        if str(record.get("role", "")).strip().lower() != "usage_stats":
            continue
        usage = usage_from_record(record)
        if not usage:
            continue
        usage_records += 1
        for key, value in usage.items():
            totals[key] += value
        total_tokens = usage["total_tokens"]
        peak_record = max(peak_record, total_tokens)
        by_day[source_day(record)] += total_tokens
        by_session[source_session(record)] += total_tokens

    peak_day, peak_day_tokens = ("", 0)
    if by_day:
        peak_day, peak_day_tokens = by_day.most_common(1)[0]
    peak_session, peak_session_tokens = ("", 0)
    if by_session:
        peak_session, peak_session_tokens = by_session.most_common(1)[0]
    active_day_count = len([day for day in by_day if day != "unknown"])
    active_session_count = len(by_session)
    first_day, last_day, active_span_days = day_span(set(by_day))
    total_tokens = totals["total_tokens"]

    return {
        "usage_record_count": usage_records,
        "total_tokens": total_tokens,
        "input_tokens": totals["input_tokens"],
        "cached_input_tokens": totals["cached_input_tokens"],
        "cache_creation_input_tokens": totals["cache_creation_input_tokens"],
        "output_tokens": totals["output_tokens"],
        "reasoning_output_tokens": totals["reasoning_output_tokens"],
        "active_days": active_day_count,
        "active_sessions": active_session_count,
        "first_active_day": first_day,
        "last_active_day": last_day,
        "active_span_days": active_span_days,
        "average_day_tokens": round(total_tokens / active_day_count) if active_day_count else 0,
        "average_session_tokens": round(total_tokens / active_session_count) if active_session_count else 0,
        "peak_record_tokens": peak_record,
        "peak_day": peak_day,
        "peak_day_tokens": peak_day_tokens,
        "peak_session_tokens": peak_session_tokens,
        "peak_record_token_share": ratio(peak_record, total_tokens),
        "peak_day_token_share": ratio(peak_day_tokens, total_tokens),
        "peak_session_token_share": ratio(peak_session_tokens, total_tokens),
        "cached_input_token_share": ratio(totals["cached_input_tokens"], total_tokens),
        "output_token_share": ratio(totals["output_tokens"], total_tokens),
        "reasoning_token_share": ratio(totals["reasoning_output_tokens"], total_tokens),
        "token_note": "Token 是 AI 投入强度指标，不参与段位升品。",
    }


def build_hard_stats(
    total_records: int,
    analyzed_record_count: int,
    excluded_total: int,
    excluded_reasons: Counter[str],
    source_count: int,
    signal_total: int,
    strong_evidence_count: int,
    promotion_evidence_count: int,
    promotion_record_count: int,
    strong_evidence_record_count: int,
    user_control_signal_count: int,
    user_control_record_count: int,
    user_control_source_count: int,
    usage_stats: dict[str, Any],
    counts: Counter[str],
    strong_counts: Counter[str],
    strong_signal_sources: dict[str, set[str]],
    dimension_profile: list[dict[str, Any]],
    analyzed_days: set[str],
    behavior_counts: Counter[str],
    promotion_signal_behavior_counts: Counter[str],
    promotion_record_behavior_counts: Counter[str],
) -> dict[str, Any]:
    usage_record_count = int(usage_stats.get("usage_record_count") or 0)
    tool_result_count = excluded_reasons.get("role:tool_result", 0)
    tool_event_count = sum(excluded_reasons.get(f"role:{role}", 0) for role in TOOL_EVENT_ROLES)
    context_excluded_count = max(0, excluded_total - usage_record_count - tool_result_count - tool_event_count)
    scoring_candidate_count = max(0, total_records - usage_record_count)
    signal_type_count = sum(1 for signal in SIGNALS if counts[signal] > 0)
    strong_signal_type_count = sum(1 for signal in SIGNALS if strong_counts[signal] > 0)
    dominant_signal, dominant_signal_count = ("", 0)
    if counts:
        dominant_signal, dominant_signal_count = counts.most_common(1)[0]
    strong_sources: set[str] = set()
    for sources in strong_signal_sources.values():
        strong_sources.update(sources)
    evidence_first_day, evidence_last_day, evidence_span_days = day_span(analyzed_days)
    established_dimension_count = sum(
        1 for item in dimension_profile if item.get("status") in {"成立", "稳定"}
    )
    stable_dimension_count = sum(1 for item in dimension_profile if item.get("status") == "稳定")
    promotion_signal_behavior_total = sum(promotion_signal_behavior_counts.values())
    promotion_record_behavior_total = sum(promotion_record_behavior_counts.values())
    weak_signal_count = counts["snippet_generation"] + counts["demo_generation"] + counts["bug_loop"]
    return {
        "raw_record_count": total_records,
        "analyzed_record_count": analyzed_record_count,
        "non_scoring_record_count": excluded_total,
        "usage_record_count": usage_record_count,
        "tool_result_record_count": tool_result_count,
        "tool_event_record_count": tool_event_count,
        "context_excluded_record_count": context_excluded_count,
        "scoring_candidate_record_count": scoring_candidate_count,
        "scorable_record_ratio": ratio(analyzed_record_count, scoring_candidate_count),
        "source_count": source_count,
        "evidence_first_day": evidence_first_day,
        "evidence_last_day": evidence_last_day,
        "evidence_span_days": evidence_span_days,
        "average_records_per_source": ratio(analyzed_record_count, source_count),
        "signal_count": signal_total,
        "signal_density": ratio(signal_total, analyzed_record_count),
        "signal_type_count": signal_type_count,
        "signal_coverage_ratio": ratio(signal_type_count, len(SIGNALS)),
        "dominant_signal": dominant_signal,
        "dominant_signal_count": dominant_signal_count,
        "dominant_signal_ratio": ratio(dominant_signal_count, signal_total),
        "validation_count": counts["validation"],
        "validation_density": ratio(counts["validation"], analyzed_record_count),
        "validation_signal_share": ratio(counts["validation"], signal_total),
        "bug_loop_count": counts["bug_loop"],
        "bug_loop_density": ratio(counts["bug_loop"], analyzed_record_count),
        "bug_loop_signal_share": ratio(counts["bug_loop"], signal_total),
        "demo_generation_count": counts["demo_generation"],
        "snippet_generation_count": counts["snippet_generation"],
        "weak_signal_count": weak_signal_count,
        "weak_signal_ratio": ratio(weak_signal_count, signal_total),
        "strong_evidence_count": strong_evidence_count,
        "strong_evidence_density": ratio(strong_evidence_count, analyzed_record_count),
        "strong_signal_type_count": strong_signal_type_count,
        "strong_evidence_source_count": len(strong_sources),
        "strong_record_density": ratio(strong_evidence_record_count, analyzed_record_count),
        "average_strong_evidence_per_source": ratio(strong_evidence_count, source_count),
        "promotion_evidence_count": promotion_evidence_count,
        "promotion_record_count": promotion_record_count,
        "promotion_record_density": ratio(promotion_record_count, analyzed_record_count),
        "strong_evidence_record_count": strong_evidence_record_count,
        "average_promotion_signals_per_record": ratio(promotion_evidence_count, promotion_record_count),
        "user_control_count": user_control_record_count,
        "user_control_record_count": user_control_record_count,
        "user_control_signal_count": user_control_signal_count,
        "user_control_source_count": user_control_source_count,
        "user_control_ratio": ratio(user_control_record_count, promotion_record_count),
        "user_control_signal_ratio": ratio(user_control_signal_count, promotion_evidence_count),
        "behavior_counts": dict(sorted(behavior_counts.items())),
        "promotion_behavior_counts": dict(sorted(promotion_record_behavior_counts.items())),
        "promotion_record_behavior_counts": dict(sorted(promotion_record_behavior_counts.items())),
        "promotion_signal_behavior_counts": dict(sorted(promotion_signal_behavior_counts.items())),
        "user_decision_count": behavior_counts.get("user_decision", 0),
        "user_instruction_count": behavior_counts.get("user_instruction", 0),
        "assistant_execution_count": behavior_counts.get("assistant_execution", 0),
        "assistant_summary_count": behavior_counts.get("assistant_summary", 0),
        "user_decision_ratio": ratio(behavior_counts.get("user_decision", 0), analyzed_record_count),
        "user_instruction_ratio": ratio(behavior_counts.get("user_instruction", 0), analyzed_record_count),
        "assistant_execution_ratio": ratio(behavior_counts.get("assistant_execution", 0), analyzed_record_count),
        "assistant_summary_ratio": ratio(behavior_counts.get("assistant_summary", 0), analyzed_record_count),
        "promotion_user_decision_ratio": ratio(
            promotion_record_behavior_counts.get("user_decision", 0),
            promotion_record_behavior_total,
        ),
        "promotion_assistant_execution_ratio": ratio(
            promotion_record_behavior_counts.get("assistant_execution", 0),
            promotion_record_behavior_total,
        ),
        "promotion_user_decision_signal_ratio": ratio(
            promotion_signal_behavior_counts.get("user_decision", 0),
            promotion_signal_behavior_total,
        ),
        "promotion_assistant_execution_signal_ratio": ratio(
            promotion_signal_behavior_counts.get("assistant_execution", 0),
            promotion_signal_behavior_total,
        ),
        "established_dimension_count": established_dimension_count,
        "stable_dimension_count": stable_dimension_count,
        "total_tokens": int(usage_stats.get("total_tokens") or 0),
        "input_tokens": int(usage_stats.get("input_tokens") or 0),
        "cached_input_tokens": int(usage_stats.get("cached_input_tokens") or 0),
        "cache_creation_input_tokens": int(usage_stats.get("cache_creation_input_tokens") or 0),
        "output_tokens": int(usage_stats.get("output_tokens") or 0),
        "reasoning_output_tokens": int(usage_stats.get("reasoning_output_tokens") or 0),
        "active_days": int(usage_stats.get("active_days") or 0),
        "active_sessions": int(usage_stats.get("active_sessions") or 0),
        "first_active_day": str(usage_stats.get("first_active_day") or ""),
        "last_active_day": str(usage_stats.get("last_active_day") or ""),
        "active_span_days": int(usage_stats.get("active_span_days") or 0),
        "average_day_tokens": int(usage_stats.get("average_day_tokens") or 0),
        "average_session_tokens": int(usage_stats.get("average_session_tokens") or 0),
        "peak_record_tokens": int(usage_stats.get("peak_record_tokens") or 0),
        "peak_day": str(usage_stats.get("peak_day") or ""),
        "peak_day_tokens": int(usage_stats.get("peak_day_tokens") or 0),
        "peak_session_tokens": int(usage_stats.get("peak_session_tokens") or 0),
        "peak_record_token_share": float(usage_stats.get("peak_record_token_share") or 0),
        "peak_day_token_share": float(usage_stats.get("peak_day_token_share") or 0),
        "peak_session_token_share": float(usage_stats.get("peak_session_token_share") or 0),
        "cached_input_token_share": float(usage_stats.get("cached_input_token_share") or 0),
        "output_token_share": float(usage_stats.get("output_token_share") or 0),
        "reasoning_token_share": float(usage_stats.get("reasoning_token_share") or 0),
        "tool_event_record_ratio": ratio(tool_event_count, total_records),
        "tool_result_record_ratio": ratio(tool_result_count, total_records),
        "non_scoring_record_ratio": ratio(excluded_total, total_records),
        "note": "硬统计只描述样本质量和 AI 投入强度，不直接参与段位升品。",
    }


def excluded_note(excluded_reasons: Counter[str]) -> str:
    total = sum(excluded_reasons.values())
    usage_count = excluded_reasons.get("role:usage_stats", 0)
    tool_result_count = excluded_reasons.get("role:tool_result", 0)
    tool_event_count = sum(excluded_reasons.get(f"role:{role}", 0) for role in TOOL_EVENT_ROLES)
    context_count = max(0, total - usage_count - tool_result_count - tool_event_count)
    parts: list[str] = []
    if context_count:
        parts.append(f"{context_count} 条系统/上下文记录")
    if tool_result_count:
        parts.append(f"{tool_result_count} 条工具结果")
    if tool_event_count:
        parts.append(f"{tool_event_count} 条工具事件")
    if usage_count:
        parts.append(f"{usage_count} 条 token 统计")
    detail = "、".join(parts) if parts else "非评分记录"
    return f"已排除 {total} 条非评分记录（{detail}）；这些不计入能力评分。"


def percent(value: float) -> str:
    return f"{round(value * 100)}%"


def rank_level_name(level: int) -> str:
    return str(RANK_LABELS.get(level, f"{level}品")).split(" · ")[0]


def quality_flag(
    flag_id: str,
    severity: str,
    label: str,
    metric: str,
    message: str,
) -> dict[str, str]:
    return {
        "id": flag_id,
        "severity": severity,
        "label": label,
        "metric": metric,
        "message": message,
    }


def drag_factor(
    factor_id: str,
    label: str,
    metric: str,
    impact: str,
    advice: str,
) -> dict[str, str]:
    return {
        "id": factor_id,
        "label": label,
        "metric": metric,
        "impact": impact,
        "advice": advice,
    }


def build_drag_factors(counts: Counter[str], hard_stats: dict[str, Any]) -> list[dict[str, str]]:
    signal_total = int(hard_stats.get("signal_count") or 0)
    analyzed_records = int(hard_stats.get("analyzed_record_count") or 0)
    promotion_record_count = int(hard_stats.get("promotion_record_count") or 0)
    strong_evidence_record_count = int(hard_stats.get("strong_evidence_record_count") or 0)
    weak_count = counts["snippet_generation"] + counts["demo_generation"] + counts["bug_loop"]
    weak_ratio = ratio(weak_count, signal_total)
    demo_ratio = ratio(counts["demo_generation"], signal_total)
    snippet_ratio = ratio(counts["snippet_generation"], signal_total)
    bug_loop_ratio = ratio(counts["bug_loop"], signal_total)
    promotion_record_ratio = ratio(promotion_record_count, analyzed_records)
    strong_record_ratio = ratio(strong_evidence_record_count, promotion_record_count)
    factors: list[dict[str, str]] = []

    if weak_count >= 8 and weak_ratio >= 0.25:
        factors.append(
            drag_factor(
                "weak_signal_heavy",
                "弱信号偏重",
                percent(weak_ratio),
                "片段、Demo 或修 bug 信号占比较高，会削弱系统归属判断。",
                "下一轮减少展示“能跑”，多留下目标边界、架构取舍和验收证据。",
            )
        )

    if counts["bug_loop"] >= 3 and bug_loop_ratio >= 0.08:
        factors.append(
            drag_factor(
                "bug_loop_heavy",
                "Bug 循环偏重",
                percent(bug_loop_ratio),
                "反复让 AI 修同一类问题，说明迭代控制可能停在局部 patch。",
                "失败两轮后先做根因分析，决定重构、缩小边界或补测试，再让 AI 执行。",
            )
        )

    if counts["demo_generation"] >= 5 and demo_ratio >= 0.12:
        factors.append(
            drag_factor(
                "demo_heavy",
                "Demo 生成偏重",
                percent(demo_ratio),
                "Demo 多说明生成速度强，但不能证明生产质量和系统拥有感。",
                "为 Demo 补上验收、异常处理、数据边界和上线风险记录。",
            )
        )

    if counts["snippet_generation"] >= 5 and snippet_ratio >= 0.12:
        factors.append(
            drag_factor(
                "snippet_heavy",
                "片段生成偏重",
                percent(snippet_ratio),
                "片段和补全能提高速度，但对段位支撑有限。",
                "把局部实现升级为完整任务：目标、非目标、验收和复盘都要留下记录。",
            )
        )

    if promotion_record_count > 0 and strong_record_ratio < 0.25:
        factors.append(
            drag_factor(
                "thin_strong_records",
                "强记录占比偏低",
                percent(strong_record_ratio),
                "高阶记录里真正能支撑架构、验证、归属的强证据不够密。",
                "每个关键任务至少留下一条用户主导决策和一条验证闭环记录。",
            )
        )

    if analyzed_records >= 20 and promotion_record_ratio < 0.1:
        factors.append(
            drag_factor(
                "low_promotion_record_density",
                "高阶记录密度低",
                percent(promotion_record_ratio),
                "大量会话没有形成可评分的高阶行为记录。",
                "减少闲聊式使用，把真实任务拆成可验收的 AI 协作记录。",
            )
        )

    return factors


def build_quality_flags(hard_stats: dict[str, Any]) -> list[dict[str, str]]:
    flags: list[dict[str, str]] = []
    raw_records = int(hard_stats.get("raw_record_count") or 0)
    analyzed_records = int(hard_stats.get("analyzed_record_count") or 0)
    non_scoring_records = int(hard_stats.get("non_scoring_record_count") or 0)
    source_count = int(hard_stats.get("source_count") or 0)
    evidence_span_days = int(hard_stats.get("evidence_span_days") or 0)
    promotion_evidence_count = int(hard_stats.get("promotion_evidence_count") or 0)
    strong_density = float(hard_stats.get("strong_evidence_density") or 0)
    user_control_ratio = float(hard_stats.get("user_control_ratio") or 0)
    user_decision_ratio = float(hard_stats.get("promotion_user_decision_ratio") or 0)
    assistant_execution_ratio = float(hard_stats.get("promotion_assistant_execution_ratio") or 0)
    dominant_signal_ratio = float(hard_stats.get("dominant_signal_ratio") or 0)
    peak_day_token_share = float(hard_stats.get("peak_day_token_share") or 0)
    behavior_counts = hard_stats.get("behavior_counts") or {}
    other_behavior_count = int(behavior_counts.get("other") or 0)
    non_scoring_ratio = ratio(non_scoring_records, raw_records)
    other_behavior_ratio = ratio(other_behavior_count, analyzed_records)

    if analyzed_records < 10 or source_count < 2:
        flags.append(
            quality_flag(
                "thin_sample",
                "risk",
                "有效样本偏薄",
                f"{analyzed_records} 条 / {source_count} 个来源",
                "样本太少时只能做低置信度初筛，不能支撑高段位。",
            )
        )
    elif evidence_span_days >= 14 and source_count >= 3:
        flags.append(
            quality_flag(
                "stable_sample_span",
                "ok",
                "样本跨度较好",
                f"{evidence_span_days} 天 / {source_count} 个来源",
                "跨多天、多会话的证据比单次高光更可信。",
            )
        )

    if non_scoring_ratio >= 0.5:
        flags.append(
            quality_flag(
                "non_scoring_heavy",
                "info",
                "非评分记录占比高",
                percent(non_scoring_ratio),
                "大量 token、系统上下文或工具结果被排除；报告只看剩余真实行为。",
            )
        )

    if other_behavior_ratio >= 0.3:
        flags.append(
            quality_flag(
                "unclear_behavior_mix",
                "warning",
                "行为归类不清",
                percent(other_behavior_ratio),
                "较多记录无法归入用户决策或助手执行，行为结构需要谨慎解读。",
            )
        )

    if promotion_evidence_count > 0 and user_control_ratio < 0.05:
        flags.append(
            quality_flag(
                "low_user_control",
                "risk",
                "主动控制偏低",
                percent(user_control_ratio),
                "高阶信号主要不是由用户主动定义目标、边界、架构或验收触发。",
            )
        )

    if promotion_evidence_count > 0 and user_decision_ratio < 0.03:
        flags.append(
            quality_flag(
                "low_user_decision",
                "risk",
                "用户决策偏低",
                percent(user_decision_ratio),
                "普通指令和助手执行不能替代系统级取舍；六品以上会被压低。",
            )
        )

    if assistant_execution_ratio >= 0.7:
        flags.append(
            quality_flag(
                "assistant_execution_heavy",
                "warning",
                "助手执行占比过高",
                percent(assistant_execution_ratio),
                "如果高阶证据主要来自助手自述完成，系统归属判断会打折。",
            )
        )
    elif assistant_execution_ratio >= 0.5:
        flags.append(
            quality_flag(
                "assistant_execution_watch",
                "info",
                "助手执行占比较高",
                percent(assistant_execution_ratio),
                "这不代表能力低，但需要更多用户决策证据来证明人在控。",
            )
        )

    if dominant_signal_ratio >= 0.45:
        flags.append(
            quality_flag(
                "dominant_signal_concentrated",
                "warning",
                "信号过于集中",
                percent(dominant_signal_ratio),
                "单一信号不能证明完整系统能力，需要目标、边界、验证、架构共同成立。",
            )
        )

    if peak_day_token_share >= 0.5:
        flags.append(
            quality_flag(
                "peak_day_concentrated",
                "warning",
                "token 单日集中",
                percent(peak_day_token_share),
                "阶段性爆量不等于稳定能力，评级会更看重跨天复用。",
            )
        )

    if strong_density >= 0.15:
        flags.append(
            quality_flag(
                "strong_evidence_dense",
                "ok",
                "强证据密度较好",
                percent(strong_density),
                "强证据占比足够高，说明报告不是只靠弱信号或工具名支撑。",
            )
        )

    priority = {"risk": 0, "warning": 1, "info": 2, "ok": 3}
    return sorted(flags, key=lambda item: (priority.get(item["severity"], 9), item["id"]))


def metric_groups(hard_stats: dict[str, Any], usage_stats: dict[str, Any]) -> list[dict[str, str]]:
    total_tokens = int(hard_stats.get("total_tokens") or usage_stats.get("total_tokens") or 0)
    active_days = int(hard_stats.get("active_days") or usage_stats.get("active_days") or 0)
    active_sessions = int(hard_stats.get("active_sessions") or usage_stats.get("active_sessions") or 0)
    peak_day_share = float(hard_stats.get("peak_day_token_share") or usage_stats.get("peak_day_token_share") or 0)
    analyzed = int(hard_stats.get("analyzed_record_count") or 0)
    candidate = int(hard_stats.get("scoring_candidate_record_count") or analyzed)
    source_count = int(hard_stats.get("source_count") or 0)
    strong_record_density = float(hard_stats.get("strong_record_density") or 0)
    signal_coverage_ratio = float(hard_stats.get("signal_coverage_ratio") or 0)
    non_scoring_ratio = float(hard_stats.get("non_scoring_record_ratio") or 0)
    user_control_ratio = float(hard_stats.get("user_control_ratio") or 0)
    user_decision_ratio = float(hard_stats.get("promotion_user_decision_ratio") or hard_stats.get("user_decision_ratio") or 0)
    assistant_execution_ratio = float(hard_stats.get("promotion_assistant_execution_ratio") or 0)
    validation_density = float(hard_stats.get("validation_density") or 0)
    established_dimensions = int(hard_stats.get("established_dimension_count") or 0)
    bug_loop_density = float(hard_stats.get("bug_loop_density") or 0)
    weak_signal_ratio = float(hard_stats.get("weak_signal_ratio") or 0)

    def tokens(value: int) -> str:
        if value >= 100000000:
            return f"{value / 100000000:.1f}亿 token"
        if value >= 10000:
            return f"{round(value / 10000)}万 token"
        return f"{value} token" if value else "暂无"

    return [
        {
            "id": "investment",
            "label": "投入强度",
            "value": tokens(total_tokens),
            "signal": f"活跃 {active_days} 天 / {active_sessions} 会话" if active_days or active_sessions else "未读取到 token 统计",
            "basis": f"峰值日占比 {percent(peak_day_share)}" if peak_day_share else "缺少峰值日分布",
            "ratingImpact": "只解释 AI 使用投入和样本稳定性，不直接升品。",
            "risk": "token 单日集中，稳定性会被打折。" if peak_day_share >= 0.5 else "投入分布没有明显单日集中风险。",
        },
        {
            "id": "sample_quality",
            "label": "样本可信度",
            "value": f"{analyzed}/{candidate}",
            "signal": f"证据来源 {source_count} 个，强记录占比 {percent(strong_record_density)}",
            "basis": f"非评分记录占比 {percent(non_scoring_ratio)}，信号覆盖 {percent(signal_coverage_ratio)}",
            "ratingImpact": "影响置信度和高段位封顶；样本薄时不能判六品以上。",
            "risk": "强记录偏薄，需要更多真实任务证据。" if strong_record_density < 0.05 else "样本里有可复核的强证据。",
        },
        {
            "id": "human_control",
            "label": "人类控制",
            "value": percent(user_decision_ratio or user_control_ratio),
            "signal": f"主动控制 {percent(user_control_ratio)}，用户决策 {percent(user_decision_ratio)}",
            "basis": f"助手执行 {percent(assistant_execution_ratio)}" if assistant_execution_ratio else "缺少助手执行占比",
            "ratingImpact": "决定六品、七品能否成立；高段位必须看到人的系统级决策。",
            "risk": "用户决策占比偏低，容易被封顶五品。" if user_decision_ratio < 0.03 else "用户决策足以支撑更高段位复核。",
        },
        {
            "id": "validation_loop",
            "label": "验证闭环",
            "value": percent(validation_density),
            "signal": f"{int(hard_stats.get('validation_count') or 0)} 条验证信号",
            "basis": f"{established_dimensions}/6 个维度成立",
            "ratingImpact": "验证不足会压住六品；测试、构建、lint、截图和人工验收是主要证据。",
            "risk": "未看到验证闭环，系统结果不可托付。" if validation_density <= 0 else "有验证信号，但仍要看是否由人定义验收标准。",
        },
        {
            "id": "efficiency_risk",
            "label": "效率风险",
            "value": percent(bug_loop_density),
            "signal": f"{int(hard_stats.get('bug_loop_count') or 0)} 条 Bug 循环信号",
            "basis": f"弱信号占比 {percent(weak_signal_ratio)}" if weak_signal_ratio else "缺少弱信号占比",
            "ratingImpact": "返工和弱信号不直接扣分，但会解释为什么系统归属不稳。",
            "risk": "返工压力高，可能仍停在局部 patch 循环。" if bug_loop_density >= 0.08 else "没有明显困在修补循环。",
        },
    ]


def build_stat_evidence(hard_stats: dict[str, Any], rank_level: int, rank_label: str) -> dict[str, Any]:
    active_days = int(hard_stats.get("active_days") or 0)
    source_count = int(hard_stats.get("source_count") or 0)
    analyzed = int(hard_stats.get("analyzed_record_count") or 0)
    promotion_record_count = int(hard_stats.get("promotion_record_count") or 0)
    strong_record_density = float(hard_stats.get("strong_record_density") or 0)
    signal_coverage_ratio = float(hard_stats.get("signal_coverage_ratio") or 0)
    established_dimensions = int(hard_stats.get("established_dimension_count") or 0)
    user_control_ratio = float(hard_stats.get("user_control_ratio") or 0)
    user_decision_ratio = float(hard_stats.get("promotion_user_decision_ratio") or hard_stats.get("user_decision_ratio") or 0)
    validation_density = float(hard_stats.get("validation_density") or 0)
    assistant_execution_ratio = float(hard_stats.get("promotion_assistant_execution_ratio") or 0)
    bug_loop_density = float(hard_stats.get("bug_loop_density") or 0)
    peak_day_share = float(hard_stats.get("peak_day_token_share") or 0)
    total_tokens = int(hard_stats.get("total_tokens") or 0)
    positive_signals: list[str] = []
    risk_signals: list[str] = []
    investment_signals: list[str] = []
    support_level = 3

    if active_days >= 5 or source_count >= 3:
        positive_signals.append(f"样本跨 {active_days or '未知'} 天、{source_count or '未知'} 个来源，稳定性好于单次高光。")
    elif analyzed < 20 or source_count < 2:
        risk_signals.append(f"样本只有 {analyzed} 条有效记录、{source_count} 个来源，高段位置信度不足。")

    if user_decision_ratio >= 0.08:
        positive_signals.append(f"用户决策 {percent(user_decision_ratio)}，达到七品复核线。")
    elif user_decision_ratio >= 0.03:
        positive_signals.append(f"用户决策 {percent(user_decision_ratio)}，可支撑六品复核。")
    else:
        risk_signals.append(f"用户决策 {percent(user_decision_ratio)}，系统级取舍证据不足。")

    if user_control_ratio >= 0.1:
        positive_signals.append(f"主动控制 {percent(user_control_ratio)}，人在定义目标、边界、架构和验收。")
    elif 0 < user_control_ratio < 0.05:
        risk_signals.append(f"主动控制 {percent(user_control_ratio)}，高阶信号容易被助手自述稀释。")

    if validation_density >= 0.08:
        positive_signals.append(f"验证密度 {percent(validation_density)}，结果有可托付证据。")
    elif validation_density < 0.03:
        risk_signals.append(f"验证密度 {percent(validation_density)}，闭环不足会压住六品。")

    if established_dimensions >= 5 and signal_coverage_ratio >= 0.5:
        positive_signals.append(f"成立维度 {established_dimensions}/6、信号覆盖 {percent(signal_coverage_ratio)}，能力结构较完整。")
    elif established_dimensions < 4:
        risk_signals.append(f"成立维度 {established_dimensions}/6，系统能力结构还不完整。")

    if strong_record_density >= 0.1:
        positive_signals.append(f"强记录占比 {percent(strong_record_density)}，可复核高阶证据足够厚。")
    elif strong_record_density < 0.05 or promotion_record_count < 4:
        risk_signals.append(f"强记录占比 {percent(strong_record_density)}、高阶记录 {promotion_record_count} 条，高段位证据偏薄。")

    if assistant_execution_ratio >= 0.7:
        risk_signals.append(f"助手执行 {percent(assistant_execution_ratio)}，需要确认高阶结论不是 AI 自述完成。")
    if bug_loop_density >= 0.08:
        risk_signals.append(f"返工压力 {percent(bug_loop_density)}，可能仍困在局部 patch 循环。")
    if peak_day_share >= 0.5:
        risk_signals.append(f"峰值日 token 占比 {percent(peak_day_share)}，投入集中会削弱稳定性判断。")

    if total_tokens:
        if total_tokens >= 100000000:
            token_text = f"{total_tokens / 100000000:.1f}亿"
        elif total_tokens >= 10000:
            token_text = f"{round(total_tokens / 10000)}万"
        else:
            token_text = str(total_tokens)
        investment_signals.append(f"总 token {token_text}")
    if hard_stats.get("peak_day_tokens"):
        investment_signals.append(f"峰值日 {hard_stats.get('peak_day_tokens')} token")

    if (
        user_decision_ratio >= 0.08
        and user_control_ratio >= 0.1
        and validation_density >= 0.08
        and established_dimensions >= 5
        and strong_record_density >= 0.08
        and source_count >= 3
    ):
        support_level = 7
    elif (
        user_decision_ratio >= 0.03
        and user_control_ratio >= 0.05
        and validation_density > 0
        and established_dimensions >= 4
        and promotion_record_count >= 4
    ):
        support_level = 6
    elif validation_density > 0 and established_dimensions >= 3:
        support_level = 5
    elif user_control_ratio > 0 or validation_density > 0:
        support_level = 4

    if len(risk_signals) >= 3 or strong_record_density < 0.05 or user_decision_ratio < 0.03 or assistant_execution_ratio >= 0.7:
        confidence_impact = "降低置信度并可能封顶"
    elif risk_signals:
        confidence_impact = "局部降低置信度"
    else:
        confidence_impact = "提高置信度"

    label = "硬统计支撑"
    if support_level >= rank_level:
        label = "硬统计支撑当前段位"
    elif support_level < rank_level:
        label = "硬统计低于当前段位"

    if support_level >= rank_level:
        conclusion = f"数字侧能支撑{rank_label}的可信度，但不会单独升品。"
    else:
        conclusion = f"数字侧最多稳定支撑到{rank_level_name(support_level)}，当前段位需要依赖行为证据和 AI 深度复核。"

    return {
        "id": "supports_current_rank" if support_level >= rank_level else "caps_confidence",
        "label": label,
        "supportLevel": support_level,
        "supportLabel": f"{rank_level_name(support_level)}统计支撑",
        "confidenceImpact": confidence_impact,
        "conclusion": conclusion,
        "positiveSignals": positive_signals[:4],
        "riskSignals": risk_signals[:4],
        "investmentSignals": investment_signals[:3],
        "ratingUse": "硬统计用于支撑置信度、解释封顶和定位下一步；token 和成本只说明投入强度，不能直接升品。",
    }


def build_stat_profile(hard_stats: dict[str, Any]) -> dict[str, Any]:
    total_tokens = int(hard_stats.get("total_tokens") or 0)
    active_days = int(hard_stats.get("active_days") or 0)
    promotion_record_count = int(hard_stats.get("promotion_record_count") or 0)
    established_dimensions = int(hard_stats.get("established_dimension_count") or 0)
    stable_dimensions = int(hard_stats.get("stable_dimension_count") or 0)
    user_control_ratio = float(hard_stats.get("user_control_ratio") or 0)
    user_decision_ratio = float(hard_stats.get("promotion_user_decision_ratio") or 0)
    assistant_execution_ratio = float(hard_stats.get("promotion_assistant_execution_ratio") or 0)
    validation_density = float(hard_stats.get("validation_density") or 0)
    strong_record_density = float(hard_stats.get("strong_record_density") or 0)
    signal_coverage_ratio = float(hard_stats.get("signal_coverage_ratio") or 0)
    bug_loop_density = float(hard_stats.get("bug_loop_density") or 0)
    peak_day_share = float(hard_stats.get("peak_day_token_share") or 0)
    weak_signal_ratio = float(hard_stats.get("weak_signal_ratio") or 0)
    reasons: list[str] = []
    matched_rules: list[dict[str, str]] = []

    def add_reason(metric: str, observed: str, threshold: str, interpretation: str) -> None:
        reasons.append(f"{metric} {observed}，{interpretation}")
        matched_rules.append(
            {
                "metric": metric,
                "observed": observed,
                "threshold": threshold,
                "interpretation": interpretation,
            }
        )

    if user_decision_ratio >= 0.12:
        add_reason("用户决策", percent(user_decision_ratio), ">=12%", "用户系统级取舍足够强。")
    elif user_decision_ratio >= 0.08:
        add_reason("用户决策", percent(user_decision_ratio), ">=8%", "达到七品复核线。")
    elif user_decision_ratio < 0.05:
        add_reason("用户决策", percent(user_decision_ratio), "<5%", "人在控证据偏弱。")

    if validation_density >= 0.08:
        add_reason("验证密度", percent(validation_density), ">=8%", "结果有可托付证据。")
    elif validation_density < 0.03:
        add_reason("验证密度", percent(validation_density), "<3%", "验证闭环偏弱。")

    if established_dimensions >= 5:
        add_reason("成立维度", f"{established_dimensions}/6", ">=5/6", "能力结构比较完整。")
    elif established_dimensions >= 4:
        add_reason("成立维度", f"{established_dimensions}/6", ">=4/6", "有系统化线索但还需验证。")

    if total_tokens >= 500_000:
        add_reason("token 投入", f"{round(total_tokens / 10000)}万", ">=50万", "AI 使用强度很高。")

    if bug_loop_density >= 0.08:
        add_reason("返工压力", percent(bug_loop_density), ">=8%", "容易陷入局部修补循环。")
    if weak_signal_ratio >= 0.35:
        add_reason("弱信号", percent(weak_signal_ratio), ">=35%", "Demo、片段或修补占比偏高。")
    if peak_day_share >= 0.5:
        add_reason("峰值日 token", percent(peak_day_share), ">=50%", "投入集中在少数日期。")
    if strong_record_density < 0.05:
        add_reason("强记录", percent(strong_record_density), "<5%", "高阶强证据偏薄。")
    elif strong_record_density >= 0.1:
        add_reason("强记录", percent(strong_record_density), ">=10%", "有可复核的高阶证据。")

    if user_decision_ratio >= 0.12 and validation_density >= 0.08 and established_dimensions >= 5:
        profile_id = "system_owner"
        label = "系统拥有型"
        summary = "硬统计显示，人类决策、验证闭环和多维能力同时成立；这类样本更像人在拥有系统，而不是 AI 自述完成。"
    elif total_tokens >= 500_000 and user_decision_ratio < 0.05:
        profile_id = "ai_labor_dependent"
        label = "AI 代工依赖型"
        summary = "token 投入很高，但用户决策占比偏低；这说明 AI 很忙，不等于人真正拥有系统。"
    elif validation_density < 0.03 and established_dimensions >= 4:
        profile_id = "architecture_floating"
        label = "架构悬浮型"
        summary = "目标、边界或架构线索不少，但验证闭环偏弱；系统看起来被设计了，但还没有被可靠托付。"
    elif bug_loop_density >= 0.08 or weak_signal_ratio >= 0.35:
        profile_id = "rework_trapped"
        label = "返工消耗型"
        summary = "弱信号、Demo 或修补循环占比较高；这类样本容易证明努力很多，却难证明系统归属稳定。"
    elif peak_day_share >= 0.5 and active_days <= 2:
        profile_id = "burst_operator"
        label = "爆量冲刺型"
        summary = "token 明显集中在少数日期，更像一次冲刺高光；需要跨天复用来证明稳定能力。"
    elif strong_record_density < 0.05 or promotion_record_count < 4:
        profile_id = "thin_evidence"
        label = "证据偏薄型"
        summary = "可评分记录或强记录偏少；当前更适合低置信度初筛，不适合直接判断高段位。"
    else:
        profile_id = "balanced_operator"
        label = "均衡推进型"
        summary = "投入、样本、验证和控制力没有明显单点失衡；段位主要取决于证据链能否继续补强。"

    if user_decision_ratio >= 0.08:
        control_reading = "用户决策占比达到七品复核线，能支撑“人在控”的判断。"
    elif user_decision_ratio >= 0.03:
        control_reading = "用户决策占比能支撑六品复核，但进入七品仍需更多系统级取舍。"
    else:
        control_reading = "用户决策占比偏低，高阶结论容易被助手执行痕迹稀释。"

    if validation_density >= 0.08:
        validation_reading = "验证密度较好，系统结果有可托付证据。"
    elif validation_density > 0:
        validation_reading = "有验证信号，但密度不足，需要确认是否由人定义验收标准。"
    else:
        validation_reading = "未看到验证闭环，不能证明结果可托付。"

    if peak_day_share >= 0.5:
        investment_reading = "token 投入单日集中，稳定性需要打折。"
    elif total_tokens > 0:
        investment_reading = "token 投入能说明 AI 使用强度，但不会直接抬高段位。"
    else:
        investment_reading = "未读取到 token 统计，投入强度无法量化。"

    if strong_record_density >= 0.1 and signal_coverage_ratio >= 0.5:
        evidence_reading = "强记录和信号覆盖足以支撑较高置信度复核。"
    elif strong_record_density >= 0.05:
        evidence_reading = "强记录存在，但覆盖还不够厚，需要更多不同任务证据。"
    else:
        evidence_reading = "强记录偏薄，自动初筛应保守。"

    return {
        "id": profile_id,
        "label": label,
        "summary": summary,
        "controlReading": control_reading,
        "validationReading": validation_reading,
        "investmentReading": investment_reading,
        "evidenceReading": evidence_reading,
        "riskLevel": "high" if profile_id in {"ai_labor_dependent", "architecture_floating", "rework_trapped", "thin_evidence"} else "medium" if profile_id == "burst_operator" else "low",
        "ratingUse": "统计画像用于解释置信度、封顶和下一步，不直接升品。",
        "reasons": reasons[:4],
        "matchedRules": matched_rules[:4],
        "signals": [
            f"用户决策 {percent(user_decision_ratio)}",
            f"主动控制 {percent(user_control_ratio)}",
            f"助手执行 {percent(assistant_execution_ratio)}",
            f"验证密度 {percent(validation_density)}",
            f"强记录 {percent(strong_record_density)}",
            f"成立维度 {established_dimensions}/6",
            f"稳定维度 {stable_dimensions}/6",
            f"峰值日 token {percent(peak_day_share)}",
        ],
    }


def exclusion_reason(record: dict[str, Any], patterns: list[tuple[str, re.Pattern[str]]]) -> str | None:
    role = str(record.get("role", "")).strip().lower()
    if role in EXCLUDED_ROLES:
        return f"role:{role}"

    text = str(record.get("text", ""))
    for name, pattern in patterns:
        if pattern.search(text):
            return name

    return None


def choose_rank(
    counts: Counter[str],
    total_records: int,
    source_count: int,
    strong_evidence_count: int,
    promotion_evidence_count: int,
    promotion_record_count: int,
    user_control_record_count: int,
    user_control_sources: int,
    promotion_user_decision_ratio: float,
    method_replication_status: str,
    allow_team_rank: bool = False,
) -> tuple[int, str, list[str], dict[str, Any]]:
    caps: list[str] = []
    unlocks: dict[str, Any] = {
        "level8": {
            "unlocked": False,
            "label": RANKS[8][1],
            "reason": "八品需要团队级方法复制强证据，自动初筛默认不会仅凭私有会话放行。",
        },
        "level9": {
            "unlocked": False,
            "label": RANKS[9][1],
            "reason": "九品需要公开范式影响证据，不能仅凭私有会话自动判定。",
        },
    }
    if total_records == 0:
        return 0, RANKS[0][1], ["没有可分析记录。"], unlocks

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
    has_team_candidate = has_team and has_workflow
    has_strong_team = counts["team_system"] >= 3 and counts["workflow_asset"] >= 3
    if allow_team_rank and has_strong_team and method_replication_status in {"成立", "稳定"}:
        level = max(level, 8)
        unlocks["level8"] = {
            "unlocked": True,
            "label": RANKS[8][1],
            "reason": "检测到多条团队方法和工作流沉淀证据；仍建议由 AI 判定官复核是否真的被他人复用。",
        }

    if level >= 7 and not has_ownership:
        level = 6
        caps.append("缺少系统接管、关键路径解释、上线/回滚/维护等 ownership 证据。")
    if level >= 6 and not has_validation:
        level = 5
        caps.append("缺少测试、构建、lint、回归或人工验收证据。")
    if level >= 5 and not has_architecture:
        level = 4
        caps.append("缺少架构、模块边界、数据/权限/生产边界证据。")
    if level >= 8 and not has_strong_team:
        level = 7
        caps.append("缺少团队级方法复制强证据，暂不判定八品。")
    if level >= 8 and not allow_team_rank:
        level = 7
        caps.append("自动初筛最高只确认到七品；八品需要单独复核团队复制证据。")
    if level < 8 and has_team_candidate:
        caps.append("出现团队/工作流候选信号，但还不能证明方法被他人稳定复用，八品未解锁。")
    if method_replication_status not in {"成立", "稳定"}:
        caps.append("方法复制维度仍是线索，不能证明团队或社区已经稳定复用你的协作方法。")
    if level >= 7 and not has_workflow:
        caps.append("缺少可复用 rules、skill、workflow 或检查点资产，七品以上证据不够稳。")
    if level >= 7 and (total_records < 20 or source_count < 3 or strong_evidence_count < 8):
        level = 6
        caps.append("七品需要跨多次会话的稳定系统归属证据；当前样本太薄，自动初筛先封顶六品。")
    if level >= 7 and (user_control_record_count < 8 or user_control_sources < 3):
        level = 6
        caps.append("七品需要多次用户主动定义边界、架构、验证或归属；当前更多是助手执行痕迹。")
    if level >= 7 and ratio(user_control_record_count, promotion_record_count) < 0.1:
        level = 6
        caps.append("七品需要用户主动控制证据占比足够高；当前高阶信号主要来自助手执行或总结，自动初筛先封顶六品。")
    if level >= 7 and promotion_user_decision_ratio < 0.08:
        level = 6
        caps.append("七品需要足够用户决策证据；当前高阶证据里用户真正做边界、架构、验收或取舍的比例不足。")
    if level >= 6 and (total_records < 8 or source_count < 2 or promotion_record_count < 4):
        level = 5
        caps.append("六品需要问题定义、架构、验证、交付闭环在多条记录中成立；当前证据跨度不够。")
    if level >= 6 and (user_control_record_count < 4 or user_control_sources < 2):
        level = 5
        caps.append("六品需要足够用户主动控制证据；不能只用助手完成测试、构建或总结来升品。")
    if level >= 6 and ratio(user_control_record_count, promotion_record_count) < 0.05:
        level = 5
        caps.append("六品需要用户主动控制在高阶证据里占一定比例；当前更多是 AI 自述完成，不能证明你稳定拥有系统。")
    if level >= 6 and promotion_user_decision_ratio < 0.03:
        level = 5
        caps.append("六品需要用户决策证据占一定比例；普通指令或助手执行痕迹不能替代系统级决策。")
    if level < 8 and unlocks["level8"]["unlocked"]:
        unlocks["level8"] = {
            "unlocked": False,
            "label": RANKS[8][1],
            "reason": "存在团队复制候选证据，但受样本跨度或强证据封顶规则限制，八品未解锁。",
        }

    caps.append("九品 · 大宗师 需要公开范式影响证据，不能仅凭私有会话自动判定。")
    return level, RANKS[level][1], caps, unlocks


def gate(
    gate_id: str,
    level: int,
    label: str,
    passed: bool,
    observed: Any,
    required: Any,
    reason: str,
) -> dict[str, Any]:
    return {
        "id": gate_id,
        "level": level,
        "label": label,
        "passed": bool(passed),
        "observed": observed,
        "required": required,
        "reason": reason,
    }


def build_rank_gates(
    counts: Counter[str],
    total_records: int,
    source_count: int,
    strong_evidence_count: int,
    promotion_evidence_count: int,
    promotion_record_count: int,
    user_control_record_count: int,
    user_control_source_count: int,
    promotion_user_decision_ratio: float,
    method_replication_status: str,
    allow_team_rank: bool,
) -> list[dict[str, Any]]:
    user_control_ratio = ratio(user_control_record_count, promotion_record_count)
    has_architecture = counts["architecture"] > 0
    has_validation = counts["validation"] > 0
    has_ownership = counts["ownership"] > 0
    has_workflow = counts["workflow_asset"] > 0
    has_team_candidate = counts["team_system"] > 0 and counts["workflow_asset"] > 0
    has_strong_team = counts["team_system"] >= 3 and counts["workflow_asset"] >= 3
    return [
        gate(
            "level5_architecture",
            5,
            "五品架构门槛",
            has_architecture,
            counts["architecture"],
            "architecture > 0",
            "五品以上需要架构、模块边界、数据/权限/生产边界证据。",
        ),
        gate(
            "level6_validation",
            6,
            "六品验证闭环",
            has_validation,
            counts["validation"],
            "validation > 0",
            "六品以上需要测试、构建、lint、回归或人工验收证据。",
        ),
        gate(
            "level6_evidence_span",
            6,
            "六品证据跨度",
            total_records >= 8 and source_count >= 2 and promotion_record_count >= 4,
            {
                "analyzed_records": total_records,
                "source_count": source_count,
                "promotion_record_count": promotion_record_count,
            },
            {"analyzed_records": 8, "source_count": 2, "promotion_record_count": 4},
            "六品需要问题定义、架构、验证、交付闭环在多条记录中成立。",
        ),
        gate(
            "level6_user_control_ratio",
            6,
            "六品主动控制占比",
            user_control_record_count >= 4 and user_control_source_count >= 2 and user_control_ratio >= 0.05,
            {
                "user_control_record_count": user_control_record_count,
                "user_control_source_count": user_control_source_count,
                "user_control_ratio": user_control_ratio,
            },
            {"user_control_record_count": 4, "user_control_source_count": 2, "user_control_ratio": 0.05},
            "六品需要足够用户主动控制，不能只用助手完成测试、构建或总结来升品。",
        ),
        gate(
            "level6_user_decision_ratio",
            6,
            "六品用户决策占比",
            promotion_user_decision_ratio >= 0.03,
            promotion_user_decision_ratio,
            0.03,
            "六品需要用户决策证据占一定比例，普通指令不能替代系统级决策。",
        ),
        gate(
            "level7_ownership",
            7,
            "七品系统归属",
            has_ownership,
            counts["ownership"],
            "ownership > 0",
            "七品需要系统接管、关键路径解释、上线、回滚或维护证据。",
        ),
        gate(
            "level7_evidence_span",
            7,
            "七品稳定跨度",
            total_records >= 20 and source_count >= 3 and strong_evidence_count >= 8,
            {
                "analyzed_records": total_records,
                "source_count": source_count,
                "strong_evidence_count": strong_evidence_count,
            },
            {"analyzed_records": 20, "source_count": 3, "strong_evidence_count": 8},
            "七品需要跨多次会话的稳定系统归属证据。",
        ),
        gate(
            "level7_user_control_ratio",
            7,
            "七品主动控制占比",
            user_control_record_count >= 8 and user_control_source_count >= 3 and user_control_ratio >= 0.1,
            {
                "user_control_record_count": user_control_record_count,
                "user_control_source_count": user_control_source_count,
                "user_control_ratio": user_control_ratio,
            },
            {"user_control_record_count": 8, "user_control_source_count": 3, "user_control_ratio": 0.1},
            "七品需要多次用户主动定义边界、架构、验证或归属。",
        ),
        gate(
            "level7_user_decision_ratio",
            7,
            "七品用户决策占比",
            promotion_user_decision_ratio >= 0.08,
            promotion_user_decision_ratio,
            0.08,
            "七品需要足够用户决策证据，证明人真正做边界、架构、验收或取舍。",
        ),
        gate(
            "level7_workflow_asset",
            7,
            "七品工作流资产",
            has_workflow,
            counts["workflow_asset"],
            "workflow_asset > 0",
            "七品以上证据需要可复用 rules、skill、workflow 或检查点资产。",
        ),
        gate(
            "level8_team_replication",
            8,
            "八品团队复制",
            allow_team_rank and has_strong_team and method_replication_status in {"成立", "稳定"},
            {
                "team_system": counts["team_system"],
                "workflow_asset": counts["workflow_asset"],
                "method_replication_status": method_replication_status,
                "allow_team_rank": allow_team_rank,
            },
            {"team_system": 3, "workflow_asset": 3, "method_replication_status": "成立|稳定"},
            "八品需要团队方法复制强证据，自动初筛默认不会仅凭私有会话放行。",
        ),
        gate(
            "level8_team_candidate",
            8,
            "八品候选线索",
            has_team_candidate,
            {"team_system": counts["team_system"], "workflow_asset": counts["workflow_asset"]},
            {"team_system": ">0", "workflow_asset": ">0"},
            "团队和工作流同时出现只是八品候选线索，还需证明被他人稳定复用。",
        ),
        gate(
            "level9_public_influence",
            9,
            "九品公开影响",
            False,
            "private_session_only",
            "public paradigm evidence",
            "九品需要公开范式影响证据，不能仅凭私有会话自动判定。",
        ),
    ]


def confidence(total_records: int, signal_total: int, strong_evidence_count: int) -> str:
    if total_records < 10 or signal_total < 5 or strong_evidence_count < 2:
        return "low"
    if total_records < 50 or signal_total < 20 or strong_evidence_count < 8:
        return "medium"
    return "high"


def score_for(level: int, counts: Counter[str], total_records: int) -> int:
    low, high = SCORE_BANDS[level]
    if level == 0:
        return 0
    coverage = sum(1 for signal in SIGNALS if counts[signal] > 0)
    density = min(5, sum(counts.values()) // 8)
    record_bonus = 1 if total_records >= 50 else 0
    value = low + min(high - low, coverage + density + record_bonus)
    if level <= 7:
        return min(value, SCORE_BANDS[7][1])
    return value


def evidence_card(record: dict[str, Any], signal: str, text: str) -> dict[str, Any]:
    meta = SIGNAL_META[signal]
    behavior_class = classify_behavior(record, text, [signal])
    return {
        "signal": signal,
        "evidence_type": meta["type"],
        "dimension": meta["dimension"],
        "actor": str(record.get("role", "unknown")),
        "behavior_class": behavior_class,
        "behavior_class_label": BEHAVIOR_CLASSES.get(behavior_class, BEHAVIOR_CLASSES["other"]),
        "behavior": snippet(text, 96),
        "proves": meta["proves"],
        "supports_levels": meta["supports_levels"],
        "strength": meta["strength"],
        "source": record_source(record),
        "session": source_session(record),
        "snippet": snippet(text),
        "usable_for_promotion": signal not in {"snippet_generation", "demo_generation", "bug_loop", "team_system"},
    }


def weak_signal_card(record: dict[str, Any], signal: str, text: str) -> dict[str, Any]:
    meta = SIGNAL_META[signal]
    behavior_class = classify_behavior(record, text, [signal])
    return {
        "signal": signal,
        "evidence_type": meta["type"],
        "behavior_class": behavior_class,
        "behavior_class_label": BEHAVIOR_CLASSES.get(behavior_class, BEHAVIOR_CLASSES["other"]),
        "reason": "只能说明使用习惯或局部行为，不能单独用于升品。",
        "source": record_source(record),
        "session": source_session(record),
        "snippet": snippet(text),
    }


def dimension_status(evidence_count: int, strong_count: int, source_count: int) -> tuple[str, int]:
    if evidence_count == 0:
        return "缺失", 0
    if strong_count >= 5 and source_count >= 3:
        return "稳定", 85
    if strong_count >= 2 and source_count >= 2:
        return "成立", 65
    return "线索", 35


def build_dimension_profile(
    counts: Counter[str],
    strong_counts: Counter[str],
    signal_sources: dict[str, set[str]],
) -> list[dict[str, Any]]:
    profile: list[dict[str, Any]] = []
    for dimension in DIMENSIONS:
        signals = set(dimension["signals"])
        strong_count = sum(strong_counts[signal] for signal in signals)
        sessions = set()
        for signal in signals:
            sessions.update(signal_sources.get(signal, set()))
        evidence_count = sum(counts[signal] for signal in signals)
        status, score = dimension_status(evidence_count, strong_count, len(sessions))
        profile.append(
            {
                "id": dimension["id"],
                "label": dimension["label"],
                "question": dimension["question"],
                "signals": sorted(signals),
                "evidence_count": evidence_count,
                "strong_evidence_count": strong_count,
                "source_count": len(sessions),
                "status": status,
                "score": score,
            }
        )
    return profile


def main() -> int:
    args = parse_args()
    records = load_records(Path(args.input))
    usage_stats = build_usage_stats(records)
    patterns = compile_patterns()
    excluded_patterns = compile_excluded_patterns()
    counts: Counter[str] = Counter()
    excluded_reasons: Counter[str] = Counter()
    evidence: dict[str, list[dict[str, str]]] = defaultdict(list)
    evidence_cards: list[dict[str, Any]] = []
    weak_signals: list[dict[str, Any]] = []
    analyzed_sources: set[str] = set()
    analyzed_days: set[str] = set()
    strong_counts: Counter[str] = Counter()
    promotion_counts: Counter[str] = Counter()
    signal_sources: dict[str, set[str]] = defaultdict(set)
    strong_signal_sources: dict[str, set[str]] = defaultdict(set)
    behavior_counts: Counter[str] = Counter()
    promotion_signal_behavior_counts: Counter[str] = Counter()
    promotion_record_behavior_counts: Counter[str] = Counter()
    promotion_record_count = 0
    strong_evidence_records: set[str] = set()
    user_control_signal_count = 0
    user_control_record_count = 0
    user_control_sources: set[str] = set()

    for record_index, record in enumerate(records):
        text = str(record.get("text", ""))
        role = str(record.get("role", "unknown"))
        reason = exclusion_reason(record, excluded_patterns)
        if reason:
            excluded_reasons[reason] += 1
            continue
        session = source_session(record)
        analyzed_sources.add(session)
        analyzed_days.add(source_day(record))
        signals = detect_signals(text, patterns)
        behavior_class = classify_behavior(record, text, signals)
        behavior_counts[behavior_class] += 1
        promotion_signals = [signal for signal in signals if is_promotion_signal(signal)]
        if promotion_signals:
            promotion_record_count += 1
            promotion_record_behavior_counts[behavior_class] += 1
            if is_user_role(role):
                user_control_record_count += 1
                user_control_sources.add(session)
        for signal in signals:
            counts[signal] += 1
            signal_sources[signal].add(session)
            meta = SIGNAL_META[signal]
            if is_promotion_signal(signal):
                promotion_counts[signal] += 1
                promotion_signal_behavior_counts[behavior_class] += 1
                if is_user_role(role):
                    user_control_signal_count += 1
            if meta["strength"] == "强" and is_promotion_signal(signal):
                strong_counts[signal] += 1
                strong_signal_sources[signal].add(session)
                strong_evidence_records.add(f"{session}:{record_index}")
            if len(evidence[signal]) < args.max_evidence:
                evidence[signal].append(
                    {
                        "source": record_source(record),
                        "role": role,
                        "snippet": snippet(text),
                    }
                )
            if meta["strength"] == "弱":
                if len(weak_signals) < args.max_evidence * 4:
                    weak_signals.append(weak_signal_card(record, signal, text))
                continue
            if len(evidence_cards) < args.max_evidence * 8:
                evidence_cards.append(evidence_card(record, signal, text))

    excluded_total = sum(excluded_reasons.values())
    analyzed_record_count = len(records) - excluded_total
    signal_total = sum(counts.values())
    strong_evidence_count = sum(strong_counts.values())
    strong_evidence_record_count = len(strong_evidence_records)
    promotion_evidence_count = sum(promotion_counts.values())
    dimension_profile = build_dimension_profile(counts, strong_counts, signal_sources)
    source_count = len(analyzed_sources)
    user_control_source_count = len(user_control_sources)
    promotion_record_behavior_total = sum(promotion_record_behavior_counts.values())
    promotion_user_decision_ratio = ratio(
        promotion_record_behavior_counts.get("user_decision", 0),
        promotion_record_behavior_total,
    )
    hard_stats = build_hard_stats(
        len(records),
        analyzed_record_count,
        excluded_total,
        excluded_reasons,
        source_count,
        signal_total,
        strong_evidence_count,
        promotion_evidence_count,
        promotion_record_count,
        strong_evidence_record_count,
        user_control_signal_count,
        user_control_record_count,
        user_control_source_count,
        usage_stats,
        counts,
        strong_counts,
        strong_signal_sources,
        dimension_profile,
        analyzed_days,
        behavior_counts,
        promotion_signal_behavior_counts,
        promotion_record_behavior_counts,
    )
    method_replication_status = next(
        (
            item["status"]
            for item in dimension_profile
            if item.get("id") == "method_replication"
        ),
        "缺失",
    )
    rank_gates = build_rank_gates(
        counts,
        analyzed_record_count,
        source_count,
        strong_evidence_count,
        promotion_evidence_count,
        promotion_record_count,
        user_control_record_count,
        user_control_source_count,
        promotion_user_decision_ratio,
        method_replication_status,
        args.allow_team_rank,
    )
    level, label, caps, unlocks = choose_rank(
        counts,
        analyzed_record_count,
        source_count,
        strong_evidence_count,
        promotion_evidence_count,
        promotion_record_count,
        user_control_record_count,
        user_control_source_count,
        promotion_user_decision_ratio,
        method_replication_status,
        args.allow_team_rank,
    )
    quality_flags = build_quality_flags(hard_stats)
    drag_factors = build_drag_factors(counts, hard_stats)
    metric_group_rows = metric_groups(hard_stats, usage_stats)
    stat_profile = build_stat_profile(hard_stats)
    stat_evidence = build_stat_evidence(hard_stats, level, label)
    if excluded_total:
        caps.insert(0, excluded_note(excluded_reasons))
    score = score_for(level, counts, analyzed_record_count)
    preliminary_rank = {
        "level": level,
        "label": label,
        "score": score,
        "confidence": confidence(analyzed_record_count, signal_total, strong_evidence_count),
        "is_final": False,
        "mode": "自动初筛",
        "max_auto_level": 7 if not args.allow_team_rank else 8,
    }
    summary = {
        "analysis_version": "0.2",
        "judgment_mode": "自动初筛",
        "is_final": False,
        "record_count": len(records),
        "analyzed_record_count": analyzed_record_count,
        "excluded_record_count": excluded_total,
        "excluded_reason_counts": dict(sorted(excluded_reasons.items())),
        "signal_count": signal_total,
        "signal_counts": dict(sorted(counts.items())),
        "strong_signal_counts": dict(sorted(strong_counts.items())),
        "promotion_signal_counts": dict(sorted(promotion_counts.items())),
        "strong_evidence_count": strong_evidence_count,
        "promotion_evidence_count": promotion_evidence_count,
        "promotion_record_count": promotion_record_count,
        "strong_evidence_record_count": strong_evidence_record_count,
        "user_control_count": user_control_record_count,
        "user_control_record_count": user_control_record_count,
        "user_control_signal_count": user_control_signal_count,
        "user_control_source_count": user_control_source_count,
        "behavior_counts": dict(sorted(behavior_counts.items())),
        "promotion_behavior_counts": dict(sorted(promotion_record_behavior_counts.items())),
        "promotion_record_behavior_counts": dict(sorted(promotion_record_behavior_counts.items())),
        "promotion_signal_behavior_counts": dict(sorted(promotion_signal_behavior_counts.items())),
        "usage_stats": usage_stats,
        "hard_stats": hard_stats,
        "metric_groups": metric_group_rows,
        "stat_profile": stat_profile,
        "stat_evidence": stat_evidence,
        "source_count": source_count,
        "preliminary_rank": preliminary_rank,
        "heuristic_rank": preliminary_rank,
        "evidence": evidence,
        "evidence_cards": evidence_cards,
        "weak_signals": weak_signals,
        "dimension_profile": dimension_profile,
        "rank_gates": rank_gates,
        "rank_caps": caps,
        "quality_flags": quality_flags,
        "drag_factors": drag_factors,
        "unlock_status": unlocks,
        "quality_notes": [
            "脚本只做证据清洗和自动初筛，不是最终 AI 段位判定。",
            "八品需要团队方法被他人复用的强证据；九品需要公开范式影响证据。",
        ],
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote summary to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
