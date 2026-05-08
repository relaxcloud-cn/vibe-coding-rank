# Infographic Prompt

Use this reference when a user asks Codex to turn a Vibe Coding rank report into an infographic.

## Generation Rule

Generate a raster infographic with Codex image generation / `imagegen`, using a model path such as `gpt-image-2`.

Do not implement the infographic as HTML, SVG, Mermaid, canvas, or CSS. The goal is a generated bitmap visual, not repo-native code.

If the runtime exposes model selection, choose `gpt-image-2`. If model selection is not exposed, use the built-in image generation path and say that the exact underlying model is not directly selectable.

## Prompt Template

Replace bracketed fields with the final report values. Keep raw transcript details out of the prompt.

```text
Use case: infographic-diagram
Asset type: high-resolution Chinese infographic for sharing in chat and reports
Model requirement: use a raster image generation model such as gpt-image-2; do not create HTML, SVG, Mermaid, canvas, or code-rendered graphics.

Primary request:
Create a polished Chinese infographic summarizing a Vibe Coding rank assessment.

Canvas:
Vertical poster, 4:5 aspect ratio, crisp readable Chinese text, professional product-report style, clean editorial layout.

Visual concept:
Show a central rank badge: "[RANK]" with score "[SCORE]/100".
Use a structured hierarchy: top conclusion, evidence pillars, rank boundary, upgrade path.
The visual should feel like an AI engineering capability report, not a game poster and not a marketing landing page.

Main title:
Vibe Coding 能力评级

Subtitle:
系统是否属于你，而不是 AI

Key conclusion:
[ONE_SENTENCE_CONCLUSION]

Core metrics:
- 等级: [RANK]
- 分数: [SCORE]/100
- 置信度: [CONFIDENCE]
- 系统拥有感: [SYSTEM_OWNERSHIP]
- 方法复制度: [TEAM_REPLICATION]

Evidence pillars:
1. 目标与边界: [BOUNDARY_EVIDENCE]
2. 验证闭环: [VALIDATION_EVIDENCE]
3. 架构判断: [ARCHITECTURE_EVIDENCE]
4. 方法沉淀: [WORKFLOW_EVIDENCE]

Rank cap:
[RANK_CAP]

Next-rank path:
- [UPGRADE_STEP_1]
- [UPGRADE_STEP_2]
- [UPGRADE_STEP_3]

Design direction:
Use a restrained, high-contrast palette with deep charcoal, off-white, electric cyan accents, and one warm amber highlight.
Use thin dividers, compact cards, clean data-report typography, and subtle geometric grid details.
Keep the layout information-dense but readable.

Text constraints:
All visible text must be Chinese except "Vibe Coding".
Do not include raw logs, usernames, file paths, API keys, customer names, or private source snippets.
Avoid tiny paragraphs. Use short phrases that remain legible.

Avoid:
No HTML, no SVG, no code screenshot, no terminal screenshot, no fake charts with unreadable labels, no stock photo background, no fantasy or martial arts imagery.
```

## Example Filled Prompt

```text
Use case: infographic-diagram
Asset type: high-resolution Chinese infographic for sharing in chat and reports
Model requirement: use a raster image generation model such as gpt-image-2; do not create HTML, SVG, Mermaid, canvas, or code-rendered graphics.

Primary request:
Create a polished Chinese infographic summarizing a Vibe Coding rank assessment.

Canvas:
Vertical poster, 4:5 aspect ratio, crisp readable Chinese text, professional product-report style, clean editorial layout.

Visual concept:
Show a central rank badge: "八品 · 半步宗师" with score "92/100".
Use a structured hierarchy: top conclusion, evidence pillars, rank boundary, upgrade path.
The visual should feel like an AI engineering capability report, not a game poster and not a marketing landing page.

Main title:
Vibe Coding 能力评级

Subtitle:
系统是否属于你，而不是 AI

Key conclusion:
已经把 AI 协作方法产品化、流程化、组织化，但尚未证明公开范式影响。

Core metrics:
- 等级: 八品 · 半步宗师
- 分数: 92/100
- 置信度: high
- 系统拥有感: exceptional
- 方法复制度: strong

Evidence pillars:
1. 目标与边界: 明确范围、约束、验收条件和不可触碰模块
2. 验证闭环: 测试、构建、diff check、浏览器验证和生产报告
3. 架构判断: 区分产品层、运行时层、场景仓库和安全设备边界
4. 方法沉淀: Skill、Routine、Memory、报告模板和场景包流程

Rank cap:
九品需要公开范式影响，不能仅凭私有组织记录判定。

Next-rank path:
- 发布可复用 playbook 和样例评测集
- 收集跨团队复用证据
- 形成公开 benchmark 或行业方法论

Design direction:
Use a restrained, high-contrast palette with deep charcoal, off-white, electric cyan accents, and one warm amber highlight.
Use thin dividers, compact cards, clean data-report typography, and subtle geometric grid details.
Keep the layout information-dense but readable.

Text constraints:
All visible text must be Chinese except "Vibe Coding".
Do not include raw logs, usernames, file paths, API keys, customer names, or private source snippets.
Avoid tiny paragraphs. Use short phrases that remain legible.

Avoid:
No HTML, no SVG, no code screenshot, no terminal screenshot, no fake charts with unreadable labels, no stock photo background, no fantasy or martial arts imagery.
```
