import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CliTests(unittest.TestCase):
    def test_demo_default_url_uses_yisec_ai(self) -> None:
        result = subprocess.run(
            [
                "node",
                str(ROOT / "cli" / "vibe-rank.mjs"),
                "--demo",
                "--print-json",
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
                str(ROOT / "cli" / "vibe-rank.mjs"),
                "--demo",
                "--site",
                "http://localhost:4173",
                "--print-json",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        self.assertEqual(payload["report"]["rank"]["label"], "六品 · 已有大成")
        self.assertIn("#data=", payload["url"])


if __name__ == "__main__":
    unittest.main()
