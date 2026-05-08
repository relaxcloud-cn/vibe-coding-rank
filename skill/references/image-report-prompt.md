# Image Report Prompt

Use this template when the user asks for a shareable image report.

Do not include raw transcripts, local file paths, session IDs, secrets, customer names, source code, or private business details. Only use sanitized conclusions from the report.

```text
Create a premium Chinese AI ability report poster for Airank Vibe Coding Rank.

Format:
- 4:5 vertical social-share image.
- Dark blue and green product-report style.
- Clean dashboard composition, high contrast, professional, sharp typography.
- No QR code unless a public URL is provided.
- No raw logs, no local paths, no code snippets.

Exact Chinese text to include:
标题：Vibe Coding 九品报告
主评级：{rank_label}
分数：{score}/100
置信度：{confidence}
系统归属：{system_ownership}
核心问题：这系统是你的，还是 AI 的？

证据摘要：
1. {evidence_summary_1}
2. {evidence_summary_2}
3. {evidence_summary_3}

评级限制：
{rank_cap}

下一段位：
{next_rank_label}
{upgrade_path}

Footer:
Airank · 3 分钟测出你的 AI 段位

Visual direction:
- Make the rank label the largest element.
- Show score as a strong numeric badge.
- Use small signal bars for 架构, 验证, 工作流, 归属感, 团队复制.
- Use subtle geometric grid lines and product UI panels.
- Keep all text readable and uncluttered.
```

If the report has `excluded_record_count`, add this short note as a small quality badge:

```text
已排除 {excluded_record_count} 条非评分记录，评分只看真实工作证据
```
