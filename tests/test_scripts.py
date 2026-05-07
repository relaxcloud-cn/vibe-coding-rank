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

    def test_collect_sessions_normalizes_codex_roles(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "session.jsonl"
            output = root / "evidence.jsonl"
            rows = [
                {
                    "type": "response_item",
                    "payload": {
                        "type": "message",
                        "role": "user",
                        "content": [{"type": "input_text", "text": "先给计划"}],
                    },
                },
                {
                    "type": "event_msg",
                    "payload": {"type": "agent_reasoning", "text": "internal"},
                },
                {
                    "type": "event_msg",
                    "payload": {"type": "token_count", "info": {"total_tokens": 1}},
                },
            ]
            source.write_text(
                "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n",
                encoding="utf-8",
            )

            run_script(
                "collect_sessions.py",
                "--source",
                "codex",
                "--root",
                str(root),
                "--output",
                str(output),
            )

            collected = [json.loads(line) for line in output.read_text(encoding="utf-8").splitlines()]
            self.assertEqual([row["role"] for row in collected], ["user"])

    def test_collect_sessions_marks_claude_tool_results(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "session.jsonl"
            output = root / "evidence.jsonl"
            rows = [
                {
                    "type": "user",
                    "message": {"role": "user", "content": "实现功能"},
                },
                {
                    "type": "user",
                    "toolUseResult": {"stdout": "npm test passed"},
                    "message": {"role": "user", "content": "npm test passed"},
                },
            ]
            source.write_text(
                "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n",
                encoding="utf-8",
            )

            run_script(
                "collect_sessions.py",
                "--source",
                "claude",
                "--root",
                str(root),
                "--output",
                str(output),
            )

            collected = [json.loads(line) for line in output.read_text(encoding="utf-8").splitlines()]
            self.assertEqual([row["role"] for row in collected], ["user", "tool_result"])

    def test_prepare_evidence_detects_high_order_signals_without_unlocking_eight(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            rows = [
                {
                    "source": "codex",
                    "path": "sample/session-a.jsonl:1",
                    "mtime": "2026-05-07T00:00:00",
                    "role": "user",
                    "text": "先给计划，验收条件是 build/test/lint 通过，不要改支付模块，请关注架构和模块边界。",
                },
                {
                    "source": "codex",
                    "path": "sample/session-a.jsonl:2",
                    "mtime": "2026-05-07T00:00:00",
                    "role": "assistant",
                    "text": "已运行 build、test、lint，复查 diff，并解释关键路径、rollback、日志和生产维护策略。",
                },
                {
                    "source": "codex",
                    "path": "sample/session-b.jsonl:1",
                    "mtime": "2026-05-07T00:00:00",
                    "role": "user",
                    "text": "这个模块继续 patch 没意义，重构数据模型和权限边界，用 subagent 并行 review。",
                },
                {
                    "source": "codex",
                    "path": "sample/session-b.jsonl:2",
                    "mtime": "2026-05-07T00:00:00",
                    "role": "user",
                    "text": "把这次流程沉淀成 AGENTS.md workflow 和 checklist，后续同类任务按 gate 执行。",
                },
                {
                    "source": "codex",
                    "path": "sample/session-c.jsonl:1",
                    "mtime": "2026-05-07T00:00:00",
                    "role": "user",
                    "text": "先明确非目标和验收条件，再让 reviewer agent 检查架构边界、测试覆盖和上线 rollback。",
                },
                {
                    "source": "codex",
                    "path": "sample/session-c.jsonl:2",
                    "mtime": "2026-05-07T00:00:00",
                    "role": "assistant",
                    "text": "已补充 smoke 测试、build 验证、日志监控说明，并记录 workflow 资产。",
                },
                {
                    "source": "codex",
                    "path": "sample/session-d.jsonl:1",
                    "mtime": "2026-05-07T00:00:00",
                    "role": "user",
                    "text": "团队 playbook 可以后续共享，但这次先只作为个人 workflow，不直接判团队复用。",
                },
                {
                    "source": "codex",
                    "path": "sample/session-d.jsonl:2",
                    "mtime": "2026-05-07T00:00:00",
                    "role": "assistant",
                    "text": "完成 regression test、lint、build 和关键模块边界说明。",
                },
            ]
            evidence.write_text(
                "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n",
                encoding="utf-8",
            )

            run_script(
                "prepare_evidence.py",
                "--input",
                str(evidence),
                "--output",
                str(summary),
            )

            data = json.loads(summary.read_text(encoding="utf-8"))
            self.assertGreaterEqual(data["preliminary_rank"]["level"], 6)
            self.assertLessEqual(data["preliminary_rank"]["level"], 7)
            self.assertEqual(data["judgment_mode"], "自动初筛")
            self.assertFalse(data["is_final"])
            self.assertIn("evidence_cards", data)
            self.assertEqual(len(data["dimension_profile"]), 6)
            self.assertFalse(data["unlock_status"]["level8"]["unlocked"])
            self.assertIn("九品", " ".join(data["rank_caps"]))

    def test_prepare_evidence_filters_system_context(self) -> None:
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
                "prepare_evidence.py",
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

    def test_prepare_evidence_filters_tool_results_from_scoring(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            rows = [
                {
                    "source": "claude",
                    "path": "session.jsonl:1",
                    "role": "tool_result",
                    "text": "npm test passed. build lint smoke rollback workflow architecture module boundary.",
                },
                {
                    "source": "claude",
                    "path": "session.jsonl:2",
                    "role": "user",
                    "text": "先给计划，验收条件是 test 通过。",
                },
            ]
            evidence.write_text(
                "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n",
                encoding="utf-8",
            )

            run_script(
                "prepare_evidence.py",
                "--input",
                str(evidence),
                "--output",
                str(summary),
            )

            data = json.loads(summary.read_text(encoding="utf-8"))
            self.assertEqual(data["excluded_reason_counts"]["role:tool_result"], 1)
            self.assertNotIn("architecture", data["signal_counts"])
            self.assertLessEqual(data["preliminary_rank"]["level"], 4)

    def test_prepare_evidence_caps_single_dense_record(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            evidence.write_text(
                json.dumps(
                    {
                        "source": "generic",
                        "path": "session.jsonl:1",
                        "role": "user",
                        "text": (
                            "先给计划，验收条件是 test/build/lint 通过，不要改支付模块。"
                            "请关注架构、模块边界、权限、生产 rollback、日志。"
                            "用 subagent 并行 review，沉淀 AGENTS.md workflow，团队 playbook 共享培训。"
                        ),
                    },
                    ensure_ascii=False,
                )
                + "\n",
                encoding="utf-8",
            )

            run_script(
                "prepare_evidence.py",
                "--input",
                str(evidence),
                "--output",
                str(summary),
            )

            data = json.loads(summary.read_text(encoding="utf-8"))
            self.assertLessEqual(data["preliminary_rank"]["level"], 5)
            self.assertIn("证据跨度不够", " ".join(data["rank_caps"]))
            self.assertFalse(data["unlock_status"]["level8"]["unlocked"])

    def test_summarize_wrapper_still_works(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            evidence.write_text(
                json.dumps(
                    {
                        "source": "generic",
                        "path": "session.jsonl:1",
                        "role": "user",
                        "text": "先给计划，验收条件是 test 通过，不要改支付模块。",
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
            self.assertEqual(data["analysis_version"], "0.2")


if __name__ == "__main__":
    unittest.main()
