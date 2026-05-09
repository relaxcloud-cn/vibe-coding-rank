import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(resolve(ROOT, "apps/report-site/index.html"), "utf-8");
const app = readFileSync(resolve(ROOT, "apps/report-site/app.js"), "utf-8");

const advancedReport = {
  reportId: "advanced123",
  reportLinkMode: "public-share-link",
  reportPayloadType: "public-summary",
  analysisMode: "advanced",
  rank: { level: 6, label: "六品 · 已有大成", score: 76, confidence: "high", systemOwnership: "strong" },
  verdict: "高级报告",
  strongestEvidence: [{ label: "架构判断证据", reason: "关注系统边界。" }],
  advancedAnalysis: {
    decisionTrace: {
      initialRank: { level: 7, label: "七品 · 已臻化境" },
      capReasons: ["自动初筛最高只确认到七品；八品需要单独复核团队复制证据。"],
      finalRank: { level: 6, label: "六品 · 已有大成" },
      confidenceImpact: "助手执行占比较高，局部降低置信度。",
    },
    gateAudit: {
      passed: [{ id: "level7_user_decision_ratio", label: "七品用户决策占比", summary: "观测 17%，要求 8%。" }],
      failed: [{ id: "level8_team_replication", label: "八品团队复制", summary: "团队复用强证据不足。" }],
      keyGate: { id: "level8_team_replication", label: "八品团队复制", summary: "团队复用强证据不足。" },
    },
    dimensionRubric: [
      { id: "architecture_judgment", label: "架构判断", status: "成立", score: 65, evidenceCount: 9, strongEvidenceCount: 9, nextGap: "提升到稳定需要更多跨会话强证据。" },
      { id: "method_replication", label: "方法复制", status: "线索", score: 35, evidenceCount: 10, strongEvidenceCount: 0, nextGap: "需要他人复用证据。" },
    ],
    evidenceAudit: {
      accepted: [{ label: "架构判断证据", reason: "用户主动定义模块边界。", dimension: "系统设计" }],
      downranked: [{ label: "Demo 生成偏重", reason: "只能说明使用习惯，不能单独升品。" }],
    },
    upgradePlan: [
      "找至少 2 个其他人或项目复用你的 rules、skill 或 playbook，并记录复用结果。",
      "把复用结果整理成可审计案例。",
    ],
    limitations: [
      "当前为规则初筛，不调用外部 LLM。",
      "token 和成本只解释投入强度，不直接升品。",
    ],
  },
  privacy: { rawLogsUploaded: false },
};

