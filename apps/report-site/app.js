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
    cost_estimate: {
      estimatedUsd: 0,
      configured: false,
      note: "未配置 token 单价；只展示 token 强度，不估算美元成本。",
    },
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
  costEstimate: {
    estimatedUsd: 0,
    configured: false,
    note: "未配置 token 单价；只展示 token 强度，不估算美元成本。",
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
    { id: "estimated_cost", label: "成本估算", value: "未配置", detail: "可传入 token 单价", interpretation: "成本用于理解 AI 投入强度，不参与段位升品。" },
    { id: "sample_stability", label: "样本稳定性", value: "6 天", detail: "峰值日占比 33%", interpretation: "样本越分散，越能证明稳定工作方式。" },
    { id: "sample_validity", label: "有效样本", value: "94%", detail: "120/128 条可分析", interpretation: "排除系统上下文、token 统计和工具结果后，只看真实行为。" },
    { id: "strong_evidence_density", label: "强证据密度", value: "10%", detail: "12 条强证据", interpretation: "强证据越密，越能支撑高段位；低密度会降低置信度。" },
    { id: "strong_record_density", label: "强记录占比", value: "10%", detail: "12/120 条记录", interpretation: "按记录去重看强证据，防止一条长消息反复命中。" },
    { id: "usable_promotion_signal", label: "可升品高阶信号", value: "25%", detail: "12/48 个高阶信号", interpretation: "只统计由用户行为支撑、可用于升品的高阶证据。" },
    { id: "assistant_self_report_downgrade", label: "助手自述降权", value: "32 条", detail: "18 条记录受影响", interpretation: "助手说“已完成/已验证/已重构”只算交付痕迹，不算强升品证据。" },
    { id: "user_control", label: "用户主动控制", value: "17%", detail: "8 条主动控制证据", interpretation: "衡量你是否在定义目标、边界、架构和验收。" },
    { id: "user_decision", label: "用户决策占比", value: "17%", detail: "助手执行 75%", interpretation: "高段位必须看到人的系统级决策，而不是 AI 自述完成。" },
    { id: "validation_density", label: "验证闭环密度", value: "11%", detail: "13 条验证信号", interpretation: "测试、构建、lint、截图和人工验收越稳定，结果越可托付。" },
    { id: "rework_pressure", label: "返工压力", value: "0%", detail: "0 条 Bug 循环信号", interpretation: "返工信号不高，说明协作没有明显困在修补循环。" },
    { id: "automation_noise", label: "工具事件占比", value: "0%", detail: "0 条工具事件已排除", interpretation: "工具调用、补丁事件和命令结果不直接评分，只用于解释样本结构。" },
  ],
  metricGroups: [
    { id: "investment", label: "投入强度", value: "128万 token", signal: "活跃 6 天 / 12 会话", basis: "峰值日占比 33%", ratingImpact: "只解释 AI 使用投入和样本稳定性，不直接升品。", risk: "投入分布没有明显单日集中风险。" },
    { id: "sample_quality", label: "样本可信度", value: "120/128", signal: "证据来源 3 个，强记录占比 10%", basis: "信号覆盖 64%", ratingImpact: "影响置信度和高段位封顶；样本薄时不能判六品以上。", risk: "样本里有可复核的强证据。" },
    { id: "human_control", label: "人类控制", value: "17%", signal: "主动控制 17%，用户决策 17%", basis: "助手执行 75%；可升品信号 25%", ratingImpact: "决定六品、七品能否成立；高段位必须看到人的系统级决策。", risk: "用户决策足以支撑更高段位复核。" },
    { id: "validation_loop", label: "验证闭环", value: "11%", signal: "13 条验证信号", basis: "5/6 个维度成立", ratingImpact: "验证不足会压住六品；验收是主要证据。", risk: "有验证信号，但仍要看是否由人定义验收标准。" },
    { id: "efficiency_risk", label: "效率风险", value: "0%", signal: "0 条 Bug 循环信号", basis: "弱信号占比 18%", ratingImpact: "返工和弱信号不直接扣分，但会解释为什么系统归属不稳。", risk: "32 条助手自述已降权。" },
  ],
  statProfile: {
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
    signals: ["用户决策 17%", "主动控制 17%", "助手执行 75%", "可升品信号 25%", "助手降权 32 条", "验证密度 11%", "强记录 10%"],
  },
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

let currentReport = SAMPLE;
let currentReportContext = {
  mode: "sample",
  id: "",
  payloadType: "sample",
  linkMode: "sample",
};

async function loadReport() {
  const pathMatch = location.pathname.match(/^\/(report|share)\/([a-zA-Z0-9_-]{6,64})\/?$/);
  if (pathMatch) {
    const [, routeMode, id] = pathMatch;
    currentReportContext = {
      mode: routeMode,
      id,
      payloadType: routeMode === "report" ? "local-full" : "public-summary",
      linkMode: routeMode === "report" ? "local-full-report" : "public-share-link",
    };
    const response = await fetch(`/api/reports/${id}`);
    if (response.ok) {
      const payload = await response.json();
      const report = payload.report || payload;
      currentReportContext = {
        mode: routeMode,
        id: report.reportId || payload.id || id,
        payloadType: report.reportPayloadType || (routeMode === "report" ? "local-full" : "public-summary"),
        linkMode: report.reportLinkMode || (routeMode === "report" ? "local-full-report" : "public-share-link"),
      };
      return report;
    }
    if (response.status === 404) {
      throw new Error("报告不存在或已经过期。");
    }
    throw new Error("报告加载失败，请稍后重试。");
  }

  currentReportContext = {
    mode: "sample",
    id: "",
    payloadType: "sample",
    linkMode: "sample",
  };
  return SAMPLE;
}

