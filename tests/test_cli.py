import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread


ROOT = Path(__file__).resolve().parents[1]


def write_session(root: Path, text: str, role: str = "user") -> None:
    root.mkdir(parents=True, exist_ok=True)
    path = root / "session.jsonl"
    path.write_text(
        json.dumps({"role": role, "content": text}, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


class CliTests(unittest.TestCase):
    def test_demo_no_write_requires_explicit_share_target(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--demo",
                "--print-json",
                "--no-write",
            ],
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertIn("--no-write cannot create a local /report link", result.stderr)
        self.assertIn("--share", result.stderr)

    def test_demo_default_writes_local_full_report_path_url(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            report_id = payload["reportId"]
            self.assertRegex(report_id, r"^[a-f0-9]{16}$")
            self.assertEqual(payload["url"], f"http://127.0.0.1:4173/report/{report_id}")
            self.assertEqual(payload["reportLinkMode"], "local-full-report")
            self.assertEqual(payload["reportPayloadType"], "local-full")
            self.assertEqual(payload["qrUrl"], f"http://127.0.0.1:4173/api/reports/{report_id}/qr.svg")
            stored_path = Path(tmp) / ".airank" / "reports" / f"{report_id}.json"
            self.assertTrue(stored_path.exists())
            stored = json.loads(stored_path.read_text(encoding="utf-8"))
            report = stored["report"] if "report" in stored else stored
            self.assertEqual(report["reportId"], report_id)
            self.assertEqual(report["reportLinkMode"], "local-full-report")
            self.assertEqual(report["reportPayloadType"], "local-full")
            self.assertIn("evidence", report)
            self.assertIn("snippet", report["evidence"][0])

    def test_demo_print_json_contains_cloud_report_url(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--site",
                    "http://localhost:4173",
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            report_id = payload["reportId"]
            self.assertEqual(payload["report"]["rank"]["label"], "六品 · 已有大成")
            self.assertEqual(payload["report"]["judgmentMode"], "自动初筛")
            self.assertFalse(payload["report"]["isFinal"])
            self.assertEqual(payload["url"], f"http://localhost:4173/report/{report_id}")
            self.assertEqual(payload["reportLinkMode"], "local-full-report")
            self.assertEqual(payload["reportPayloadType"], "local-full")
            self.assertEqual(payload["qrUrl"], f"http://localhost:4173/api/reports/{report_id}/qr.svg")
            self.assertIn("whyThisRank", payload["report"])
            self.assertIn("whyNotNextRank", payload["report"])
            self.assertIn("strongestEvidence", payload["report"])
            self.assertIn("unlockStatus", payload["report"])
            self.assertIn("rankGates", payload["report"])
            self.assertIn("qualityNotes", payload["report"])
            self.assertIn("dimensionProfile", payload["report"])
            self.assertIn("userControlCount", payload["report"])
            self.assertIn("usageStats", payload["report"])
            self.assertIn("hardStats", payload["report"])
            self.assertIn("hardStatCards", payload["report"])
            self.assertIn("gateUpgradeAdvice", payload["report"])
            self.assertIn("qualityFlags", payload["report"])
            self.assertIn("dragFactors", payload["report"])
            self.assertIn("costEstimate", payload["report"])
            self.assertIn("judgePrompt", payload["report"])
            self.assertFalse(payload["report"]["costEstimate"]["configured"])
            self.assertEqual(payload["report"]["hardStats"]["usage_record_count"], 42)
            self.assertEqual(payload["report"]["hardStats"]["promotion_record_count"], 32)
            self.assertEqual(payload["report"]["hardStats"]["validation_density"], 0.1083)
            self.assertEqual(payload["report"]["hardStats"]["strong_record_density"], 0.1)
            self.assertEqual(payload["report"]["hardStatCards"][0]["label"], "AI 投入强度")
            self.assertTrue(any(item["id"] == "estimated_cost" for item in payload["report"]["hardStatCards"]))
            self.assertTrue(any(item["id"] == "validation_density" for item in payload["report"]["hardStatCards"]))
            self.assertTrue(any(item["id"] == "rework_pressure" for item in payload["report"]["hardStatCards"]))
            self.assertTrue(any(item["id"] == "promotion_record_quality" for item in payload["report"]["hardStatCards"]))
            self.assertIn("metricGroups", payload["report"])
            self.assertIn("statEvidence", payload["report"])
            self.assertIn("statProfile", payload["report"])
            self.assertEqual(payload["report"]["statEvidence"]["supportLevel"], 6)
            self.assertIn("不会单独升品", payload["report"]["statEvidence"]["conclusion"])
            self.assertIn("token 和成本只说明投入强度", payload["report"]["statEvidence"]["ratingUse"])
            self.assertEqual(payload["report"]["statProfile"]["label"], "助手自述偏重型")
            self.assertIn("不直接升品", payload["report"]["statProfile"]["ratingUse"])
            self.assertIn("用户决策 17%", payload["report"]["statProfile"]["reasons"][0])
            self.assertEqual(payload["report"]["statProfile"]["matchedRules"][0]["metric"], "用户决策")
            self.assertEqual(payload["report"]["hardStats"]["promotion_usable_signal_ratio"], 0.25)
            self.assertEqual(payload["report"]["hardStats"]["downgraded_assistant_signal_count"], 32)
            self.assertEqual(
                [item["id"] for item in payload["report"]["metricGroups"]],
                ["investment", "sample_quality", "human_control", "validation_loop", "efficiency_risk"],
            )
            self.assertIn("不直接升品", payload["report"]["metricGroups"][0]["ratingImpact"])
            self.assertIn("高段位必须看到人的系统级决策", payload["report"]["metricGroups"][2]["ratingImpact"])
            self.assertIn("其他人或项目复用", payload["report"]["gateUpgradeAdvice"])
            self.assertEqual(payload["report"]["qualityFlags"][0]["label"], "助手执行占比较高")
            self.assertIn("shareImagePrompt", payload["report"])
            self.assertIn("Vibe Coding 九品报告", payload["report"]["shareImagePrompt"])
            self.assertIn("No raw logs", payload["report"]["shareImagePrompt"])
            self.assertIn("硬指标卡", payload["report"]["shareImagePrompt"])
            self.assertIn("统计仪表盘", payload["report"]["shareImagePrompt"])
            self.assertIn("证据结构", payload["report"]["shareImagePrompt"])
            self.assertIn("统计解读", payload["report"]["shareImagePrompt"])
            self.assertIn("统计画像", payload["report"]["shareImagePrompt"])
            self.assertIn("硬统计证据结论", payload["report"]["shareImagePrompt"])
            self.assertIn("六品统计支撑", payload["report"]["shareImagePrompt"])
            self.assertIn("助手自述偏重型", payload["report"]["shareImagePrompt"])
            self.assertIn("画像依据", payload["report"]["shareImagePrompt"])
            self.assertIn("关键门槛", payload["report"]["shareImagePrompt"])
            self.assertIn("质量提示", payload["report"]["shareImagePrompt"])
            self.assertIn("拖累项", payload["report"]["shareImagePrompt"])
            self.assertIn("其他人或项目复用", payload["report"]["shareImagePrompt"])
            self.assertIn("验证闭环密度", payload["report"]["shareImagePrompt"])
            self.assertIn("返工压力", payload["report"]["shareImagePrompt"])
            self.assertIn("可升品高阶信号", payload["report"]["shareImagePrompt"])
            self.assertIn("助手自述降权", payload["report"]["shareImagePrompt"])
            self.assertIn("narrative", payload["report"])
            self.assertIn("你现在是", payload["report"]["narrative"]["oneLine"])
            self.assertIn("AI 深度判定官", payload["report"]["judgePrompt"])
            self.assertIn("最终段位", payload["report"]["judgePrompt"])
            self.assertIn("维持、上调或下调", payload["report"]["judgePrompt"])
            self.assertIn("用户决策占比", payload["report"]["judgePrompt"])
            self.assertIn("统计仪表盘", payload["report"]["judgePrompt"])
            self.assertIn("统计画像", payload["report"]["judgePrompt"])
            self.assertIn("硬统计证据结论", payload["report"]["judgePrompt"])
            self.assertIn("风险统计", payload["report"]["judgePrompt"])
            self.assertIn("助手自述偏重型", payload["report"]["judgePrompt"])
            self.assertIn("可升品高阶信号", payload["report"]["judgePrompt"])
            self.assertIn("助手自述降权", payload["report"]["judgePrompt"])
            self.assertIn("画像依据", payload["report"]["judgePrompt"])
            self.assertNotIn("demo/session.jsonl", payload["report"]["judgePrompt"])
            self.assertIn("statsInsight", payload["report"])
            self.assertEqual(payload["report"]["usageStats"]["average_day_tokens"], 213333)
            self.assertEqual(payload["report"]["hardStats"]["signal_coverage_ratio"], 0.6364)
            self.assertEqual(payload["report"]["hardStats"]["established_dimension_count"], 5)
            self.assertIn("behaviorCounts", payload["report"])
            self.assertIn("用户决策", payload["report"]["shareImagePrompt"])

    def test_local_site_defaults_to_full_report_link(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--site",
                    "http://127.0.0.1:4173",
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            report_id = payload["reportId"]
            self.assertRegex(report_id, r"^[a-f0-9]{16}$")
            self.assertEqual(payload["url"], f"http://127.0.0.1:4173/report/{report_id}")
            self.assertEqual(payload["reportLinkMode"], "local-full-report")
            self.assertEqual(payload["reportPayloadType"], "local-full")
            self.assertEqual(payload["qrUrl"], f"http://127.0.0.1:4173/api/reports/{report_id}/qr.svg")
            self.assertTrue(payload["outPath"].endswith(".airank/vibe-report.json"))
            stored_path = Path(tmp) / ".airank" / "reports" / f"{report_id}.json"
            self.assertTrue(stored_path.exists())
            stored = json.loads(stored_path.read_text(encoding="utf-8"))
            report = stored["report"] if "report" in stored else stored
            self.assertEqual(report["reportId"], report_id)
            self.assertEqual(report["reportLinkMode"], "local-full-report")
            self.assertEqual(report["reportPayloadType"], "local-full")
            self.assertIn("evidence", report)
            self.assertIn("snippet", report["evidence"][0])

    def test_lan_site_defaults_to_full_report_link(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--site",
                    "http://192.168.10.42:4173",
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            self.assertEqual(payload["url"], f"http://192.168.10.42:4173/report/{payload['reportId']}")
            self.assertEqual(payload["reportLinkMode"], "local-full-report")
            self.assertEqual(payload["reportPayloadType"], "local-full")

    def test_default_source_auto_detects_and_merges_codex_and_claude(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp) / "home"
            cwd = Path(tmp) / "work"
            codex_root = home / ".codex" / "sessions"
            claude_root = home / ".claude" / "projects"
            cwd.mkdir()
            write_session(codex_root, "先给计划，验收条件是 test 通过，不要改支付模块。")
            write_session(claude_root, "解释架构边界，运行 lint build，并整理 workflow checklist。", role="assistant")
            env = os.environ.copy()
            env["HOME"] = str(home)

            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--print-json",
                ],
                cwd=cwd,
                env=env,
                check=True,
                capture_output=True,
                text=True,
            )

            payload = json.loads(result.stdout)
            report = payload["report"]
            self.assertEqual(report["source"], "codex+claude")
            self.assertEqual(report["sources"], ["codex", "claude"])
            self.assertEqual(
                report["roots"],
                [
                    {"source": "codex", "path": str(codex_root.resolve())},
                    {"source": "claude", "path": str(claude_root.resolve())},
                ],
            )
            self.assertEqual(report["recordCount"], 2)
            evidence_text = json.dumps(report["evidence"], ensure_ascii=False)
            self.assertIn("codex:", evidence_text)
            self.assertIn("claude:", evidence_text)

    def test_strongest_evidence_deduplicates_one_record_matching_multiple_signals(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "codex-sessions"
            write_session(
                root,
                "我已经定位到关键模块和架构边界，包含 auth 权限、数据模型、重构、系统设计、关键路径、上线、回滚和日志观测。",
                role="assistant",
            )

            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--source",
                    "codex",
                    "--root",
                    str(root),
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )

            payload = json.loads(result.stdout)
            snippets = [
                item.get("snippet", "")
                for item in payload["report"]["strongestEvidence"]
                if item.get("snippet")
            ]
            self.assertEqual(len(snippets), len(set(snippets)))
            self.assertEqual(len(snippets), 1)

    def test_default_source_uses_single_detected_source(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp) / "home"
            cwd = Path(tmp) / "work"
            claude_root = home / ".claude" / "projects"
            cwd.mkdir()
            write_session(claude_root, "先定义目标和验收标准，再实现功能。")
            env = os.environ.copy()
            env["HOME"] = str(home)

            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--print-json",
                ],
                cwd=cwd,
                env=env,
                check=True,
                capture_output=True,
                text=True,
            )

            payload = json.loads(result.stdout)
            report = payload["report"]
            self.assertEqual(report["source"], "claude")
            self.assertEqual(report["sources"], ["claude"])
            self.assertEqual(report["roots"], [{"source": "claude", "path": str(claude_root.resolve())}])

    def test_explicit_comma_and_repeated_sources_merge_codex_and_claude(self) -> None:
        for args in (["--source", "codex,claude"], ["--source", "codex", "--source", "claude"]):
            with self.subTest(args=args), tempfile.TemporaryDirectory() as tmp:
                home = Path(tmp) / "home"
                cwd = Path(tmp) / "work"
                codex_root = home / ".codex" / "sessions"
                claude_root = home / ".claude" / "projects"
                cwd.mkdir()
                write_session(codex_root, "先给计划，验收 test 通过。")
                write_session(claude_root, "运行 lint build，并说明架构边界。")
                env = os.environ.copy()
                env["HOME"] = str(home)

                result = subprocess.run(
                    [
                        "node",
                        str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                        *args,
                        "--print-json",
                    ],
                    cwd=cwd,
                    env=env,
                    check=True,
                    capture_output=True,
                    text=True,
                )

                payload = json.loads(result.stdout)
                self.assertEqual(payload["report"]["source"], "codex+claude")
                self.assertEqual(payload["report"]["sources"], ["codex", "claude"])
                self.assertEqual(payload["report"]["recordCount"], 2)

    def test_root_is_only_allowed_for_single_explicit_source(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "codex-custom"
            write_session(root, "自定义 Codex 目录，先计划再验收。")
            ok = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--source",
                    "codex",
                    "--root",
                    str(root),
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(ok.stdout)
            self.assertEqual(payload["report"]["source"], "codex")
            self.assertEqual(payload["report"]["roots"], [{"source": "codex", "path": str(root.resolve())}])

            cases = [
                ["--root", str(root), "--print-json"],
                ["--source", "codex,claude", "--root", str(root), "--print-json"],
            ]
            for args in cases:
                with self.subTest(args=args):
                    result = subprocess.run(
                        ["node", str(ROOT / "src" / "cli" / "vibe-rank.mjs"), *args],
                        cwd=tmp,
                        capture_output=True,
                        text=True,
                    )
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn("--root can only be used with exactly one explicit source", result.stderr)

    def test_local_site_no_write_requires_share_target(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--site",
                    "http://localhost:4173",
                    "--print-json",
                    "--no-write",
                ],
                cwd=tmp,
                capture_output=True,
                text=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(result.stdout, "")
            self.assertIn("--no-write cannot create a local /report link", result.stderr)
            self.assertFalse((Path(tmp) / ".airank" / "reports").exists())

    def test_demo_default_uses_standard_analysis_mode_without_advanced_payload(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--demo",
                "--print-json",
            ],
            cwd=tempfile.mkdtemp(),
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        self.assertEqual(payload["report"]["analysisMode"], "standard")
        self.assertNotIn("advancedAnalysis", payload["report"])
        self.assertEqual(payload["reportPayloadType"], "local-full")
        self.assertEqual(payload["reportLinkMode"], "local-full-report")

    def test_advanced_analysis_demo_outputs_local_and_public_audit(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--demo",
                "--advanced-analysis",
                "--print-json",
            ],
            cwd=tempfile.mkdtemp(),
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        report = payload["report"]
        self.assertEqual(report["analysisMode"], "advanced")
        self.assertIn("advancedAnalysis", report)
        advanced = report["advancedAnalysis"]
        self.assertIn("decisionTrace", advanced)
        self.assertEqual(advanced["decisionTrace"]["finalRank"]["label"], "六品 · 已有大成")
        self.assertIn("自动初筛最高只确认到七品", advanced["decisionTrace"]["capReasons"][0])
        self.assertIn("confidenceImpact", advanced["decisionTrace"])
        self.assertIn("gateAudit", advanced)
        self.assertGreaterEqual(len(advanced["gateAudit"]["passed"]), 1)
        self.assertEqual(advanced["gateAudit"]["keyGate"]["id"], "level8_team_replication")
        self.assertIn("dimensionRubric", advanced)
        self.assertEqual(len(advanced["dimensionRubric"]), 6)
        self.assertTrue(any(item["id"] == "method_replication" and item["nextGap"] for item in advanced["dimensionRubric"]))
        self.assertIn("evidenceAudit", advanced)
        self.assertGreaterEqual(len(advanced["evidenceAudit"]["accepted"]), 1)
        self.assertGreaterEqual(len(advanced["evidenceAudit"]["downranked"]), 1)
        self.assertIn("upgradePlan", advanced)
        self.assertGreaterEqual(len(advanced["upgradePlan"]), 2)
        self.assertLessEqual(len(advanced["upgradePlan"]), 3)
        self.assertIn("其他人或项目复用", advanced["upgradePlan"][0])
        self.assertIn("limitations", advanced)
        self.assertTrue(any("规则初筛" in item for item in advanced["limitations"]))
        self.assertTrue(any("token" in item for item in advanced["limitations"]))
        self.assertEqual(payload["reportPayloadType"], "local-full")
        self.assertEqual(payload["reportLinkMode"], "local-full-report")
        self.assertNotIn("undefined", report["judgePrompt"])

    def test_advanced_alias_matches_advanced_analysis_flag(self) -> None:
        common = [
            "node",
            str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
            "--demo",
            "--print-json",
        ]
        with tempfile.TemporaryDirectory() as tmp_full, tempfile.TemporaryDirectory() as tmp_alias:
            full = subprocess.run(
                [*common, "--advanced-analysis"],
                cwd=tmp_full,
                check=True,
                capture_output=True,
                text=True,
            )
            alias = subprocess.run(
                [*common, "--advanced"],
                cwd=tmp_alias,
                check=True,
                capture_output=True,
                text=True,
            )
            full_payload = json.loads(full.stdout)
            alias_payload = json.loads(alias.stdout)
        self.assertEqual(alias_payload["report"]["analysisMode"], "advanced")
        self.assertEqual(
            alias_payload["report"]["advancedAnalysis"],
            full_payload["report"]["advancedAnalysis"],
        )

    def test_demo_can_estimate_token_cost_from_user_prices(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--usd-per-million-input-tokens",
                    "1",
                    "--usd-per-million-cached-input-tokens",
                    "0.1",
                    "--usd-per-million-output-tokens",
                    "5",
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            cost = payload["report"]["costEstimate"]
            self.assertTrue(cost["configured"])
            self.assertEqual(cost["estimatedUsd"], 0.786)
            self.assertEqual(cost["billableInputTokens"], 400000)
            self.assertIn("估算成本 $0.79", payload["report"]["shareImagePrompt"])
            self.assertEqual(payload["reportLinkMode"], "local-full-report")
            stored = json.loads(Path(payload["localReportPath"]).read_text(encoding="utf-8"))
            self.assertEqual(stored["report"]["costEstimate"]["estimatedUsd"], 0.786)

    def test_demo_can_write_share_image_prompt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            prompt_path = Path(tmp) / "share-prompt.txt"
            judge_path = Path(tmp) / "judge-prompt.txt"
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--write-share-prompt",
                    str(prompt_path),
                    "--write-judge-prompt",
                    str(judge_path),
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            prompt = prompt_path.read_text(encoding="utf-8")
            judge_prompt = judge_path.read_text(encoding="utf-8")
            self.assertTrue(payload["shareImagePromptPath"].endswith("share-prompt.txt"))
            self.assertTrue(payload["judgePromptPath"].endswith("judge-prompt.txt"))
            self.assertIn("Asset type: 4:5 vertical Chinese social-share poster", prompt)
            self.assertIn("主评级：六品 · 已有大成", prompt)
            self.assertIn("统计仪表盘", prompt)
            self.assertIn("统计画像", prompt)
            self.assertIn("AI 深度判定官", judge_prompt)
            self.assertIn("最终段位", judge_prompt)
            self.assertIn("统计仪表盘", judge_prompt)
            self.assertIn("统计画像", judge_prompt)
            self.assertNotIn(str(ROOT), prompt)
            self.assertNotIn(str(ROOT), judge_prompt)
            self.assertNotIn("undefined", judge_prompt)

    def test_human_output_explains_report_artifacts(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "report.json"
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--out",
                    str(out),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            text = result.stdout
            self.assertIn("置信度：高", text)
            self.assertIn("系统归属：强", text)
            self.assertIn("统计仪表盘：", text)
            self.assertIn("硬统计证据：硬统计支撑当前段位", text)
            self.assertIn("统计画像：助手自述偏重型", text)
            self.assertIn("本地完整报告只在本机报告服务读取", text)
            self.assertIn("--share --open", text)
            self.assertIn(f"本地完整报告：{out}", text)
            self.assertIn("--write-share-prompt", text)
            self.assertIn("--write-judge-prompt", text)

    def test_human_output_shows_advanced_analysis_only_when_enabled(self) -> None:
        standard = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--demo",
            ],
            cwd=tempfile.mkdtemp(),
            check=True,
            capture_output=True,
            text=True,
        )
        self.assertNotIn("高级分析：", standard.stdout)

        advanced = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--demo",
                "--advanced-analysis",
            ],
            cwd=tempfile.mkdtemp(),
            check=True,
            capture_output=True,
            text=True,
        )
        self.assertIn("高级分析：", advanced.stdout)
        self.assertIn("决策链：", advanced.stdout)
        self.assertIn("关键未过门槛：八品团队复制", advanced.stdout)
        self.assertIn("采纳证据：", advanced.stdout)
        self.assertIn("降权证据：", advanced.stdout)
        self.assertIn("下一步：", advanced.stdout)
        self.assertEqual(advanced.stdout.count("\n下一步：\n"), 1)

    def test_no_write_with_non_upload_site_is_rejected(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--demo",
                "--site",
                "https://example.com",
                "--print-json",
                "--no-write",
            ],
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertIn("--no-write cannot create a local /report link", result.stderr)
        self.assertNotIn("/share/", result.stderr)

    def test_demo_can_write_full_report_link(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            link_path = Path(tmp) / "report-url.txt"
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--write-link",
                    str(link_path),
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            self.assertTrue(payload["linkPath"].endswith("report-url.txt"))
            self.assertEqual(link_path.read_text(encoding="utf-8").strip(), payload["url"])
            self.assertRegex(payload["url"], r"^http://127\.0\.0\.1:4173/report/[a-f0-9]{16}$")

    def test_public_share_payload_stays_compact_for_dense_codex_logs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            received = {}

            class Handler(BaseHTTPRequestHandler):
                def do_POST(self) -> None:  # noqa: N802
                    length = int(self.headers.get("content-length", "0"))
                    received["path"] = self.path
                    received["body"] = self.rfile.read(length).decode("utf-8")
                    payload = {"id": "dense123", "url": f"http://127.0.0.1:{self.server.server_port}/share/dense123"}
                    body = json.dumps(payload).encode("utf-8")
                    self.send_response(200)
                    self.send_header("content-type", "application/json")
                    self.send_header("content-length", str(len(body)))
                    self.end_headers()
                    self.wfile.write(body)

                def log_message(self, *_args: object) -> None:
                    return

            root = Path(tmp)
            source = root / "dense.jsonl"
            rows = []
            for index in range(80):
                role = "user" if index % 2 == 0 else "assistant"
                text = (
                    "先给计划，验收条件是 test build lint 通过，不要改支付模块。"
                    "解释架构边界、权限、数据模型、上线 rollback、workflow rules、团队 playbook。"
                    if role == "user"
                    else "已完成实现，运行 test build lint，通过验证并整理 workflow checklist。"
                )
                rows.append(
                    {
                        "source": "codex",
                        "path": f"dense.jsonl:{index + 1}",
                        "mtime": "2026-05-08T10:00:00",
                        "role": role,
                        "text": text,
                    }
                )
            source.write_text(
                "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n",
                encoding="utf-8",
            )

            server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
            thread = Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                result = subprocess.run(
                    [
                        "node",
                        str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                        "--source",
                        "codex",
                        "--root",
                        str(root),
                        "--site",
                        f"http://127.0.0.1:{server.server_port}",
                        "--share",
                        "--print-json",
                        "--no-write",
                    ],
                    check=True,
                    capture_output=True,
                    text=True,
                )
            finally:
                server.shutdown()
                server.server_close()
                thread.join(timeout=2)

            payload = json.loads(result.stdout)
            shared = json.loads(received["body"])
            self.assertEqual(received["path"], "/api/reports")
            self.assertEqual(payload["url"], f"http://127.0.0.1:{server.server_port}/share/dense123")
            self.assertEqual(payload["reportLinkMode"], "public-share-link")
            self.assertLessEqual(len(shared["rankGates"]), 1)
            self.assertLessEqual(len(shared["hardStatCards"]), 6)
            self.assertLessEqual(len(shared["qualityFlags"]), 2)
            self.assertLessEqual(len(shared["dragFactors"]), 2)
            self.assertLessEqual(len(shared["strongestEvidence"]), 3)
            self.assertNotIn("matchedRules", shared["statProfile"])
            self.assertNotIn("root", shared)
            self.assertNotIn("roots", shared)

    def test_doctor_reports_missing_default_root_without_reading_logs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            env = os.environ.copy()
            env["HOME"] = str(Path(tmp) / "home")
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--doctor",
                    "--source",
                    "codex",
                ],
                env=env,
                check=True,
                capture_output=True,
                text=True,
            )
        text = result.stdout
        self.assertIn("Vibe Coding Rank 本地诊断", text)
        self.assertIn("来源：codex", text)
        self.assertIn("路径状态：codex:不存在", text)
        self.assertIn("--demo --open", text)

    def test_unsupported_source_is_rejected_before_scanning(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--source",
                "cursor",
                "--print-json",
            ],
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Unsupported --source "cursor"', result.stderr)
        self.assertIn("codex, claude, or codex,claude", result.stderr)
        self.assertEqual(result.stdout, "")

    def test_rejects_unknown_option_before_using_defaults(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--soruce",
                "claude",
                "--doctor",
            ],
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unknown option: --soruce", result.stderr)
        self.assertNotIn("来源：codex", result.stdout)

    def test_rejects_unexpected_value_after_boolean_option(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--doctor",
                "codex",
            ],
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unknown argument: codex", result.stderr)

    def test_rejects_invalid_numeric_options_before_scanning(self) -> None:
        cases = [
            (["--doctor", "--limit", "nope"], "--limit must be a positive integer."),
            (["--doctor", "--max-chars", "0"], "--max-chars must be a positive integer."),
            (
                ["--demo", "--usd-per-million-input-tokens", "abc"],
                "--usd-per-million-input-tokens must be a non-negative number.",
            ),
            (
                ["--demo", "--usd-per-million-output-tokens", "-1"],
                "--usd-per-million-output-tokens must be a non-negative number.",
            ),
        ]
        for args, message in cases:
            with self.subTest(args=args):
                result = subprocess.run(
                    ["node", str(ROOT / "src" / "cli" / "vibe-rank.mjs"), *args],
                    capture_output=True,
                    text=True,
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(message, result.stderr)

    def test_rejects_invalid_since_dates_before_scanning(self) -> None:
        cases = [
            (["--doctor", "--since", "20260507"], "--since must use YYYY-MM-DD."),
            (["--doctor", "--since", "2026-99-99"], "--since must be a real calendar date."),
        ]
        for args, message in cases:
            with self.subTest(args=args):
                result = subprocess.run(
                    ["node", str(ROOT / "src" / "cli" / "vibe-rank.mjs"), *args],
                    capture_output=True,
                    text=True,
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(message, result.stderr)

    def test_doctor_reports_ready_state_for_existing_root(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--doctor",
                    "--source",
                    "codex",
                    "--root",
                    tmp,
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            text = result.stdout
            self.assertIn(f"tmp{Path(tmp).name.removeprefix('tmp')}", text)
            self.assertIn("路径状态：codex:存在", text)
            self.assertIn("Python：", text)
            self.assertIn("可以运行：", text)
            self.assertIn("--root", text)

    def test_open_warns_when_opener_missing(self) -> None:
        node = shutil.which("node")
        self.assertIsNotNone(node)
        with tempfile.TemporaryDirectory() as tmp:
            env = os.environ.copy()
            env["PATH"] = tmp
            result = subprocess.run(
                [
                    node,
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--open",
                ],
                cwd=tmp,
                env=env,
                capture_output=True,
                text=True,
            )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Could not open report URL automatically", result.stderr)
        self.assertIn("http://127.0.0.1:4173/report/", result.stderr)

    def test_share_uploads_public_summary_and_uses_share_url(self) -> None:
        received = {}

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self) -> None:  # noqa: N802
                length = int(self.headers.get("content-length", "0"))
                received["path"] = self.path
                received["body"] = self.rfile.read(length).decode("utf-8")
                payload = {"id": "abc123xyz", "url": f"http://127.0.0.1:{self.server.server_port}/share/abc123xyz"}
                body = json.dumps(payload).encode("utf-8")
                self.send_response(200)
                self.send_header("content-type", "application/json")
                self.send_header("content-length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *_args: object) -> None:
                return

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--site",
                    f"http://127.0.0.1:{server.server_port}",
                    "--share",
                    "--print-json",
                    "--no-write",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

        payload = json.loads(result.stdout)
        uploaded = json.loads(received["body"])
        self.assertEqual(received["path"], "/api/reports")
        self.assertEqual(payload["url"], f"http://127.0.0.1:{server.server_port}/share/abc123xyz")
        self.assertEqual(payload["reportLinkMode"], "public-share-link")
        self.assertEqual(payload["reportPayloadType"], "public-summary")
        self.assertEqual(payload["qrUrl"], f"http://127.0.0.1:{server.server_port}/api/reports/abc123xyz/qr.svg")
        self.assertEqual(uploaded["rank"]["label"], "六品 · 已有大成")
        self.assertIn("statsInsight", uploaded)
        self.assertNotIn("behaviorCounts", uploaded)
        self.assertIn("rankGates", uploaded)
        self.assertIn("hardStatCards", uploaded)
        self.assertIn("gateUpgradeAdvice", uploaded)
        self.assertIn("qualityFlags", uploaded)
        self.assertIn("dragFactors", uploaded)
        self.assertIn("costEstimate", uploaded)
        self.assertIn("metricGroups", uploaded)
        self.assertIn("statEvidence", uploaded)
        self.assertIn("statProfile", uploaded)
        self.assertEqual(uploaded["metricGroups"][0]["id"], "investment")
        self.assertIn("不会单独升品", uploaded["statEvidence"]["conclusion"])
        self.assertEqual(uploaded["statProfile"]["id"], "assistant_self_report_heavy")
        self.assertNotIn("matchedRules", uploaded["statProfile"])
        self.assertNotIn("judgePrompt", uploaded)
        self.assertTrue(uploaded["privacy"]["compactPublicReport"])
        self.assertLessEqual(len(uploaded["hardStatCards"]), 6)
        self.assertLessEqual(len(uploaded["rankGates"]), 1)
        self.assertLessEqual(len(uploaded["qualityFlags"]), 2)
        self.assertLessEqual(len(uploaded["dragFactors"]), 2)
        self.assertNotIn("behaviorCounts", uploaded)
        self.assertNotIn("qualityNotes", uploaded)
        self.assertNotIn("usageStats", uploaded)
        self.assertNotIn("signalCounts", uploaded)
        self.assertNotIn("narrative", uploaded)
        self.assertNotIn("root", uploaded)
        self.assertNotIn("roots", uploaded)
        self.assertEqual(uploaded["evidence"], [])
        self.assertNotIn("snippet", uploaded["strongestEvidence"][0])
        self.assertNotIn("source", uploaded["strongestEvidence"][0])
        self.assertNotIn("role", uploaded["strongestEvidence"][0])
        self.assertNotIn("demo/session.jsonl", json.dumps(uploaded, ensure_ascii=False))
        self.assertTrue(uploaded["privacy"]["localPathsRemoved"])
        self.assertFalse(uploaded["privacy"]["rawLogsUploaded"])

    def test_codex_source_uses_moved_evidence_scripts(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "session.jsonl"
            source.write_text(
                json.dumps(
                    {
                        "role": "user",
                        "content": "先给计划，验收条件是 test 通过，不要改支付模块。",
                    },
                    ensure_ascii=False,
                )
                + "\n",
                encoding="utf-8",
            )
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--source",
                    "codex",
                    "--root",
                    str(root),
                    "--print-json",
                ],
                cwd=tmp,
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            self.assertGreaterEqual(payload["report"]["recordCount"], 1)
            self.assertIn("whyThisRank", payload["report"])
            self.assertEqual(payload["report"]["judgmentMode"], "自动初筛")


if __name__ == "__main__":
    unittest.main()
