const RANKS = [
  ["0", "零品 · 门外汉", "尚未入场"],
  ["1", "一品 · 初识真气", "AI 写片段"],
  ["2", "二品 · 初窥门径", "能跑 Demo"],
  ["3", "三品 · 小有所成", "交付功能，但困在 bug 循环"],
  ["4", "四品 · 登堂入室", "目标、边界、验收标准"],
  ["5", "五品 · 炉火纯青", "架构与产品目标驱动"],
  ["6", "六品 · 已有大成", "定义问题到交付闭环"],
  ["7", "七品 · 已臻化境", "AI 是你的延伸"],
  ["8", "八品 · 半步宗师", "方法复制给团队"],
  ["9", "九品 · 大宗师", "定义人机协作范式"],
];

const SAMPLE = {
  rank: {
    level: 6,
    label: "六品 · 已有大成",
    score: 76,
    confidence: "高",
    systemOwnership: "强",
  },
  signalCount: 56,
  recordCount: 170,
  analyzedRecordCount: 120,
  excludedRecordCount: 50,
  judgmentMode: "自动初筛",
  judgmentModeLabel: "自动初筛",
  isFinal: false,
  strongEvidenceCount: 12,
  userControlCount: 8,
  usageStats: {
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
  hardStats: {
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
    strong_evidence_count: 12,
    strong_evidence_density: 0.1,
    strong_signal_type_count: 3,
    strong_evidence_source_count: 3,
    average_strong_evidence_per_source: 4,
    promotion_evidence_count: 48,
    promotion_record_count: 32,
    strong_evidence_record_count: 12,
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
    note: "硬统计只描述样本质量和 AI 投入强度，不直接参与段位升品。",
  },
  dimensionProfile: [
    { id: "problem_definition", label: "目标定义", status: "成立", score: 65 },
    { id: "boundary_control", label: "边界控制", status: "成立", score: 65 },
    { id: "validation_loop", label: "验证闭环", status: "稳定", score: 85 },
    { id: "architecture_judgment", label: "架构判断", status: "成立", score: 65 },
    { id: "system_ownership", label: "系统归属", status: "成立", score: 65 },
    { id: "method_replication", label: "方法复制", status: "线索", score: 35 },
  ],
  verdict: "你已经形成从问题定义到系统交付的闭环。",
  whyThisRank: "你不是只在指挥 AI 写代码，而是在把目标、架构、验证和工作流连成一个系统。即使不亲手写每一行代码，你也开始拥有结果。",
  whyNotNextRank: "要进入七品，需要让审核、验证和架构判断更系统化，减少靠临场人工拉回方向。",
  evidence: [
    { signal: "目标", label: "边界控制证据", reason: "这类证据说明你开始定义目标、非目标、验收条件或文件范围，系统开始被你约束。", snippet: "实现这个用户故事，验收条件如下；不要改支付模块，先给计划再动代码。" },
    { signal: "验证", label: "验证闭环证据", reason: "这类证据说明你用测试、构建、lint、回归或人工验收来确认结果。", snippet: "已运行 build、lint、单元测试和截图 smoke check，并复查 diff。" },
    { signal: "架构", label: "架构判断证据", reason: "这类证据说明你关注模块边界、权限、数据模型、重构或系统设计。", snippet: "这个模块继续 patch 没意义，重设数据边界，用新的状态模型替换。" },
    { signal: "工作流", label: "工作流沉淀证据", reason: "这类证据说明你把一次协作沉淀成 rules、skill、workflow 或 checklist。", snippet: "把这次成功流程沉淀进 AGENTS.md，后续同类任务按 gate 执行。" },
  ],
  rankCaps: ["缺少团队级 playbook、共享 workflow 或方法复制证据。"],
  rankGates: [
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
  qualityFlags: [
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
  dragFactors: [
    {
      id: "demo_heavy",
      label: "Demo 生成偏重",
      metric: "18%",
      impact: "Demo 多说明生成速度强，但不能证明生产质量和系统拥有感。",
      advice: "为 Demo 补上验收、异常处理、数据边界和上线风险记录。",
    },
  ],
  statsInsight: "样本跨越多个工作日，稳定性比单次会话更可信。",
  unlockStatus: {
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
  gateUpgradeAdvice: "找至少 2 个其他人或项目复用你的 rules、skill 或 playbook，并记录复用结果；八品看方法是否离开你仍然有效。",
  upgradePath: ["把成功协作沉淀成 AGENTS.md、rules、skill 或团队 playbook。"],
  hardStatCards: [
    { id: "ai_investment", label: "AI 投入强度", value: "128万 token", detail: "活跃 6 天 / 12 会话", interpretation: "只说明 AI 使用投入，不直接参与段位升品。" },
    { id: "sample_stability", label: "样本稳定性", value: "6 天", detail: "峰值日占比 33%", interpretation: "样本越分散，越能证明稳定工作方式。" },
    { id: "sample_validity", label: "有效样本", value: "94%", detail: "120/128 条可分析", interpretation: "排除系统上下文、token 统计和工具结果后，只看真实行为。" },
    { id: "strong_evidence_density", label: "强证据密度", value: "10%", detail: "12 条强证据", interpretation: "强证据越密，越能支撑高段位；低密度会降低置信度。" },
    { id: "user_control", label: "用户主动控制", value: "17%", detail: "8 条主动控制证据", interpretation: "衡量你是否在定义目标、边界、架构和验收。" },
    { id: "user_decision", label: "用户决策占比", value: "17%", detail: "助手执行 75%", interpretation: "高段位必须看到人的系统级决策，而不是 AI 自述完成。" },
  ],
};

let currentReport = SAMPLE;

function decodeBase64Url(value) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0) & 0xff);
  return new TextDecoder().decode(bytes);
}

async function loadReport() {
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.has("data")) {
    try {
      return JSON.parse(decodeBase64Url(hash.get("data")));
    } catch {
      throw new Error("报告链接损坏，无法解析本地数据。");
    }
  }
  if (hash.has("id")) {
    const response = await fetch(`/api/reports/${hash.get("id")}`);
    if (response.ok) {
      const payload = await response.json();
      return payload.report || payload;
    }
    if (response.status === 404) {
      throw new Error("报告不存在或已经过期。");
    }
    throw new Error("短链接报告加载失败，请稍后重试。");
  }
  return SAMPLE;
}

