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
  evidence: [
    { signal: "目标", snippet: "实现这个用户故事，验收条件如下；不要改支付模块，先给计划再动代码。" },
    { signal: "验证", snippet: "已运行 build、lint、单元测试和截图 smoke check，并复查 diff。" },
    { signal: "架构", snippet: "这个模块继续 patch 没意义，重设数据边界，用新的状态模型替换。" },
    { signal: "工作流", snippet: "把这次成功流程沉淀进 AGENTS.md，后续同类任务按 gate 执行。" },
  ],
  rankCaps: ["缺少团队级 playbook、共享 workflow 或方法复制证据。"],
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
  const rows = (report.evidence?.length ? report.evidence : SAMPLE.evidence).slice(0, 6);
  for (const row of rows) {
    const card = document.createElement("article");
    card.className = "evidence-card";
    card.innerHTML = `<strong>${row.signal || "evidence"}</strong><span>${row.snippet || row.summary || ""}</span>`;
    grid.append(card);
  }
}

function render(report) {
  const rank = report.rank || SAMPLE.rank;
  const level = Number(rank.level || 0);
  document.querySelector("#rank-label").textContent = rank.label || RANKS[level][1];
  document.querySelector("#score-value").textContent = rank.score || 0;
  document.querySelector("#confidence").textContent = translateConfidence(rank.confidence || "low");
  document.querySelector("#ownership").textContent = translateOwnership(rank.systemOwnership || "weak");
  document.querySelector("#signals").textContent = report.signalCount || 0;
  document.querySelector("#records").textContent = report.analyzedRecordCount ?? report.recordCount ?? 0;
  document.querySelector("#rank-cap").textContent = firstText(report.rankCaps) || SAMPLE.rankCaps[0];
  document.querySelector("#upgrade-path").textContent = firstText(report.upgradePath) || SAMPLE.upgradePath[0];
  renderQuality(report);
  renderRail(level);
  renderEvidence(report);
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
