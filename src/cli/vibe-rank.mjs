#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, platform, tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const RANKS = [
  "零品 · 门外汉",
  "一品 · 初识真气",
  "二品 · 初窥门径",
  "三品 · 小有所成",
  "四品 · 登堂入室",
  "五品 · 炉火纯青",
  "六品 · 已有大成",
  "七品 · 已臻化境",
  "八品 · 半步宗师",
  "九品 · 大宗师",
];

const UPGRADE_PATHS = {
  0: ["先用 Codex 或 Claude Code 完成一个真实开发任务。"],
  1: ["从片段生成升级到完整任务：写清目标、非目标和验收标准。"],
  2: ["停止只追求 demo 能跑，补上测试、构建和关键路径解释。"],
  3: ["遇到反复修 bug 时先做根因分析，必要时重设边界或重构。"],
  4: ["把架构约束、验收 gate 和风险边界写进可复用规则。"],
  5: ["把一次成功交付沉淀成 workflow，让 AI 在检查点内自主推进。"],
  6: ["减少亲自审每一行代码，把审核逻辑系统化到测试、规则和 review gate。"],
  7: ["把个人方法复制给团队：playbook、skills、培训、评测和团队报告。"],
  8: ["形成公开范式影响：框架、文章、产品、社区案例或行业标准。"],
  9: ["持续定义新范式，并让行业围绕你的方法重新组织协作。"],
};

const RANK_REPORT_COPY = {
  0: {
    verdict: "你还没有进入 AI 编程协作场。",
    reason: "当前证据不足以证明你已经把 AI 放进真实开发流程。系统仍然主要靠你自己手写和搜索推进。",
    gap: "要进入一品，至少需要用 Codex、Claude Code 或类似工具完成一个真实开发任务，并留下可分析记录。",
  },
  1: {
    verdict: "你能让 AI 写片段，但系统还不是你的。",
    reason: "证据更像零散函数、正则、补全或局部代码生成。你获得了局部加速，但还没有表现出对完整任务边界和系统结果的控制。",
    gap: "要进入二品，需要让 AI 拼出可运行 demo 或完整功能雏形，而不只是生成片段。",
  },
  2: {
    verdict: "你能拼出能跑的东西，但结果控制力还弱。",
    reason: "证据显示你已经能让 AI 生成 demo 或页面，但主要关注点仍是能不能跑，缺少稳定验证和系统理解。",
    gap: "要进入三品，需要证明你能持续交付中等复杂度功能，而不只是一次性 demo。",
  },
  3: {
    verdict: "你能交付功能，但还容易陷在修 bug 循环里。",
    reason: "证据表明你可以推动 AI 完成任务，也会处理失败和报错。但系统判断更多停留在局部修复，架构边界和验证闭环还不稳。",
    gap: "要进入四品，需要在改代码前清楚定义目标、非目标、验收条件和文件边界。",
  },
  4: {
    verdict: "系统开始是你的，但还没有稳定形成架构驱动。",
    reason: "你已经开始用目标、边界和验收标准约束 AI，不再只是让它随便改。这个阶段的关键变化是你开始划定系统边界。",
    gap: "要进入五品，需要更稳定地体现架构判断、产品目标取舍和验证 gate。",
  },
  5: {
    verdict: "你已经在用架构和产品目标驱动 AI。",
    reason: "证据显示你不只追求代码能跑，而是在用模块边界、验收条件、验证手段和工作流约束 AI 交付。系统大体开始属于你。",
    gap: "要进入六品，需要证明你能从模糊问题出发，完成定义问题、设计系统、驱动交付的完整闭环。",
  },
  6: {
    verdict: "你已经形成从问题定义到系统交付的闭环。",
    reason: "你不是只在指挥 AI 写代码，而是在把目标、架构、验证和工作流连成一个系统。即使不亲手写每一行代码，你也开始拥有结果。",
    gap: "要进入七品，需要让审核、验证和架构判断更系统化，减少靠临场人工拉回方向。",
  },
  7: {
    verdict: "AI 已经接近成为你的系统延伸。",
    reason: "证据显示你的注意力已经从工具和代码细节上移到系统目标、质量和演进。你能让 AI 协助建系统，也能审视系统哪里应该被替换。",
    gap: "要进入八品，需要证明你的方法能被团队或社区复用，而不是只在你个人身上成立。",
  },
  8: {
    verdict: "你已经开始把个人方法变成团队方法。",
    reason: "证据显示你不只是自己会用 AI，而是在沉淀 playbook、rules、skills、workflow 或培训材料，让其他人也能复制你的协作方式。",
    gap: "要进入九品，需要公开范式影响证据，例如框架、产品、文章、社区实践或行业标准。",
  },
  9: {
    verdict: "你已经在定义人与 AI 协作的新范式。",
    reason: "九品不是高频使用 AI，而是创造能改变他人协作方式的概念、工具、框架或公共实践。",
    gap: "九品之后不是刷分，而是持续扩大范式影响并经受真实世界验证。",
  },
};

