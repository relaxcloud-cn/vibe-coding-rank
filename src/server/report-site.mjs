#!/usr/bin/env node

import { createReadStream, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { qrSvg } from "../lib/qr.mjs";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SITE_DIR = join(ROOT, "apps", "report-site");
const DEFAULT_REPORT_DIR = ".airank/reports";
const VALID_ID = /^[a-zA-Z0-9_-]{6,64}$/;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon",
};

function parseArgs(argv) {
  const options = {
    host: "0.0.0.0",
    port: 4173,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--host") {
      options.host = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--port") {
      options.port = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (!options.host) throw new Error("--host is required.");
  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) {
    throw new Error("--port must be an integer from 0 to 65535.");
  }
  return options;
}

function help() {
  return `
Usage:
  node src/server/report-site.mjs --host 0.0.0.0 --port 4173

Environment:
  VIBE_RANK_REPORT_DIR   Directory containing local report JSON files. Default: .airank/reports
`.trim();
}

function reportDir() {
  return resolve(process.env.VIBE_RANK_REPORT_DIR || DEFAULT_REPORT_DIR);
}

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  });
  res.end(body);
}

function text(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  });
  res.end(body);
}

async function loadReport(id) {
  if (!VALID_ID.test(id)) return null;
  const file = join(reportDir(), `${id}.json`);
  const content = await readFile(file, "utf-8").catch((error) => {
    if (error.code === "ENOENT") return "";
    throw error;
  });
  if (!content) return null;
  return JSON.parse(content);
}

function localReportLink(req, id) {
  const host = req.headers.host || "localhost:4173";
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${host}/report/${id}`;
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    res.end();
    return true;
  }

  const reportMatch = url.pathname.match(/^\/api\/reports\/([a-zA-Z0-9_-]{6,64})$/);
  if (reportMatch && req.method === "GET") {
    const stored = await loadReport(reportMatch[1]);
    if (!stored) {
      json(res, 404, { error: "Report not found." });
      return true;
    }
    json(res, 200, stored);
    return true;
  }

  const qrMatch = url.pathname.match(/^\/api\/reports\/([a-zA-Z0-9_-]{6,64})\/qr\.svg$/);
  if (qrMatch && req.method === "GET") {
    const stored = await loadReport(qrMatch[1]);
    if (!stored) {
      json(res, 404, { error: "Report not found." });
      return true;
    }
    text(res, 200, qrSvg(localReportLink(req, qrMatch[1])), "image/svg+xml; charset=utf-8");
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    json(res, 404, { error: "Not found." });
    return true;
  }

  return false;
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const normalized = normalize(relative);
  if (normalized.startsWith("..") || normalized.includes(`..${sep}`)) return "";
  return join(SITE_DIR, normalized);
}

function serveStatic(_req, res, url) {
  let target = safeStaticPath(url.pathname);
  if (!target) {
    json(res, 403, { error: "Forbidden." });
    return;
  }
  if (!existsSync(target) || target.endsWith(sep)) {
    target = join(SITE_DIR, "index.html");
  }
  const type = TYPES[extname(target).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
  createReadStream(target).pipe(res);
}

async function handle(req, res) {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (await handleApi(req, res, url)) return;
    if (req.method !== "GET" && req.method !== "HEAD") {
      json(res, 405, { error: "Method not allowed." });
      return;
    }
    serveStatic(req, res, url);
  } catch (error) {
    json(res, 500, { error: error.message || "Internal server error." });
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(help());
    return;
  }
  const server = createServer(handle);
  server.listen(options.port, options.host, () => {
    const address = server.address();
    const host = options.host === "0.0.0.0" ? "127.0.0.1" : options.host;
    console.log(`Vibe report site listening at http://${host}:${address.port}`);
    console.log(`Report directory: ${reportDir()}`);
  });
}

main().catch((error) => {
  console.error(`vibe-report-site: ${error.message}`);
  process.exit(1);
});