function renderRail(level) {
  const rail = document.querySelector("#rank-rail");
  rail.innerHTML = "";
  for (const [value, label, phrase] of RANKS) {
    const active = Number(value) <= level ? " active" : "";
    const compact = document.createElement("div");
    compact.className = `rail-item${active}`;
    compact.innerHTML = `<span class="badge">${value}</span><div><strong>${label}</strong><br><span>${phrase}</span></div>`;
    rail.append(compact);
  }
}

function renderEvidence(report) {
  const grid = document.querySelector("#evidence-grid");
  grid.innerHTML = "";
  const rows = (report.strongestEvidence?.length ? report.strongestEvidence : report.evidence?.length ? report.evidence : SAMPLE.evidence).slice(0, 6);
  for (const row of rows) {
    const card = document.createElement("article");
    card.className = "evidence-card";
    card.innerHTML = `<strong>${row.label || row.signal || "证据"}</strong><em>${row.reason || ""}</em><span>${row.snippet || row.summary || ""}</span>`;
    grid.append(card);
  }
}

function render(report) {
  document.querySelector(".dashboard").classList.remove("error-state");
  currentReport = report;
  const rank = report.rank || SAMPLE.rank;
  const level = Number(rank.level || 0);
  document.querySelector("#rank-label").textContent = rank.label || RANKS[level][1];
  document.querySelector("#verdict").textContent = report.verdict || report.narrative?.oneLine || SAMPLE.verdict;
  document.querySelector("#score-value").textContent = rank.score || 0;
  document.querySelector("#confidence").textContent = translateConfidence(rank.confidence || "low");
  document.querySelector("#ownership").textContent = translateOwnership(rank.systemOwnership || "weak");
  document.querySelector("#judgment-mode").textContent = judgmentText(report);
  document.querySelector("#strong-evidence").textContent = report.strongEvidenceCount ?? 0;
  document.querySelector("#user-control").textContent = report.userControlCount ?? 0;
  document.querySelector("#signals").textContent = report.signalCount || 0;
  document.querySelector("#records").textContent = report.analyzedRecordCount ?? report.recordCount ?? 0;
  document.querySelector("#rank-cap").textContent = firstText(report.rankCaps) || SAMPLE.rankCaps[0];
  document.querySelector("#upgrade-path").textContent = upgradePathSummary(report);
  document.querySelector("#unlock-status").textContent = unlockText(report);
  document.querySelector("#usage-summary").textContent = usageSummary(report);
  document.querySelector("#quality-summary").textContent = qualitySummary(report);
  document.querySelector("#evidence-structure").textContent = evidenceStructureSummary(report);
  document.querySelector("#behavior-mix").textContent = behaviorMixSummary(report);
  document.querySelector("#stats-insight").textContent = statsInsight(report);
  document.querySelector("#rank-gate-summary").textContent = rankGateSummary(report);
  document.querySelector("#quality-flags").textContent = qualityFlagSummary(report);
  document.querySelector("#drag-factors").textContent = dragFactorSummary(report);
  document.querySelector("#why-this-rank").textContent = report.whyThisRank || report.narrative?.rankReason || SAMPLE.whyThisRank;
  document.querySelector("#why-not-next").textContent = report.whyNotNextRank || report.narrative?.nextRankGap || SAMPLE.whyNotNextRank;
  renderQuality(report);
  renderDimensions(report);
  renderHardStatCards(report);
  renderRail(level);
  renderEvidence(report);
  renderShareState(report);
}

