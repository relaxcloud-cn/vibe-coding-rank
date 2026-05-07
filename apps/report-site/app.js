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
  recordCount: 128,
  analyzedRecordCount: 120,
  excludedRecordCount: 8,
  judgmentMode: "自动初筛",
  judgmentModeLabel: "自动初筛",
  isFinal: false,
  strongEvidenceCount: 12,
  userControlCount: 8,
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

function decodeBase64Url(value) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function loadReport() {
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.has("data")) {
    return JSON.parse(decodeBase64Url(hash.get("data")));
  }
  if (hash.has("id")) {
    const response = await fetch(`/api/reports/${hash.get("id")}`);
    if (response.ok) {
      const payload = await response.json();
      return payload.report || payload;
    }
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
  document.querySelector("#why-this-rank").textContent = report.whyThisRank || report.narrative?.rankReason || SAMPLE.whyThisRank;
  document.querySelector("#why-not-next").textContent = report.whyNotNextRank || report.narrative?.nextRankGap || SAMPLE.whyNotNextRank;
  renderQuality(report);
  renderDimensions(report);
  renderRail(level);
  renderEvidence(report);
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

function renderQuality(report) {
  const note = document.querySelector("#quality-note");
  const excluded = Number(report.excludedRecordCount || 0);
  const analyzed = Number(report.analyzedRecordCount ?? report.recordCount ?? 0);
  const total = Number(report.recordCount || analyzed);
  if (excluded > 0) {
    note.hidden = false;
    note.textContent = `已过滤 ${excluded} 条系统上下文，实际分析 ${analyzed}/${total} 条记录。`;
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

loadReport().then(render).catch(() => render(SAMPLE));
