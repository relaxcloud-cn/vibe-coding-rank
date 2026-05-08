import base64
import json
import subprocess
import sys
import tempfile
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread


ROOT = Path(__file__).resolve().parents[1]


def decode_hash_report(url: str) -> dict:
    data = url.split("#data=", 1)[1]
    padded = data + ("=" * (-len(data) % 4))
    return json.loads(base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8"))


class CliTests(unittest.TestCase):
    def test_demo_default_url_uses_yisec_ai(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--demo",
                "--print-json",
                "--no-write",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        self.assertTrue(payload["url"].startswith("https://vibe.yisec.ai/#data="))
        self.assertLess(len(payload["url"]), 14000)
        shared = decode_hash_report(payload["url"])
        self.assertTrue(shared["privacy"]["localPathsRemoved"])
        self.assertFalse(shared["privacy"]["rawLogsUploaded"])
        self.assertTrue(shared["privacy"]["compactPublicReport"])
        self.assertIn("costEstimate", shared)
        self.assertIn("metricGroups", shared)
        self.assertIn("statProfile", shared)
        self.assertEqual(shared["statProfile"]["id"], "system_owner")
        self.assertIn("reasons", shared["statProfile"])
        self.assertLessEqual(len(shared["statProfile"]["reasons"]), 2)
        self.assertNotIn("matchedRules", shared["statProfile"])
        self.assertEqual(len(shared["metricGroups"]), 5)
        self.assertEqual(shared["metricGroups"][2]["id"], "human_control")
        self.assertNotIn("behaviorCounts", shared)
        self.assertNotIn("promotionBehaviorCounts", shared)
        self.assertNotIn("qualityNotes", shared)
        self.assertNotIn("usageStats", shared)
        self.assertNotIn("signalCounts", shared)
        self.assertNotIn("narrative", shared)
        self.assertNotIn("product", shared)
        self.assertLessEqual(len(shared["hardStatCards"]), 8)
        self.assertEqual(shared["evidence"], [])
        self.assertGreaterEqual(len(shared["strongestEvidence"]), 1)
        self.assertLessEqual(len(shared["strongestEvidence"]), 3)
        self.assertLessEqual(len(shared["rankGates"]), 1)
        self.assertLessEqual(len(shared["qualityFlags"]), 2)
        self.assertLessEqual(len(shared["dragFactors"]), 2)
        self.assertNotIn("root", shared)
        self.assertNotIn("snippet", shared["strongestEvidence"][0])
        self.assertNotIn("source", shared["strongestEvidence"][0])
        self.assertNotIn("role", shared["strongestEvidence"][0])
        self.assertNotIn("demo/session.jsonl", json.dumps(shared, ensure_ascii=False))

    def test_demo_print_json_contains_cloud_report_url(self) -> None:
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
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        self.assertEqual(payload["report"]["rank"]["label"], "六品 · 已有大成")
        self.assertEqual(payload["report"]["judgmentMode"], "自动初筛")
        self.assertFalse(payload["report"]["isFinal"])
        self.assertIn("#data=", payload["url"])
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
        self.assertIn("statProfile", payload["report"])
        self.assertEqual(payload["report"]["statProfile"]["label"], "系统拥有型")
        self.assertIn("不直接升品", payload["report"]["statProfile"]["ratingUse"])
        self.assertIn("用户决策 17%", payload["report"]["statProfile"]["reasons"][0])
        self.assertEqual(payload["report"]["statProfile"]["matchedRules"][0]["metric"], "用户决策")
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
        self.assertIn("系统拥有型", payload["report"]["shareImagePrompt"])
        self.assertIn("画像依据", payload["report"]["shareImagePrompt"])
        self.assertIn("关键门槛", payload["report"]["shareImagePrompt"])
        self.assertIn("质量提示", payload["report"]["shareImagePrompt"])
        self.assertIn("拖累项", payload["report"]["shareImagePrompt"])
        self.assertIn("其他人或项目复用", payload["report"]["shareImagePrompt"])
        self.assertIn("验证闭环密度", payload["report"]["shareImagePrompt"])
        self.assertIn("返工压力", payload["report"]["shareImagePrompt"])
        self.assertIn("narrative", payload["report"])
        self.assertIn("你现在是", payload["report"]["narrative"]["oneLine"])
        self.assertIn("AI 深度判定官", payload["report"]["judgePrompt"])
        self.assertIn("最终段位", payload["report"]["judgePrompt"])
        self.assertIn("维持、上调或下调", payload["report"]["judgePrompt"])
        self.assertIn("用户决策占比", payload["report"]["judgePrompt"])
        self.assertIn("统计仪表盘", payload["report"]["judgePrompt"])
        self.assertIn("统计画像", payload["report"]["judgePrompt"])
        self.assertIn("系统拥有型", payload["report"]["judgePrompt"])
        self.assertIn("画像依据", payload["report"]["judgePrompt"])
        self.assertNotIn("demo/session.jsonl", payload["report"]["judgePrompt"])
        self.assertIn("statsInsight", payload["report"])
        self.assertEqual(payload["report"]["usageStats"]["average_day_tokens"], 213333)
        self.assertEqual(payload["report"]["hardStats"]["signal_coverage_ratio"], 0.6364)
        self.assertEqual(payload["report"]["hardStats"]["established_dimension_count"], 5)
        self.assertIn("behaviorCounts", payload["report"])
        self.assertIn("用户决策", payload["report"]["shareImagePrompt"])

    def test_demo_can_estimate_token_cost_from_user_prices(self) -> None:
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
                "--no-write",
            ],
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
        shared = decode_hash_report(payload["url"])
        self.assertEqual(shared["costEstimate"]["estimatedUsd"], 0.786)

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
                    "--no-write",
                ],
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
            self.assertIn("统计画像：系统拥有型", text)
            self.assertIn("公开链接只包含压缩脱敏摘要", text)
            self.assertIn("--write-link .airank/report-url.txt", text)
            self.assertIn(f"本地完整报告：{out}", text)
            self.assertIn("--write-share-prompt", text)
            self.assertIn("--write-judge-prompt", text)

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
                    "--no-write",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            self.assertTrue(payload["linkPath"].endswith("report-url.txt"))
            self.assertEqual(link_path.read_text(encoding="utf-8").strip(), payload["url"])
            self.assertTrue(payload["url"].startswith("https://vibe.yisec.ai/#data="))

    def test_public_hash_link_stays_compact_for_dense_generic_logs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
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
                        "source": "generic",
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

            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--source",
                    "generic",
                    "--root",
                    str(root),
                    "--print-json",
                    "--no-write",
                ],
                check=True,
                capture_output=True,
                text=True,
            )

            payload = json.loads(result.stdout)
            self.assertLess(len(payload["url"]), 14000)
            shared = decode_hash_report(payload["url"])
            self.assertLessEqual(len(shared["rankGates"]), 1)
            self.assertLessEqual(len(shared["hardStatCards"]), 6)
            self.assertLessEqual(len(shared["qualityFlags"]), 2)
            self.assertLessEqual(len(shared["dragFactors"]), 2)
            self.assertLessEqual(len(shared["strongestEvidence"]), 3)
            self.assertNotIn("matchedRules", shared["statProfile"])
            self.assertNotIn("root", shared)

    def test_doctor_reports_missing_default_root_without_reading_logs(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--doctor",
                "--source",
                "generic",
                "--root",
                "/tmp/airank-vibe-missing-root-for-test",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        text = result.stdout
        self.assertIn("Vibe Coding Rank 本地诊断", text)
        self.assertIn("来源：generic", text)
        self.assertIn("路径状态：不存在", text)
        self.assertIn("--root <path>", text)
        self.assertIn("--demo --open", text)

    def test_rejects_unknown_source_before_scanning(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                "--source",
                "cursor",
                "--doctor",
            ],
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Unsupported --source "cursor"', result.stderr)
        self.assertIn("codex, claude, or generic", result.stderr)

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
                    "generic",
                    "--root",
                    tmp,
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            text = result.stdout
            self.assertIn(f"tmp{Path(tmp).name.removeprefix('tmp')}", text)
            self.assertIn("路径状态：存在", text)
            self.assertIn("Python：", text)
            self.assertIn("可以运行：", text)
            self.assertIn("--root", text)

    def test_short_link_uploads_report_and_uses_id_url(self) -> None:
        received = {}

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self) -> None:  # noqa: N802
                length = int(self.headers.get("content-length", "0"))
                received["path"] = self.path
                received["body"] = self.rfile.read(length).decode("utf-8")
                payload = {"id": "abc123xyz", "url": f"http://127.0.0.1:{self.server.server_port}/#id=abc123xyz"}
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
                    "--short-link",
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
        self.assertEqual(payload["url"], f"http://127.0.0.1:{server.server_port}/#id=abc123xyz")
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
        self.assertIn("statProfile", uploaded)
        self.assertEqual(uploaded["metricGroups"][0]["id"], "investment")
        self.assertEqual(uploaded["statProfile"]["id"], "system_owner")
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
        self.assertEqual(uploaded["evidence"], [])
        self.assertNotIn("snippet", uploaded["strongestEvidence"][0])
        self.assertNotIn("source", uploaded["strongestEvidence"][0])
        self.assertNotIn("role", uploaded["strongestEvidence"][0])
        self.assertNotIn("demo/session.jsonl", json.dumps(uploaded, ensure_ascii=False))
        self.assertTrue(uploaded["privacy"]["localPathsRemoved"])
        self.assertFalse(uploaded["privacy"]["rawLogsUploaded"])
        self.assertNotIn("#data=", payload["url"])

    def test_generic_source_uses_moved_evidence_scripts(self) -> None:
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
                    "generic",
                    "--root",
                    str(root),
                    "--print-json",
                    "--no-write",
                ],
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