async function renderAt(route, fetchResponse = {}) {
  const dom = new JSDOM(html, {
    url: `https://vibe.yisec.ai/${route}`,
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    beforeParse(window) {
      Object.defineProperty(window, "isSecureContext", {
        value: fetchResponse.clipboard !== "none",
        configurable: true,
      });
      if (fetchResponse.clipboard !== "none") {
        window.navigator.clipboard = { writeText: async (text) => { window.__copied = text; } };
      }
      window.document.execCommand = (command) => {
        if (command !== "copy") return false;
        window.__fallbackCopied = window.document.activeElement?.value || "";
        return true;
      };
    },
  });
  dom.window.fetch = async () => ({
    ok: fetchResponse.ok ?? true,
    status: fetchResponse.status ?? 200,
    json: async () => fetchResponse.body ?? ({
        report: {
          reportId: "abc123",
          reportLinkMode: fetchResponse.linkMode || "local-full-report",
          reportPayloadType: "local-full",
        rank: { level: 6, label: "六品 · 已有大成", score: 76, confidence: "high", systemOwnership: "strong" },
        verdict: "测试报告",
        strongestEvidence: [{ label: "架构判断证据", reason: "关注系统边界。" }],
        dimensionProfile: [{ label: "架构判断", status: "成立", score: 65 }],
        hardStats: {
          evidence_span_days: 4,
          signal_coverage_ratio: 0.5,
          dominant_signal_ratio: 0.25,
          established_dimension_count: 3,
          peak_day_token_share: 0.4,
          validation_density: 0.12,
          strong_record_density: 0.08,
          user_control_ratio: 0.01,
          promotion_user_decision_ratio: 0.2,
          promotion_assistant_execution_ratio: 0.7,
          bug_loop_density: 0.02,
          bug_loop_count: 2,
          tool_event_record_ratio: 0.1,
          tool_event_record_count: 10,
          user_decision_count: 12,
        },
        hardStatCards: [
          {
            id: "sample_stability",
            label: "样本稳定性",
            value: "4 天",
            detail: "峰值日 40%",
            interpretation: "样本越分散，越能证明稳定工作方式。",
          },
          {
            id: "validation_density",
            label: "验证闭环密度",
            value: "12%",
            detail: "12 条验证信号",
            interpretation: "测试、构建、lint、截图和人工验收越稳定，结果越可托付。",
          },
          {
            id: "rework_pressure",
            label: "返工压力",
            value: "2%",
            detail: "2 条 Bug 循环信号",
            interpretation: "返工信号不高，说明协作没有明显困在修补循环。",
          },
          {
            id: "user_decision",
            label: "用户决策占比",
            value: "2%",
            detail: "助手执行 70%",
            interpretation: "高段位必须看到人的系统级决策。",
          },
        ],
        metricGroups: [
          {
            id: "human_control",
            label: "人类控制",
            value: "20%",
            signal: "主动控制 1%，用户决策 20%",
            basis: "助手执行 70%",
            ratingImpact: "决定六品、七品能否成立；高段位必须看到人的系统级决策。",
            risk: "用户决策足以支撑更高段位复核。",
          },
        ],
        statEvidence: {
          id: "caps_confidence",
          label: "硬统计低于当前段位",
          supportLevel: 5,
          supportLabel: "五品统计支撑",
          confidenceImpact: "降低置信度并可能封顶",
          conclusion: "数字侧最多稳定支撑到五品，当前段位需要依赖行为证据和 AI 深度复核。",
          positiveSignals: ["验证密度 12%，结果有可托付证据。"],
          riskSignals: ["主动控制 1%，高阶信号容易被助手自述稀释。", "助手执行 70%，需要确认高阶结论不是 AI 自述完成。"],
          investmentSignals: ["总 token 200万"],
          ratingUse: "硬统计用于支撑置信度、解释封顶和定位下一步；token 和成本只说明投入强度，不能直接升品。",
        },
        statProfile: {
          id: "ai_labor_dependent",
          label: "AI 代工依赖型",
          summary: "token 投入很高，但用户决策占比偏低；这说明 AI 很忙，不等于人真正拥有系统。",
          controlReading: "用户决策占比偏低，高阶结论容易被助手执行痕迹稀释。",
          validationReading: "验证密度较好，系统结果有可托付证据。",
          investmentReading: "token 投入能说明 AI 使用强度，但不会直接抬高段位。",
          evidenceReading: "强记录存在，但覆盖还不够厚，需要更多不同任务证据。",
          riskLevel: "high",
          ratingUse: "统计画像用于解释置信度、封顶和下一步，不直接升品。",
          reasons: ["用户决策 2%，人在控证据偏弱。", "验证密度 12%，结果有可托付证据。"],
          matchedRules: [
            { metric: "用户决策", observed: "2%", threshold: "<5%", interpretation: "人在控证据偏弱。" },
            { metric: "验证密度", observed: "12%", threshold: ">=8%", interpretation: "结果有可托付证据。" },
          ],
          signals: ["用户决策 2%", "主动控制 1%", "助手执行 70%", "验证密度 12%"],
        },
        rankGates: [
          {
            id: "level7_user_decision_ratio",
            level: 7,
            label: "七品用户决策占比",
            passed: false,
            observed: 0.02,
            required: 0.08,
            reason: "七品需要足够用户决策证据，证明人真正做边界、架构、验收或取舍。",
          },
        ],
        qualityFlags: [
          {
            id: "low_user_control",
            severity: "risk",
            label: "主动控制偏低",
            metric: "1%",
            message: "高阶信号主要不是由用户主动定义目标、边界、架构或验收触发。",
          },
        ],
        dragFactors: [
          {
            id: "bug_loop_heavy",
            label: "Bug 循环偏重",
            metric: "12%",
            impact: "反复让 AI 修同一类问题，说明迭代控制可能停在局部 patch。",
            advice: "失败两轮后先做根因分析。",
          },
        ],
        privacy: { rawLogsUploaded: false },
      },
    }),
  });
  dom.window.eval(app);
  await new Promise((resolveReady) => setTimeout(resolveReady, 0));
  return dom;
}