function renderError(error) {
  const message = error?.message || "报告加载失败。";
  document.querySelector(".dashboard").classList.add("error-state");
  document.querySelector("#rank-label").textContent = "报告无法打开";
  document.querySelector("#verdict").textContent = message;
  document.querySelector("#score-value").textContent = "!";
  document.querySelector("#judgment-mode").textContent = "链接错误";
  document.querySelector("#share-note").textContent = "请检查链接，或重新运行 CLI 生成新的报告。";
  document.querySelector("#confidence").textContent = "-";
  document.querySelector("#ownership").textContent = "-";
  document.querySelector("#strong-evidence").textContent = "-";
  document.querySelector("#user-control").textContent = "-";
  document.querySelector("#signals").textContent = "-";
  document.querySelector("#records").textContent = "-";
  document.querySelector("#quality-note").hidden = false;
  document.querySelector("#quality-note").textContent = "没有加载到有效报告数据。";
  document.querySelector("#dimension-grid").innerHTML = "";
  document.querySelector("#rank-rail").innerHTML = "";
  document.querySelector("#evidence-grid").innerHTML = "";
  document.querySelector("#why-this-rank").textContent = "无法根据当前链接判断段位。";
  document.querySelector("#why-not-next").textContent = "需要有效报告数据后才能分析下一品差距。";
  document.querySelector("#rank-cap").textContent = "报告数据不可用。";
  document.querySelector("#upgrade-path").textContent = "重新运行 npx github:relaxcloud-cn/vibe-coding-rank --source codex --short-link --open";
  document.querySelector("#unlock-status").textContent = "未加载";
  document.querySelector("#usage-summary").textContent = "暂无";
  document.querySelector("#quality-summary").textContent = "暂无";
  document.querySelector("#evidence-structure").textContent = "暂无";
  document.querySelector("#behavior-mix").textContent = "暂无";
  document.querySelector("#stats-insight").textContent = "暂无";
  document.querySelector("#rank-gate-summary").textContent = "暂无";
  document.querySelector("#quality-flags").textContent = "暂无";
  document.querySelector("#drag-factors").textContent = "暂无";
  document.querySelector("#hard-stat-grid").innerHTML = "";
}

