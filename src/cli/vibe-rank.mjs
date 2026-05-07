#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, platform, tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const RANKS = [
  "零品 · 门外汉",
  "一品 · 初识真气",
  "二品 · 初窥门径",
  "三品 · 小有所成",
  "四品 · 登堂入室",
  "五品 · 炉火纯青",
  "六品 · 已有大成",
  "七品 · 已臻化境",
  "八品 · 半步宗师",
  "九品 · 大宗师",
];

const UPGRADE_PATHS = {
  0: ["先用 Codex 或 Claude Code 完成一个真实开发任务。"],
  1: ["从片段生成升级到完整任务：写清目标、非目标和验收标准。"],
  2: ["停止只追求 demo 能跑，补上测试、构建和关键路径解释。"],
  3: ["遇到反复修 bug 时先做根因分析，必要时重设边界或重构。"],
  4: ["把架构约束、验收 gate 和风险边界写进可复用规则。"],
  5: ["把一次成功交付沉淀成 workflow，让 AI 在检查点内自主推进。"],
  6: ["减少亲自审每一行代码，把审核逻辑系统化到测试、规则和 review gate。"],
  7: ["把个人方法复制给团队：playbook、skills、培训、评测和团队报告。"],
  8: ["形成公开范式影响：框架、文章、产品、社区案例或行业标准。"],
  9: ["持续定义新范式，并让行业围绕你的方法重新组织协作。"],
};

