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

EXCLUDED_ROLES = {
    "system",
    "developer",
    "session_meta",
    "compacted",
}

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
    if allow_team_rank and has_strong_team:
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
    if level >= 7 and not has_workflow:
        caps.append("缺少可复用 rules、skill、workflow 或检查点资产，七品以上证据不够稳。")
    if level >= 7 and (total_records < 20 or source_count < 3 or strong_evidence_count < 8):
        level = 6
        caps.append("七品需要跨多次会话的稳定系统归属证据；当前样本太薄，自动初筛先封顶六品。")
    if level >= 6 and (total_records < 8 or source_count < 2 or promotion_evidence_count < 4):
        level = 5
        caps.append("六品需要问题定义、架构、验证、交付闭环在多条记录中成立；当前证据跨度不够。")
    if level < 8 and unlocks["level8"]["unlocked"]:
        unlocks["level8"] = {
            "unlocked": False,
            "label": RANKS[8][1],
            "reason": "存在团队复制候选证据，但受样本跨度或强证据封顶规则限制，八品未解锁。",
        }

    caps.append("九品 · 大宗师 需要公开范式影响证据，不能仅凭私有会话自动判定。")
    return level, RANKS[level][1], caps, unlocks


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
    return {
        "signal": signal,
        "evidence_type": meta["type"],
        "dimension": meta["dimension"],
        "actor": str(record.get("role", "unknown")),
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
    return {
        "signal": signal,
        "evidence_type": meta["type"],
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
    evidence_cards: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    profile: list[dict[str, Any]] = []
    for dimension in DIMENSIONS:
        signals = set(dimension["signals"])
        cards = [card for card in evidence_cards if card.get("signal") in signals]
        strong_count = sum(
            1
            for card in cards
            if card.get("strength") == "强" and card.get("usable_for_promotion")
        )
        sessions = {str(card.get("session", "")) for card in cards if card.get("session")}
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
    patterns = compile_patterns()
    excluded_patterns = compile_excluded_patterns()
    counts: Counter[str] = Counter()
    excluded_reasons: Counter[str] = Counter()
    evidence: dict[str, list[dict[str, str]]] = defaultdict(list)
    evidence_cards: list[dict[str, Any]] = []
    weak_signals: list[dict[str, Any]] = []
    analyzed_sources: set[str] = set()

    for record in records:
        text = str(record.get("text", ""))
        role = str(record.get("role", "unknown"))
        reason = exclusion_reason(record, excluded_patterns)
        if reason:
            excluded_reasons[reason] += 1
            continue
        analyzed_sources.add(source_session(record))
        signals = detect_signals(text, patterns)
        for signal in signals:
            counts[signal] += 1
            if len(evidence[signal]) < args.max_evidence:
                evidence[signal].append(
                    {
                        "source": record_source(record),
                        "role": role,
                        "snippet": snippet(text),
                    }
                )
            meta = SIGNAL_META[signal]
            if meta["strength"] == "弱":
                if len(weak_signals) < args.max_evidence * 4:
                    weak_signals.append(weak_signal_card(record, signal, text))
                continue
            if len(evidence_cards) < args.max_evidence * 8:
                evidence_cards.append(evidence_card(record, signal, text))

    excluded_total = sum(excluded_reasons.values())
    analyzed_record_count = len(records) - excluded_total
    signal_total = sum(counts.values())
    strong_evidence_count = sum(
        1
        for card in evidence_cards
        if card.get("strength") == "强" and card.get("usable_for_promotion")
    )
    promotion_evidence_count = sum(1 for card in evidence_cards if card.get("usable_for_promotion"))
    level, label, caps, unlocks = choose_rank(
        counts,
        analyzed_record_count,
        len(analyzed_sources),
        strong_evidence_count,
        promotion_evidence_count,
        args.allow_team_rank,
    )
    if excluded_total:
        caps.insert(0, f"已过滤 {excluded_total} 条系统提示、AGENTS 注入或压缩上下文；这些不计入能力评分。")
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
        "strong_evidence_count": strong_evidence_count,
        "promotion_evidence_count": promotion_evidence_count,
        "source_count": len(analyzed_sources),
        "preliminary_rank": preliminary_rank,
        "heuristic_rank": preliminary_rank,
        "evidence": evidence,
        "evidence_cards": evidence_cards,
        "weak_signals": weak_signals,
        "dimension_profile": build_dimension_profile(counts, evidence_cards),
        "rank_caps": caps,
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
