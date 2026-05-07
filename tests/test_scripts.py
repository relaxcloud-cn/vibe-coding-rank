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


def gate_by_id(data: dict, gate_id: str) -> dict:
    for item in data.get("rank_gates", []):
        if item.get("id") == gate_id:
            return item
    raise AssertionError(f"missing rank gate: {gate_id}")


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
                    "payload": {
                        "type": "token_count",
                        "info": {
                            "last_token_usage": {
                                "input_tokens": 10,
                                "cached_input_tokens": 5,
                                "output_tokens": 2,
                                "reasoning_output_tokens": 1,
                                "total_tokens": 18,
                            }
                        },
                    },
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
            self.assertEqual([row["role"] for row in collected], ["user", "usage_stats"])
            self.assertEqual(collected[1]["usage"]["total_tokens"], 18)

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
            first_card = data["evidence_cards"][0]
            self.assertIn(first_card["behavior_class"], {"user_decision", "assistant_execution"})
            self.assertIn("behavior_class_label", first_card)
            self.assertEqual(len(data["dimension_profile"]), 6)
            self.assertGreater(data["hard_stats"]["user_decision_count"], 0)
            self.assertIn("user_decision", data["hard_stats"]["behavior_counts"])
            self.assertIn("assistant_execution", data["hard_stats"]["behavior_counts"])
            self.assertGreater(data["hard_stats"]["promotion_user_decision_ratio"], 0)
            self.assertGreater(data["hard_stats"]["promotion_assistant_execution_ratio"], 0)
            self.assertLessEqual(data["hard_stats"]["promotion_record_count"], data["hard_stats"]["promotion_evidence_count"])
            self.assertGreaterEqual(data["hard_stats"]["average_promotion_signals_per_record"], 1)
            self.assertIn("rank_gates", data)
            self.assertTrue(gate_by_id(data, "level6_user_decision_ratio")["passed"])
            self.assertTrue(gate_by_id(data, "level7_user_decision_ratio")["passed"])
            self.assertFalse(gate_by_id(data, "level9_public_influence")["passed"])
            self.assertFalse(data["unlock_status"]["level8"]["unlocked"])
            self.assertIn("九品", " ".join(data["rank_caps"]))

    def test_prepare_evidence_reports_drag_factors_for_weak_signal_heavy_logs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            rows = []
            for index in range(8):
                rows.append(
                    {
                        "source": "generic",
                        "path": f"session.jsonl:{index + 1}",
                        "role": "user",
                        "text": "做一个 demo 页面，原型先跑起来，继续修 bug，还是不对，再修一下。",
                    }
                )
            rows.append(
                {
                    "source": "generic",
                    "path": "session.jsonl:20",
                    "role": "user",
                    "text": "先给计划，验收条件是 test 通过，不要改支付模块。",
                }
            )
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
            factor_ids = {item["id"] for item in data["drag_factors"]}
            self.assertIn("weak_signal_heavy", factor_ids)
            self.assertIn("bug_loop_heavy", factor_ids)
            self.assertIn("demo_heavy", factor_ids)

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
            self.assertIn("已排除 3 条非评分记录", " ".join(data["rank_caps"]))

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

    def test_prepare_evidence_filters_tool_event_roles_from_scoring(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            rows = [
                {
                    "source": "codex",
                    "path": "session.jsonl:1",
                    "role": "exec_command_end",
                    "text": "npm test passed build lint workflow architecture rollback module boundary.",
                },
                {
                    "source": "codex",
                    "path": "session.jsonl:2",
                    "role": "patch_apply_end",
                    "text": "Success. Updated AGENTS.md workflow checklist and production rollback docs.",
                },
                {
                    "source": "codex",
                    "path": "session.jsonl:3",
                    "role": "web_search_call",
                    "text": "Cloudflare deployment architecture build test docs.",
                },
                {
                    "source": "codex",
                    "path": "session.jsonl:4",
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
            self.assertEqual(data["excluded_record_count"], 3)
            self.assertEqual(data["hard_stats"]["tool_event_record_count"], 3)
            self.assertEqual(data["hard_stats"]["context_excluded_record_count"], 0)
            self.assertEqual(data["excluded_reason_counts"]["role:exec_command_end"], 1)
            self.assertEqual(data["excluded_reason_counts"]["role:patch_apply_end"], 1)
            self.assertEqual(data["excluded_reason_counts"]["role:web_search_call"], 1)
            self.assertNotIn("architecture", data["signal_counts"])
            self.assertNotIn("workflow_asset", data["signal_counts"])
            self.assertLessEqual(data["preliminary_rank"]["level"], 4)

    def test_prepare_evidence_reports_usage_stats_without_scoring(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            rows = [
                {
                    "source": "codex",
                    "path": "session-a.jsonl:1",
                    "mtime": "2026-05-07T10:00:00",
                    "role": "usage_stats",
                    "text": json.dumps({"total_tokens": 100, "input_tokens": 80, "output_tokens": 20}),
                    "usage": {"total_tokens": 100, "input_tokens": 80, "output_tokens": 20},
                },
                {
                    "source": "codex",
                    "path": "session-b.jsonl:1",
                    "mtime": "2026-05-08T10:00:00",
                    "role": "usage_stats",
                    "text": json.dumps({"total_tokens": 300, "input_tokens": 250, "output_tokens": 50}),
                    "usage": {"total_tokens": 300, "input_tokens": 250, "output_tokens": 50},
                },
                {
                    "source": "codex",
                    "path": "session-b.jsonl:2",
                    "mtime": "2026-05-08T10:00:00",
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
            self.assertEqual(data["usage_stats"]["total_tokens"], 400)
            self.assertEqual(data["usage_stats"]["peak_day"], "2026-05-08")
            self.assertEqual(data["usage_stats"]["peak_day_tokens"], 300)
            self.assertEqual(data["usage_stats"]["active_span_days"], 2)
            self.assertEqual(data["usage_stats"]["average_day_tokens"], 200)
            self.assertEqual(data["usage_stats"]["average_session_tokens"], 200)
            self.assertEqual(data["usage_stats"]["peak_day_token_share"], 0.75)
            self.assertEqual(data["hard_stats"]["total_tokens"], 400)
            self.assertEqual(data["hard_stats"]["usage_record_count"], 2)
            self.assertEqual(data["hard_stats"]["non_scoring_record_count"], 2)
            self.assertEqual(data["hard_stats"]["non_scoring_record_ratio"], 0.6667)
            self.assertEqual(data["hard_stats"]["scoring_candidate_record_count"], 1)
            self.assertEqual(data["hard_stats"]["scorable_record_ratio"], 1.0)
            self.assertEqual(data["hard_stats"]["active_span_days"], 2)
            self.assertEqual(data["hard_stats"]["evidence_span_days"], 1)
            self.assertEqual(data["hard_stats"]["signal_type_count"], 3)
            self.assertAlmostEqual(data["hard_stats"]["dominant_signal_ratio"], 0.3333)
            self.assertEqual(data["hard_stats"]["validation_count"], 1)
            self.assertEqual(data["hard_stats"]["validation_density"], 1.0)
            self.assertEqual(data["hard_stats"]["strong_record_density"], 1.0)
            self.assertEqual(data["hard_stats"]["bug_loop_density"], 0)
            self.assertEqual(data["hard_stats"]["tool_event_record_ratio"], 0)
            self.assertEqual(data["hard_stats"]["established_dimension_count"], 0)
            self.assertEqual(data["excluded_reason_counts"]["role:usage_stats"], 2)
            self.assertIn("quality_flags", data)
            self.assertTrue(any(item["id"] == "peak_day_concentrated" for item in data["quality_flags"]))
            self.assertIn("drag_factors", data)
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

    def test_prepare_evidence_caps_assistant_heavy_high_rank(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            rows = []
            for session in range(1, 5):
                rows.append(
                    {
                        "source": "codex",
                        "path": f"session-{session}.jsonl:1",
                        "mtime": f"2026-05-0{session}T10:00:00",
                        "role": "user",
                        "text": "实现功能，先给计划，验收条件是 test 通过。",
                    }
                )
                for index in range(30):
                    rows.append(
                        {
                            "source": "codex",
                            "path": f"session-{session}.jsonl:{index + 2}",
                            "mtime": f"2026-05-0{session}T10:00:00",
                            "role": "assistant",
                            "text": (
                                "已完成架构模块边界、权限、数据模型、rollback、日志、生产维护、"
                                "build、test、lint、回归验证，并沉淀 workflow checklist。"
                            ),
                        }
                    )
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
            self.assertLessEqual(data["preliminary_rank"]["level"], 5)
            self.assertLess(data["hard_stats"]["user_control_ratio"], 0.05)
            self.assertGreater(data["hard_stats"]["promotion_assistant_execution_ratio"], 0.9)
            self.assertFalse(gate_by_id(data, "level6_user_control_ratio")["passed"])
            self.assertFalse(gate_by_id(data, "level7_user_control_ratio")["passed"])
            self.assertIn("用户主动控制", " ".join(data["rank_caps"]))
            self.assertTrue(any(item["id"] == "low_user_control" for item in data["quality_flags"]))
            self.assertTrue(any(item["id"] == "assistant_execution_heavy" for item in data["quality_flags"]))

    def test_prepare_evidence_caps_instruction_heavy_without_decisions(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.jsonl"
            summary = root / "summary.json"
            rows = []
            for session in range(1, 5):
                for index in range(16):
                    rows.append(
                        {
                            "source": "claude",
                            "path": f"session-{session}.jsonl:{index + 1}",
                            "mtime": f"2026-05-0{session}T10:00:00",
                            "role": "user",
                            "text": (
                                "继续处理这个功能，修一下 bug，跑 test/build/lint。"
                            ),
                        }
                    )
                rows.append(
                    {
                        "source": "claude",
                        "path": f"session-{session}.jsonl:assistant",
                        "mtime": f"2026-05-0{session}T10:00:00",
                        "role": "assistant",
                        "text": (
                            "已完成架构模块边界、权限、数据模型、rollback、日志、生产维护、"
                            "build、test、lint、回归验证，并用 subagent reviewer 复查。"
                        ),
                    }
                )
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
            self.assertLessEqual(data["preliminary_rank"]["level"], 5)
            self.assertGreater(data["hard_stats"]["user_control_ratio"], 0.7)
            self.assertGreater(data["hard_stats"]["user_control_signal_ratio"], 0.7)
            self.assertLess(data["hard_stats"]["promotion_user_decision_ratio"], 0.03)
            self.assertFalse(gate_by_id(data, "level6_user_decision_ratio")["passed"])
            self.assertFalse(gate_by_id(data, "level7_user_decision_ratio")["passed"])
            self.assertIn("用户决策证据", " ".join(data["rank_caps"]))
            self.assertTrue(any(item["id"] == "low_user_decision" for item in data["quality_flags"]))

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
