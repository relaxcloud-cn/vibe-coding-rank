#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, platform, tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const SOURCES = new Set(["codex", "claude", "generic"]);
const URL_PREVIEW_LENGTH = 180;
const LONG_PUBLIC_URL_WARNING_LENGTH = 14000;
const VALUE_ARGS = new Set([
  "--source",
  "--root",
  "--since",
  "--site",
  "--upload-url",
  "--out",
  "--limit",
  "--max-chars",
  "--usd-per-million-input-tokens",
  "--usd-per-million-cached-input-tokens",
  "--usd-per-million-output-tokens",
  "--usd-per-million-reasoning-tokens",
  "--write-link",
  "--write-share-prompt",
  "--write-judge-prompt",
]);

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

const GATE_UPGRADE_ADVICE = {
  level5_architecture: "下一次不要直接让 AI 改代码，先让它画出模块边界、数据流和风险点；你确认架构取舍后再允许执行。",
  level6_validation: "补齐验证闭环：每个任务都写清验收标准，并要求 AI 跑测试、构建、lint 或截图检查，最后由你复核结果。",
  level6_evidence_span: "不要靠单次高光会话升品。连续做 2 到 3 个真实任务，留下目标定义、架构约束、验证结果和交付复盘。",
  level6_user_control_ratio: "提高主动控制占比：让 AI 动手前，先由你写清目标、非目标、文件范围、验收条件和风险边界。",
  level6_user_decision_ratio: "不要只说继续修。下一轮要明确留下你的系统级决策：为什么重构、哪些模块不能碰、用什么标准验收。",
  level7_ownership: "补系统归属证据：记录关键路径、上线风险、日志监控、回滚方案和维护责任，证明你能为生产结果负责。",
  level7_evidence_span: "七品需要稳定性。跨多个任务复用同一套目标、边界、验证和复盘机制，而不是一次性把项目做完。",
  level7_user_control_ratio: "把审核和验证前置成 checklist 或 gate，减少靠 AI 自述完成；每个关键节点由你决定是否继续。",
  level7_user_decision_ratio: "沉淀 3 次以上用户主导的边界、架构、验收或取舍决策，把“为什么这样设计”留在记录里。",
  level7_workflow_asset: "把成功协作写成 AGENTS.md、rules、skill、workflow 或 checklist，并在后续任务里复用它。",
  level8_team_replication: "找至少 2 个其他人或项目复用你的 rules、skill 或 playbook，并记录复用结果；八品看方法是否离开你仍然有效。",
  level8_team_candidate: "团队和工作流同时出现只是线索。你需要证明它被别人稳定使用，而不是只在你的私有会话里出现。",
  level9_public_influence: "九品需要公开范式影响：发布框架、文章、工具、课程或社区案例，让行业开始复用你的协作方法。",
};

const MODE_COPY = {
  自动初筛: "自动初筛",
  AI深度判定: "AI 深度判定",
};

const SHARE_HARD_CARD_PRIORITY = [
  "ai_investment",
  "estimated_cost",
  "user_decision",
  "usable_promotion_signal",
  "assistant_self_report_downgrade",
  "validation_density",
  "rework_pressure",
  "user_control",
  "strong_record_density",
  "sample_validity",
  "sample_stability",
  "promotion_record_quality",
  "signal_coverage",
  "dimension_maturity",
  "automation_noise",
  "strong_evidence_density",
];

const PUBLIC_HARD_STATS_FIELDS = [
  "raw_record_count",
  "analyzed_record_count",
  "non_scoring_record_count",
  "usage_record_count",
  "tool_result_record_count",
  "tool_event_record_count",
  "context_excluded_record_count",
  "scoring_candidate_record_count",
  "total_tokens",
  "peak_day_tokens",
  "active_days",
  "active_sessions",
  "peak_day_token_share",
  "evidence_span_days",
  "signal_coverage_ratio",
  "dominant_signal_ratio",
  "established_dimension_count",
  "strong_evidence_density",
  "strong_record_density",
  "validation_density",
  "validation_count",
  "promotion_user_decision_ratio",
  "promotion_assistant_execution_ratio",
  "promotion_usable_signal_count",
  "promotion_usable_record_count",
  "promotion_usable_signal_ratio",
  "promotion_usable_record_ratio",
  "downgraded_assistant_signal_count",
  "downgraded_assistant_record_count",
  "downgraded_assistant_signal_ratio",
  "downgraded_assistant_record_ratio",
  "user_decision_count",
  "user_control_ratio",
  "bug_loop_density",
  "bug_loop_count",
];

const PUBLIC_USAGE_STATS_FIELDS = [
  "total_tokens",
  "peak_day_tokens",
  "active_days",
  "active_sessions",
  "average_day_tokens",
  "average_session_tokens",
  "peak_day_token_share",
  "token_note",
];

const PUBLIC_METRIC_GROUP_FIELDS = [
  "id",
  "label",
  "value",
  "signal",
  "ratingImpact",
  "risk",
];

const PUBLIC_STAT_PROFILE_FIELDS = [
  "id",
  "label",
  "summary",
  "riskLevel",
  "ratingUse",
  "reasons",
  "signals",
];

const PUBLIC_STAT_EVIDENCE_FIELDS = [
  "id",
  "label",
  "supportLevel",
  "supportLabel",
  "confidenceImpact",
  "conclusion",
  "positiveSignals",
  "riskSignals",
  "investmentSignals",
  "ratingUse",
];

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
    usdPerMillionInputTokens: "",
    usdPerMillionCachedInputTokens: "",
    usdPerMillionOutputTokens: "",
    usdPerMillionReasoningTokens: "",
    open: false,
    demo: false,
    doctor: false,
    shortLink: false,
    printJson: false,
    write: true,
    writeSharePrompt: "",
    writeJudgePrompt: "",
    writeLink: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "run") continue;
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--demo") {
      options.demo = true;
    } else if (arg === "--doctor") {
      options.doctor = true;
    } else if (arg === "--open") {
      options.open = true;
    } else if (arg === "--short-link") {
      options.shortLink = true;
    } else if (arg === "--print-json") {
      options.printJson = true;
    } else if (arg === "--no-write") {
      options.write = false;
    } else if (arg.startsWith("--")) {
      if (!VALUE_ARGS.has(arg)) {
        throw new Error(`Unknown option: ${arg}`);
      }
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

  if (!SOURCES.has(options.source)) {
    throw new Error(`Unsupported --source "${options.source}". Use codex, claude, or generic.`);
  }

  validateArgs(options);

  return options;
}