function parseArgs(argv) {
  const options = {
    source: "codex",
    root: "",
    since: "",
    site: "https://vibe.yisec.ai",
    uploadUrl: "",
    out: ".airank/vibe-report.json",
    limit: "5000",
    maxChars: "1200",
    open: false,
    demo: false,
    printJson: false,
    write: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "run") continue;
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--demo") {
      options.demo = true;
    } else if (arg === "--open") {
      options.open = true;
    } else if (arg === "--print-json") {
      options.printJson = true;
    } else if (arg === "--no-write") {
      options.write = false;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      options[key] = value;
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function help() {
  return `
Vibe Coding Rank

Usage:
  npx github:relaxcloud-cn/vibe-coding-rank --source codex
  npx github:relaxcloud-cn/vibe-coding-rank --source claude --open
  vibe-rank --demo

Options:
  --source codex|claude|generic   Session source. Default: codex
  --root <path>                   Session directory or file
  --since YYYY-MM-DD              Only scan recently modified records
  --site <url>                    Report site. Default: https://vibe.yisec.ai
  --upload-url <url>              Optional Worker API base URL for short cloud links
  --out <path>                    Local report JSON. Default: .airank/vibe-report.json
  --open                          Open the cloud report URL
  --demo                          Generate a demo report without reading local logs
  --print-json                    Print machine-readable report JSON
  --no-write                      Do not write a local report file
`.trim();
}

function expandHome(path) {
  if (!path) return path;
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return path;
}

function defaultRoot(source) {
  if (source === "claude") return "~/.claude/projects";
  if (source === "codex") return "~/.codex/sessions";
  return ".";
}

function runPython(script, args) {
  const scriptPath = join(ROOT, "skill", "scripts", script);
  const interpreters = ["python3", "python"];
  let last;
  for (const python of interpreters) {
    const result = spawnSync(python, [scriptPath, ...args], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (result.status === 0) return result;
    if (result.error && result.error.code === "ENOENT") {
      last = result;
      continue;
    }
    throw new Error(result.stderr || result.stdout || `${script} failed`);
  }
  throw new Error(last?.error?.message || "Python is required but was not found.");
}

function sampleSummary() {
  return {
    analysis_version: "0.1-demo",
    record_count: 128,
    analyzed_record_count: 120,
    excluded_record_count: 8,
    excluded_reason_counts: {
      agents_context: 5,
      codex_system_prompt: 3,
    },
    signal_count: 56,
    signal_counts: {
      context_boundary: 11,
      plan_before_edit: 8,
      validation: 13,
      architecture: 9,
      ownership: 5,
      workflow_asset: 6,
      agent_orchestration: 4,
    },
    heuristic_rank: {
      level: 6,
      label: "六品 · 已有大成",
      score: 76,
      confidence: "high",
    },
    evidence: {
      context_boundary: [
        {
          source: "codex:demo/session.jsonl:12",
          role: "user",
          snippet: "实现这个用户故事，验收条件如下；不要改支付模块，先给计划再动代码。",
        },
      ],
      validation: [
        {
          source: "codex:demo/session.jsonl:31",
          role: "assistant",
          snippet: "已运行 build、lint、单元测试和截图 smoke check，并复查 diff。",
        },
      ],
      architecture: [
        {
          source: "codex:demo/session.jsonl:47",
          role: "user",
          snippet: "这个模块继续 patch 没意义，重设数据边界，用新的状态模型替换。",
        },
      ],
    },
    rank_caps: ["缺少团队级 playbook、共享 workflow 或方法复制证据。"],
  };
}

function flattenEvidence(evidence) {
  const rows = [];
  for (const [signal, items] of Object.entries(evidence || {})) {
    for (const item of items || []) {
      rows.push({
        signal,
        source: item.source || "",
        role: item.role || "unknown",
        snippet: item.snippet || "",
      });
    }
  }
  return rows.slice(0, 12);
}

function systemOwnership(level) {
  if (level >= 8) return "exceptional";
  if (level >= 5) return "strong";
  if (level >= 4) return "emerging";
  return "weak";
}

function buildReport(summary, options) {
  const rank = summary.heuristic_rank || {};
  const level = Number(rank.level || 0);
  const nextLevel = Math.min(9, level + 1);
  return {
    product: "Airank Vibe Coding Rank",
    generatedAt: new Date().toISOString(),
    source: options.source,
    root: options.root || defaultRoot(options.source),
    rank: {
      level,
      label: rank.label || RANKS[level] || RANKS[0],
      score: Number(rank.score || Math.max(1, level * 11)),
      confidence: rank.confidence || "low",
      systemOwnership: systemOwnership(level),
    },
    nextRank: {
      level: nextLevel,
      label: RANKS[nextLevel],
    },
    recordCount: summary.record_count || 0,
    analyzedRecordCount: summary.analyzed_record_count ?? summary.record_count ?? 0,
    excludedRecordCount: summary.excluded_record_count || 0,
    excludedReasonCounts: summary.excluded_reason_counts || {},
    signalCount: summary.signal_count || 0,
    signalCounts: summary.signal_counts || {},
    evidence: flattenEvidence(summary.evidence),
    rankCaps: summary.rank_caps || [],
    upgradePath: UPGRADE_PATHS[level] || [],
  };
}

function encodeReport(report) {
  return Buffer.from(JSON.stringify(report), "utf-8").toString("base64url");
}

function siteUrl(site, report) {
  return `${site.replace(/\/$/, "")}/#data=${encodeReport(report)}`;
}

async function uploadReport(uploadUrl, report) {
  const endpoint = `${uploadUrl.replace(/\/$/, "")}/api/reports`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(report),
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function writeReport(path, report) {
  const target = resolve(path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  return target;
}

function openUrl(url) {
  const command = platform() === "darwin" ? "open" : platform() === "win32" ? "cmd" : "xdg-open";
  const args = platform() === "win32" ? ["/c", "start", "", url] : [url];
  spawnSync(command, args, { stdio: "ignore", detached: true });
}

function printHuman(report, url, outPath) {
  console.log("");
  console.log("Vibe Coding Rank");
  console.log(`Rank: ${report.rank.label}`);
  console.log(`Score: ${report.rank.score}`);
  console.log(`Confidence: ${report.rank.confidence}`);
  console.log(`System ownership: ${report.rank.systemOwnership}`);
  if (report.excludedRecordCount) {
    console.log(`Evidence analyzed: ${report.analyzedRecordCount}/${report.recordCount} records`);
    console.log(`Filtered context records: ${report.excludedRecordCount}`);
  }
  console.log(`Cloud report: ${url}`);
  if (outPath) console.log(`Local report: ${outPath}`);
  console.log("");
  console.log("Next:");
  for (const item of report.upgradePath) {
    console.log(`- ${item}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(help());
    return;
  }

  let summary;
  if (options.demo) {
    summary = sampleSummary();
  } else {
    const root = resolve(expandHome(options.root || defaultRoot(options.source)));
    if (!existsSync(root)) {
      throw new Error(`Session root not found: ${root}`);
    }

    const tempRoot = join(tmpdir(), `airank-vibe-${Date.now()}`);
    mkdirSync(tempRoot, { recursive: true });
    const evidencePath = join(tempRoot, "evidence.jsonl");
    const summaryPath = join(tempRoot, "summary.json");

    const collectArgs = [
      "--source",
      options.source,
      "--root",
      root,
      "--output",
      evidencePath,
      "--limit",
      options.limit,
      "--max-chars",
      options.maxChars,
    ];
    if (options.since) {
      collectArgs.push("--since", options.since);
    }

    runPython("collect_sessions.py", collectArgs);
    runPython("summarize_evidence.py", ["--input", evidencePath, "--output", summaryPath]);
    summary = JSON.parse(readFileSync(summaryPath, "utf-8"));
    options.root = root;
  }

  const report = buildReport(summary, options);
  let url = siteUrl(options.site, report);
  if (options.uploadUrl) {
    const uploaded = await uploadReport(options.uploadUrl, report);
    url = uploaded.url || `${options.uploadUrl.replace(/\/$/, "")}/#id=${uploaded.id}`;
  }

  const outPath = options.write && options.out ? writeReport(options.out, report) : "";
  if (options.printJson) {
    console.log(JSON.stringify({ report, url, outPath }, null, 2));
  } else {
    printHuman(report, url, outPath);
  }
  if (options.open) openUrl(url);
}

main().catch((error) => {
  console.error(`vibe-rank: ${error.message}`);
  process.exit(1);
});