function renderRail(level) {
  const rail = document.querySelector("#rank-rail");
  rail.replaceChildren();
  for (const [value, label, phrase] of RANKS) {
    const active = Number(value) <= level ? " active" : "";
    const compact = document.createElement("div");
    compact.className = `rail-item${active}`;
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = value;
    const body = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = label;
    const description = document.createElement("span");
    description.textContent = phrase;
    body.append(title, document.createElement("br"), description);
    compact.append(badge, body);
    rail.append(compact);
  }
}

function isSampleReport() {
  return currentReportContext.mode === "sample";
}

function sampleFallback(value, fallback) {
  return isSampleReport() ? fallback : value;
}

function normalizeEvidenceText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function evidenceText(row) {
  return normalizeEvidenceText(row?.snippet || row?.summary || row?.reason || row?.label || row?.signal);
}

function uniqueEvidenceRows(rows) {
  const seen = new Set();
  const unique = [];
  for (const row of rows || []) {
    const key = evidenceText(row);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

function evidenceRows(report, fallbackRows = []) {
  const rows = report.strongestEvidence?.length ? report.strongestEvidence : report.evidence?.length ? report.evidence : fallbackRows;
  return uniqueEvidenceRows(rows);
}

function dimensionRows(report) {
  return report.dimensionProfile?.length ? report.dimensionProfile : sampleFallback([], SAMPLE.dimensionProfile);
}

function renderEvidence(report) {
  const grid = document.querySelector("#evidence-grid");
  grid.replaceChildren();
  const rows = evidenceRows(report, isSampleReport() ? SAMPLE.evidence : []).slice(0, 6);
  if (!rows.length) {
    const card = document.createElement("article");
    card.className = "evidence-card";
    const title = document.createElement("strong");
    title.textContent = "暂无可展示证据";
    const reason = document.createElement("em");
    reason.textContent = "当前报告没有公开证据摘要。";
    card.append(title, reason);
    grid.append(card);
    return;
  }
  for (const row of rows) {
    const card = document.createElement("article");
    card.className = "evidence-card";
    const title = document.createElement("strong");
    title.textContent = row.label || row.signal || "证据";
    const reason = document.createElement("em");
    reason.textContent = row.reason || "";
    const summary = document.createElement("span");
    summary.textContent = row.snippet || row.summary || "";
    card.append(title, reason, summary);
    grid.append(card);
  }
}

function rankLabelText(rank) {
  if (!rank) return "未知";
  return rank.label || (rank.level !== undefined ? rankLevelName(rank.level) : "未知");
}

function advancedDecisionText(advanced) {
  const trace = advanced?.decisionTrace || {};
  const parts = [
    `初始支持${rankLabelText(trace.initialRank)}`,
    Array.isArray(trace.capReasons) && trace.capReasons.length ? `封顶原因：${trace.capReasons[0]}` : "",
    `最终${rankLabelText(trace.finalRank)}`,
    trace.confidenceImpact ? `置信度影响：${trace.confidenceImpact}` : "",
  ].filter(Boolean);
  return parts.join("；");
}

function appendAdvancedRow(parent, title, body = "", detail = "", className = "") {
  const row = document.createElement("div");
  row.className = `advanced-row${className ? ` ${className}` : ""}`;
  const titleNode = document.createElement("strong");
  titleNode.textContent = title;
  row.append(titleNode);
  if (body) {
    const bodyNode = document.createElement("span");
    bodyNode.textContent = body;
    row.append(bodyNode);
  }
  if (detail) {
    const detailNode = document.createElement("small");
    detailNode.textContent = detail;
    row.append(detailNode);
  }
  parent.append(row);
}

function renderAdvancedAnalysis(report) {
  const section = document.querySelector("#advanced-analysis");
  const advanced = report.analysisMode === "advanced" ? report.advancedAnalysis : null;
  if (!advanced) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  const keyGate = advanced.gateAudit?.keyGate;
  document.querySelector("#advanced-decision").textContent = advancedDecisionText(advanced);
  document.querySelector("#advanced-key-gate").textContent = keyGate
    ? `${keyGate.label || keyGate.id}：${keyGate.summary || "需要补齐下一品门槛。"}`
    : "当前关键门槛已通过，继续看下一品证据缺口。";

  const gateGrid = document.querySelector("#advanced-gates");
  gateGrid.replaceChildren();
  const passed = Array.isArray(advanced.gateAudit?.passed) ? advanced.gateAudit.passed : [];
  const failed = Array.isArray(advanced.gateAudit?.failed) ? advanced.gateAudit.failed : [];
  for (const item of passed.slice(0, 3)) {
    appendAdvancedRow(gateGrid, `通过：${item.label || item.id}`, item.summary || "");
  }
  for (const item of failed.slice(0, 3)) {
    appendAdvancedRow(gateGrid, `未过：${item.label || item.id}`, item.summary || "");
  }
  if (!gateGrid.children.length) {
    appendAdvancedRow(gateGrid, "暂无门槛审计", "当前报告没有机器门槛数据。");
  }

  const dimensionGrid = document.querySelector("#advanced-dimensions");
  dimensionGrid.replaceChildren();
  for (const item of (advanced.dimensionRubric || []).slice(0, 6)) {
    appendAdvancedRow(
      dimensionGrid,
      `${item.label || item.id}｜${item.status || "缺失"}｜${Number(item.score || 0)}/100`,
      `证据 ${item.evidenceCount ?? 0} 条，强证据 ${item.strongEvidenceCount ?? 0} 条。`,
      item.nextGap || "",
    );
  }
  if (!dimensionGrid.children.length) {
    appendAdvancedRow(dimensionGrid, "暂无六维依据", "当前报告没有维度数据。");
  }

  const evidenceGrid = document.querySelector("#advanced-evidence");
  evidenceGrid.replaceChildren();
  const accepted = Array.isArray(advanced.evidenceAudit?.accepted) ? advanced.evidenceAudit.accepted : [];
  const downranked = Array.isArray(advanced.evidenceAudit?.downranked) ? advanced.evidenceAudit.downranked : [];
  for (const item of accepted.slice(0, 5)) {
    appendAdvancedRow(evidenceGrid, `采纳：${item.label || item.signal}：${item.reason || ""}`, "", item.dimension || item.strength || "", "accepted");
  }
  for (const item of downranked.slice(0, 3)) {
    appendAdvancedRow(evidenceGrid, `降权：${item.label || item.signal}：${item.reason || ""}`, "", item.dimension || item.strength || "", "downranked");
  }
  if (!evidenceGrid.children.length) {
    appendAdvancedRow(evidenceGrid, "暂无证据审计", "当前报告没有证据采纳或降权摘要。");
  }

  const planGrid = document.querySelector("#advanced-upgrade-plan");
  planGrid.replaceChildren();
  for (const item of (advanced.upgradePlan || []).slice(0, 3)) {
    appendAdvancedRow(planGrid, item);
  }
  if (!planGrid.children.length) {
    appendAdvancedRow(planGrid, "继续积累真实项目证据，并把成功做法沉淀成可复用工作流。");
  }

  const limitations = document.querySelector("#advanced-limitations");
  limitations.replaceChildren();
  for (const item of (advanced.limitations || []).slice(0, 4)) {
    const row = document.createElement("div");
    row.textContent = item;
    limitations.append(row);
  }
}

function reportTitle(report) {
  return report.analysisMode === "advanced" ? "高级分析报告" : "AI 段位分析报告";
}

function formatGeneratedAt(value) {
  if (!value) return "未知";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", { hour12: false });
}

function reportSourceText(context, report) {
  const payloadType = report.reportPayloadType || context.payloadType;
  if (payloadType === "local-full") return "local-full";
  if (payloadType === "public-summary") return "脱敏摘要";
  return payloadType || "样例";
}

function reportPrivacyText(context, report) {
  const payloadType = report.reportPayloadType || context.payloadType;
  if (payloadType === "local-full") return "本地完整报告";
  if (payloadType === "public-summary") {
    if (context.mode === "share") return "脱敏公开分享";
    return "公网脱敏摘要";
  }
  return "样例数据";
}

function qrHref(context, report) {
  const id = report.reportId || context.id;
  const linkMode = report.reportLinkMode || context.linkMode;
  if (!id || !["local-full-report", "public-share-link"].includes(String(linkMode))) return "";
  return `${location.origin}/api/reports/${id}/qr.svg`;
}

function renderReportMeta(report) {
  const context = currentReportContext;
  const hasReportRoute = ["report", "share"].includes(context.mode);
  document.body.classList.toggle("report-mode", hasReportRoute);
  document.querySelector("#report-title").textContent = reportTitle(report);
  document.querySelector("#report-id").textContent = report.reportId || context.id || "sample";
  document.querySelector("#report-generated-at").textContent = formatGeneratedAt(report.generatedAt);
  document.querySelector("#report-source").textContent = reportSourceText(context, report);
  document.querySelector("#report-privacy").textContent = reportPrivacyText(context, report);
  const qr = document.querySelector("#qr-report-link");
  const href = qrHref(context, report);
  if (href) {
    qr.hidden = false;
    qr.href = href;
  } else {
    qr.hidden = true;
    qr.removeAttribute("href");
  }
}

function render(report) {
  document.querySelector(".dashboard").classList.remove("error-state");
  currentReport = report;
  const rank = report.rank || sampleFallback({ level: 0, label: "未知", score: 0, confidence: "low", systemOwnership: "weak" }, SAMPLE.rank);
  const level = Number(rank.level || 0);
  renderReportMeta(report);
  document.querySelector("#rank-label").textContent = rank.label || RANKS[level][1];
  document.querySelector("#verdict").textContent = report.verdict || report.narrative?.oneLine || sampleFallback("当前报告缺少一句话判定。", SAMPLE.verdict);
  document.querySelector("#score-value").textContent = rank.score || 0;
  document.querySelector("#confidence").textContent = translateConfidence(rank.confidence || "low");
  document.querySelector("#ownership").textContent = translateOwnership(rank.systemOwnership || "weak");
  document.querySelector("#judgment-mode").textContent = judgmentText(report);
  document.querySelector("#strong-evidence").textContent = report.strongEvidenceCount ?? 0;
  document.querySelector("#user-control").textContent = report.userControlCount ?? 0;
  document.querySelector("#signals").textContent = report.signalCount || 0;
  document.querySelector("#records").textContent = report.analyzedRecordCount ?? report.recordCount ?? 0;
  document.querySelector("#rank-cap").textContent = firstText(report.rankCaps) || sampleFallback("当前报告没有段位上限说明。", SAMPLE.rankCaps[0]);
  document.querySelector("#upgrade-path").textContent = upgradePathSummary(report);
  document.querySelector("#unlock-status").textContent = unlockText(report);
  document.querySelector("#usage-summary").textContent = usageSummary(report);
  document.querySelector("#quality-summary").textContent = qualitySummary(report);
  document.querySelector("#evidence-structure").textContent = evidenceStructureSummary(report);
  document.querySelector("#behavior-mix").textContent = behaviorMixSummary(report);
  document.querySelector("#stats-insight").textContent = statsInsight(report);
  const statEvidenceRow = statEvidence(report);
  document.querySelector("#stat-evidence").textContent = `${statEvidenceRow.label || "硬统计证据"}：${statEvidenceRow.conclusion || ""}`;
  document.querySelector("#stat-evidence-detail").textContent = statEvidenceDetail(statEvidenceRow);
  const profile = statProfile(report);
  document.querySelector("#stat-profile").textContent = `${profile.label || "统计画像"}：${profile.summary || ""}`;
  document.querySelector("#stat-profile-detail").textContent = profileDetail(profile);
  document.querySelector("#rank-gate-summary").textContent = rankGateSummary(report);
  document.querySelector("#quality-flags").textContent = qualityFlagSummary(report);
  document.querySelector("#drag-factors").textContent = dragFactorSummary(report);
  document.querySelector("#why-this-rank").textContent = report.whyThisRank || report.narrative?.rankReason || sampleFallback("当前报告缺少段位原因。", SAMPLE.whyThisRank);
  document.querySelector("#why-not-next").textContent = report.whyNotNextRank || report.narrative?.nextRankGap || sampleFallback("当前报告缺少下一品差距说明。", SAMPLE.whyNotNextRank);
  document.querySelector("#next-action-title").textContent = nextActionTitle(report);
  document.querySelector("#next-action-body").textContent = upgradePathSummary(report);
  document.querySelector("#next-action-gate").textContent = rankGateSummary(report);
  renderQuality(report);
  renderDimensions(report);
  renderHardStatCards(report);
  renderMetricGroups(report);
  renderRail(level);
  renderEvidence(report);
  renderAdvancedAnalysis(report);
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
  document.body.classList.add("report-mode");
  document.querySelector("#report-title").textContent = "AI 段位分析报告";
  document.querySelector("#report-id").textContent = currentReportContext.id || "未知";
  document.querySelector("#report-generated-at").textContent = "未加载";
  document.querySelector("#report-source").textContent = "不可用";
  document.querySelector("#report-privacy").textContent = "未加载";
  document.querySelector("#qr-report-link").hidden = true;
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
  document.querySelector("#next-action-title").textContent = "重新生成报告";
  document.querySelector("#next-action-body").textContent = "重新运行 CLI，生成有效的脱敏报告链接。";
  document.querySelector("#next-action-gate").textContent = "当前链接无法解析。";
  document.querySelector("#rank-cap").textContent = "报告数据不可用。";
  document.querySelector("#upgrade-path").textContent = "重新运行 npx github:relaxcloud-cn/vibe-coding-rank --open";
  document.querySelector("#unlock-status").textContent = "未加载";
  document.querySelector("#usage-summary").textContent = "暂无";
  document.querySelector("#quality-summary").textContent = "暂无";
  document.querySelector("#evidence-structure").textContent = "暂无";
  document.querySelector("#behavior-mix").textContent = "暂无";
  document.querySelector("#stats-insight").textContent = "暂无";
  document.querySelector("#stat-profile").textContent = "暂无";
  document.querySelector("#stat-profile-detail").textContent = "暂无";
  document.querySelector("#rank-gate-summary").textContent = "暂无";
  document.querySelector("#quality-flags").textContent = "暂无";
  document.querySelector("#drag-factors").textContent = "暂无";
  document.querySelector("#hard-stat-grid").innerHTML = "";
  document.querySelector("#metric-group-grid").innerHTML = "";
  document.querySelector("#advanced-analysis").hidden = true;
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
  const rows = dimensionRows(report);
  grid.replaceChildren();
  if (!rows.length) {
    const item = document.createElement("article");
    item.className = "dimension-card";
    const body = document.createElement("div");
    const label = document.createElement("strong");
    label.textContent = "暂无维度数据";
    const status = document.createElement("span");
    status.textContent = "缺失";
    body.append(label, status);
    item.append(body);
    grid.append(item);
    return;
  }
  for (const row of rows) {
    const item = document.createElement("article");
    item.className = "dimension-card";
    const body = document.createElement("div");
    const label = document.createElement("strong");
    label.textContent = row.label || "维度";
    const status = document.createElement("span");
    status.textContent = row.status || "缺失";
    const meter = document.createElement("meter");
    const score = Number(row.score || 0);
    meter.min = 0;
    meter.max = 100;
    meter.value = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
    body.append(label, status);
    item.append(body, meter);
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
  const cost = report.costEstimate || usage.cost_estimate || {};
  if (!usage.total_tokens) return "暂无 token 统计。";
  const costText = cost.configured ? `；估算成本 ${formatMoney(cost.estimatedUsd)}` : "";
  return `总 token ${total}；峰值日 ${peak}；活跃 ${activeDays} 天 / ${activeSessions} 会话${costText}。`;
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
  const row = RANKS[Number(level)];
  return String(row?.[1] || `${level}品`).split(" · ")[0];
}

function formatMoney(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return "$0";
  if (number < 1) return `$${number.toFixed(2)}`;
  if (number < 100) return `$${number.toFixed(1)}`;
  return `$${Math.round(number)}`;
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
  if (stats.validation_density) parts.push(`验证密度 ${formatPercent(stats.validation_density)}`);
  if (stats.strong_record_density) parts.push(`强记录占比 ${formatPercent(stats.strong_record_density)}`);
  if (hasPromotionUsabilityStats(stats) && stats.promotion_usable_signal_ratio) parts.push(`可升品信号 ${formatPercent(stats.promotion_usable_signal_ratio)}`);
  return parts.length ? `${parts.join("；")}。` : "暂无证据结构统计。";
}

function behaviorMixSummary(report) {
  const stats = report.hardStats || {};
  const userDecision = stats.promotion_user_decision_ratio ?? stats.user_decision_ratio ?? 0;
  const assistantExecution = stats.promotion_assistant_execution_ratio ?? 0;
  const parts = [];
  if (userDecision) parts.push(`用户决策 ${formatPercent(userDecision)}`);
  if (assistantExecution) parts.push(`助手执行 ${formatPercent(assistantExecution)}`);
  if (hasPromotionUsabilityStats(stats) && stats.promotion_usable_signal_ratio) parts.push(`可升品信号 ${formatPercent(stats.promotion_usable_signal_ratio)}`);
  if (stats.downgraded_assistant_signal_count) parts.push(`助手降权 ${stats.downgraded_assistant_signal_count} 条`);
  if (stats.user_decision_count) parts.push(`决策证据 ${stats.user_decision_count} 条`);
  if (stats.bug_loop_density) parts.push(`返工压力 ${formatPercent(stats.bug_loop_density)}`);
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

function statEvidence(report) {
  if (report.statEvidence?.label || report.statEvidence?.conclusion) return report.statEvidence;
  const stats = report.hardStats || {};
  const level = Number(report.rank?.level || 0);
  const activeDays = Number(stats.active_days || 0);
  const sourceCount = Number(stats.source_count || 0);
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

  if (activeDays >= 5 || sourceCount >= 3) {
    positiveSignals.push(`样本跨 ${activeDays || "未知"} 天、${sourceCount || "未知"} 个来源，稳定性好于单次高光。`);
  } else if (analyzed < 20 || sourceCount < 2) {
    riskSignals.push(`样本只有 ${analyzed} 条有效记录、${sourceCount} 个来源，高段位置信度不足。`);
  }
  if (userDecisionRatio >= 0.08) {
    positiveSignals.push(`用户决策 ${formatPercent(userDecisionRatio)}，达到七品复核线。`);
  } else if (userDecisionRatio >= 0.03) {
    positiveSignals.push(`用户决策 ${formatPercent(userDecisionRatio)}，可支撑六品复核。`);
  } else {
    riskSignals.push(`用户决策 ${formatPercent(userDecisionRatio)}，系统级取舍证据不足。`);
  }
  if (userControlRatio >= 0.1) {
    positiveSignals.push(`主动控制 ${formatPercent(userControlRatio)}，人在定义目标、边界、架构和验收。`);
  } else if (userControlRatio > 0 && userControlRatio < 0.05) {
    riskSignals.push(`主动控制 ${formatPercent(userControlRatio)}，高阶信号容易被助手自述稀释。`);
  }
  if (validationDensity >= 0.08) {
    positiveSignals.push(`验证密度 ${formatPercent(validationDensity)}，结果有可托付证据。`);
  } else if (validationDensity < 0.03) {
    riskSignals.push(`验证密度 ${formatPercent(validationDensity)}，闭环不足会压住六品。`);
  }
  if (establishedDimensions >= 5 && signalCoverageRatio >= 0.5) {
    positiveSignals.push(`成立维度 ${establishedDimensions}/6、信号覆盖 ${formatPercent(signalCoverageRatio)}，能力结构较完整。`);
  } else if (establishedDimensions < 4) {
    riskSignals.push(`成立维度 ${establishedDimensions}/6，系统能力结构还不完整。`);
  }
  if (strongRecordDensity >= 0.1) {
    positiveSignals.push(`强记录占比 ${formatPercent(strongRecordDensity)}，可复核高阶证据足够厚。`);
  } else if (strongRecordDensity < 0.05 || promotionRecordCount < 4) {
    riskSignals.push(`强记录占比 ${formatPercent(strongRecordDensity)}、高阶记录 ${promotionRecordCount} 条，高段位证据偏薄。`);
  }
  if (assistantExecutionRatio >= 0.7) riskSignals.push(`助手执行 ${formatPercent(assistantExecutionRatio)}，需要确认高阶结论不是 AI 自述完成。`);
  if (hasUsabilityStats && usablePromotionRatio > 0 && usablePromotionRatio < 0.35) riskSignals.push(`可升品高阶信号 ${formatPercent(usablePromotionRatio)}，高阶词里用户行为支撑不足。`);
  if (downgradedAssistantCount > 0) riskSignals.push(`${downgradedAssistantCount} 条助手自述高阶信号已降权，不计为强升品证据。`);
  if (bugLoopDensity >= 0.08) riskSignals.push(`返工压力 ${formatPercent(bugLoopDensity)}，可能仍困在局部 patch 循环。`);
  if (peakDayShare >= 0.5) riskSignals.push(`峰值日 token 占比 ${formatPercent(peakDayShare)}，投入集中会削弱稳定性判断。`);
  if (totalTokens) investmentSignals.push(`总 token ${formatTokens(totalTokens)}`);
  if (stats.peak_day_tokens) investmentSignals.push(`峰值日 ${formatTokens(stats.peak_day_tokens)}`);

  if (userDecisionRatio >= 0.08 && userControlRatio >= 0.1 && validationDensity >= 0.08 && establishedDimensions >= 5 && strongRecordDensity >= 0.08 && usablePromotionRatio >= 0.35 && sourceCount >= 3) {
    supportLevel = 7;
  } else if (userDecisionRatio >= 0.03 && userControlRatio >= 0.05 && validationDensity > 0 && establishedDimensions >= 4 && promotionRecordCount >= 4 && usablePromotionRatio >= 0.25) {
    supportLevel = 6;
  } else if (validationDensity > 0 && establishedDimensions >= 3) {
    supportLevel = 5;
  } else if (userControlRatio > 0 || validationDensity > 0) {
    supportLevel = 4;
  }

  const confidenceImpact = riskSignals.length >= 3 || strongRecordDensity < 0.05 || userDecisionRatio < 0.03 || assistantExecutionRatio >= 0.7 || (hasUsabilityStats && usablePromotionRatio > 0 && usablePromotionRatio < 0.35)
    ? "降低置信度并可能封顶"
    : riskSignals.length ? "局部降低置信度" : "提高置信度";
  const label = supportLevel >= level
    ? "硬统计支撑当前段位"
    : supportLevel < level ? "硬统计低于当前段位" : "硬统计支撑";
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

function statEvidenceDetail(evidence) {
  const support = [evidence.supportLabel, evidence.confidenceImpact].filter(Boolean).join("；");
  const positives = Array.isArray(evidence.positiveSignals) && evidence.positiveSignals.length
    ? `正向：${evidence.positiveSignals.slice(0, 2).join("；")}。`
    : "";
  const risks = Array.isArray(evidence.riskSignals) && evidence.riskSignals.length
    ? `风险：${evidence.riskSignals.slice(0, 2).join("；")}。`
    : "";
  return `${support ? `${support}。` : ""}${positives}${risks}${evidence.ratingUse || "硬统计用于支撑置信度、解释封顶和定位下一步；token 和成本只说明投入强度，不能直接升品。"}`;
}

function statProfile(report) {
  if (report.statProfile?.label || report.statProfile?.summary) return report.statProfile;
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
  if (totalTokens >= 500000) {
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
  } else if (totalTokens >= 500000 && userDecisionRatio < 0.05) {
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

function profileDetail(profile) {
  const signals = Array.isArray(profile.signals) && profile.signals.length
    ? `关键数字：${profile.signals.slice(0, 4).join("；")}。`
    : "";
  const reasons = Array.isArray(profile.reasons) && profile.reasons.length
    ? `画像依据：${profile.reasons.slice(0, 2).join("；")}。`
    : "";
  return `${profile.ratingUse || "统计画像用于解释置信度、封顶和下一步，不直接升品。"}${signals}${reasons}`;
}

function rankGateSummary(report) {
  const failed = firstFailedGate(report);
  if (!failed) return "当前关键门槛已通过，继续看下一品证据缺口。";
  return `${failed.label || failed.id}未通过：${shortText(failed.reason || "", 56)}`;
}

function nextActionTitle(report) {
  const failed = firstFailedGate(report);
  if (failed?.label) return `先补齐${failed.label}`;
  const nextRank = report.nextRank?.label || "下一品";
  return `冲击${nextRank}`;
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
  return firstText(report.upgradePath) || sampleFallback("继续积累真实项目证据，并把成功做法沉淀成可复用工作流。", SAMPLE.gateUpgradeAdvice || SAMPLE.upgradePath[0]);
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
  const cost = report.costEstimate || usage.cost_estimate || {};
  return [
    {
      id: "ai_investment",
      label: "AI 投入强度",
      value: usage.total_tokens ? `${formatTokens(usage.total_tokens)} token` : "暂无",
      detail: usage.active_days || usage.active_sessions ? `活跃 ${usage.active_days || 0} 天 / ${usage.active_sessions || 0} 会话` : "未读取到 token 统计",
      interpretation: "只说明 AI 使用投入，不直接参与段位升品。",
    },
    {
      id: "estimated_cost",
      label: "成本估算",
      value: cost.configured ? formatMoney(cost.estimatedUsd) : "未配置",
      detail: cost.configured ? "按用户传入单价粗估" : "可传入 token 单价",
      interpretation: "成本用于理解 AI 投入强度，不参与段位升品。",
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
      id: "strong_record_density",
      label: "强记录占比",
      value: stats.strong_record_density ? formatPercent(stats.strong_record_density) : "0%",
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
      value: hasPromotionUsabilityStats(stats) && stats.promotion_usable_signal_ratio ? formatPercent(stats.promotion_usable_signal_ratio) : "0%",
      detail: `${stats.promotion_usable_signal_count || 0}/${stats.promotion_evidence_count || 0} 个高阶信号`,
      interpretation: "只统计由用户行为支撑、可用于升品的高阶证据。",
    },
    {
      id: "assistant_self_report_downgrade",
      label: "助手自述降权",
      value: stats.downgraded_assistant_signal_count ? `${stats.downgraded_assistant_signal_count} 条` : "0 条",
      detail: `${stats.downgraded_assistant_record_count || 0} 条记录受影响`,
      interpretation: "助手说“已完成/已验证/已重构”只算交付痕迹，不算强升品证据。",
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
    {
      id: "validation_density",
      label: "验证闭环密度",
      value: stats.validation_density ? formatPercent(stats.validation_density) : "0%",
      detail: `${stats.validation_count || 0} 条验证信号`,
      interpretation: "测试、构建、lint、截图和人工验收越稳定，结果越可托付。",
    },
    {
      id: "rework_pressure",
      label: "返工压力",
      value: stats.bug_loop_density ? formatPercent(stats.bug_loop_density) : "0%",
      detail: `${stats.bug_loop_count || 0} 条 Bug 循环信号`,
      interpretation: Number(stats.bug_loop_density || 0) >= 0.08 ? "返工压力高，说明迭代控制可能还停在局部 patch。" : "返工信号不高，说明协作没有明显困在修补循环。",
    },
    {
      id: "automation_noise",
      label: "工具事件占比",
      value: stats.tool_event_record_ratio ? formatPercent(stats.tool_event_record_ratio) : "0%",
      detail: `${stats.tool_event_record_count || 0} 条工具事件已排除`,
      interpretation: "工具调用、补丁事件和命令结果不直接评分，只用于解释样本结构。",
    },
  ];
}

function fallbackMetricGroups(report) {
  const stats = report.hardStats || {};
  const usage = { ...(report.usageStats || {}), ...stats };
  const cost = report.costEstimate || usage.cost_estimate || {};
  const totalTokens = usage.total_tokens || 0;
  const activeDays = Number(usage.active_days || 0);
  const activeSessions = Number(usage.active_sessions || 0);
  const peakDayShare = Number(usage.peak_day_token_share || 0);
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
  const costText = cost.configured ? `，估算成本 ${formatMoney(cost.estimatedUsd)}` : "";

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
      basis: assistantExecutionRatio ? `助手执行 ${formatPercent(assistantExecutionRatio)}；可升品信号 ${formatPercent(usablePromotionRatio)}` : "缺少助手执行占比",
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
      risk: downgradedAssistantCount ? `${downgradedAssistantCount} 条助手自述已降权。` : bugLoopDensity >= 0.08 ? "返工压力高，可能仍停在局部 patch 循环。" : "没有明显困在修补循环。",
    },
  ];
}

function renderMetricGroups(report) {
  const grid = document.querySelector("#metric-group-grid");
  const rows = report.metricGroups?.length ? report.metricGroups : fallbackMetricGroups(report);
  grid.replaceChildren();
  for (const row of rows) {
    const item = document.createElement("article");
    item.className = "metric-group-card";
    const label = document.createElement("span");
    label.textContent = row.label || "统计";
    const value = document.createElement("strong");
    value.textContent = row.value || "暂无";
    const signal = document.createElement("em");
    signal.textContent = row.signal || "";
    const impact = document.createElement("small");
    impact.textContent = row.ratingImpact || "";
    const risk = document.createElement("p");
    risk.textContent = row.risk || row.basis || "";
    item.append(label, value, signal, impact, risk);
    grid.append(item);
  }
}

function renderHardStatCards(report) {
  const grid = document.querySelector("#hard-stat-grid");
  const rows = report.hardStatCards?.length ? report.hardStatCards : fallbackHardStatCards(report);
  grid.replaceChildren();
  for (const row of rows) {
    const item = document.createElement("article");
    item.className = "hard-stat-card";
    const label = document.createElement("span");
    label.textContent = row.label || "硬指标";
    const value = document.createElement("strong");
    value.textContent = row.value || "暂无";
    const detail = document.createElement("em");
    detail.textContent = row.detail || "";
    const interpretation = document.createElement("p");
    interpretation.textContent = row.interpretation || "";
    item.append(label, value, detail, interpretation);
    grid.append(item);
  }
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

function buildSharePrompt(report) {
  const rank = report.rank || sampleFallback({}, SAMPLE.rank);
  const promptEvidenceRows = evidenceRows(report, isSampleReport() ? SAMPLE.evidence : [])
    .slice(0, 3)
    .map((item) => `${item.label || item.signal || "证据"}：${shortText(item.reason || item.snippet || "", 36)}`);
  while (promptEvidenceRows.length < 3) promptEvidenceRows.push("证据不足：继续积累真实 AI 工作记录");
  const dimensions = dimensionRows(report)
    .slice(0, 6)
    .map((item) => `${item.label || item.id} ${item.status || "缺失"} ${Number(item.score || 0)}/100`)
    .join("；");
  const hardCards = shareHardStatCards(report.hardStatCards?.length ? report.hardStatCards : fallbackHardStatCards(report))
    .map((item) => `${item.label} ${item.value}：${shortText(item.interpretation, 24)}`)
    .join("；");
  const metricRows = (report.metricGroups?.length ? report.metricGroups : fallbackMetricGroups(report))
    .slice(0, 5)
    .map((item) => `${item.label} ${item.value}：${shortText(item.ratingImpact || item.risk || "", 28)}`)
    .join("；");
  const profile = statProfile(report);
  const profileSignals = Array.isArray(profile.signals) ? profile.signals.slice(0, 6).join("，") : "";
  const profileReasons = Array.isArray(profile.reasons) ? profile.reasons.slice(0, 3).join("；") : "";
  const statEvidenceRow = statEvidence(report);
  const statEvidenceSignals = [
    ...(Array.isArray(statEvidenceRow.positiveSignals) ? statEvidenceRow.positiveSignals.slice(0, 2) : []),
    ...(Array.isArray(statEvidenceRow.riskSignals) ? statEvidenceRow.riskSignals.slice(0, 2) : []),
  ].join("；");
  const url = location.href;
  return `
Use case: infographic-diagram
Asset type: 4:5 vertical Chinese social-share poster for Airank Vibe Coding Rank
Primary request: Create a premium Chinese AI ability report poster. It must look like a polished product report, not a meme or template certificate.

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

统计仪表盘：
${metricRows || "投入强度、样本可信度、人类控制、验证闭环、效率风险"}

证据结构：
${evidenceStructureSummary(report)}

行为结构：
${behaviorMixSummary(report)}

统计解读：
${statsInsight(report)}

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
${rankGateSummary(report)}

质量提示：
${qualityFlagSummary(report)}

拖累项 / 返工压力：
${dragFactorSummary(report)}

六维画像：
${dimensions}

证据摘要：
1. ${promptEvidenceRows[0]}
2. ${promptEvidenceRows[1]}
3. ${promptEvidenceRows[2]}

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

function rankGatePromptLine(item) {
  const parts = [`- ${item.label || item.id}：${item.passed ? "通过" : "未通过"}`];
  if (item.observed !== undefined) parts.push(`观测=${JSON.stringify(item.observed)}`);
  if (item.required !== undefined) parts.push(`要求=${JSON.stringify(item.required)}`);
  if (item.reason) parts.push(`原因=${item.reason}`);
  return parts.join("；");
}

function buildJudgePrompt(report) {
  const rank = report.rank || sampleFallback({}, SAMPLE.rank);
  const nextRank = report.nextRank || {};
  const hardCards = shareHardStatCards(report.hardStatCards?.length ? report.hardStatCards : fallbackHardStatCards(report))
    .map((item) => `- ${item.label}：${item.value}；${item.detail || ""}；${item.interpretation || ""}`)
    .join("\n");
  const metricRows = (report.metricGroups?.length ? report.metricGroups : fallbackMetricGroups(report))
    .slice(0, 5)
    .map((item) => `- ${item.label}：${item.value}；${item.signal || ""}；评级作用：${item.ratingImpact || ""}；风险：${item.risk || ""}`)
    .join("\n");
  const dimensions = dimensionRows(report)
    .slice(0, 6)
    .map((item) => `- ${item.label || item.id}：${item.status || "缺失"}，${Number(item.score || 0)}/100，证据 ${item.evidence_count ?? item.evidenceCount ?? "未知"} 条`)
    .join("\n");
  const gates = (report.rankGates || [])
    .map(rankGatePromptLine)
    .join("\n");
  const judgeEvidenceRows = evidenceRows(report, isSampleReport() ? SAMPLE.evidence : [])
    .slice(0, 8)
    .map((item, index) => `${index + 1}. ${item.label || item.signal || "证据"}｜${item.dimension || ""}｜${item.strength || ""}｜${item.reason || item.summary || ""}`)
    .join("\n");
  const profile = statProfile(report);
  const profileSignals = Array.isArray(profile.signals) ? profile.signals.join("；") : "";
  const profileReasons = Array.isArray(profile.reasons) ? profile.reasons.map((item) => `- ${item}`).join("\n") : "";
  const statEvidenceRow = statEvidence(report);
  const statEvidencePositive = Array.isArray(statEvidenceRow.positiveSignals)
    ? statEvidenceRow.positiveSignals.map((item) => `- ${item}`).join("\n")
    : "";
  const statEvidenceRisks = Array.isArray(statEvidenceRow.riskSignals)
    ? statEvidenceRow.riskSignals.map((item) => `- ${item}`).join("\n")
    : "";

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
- 置信度：${translateConfidence(rank.confidence || "low")}
- 系统归属：${translateOwnership(rank.systemOwnership || "weak")}
- 一句话：${report.verdict || report.narrative?.oneLine || ""}

硬指标卡：
${hardCards || "- 暂无硬指标卡"}

统计仪表盘：
${metricRows || "- 暂无统计仪表盘"}

证据结构：
- ${evidenceStructureSummary(report)}
- ${behaviorMixSummary(report)}
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
${qualityFlagSummary(report)}

拖累项：
${dragFactorSummary(report)}

段位封顶原因：
${(report.rankCaps || []).slice(0, 5).map((item) => `- ${item}`).join("\n") || "- 暂无明显封顶原因"}

最强证据链：
${judgeEvidenceRows || "1. 证据不足"}

请输出中文最终报告，严格包含以下小节：
1. 最终段位：是否维持、上调或下调自动初筛结果。
2. 一句话判定：直接说这个人的系统归属状态。
3. 为什么是这个段位：用 3 到 5 条证据说明。
4. 为什么还不是下一品：引用未通过门槛或封顶原因。
5. 证据可信度：说明样本强弱、用户决策占比、助手自述风险和 token/成本统计如何解读。
6. 下一品升级路线：给 3 条具体行动，必须绑定第一个未通过的下一品门槛。
7. 不确定性：列出还需要补充的证据。
`.trim();
}

function shareLink() {
  return location.href;
}

function renderShareState(report) {
  const note = document.querySelector("#share-note");
  if (currentReportContext.mode === "report") {
    note.textContent = "当前是本地完整报告；只从本机服务读取，未上传公网。";
    return;
  }
  if (currentReportContext.mode === "share") {
    note.textContent = "当前是官网公开分享报告；官网存储的是脱敏摘要，原始日志未上传。";
    return;
  }
  if (report.privacy?.rawLogsUploaded === false) {
    note.textContent = "当前报告不包含原始日志，可复制链接分享。";
    return;
  }
  note.textContent = "当前是样例报告。运行 CLI 后可生成你的个人链接。";
}

function activateSideItem(targetId) {
  for (const item of document.querySelectorAll(".side-item")) {
    item.classList.toggle("active", item.dataset.target === targetId);
  }
}

function setupReportNavigation() {
  const items = [...document.querySelectorAll(".side-item[data-target]")];
  for (const item of items) {
    item.addEventListener("click", () => {
      const target = document.getElementById(item.dataset.target);
      if (!target) return;
      activateSideItem(item.dataset.target);
      if (typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  if (typeof IntersectionObserver === "undefined") return;

  const dashboard = document.querySelector(".dashboard");
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) activateSideItem(visible.target.id);
  }, {
    root: dashboard,
    threshold: [0.2, 0.45, 0.7],
  });

  for (const section of document.querySelectorAll(".report-section")) {
    observer.observe(section);
  }
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

async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea fallback below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.append(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
}

document.querySelector("#copy-command").addEventListener("click", async () => {
  const command = "npx github:relaxcloud-cn/vibe-coding-rank --open";
  const button = document.querySelector("#copy-command");
  const previous = button.innerHTML;
  const copied = await copyText(command);
  button.innerHTML = copied
    ? `<span><span class="prompt">$</span> 已复制到剪贴板</span><span class="copy-icon" aria-hidden="true">OK</span>`
    : `<span><span class="prompt">$</span> 复制失败，请手动选中命令</span><span class="copy-icon" aria-hidden="true">!</span>`;
  setTimeout(() => {
    button.innerHTML = previous;
  }, 1200);
});

document.querySelector("#copy-report-link").addEventListener("click", async () => {
  const button = document.querySelector("#copy-report-link");
  const status = document.querySelector("#share-copy-status");
  const copied = await copyText(shareLink());
  button.textContent = copied ? "已复制链接" : "复制失败";
  status.textContent = copied
    ? ["report", "share"].includes(currentReportContext.mode) ? "报告链接已复制" : "链接已复制"
    : "浏览器拒绝复制，请手动复制当前地址。";
  setTimeout(() => {
    button.textContent = "复制报告链接";
    status.textContent = "";
  }, 1600);
});

document.querySelector("#copy-share-prompt").addEventListener("click", async () => {
  const button = document.querySelector("#copy-share-prompt");
  const status = document.querySelector("#share-copy-status");
  const copied = await copyText(buildSharePrompt(currentReport));
  button.textContent = copied ? "已复制" : "复制失败";
  status.textContent = copied ? "可直接交给 Imagen / imagegen 生成分享图" : "浏览器拒绝复制，请稍后重试。";
  setTimeout(() => {
    button.textContent = "复制图片报告提示词";
    status.textContent = "";
  }, 1600);
});

document.querySelector("#copy-judge-prompt").addEventListener("click", async () => {
  const button = document.querySelector("#copy-judge-prompt");
  const status = document.querySelector("#share-copy-status");
  const copied = await copyText(buildJudgePrompt(currentReport));
  button.textContent = copied ? "已复制" : "复制失败";
  status.textContent = copied ? "可交给 AI judge 做最终复核" : "浏览器拒绝复制，请稍后重试。";
  setTimeout(() => {
    button.textContent = "复制深度判定提示词";
    status.textContent = "";
  }, 1600);
});

setupReportNavigation();

loadReport().then(render).catch(renderError);