function validatePositiveInteger(name, value) {
  if (!/^[1-9]\d*$/.test(String(value))) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

function validateOptionalNonNegativeNumber(name, value) {
  if (value === "") return;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${name} must be a non-negative number.`);
  }
}

function validateDate(value) {
  if (!value) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("--since must use YYYY-MM-DD.");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("--since must be a real calendar date.");
  }
}

function validateArgs(options) {
  validatePositiveInteger("--limit", options.limit);
  validatePositiveInteger("--max-chars", options.maxChars);
  validateDate(options.since);
  validateOptionalNonNegativeNumber("--usd-per-million-input-tokens", options.usdPerMillionInputTokens);
  validateOptionalNonNegativeNumber("--usd-per-million-cached-input-tokens", options.usdPerMillionCachedInputTokens);
  validateOptionalNonNegativeNumber("--usd-per-million-output-tokens", options.usdPerMillionOutputTokens);
  validateOptionalNonNegativeNumber("--usd-per-million-reasoning-tokens", options.usdPerMillionReasoningTokens);
}

function help() {
  return `
Vibe Coding Rank

Usage:
  npx github:relaxcloud-cn/vibe-coding-rank --source codex
  npx github:relaxcloud-cn/vibe-coding-rank --source claude --open
  vibe-rank --demo
  vibe-rank --doctor --source codex

Options:
  --source codex|claude|generic   Session source. Default: codex
  --root <path>                   Session directory or file
  --since YYYY-MM-DD              Only scan recently modified records
  --site <url>                    Report site. Default: https://vibe.yisec.ai
  --upload-url <url>              Optional Worker API base URL for short cloud links
  --short-link                    Upload final report JSON and use a short #id link
  --usd-per-million-input-tokens <n>      Optional input-token price for cost estimate
  --usd-per-million-cached-input-tokens <n> Optional cached-input price for cost estimate
  --usd-per-million-output-tokens <n>     Optional output-token price for cost estimate
  --usd-per-million-reasoning-tokens <n>  Optional reasoning-token price for cost estimate
  --out <path>                    Local report JSON. Default: .airank/vibe-report.json
  --open                          Open the cloud report URL
  --demo                          Generate a demo report without reading local logs
  --doctor                        Check local prerequisites and default session paths
  --print-json                    Print machine-readable report JSON
  --write-link <path>             Write the full public report URL to a file
  --write-share-prompt <path>     Write a sanitized Imagen/imagegen poster prompt
  --write-judge-prompt <path>     Write a sanitized AI deep-judgment prompt
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

function findPython() {
  for (const python of ["python3", "python"]) {
    const result = spawnSync(python, ["--version"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (result.status === 0) {
      return {
        command: python,
        version: String(result.stdout || result.stderr).trim(),
      };
    }
  }
  return { command: "", version: "" };
}

function sourceHint(source) {
  if (source === "codex") return "Codex 默认路径通常是 ~/.codex/sessions。";
  if (source === "claude") return "Claude Code 默认路径通常是 ~/.claude/projects。";
  return "generic 模式需要用 --root 指向 JSONL 文件或目录。";
}

function shellQuote(value) {
  const text = String(value || "");
  if (/^[A-Za-z0-9_./:@%+=,-]+$/.test(text)) return text;
  return `'${text.replaceAll("'", "'\\''")}'`;
}

function doctor(options) {
  const root = resolve(expandHome(options.root || defaultRoot(options.source)));
  const python = findPython();
  const rootExists = existsSync(root);
  const rootArg = options.root ? ` --root ${shellQuote(root)}` : "";
  const lines = [
    "Vibe Coding Rank 本地诊断",
    `来源：${options.source}`,
    `会话路径：${root}`,
    `路径状态：${rootExists ? "存在" : "不存在"}`,
    `Python：${python.command ? `${python.command} (${python.version})` : "未找到"}`,
    `报告站点：${options.site}`,
    "",
    "建议：",
  ];
  if (!rootExists) {
    lines.push(`- ${sourceHint(options.source)}`);
    lines.push("- 如果你的记录在别处，使用 --root <path> 指定。");
    lines.push("- 只想看样例：npx github:relaxcloud-cn/vibe-coding-rank --demo --open");
  }
  if (!python.command) {
    lines.push("- 需要安装 Python 3，CLI 会用它做本地证据清洗。");
  }
  if (rootExists && python.command) {
    lines.push(`- 可以运行：npx github:relaxcloud-cn/vibe-coding-rank --source ${options.source}${rootArg} --open`);
  }
  lines.push("- 需要完整长链接文件：加 --write-link .airank/report-url.txt。");
  lines.push("- 想分享短链接：加 --short-link --open。");
  return lines.join("\n");
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
      tool_event_record_count: 0,
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
      validation_count: 13,
      validation_density: 0.1083,
      validation_signal_share: 0.2321,
      bug_loop_count: 0,
      bug_loop_density: 0,
      bug_loop_signal_share: 0,
      demo_generation_count: 10,
      snippet_generation_count: 0,
      weak_signal_count: 10,
      weak_signal_ratio: 0.1786,
      strong_evidence_count: 12,
      strong_evidence_density: 0.1,
      strong_signal_type_count: 3,
      strong_evidence_source_count: 3,
      strong_record_density: 0.1,
      average_strong_evidence_per_source: 4,
      promotion_evidence_count: 48,
      promotion_record_count: 32,
      promotion_record_density: 0.2667,
      strong_evidence_record_count: 12,
      promotion_usable_signal_count: 12,
      promotion_usable_record_count: 8,
      promotion_usable_signal_ratio: 0.25,
      promotion_usable_record_ratio: 0.25,
      downgraded_assistant_signal_count: 32,
      downgraded_assistant_record_count: 18,
      downgraded_assistant_signal_ratio: 0.5714,
      downgraded_assistant_record_ratio: 0.15,
      average_promotion_signals_per_record: 1.5,
      user_control_count: 8,
      user_control_record_count: 8,
      user_control_signal_count: 8,
      user_control_source_count: 3,
      user_control_ratio: 0.1667,
      user_control_signal_ratio: 0.1667,
      behavior_counts: {
        user_decision: 18,
        user_instruction: 22,
        assistant_execution: 64,
        assistant_summary: 16,
      },
      promotion_behavior_counts: {
        user_decision: 8,
        assistant_execution: 36,
        assistant_summary: 4,
      },
      promotion_record_behavior_counts: {
        user_decision: 8,
        assistant_execution: 20,
        assistant_summary: 4,
      },
      promotion_signal_behavior_counts: {
        user_decision: 8,
        assistant_execution: 36,
        assistant_summary: 4,
      },
      user_decision_count: 18,
      user_instruction_count: 22,
      assistant_execution_count: 64,
      assistant_summary_count: 16,
      user_decision_ratio: 0.15,
      user_instruction_ratio: 0.1833,
      assistant_execution_ratio: 0.5333,
      assistant_summary_ratio: 0.1333,
      promotion_user_decision_ratio: 0.1667,
      promotion_assistant_execution_ratio: 0.75,
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
      tool_event_record_ratio: 0,
      tool_result_record_ratio: 0,
      non_scoring_record_ratio: 0.2941,
      note: "硬统计只描述样本质量和 AI 投入强度，不直接参与段位升品。",
    },
    stat_profile: {
      id: "assistant_self_report_heavy",
      label: "助手自述偏重型",
      summary: "高阶词不少，但大量来自助手自述完成；这能证明 AI 执行很多，不能直接证明人拥有系统。",
      controlReading: "用户决策占比达到七品复核线，但可升品高阶信号仍偏薄。",
      validationReading: "验证密度较好，系统结果有可托付证据；仍要确认验收是否由人定义。",
      investmentReading: "token 投入能说明 AI 使用强度，但不会直接抬高段位。",
      evidenceReading: "强记录存在，但助手自述被降权后，高阶证据厚度需要继续补强。",
      riskLevel: "high",
      ratingUse: "统计画像用于解释置信度、封顶和下一步，不直接升品。",
      reasons: [
        "用户决策 17%，用户系统级取舍足够强。",
        "验证密度 11%，结果有可托付证据。",
        "可升品信号 25%，高阶词里用户行为支撑不足。",
        "助手自述降权 32，助手完成类表述不计为强升品证据。",
      ],
      matchedRules: [
        { metric: "用户决策", observed: "17%", threshold: ">=12%", interpretation: "用户系统级取舍足够强。" },
        { metric: "验证密度", observed: "11%", threshold: ">=8%", interpretation: "结果有可托付证据。" },
        { metric: "可升品信号", observed: "25%", threshold: "<35%", interpretation: "高阶词里用户行为支撑不足。" },
        { metric: "助手自述降权", observed: "32", threshold: ">0", interpretation: "助手完成类表述不计为强升品证据。" },
      ],
      signals: [
        "用户决策 17%",
        "主动控制 17%",
        "助手执行 75%",
        "可升品信号 25%",
        "助手降权 32 条",
        "验证密度 11%",
        "强记录 10%",
      ],
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
        behavior_class: "user_decision",
        behavior_class_label: "用户决策",
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
        behavior_class: "assistant_execution",
        behavior_class_label: "助手执行",
        behavior: "已运行 build、lint、单元测试和截图 smoke check，并复查 diff。",
        proves: "用测试、构建、lint、回归或人工验收确认结果，而不是只看能不能跑。",
        supports_levels: [3, 5, 6],
        strength: "中",
        raw_strength: "强",
        judgment_note: "助手自述完成只能证明交付痕迹，不能作为升品强证据。",
        source: "codex:demo/session.jsonl:31",
        snippet: "已运行 build、lint、单元测试和截图 smoke check，并复查 diff。",
        usable_for_promotion: false,
      },
      {
        signal: "architecture",
        evidence_type: "架构判断证据",
        dimension: "系统设计",
        actor: "user",
        behavior_class: "user_decision",
        behavior_class_label: "用户决策",
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
    quality_flags: [
      {
        id: "stable_sample_span",
        severity: "ok",
        label: "样本跨度较好",
        metric: "6 天 / 3 个来源",
        message: "跨多天、多会话的证据比单次高光更可信。",
      },
      {
        id: "assistant_execution_watch",
        severity: "info",
        label: "助手执行占比较高",
        metric: "75%",
        message: "这不代表能力低，但需要更多用户决策证据来证明人在控。",
      },
    ],
    drag_factors: [
      {
        id: "demo_heavy",
        label: "Demo 生成偏重",
        metric: "18%",
        impact: "Demo 多说明生成速度强，但不能证明生产质量和系统拥有感。",
        advice: "为 Demo 补上验收、异常处理、数据边界和上线风险记录。",
      },
    ],
    rank_gates: [
      {
        id: "level7_user_decision_ratio",
        level: 7,
        label: "七品用户决策占比",
        passed: true,
        observed: 0.1667,
        required: 0.08,
        reason: "七品需要足够用户决策证据，证明人真正做边界、架构、验收或取舍。",
      },
      {
        id: "level8_team_replication",
        level: 8,
        label: "八品团队复制",
        passed: false,
        observed: { team_system: 0, workflow_asset: 6, method_replication_status: "线索" },
        required: { team_system: 3, workflow_asset: 3, method_replication_status: "成立|稳定" },
        reason: "八品需要团队方法复制强证据，自动初筛默认不会仅凭私有会话放行。",
      },
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
      behaviorClass: item.behavior_class || "",
      behaviorClassLabel: item.behavior_class_label || "",
      snippet: item.snippet || item.behavior || "",
      dimension: item.dimension || "",
      strength: item.strength || "",
      rawStrength: item.raw_strength || "",
      judgmentNote: item.judgment_note || "",
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
  const qualityFlags = sortQualityFlags(summary.quality_flags || []);
  const nextRankGap = isFinal
    ? copy.gap
    : `${copy.gap} 当前结果是自动初筛，高段位需要 AI 判定官基于证据卡复核。`;
  const report = {
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
    behaviorCounts: summary.behavior_counts || summary.hard_stats?.behavior_counts || {},
    promotionBehaviorCounts: summary.promotion_behavior_counts || summary.hard_stats?.promotion_behavior_counts || {},
    usageStats: summary.usage_stats || {},
    hardStats: summary.hard_stats || {},
    metricGroups: summary.metric_groups || [],
    statProfile: summary.stat_profile || {},
    statEvidence: summary.stat_evidence || {},
    dimensionProfile: summary.dimension_profile || [],
    verdict: copy.verdict,
    whyThisRank: copy.reason,
    whyNotNextRank: nextRankGap,
    evidence: evidenceRows,
    strongestEvidence: strongest,
    rankCaps,
    rankGates: summary.rank_gates || [],
    qualityFlags,
    dragFactors: summary.drag_factors || [],
    costEstimate: {},
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
  report.costEstimate = costEstimate(report, options);
  report.statsInsight = statsInsight(report);
  report.statProfile = Object.keys(report.statProfile || {}).length ? report.statProfile : statProfile(report);
  report.statEvidence = statEvidence(report);
  report.gateUpgradeAdvice = gateUpgradeAdvice(report, upgradePath[0]);
  report.hardStatCards = hardStatCards(report);
  report.metricGroups = report.metricGroups.length ? report.metricGroups : metricGroups(report);
  report.narrative.upgradeSummary = report.gateUpgradeAdvice;
  return report;
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

function linkAdvice(url) {
  const length = String(url || "").length;
  const warning = length > LONG_PUBLIC_URL_WARNING_LENGTH;
  return {
    length,
    threshold: LONG_PUBLIC_URL_WARNING_LENGTH,
    warning,
    message: warning
      ? "公开 #data 链接较长，建议改用 --short-link 生成短链接，或用 --write-link 写入完整链接文件。"
      : "",
    recommendedCommands: warning
      ? ["--short-link --open", "--write-link .airank/report-url.txt"]
      : [],
  };
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

function hasPromotionUsabilityStats(stats = {}) {
  return Object.prototype.hasOwnProperty.call(stats, "promotion_usable_signal_ratio")
    || Object.prototype.hasOwnProperty.call(stats, "promotion_usable_signal_count")
    || Object.prototype.hasOwnProperty.call(stats, "promotion_usable_record_count");
}

function promotionUsabilityRatio(stats = {}) {
  return hasPromotionUsabilityStats(stats) ? Number(stats.promotion_usable_signal_ratio || 0) : 1;
}

function rankLevelName(level) {
  return String(RANKS[Number(level)] || `${level}品`).split(" · ")[0];
}

function money(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return "$0";
  if (number < 1) return `$${number.toFixed(2)}`;
  if (number < 100) return `$${number.toFixed(1)}`;
  return `$${Math.round(number)}`;
}

function metricNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function costEstimate(report, options = {}) {
  const stats = report.hardStats || {};
  const usage = report.usageStats || {};
  const inputPrice = metricNumber(options.usdPerMillionInputTokens);
  const cachedPrice = metricNumber(options.usdPerMillionCachedInputTokens);
  const outputPrice = metricNumber(options.usdPerMillionOutputTokens);
  const reasoningPrice = metricNumber(options.usdPerMillionReasoningTokens);
  const hasAnyPrice = inputPrice || cachedPrice || outputPrice || reasoningPrice;
  if (!hasAnyPrice) {
    return {
      estimatedUsd: 0,
      configured: false,
      note: "未配置 token 单价；只展示 token 强度，不估算美元成本。",
    };
  }
  const cachedInputTokens = metricNumber(stats.cached_input_tokens ?? usage.cached_input_tokens);
  const inputTokens = metricNumber(stats.input_tokens ?? usage.input_tokens);
  const billableInputTokens = Math.max(0, inputTokens - cachedInputTokens);
  const outputTokens = metricNumber(stats.output_tokens ?? usage.output_tokens);
  const reasoningTokens = metricNumber(stats.reasoning_output_tokens ?? usage.reasoning_output_tokens);
  const cachedCost = cachedInputTokens * cachedPrice / 1_000_000;
  const inputCost = billableInputTokens * inputPrice / 1_000_000;
  const outputCost = outputTokens * outputPrice / 1_000_000;
  const reasoningCost = reasoningTokens * reasoningPrice / 1_000_000;
  const estimatedUsd = inputCost + cachedCost + outputCost + reasoningCost;
  return {
    estimatedUsd: Number(estimatedUsd.toFixed(4)),
    configured: true,
    currency: "USD",
    billableInputTokens,
    cachedInputTokens,
    outputTokens,
    reasoningTokens,
    pricesPerMillionTokens: {
      input: inputPrice,
      cachedInput: cachedPrice,
      output: outputPrice,
      reasoning: reasoningPrice,
    },
    note: "成本为用户提供单价后的粗略估算；套餐、缓存计费和模型价格可能不同，不参与段位升品。",
  };
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
  if (report.costEstimate?.configured) parts.push(`估算成本 ${money(report.costEstimate.estimatedUsd)}`);
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

function behaviorMixLine(report) {
  const stats = report.hardStats || {};
  const userDecision = stats.promotion_user_decision_ratio ?? stats.user_decision_ratio ?? 0;
  const assistantExecution = stats.promotion_assistant_execution_ratio ?? 0;
  const usablePromotion = hasPromotionUsabilityStats(stats) ? stats.promotion_usable_signal_ratio ?? 0 : 0;
  const downgradedAssistant = stats.downgraded_assistant_signal_count ?? 0;
  const parts = [];
  if (userDecision) parts.push(`用户决策 ${formatPercent(userDecision)}`);
  if (assistantExecution) parts.push(`助手执行 ${formatPercent(assistantExecution)}`);
  if (usablePromotion) parts.push(`可升品信号 ${formatPercent(usablePromotion)}`);
  if (downgradedAssistant) parts.push(`助手降权 ${downgradedAssistant} 条`);
  if (stats.user_decision_count) parts.push(`决策证据 ${stats.user_decision_count} 条`);
  return parts.join(", ");
}

function firstFailedGate(report) {
  const gates = Array.isArray(report.rankGates) ? report.rankGates : [];
  const currentLevel = Number(report.rank?.level || 0);
  return gates
    .filter((item) => item && item.passed === false && Number(item.level || 0) > currentLevel)
    .sort((a, b) => Number(a.level || 0) - Number(b.level || 0))[0]
    || gates.find((item) => item && item.passed === false);
}

function rankGateLine(report) {
  const failed = firstFailedGate(report);
  if (!failed) return "当前关键门槛已通过，继续看下一品证据缺口。";
  return `${failed.label || failed.id}未通过：${shortText(failed.reason || "", 56)}`;
}

function gateUpgradeAdvice(report, fallback = "") {
  const failed = firstFailedGate(report);
  if (failed?.id && GATE_UPGRADE_ADVICE[failed.id]) return GATE_UPGRADE_ADVICE[failed.id];
  if (failed?.reason) return `先补齐这个门槛：${failed.reason}`;
  return fallback || "继续积累真实项目证据，并把成功做法沉淀成可复用工作流。";
}

function sortQualityFlags(flags) {
  const priority = { risk: 0, warning: 1, info: 2, ok: 3 };
  return [...(Array.isArray(flags) ? flags : [])].sort(
    (a, b) => (priority[a?.severity] ?? 9) - (priority[b?.severity] ?? 9),
  );
}

function qualityFlagLine(report) {
  const flags = sortQualityFlags(report.qualityFlags);
  if (!flags.length) return "暂无明显样本风险。";
  return flags
    .slice(0, 3)
    .map((item) => `${item.label || item.id}${item.metric ? ` ${item.metric}` : ""}：${item.message || ""}`)
    .join("；");
}

function dragFactorLine(report) {
  const factors = Array.isArray(report.dragFactors) ? report.dragFactors : [];
  if (!factors.length) return "暂无明显拖累项。";
  return factors
    .slice(0, 3)
    .map((item) => `${item.label || item.id}${item.metric ? ` ${item.metric}` : ""}：${item.impact || item.advice || ""}`)
    .join("；");
}

function statProfileLine(report) {
  const profile = report.statProfile || {};
  if (!profile.label && !profile.summary) return "";
  const signals = Array.isArray(profile.signals) && profile.signals.length
    ? `（${profile.signals.slice(0, 4).join("，")}）`
    : "";
  const reasons = Array.isArray(profile.reasons) && profile.reasons.length
    ? ` 依据：${profile.reasons.slice(0, 2).join("；")}`
    : "";
  return `${profile.label || "统计画像"}：${profile.summary || ""}${signals}${reasons}`;
}

function statEvidenceLine(report) {
  const evidence = report.statEvidence || {};
  if (!evidence.label && !evidence.conclusion) return "";
  const support = evidence.supportLabel || (evidence.supportLevel !== undefined ? `${evidence.supportLevel}品统计支撑` : "");
  const confidence = evidence.confidenceImpact ? `；${evidence.confidenceImpact}` : "";
  return `${evidence.label || "硬统计证据"}${support ? `（${support}）` : ""}：${evidence.conclusion || ""}${confidence}`;
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

function statEvidence(report) {
  const stats = report.hardStats || {};
  const level = Number(report.rank?.level || 0);
  const activeDays = Number(stats.active_days || 0);
  const sourceCount = Number(stats.source_count || report.userControlSourceCount || 0);
  const analyzed = Number(stats.analyzed_record_count ?? report.analyzedRecordCount ?? 0);
  const promotionRecordCount = Number(stats.promotion_record_count || 0);
  const strongRecordDensity = Number(stats.strong_record_density || 0);
  const signalCoverageRatio = Number(stats.signal_coverage_ratio || 0);
  const establishedDimensions = Number(stats.established_dimension_count || 0);
  const userControlRatio = Number(stats.user_control_ratio || 0);
  const userDecisionRatio = Number(stats.promotion_user_decision_ratio ?? stats.user_decision_ratio ?? 0);
  const validationDensity = Number(stats.validation_density || 0);
  const assistantExecutionRatio = Number(stats.promotion_assistant_execution_ratio || 0);
  const hasUsabilityStats = hasPromotionUsabilityStats(stats);
  const usablePromotionRatio = promotionUsabilityRatio(stats);
  const downgradedAssistantCount = Number(stats.downgraded_assistant_signal_count || 0);
  const bugLoopDensity = Number(stats.bug_loop_density || 0);
  const peakDayShare = Number(stats.peak_day_token_share || 0);
  const totalTokens = Number(stats.total_tokens || report.usageStats?.total_tokens || 0);
  const positiveSignals = [];
  const riskSignals = [];
  const investmentSignals = [];
  let supportLevel = 3;

  const addPositive = (text) => {
    if (text) positiveSignals.push(text);
  };
  const addRisk = (text) => {
    if (text) riskSignals.push(text);
  };

  if (activeDays >= 5 || sourceCount >= 3) {
    addPositive(`样本跨 ${activeDays || "未知"} 天、${sourceCount || "未知"} 个来源，稳定性好于单次高光。`);
  } else if (analyzed < 20 || sourceCount < 2) {
    addRisk(`样本只有 ${analyzed} 条有效记录、${sourceCount} 个来源，高段位置信度不足。`);
  }

  if (userDecisionRatio >= 0.08) {
    addPositive(`用户决策 ${formatPercent(userDecisionRatio)}，达到七品复核线。`);
  } else if (userDecisionRatio >= 0.03) {
    addPositive(`用户决策 ${formatPercent(userDecisionRatio)}，可支撑六品复核。`);
  } else {
    addRisk(`用户决策 ${formatPercent(userDecisionRatio)}，系统级取舍证据不足。`);
  }

  if (userControlRatio >= 0.1) {
    addPositive(`主动控制 ${formatPercent(userControlRatio)}，人在定义目标、边界、架构和验收。`);
  } else if (userControlRatio > 0 && userControlRatio < 0.05) {
    addRisk(`主动控制 ${formatPercent(userControlRatio)}，高阶信号容易被助手自述稀释。`);
  }

  if (validationDensity >= 0.08) {
    addPositive(`验证密度 ${formatPercent(validationDensity)}，结果有可托付证据。`);
  } else if (validationDensity < 0.03) {
    addRisk(`验证密度 ${formatPercent(validationDensity)}，闭环不足会压住六品。`);
  }

  if (establishedDimensions >= 5 && signalCoverageRatio >= 0.5) {
    addPositive(`成立维度 ${establishedDimensions}/6、信号覆盖 ${formatPercent(signalCoverageRatio)}，能力结构较完整。`);
  } else if (establishedDimensions < 4) {
    addRisk(`成立维度 ${establishedDimensions}/6，系统能力结构还不完整。`);
  }

  if (strongRecordDensity >= 0.1) {
    addPositive(`强记录占比 ${formatPercent(strongRecordDensity)}，可复核高阶证据足够厚。`);
  } else if (strongRecordDensity < 0.05 || promotionRecordCount < 4) {
    addRisk(`强记录占比 ${formatPercent(strongRecordDensity)}、高阶记录 ${promotionRecordCount} 条，高段位证据偏薄。`);
  }

  if (assistantExecutionRatio >= 0.7) {
    addRisk(`助手执行 ${formatPercent(assistantExecutionRatio)}，需要确认高阶结论不是 AI 自述完成。`);
  }
  if (hasUsabilityStats && usablePromotionRatio > 0 && usablePromotionRatio < 0.35) {
    addRisk(`可升品高阶信号 ${formatPercent(usablePromotionRatio)}，高阶词里用户行为支撑不足。`);
  }
  if (downgradedAssistantCount > 0) {
    addRisk(`${downgradedAssistantCount} 条助手自述高阶信号已降权，不计为强升品证据。`);
  }
  if (bugLoopDensity >= 0.08) {
    addRisk(`返工压力 ${formatPercent(bugLoopDensity)}，可能仍困在局部 patch 循环。`);
  }
  if (peakDayShare >= 0.5) {
    addRisk(`峰值日 token 占比 ${formatPercent(peakDayShare)}，投入集中会削弱稳定性判断。`);
  }
  if (totalTokens > 0) {
    investmentSignals.push(`总 token ${formatTokens(totalTokens)}`);
  }
  if (stats.peak_day_tokens) {
    investmentSignals.push(`峰值日 ${formatTokens(stats.peak_day_tokens)}`);
  }
  if (report.costEstimate?.configured) {
    investmentSignals.push(`估算成本 ${money(report.costEstimate.estimatedUsd)}`);
  }

  if (
    userDecisionRatio >= 0.08
    && userControlRatio >= 0.1
    && validationDensity >= 0.08
    && establishedDimensions >= 5
    && strongRecordDensity >= 0.08
    && usablePromotionRatio >= 0.35
    && sourceCount >= 3
  ) {
    supportLevel = 7;
  } else if (
    userDecisionRatio >= 0.03
    && userControlRatio >= 0.05
    && validationDensity > 0
    && establishedDimensions >= 4
    && promotionRecordCount >= 4
    && usablePromotionRatio >= 0.25
  ) {
    supportLevel = 6;
  } else if (validationDensity > 0 && establishedDimensions >= 3) {
    supportLevel = 5;
  } else if (userControlRatio > 0 || validationDensity > 0) {
    supportLevel = 4;
  }

  let confidenceImpact = "提高置信度";
  if (
    riskSignals.length >= 3
    || strongRecordDensity < 0.05
    || userDecisionRatio < 0.03
    || assistantExecutionRatio >= 0.7
    || (hasUsabilityStats && usablePromotionRatio > 0 && usablePromotionRatio < 0.35)
  ) {
    confidenceImpact = "降低置信度并可能封顶";
  } else if (riskSignals.length) {
    confidenceImpact = "局部降低置信度";
  }

  let label = "硬统计支撑";
  if (supportLevel >= level) {
    label = "硬统计支撑当前段位";
  } else if (supportLevel < level) {
    label = "硬统计低于当前段位";
  }

  const rankText = report.rank?.label || rankLevelName(level);
  const conclusion = supportLevel >= level
    ? `数字侧能支撑${rankText}的可信度，但不会单独升品。`
    : `数字侧最多稳定支撑到${rankLevelName(supportLevel)}，当前段位需要依赖行为证据和 AI 深度复核。`;

  return {
    id: supportLevel >= level ? "supports_current_rank" : "caps_confidence",
    label,
    supportLevel,
    supportLabel: `${rankLevelName(supportLevel)}统计支撑`,
    confidenceImpact,
    conclusion,
    positiveSignals: positiveSignals.slice(0, 4),
    riskSignals: riskSignals.slice(0, 4),
    investmentSignals: investmentSignals.slice(0, 3),
    ratingUse: "硬统计用于支撑置信度、解释封顶和定位下一步；token 和成本只说明投入强度，不能直接升品。",
  };
}

function statProfile(report) {
  const stats = report.hardStats || {};
  const totalTokens = Number(stats.total_tokens || 0);
  const activeDays = Number(stats.active_days || 0);
  const promotionRecordCount = Number(stats.promotion_record_count || 0);
  const establishedDimensions = Number(stats.established_dimension_count || 0);
  const stableDimensions = Number(stats.stable_dimension_count || 0);
  const userControlRatio = Number(stats.user_control_ratio || 0);
  const userDecisionRatio = Number(stats.promotion_user_decision_ratio ?? stats.user_decision_ratio ?? 0);
  const assistantExecutionRatio = Number(stats.promotion_assistant_execution_ratio || 0);
  const hasUsabilityStats = hasPromotionUsabilityStats(stats);
  const usablePromotionRatio = promotionUsabilityRatio(stats);
  const downgradedAssistantCount = Number(stats.downgraded_assistant_signal_count || 0);
  const validationDensity = Number(stats.validation_density || 0);
  const strongRecordDensity = Number(stats.strong_record_density || 0);
  const signalCoverageRatio = Number(stats.signal_coverage_ratio || 0);
  const bugLoopDensity = Number(stats.bug_loop_density || 0);
  const peakDayShare = Number(stats.peak_day_token_share || 0);
  const weakSignalRatio = Number(stats.weak_signal_ratio || 0);
  const reasons = [];
  const matchedRules = [];
  const addReason = (metric, observed, threshold, interpretation) => {
    reasons.push(`${metric} ${observed}，${interpretation}`);
    matchedRules.push({ metric, observed, threshold, interpretation });
  };

  if (userDecisionRatio >= 0.12) {
    addReason("用户决策", formatPercent(userDecisionRatio), ">=12%", "用户系统级取舍足够强。");
  } else if (userDecisionRatio >= 0.08) {
    addReason("用户决策", formatPercent(userDecisionRatio), ">=8%", "达到七品复核线。");
  } else if (userDecisionRatio < 0.05) {
    addReason("用户决策", formatPercent(userDecisionRatio), "<5%", "人在控证据偏弱。");
  }
  if (validationDensity >= 0.08) {
    addReason("验证密度", formatPercent(validationDensity), ">=8%", "结果有可托付证据。");
  } else if (validationDensity < 0.03) {
    addReason("验证密度", formatPercent(validationDensity), "<3%", "验证闭环偏弱。");
  }
  if (establishedDimensions >= 5) {
    addReason("成立维度", `${establishedDimensions}/6`, ">=5/6", "能力结构比较完整。");
  } else if (establishedDimensions >= 4) {
    addReason("成立维度", `${establishedDimensions}/6`, ">=4/6", "有系统化线索但还需验证。");
  }
  if (totalTokens >= 500_000) {
    addReason("token 投入", `${Math.round(totalTokens / 10000)}万`, ">=50万", "AI 使用强度很高。");
  }
  if (hasUsabilityStats && usablePromotionRatio < 0.35) {
    addReason("可升品信号", formatPercent(usablePromotionRatio), "<35%", "高阶词里用户行为支撑不足。");
  }
  if (downgradedAssistantCount > 0) {
    addReason("助手自述降权", String(downgradedAssistantCount), ">0", "助手完成类表述不计为强升品证据。");
  }
  if (bugLoopDensity >= 0.08) {
    addReason("返工压力", formatPercent(bugLoopDensity), ">=8%", "容易陷入局部修补循环。");
  }
  if (weakSignalRatio >= 0.35) {
    addReason("弱信号", formatPercent(weakSignalRatio), ">=35%", "Demo、片段或修补占比偏高。");
  }
  if (peakDayShare >= 0.5) {
    addReason("峰值日 token", formatPercent(peakDayShare), ">=50%", "投入集中在少数日期。");
  }
  if (strongRecordDensity < 0.05) {
    addReason("强记录", formatPercent(strongRecordDensity), "<5%", "高阶强证据偏薄。");
  } else if (strongRecordDensity >= 0.1) {
    addReason("强记录", formatPercent(strongRecordDensity), ">=10%", "有可复核的高阶证据。");
  }

  let profile = {
    id: "balanced_operator",
    label: "均衡推进型",
    summary: "投入、样本、验证和控制力没有明显单点失衡；段位主要取决于证据链能否继续补强。",
    riskLevel: "low",
  };

  if (userDecisionRatio >= 0.12 && validationDensity >= 0.08 && establishedDimensions >= 5 && usablePromotionRatio >= 0.35) {
    profile = {
      id: "system_owner",
      label: "系统拥有型",
      summary: "硬统计显示，人类决策、验证闭环和多维能力同时成立；这类样本更像人在拥有系统，而不是 AI 自述完成。",
      riskLevel: "low",
    };
  } else if (totalTokens >= 500_000 && userDecisionRatio < 0.05) {
    profile = {
      id: "ai_labor_dependent",
      label: "AI 代工依赖型",
      summary: "token 投入很高，但用户决策占比偏低；这说明 AI 很忙，不等于人真正拥有系统。",
      riskLevel: "high",
    };
  } else if (hasUsabilityStats && usablePromotionRatio < 0.35 && downgradedAssistantCount > 0) {
    profile = {
      id: "assistant_self_report_heavy",
      label: "助手自述偏重型",
      summary: "高阶词不少，但大量来自助手自述完成；这能证明 AI 执行很多，不能直接证明人拥有系统。",
      riskLevel: "high",
    };
  } else if (validationDensity < 0.03 && establishedDimensions >= 4) {
    profile = {
      id: "architecture_floating",
      label: "架构悬浮型",
      summary: "目标、边界或架构线索不少，但验证闭环偏弱；系统看起来被设计了，但还没有被可靠托付。",
      riskLevel: "high",
    };
  } else if (bugLoopDensity >= 0.08 || weakSignalRatio >= 0.35) {
    profile = {
      id: "rework_trapped",
      label: "返工消耗型",
      summary: "弱信号、Demo 或修补循环占比较高；这类样本容易证明努力很多，却难证明系统归属稳定。",
      riskLevel: "high",
    };
  } else if (peakDayShare >= 0.5 && activeDays <= 2) {
    profile = {
      id: "burst_operator",
      label: "爆量冲刺型",
      summary: "token 明显集中在少数日期，更像一次冲刺高光；需要跨天复用来证明稳定能力。",
      riskLevel: "medium",
    };
  } else if (strongRecordDensity < 0.05 || promotionRecordCount < 4) {
    profile = {
      id: "thin_evidence",
      label: "证据偏薄型",
      summary: "可评分记录或强记录偏少；当前更适合低置信度初筛，不适合直接判断高段位。",
      riskLevel: "high",
    };
  }

  return {
    ...profile,
    controlReading: userDecisionRatio >= 0.08
      ? "用户决策占比达到七品复核线，能支撑“人在控”的判断。"
      : userDecisionRatio >= 0.03
        ? "用户决策占比能支撑六品复核，但进入七品仍需更多系统级取舍。"
        : "用户决策占比偏低，高阶结论容易被助手执行痕迹稀释。",
    validationReading: validationDensity >= 0.08
      ? "验证密度较好，系统结果有可托付证据。"
      : validationDensity > 0
        ? "有验证信号，但密度不足，需要确认是否由人定义验收标准。"
        : "未看到验证闭环，不能证明结果可托付。",
    investmentReading: peakDayShare >= 0.5
      ? "token 投入单日集中，稳定性需要打折。"
      : totalTokens > 0
        ? "token 投入能说明 AI 使用强度，但不会直接抬高段位。"
        : "未读取到 token 统计，投入强度无法量化。",
    evidenceReading: strongRecordDensity >= 0.1 && signalCoverageRatio >= 0.5
      ? "强记录和信号覆盖足以支撑较高置信度复核。"
      : strongRecordDensity >= 0.05
        ? "强记录存在，但覆盖还不够厚，需要更多不同任务证据。"
        : "强记录偏薄，自动初筛应保守。",
    ratingUse: "统计画像用于解释置信度、封顶和下一步，不直接升品。",
    reasons: reasons.slice(0, 4),
    matchedRules: matchedRules.slice(0, 4),
    signals: [
      `用户决策 ${formatPercent(userDecisionRatio)}`,
      `主动控制 ${formatPercent(userControlRatio)}`,
      `助手执行 ${formatPercent(assistantExecutionRatio)}`,
      hasUsabilityStats ? `可升品信号 ${formatPercent(usablePromotionRatio)}` : "",
      `助手降权 ${downgradedAssistantCount} 条`,
      `验证密度 ${formatPercent(validationDensity)}`,
      `强记录 ${formatPercent(strongRecordDensity)}`,
      `成立维度 ${establishedDimensions}/6`,
      `稳定维度 ${stableDimensions}/6`,
      `峰值日 token ${formatPercent(peakDayShare)}`,
    ].filter(Boolean),
  };
}

function hardStatCards(report) {
  const stats = report.hardStats || {};
  const usage = report.usageStats || {};
  const totalTokens = stats.total_tokens || usage.total_tokens || 0;
  const activeDays = stats.active_days || usage.active_days || 0;
  const activeSessions = stats.active_sessions || usage.active_sessions || 0;
  const peakDayShare = stats.peak_day_token_share || usage.peak_day_token_share || 0;
  const scorableRatio = stats.scorable_record_ratio || 0;
  const strongDensity = stats.strong_evidence_density || 0;
  const strongRecordDensity = stats.strong_record_density || 0;
  const userControlRatio = stats.user_control_ratio || 0;
  const userDecisionRatio = stats.promotion_user_decision_ratio ?? stats.user_decision_ratio ?? 0;
  const assistantExecutionRatio = stats.promotion_assistant_execution_ratio || 0;
  const usablePromotionRatio = hasPromotionUsabilityStats(stats) ? stats.promotion_usable_signal_ratio || 0 : 0;
  const downgradedAssistantCount = stats.downgraded_assistant_signal_count || 0;
  const signalCoverageRatio = stats.signal_coverage_ratio || 0;
  const establishedDimensions = stats.established_dimension_count || 0;
  const validationDensity = stats.validation_density || 0;
  const bugLoopDensity = stats.bug_loop_density || 0;
  const toolEventRatio = stats.tool_event_record_ratio || 0;
  const cost = report.costEstimate || {};

  return [
    {
      id: "ai_investment",
      label: "AI 投入强度",
      value: totalTokens ? `${formatTokens(totalTokens)} token` : "暂无",
      detail: activeDays || activeSessions ? `活跃 ${activeDays || 0} 天 / ${activeSessions || 0} 会话` : "未读取到 token 统计",
      interpretation: "只说明 AI 使用投入，不直接参与段位升品。",
    },
    {
      id: "estimated_cost",
      label: "成本估算",
      value: cost.configured ? money(cost.estimatedUsd) : "未配置",
      detail: cost.configured ? "按用户传入单价粗估" : "可传入 token 单价",
      interpretation: "成本用于理解 AI 投入强度，不参与段位升品。",
    },
    {
      id: "sample_stability",
      label: "样本稳定性",
      value: activeDays ? `${activeDays} 天` : "暂无",
      detail: peakDayShare ? `峰值日占比 ${formatPercent(peakDayShare)}` : "缺少峰值日统计",
      interpretation: peakDayShare >= 0.5 ? "token 过于集中，稳定性会被打折。" : "样本越分散，越能证明稳定工作方式。",
    },
    {
      id: "sample_validity",
      label: "有效样本",
      value: scorableRatio ? formatPercent(scorableRatio) : "暂无",
      detail: `${stats.analyzed_record_count ?? report.analyzedRecordCount ?? 0}/${stats.scoring_candidate_record_count ?? report.recordCount ?? 0} 条可分析`,
      interpretation: "排除系统上下文、token 统计和工具结果后，只看真实行为。",
    },
    {
      id: "strong_evidence_density",
      label: "强证据密度",
      value: strongDensity ? formatPercent(strongDensity) : "0%",
      detail: `${stats.strong_evidence_count ?? report.strongEvidenceCount ?? 0} 条强证据`,
      interpretation: "强证据越密，越能支撑高段位；低密度会降低置信度。",
    },
    {
      id: "strong_record_density",
      label: "强记录占比",
      value: strongRecordDensity ? formatPercent(strongRecordDensity) : "0%",
      detail: `${stats.strong_evidence_record_count ?? 0}/${stats.analyzed_record_count ?? report.analyzedRecordCount ?? 0} 条记录`,
      interpretation: "按记录去重看强证据，防止一条长消息反复命中。",
    },
    {
      id: "promotion_record_quality",
      label: "高阶记录质量",
      value: stats.promotion_record_count ? `${stats.promotion_record_count} 条` : "暂无",
      detail: stats.average_promotion_signals_per_record ? `平均 ${stats.average_promotion_signals_per_record} 个信号/条` : "按记录去重后统计",
      interpretation: "防止一条长消息命中多个关键词后被重复当成高阶证据。",
    },
    {
      id: "usable_promotion_signal",
      label: "可升品高阶信号",
      value: usablePromotionRatio ? formatPercent(usablePromotionRatio) : "0%",
      detail: `${stats.promotion_usable_signal_count || 0}/${stats.promotion_evidence_count || 0} 个高阶信号`,
      interpretation: "只统计由用户行为支撑、可用于升品的高阶证据。",
    },
    {
      id: "assistant_self_report_downgrade",
      label: "助手自述降权",
      value: downgradedAssistantCount ? `${downgradedAssistantCount} 条` : "0 条",
      detail: `${stats.downgraded_assistant_record_count || 0} 条记录受影响`,
      interpretation: "助手说“已完成/已验证/已重构”只算交付痕迹，不算强升品证据。",
    },
    {
      id: "user_control",
      label: "用户主动控制",
      value: userControlRatio ? formatPercent(userControlRatio) : "0%",
      detail: `${stats.user_control_count ?? report.userControlCount ?? 0} 条主动控制证据`,
      interpretation: "衡量你是否在定义目标、边界、架构和验收。",
    },
    {
      id: "user_decision",
      label: "用户决策占比",
      value: userDecisionRatio ? formatPercent(userDecisionRatio) : "0%",
      detail: assistantExecutionRatio ? `助手执行 ${formatPercent(assistantExecutionRatio)}` : "缺少行为结构统计",
      interpretation: "高段位必须看到人的系统级决策，而不是 AI 自述完成。",
    },
    {
      id: "validation_density",
      label: "验证闭环密度",
      value: validationDensity ? formatPercent(validationDensity) : "0%",
      detail: `${stats.validation_count || 0} 条验证信号`,
      interpretation: "测试、构建、lint、截图和人工验收越稳定，结果越可托付。",
    },
    {
      id: "rework_pressure",
      label: "返工压力",
      value: bugLoopDensity ? formatPercent(bugLoopDensity) : "0%",
      detail: `${stats.bug_loop_count || 0} 条 Bug 循环信号`,
      interpretation: bugLoopDensity >= 0.08 ? "返工压力高，说明迭代控制可能还停在局部 patch。" : "返工信号不高，说明协作没有明显困在修补循环。",
    },
    {
      id: "automation_noise",
      label: "工具事件占比",
      value: toolEventRatio ? formatPercent(toolEventRatio) : "0%",
      detail: `${stats.tool_event_record_count || 0} 条工具事件已排除`,
      interpretation: "工具调用、补丁事件和命令结果不直接评分，只用于解释样本结构。",
    },
    {
      id: "signal_coverage",
      label: "信号覆盖度",
      value: signalCoverageRatio ? formatPercent(signalCoverageRatio) : "暂无",
      detail: `${stats.signal_type_count || 0}/${Object.keys(SIGNAL_LABELS).length} 类信号`,
      interpretation: "覆盖目标、边界、验证、架构、归属、工作流，才不容易误判。",
    },
    {
      id: "dimension_maturity",
      label: "维度成熟度",
      value: `${establishedDimensions}/6`,
      detail: `${stats.stable_dimension_count || 0} 个稳定维度`,
      interpretation: "六维能力越均衡，越接近真正拥有系统。",
    },
  ];
}

function metricGroups(report) {
  const stats = report.hardStats || {};
  const usage = report.usageStats || {};
  const cost = report.costEstimate || {};
  const totalTokens = stats.total_tokens || usage.total_tokens || 0;
  const activeDays = stats.active_days || usage.active_days || 0;
  const activeSessions = stats.active_sessions || usage.active_sessions || 0;
  const peakDayShare = Number(stats.peak_day_token_share || usage.peak_day_token_share || 0);
  const analyzed = stats.analyzed_record_count ?? report.analyzedRecordCount ?? 0;
  const candidate = stats.scoring_candidate_record_count ?? report.recordCount ?? analyzed;
  const sourceCount = stats.source_count || report.userControlSourceCount || 0;
  const strongRecordDensity = Number(stats.strong_record_density || 0);
  const userDecisionRatio = Number(stats.promotion_user_decision_ratio ?? stats.user_decision_ratio ?? 0);
  const userControlRatio = Number(stats.user_control_ratio || 0);
  const validationDensity = Number(stats.validation_density || 0);
  const bugLoopDensity = Number(stats.bug_loop_density || 0);
  const assistantExecutionRatio = Number(stats.promotion_assistant_execution_ratio || 0);
  const usablePromotionRatio = hasPromotionUsabilityStats(stats) ? Number(stats.promotion_usable_signal_ratio || 0) : 0;
  const downgradedAssistantCount = Number(stats.downgraded_assistant_signal_count || 0);
  const signalCoverageRatio = Number(stats.signal_coverage_ratio || 0);
  const establishedDimensions = Number(stats.established_dimension_count || 0);
  const nonScoringRatio = Number(stats.non_scoring_record_ratio || 0);
  const costText = cost.configured ? `，估算成本 ${money(cost.estimatedUsd)}` : "";

  return [
    {
      id: "investment",
      label: "投入强度",
      value: totalTokens ? `${formatTokens(totalTokens)} token` : "暂无",
      signal: activeDays || activeSessions ? `活跃 ${activeDays || 0} 天 / ${activeSessions || 0} 会话${costText}` : "未读取到 token 统计",
      basis: peakDayShare ? `峰值日占比 ${formatPercent(peakDayShare)}` : "缺少峰值日分布",
      ratingImpact: "只解释 AI 使用投入和样本稳定性，不直接升品。",
      risk: peakDayShare >= 0.5 ? "token 单日集中，稳定性会被打折。" : "投入分布没有明显单日集中风险。",
    },
    {
      id: "sample_quality",
      label: "样本可信度",
      value: `${analyzed}/${candidate}`,
      signal: `证据来源 ${sourceCount || 0} 个，强记录占比 ${formatPercent(strongRecordDensity)}`,
      basis: `非评分记录占比 ${formatPercent(nonScoringRatio)}，信号覆盖 ${formatPercent(signalCoverageRatio)}`,
      ratingImpact: "影响置信度和高段位封顶；样本薄时不能判六品以上。",
      risk: strongRecordDensity < 0.05 ? "强记录偏薄，需要更多真实任务证据。" : "样本里有可复核的强证据。",
    },
    {
      id: "human_control",
      label: "人类控制",
      value: formatPercent(userDecisionRatio || userControlRatio),
      signal: `主动控制 ${formatPercent(userControlRatio)}，用户决策 ${formatPercent(userDecisionRatio)}`,
      basis: assistantExecutionRatio
        ? `助手执行 ${formatPercent(assistantExecutionRatio)}；可升品信号 ${formatPercent(usablePromotionRatio)}`
        : "缺少助手执行占比",
      ratingImpact: "决定六品、七品能否成立；高段位必须看到人的系统级决策。",
      risk: userDecisionRatio < 0.03 ? "用户决策占比偏低，容易被封顶五品。" : "用户决策足以支撑更高段位复核。",
    },
    {
      id: "validation_loop",
      label: "验证闭环",
      value: formatPercent(validationDensity),
      signal: `${stats.validation_count || 0} 条验证信号`,
      basis: `${establishedDimensions}/6 个维度成立`,
      ratingImpact: "验证不足会压住六品；测试、构建、lint、截图和人工验收是主要证据。",
      risk: validationDensity <= 0 ? "未看到验证闭环，系统结果不可托付。" : "有验证信号，但仍要看是否由人定义验收标准。",
    },
    {
      id: "efficiency_risk",
      label: "效率风险",
      value: formatPercent(bugLoopDensity),
      signal: `${stats.bug_loop_count || 0} 条 Bug 循环信号`,
      basis: stats.weak_signal_ratio ? `弱信号占比 ${formatPercent(stats.weak_signal_ratio)}` : "缺少弱信号占比",
      ratingImpact: "返工和弱信号不直接扣分，但会解释为什么系统归属不稳。",
      risk: downgradedAssistantCount
        ? `${downgradedAssistantCount} 条助手自述已降权。`
        : bugLoopDensity >= 0.08 ? "返工压力高，可能仍停在局部 patch 循环。" : "没有明显困在修补循环。",
    },
  ];
}

function publicMetricGroups(groups) {
  return (Array.isArray(groups) ? groups : [])
    .slice(0, 5)
    .map((item) => pickFields(item, PUBLIC_METRIC_GROUP_FIELDS));
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

function shareHardStatCards(cards) {
  const priority = new Map(SHARE_HARD_CARD_PRIORITY.map((id, index) => [id, index]));
  return [...(Array.isArray(cards) ? cards : [])]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aPriority = priority.has(a.item?.id) ? priority.get(a.item.id) : 999;
      const bPriority = priority.has(b.item?.id) ? priority.get(b.item.id) : 999;
      return aPriority - bPriority || a.index - b.index;
    })
    .slice(0, 8)
    .map(({ item }) => item);
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
  const behaviorMix = behaviorMixLine(report) || "暂无行为结构统计";
  const rankGate = rankGateLine(report);
  const qualityFlags = qualityFlagLine(report);
  const dragFactors = dragFactorLine(report);
  const insight = statsInsight(report);
  const profile = report.statProfile || statProfile(report);
  const profileSignals = Array.isArray(profile.signals) ? profile.signals.slice(0, 6).join("，") : "";
  const profileReasons = Array.isArray(profile.reasons) ? profile.reasons.slice(0, 3).join("；") : "";
  const statEvidenceRow = report.statEvidence || statEvidence(report);
  const statEvidenceSignals = [
    ...(Array.isArray(statEvidenceRow.positiveSignals) ? statEvidenceRow.positiveSignals.slice(0, 2) : []),
    ...(Array.isArray(statEvidenceRow.riskSignals) ? statEvidenceRow.riskSignals.slice(0, 2) : []),
  ].join("；");
  const rankCap = shortText(report.rankCaps?.[0] || report.narrative?.capSummary || "暂无明显封顶原因", 52);
  const upgrade = shortText(report.gateUpgradeAdvice || report.upgradePath?.[0] || report.narrative?.upgradeSummary || "继续沉淀可复用工作流", 52);
  const hardCards = shareHardStatCards(report.hardStatCards)
    .map((item) => `${item.label} ${item.value}：${shortText(item.interpretation, 24)}`)
    .join("；");
  const metricRows = (report.metricGroups || metricGroups(report))
    .slice(0, 5)
    .map((item) => `${item.label} ${item.value}：${shortText(item.ratingImpact || item.risk || "", 28)}`)
    .join("；");
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

硬指标卡：
${hardCards || "AI 投入强度、成本估算、用户决策占比、用户主动控制、验证闭环密度、返工压力"}

统计仪表盘：
${metricRows || "投入强度、样本可信度、人类控制、验证闭环、效率风险"}

证据结构：
${evidenceStats}

行为结构：
${behaviorMix}

统计解读：
${insight}

硬统计证据结论：
${statEvidenceRow.label || "硬统计证据"}：${statEvidenceRow.conclusion || ""}
${statEvidenceRow.supportLabel || ""}；${statEvidenceRow.confidenceImpact || ""}
${statEvidenceSignals ? `关键依据：${statEvidenceSignals}` : ""}
${statEvidenceRow.ratingUse || "硬统计用于支撑置信度、解释封顶和定位下一步；token 和成本只说明投入强度，不能直接升品。"}

统计画像：
${profile.label || "统计画像"}：${profile.summary || ""}
${profileSignals ? `关键数字：${profileSignals}` : ""}
${profileReasons ? `画像依据：${profileReasons}` : ""}
${profile.ratingUse || "统计画像用于解释置信度、封顶和下一步，不直接升品。"}

关键门槛：
${rankGate}

质量提示：
${qualityFlags}

拖累项 / 返工压力：
${dragFactors}

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

function buildJudgePrompt(report, url = "") {
  const rank = report.rank || {};
  const nextRank = report.nextRank || {};
  const hardCards = shareHardStatCards(report.hardStatCards)
    .map((item) => `- ${item.label}：${item.value}；${item.detail || ""}；${item.interpretation || ""}`)
    .join("\n");
  const metricRows = (report.metricGroups || metricGroups(report))
    .slice(0, 5)
    .map((item) => `- ${item.label}：${item.value}；${item.signal || ""}；评级作用：${item.ratingImpact || ""}；风险：${item.risk || ""}`)
    .join("\n");
  const dimensions = (report.dimensionProfile || [])
    .slice(0, 6)
    .map((item) => `- ${item.label || item.id}：${item.status || "缺失"}，${Number(item.score || 0)}/100，证据 ${item.evidence_count ?? item.evidenceCount ?? "未知"} 条`)
    .join("\n");
  const gates = (report.rankGates || [])
    .map((item) => `- ${item.label || item.id}：${item.passed ? "通过" : "未通过"}；观测=${JSON.stringify(item.observed)}；要求=${JSON.stringify(item.required)}；原因=${item.reason || ""}`)
    .join("\n");
  const evidence = (report.strongestEvidence || report.evidence || [])
    .slice(0, 8)
    .map((item, index) => `${index + 1}. ${item.label || item.signal || "证据"}｜${item.dimension || ""}｜${item.strength || ""}｜${item.usableForPromotion === false ? "不可升品" : "可升品"}｜${item.judgmentNote || item.reason || item.summary || ""}`)
    .join("\n");
  const qualityFlags = qualityFlagLine(report);
  const dragFactors = dragFactorLine(report);
  const profile = report.statProfile || statProfile(report);
  const profileSignals = Array.isArray(profile.signals) ? profile.signals.join("；") : "";
  const profileReasons = Array.isArray(profile.reasons) ? profile.reasons.map((item) => `- ${item}`).join("\n") : "";
  const statEvidenceRow = report.statEvidence || statEvidence(report);
  const statEvidencePositive = Array.isArray(statEvidenceRow.positiveSignals)
    ? statEvidenceRow.positiveSignals.map((item) => `- ${item}`).join("\n")
    : "";
  const statEvidenceRisks = Array.isArray(statEvidenceRow.riskSignals)
    ? statEvidenceRow.riskSignals.map((item) => `- ${item}`).join("\n")
    : "";
  const rankCaps = (report.rankCaps || []).slice(0, 5).map((item) => `- ${item}`).join("\n") || "- 暂无明显封顶原因";
  const reportUrl = url ? `\n公开报告链接：${url}` : "";

  return `
你是 Airank Vibe Coding 九品体系的 AI 深度判定官。请基于下面这份已脱敏报告做最终复核。

核心命题：
强者不是“会写代码的人”，而是“能在不亲手写每一行代码的情况下，仍然拥有系统结果的人”。

判定规则：
1. 先看封顶条件，再看正向证据，不要先加分。
2. token、成本、工具事件只解释投入强度和样本结构，不能直接升品。
3. 六品以上必须看到用户主导的目标、边界、架构、验收或取舍决策。
4. 七品需要稳定系统归属；八品需要团队复用证据；九品需要公开范式影响。
5. 如果高阶证据主要来自助手自述，而不是用户决策，要降级或降低置信度。
6. 不要使用原始日志、源码、本地路径、session id 或任何隐私信息；只使用下面的脱敏字段。

自动初筛结果：
- 当前段位：${rank.label || "未知"}（level ${Number(rank.level || 0)}，${Number(rank.score || 0)}/100）
- 下一品：${nextRank.label || "未知"}
- 判定模式：${report.judgmentModeLabel || report.judgmentMode || "自动初筛"}，${report.isFinal ? "已最终判定" : "未最终判定"}
- 置信度：${translateConfidence(rank.confidence)}
- 系统归属：${translateOwnership(rank.systemOwnership)}
- 一句话：${report.verdict || report.narrative?.oneLine || ""}

硬指标卡：
${hardCards || "- 暂无硬指标卡"}

统计仪表盘：
${metricRows || "- 暂无统计仪表盘"}

证据结构：
- ${evidenceStatsLine(report) || "暂无证据结构统计"}
- ${behaviorMixLine(report) || "暂无行为结构统计"}
- 统计解读：${statsInsight(report)}

硬统计证据结论：
- 类型：${statEvidenceRow.label || "硬统计证据"}（${statEvidenceRow.supportLabel || ""}，${statEvidenceRow.confidenceImpact || ""}）
- 结论：${statEvidenceRow.conclusion || ""}
- 正向统计：
${statEvidencePositive || "- 暂无"}
- 风险统计：
${statEvidenceRisks || "- 暂无"}
- 投入统计：${Array.isArray(statEvidenceRow.investmentSignals) && statEvidenceRow.investmentSignals.length ? statEvidenceRow.investmentSignals.join("；") : "暂无"}
- 使用边界：${statEvidenceRow.ratingUse || "硬统计用于支撑置信度、解释封顶和定位下一步；token 和成本只说明投入强度，不能直接升品。"}

统计画像：
- 类型：${profile.label || "统计画像"}（${profile.id || "unknown"}，风险=${profile.riskLevel || "unknown"}）
- 结论：${profile.summary || ""}
- 控制力：${profile.controlReading || ""}
- 验证：${profile.validationReading || ""}
- 投入：${profile.investmentReading || ""}
- 证据：${profile.evidenceReading || ""}
- 画像依据：
${profileReasons || "- 暂无"}
- 关键数字：${profileSignals || "暂无"}
- 使用边界：${profile.ratingUse || "统计画像用于解释置信度、封顶和下一步，不直接升品。"}

六维画像：
${dimensions || "- 暂无六维画像"}

关键门槛：
${gates || "- 暂无机器门槛"}

质量提示：
${qualityFlags}

拖累项：
${dragFactors}

段位封顶原因：
${rankCaps}

最强证据链：
${evidence || "1. 证据不足"}

请输出中文最终报告，严格包含以下小节：
1. 最终段位：是否维持、上调或下调自动初筛结果。
2. 一句话判定：直接说这个人的系统归属状态。
3. 为什么是这个段位：用 3 到 5 条证据说明。
4. 为什么还不是下一品：引用未通过门槛或封顶原因。
5. 证据可信度：说明样本强弱、用户决策占比、助手自述风险和 token/成本统计如何解读。
6. 下一品升级路线：给 3 条具体行动，必须绑定第一个未通过的下一品门槛。
7. 不确定性：列出还需要补充的证据。${reportUrl}
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
    summary: item.dimension || item.behavior_class_label || "",
    dimension: item.dimension || "",
    strength: item.strength || "",
    rawStrength: item.rawStrength || item.raw_strength || "",
    judgmentNote: item.judgmentNote || item.judgment_note || "",
    supportsLevels: item.supportsLevels || item.supports_levels || [],
    usableForPromotion: item.usableForPromotion ?? item.usable_for_promotion ?? true,
  };
}

function publicStatProfile(profile) {
  const result = pickFields(profile, PUBLIC_STAT_PROFILE_FIELDS);
  if (Array.isArray(result.signals)) {
    result.signals = result.signals.slice(0, 4);
  }
  if (Array.isArray(result.reasons)) {
    result.reasons = result.reasons.slice(0, 2);
  }
  return result;
}

function publicStatEvidence(evidence) {
  const result = pickFields(evidence, PUBLIC_STAT_EVIDENCE_FIELDS);
  if (Array.isArray(result.positiveSignals)) {
    result.positiveSignals = result.positiveSignals.slice(0, 3);
  }
  if (Array.isArray(result.riskSignals)) {
    result.riskSignals = result.riskSignals.slice(0, 3);
  }
  if (Array.isArray(result.investmentSignals)) {
    result.investmentSignals = result.investmentSignals.slice(0, 3);
  }
  return result;
}

function publicRankGates(gates, currentLevel = 0) {
  const rows = Array.isArray(gates) ? gates : [];
  const failed = rows
    .filter((item) => item && item.passed === false && Number(item.level || 0) > currentLevel)
    .sort((a, b) => Number(a.level || 0) - Number(b.level || 0))[0]
    || rows.find((item) => item && item.passed === false);
  if (!failed) return [];
  return [
    pickFields(failed, ["id", "level", "label", "passed", "reason"]),
  ];
}

function publicDimensionProfile(profile) {
  return (Array.isArray(profile) ? profile : [])
    .slice(0, 6)
    .map((item) => pickFields(item, ["id", "label", "status", "score", "evidence_count", "strong_evidence_count"]));
}

function publicQualityFlags(flags) {
  return sortQualityFlags(flags)
    .slice(0, 2)
    .map((item) => pickFields(item, ["id", "severity", "label", "metric", "message"]));
}

function publicDragFactors(factors) {
  return (Array.isArray(factors) ? factors : [])
    .slice(0, 2)
    .map((item) => pickFields(item, ["id", "label", "metric", "impact", "advice"]));
}

function pickFields(source, fields) {
  const result = {};
  for (const field of fields) {
    const value = source?.[field];
    if (value !== undefined && value !== null && value !== "") result[field] = value;
  }
  return result;
}

function publicReport(report) {
  const evidence = (report.strongestEvidence?.length ? report.strongestEvidence : report.evidence || [])
    .slice(0, 3)
    .map(publicEvidence);
  const publicHardCards = shareHardStatCards(report.hardStatCards).slice(0, 6);
  return {
    source: report.source,
    judgmentMode: report.judgmentMode,
    isFinal: report.isFinal,
    rank: report.rank,
    nextRank: report.nextRank,
    recordCount: report.recordCount,
    analyzedRecordCount: report.analyzedRecordCount,
    excludedRecordCount: report.excludedRecordCount,
    signalCount: report.signalCount,
    strongEvidenceCount: report.strongEvidenceCount,
    userControlCount: report.userControlCount,
    hardStats: pickFields(report.hardStats, PUBLIC_HARD_STATS_FIELDS),
    costEstimate: report.costEstimate,
    statsInsight: report.statsInsight,
    statEvidence: publicStatEvidence(report.statEvidence),
    statProfile: publicStatProfile(report.statProfile),
    hardStatCards: publicHardCards,
    metricGroups: publicMetricGroups(report.metricGroups),
    dimensionProfile: publicDimensionProfile(report.dimensionProfile),
    verdict: report.verdict,
    whyThisRank: report.whyThisRank,
    whyNotNextRank: report.whyNotNextRank,
    evidence: [],
    strongestEvidence: evidence,
    rankCaps: report.rankCaps,
    rankGates: publicRankGates(report.rankGates, Number(report.rank?.level || 0)),
    qualityFlags: publicQualityFlags(report.qualityFlags),
    dragFactors: publicDragFactors(report.dragFactors),
    unlockStatus: report.unlockStatus,
    gateUpgradeAdvice: report.gateUpgradeAdvice,
    upgradePath: report.upgradePath,
    privacy: {
      localPathsRemoved: true,
      rawLogsUploaded: false,
      compactPublicReport: true,
    },
  };
}

function printHuman(report, url, outPath, linkPath = "", advice = linkAdvice(url)) {
  console.log("");
  console.log("Vibe Coding 段位报告");
  console.log(`段位：${report.rank.label}`);
  console.log(`分数：${report.rank.score}`);
  console.log(`置信度：${translateConfidence(report.rank.confidence)}`);
  console.log(`判定模式：${report.judgmentModeLabel}${report.isFinal ? "" : "（非最终判定）"}`);
  console.log(`系统归属：${translateOwnership(report.rank.systemOwnership)}`);
  const hardStats = hardStatsLine(report);
  if (hardStats) {
    console.log(`硬统计：${hardStats}`);
  }
  const evidenceStats = evidenceStatsLine(report);
  if (evidenceStats) {
    console.log(`证据结构：${evidenceStats}`);
  }
  const behaviorMix = behaviorMixLine(report);
  if (behaviorMix) {
    console.log(`行为结构：${behaviorMix}`);
  }
  if (report.statsInsight) {
    console.log(`统计解读：${report.statsInsight}`);
  }
  const statEvidence = statEvidenceLine(report);
  if (statEvidence) {
    console.log(`硬统计证据：${statEvidence}`);
  }
  const statLine = statProfileLine(report);
  if (statLine) {
    console.log(`统计画像：${statLine}`);
  }
  const rankGate = rankGateLine(report);
  if (rankGate) {
    console.log(`关键门槛：${rankGate}`);
  }
  const qualityFlags = qualityFlagLine(report);
  if (qualityFlags) {
    console.log(`质量提示：${qualityFlags}`);
  }
  const dragFactors = dragFactorLine(report);
  if (dragFactors) {
    console.log(`拖累项：${dragFactors}`);
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
  const displayUrl = url.length > URL_PREVIEW_LENGTH ? `${url.slice(0, URL_PREVIEW_LENGTH)}...` : url;
  const groups = (report.metricGroups || []).slice(0, 5);
  if (groups.length) {
    console.log("");
    console.log("统计仪表盘：");
    for (const item of groups) {
      console.log(`- ${item.label}：${item.value}；${item.ratingImpact}`);
    }
  }
  console.log("");
  console.log("产物：");
  console.log(`- 公开链接：${displayUrl}`);
  if (linkPath) {
    console.log(`- 完整公开链接：${linkPath}`);
  } else if (advice.warning) {
    console.log(`- 链接长度：${advice.length} 字符，超过建议阈值 ${advice.threshold}。`);
    console.log("- 建议：加 --short-link --open 生成短链接，或加 --write-link .airank/report-url.txt 写入完整链接。");
  } else if (url.length > 180) {
    console.log("- 完整公开链接较长，建议加 --short-link 生成短链接，或加 --write-link .airank/report-url.txt 写入文件。");
  }
  console.log("- 公开链接只包含压缩脱敏摘要；原始日志、本地路径和源码片段不会上传。");
  if (outPath) {
    console.log(`- 本地完整报告：${outPath}`);
    console.log("  本地报告用于自查证据，可能包含脱敏证据片段，请不要直接公开。");
  } else {
    console.log("- 本地完整报告：本次未写入；去掉 --no-write 可写入 .airank/vibe-report.json。");
  }
  if (report.shareImagePromptPath) {
    console.log(`- 图片报告提示词：${report.shareImagePromptPath}`);
  } else {
    console.log("- 图片报告提示词：加 --write-share-prompt .airank/share-poster-prompt.txt 生成。");
  }
  if (report.judgePromptPath) {
    console.log(`- 深度判定提示词：${report.judgePromptPath}`);
  } else {
    console.log("- 深度判定提示词：加 --write-judge-prompt .airank/deep-judge-prompt.txt 生成。");
  }
  if (report.strongestEvidence.length) {
    console.log("");
    console.log("最强证据：");
    for (const item of report.strongestEvidence.slice(0, 3)) {
      console.log(`- ${item.label}: ${item.reason}`);
    }
  }
  console.log("");
  console.log("下一步：");
  console.log(`- ${report.gateUpgradeAdvice || report.upgradePath?.[0] || report.narrative?.upgradeSummary}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(help());
    return;
  }
  if (options.doctor) {
    console.log(doctor(options));
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
  let publicPayload = publicReport(report);
  let url = siteUrl(options.site, publicPayload);
  let shareImagePrompt = buildShareImagePrompt(publicPayload, url);
  let judgePrompt = buildJudgePrompt(publicPayload, url);
  report.shareImagePrompt = shareImagePrompt;
  report.judgePrompt = judgePrompt;
  let shareImagePromptPath = "";
  let judgePromptPath = "";
  let linkPath = "";
  if (options.writeSharePrompt) {
    shareImagePromptPath = writeTextFile(options.writeSharePrompt, shareImagePrompt);
    report.shareImagePromptPath = shareImagePromptPath;
  }
  if (options.writeJudgePrompt) {
    judgePromptPath = writeTextFile(options.writeJudgePrompt, judgePrompt);
    report.judgePromptPath = judgePromptPath;
  }
  const uploadBaseUrl = options.uploadUrl || (options.shortLink ? options.site : "");
  if (uploadBaseUrl) {
    publicPayload = publicReport(report);
    const uploaded = await uploadReport(uploadBaseUrl, publicPayload);
    url = uploaded.url || `${uploadBaseUrl.replace(/\/$/, "")}/#id=${uploaded.id}`;
    shareImagePrompt = buildShareImagePrompt(publicPayload, url);
    judgePrompt = buildJudgePrompt(publicPayload, url);
    report.shareImagePrompt = shareImagePrompt;
    report.judgePrompt = judgePrompt;
    if (options.writeSharePrompt) {
      shareImagePromptPath = writeTextFile(options.writeSharePrompt, shareImagePrompt);
      report.shareImagePromptPath = shareImagePromptPath;
    }
    if (options.writeJudgePrompt) {
      judgePromptPath = writeTextFile(options.writeJudgePrompt, judgePrompt);
      report.judgePromptPath = judgePromptPath;
    }
  }
  const outPath = options.write && options.out ? writeReport(options.out, report) : "";
  if (options.writeLink) {
    linkPath = writeTextFile(options.writeLink, url);
  }
  const advice = linkAdvice(url);
  if (options.printJson) {
    console.log(JSON.stringify({ report, url, outPath, shareImagePromptPath, judgePromptPath, linkPath, linkAdvice: advice }, null, 2));
  } else {
    printHuman(report, url, outPath, linkPath, advice);
  }
  if (options.open) openUrl(url);
}

main().catch((error) => {
  console.error(`vibe-rank: ${error.message}`);
  process.exit(1);
});
