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
  upgradePath: ["把成功协作沉淀成 AGENTS.md、rules、skill 或团队 playbook。"],
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
  document.querySelector("#upgrade-path").textContent = firstText(report.upgradePath) || SAMPLE.upgradePath[0];
  document.querySelector("#unlock-status").textContent = unlockText(report);
  document.querySelector("#usage-summary").textContent = usageSummary(report);
  document.querySelector("#quality-summary").textContent = qualitySummary(report);
  document.querySelector("#evidence-structure").textContent = evidenceStructureSummary(report);
  document.querySelector("#behavior-mix").textContent = behaviorMixSummary(report);
  document.querySelector("#stats-insight").textContent = statsInsight(report);
  document.querySelector("#why-this-rank").textContent = report.whyThisRank || report.narrative?.rankReason || SAMPLE.whyThisRank;
  document.querySelector("#why-not-next").textContent = report.whyNotNextRank || report.narrative?.nextRankGap || SAMPLE.whyNotNextRank;
  renderQuality(report);
  renderDimensions(report);
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

证据结构：
${evidenceStructureSummary(report)}

行为结构：
${behaviorMixSummary(report)}

统计解读：
${statsInsight(report)}

六维画像：
${dimensions}

证据摘要：
1. ${evidenceRows[0]}
2. ${evidenceRows[1]}
3. ${evidenceRows[2]}

评级限制：
${shortText(firstText(report.rankCaps) || "暂无明显封顶原因", 52)}

下一步：
${shortText(firstText(report.upgradePath) || "继续沉淀可复用工作流", 52)}

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
  const analyzed = Number(stats.analyzed_record_count ?? report.analyzedRecordCount ?? report.recordCount ?? 0);
  const total = Number(stats.raw_record_count ?? report.recordCount ?? analyzed);
  if (nonScoring > 0) {
    note.hidden = false;
    note.textContent = `已排除 ${nonScoring} 条非评分记录，其中系统上下文 ${context} 条、token 统计 ${usage} 条、工具结果 ${tools} 条；实际分析 ${analyzed}/${total} 条记录。`;
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