function judgmentText(report) {
  const label = report.judgmentModeLabel || report.judgmentMode || "自动初筛";
  return report.isFinal ? `${label} · 最终判定` : `${label} · 非最终高段位判定`;
}

function unlockText(report) {
  const level8 = report.unlockStatus?.level8;
  const level9 = report.unlockStatus?.level9;
  if (level9?.unlocked) return `${level9.label || "九品"} 已解锁`;
  if (level8?.unlocked) return `${level8.label || "八品"} 已解锁，九品仍需公开影响证据。`;
  if (level8?.reason) return `八品未解锁：${level8.reason}`;
  return "八品/九品需要团队复用或公开影响证据。";
}

function renderDimensions(report) {
  const grid = document.querySelector("#dimension-grid");
  const rows = report.dimensionProfile?.length ? report.dimensionProfile : SAMPLE.dimensionProfile;
  grid.innerHTML = "";
  for (const row of rows) {
    const item = document.createElement("article");
    item.className = "dimension-card";
    item.innerHTML = `<div><strong>${row.label}</strong><span>${row.status || "缺失"}</span></div><meter min="0" max="100" value="${Number(row.score || 0)}"></meter>`;
    grid.append(item);
  }
}

function firstText(items) {
  if (!Array.isArray(items) || !items.length) return "";
  const first = items[0];
  if (typeof first === "string") return first;
  return first.cap || first.summary || "";
}

function formatTokens(value) {
  const tokens = Number(value || 0);
  if (tokens >= 100000000) return `${(tokens / 100000000).toFixed(1)}亿`;
  if (tokens >= 10000) return `${Math.round(tokens / 10000)}万`;
  return String(tokens);
}

function usageSummary(report) {
  const usage = { ...(report.usageStats || {}), ...(report.hardStats || {}) };
  const total = formatTokens(usage.total_tokens || 0);
  const peak = formatTokens(usage.peak_day_tokens || 0);
  const activeDays = Number(usage.active_days || 0);
  const activeSessions = Number(usage.active_sessions || 0);
  if (!usage.total_tokens) return "暂无 token 统计。";
  return `总 token ${total}；峰值日 ${peak}；活跃 ${activeDays} 天 / ${activeSessions} 会话。`;
}

function formatPercent(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return "0%";
  return `${Math.round(number * 100)}%`;
}

function qualitySummary(report) {
  const stats = report.hardStats || {};
  const analyzed = stats.analyzed_record_count ?? report.analyzedRecordCount ?? 0;
  const candidate = stats.scoring_candidate_record_count ?? report.recordCount ?? analyzed;
  const strongDensity = formatPercent(stats.strong_evidence_density || 0);
  const userControlRatio = formatPercent(stats.user_control_ratio || 0);
  return `有效样本 ${analyzed}/${candidate}；强证据密度 ${strongDensity}；主动控制占比 ${userControlRatio}。`;
}

function evidenceStructureSummary(report) {
  const stats = report.hardStats || {};
  const parts = [];
  if (stats.evidence_span_days) parts.push(`证据跨度 ${stats.evidence_span_days} 天`);
  if (stats.signal_coverage_ratio) parts.push(`信号覆盖度 ${formatPercent(stats.signal_coverage_ratio)}`);
  if (stats.dominant_signal_ratio) parts.push(`最高信号集中度 ${formatPercent(stats.dominant_signal_ratio)}`);
  if (stats.established_dimension_count) parts.push(`成立维度 ${stats.established_dimension_count}/6`);
  if (stats.peak_day_token_share) parts.push(`峰值日 token 占比 ${formatPercent(stats.peak_day_token_share)}`);
  return parts.length ? `${parts.join("；")}。` : "暂无证据结构统计。";
}

