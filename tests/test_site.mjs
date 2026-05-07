import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TextDecoder, TextEncoder } from "node:util";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(resolve(ROOT, "apps/report-site/index.html"), "utf-8");
const app = readFileSync(resolve(ROOT, "apps/report-site/app.js"), "utf-8");
const localPayload = Buffer.from(JSON.stringify({
  rank: { level: 6, label: "六品 · 已有大成", score: 76, confidence: "high", systemOwnership: "strong" },
  verdict: "本地报告",
}), "utf-8").toString("base64url");

async function renderAt(hash, fetchResponse = {}) {
  const dom = new JSDOM(html, {
    url: `https://vibe.yisec.ai/${hash}`,
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    beforeParse(window) {
      window.TextDecoder = TextDecoder;
      window.TextEncoder = TextEncoder;
      window.navigator.clipboard = { writeText: async (text) => { window.__copied = text; } };
    },
  });
  dom.window.fetch = async () => ({
    ok: fetchResponse.ok ?? true,
    status: fetchResponse.status ?? 200,
    json: async () => fetchResponse.body ?? ({
      report: {
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
          user_control_ratio: 0.01,
          promotion_user_decision_ratio: 0.2,
          promotion_assistant_execution_ratio: 0.7,
          user_decision_count: 12,
        },
        hardStatCards: [
          {
            label: "用户决策占比",
            value: "2%",
            detail: "助手执行 70%",
            interpretation: "高段位必须看到人的系统级决策。",
          },
        ],
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
        privacy: { rawLogsUploaded: false },
      },
    }),
  });
  dom.window.eval(app);
  await new Promise((resolveReady) => setTimeout(resolveReady, 0));
  return dom;
}

const shortDom = await renderAt("#id=abc123");
assert.equal(
  shortDom.window.document.querySelector("#share-note").textContent,
  "当前是短链接，报告 JSON 已脱敏后存储，原始日志不会上传。",
);
assert.equal(
  shortDom.window.document.querySelector("#evidence-structure").textContent,
  "证据跨度 4 天；信号覆盖度 50%；最高信号集中度 25%；成立维度 3/6；峰值日 token 占比 40%。",
);
assert.equal(
  shortDom.window.document.querySelector("#stats-insight").textContent,
  "主动控制占比偏低，高阶信号主要来自 AI 执行或总结，自动初筛会压低高段位。",
);
assert.equal(
  shortDom.window.document.querySelector("#behavior-mix").textContent,
  "用户决策 20%；助手执行 70%；决策证据 12 条。",
);
assert.equal(
  shortDom.window.document.querySelector("#rank-gate-summary").textContent,
  "七品用户决策占比未通过：七品需要足够用户决策证据，证明人真正做边界、架构、验收或取舍。",
);
assert.equal(
  shortDom.window.document.querySelector("#upgrade-path").textContent,
  "沉淀 3 次以上用户主导的边界、架构、验收或取舍决策，把“为什么这样设计”留在记录里。",
);
assert.equal(shortDom.window.document.querySelector("#hard-stat-grid .hard-stat-card strong").textContent, "2%");
assert.equal(
  shortDom.window.document.querySelector("#quality-flags").textContent,
  "主动控制偏低 1%：高阶信号主要不是由用户主动定义目标、边界、架构或验收触发。",
);
shortDom.window.document.querySelector("#copy-report-link").click();
await new Promise((resolveReady) => setTimeout(resolveReady, 0));
assert.equal(shortDom.window.__copied, "https://vibe.yisec.ai/#id=abc123");

const localDom = await renderAt(`#data=${localPayload}`);
assert.equal(
  localDom.window.document.querySelector("#share-note").textContent,
  "当前是本地浏览器链接，报告数据只在 URL hash 中渲染。",
);

const missingDom = await renderAt("#id=missing", { ok: false, status: 404, body: { error: "Report not found" } });
assert.equal(missingDom.window.document.querySelector("#rank-label").textContent, "报告无法打开");
assert.equal(missingDom.window.document.querySelector("#verdict").textContent, "报告不存在或已经过期。");
assert.ok(missingDom.window.document.querySelector(".dashboard").classList.contains("error-state"));

const brokenDom = await renderAt("#data=not-valid-json");
assert.equal(brokenDom.window.document.querySelector("#rank-label").textContent, "报告无法打开");
assert.equal(brokenDom.window.document.querySelector("#verdict").textContent, "报告链接损坏，无法解析本地数据。");

console.log("site tests OK");
