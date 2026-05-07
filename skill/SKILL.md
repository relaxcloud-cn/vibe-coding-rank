---
name: vibe-coding-rank
description: Analyze Codex, Claude Code, or other AI coding session records to rate a developer against the Vibe Coding 九品体系. Use when the user wants a Chinese, evidence-based AI coding ability assessment from real transcripts, logs, repo instructions, or agent workflow traces rather than a self-report questionnaire.
---

# Vibe Coding Rank

Use this skill to evaluate a developer's real AI collaboration behavior. Output in Chinese unless the user explicitly asks otherwise.

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

2. Prepare behavior evidence:

```bash
python3 "$SKILL_DIR/scripts/prepare_evidence.py" \
  --input /tmp/airank-codex-evidence.jsonl \
  --output /tmp/airank-vibe-summary.json
```

The script only performs local cleaning, evidence classification, and conservative auto pre-screening. It must not be treated as the final high-rank judge.

3. Read the relevant references:

- `references/vibe-coding-rank.md` for the rank model.
- `references/evidence-rubric.md` for the evidence judgment rules.
- `references/judgment-process.md` for the final AI judging procedure.
- `references/output-schema.md` for the expected report shape.
- `references/report-template.md` for the Chinese human-facing report.
- `references/image-report-prompt.md` when the user asks for a share image or image report.

4. Judge from evidence cards, not from raw word hits:

- Treat `evidence_cards` as candidate behavior evidence.
- Treat `weak_signals` as usage clues, not promotion evidence.
- Treat `usage_stats` and `hard_stats` as objective usage/sample-quality facts, not promotion evidence.
- Use `hardStatCards` to explain objective stats to users: token volume, optional cost estimate, effective sample ratio, strong-record density, validation density, rework pressure, user control, and user decision ratio. Do not turn token volume or cost into a rank boost.
- Treat `costEstimate` as optional and user-priced; if no token price was provided, say the report only measures token intensity, not dollars.
- Use `qualityFlags` to surface sample or judgment risks such as low user control, low user decision ratio, assistant-heavy evidence, or token concentration.
- Use `dragFactors` to explain behaviors dragging the rank down, especially bug loops, demo-heavy work, snippet-heavy work, weak-signal-heavy logs, or thin strong records.
- Prefer `gateUpgradeAdvice` for the next step because it is tied to the first failed rank gate above the current rank.
- If the CLI report contains `judgePrompt`, use it as the first draft for AI deep judgment because it is already sanitized and aligned with the rank gates.
- Use `rank_caps` and `unlock_status` before assigning a high rank.
- 八品 requires proof that the method was used by others or became a team mechanism.
- 九品 requires public paradigm-level influence, not just private logs.

5. Produce a Chinese rank report:

- 一句话判定。
- 为什么是这个段位。
- 为什么还不是下一品。
- 最强证据链。
- 段位封顶原因。
- 下一品升级路线。
- 证据质量说明。

6. If the user asks for a 图片报告, 海报, 朋友圈图, or share image, generate it with Imagen/imagegen:

- Use only sanitized report facts: rank, score, confidence, top signal summaries, rank caps, and next step.
- Do not include raw transcript snippets, local file paths, session IDs, customer data, source code, tokens, or secrets.
- Keep Chinese copy short and large enough to read.
- If a CLI report contains `shareImagePrompt`, use it as the first draft because it is already sanitized for image generation.
- The report site also exposes a "复制图片报告提示词" button for the same sanitized prompt.
- Use `references/image-report-prompt.md` as the prompt template.

## Ranking Rules

- Rank by observed behavior, not claimed intent.
- Exclude system prompts, developer instructions, AGENTS auto-injected context, tool policies, environment context, and compacted conversation summaries from scoring.
- If evidence is thin, say so and lower confidence.
- Do not assign 八品 or 九品 from private logs alone unless there is clear team-level or public paradigm-level evidence.
- The CLI result is an 自动初筛 unless an AI judge reads the evidence cards and produces the final report.
- Deep judgment must explicitly say whether it maintains, upgrades, or downgrades the auto pre-screen result.
- Do not assign 六品以上 from a single record or single session; high ranks require evidence span across multiple records, sessions, projects, or repeated workflows.
- Distinguish generation from ownership:
  - 五品/六品 can generate and shape.
  - 七品 and above must show system ownership.
  - 八品 must show transfer of method to others.
  - 九品 requires paradigm-level influence.

## Default Output

Use this structure in Chinese:

```json
{
  "rank": "五品 · 炉火纯青",
  "one_line_verdict": "你已经开始用架构和验收标准拥有系统，但闭环还没有稳定到六品。",
  "why_this_rank": "...",
  "why_not_next_rank": "...",
  "strongest_evidence": [],
  "rank_caps": [],
  "next_rank": "六品 · 已有大成",
  "upgrade_path": []
}
```