function behaviorMixSummary(report) {
  const stats = report.hardStats || {};
  const userDecision = stats.promotion_user_decision_ratio ?? stats.user_decision_ratio ?? 0;
  const assistantExecution = stats.promotion_assistant_execution_ratio ?? 0;
  const parts = [];
  if (userDecision) parts.push(`用户决策 ${formatPercent(userDecision)}`);
  if (assistantExecution) parts.push(`助手执行 ${formatPercent(assistantExecution)}`);
  if (stats.user_decision_count) parts.push(`决策证据 ${stats.user_decision_count} 条`);
  return parts.length ? `${parts.join("；")}。` : "暂无行为结构统计。";
}

function statsInsight(report) {
  if (report.statsInsight) return report.statsInsight;
  const stats = report.hardStats || {};
  const userRatio = Number(stats.user_control_ratio || 0);
  const dominantRatio = Number(stats.dominant_signal_ratio || 0);
  const peakDayShare = Number(stats.peak_day_token_share || 0);
  const activeDays = Number(stats.active_days || 0);
  const evidenceSpan = Number(stats.evidence_span_days || 0);
  if (userRatio > 0 && userRatio < 0.03) {
    return "主动控制占比偏低，高阶信号主要来自 AI 执行或总结，自动初筛会压低高段位。";
  }
  if (userRatio >= 0.08) {
    return "主动控制占比充足，用户在目标、边界、架构和验收上有明确主导痕迹。";
  }
  if (dominantRatio >= 0.45) {
    return "信号过于集中，可能只证明一种工作习惯，不足以单独支撑系统归属。";
  }
  if (dominantRatio > 0 && dominantRatio <= 0.3) {
    return "信号分布较均衡，能减少单一关键词或单一任务类型带来的误判。";
  }
  if (peakDayShare >= 0.5) {
    return "token 明显集中在少数日期，更像阶段性爆量，不等同于稳定能力。";
  }
  if (activeDays >= 5 && evidenceSpan >= 14) {
    return "样本跨越多个工作日，稳定性比单次会话更可信。";
  }
  return "硬统计用于解释投入强度、样本质量和证据结构，不直接参与段位升品。";
}

function rankGateSummary(report) {
  const failed = firstFailedGate(report);
  if (!failed) return "当前关键门槛已通过，继续看下一品证据缺口。";
  return `${failed.label || failed.id}未通过：${shortText(failed.reason || "", 56)}`;
}

function firstFailedGate(report) {
  const gates = Array.isArray(report.rankGates) ? report.rankGates : [];
  const currentLevel = Number(report.rank?.level || 0);
  return gates
    .filter((item) => item && item.passed === false && Number(item.level || 0) > currentLevel)
    .sort((a, b) => Number(a.level || 0) - Number(b.level || 0))[0]
    || gates.find((item) => item && item.passed === false);
}

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

function upgradePathSummary(report) {
  if (report.gateUpgradeAdvice) return report.gateUpgradeAdvice;
  const failed = firstFailedGate(report);
  if (failed?.id && GATE_UPGRADE_ADVICE[failed.id]) return GATE_UPGRADE_ADVICE[failed.id];
  if (failed?.reason) return `先补齐这个门槛：${failed.reason}`;
  return firstText(report.upgradePath) || SAMPLE.gateUpgradeAdvice || SAMPLE.upgradePath[0];
}

