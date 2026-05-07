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
