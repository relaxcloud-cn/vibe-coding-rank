import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run_script(script: str, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(ROOT / "skill" / "scripts" / script), *args],
        check=True,
        capture_output=True,
        text=True,
    )


class ScriptTests(unittest.TestCase):
    def test_collect_sessions_redacts_secrets(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "session.jsonl"
            output = root / "evidence.jsonl"
            source.write_text(
                json.dumps(
                    {
                        "role": "user",
                        "content": "请先给方案。api_key=sk-testsecret12345678901234567890",
                    },
                    ensure_ascii=False,
                )
                + "\n",
                encoding="utf-8",
            )

            run_script(
                "collect_sessions.py",
                "--source",
                "generic",
                "--root",
                str(root),
                "--output",
                str(output),
            )

            rows = [json.loads(line) for line in output.read_text(encoding="utf-8").splitlines()]
            self.assertEqual(len(rows), 1)
            self.assertIn("[REDACTED_SECRET]", rows[0]["text"])
            self.assertNotIn("sk-testsecret", rows[0]["text"])

    def test_summarize_evidence_detects_high_order_signals(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            evidence.write_text(
                json.dumps(
                    {
                        "source": "codex",
                        "path": "sample/session.jsonl:1",
                        "mtime": "2026-05-07T00:00:00",
                        "role": "user",
                        "text": (
                            "先给计划，验收条件是 build/test/lint 通过，不要改支付模块。"
                            "请关注架构、模块边界、权限、生产 rollback、日志。"
                            "用 subagent 并行 review，沉淀 AGENTS.md workflow。"
                        ),
                    },
                    ensure_ascii=False,
                )
                + "\n",
                encoding="utf-8",
            )

            run_script(
                "summarize_evidence.py",
                "--input",
                str(evidence),
                "--output",
                str(summary),
            )

            data = json.loads(summary.read_text(encoding="utf-8"))
            self.assertGreaterEqual(data["heuristic_rank"]["level"], 6)
            self.assertIn("九品", " ".join(data["rank_caps"]))

    def test_summarize_evidence_filters_system_context(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            rows = [
                {
                    "source": "codex",
                    "path": "session.jsonl:1",
                    "role": "session_meta",
                    "text": "You are Codex, a coding agent based on GPT-5. Use workflow and tests.",
                },
                {
                    "source": "codex",
                    "path": "session.jsonl:2",
                    "role": "response_item",
                    "text": "# AGENTS.md instructions for /repo <INSTRUCTIONS> team playbook workflow",
                },
                {
                    "source": "codex",
                    "path": "session.jsonl:3",
                    "role": "compacted",
                    "text": "<permissions instructions> Filesystem sandboxing defines build test scope.",
                },
                {
                    "source": "codex",
                    "path": "session.jsonl:4",
                    "role": "user",
                    "text": "先给计划，验收条件是 test 通过，不要改支付模块，解释模块边界和 rollback。",
                },
            ]
            evidence.write_text(
                "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n",
                encoding="utf-8",
            )

            run_script(
                "summarize_evidence.py",
                "--input",
                str(evidence),
                "--output",
                str(summary),
            )

            data = json.loads(summary.read_text(encoding="utf-8"))
            self.assertEqual(data["record_count"], 4)
            self.assertEqual(data["analyzed_record_count"], 1)
            self.assertEqual(data["excluded_record_count"], 3)
            self.assertNotIn("workflow_asset", data["signal_counts"])
            self.assertIn("已过滤 3 条", " ".join(data["rank_caps"]))


if __name__ == "__main__":
    unittest.main()