function qualityFlagSummary(report) {
  const flags = Array.isArray(report.qualityFlags) ? report.qualityFlags : [];
  if (!flags.length) return "暂无明显样本风险。";
  const priority = { risk: 0, warning: 1, info: 2, ok: 3 };
  return [...flags]
    .sort((a, b) => (priority[a.severity] ?? 9) - (priority[b.severity] ?? 9))
    .slice(0, 2)
    .map((item) => `${item.label || item.id}${item.metric ? ` ${item.metric}` : ""}：${item.message || ""}`)
    .join("；");
}

function dragFactorSummary(report) {
  const factors = Array.isArray(report.dragFactors) ? report.dragFactors : [];
  if (!factors.length) return "暂无明显拖累项。";
  return factors
    .slice(0, 2)
    .map((item) => `${item.label || item.id}${item.metric ? ` ${item.metric}` : ""}：${item.impact || item.advice || ""}`)
    .join("；");
}

function shortText(value, length = 42) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length - 1)}…`;
}

function hardStatsLine(report) {
  const usage = { ...(report.usageStats || {}), ...(report.hardStats || {}) };
  const total = usage.total_tokens ? `总 token ${formatTokens(usage.total_tokens)}` : "";
  const peak = usage.peak_day_tokens ? `峰值日 ${formatTokens(usage.peak_day_tokens)}` : "";
  const days = usage.active_days ? `活跃 ${usage.active_days} 天` : "";
  const sessions = usage.active_sessions ? `${usage.active_sessions} 会话` : "";
  const parts = [total, peak, days, sessions].filter(Boolean);
  return parts.length ? parts.join("，") : "暂无硬统计";
}

function fallbackHardStatCards(report) {
  const stats = report.hardStats || {};
  const usage = { ...(report.usageStats || {}), ...stats };
  return [
    {
      id: "ai_investment",
      label: "AI 投入强度",
      value: usage.total_tokens ? `${formatTokens(usage.total_tokens)} token` : "暂无",
      detail: usage.active_days || usage.active_sessions ? `活跃 ${usage.active_days || 0} 天 / ${usage.active_sessions || 0} 会话` : "未读取到 token 统计",
      interpretation: "只说明 AI 使用投入，不直接参与段位升品。",
    },
    {
      id: "sample_stability",
      label: "样本稳定性",
      value: usage.active_days ? `${usage.active_days} 天` : "暂无",
      detail: usage.peak_day_token_share ? `峰值日占比 ${formatPercent(usage.peak_day_token_share)}` : "缺少峰值日统计",
      interpretation: Number(usage.peak_day_token_share || 0) >= 0.5 ? "token 过于集中，稳定性会被打折。" : "样本越分散，越能证明稳定工作方式。",
    },
    {
      id: "sample_validity",
      label: "有效样本",
      value: stats.scorable_record_ratio ? formatPercent(stats.scorable_record_ratio) : "暂无",
      detail: `${stats.analyzed_record_count ?? report.analyzedRecordCount ?? 0}/${stats.scoring_candidate_record_count ?? report.recordCount ?? 0} 条可分析`,
      interpretation: "排除系统上下文、token 统计和工具结果后，只看真实行为。",
    },
    {
      id: "strong_evidence_density",
      label: "强证据密度",
      value: stats.strong_evidence_density ? formatPercent(stats.strong_evidence_density) : "0%",
      detail: `${stats.strong_evidence_count ?? report.strongEvidenceCount ?? 0} 条强证据`,
      interpretation: "强证据越密，越能支撑高段位；低密度会降低置信度。",
    },
    {
      id: "promotion_record_quality",
      label: "高阶记录质量",
      value: stats.promotion_record_count ? `${stats.promotion_record_count} 条` : "暂无",
      detail: stats.average_promotion_signals_per_record ? `平均 ${stats.average_promotion_signals_per_record} 个信号/条` : "按记录去重后统计",
      interpretation: "防止一条长消息命中多个关键词后被重复当成高阶证据。",
    },
    {
      id: "user_control",
      label: "用户主动控制",
      value: stats.user_control_ratio ? formatPercent(stats.user_control_ratio) : "0%",
      detail: `${stats.user_control_count ?? report.userControlCount ?? 0} 条主动控制证据`,
      interpretation: "衡量你是否在定义目标、边界、架构和验收。",
    },
    {
      id: "user_decision",
      label: "用户决策占比",
      value: stats.promotion_user_decision_ratio ? formatPercent(stats.promotion_user_decision_ratio) : "0%",
      detail: stats.promotion_assistant_execution_ratio ? `助手执行 ${formatPercent(stats.promotion_assistant_execution_ratio)}` : "缺少行为结构统计",
      interpretation: "高段位必须看到人的系统级决策，而不是 AI 自述完成。",
    },
  ];
}

function renderHardStatCards(report) {
  const grid = document.querySelector("#hard-stat-grid");
  const rows = report.hardStatCards?.length ? report.hardStatCards : fallbackHardStatCards(report);
  grid.innerHTML = "";
  for (const row of rows.slice(0, 8)) {
    const item = document.createElement("article");
    item.className = "hard-stat-card";
    item.innerHTML = `<span>${row.label || "硬指标"}</span><strong>${row.value || "暂无"}</strong><em>${row.detail || ""}</em><p>${row.interpretation || ""}</p>`;
    grid.append(item);
  }
}

function buildSharePrompt(report) {
  const rank = report.rank || SAMPLE.rank;
  const evidenceRows = (report.strongestEvidence?.length ? report.strongestEvidence : report.evidence?.length ? report.evidence : SAMPLE.evidence)
    .slice(0, 3)
    .map((item) => `${item.label || item.signal || "证据"}：${shortText(item.reason || item.snippet || "", 36)}`);
  while (evidenceRows.length < 3) evidenceRows.push("证据不足：继续积累真实 AI 工作记录");
  const dimensions = (report.dimensionProfile?.length ? report.dimensionProfile : SAMPLE.dimensionProfile)
    .slice(0, 6)
    .map((item) => `${item.label || item.id} ${item.status || "缺失"} ${Number(item.score || 0)}/100`)
    .join("；");
  const hardCards = (report.hardStatCards?.length ? report.hardStatCards : fallbackHardStatCards(report))
    .slice(0, 6)
    .map((item) => `${item.label} ${item.value}：${shortText(item.interpretation, 24)}`)
    .join("；");
  const url = location.href;
  return `