const SIGNAL_LABELS = {
  snippet_generation: "片段生成证据",
  demo_generation: "Demo 生成证据",
  bug_loop: "Bug 循环证据",
  context_boundary: "边界控制证据",
  plan_before_edit: "计划先行证据",
  validation: "验证闭环证据",
  architecture: "架构判断证据",
  ownership: "系统归属证据",
  workflow_asset: "工作流沉淀证据",
  agent_orchestration: "Agent 编排证据",
  team_system: "团队复制证据",
};

const SIGNAL_REASONS = {
  snippet_generation: "这类证据说明你已经会把 AI 用在局部实现上，但还不能单独证明系统控制力。",
  demo_generation: "这类证据说明你能用 AI 快速搭出可运行结果，但还需要验证和架构判断来证明系统归属。",
  bug_loop: "这类证据说明你在处理失败，但如果没有根因分析和边界重设，容易被封顶在三品附近。",
  context_boundary: "这类证据说明你开始定义目标、非目标、验收条件或文件范围，系统开始被你约束。",
  plan_before_edit: "这类证据说明你不急着让 AI 改代码，而是先要求计划和执行路径。",
  validation: "这类证据说明你用测试、构建、lint、回归或人工验收来确认结果，而不是只看能不能跑。",
  architecture: "这类证据说明你关注模块边界、权限、数据模型、重构或系统设计，开始从系统层面判断结果。",
  ownership: "这类证据说明你关注上线、日志、回滚、维护、关键路径和生产责任，是系统归属的重要信号。",
  workflow_asset: "这类证据说明你把一次协作沉淀成 rules、skill、workflow 或 checklist，开始把能力资产化。",
  agent_orchestration: "这类证据说明你能让多个 Agent 或不同角色分工协作，而不是只和单个聊天窗口来回修。",
  team_system: "这类证据说明你的方法可能正在被团队复用，是八品的必要条件，但还需要强证据确认。",
};

const MODE_COPY = {
  自动初筛: "自动初筛",
  AI深度判定: "AI 深度判定",
};

