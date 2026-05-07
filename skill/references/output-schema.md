# Output Schema

Return a concise JSON-like report plus a short human explanation.

```json
{
  "rank": "五品 · 炉火纯青",
  "score": 72,
  "confidence": "medium",
  "system_ownership": "weak | emerging | strong | exceptional",
  "record_count": 128,
  "analyzed_record_count": 120,
  "excluded_record_count": 8,
  "excluded_reason_counts": {
    "agents_context": 5,
    "codex_system_prompt": 3
  },
  "evidence": [
    {
      "signal": "context_boundary",
      "summary": "Defines non-goals and file scope before asking AI to edit.",
      "source": "codex:2026-05-07/session.jsonl",
      "snippet": "Implement this story, do not touch billing..."
    }
  ],
  "rank_caps": [
    {
      "cap": "No team-level replication evidence, so do not assign 八品.",
      "missing_evidence": "shared playbook, team workflow, reusable evals"
    }
  ],
  "next_rank": "六品 · 已有大成",
  "upgrade_path": [
    "Turn repeated review behavior into a reusable project rule.",
    "Add explicit gates for build, test, smoke check, and rollback.",
    "Record when patching should stop and redesign should begin."
  ]
}
```

## Human Summary

After the JSON-like block, add 3-5 sentences:

- Why this rank, in plain language.
- The strongest evidence.
- The main cap.
- One concrete next step.