Use case: infographic-diagram
Asset type: 4:5 vertical Chinese social-share poster for Airank Vibe Coding Rank
Primary request: Create a premium Chinese AI ability report poster. It must look like a polished product report, not a meme or generic certificate.

Exact Chinese text to include:
标题：Vibe Coding 九品报告
主评级：${rank.label || "未知段位"}
分数：${Number(rank.score || 0)}/100
置信度：${translateConfidence(rank.confidence || "low")}
系统归属：${translateOwnership(rank.systemOwnership || "weak")}
核心问题：这系统是你的，还是 AI 的？
一句话：${shortText(report.verdict || report.narrative?.oneLine || "", 46)}

硬统计：
${hardStatsLine(report)}

硬指标卡：
${hardCards}

证据结构：
${evidenceStructureSummary(report)}

行为结构：
${behaviorMixSummary(report)}

统计解读：
${statsInsight(report)}

关键门槛：
${rankGateSummary(report)}

质量提示：
${qualityFlagSummary(report)}

拖累项：
${dragFactorSummary(report)}

六维画像：
${dimensions}

证据摘要：
1. ${evidenceRows[0]}
2. ${evidenceRows[1]}
3. ${evidenceRows[2]}

评级限制：
${shortText(firstText(report.rankCaps) || "暂无明显封顶原因", 52)}

下一步：
${shortText(upgradePathSummary(report), 52)}

Footer:
Airank · 3 分钟测出你的 AI 段位
公开链接：${url.length > 140 ? `${url.slice(0, 140)}...` : url}