const shortDom = await renderAt("report/abc123");
assert.equal(shortDom.window.document.body.classList.contains("report-mode"), true);
assert.equal(shortDom.window.document.querySelector("#advanced-analysis").hidden, true);
assert.equal(shortDom.window.document.querySelector("#report-title").textContent, "AI 段位分析报告");
assert.equal(shortDom.window.document.querySelector("#report-id").textContent, "abc123");
assert.equal(shortDom.window.document.querySelector("#report-source").textContent, "local-full");
assert.equal(shortDom.window.document.querySelector("#report-privacy").textContent, "本地完整报告");
assert.equal(shortDom.window.document.querySelector("#qr-report-link").hidden, false);
assert.equal(shortDom.window.document.querySelector("#qr-report-link").getAttribute("href"), "https://vibe.yisec.ai/api/reports/abc123/qr.svg");
assert.equal(
  shortDom.window.document.querySelector("#share-note").textContent,
  "当前是本地完整报告；只从本机服务读取，未上传公网。",
);

const duplicateEvidenceText = "我已经定位到关键模块，下一步会逐段读心跳认证、节点在线判定、订阅刷新与重连。";
const duplicateDom = await renderAt("share/dupe01", {
  body: {
    report: {
      reportId: "dupe01",
      reportLinkMode: "public-share-link",
      reportPayloadType: "public-summary",
      rank: { level: 6, label: "六品 · 已有大成", score: 76, confidence: "high", systemOwnership: "strong" },
      verdict: "重复证据测试",
      strongestEvidence: [
        { label: "架构判断证据", reason: "关注模块边界。", summary: duplicateEvidenceText },
        { label: "系统归属证据", reason: "关注关键路径。", summary: duplicateEvidenceText },
        { label: "工作流沉淀证据", reason: "沉淀 workflow。", summary: "把成功流程沉淀成 checklist。" },
      ],
      privacy: { rawLogsUploaded: false, localPathsRemoved: true, compactPublicReport: true },
    },
  },
});
const duplicateEvidenceCards = [...duplicateDom.window.document.querySelectorAll("#evidence-grid .evidence-card")];
assert.equal(duplicateEvidenceCards.length, 2);
assert.equal(
  duplicateEvidenceCards.filter((card) => card.textContent.includes(duplicateEvidenceText)).length,
  1,
);
assert.equal(duplicateDom.window.document.querySelector("#evidence-grid").textContent.includes("实现这个用户故事"), false);

