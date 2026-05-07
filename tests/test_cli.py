import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


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
        self.assertIn("qualityNotes", payload["report"])
        self.assertIn("dimensionProfile", payload["report"])
        self.assertIn("userControlCount", payload["report"])
        self.assertIn("usageStats", payload["report"])
        self.assertIn("hardStats", payload["report"])
        self.assertEqual(payload["report"]["hardStats"]["usage_record_count"], 42)
        self.assertIn("shareImagePrompt", payload["report"])
        self.assertIn("Vibe Coding 九品报告", payload["report"]["shareImagePrompt"])
        self.assertIn("No raw logs", payload["report"]["shareImagePrompt"])
        self.assertIn("narrative", payload["report"])
        self.assertIn("你现在是", payload["report"]["narrative"]["oneLine"])

    def test_demo_can_write_share_image_prompt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            prompt_path = Path(tmp) / "share-prompt.txt"
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "src" / "cli" / "vibe-rank.mjs"),
                    "--demo",
                    "--write-share-prompt",
                    str(prompt_path),
                    "--print-json",
                    "--no-write",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            payload = json.loads(result.stdout)
            prompt = prompt_path.read_text(encoding="utf-8")
            self.assertTrue(payload["shareImagePromptPath"].endswith("share-prompt.txt"))
            self.assertIn("Asset type: 4:5 vertical Chinese social-share poster", prompt)
            self.assertIn("主评级：六品 · 已有大成", prompt)
            self.assertNotIn(str(ROOT), prompt)

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