function parseArgs(argv) {
  const options = {
    source: "codex",
    root: "",
    since: "",
    site: "https://vibe.yisec.ai",
    uploadUrl: "",
    out: ".airank/vibe-report.json",
    limit: "5000",
    maxChars: "1200",
    open: false,
    demo: false,
    shortLink: false,
    printJson: false,
    write: true,
    writeSharePrompt: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "run") continue;
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--demo") {
      options.demo = true;
    } else if (arg === "--open") {
      options.open = true;
    } else if (arg === "--short-link") {
      options.shortLink = true;
    } else if (arg === "--print-json") {
      options.printJson = true;
    } else if (arg === "--no-write") {
      options.write = false;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      options[key] = value;
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function help() {
  return `
Vibe Coding Rank

Usage:
  npx github:relaxcloud-cn/vibe-coding-rank --source codex
  npx github:relaxcloud-cn/vibe-coding-rank --source claude --open
  vibe-rank --demo

Options:
  --source codex|claude|generic   Session source. Default: codex
  --root <path>                   Session directory or file
  --since YYYY-MM-DD              Only scan recently modified records
  --site <url>                    Report site. Default: https://vibe.yisec.ai
  --upload-url <url>              Optional Worker API base URL for short cloud links
  --short-link                    Upload final report JSON and use a short #id link
  --out <path>                    Local report JSON. Default: .airank/vibe-report.json
  --open                          Open the cloud report URL
  --demo                          Generate a demo report without reading local logs
  --print-json                    Print machine-readable report JSON
  --write-share-prompt <path>     Write a sanitized Imagen/imagegen poster prompt
  --no-write                      Do not write a local report file
`.trim();
}

function expandHome(path) {
  if (!path) return path;
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return path;
}

function defaultRoot(source) {
  if (source === "claude") return "~/.claude/projects";
  if (source === "codex") return "~/.codex/sessions";
  return ".";
}

function runPython(script, args) {
  const scriptPath = join(ROOT, "skill", "scripts", script);
  const interpreters = ["python3", "python"];
  let last;
  for (const python of interpreters) {
    const result = spawnSync(python, [scriptPath, ...args], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (result.status === 0) return result;
    if (result.error && result.error.code === "ENOENT") {
      last = result;
      continue;
    }
    throw new Error(result.stderr || result.stdout || `${script} failed`);
  }
  throw new Error(last?.error?.message || "Python is required but was not found.");
}

function sampleSummary() {
  return {
    analysis_version: "0.2-demo",
    judgment_mode: "自动初筛",
    is_final: false,
    record_count: 170,
    analyzed_record_count: 120,
    excluded_record_count: 50,
    excluded_reason_counts: {
      agents_context: 5,
      codex_system_prompt: 3,
      "role:usage_stats": 42,
    },
    signal_count: 56,
    signal_counts: {
      context_boundary: 11,
      plan_before_edit: 8,
      validation: 13,
      architecture: 9,
      ownership: 5,
      workflow_asset: 6,
      agent_orchestration: 4,
    },
    strong_evidence_count: 12,
    user_control_count: 8,
    user_control_source_count: 3,
    usage_stats: {
      usage_record_count: 42,
      total_tokens: 1280000,
      input_tokens: 760000,
      cached_input_tokens: 360000,
      cache_creation_input_tokens: 90000,
      output_tokens: 70000,
      reasoning_output_tokens: 0,
      active_days: 6,
      active_sessions: 12,
      first_active_day: "2026-05-02",
      last_active_day: "2026-05-07",
      active_span_days: 6,
      average_day_tokens: 213333,
      average_session_tokens: 106667,
      peak_record_tokens: 86000,
      peak_day: "2026-05-07",
      peak_day_tokens: 420000,
      peak_session_tokens: 260000,
      peak_record_token_share: 0.0672,
      peak_day_token_share: 0.3281,
      peak_session_token_share: 0.2031,
      cached_input_token_share: 0.2813,
      output_token_share: 0.0547,
      reasoning_token_share: 0,
      token_note: "Token 是 AI 投入强度指标，不参与段位升品。",
    },
    hard_stats: {
      raw_record_count: 170,
      analyzed_record_count: 120,
      non_scoring_record_count: 50,
      usage_record_count: 42,
      tool_result_record_count: 0,
      context_excluded_record_count: 8,
      scoring_candidate_record_count: 128,
      scorable_record_ratio: 0.9375,
      source_count: 3,
      evidence_first_day: "2026-05-02",
      evidence_last_day: "2026-05-07",
      evidence_span_days: 6,
      average_records_per_source: 40,
      signal_count: 56,
      signal_density: 0.4667,
      signal_type_count: 7,
      signal_coverage_ratio: 0.6364,
      dominant_signal: "validation",
      dominant_signal_count: 13,
      dominant_signal_ratio: 0.2321,
      strong_evidence_count: 12,
      strong_evidence_density: 0.1,
      strong_signal_type_count: 3,
      strong_evidence_source_count: 3,
      average_strong_evidence_per_source: 4,
      promotion_evidence_count: 48,
      user_control_count: 8,
      user_control_source_count: 3,
      user_control_ratio: 0.1667,
      established_dimension_count: 5,
      stable_dimension_count: 1,
      total_tokens: 1280000,
      input_tokens: 760000,
      cached_input_tokens: 360000,
      cache_creation_input_tokens: 90000,
      output_tokens: 70000,
      reasoning_output_tokens: 0,
      active_days: 6,
      active_sessions: 12,
      first_active_day: "2026-05-02",
      last_active_day: "2026-05-07",
      active_span_days: 6,
      average_day_tokens: 213333,
      average_session_tokens: 106667,
      peak_record_tokens: 86000,
      peak_day: "2026-05-07",
      peak_day_tokens: 420000,
      peak_session_tokens: 260000,
      peak_record_token_share: 0.0672,
      peak_day_token_share: 0.3281,
      peak_session_token_share: 0.2031,
      cached_input_token_share: 0.2813,
      output_token_share: 0.0547,
      reasoning_token_share: 0,
      note: "硬统计只描述样本质量和 AI 投入强度，不直接参与段位升品。",
    },
    dimension_profile: [
      { id: "problem_definition", label: "目标定义", status: "成立", score: 65, evidence_count: 19, strong_evidence_count: 11 },
      { id: "boundary_control", label: "边界控制", status: "成立", score: 65, evidence_count: 20, strong_evidence_count: 11 },
      { id: "validation_loop", label: "验证闭环", status: "稳定", score: 85, evidence_count: 13, strong_evidence_count: 13 },
      { id: "architecture_judgment", label: "架构判断", status: "成立", score: 65, evidence_count: 9, strong_evidence_count: 9 },
      { id: "system_ownership", label: "系统归属", status: "成立", score: 65, evidence_count: 27, strong_evidence_count: 22 },
      { id: "method_replication", label: "方法复制", status: "线索", score: 35, evidence_count: 10, strong_evidence_count: 0 },
    ],
    preliminary_rank: {
      level: 6,
      label: "六品 · 已有大成",
      score: 76,
      confidence: "high",
      is_final: false,
      mode: "自动初筛",
      max_auto_level: 7,
    },
    heuristic_rank: {
      level: 6,
      label: "六品 · 已有大成",
      score: 76,
      confidence: "high",
      is_final: false,
      mode: "自动初筛",
      max_auto_level: 7,
    },
    evidence_cards: [
      {
        signal: "context_boundary",
        evidence_type: "边界控制证据",
        dimension: "目标与边界",
        actor: "user",
        behavior: "实现这个用户故事，验收条件如下；不要改支付模块，先给计划再动代码。",
        proves: "开始定义目标、非目标、验收条件或文件范围，AI 的行为被人的边界约束。",
        supports_levels: [4, 5],
        strength: "强",
        source: "codex:demo/session.jsonl:12",
        snippet: "实现这个用户故事，验收条件如下；不要改支付模块，先给计划再动代码。",
        usable_for_promotion: true,
      },
      {
        signal: "validation",
        evidence_type: "验证闭环证据",
        dimension: "验证判断",
        actor: "assistant",
        behavior: "已运行 build、lint、单元测试和截图 smoke check，并复查 diff。",
        proves: "用测试、构建、lint、回归或人工验收确认结果，而不是只看能不能跑。",
        supports_levels: [3, 5, 6],
        strength: "强",
        source: "codex:demo/session.jsonl:31",
        snippet: "已运行 build、lint、单元测试和截图 smoke check，并复查 diff。",
        usable_for_promotion: true,
      },
      {
        signal: "architecture",
        evidence_type: "架构判断证据",
        dimension: "系统设计",
        actor: "user",
        behavior: "这个模块继续 patch 没意义，重设数据边界，用新的状态模型替换。",
        proves: "关注模块边界、权限、数据模型、重构或系统设计，开始从系统层面判断结果。",
        supports_levels: [5, 6, 7],
        strength: "强",
        source: "codex:demo/session.jsonl:47",
        snippet: "这个模块继续 patch 没意义，重设数据边界，用新的状态模型替换。",
        usable_for_promotion: true,
      },
    ],
    evidence: {
      context_boundary: [
        {
          source: "codex:demo/session.jsonl:12",
          role: "user",
          snippet: "实现这个用户故事，验收条件如下；不要改支付模块，先给计划再动代码。",
        },
      ],
      validation: [
        {
          source: "codex:demo/session.jsonl:31",
          role: "assistant",
          snippet: "已运行 build、lint、单元测试和截图 smoke check，并复查 diff。",
        },
      ],
      architecture: [
        {
          source: "codex:demo/session.jsonl:47",
          role: "user",
          snippet: "这个模块继续 patch 没意义，重设数据边界，用新的状态模型替换。",
        },
      ],
    },
    rank_caps: [
      "自动初筛最高只确认到七品；八品需要单独复核团队复制证据。",
      "九品 · 大宗师 需要公开范式影响证据，不能仅凭私有会话自动判定。",
    ],
    unlock_status: {
      level8: {
        unlocked: false,
        label: "八品 · 半步宗师",
        reason: "八品需要团队级方法复制强证据，自动初筛默认不会仅凭私有会话放行。",
      },
      level9: {
        unlocked: false,
        label: "九品 · 大宗师",
        reason: "九品需要公开范式影响证据，不能仅凭私有会话自动判定。",
      },
    },
    quality_notes: [
      "脚本只做证据清洗和自动初筛，不是最终 AI 段位判定。",
      "八品需要团队方法被他人复用的强证据；九品需要公开范式影响证据。",
    ],
  };
}

function flattenLegacyEvidence(evidence) {
  const rows = [];
  for (const [signal, items] of Object.entries(evidence || {})) {
    for (const item of items || []) {
      rows.push({
        signal,
        label: SIGNAL_LABELS[signal] || signal,
        reason: SIGNAL_REASONS[signal] || "这条证据支持当前段位判断。",
        source: item.source || "",
        role: item.role || "unknown",
        snippet: item.snippet || "",
      });
    }
  }
  return rows.slice(0, 12);
}

function flattenEvidence(summary) {
  if (Array.isArray(summary.evidence_cards) && summary.evidence_cards.length) {
    return summary.evidence_cards.slice(0, 16).map((item) => ({
      signal: item.signal || "",
      label: item.evidence_type || SIGNAL_LABELS[item.signal] || item.signal || "证据",
      reason: item.proves || SIGNAL_REASONS[item.signal] || "这条证据支持当前段位判断。",
      source: item.source || "",
      role: item.actor || "unknown",
      snippet: item.snippet || item.behavior || "",
      dimension: item.dimension || "",
      strength: item.strength || "",
      supportsLevels: item.supports_levels || [],
      usableForPromotion: item.usable_for_promotion ?? true,
    }));
  }
  return flattenLegacyEvidence(summary.evidence);
}

function strongestEvidence(rows) {
  const priority = [
    "architecture",
    "validation",
    "ownership",
    "context_boundary",
    "workflow_asset",
    "agent_orchestration",
    "team_system",
    "plan_before_edit",
    "demo_generation",
    "bug_loop",
    "snippet_generation",
  ];
  return [...rows]
    .sort((a, b) => {
      const ap = priority.indexOf(a.signal);
      const bp = priority.indexOf(b.signal);
      return (ap === -1 ? 99 : ap) - (bp === -1 ? 99 : bp);
    })
    .slice(0, 5);
}

function systemOwnership(level) {
  if (level >= 8) return "exceptional";
  if (level >= 5) return "strong";
  if (level >= 4) return "emerging";
  return "weak";
}

function buildReport(summary, options) {
  const rank = summary.preliminary_rank || summary.heuristic_rank || {};
  const level = Number(rank.level || 0);
  const nextLevel = Math.min(9, level + 1);
  const evidenceRows = flattenEvidence(summary);
  const copy = RANK_REPORT_COPY[level] || RANK_REPORT_COPY[0];
  const strongest = strongestEvidence(evidenceRows);
  const rankCaps = summary.rank_caps || [];
  const upgradePath = UPGRADE_PATHS[level] || [];
  const judgmentMode = summary.judgment_mode || rank.mode || "自动初筛";
  const isFinal = Boolean(summary.is_final || rank.is_final);
  const qualityNotes = summary.quality_notes || [];
  const nextRankGap = isFinal
    ? copy.gap
    : `${copy.gap} 当前结果是自动初筛，高段位需要 AI 判定官基于证据卡复核。`;
  return {
    product: "Airank Vibe Coding Rank",
    generatedAt: new Date().toISOString(),
    source: options.source,
    root: options.root || defaultRoot(options.source),
    judgmentMode,
    judgmentModeLabel: MODE_COPY[judgmentMode] || judgmentMode,
    isFinal,
    rank: {
      level,
      label: rank.label || RANKS[level] || RANKS[0],
      score: Number(rank.score || Math.max(1, level * 11)),
      confidence: rank.confidence || "low",
      systemOwnership: systemOwnership(level),
    },
    nextRank: {
      level: nextLevel,
      label: RANKS[nextLevel],
    },
    recordCount: summary.record_count || 0,
    analyzedRecordCount: summary.analyzed_record_count ?? summary.record_count ?? 0,
    excludedRecordCount: summary.excluded_record_count || 0,
    excludedReasonCounts: summary.excluded_reason_counts || {},
    signalCount: summary.signal_count || 0,
    signalCounts: summary.signal_counts || {},
    strongEvidenceCount: summary.strong_evidence_count || strongest.filter((item) => item.strength === "强").length,
    userControlCount: summary.user_control_count || 0,
    userControlSourceCount: summary.user_control_source_count || 0,
    usageStats: summary.usage_stats || {},
    hardStats: summary.hard_stats || {},
    statsInsight: statsInsight({ hardStats: summary.hard_stats || {} }),
    dimensionProfile: summary.dimension_profile || [],
    verdict: copy.verdict,
    whyThisRank: copy.reason,
    whyNotNextRank: nextRankGap,
    evidence: evidenceRows,
    strongestEvidence: strongest,
    rankCaps,
    unlockStatus: summary.unlock_status || {},
    qualityNotes,
    upgradePath,
    narrative: {
      title: "Vibe Coding 段位报告",
      oneLine: `你现在是：${rank.label || RANKS[level] || RANKS[0]}。${copy.verdict}`,
      rankReason: copy.reason,
      nextRankGap,
      capSummary: rankCaps[0] || qualityNotes[0] || "当前没有明显封顶原因，但仍需更多证据提高置信度。",
      upgradeSummary: upgradePath[0] || "继续积累真实项目证据，并把成功做法沉淀成可复用工作流。",
    },
  };
}

function encodeReport(report) {
  return Buffer.from(JSON.stringify(report), "utf-8").toString("base64url");
}

function siteUrl(site, report) {
  return `${site.replace(/\/$/, "")}/#data=${encodeReport(report)}`;
}

async function uploadReport(uploadUrl, report) {
  const endpoint = `${uploadUrl.replace(/\/$/, "")}/api/reports`;
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(report),
    });
  } catch (error) {
    throw new Error(`Short-link upload failed. Remove --short-link to use a local #data link. ${error.message}`);
  }
  if (!response.ok) {
    throw new Error(`Short-link upload failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function writeReport(path, report) {
  const target = resolve(path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  return target;
}

function openUrl(url) {
  const command = platform() === "darwin" ? "open" : platform() === "win32" ? "cmd" : "xdg-open";
  const args = platform() === "win32" ? ["/c", "start", "", url] : [url];
  spawnSync(command, args, { stdio: "ignore", detached: true });
}

function formatTokens(value) {
  const tokens = Number(value || 0);
  if (tokens >= 100000000) return `${(tokens / 100000000).toFixed(1)}亿`;
  if (tokens >= 10000) return `${Math.round(tokens / 10000)}万`;
  return String(tokens);
}

function formatPercent(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return "0%";
  return `${Math.round(number * 100)}%`;
}

function hardStatsLine(report) {
  const stats = report.hardStats || {};
  const usage = report.usageStats || {};
  const totalTokens = stats.total_tokens || usage.total_tokens || 0;
  const peakDayTokens = stats.peak_day_tokens || usage.peak_day_tokens || 0;
  const activeDays = stats.active_days || usage.active_days || 0;
  const activeSessions = stats.active_sessions || usage.active_sessions || 0;
  const sourceCount = stats.source_count || report.userControlSourceCount || 0;
  const strongDensity = stats.strong_evidence_density || 0;
  const userControlRatio = stats.user_control_ratio || 0;
  if (!totalTokens && !activeDays && !sourceCount && !strongDensity && !userControlRatio) return "";
  const parts = [];
  if (totalTokens) parts.push(`总 token ${formatTokens(totalTokens)}`);
  if (peakDayTokens) parts.push(`峰值日 ${formatTokens(peakDayTokens)}`);
  if (activeDays) parts.push(`活跃 ${activeDays} 天`);
  if (activeSessions) parts.push(`${activeSessions} 会话`);
  if (sourceCount) parts.push(`${sourceCount} 个证据来源`);
  if (strongDensity) parts.push(`强证据密度 ${formatPercent(strongDensity)}`);
  if (userControlRatio) parts.push(`主动控制 ${formatPercent(userControlRatio)}`);
  return parts.join(", ");
}

function evidenceStatsLine(report) {
  const stats = report.hardStats || {};
  const parts = [];
  if (stats.evidence_span_days) parts.push(`证据跨度 ${stats.evidence_span_days} 天`);
  if (stats.signal_type_count) parts.push(`信号类型 ${stats.signal_type_count}/${Object.keys(SIGNAL_LABELS).length}`);
  if (stats.signal_coverage_ratio) parts.push(`覆盖度 ${formatPercent(stats.signal_coverage_ratio)}`);
  if (stats.dominant_signal_ratio) parts.push(`最高信号集中度 ${formatPercent(stats.dominant_signal_ratio)}`);
  if (stats.established_dimension_count) parts.push(`成立维度 ${stats.established_dimension_count}/6`);
  return parts.join(", ");
}

function statsInsight(report) {
  const stats = report.hardStats || {};
  const notes = [];
  const userRatio = Number(stats.user_control_ratio || 0);
  const dominantRatio = Number(stats.dominant_signal_ratio || 0);
  const peakDayShare = Number(stats.peak_day_token_share || 0);
  const activeDays = Number(stats.active_days || 0);
  const evidenceSpan = Number(stats.evidence_span_days || 0);

  if (userRatio > 0 && userRatio < 0.03) {
    notes.push("主动控制占比偏低，高阶信号主要来自 AI 执行或总结，自动初筛会压低高段位。");
  } else if (userRatio >= 0.08) {
    notes.push("主动控制占比充足，用户在目标、边界、架构和验收上有明确主导痕迹。");
  }

  if (dominantRatio >= 0.45) {
    notes.push("信号过于集中，可能只证明一种工作习惯，不足以单独支撑系统归属。");
  } else if (dominantRatio > 0 && dominantRatio <= 0.3) {
    notes.push("信号分布较均衡，能减少单一关键词或单一任务类型带来的误判。");
  }

  if (peakDayShare >= 0.5) {
    notes.push("token 明显集中在少数日期，更像阶段性爆量，不等同于稳定能力。");
  }

  if (activeDays >= 5 && evidenceSpan >= 14) {
    notes.push("样本跨越多个工作日，稳定性比单次会话更可信。");
  }

  return notes[0] || "硬统计用于解释投入强度、样本质量和证据结构，不直接参与段位升品。";
}

function translateConfidence(value) {
  return {
    low: "低",
    medium: "中",
    high: "高",
  }[value] || value || "未知";
}

function translateOwnership(value) {
  return {
    weak: "弱",
    emerging: "形成中",
    strong: "强",
    exceptional: "极强",
  }[value] || value || "未知";
}

function shortText(value, length = 42) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length - 1)}…`;
}

function buildShareImagePrompt(report, url = "") {
  const rank = report.rank || {};
  const evidence = (report.strongestEvidence || report.evidence || [])
    .slice(0, 3)
    .map((item) => `${item.label || item.signal || "证据"}：${shortText(item.reason || item.snippet || "", 36)}`);
  while (evidence.length < 3) evidence.push("证据不足：继续积累真实 AI 工作记录");
  const dimensions = (report.dimensionProfile || [])
    .slice(0, 6)
    .map((item) => `${item.label || item.id} ${item.status || "缺失"} ${Number(item.score || 0)}/100`)
    .join("；");
  const stats = hardStatsLine(report) || "暂无硬统计";
  const evidenceStats = evidenceStatsLine(report) || "暂无证据结构统计";
  const insight = statsInsight(report);
  const rankCap = shortText(report.rankCaps?.[0] || report.narrative?.capSummary || "暂无明显封顶原因", 52);
  const upgrade = shortText(report.upgradePath?.[0] || report.narrative?.upgradeSummary || "继续沉淀可复用工作流", 52);
  const reportUrl = url ? `\n公开链接：${url.length > 140 ? `${url.slice(0, 140)}...` : url}` : "";

  return `
Use case: infographic-diagram
Asset type: 4:5 vertical Chinese social-share poster for Airank Vibe Coding Rank
Primary request: Create a premium Chinese AI ability report poster. It must look like a polished product report, not a meme or generic certificate.

Exact Chinese text to include:
标题：Vibe Coding 九品报告
主评级：${rank.label || "未知段位"}
分数：${Number(rank.score || 0)}/100
置信度：${translateConfidence(rank.confidence)}
系统归属：${translateOwnership(rank.systemOwnership)}
核心问题：这系统是你的，还是 AI 的？
一句话：${shortText(report.verdict || report.narrative?.oneLine || "", 46)}

硬统计：
${stats}

证据结构：
${evidenceStats}

统计解读：
${insight}

六维画像：
${dimensions || "目标定义、边界控制、验证闭环、架构判断、系统归属、方法复制"}

证据摘要：
1. ${evidence[0]}
2. ${evidence[1]}
3. ${evidence[2]}

评级限制：
${rankCap}

下一步：
${upgrade}

Footer:
Airank · 3 分钟测出你的 AI 段位${reportUrl}

Visual direction:
- Chinese text must be readable, large, and clean.
- Use Airank product-report style: deep green and blue background, ivory panels, gold rank accent, subtle grid lines.
- Make the rank label and score the strongest visual elements.
- Use compact dashboard cards for hard stats and six dimensions.
- No raw logs, no local file paths, no session IDs, no code snippets, no secrets, no QR code unless a public URL is intentionally provided.
`.trim();
}

function writeTextFile(path, content) {
  const target = resolve(path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${content.trim()}\n`, "utf-8");
  return target;
}

function publicEvidence(item) {
  return {
    signal: item.signal || "",
    label: item.label || item.evidence_type || "证据",
    reason: item.reason || item.proves || "",
    dimension: item.dimension || "",
    strength: item.strength || "",
    supportsLevels: item.supportsLevels || item.supports_levels || [],
    usableForPromotion: item.usableForPromotion ?? item.usable_for_promotion ?? true,
  };
}

function publicReport(report) {
  return {
    product: report.product,
    generatedAt: report.generatedAt,
    source: report.source,
    judgmentMode: report.judgmentMode,
    judgmentModeLabel: report.judgmentModeLabel,
    isFinal: report.isFinal,
    rank: report.rank,
    nextRank: report.nextRank,
    recordCount: report.recordCount,
    analyzedRecordCount: report.analyzedRecordCount,
    excludedRecordCount: report.excludedRecordCount,
    signalCount: report.signalCount,
    signalCounts: report.signalCounts,
    strongEvidenceCount: report.strongEvidenceCount,
    userControlCount: report.userControlCount,
    userControlSourceCount: report.userControlSourceCount,
    usageStats: report.usageStats,
    hardStats: report.hardStats,
    statsInsight: report.statsInsight,
    dimensionProfile: report.dimensionProfile,
    verdict: report.verdict,
    whyThisRank: report.whyThisRank,
    whyNotNextRank: report.whyNotNextRank,
    evidence: (report.evidence || []).map(publicEvidence),
    strongestEvidence: (report.strongestEvidence || []).map(publicEvidence),
    rankCaps: report.rankCaps,
    unlockStatus: report.unlockStatus,
    qualityNotes: report.qualityNotes,
    upgradePath: report.upgradePath,
    narrative: report.narrative,
    privacy: {
      localPathsRemoved: true,
      rawLogsUploaded: false,
      note: "Short links store only the final sanitized report JSON, not raw Codex or Claude Code logs.",
    },
  };
}

function printHuman(report, url, outPath) {
  console.log("");
  console.log("Vibe Coding 段位报告");
  console.log(`段位：${report.rank.label}`);
  console.log(`分数：${report.rank.score}`);
  console.log(`置信度：${report.rank.confidence}`);
  console.log(`判定模式：${report.judgmentModeLabel}${report.isFinal ? "" : "（非最终判定）"}`);
  console.log(`系统归属：${report.rank.systemOwnership}`);
  const hardStats = hardStatsLine(report);
  if (hardStats) {
    console.log(`硬统计：${hardStats}`);
  }
  const evidenceStats = evidenceStatsLine(report);
  if (evidenceStats) {
    console.log(`证据结构：${evidenceStats}`);
  }
  if (report.statsInsight) {
    console.log(`统计解读：${report.statsInsight}`);
  }
  console.log("");
  console.log("一句话判定：");
  console.log(report.narrative.oneLine);
  console.log("");
  console.log("为什么是这个段位：");
  console.log(report.whyThisRank);
  console.log("");
  console.log("为什么还不是下一品：");
  console.log(report.whyNotNextRank);
  if (report.excludedRecordCount) {
    console.log("");
    console.log(`证据分析：${report.analyzedRecordCount}/${report.recordCount} 条记录`);
    console.log(`非评分记录：${report.excludedRecordCount} 条`);
  }
  const displayUrl = url.length > 180 ? `${url.slice(0, 180)}...` : url;
  console.log(`云端报告：${displayUrl}`);
  if (outPath) console.log(`本地报告：${outPath}`);
  if (report.shareImagePromptPath) console.log(`图片报告提示词：${report.shareImagePromptPath}`);
  if (report.strongestEvidence.length) {
    console.log("");
    console.log("最强证据：");
    for (const item of report.strongestEvidence.slice(0, 3)) {
      console.log(`- ${item.label}: ${item.reason}`);
    }
  }
  console.log("");
  console.log("下一步：");
  for (const item of report.upgradePath) {
    console.log(`- ${item}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(help());
    return;
  }

  let summary;
  if (options.demo) {
    summary = sampleSummary();
  } else {
    const root = resolve(expandHome(options.root || defaultRoot(options.source)));
    if (!existsSync(root)) {
      throw new Error(`Session root not found: ${root}`);
    }

    const tempRoot = join(tmpdir(), `airank-vibe-${Date.now()}`);
    mkdirSync(tempRoot, { recursive: true });
    const evidencePath = join(tempRoot, "evidence.jsonl");
    const summaryPath = join(tempRoot, "summary.json");

    const collectArgs = [
      "--source",
      options.source,
      "--root",
      root,
      "--output",
      evidencePath,
      "--limit",
      options.limit,
      "--max-chars",
      options.maxChars,
    ];
    if (options.since) {
      collectArgs.push("--since", options.since);
    }

    runPython("collect_sessions.py", collectArgs);
    runPython("prepare_evidence.py", ["--input", evidencePath, "--output", summaryPath]);
    summary = JSON.parse(readFileSync(summaryPath, "utf-8"));
    options.root = root;
  }

  const report = buildReport(summary, options);
  let url = siteUrl(options.site, report);
  let shareImagePrompt = buildShareImagePrompt(report, url);
  report.shareImagePrompt = shareImagePrompt;
  let shareImagePromptPath = "";
  if (options.writeSharePrompt) {
    shareImagePromptPath = writeTextFile(options.writeSharePrompt, shareImagePrompt);
    report.shareImagePromptPath = shareImagePromptPath;
  }
  const uploadBaseUrl = options.uploadUrl || (options.shortLink ? options.site : "");
  if (uploadBaseUrl) {
    const publicPayload = publicReport(report);
    const uploaded = await uploadReport(uploadBaseUrl, publicPayload);
    url = uploaded.url || `${uploadBaseUrl.replace(/\/$/, "")}/#id=${uploaded.id}`;
    shareImagePrompt = buildShareImagePrompt(report, url);
    report.shareImagePrompt = shareImagePrompt;
    if (options.writeSharePrompt) {
      shareImagePromptPath = writeTextFile(options.writeSharePrompt, shareImagePrompt);
      report.shareImagePromptPath = shareImagePromptPath;
    }
  }
  const outPath = options.write && options.out ? writeReport(options.out, report) : "";
  if (options.printJson) {
    console.log(JSON.stringify({ report, url, outPath, shareImagePromptPath }, null, 2));
  } else {
    printHuman(report, url, outPath);
  }
  if (options.open) openUrl(url);
}

main().catch((error) => {
  console.error(`vibe-rank: ${error.message}`);
  process.exit(1);
});