const unsafeDom = await renderAt("report/unsafe", {
  body: {
    report: {
      reportId: "unsafe",
      reportLinkMode: "local-full-report",
      reportPayloadType: "local-full",
      analysisMode: "advanced",
      rank: { level: 6, label: "六品 · 已有大成", score: 76, confidence: "high", systemOwnership: "strong" },
      verdict: "包含转义测试",
      strongestEvidence: [
        { label: "<img src=x onerror=alert(1)>", reason: "<script>alert(2)</script>", summary: "<b>bold</b>" },
      ],
      dimensionProfile: [{ label: "<img src=x onerror=alert(3)>", status: "<b>成立</b>", score: 65 }],
      hardStatCards: [{ label: "<img src=x onerror=alert(4)>", value: "<b>4 天</b>", detail: "<i>detail</i>", interpretation: "<script>alert(5)</script>" }],
      metricGroups: [{ label: "<img src=x onerror=alert(6)>", value: "<b>20%</b>", signal: "<i>signal</i>", ratingImpact: "<em>impact</em>", risk: "<p>risk</p>" }],
      advancedAnalysis: {
        decisionTrace: { finalRank: { level: 6, label: "六品 · 已有大成" } },
        gateAudit: {
          passed: [{ id: "unsafe_gate", label: "<img src=x onerror=alert(7)>", summary: "<b>summary</b>" }],
          failed: [],
          keyGate: { id: "unsafe_gate", label: "<img src=x onerror=alert(8)>", summary: "<b>summary</b>" },
        },
        dimensionRubric: [{ id: "unsafe_dimension", label: "<img src=x onerror=alert(9)>", status: "<b>成立</b>", score: 65, nextGap: "<i>gap</i>" }],
        evidenceAudit: {
          accepted: [{ label: "<img src=x onerror=alert(10)>", reason: "<b>reason</b>", dimension: "<i>dimension</i>" }],
          downranked: [],
        },
        upgradePlan: ["<b>plan</b>"],
        limitations: ["<script>alert(11)</script>"],
      },
      privacy: { rawLogsUploaded: false },
    },
  },
});
assert.match(unsafeDom.window.document.querySelector("#evidence-grid").textContent, /<b>bold<\/b>/);
assert.equal(unsafeDom.window.document.querySelector("#evidence-grid img"), null);
assert.equal(unsafeDom.window.document.querySelector("#evidence-grid script"), null);
assert.match(unsafeDom.window.document.querySelector("#dimension-grid").textContent, /<b>成立<\/b>/);
assert.equal(unsafeDom.window.document.querySelector("#dimension-grid img"), null);
assert.match(unsafeDom.window.document.querySelector("#hard-stat-grid").textContent, /<b>4 天<\/b>/);
assert.equal(unsafeDom.window.document.querySelector("#hard-stat-grid script"), null);
assert.match(unsafeDom.window.document.querySelector("#metric-group-grid").textContent, /<em>impact<\/em>/);
assert.equal(unsafeDom.window.document.querySelector("#metric-group-grid img"), null);
assert.match(unsafeDom.window.document.querySelector("#advanced-gates").textContent, /<b>summary<\/b>/);
assert.equal(unsafeDom.window.document.querySelector("#advanced-gates img"), null);
assert.equal(
  shortDom.window.document.querySelector("#evidence-structure").textContent,
  "证据跨度 4 天；信号覆盖度 50%；最高信号集中度 25%；成立维度 3/6；峰值日 token 占比 40%；验证密度 12%；强记录占比 8%。",
);
assert.equal(
  shortDom.window.document.querySelector("#stats-insight").textContent,
  "主动控制占比偏低，高阶信号主要来自 AI 执行或总结，自动初筛会压低高段位。",
);
assert.equal(
  shortDom.window.document.querySelector("#stat-evidence").textContent,
  "硬统计低于当前段位：数字侧最多稳定支撑到五品，当前段位需要依赖行为证据和 AI 深度复核。",
);
assert.equal(
  shortDom.window.document.querySelector("#stat-evidence-detail").textContent,
  "五品统计支撑；降低置信度并可能封顶。正向：验证密度 12%，结果有可托付证据。。风险：主动控制 1%，高阶信号容易被助手自述稀释。；助手执行 70%，需要确认高阶结论不是 AI 自述完成。。硬统计用于支撑置信度、解释封顶和定位下一步；token 和成本只说明投入强度，不能直接升品。",
);
assert.equal(
  shortDom.window.document.querySelector("#stat-profile").textContent,
  "AI 代工依赖型：token 投入很高，但用户决策占比偏低；这说明 AI 很忙，不等于人真正拥有系统。",
);
assert.equal(
  shortDom.window.document.querySelector("#stat-profile-detail").textContent,
  "统计画像用于解释置信度、封顶和下一步，不直接升品。关键数字：用户决策 2%；主动控制 1%；助手执行 70%；验证密度 12%。画像依据：用户决策 2%，人在控证据偏弱。；验证密度 12%，结果有可托付证据。。",
);
assert.equal(
  shortDom.window.document.querySelector("#behavior-mix").textContent,
  "用户决策 20%；助手执行 70%；决策证据 12 条；返工压力 2%。",
);
assert.equal(
  shortDom.window.document.querySelector("#rank-gate-summary").textContent,
  "七品用户决策占比未通过：七品需要足够用户决策证据，证明人真正做边界、架构、验收或取舍。",
);
assert.equal(
  shortDom.window.document.querySelector("#upgrade-path").textContent,
  "沉淀 3 次以上用户主导的边界、架构、验收或取舍决策，把“为什么这样设计”留在记录里。",
);
assert.equal(
  shortDom.window.document.querySelector("#next-action-title").textContent,
  "先补齐七品用户决策占比",
);
assert.equal(
  shortDom.window.document.querySelector("#next-action-body").textContent,
  "沉淀 3 次以上用户主导的边界、架构、验收或取舍决策，把“为什么这样设计”留在记录里。",
);
assert.equal(
  shortDom.window.document.querySelector("#next-action-gate").textContent,
  "七品用户决策占比未通过：七品需要足够用户决策证据，证明人真正做边界、架构、验收或取舍。",
);
assert.equal(shortDom.window.document.querySelector("#hard-stat-grid .hard-stat-card strong").textContent, "4 天");
assert.equal(shortDom.window.document.querySelector("#metric-group-grid .metric-group-card span").textContent, "人类控制");
assert.equal(shortDom.window.document.querySelector("#metric-group-grid .metric-group-card strong").textContent, "20%");
shortDom.window.document.querySelector('[data-target="report-stats"]').click();
assert.equal(shortDom.window.document.querySelector('[data-target="report-stats"]').classList.contains("active"), true);
assert.equal(shortDom.window.document.querySelector('[data-target="report-overview"]').classList.contains("active"), false);
shortDom.window.document.querySelector("#copy-share-prompt").click();
await new Promise((resolveReady) => setTimeout(resolveReady, 0));
assert.match(shortDom.window.__copied, /用户决策占比 2%/);
assert.match(shortDom.window.__copied, /验证闭环密度 12%/);
assert.match(shortDom.window.__copied, /返工压力 2%/);
assert.match(shortDom.window.__copied, /统计仪表盘/);
assert.match(shortDom.window.__copied, /硬统计证据结论/);
assert.match(shortDom.window.__copied, /五品统计支撑/);
assert.match(shortDom.window.__copied, /统计画像/);
assert.match(shortDom.window.__copied, /AI 代工依赖型/);
assert.match(shortDom.window.__copied, /画像依据/);
shortDom.window.document.querySelector("#copy-judge-prompt").click();
await new Promise((resolveReady) => setTimeout(resolveReady, 0));
assert.match(shortDom.window.__copied, /AI 深度判定官/);
assert.match(shortDom.window.__copied, /最终段位/);
assert.match(shortDom.window.__copied, /维持、上调或下调/);
assert.match(shortDom.window.__copied, /七品用户决策占比/);
assert.match(shortDom.window.__copied, /统计仪表盘/);
assert.match(shortDom.window.__copied, /硬统计证据结论/);
assert.match(shortDom.window.__copied, /风险统计/);
assert.match(shortDom.window.__copied, /统计画像/);
assert.match(shortDom.window.__copied, /AI 代工依赖型/);
assert.match(shortDom.window.__copied, /画像依据/);
const compactGatePrompt = shortDom.window.buildJudgePrompt({
  rank: { level: 6, label: "六品 · 已有大成", score: 76, confidence: "high" },
  verdict: "测试报告",
  privacy: { rawLogsUploaded: false },
  rankGates: [
    {
      id: "level8_team_replication",
      level: 8,
      label: "八品团队复制",
      passed: false,
      reason: "八品需要其他人或项目复用你的方法，而不是只有个人熟练使用。",
    },
  ],
});
assert.doesNotMatch(compactGatePrompt, /undefined/);
assert.equal(
  shortDom.window.document.querySelector("#quality-flags").textContent,
  "主动控制偏低 1%：高阶信号主要不是由用户主动定义目标、边界、架构或验收触发。",
);
assert.equal(
  shortDom.window.document.querySelector("#drag-factors").textContent,
  "Bug 循环偏重 12%：反复让 AI 修同一类问题，说明迭代控制可能停在局部 patch。",
);
shortDom.window.document.querySelector("#copy-report-link").click();
await new Promise((resolveReady) => setTimeout(resolveReady, 0));
assert.equal(shortDom.window.__copied, "https://vibe.yisec.ai/report/abc123");

