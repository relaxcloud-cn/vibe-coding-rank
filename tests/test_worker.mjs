import assert from "node:assert/strict";
import worker from "../src/worker/index.js";

function makeKv() {
  const store = new Map();
  const writes = [];
  return {
    writes,
    async put(key, value, options) {
      writes.push({ key, value, options });
      store.set(key, value);
    },
    async get(key) {
      return store.get(key) || null;
    },
  };
}

async function request(path, init = {}, env = {}) {
  return worker.fetch(new Request(`https://vibe.yisec.ai${path}`, init), env);
}

async function json(response) {
  return response.json();
}

let response = await request("/api/reports", { method: "OPTIONS" });
assert.equal(response.status, 200);
assert.equal(response.headers.get("access-control-allow-origin"), "*");
assert.equal(response.headers.get("access-control-allow-methods"), "GET,POST,OPTIONS");

response = await request("/api/reports", { method: "POST", body: "{}" });
assert.equal(response.status, 501);
assert.deepEqual(await json(response), { error: "REPORTS KV binding is not configured." });

response = await request("/api/reports/missing", { method: "GET" }, { REPORTS: makeKv() });
assert.equal(response.status, 404);
assert.deepEqual(await json(response), { error: "Report not found." });

response = await request("/api/reports", { method: "POST", body: "not-json" }, { REPORTS: makeKv() });
assert.equal(response.status, 400);
assert.deepEqual(await json(response), { error: "Invalid JSON payload." });

response = await request("/api/reports", { method: "POST", body: "x".repeat(120_001) }, { REPORTS: makeKv() });
assert.equal(response.status, 413);
assert.deepEqual(await json(response), { error: "Report payload is too large." });

response = await request(
  "/api/reports",
  {
    method: "POST",
    body: JSON.stringify({
      rank: { label: "六品 · 已有大成" },
      root: "/Users/sky/.codex/sessions",
      privacy: { rawLogsUploaded: false, localPathsRemoved: true, compactPublicReport: true },
    }),
  },
  { REPORTS: makeKv() },
);
assert.equal(response.status, 422);
assert.deepEqual(await json(response), { error: "Report payload must be the compact sanitized public report, not the local full report." });

response = await request(
  "/api/reports",
  {
    method: "POST",
    body: JSON.stringify({
      rank: { label: "六品 · 已有大成" },
      roots: [{ source: "codex", path: "/Users/sky/.codex/sessions" }],
      privacy: { rawLogsUploaded: false, localPathsRemoved: true, compactPublicReport: true },
    }),
  },
  { REPORTS: makeKv() },
);
assert.equal(response.status, 422);
assert.deepEqual(await json(response), { error: "Report payload must be the compact sanitized public report, not the local full report." });

response = await request(
  "/api/reports",
  {
    method: "POST",
    body: JSON.stringify({
      rank: { label: "六品 · 已有大成" },
      privacy: { rawLogsUploaded: true, localPathsRemoved: true, compactPublicReport: true },
    }),
  },
  { REPORTS: makeKv() },
);
assert.equal(response.status, 422);
assert.deepEqual(await json(response), { error: "Report privacy flags must indicate a compact sanitized public report." });

response = await request(
  "/api/reports",
  {
    method: "POST",
    body: JSON.stringify({
      rank: { label: "六品 · 已有大成" },
      evidence: [],
      strongestEvidence: [{ label: "架构判断", snippet: "raw local transcript" }],
      privacy: { rawLogsUploaded: false, localPathsRemoved: true, compactPublicReport: true },
    }),
  },
  { REPORTS: makeKv() },
);
assert.equal(response.status, 422);
assert.deepEqual(await json(response), { error: "Public report evidence must not include snippets, local sources, or roles." });

const kv = makeKv();
const report = {
  rank: { label: "六品 · 已有大成" },
  evidence: [],
  strongestEvidence: [{ label: "架构判断", reason: "关注系统边界。" }],
  privacy: { rawLogsUploaded: false, localPathsRemoved: true, compactPublicReport: true },
};
response = await request(
  "/api/reports",
  { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(report) },
  { REPORTS: kv },
);
assert.equal(response.status, 200);
const created = await json(response);
assert.match(created.id, /^[a-f0-9]{16}$/);
assert.equal(created.url, `https://vibe.yisec.ai/share/${created.id}`);
assert.equal(kv.writes.length, 1);
assert.equal(kv.writes[0].options.expirationTtl, 60 * 60 * 24 * 30);

response = await request(`/api/reports/${created.id}`, { method: "GET" }, { REPORTS: kv });
assert.equal(response.status, 200);
const stored = await json(response);
assert.equal(stored.id, created.id);
assert.equal(stored.report.rank.label, "六品 · 已有大成");
assert.equal(stored.report.privacy.rawLogsUploaded, false);
assert.ok(stored.createdAt);

response = await request(`/api/reports/${created.id}/qr.svg`, { method: "GET" }, { REPORTS: kv });
assert.equal(response.status, 200);
assert.equal(response.headers.get("content-type"), "image/svg+xml; charset=utf-8");
const qrSvg = await response.text();
assert.match(qrSvg, /^<svg /);
assert.match(qrSvg, new RegExp(`/share/${created.id}`));

response = await request("/unknown", { method: "GET" }, {});
assert.equal(response.status, 404);
assert.deepEqual(await json(response), { error: "Not found." });

console.log("worker tests OK");
