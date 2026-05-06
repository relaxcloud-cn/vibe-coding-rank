---
name: vibe-coding-rank
description: Analyze Codex, Claude Code, or other AI coding session records to rate a developer against the Vibe Coding 九品体系. Use when the user wants evidence-based AI coding ability assessment from real transcripts, logs, repo instructions, or agent workflow traces rather than a self-report questionnaire.
---

# Vibe Coding Rank

Use this skill to evaluate a developer's real AI collaboration behavior.

Core thesis:

> 强者不是“会写代码的人”，而是“能在不亲手写每一行代码的情况下，仍然拥有系统结果的人”。

## Safety

- Treat raw transcripts as private.
- Do not paste long raw logs into the final answer.
- Redact secrets before summarizing.
- Prefer short evidence snippets with file/session references.
- If logs may contain customer data, source code, tokens, or private business context, summarize locally first.

## Workflow

Resolve script paths relative to this skill directory. If needed, set `SKILL_DIR`
to the directory that contains this `SKILL.md`.

1. Collect session evidence locally:

```bash
python3 "$SKILL_DIR/scripts/collect_sessions.py" \
  --source codex \
  --root "$HOME/.codex/sessions" \
  --output /tmp/airank-codex-evidence.jsonl
```

For Claude Code:

```bash
python3 "$SKILL_DIR/scripts/collect_sessions.py" \
  --source claude \
  --root "$HOME/.claude/projects" \
  --output /tmp/airank-claude-evidence.jsonl
```

2. Summarize evidence:

```bash
python3 "$SKILL_DIR/scripts/summarize_evidence.py" \
  --input /tmp/airank-codex-evidence.jsonl \
  --output /tmp/airank-vibe-summary.json
```

3. Read the relevant references:

- `references/vibe-coding-rank.md` for the rank model.
- `references/evidence-rubric.md` for signal interpretation.
- `references/output-schema.md` for the expected report shape.

4. Produce a concise report:

- Final rank.
- Confidence level.
- Evidence that supports the rank.
- Evidence that caps the rank.
- Next-rank upgrade path.

## Ranking Rules

- Rank by observed behavior, not claimed intent.
- If evidence is thin, say so and lower confidence.
- Do not assign 八品 or 九品 from private logs alone unless there is clear team-level or public paradigm-level evidence.
- Distinguish generation from ownership:
  - 五品/六品 can generate and shape.
  - 七品 and above must show system ownership.
  - 八品 must show transfer of method to others.
  - 九品 requires paradigm-level influence.

## Default Output

Use this structure:

```json
{
  "rank": "五品 · 炉火纯青",
  "score": 72,
  "confidence": "medium",
  "system_ownership": "strong",
  "evidence": [],
  "rank_caps": [],
  "next_rank": "六品 · 已有大成",
  "upgrade_path": []
}
```