const shareDom = await renderAt("share/abc123", {
  body: {
    report: {
      reportId: "abc123",
      reportLinkMode: "public-share-link",
      reportPayloadType: "public-summary",
      rank: { level: 6, label: "六品 · 已有大成", score: 76, confidence: "high", systemOwnership: "strong" },
      verdict: "公开分享报告",
      privacy: { rawLogsUploaded: false, localPathsRemoved: true, compactPublicReport: true },
    },
  },
});
assert.equal(shareDom.window.document.querySelector("#report-source").textContent, "脱敏摘要");
assert.equal(shareDom.window.document.querySelector("#report-privacy").textContent, "脱敏公开分享");
assert.equal(
  shareDom.window.document.querySelector("#share-note").textContent,
  "当前是官网公开分享报告；官网存储的是脱敏摘要，原始日志未上传。",
);
shareDom.window.document.querySelector("#copy-command").click();
await new Promise((resolveReady) => setTimeout(resolveReady, 0));
assert.equal(shareDom.window.__copied, "npx github:relaxcloud-cn/vibe-coding-rank --open");

const fallbackCopyDom = await renderAt("", { clipboard: "none" });
fallbackCopyDom.window.document.querySelector("#copy-command").click();
await new Promise((resolveReady) => setTimeout(resolveReady, 0));
assert.equal(fallbackCopyDom.window.__fallbackCopied, "npx github:relaxcloud-cn/vibe-coding-rank --open");
assert.match(fallbackCopyDom.window.document.querySelector("#copy-command").textContent, /已复制到剪贴板/);

