import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;

async function waitForServer(baseUrl) {
  const deadline = Date.now() + 5000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw lastError || new Error("Server did not start.");
}

async function withServer(reportDir, callback) {
  const child = spawn(
    "node",
    ["src/server/report-site.mjs", "--host", "127.0.0.1", "--port", "0"],
    {
      cwd: ROOT,
      env: { ...process.env, VIBE_RANK_REPORT_DIR: reportDir },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
  let exited = false;
  try {
    const baseUrl = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Server did not print URL. stderr=${stderr}`)), 5000);
      child.stdout.on("data", () => {
        const match = stdout.match(/http:\/\/127\.0\.0\.1:(\d+)/);
        if (match) {
          clearTimeout(timeout);
          resolve(`http://127.0.0.1:${match[1]}`);
        }
      });
      child.on("exit", (code) => {
        exited = true;
        clearTimeout(timeout);
        reject(new Error(`Server exited with ${code}. stderr=${stderr}`));
      });
    });
    await waitForServer(baseUrl);
    await callback(baseUrl);
  } finally {
    if (!exited) {
      child.kill("SIGTERM");
      await new Promise((resolve) => child.once("exit", resolve));
    }
  }
}

const reportDir = join(tmpdir(), `vibe-rank-local-server-${Date.now()}`);
mkdirSync(reportDir, { recursive: true });
writeFileSync(
  join(reportDir, "abc123def4567890.json"),
  JSON.stringify({
    id: "abc123def4567890",
    report: {
      reportId: "abc123def4567890",
      reportLinkMode: "local-full-report",
      reportPayloadType: "local-full",
      rank: { label: "六品 · 已有大成" },
      evidence: [{ snippet: "local full report evidence" }],
    },
    createdAt: "2026-05-08T00:00:00.000Z",
  }),
  "utf-8",
);

await withServer(reportDir, async (baseUrl) => {
  let response = await fetch(`${baseUrl}/api/reports/abc123def4567890`);
  assert.equal(response.status, 200);
  let payload = await response.json();
  assert.equal(payload.id, "abc123def4567890");
  assert.equal(payload.report.reportPayloadType, "local-full");
  assert.equal(payload.report.evidence[0].snippet, "local full report evidence");

  response = await fetch(`${baseUrl}/api/reports/missing123`);
  assert.equal(response.status, 404);
  payload = await response.json();
  assert.equal(payload.error, "Report not found.");

  response = await fetch(`${baseUrl}/api/reports/abc123def4567890/qr.svg`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/svg+xml; charset=utf-8");
  const svg = await response.text();
  assert.match(svg, /^<svg /);
  assert.match(svg, /abc123def4567890/);
  assert.match(svg, /\/report\/abc123def4567890/);

  response = await fetch(`${baseUrl}/report/abc123def4567890`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Vibe Coding/);

  response = await fetch(`${baseUrl}/share/abc123def4567890`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Vibe Coding/);

  response = await fetch(`${baseUrl}/app.js`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /text\/javascript/);

  response = await fetch(`${baseUrl}/report/abc123def4567890`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /src="\/app\.js"/);
});

console.log("local server tests OK");