Visual direction:
- Chinese text must be readable, large, and clean.
- Use Airank product-report style: deep green and blue background, ivory panels, gold rank accent, subtle grid lines.
- Make the rank label and score the strongest visual elements.
- Use compact dashboard cards for hard stats and six dimensions.
- No raw logs, no local file paths, no session IDs, no code snippets, no secrets.
`.trim();
}

function shareLink() {
  return location.href;
}

function renderShareState(report) {
  const note = document.querySelector("#share-note");
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.has("id")) {
    note.textContent = "当前是短链接，报告 JSON 已脱敏后存储，原始日志不会上传。";
    return;
  }
  if (hash.has("data")) {
    note.textContent = "当前是本地浏览器链接，报告数据只在 URL hash 中渲染。";
    return;
  }
  if (report.privacy?.rawLogsUploaded === false) {
    note.textContent = "当前报告不包含原始日志，可复制链接分享。";
    return;
  }
  note.textContent = "当前是样例报告。运行 CLI 后可生成你的个人链接。";
}

function renderQuality(report) {
  const note = document.querySelector("#quality-note");
  const stats = report.hardStats || {};
  const nonScoring = Number(stats.non_scoring_record_count ?? report.excludedRecordCount ?? 0);
  const context = Number(stats.context_excluded_record_count || 0);
  const usage = Number(stats.usage_record_count || 0);
  const tools = Number(stats.tool_result_record_count || 0);
  const toolEvents = Number(stats.tool_event_record_count || 0);
  const analyzed = Number(stats.analyzed_record_count ?? report.analyzedRecordCount ?? report.recordCount ?? 0);
  const total = Number(stats.raw_record_count ?? report.recordCount ?? analyzed);
  if (nonScoring > 0) {
    note.hidden = false;
    note.textContent = `已排除 ${nonScoring} 条非评分记录，其中系统上下文 ${context} 条、token 统计 ${usage} 条、工具结果 ${tools} 条、工具事件 ${toolEvents} 条；实际分析 ${analyzed}/${total} 条记录。`;
    return;
  }
  note.hidden = true;
}

function translateConfidence(value) {
  return {
    low: "低",
    medium: "中",
    high: "高",
  }[value] || value;
}

function translateOwnership(value) {
  return {
    weak: "弱",
    emerging: "形成中",
    strong: "强",
    exceptional: "极强",
  }[value] || value;
}

document.querySelector("#copy-command").addEventListener("click", async () => {
  const command = "npx github:relaxcloud-cn/vibe-coding-rank --source codex --open";
  await navigator.clipboard.writeText(command);
  const button = document.querySelector("#copy-command");
  const previous = button.innerHTML;
  button.innerHTML = `<span><span class="prompt">$</span> 已复制到剪贴板</span><span class="copy-icon" aria-hidden="true">OK</span>`;
  setTimeout(() => {
    button.innerHTML = previous;
  }, 1200);
});

document.querySelector("#copy-report-link").addEventListener("click", async () => {
  const button = document.querySelector("#copy-report-link");
  const status = document.querySelector("#share-copy-status");
  await navigator.clipboard.writeText(shareLink());
  button.textContent = "已复制链接";
  status.textContent = location.hash.includes("id=") ? "短链接已复制" : "链接已复制";
  setTimeout(() => {
    button.textContent = "复制报告链接";
    status.textContent = "";
  }, 1600);
});

document.querySelector("#copy-share-prompt").addEventListener("click", async () => {
  const button = document.querySelector("#copy-share-prompt");
  const status = document.querySelector("#share-copy-status");
  await navigator.clipboard.writeText(buildSharePrompt(currentReport));
  button.textContent = "已复制";
  status.textContent = "可直接交给 Imagen / imagegen 生成分享图";
  setTimeout(() => {
    button.textContent = "复制图片报告提示词";
    status.textContent = "";
  }, 1600);
});

loadReport().then(render).catch(renderError);