const advancedDom = await renderAt("share/advanced123", { body: { report: advancedReport } });
assert.equal(advancedDom.window.document.querySelector("#report-title").textContent, "高级分析报告");
assert.equal(advancedDom.window.document.querySelector("#advanced-badge").textContent, "规则审计已完成");
assert.equal(advancedDom.window.document.querySelector("#advanced-analysis").hidden, false);
assert.equal(
  advancedDom.window.document.querySelector("#advanced-decision").textContent,
  "初始支持七品 · 已臻化境；封顶原因：自动初筛最高只确认到七品；八品需要单独复核团队复制证据。；最终六品 · 已有大成；置信度影响：助手执行占比较高，局部降低置信度。",
);
assert.equal(
  advancedDom.window.document.querySelector("#advanced-key-gate").textContent,
  "八品团队复制：团队复用强证据不足。",
);
assert.equal(
  advancedDom.window.document.querySelector("#advanced-gates").children.length,
  2,
);
assert.equal(
  advancedDom.window.document.querySelector("#advanced-dimensions").children.length,
  2,
);
assert.match(
  advancedDom.window.document.querySelector("#advanced-evidence").textContent,
  /采纳：架构判断证据：用户主动定义模块边界。/,
);
assert.match(
  advancedDom.window.document.querySelector("#advanced-evidence").textContent,
  /降权：Demo 生成偏重：只能说明使用习惯，不能单独升品。/,
);
assert.match(
  advancedDom.window.document.querySelector("#advanced-upgrade-plan").textContent,
  /找至少 2 个其他人或项目复用/,
);
assert.match(
  advancedDom.window.document.querySelector("#advanced-limitations").textContent,
  /不调用外部 LLM/,
);

const missingDom = await renderAt("report/missing", { ok: false, status: 404, body: { error: "Report not found" } });
assert.equal(missingDom.window.document.querySelector("#rank-label").textContent, "报告无法打开");
assert.equal(missingDom.window.document.querySelector("#verdict").textContent, "报告不存在或已经过期。");
assert.ok(missingDom.window.document.querySelector(".dashboard").classList.contains("error-state"));

const unknownDom = await renderAt("?data=not-valid-json");
assert.equal(unknownDom.window.document.body.classList.contains("report-mode"), false);
assert.equal(unknownDom.window.document.querySelector("#report-id").textContent, "sample");
assert.equal(unknownDom.window.document.querySelector("#share-note").textContent, "当前是样例报告。运行 CLI 后可生成你的个人链接。");

console.log("site tests OK");
