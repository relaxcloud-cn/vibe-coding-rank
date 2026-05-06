# Vibe Coding Rank Skill

一个用于分析真实 AI 编程会话记录的 Codex skill。它会从 Codex、Claude Code 或通用日志中提取证据，再按照 **Vibe Coding 九品体系**生成基于证据的能力评级报告。

核心命题：

> 强者不是“会写代码的人”，而是“能在不亲手写每一行代码的情况下，仍然拥有系统结果的人”。

## 这个项目是什么

这个 skill 不是自评问卷，也不是问你会不会使用某个 AI 工具。它关注真实工作痕迹：

- 你是否会定义目标、边界、非目标和验收标准。
- 你是否能让 AI 进入可控的工程流程，而不是无限修 bug。
- 你是否会验证 AI 输出，包括测试、构建、diff review、截图或 smoke check。
- 你是否能从局部代码生成上升到系统设计、产品判断和工作流复用。
- 你是否把个人方法沉淀成 rules、skills、playbook 或团队流程。

## 目录结构

```text
.
├── SKILL.md                         # Codex 读取的 skill 入口
├── agents/openai.yaml               # UI 元信息
├── references/
│   ├── vibe-coding-rank.md          # 九品体系
│   ├── evidence-rubric.md           # 证据解释规则
│   ├── output-schema.md             # 报告输出结构
│   └── infographic-prompt.md        # imagegen 信息图提示词模板
├── scripts/
│   ├── collect_sessions.py          # 提取并脱敏会话证据
│   └── summarize_evidence.py        # 生成启发式证据摘要
└── tests/test_scripts.py            # 脚本回归测试
```

## 快速使用

在本目录下运行：

```bash
python3 scripts/collect_sessions.py \
  --source codex \
  --root "$HOME/.codex/sessions" \
  --since 2026-02-01 \
  --output /tmp/airank-codex-evidence.jsonl

python3 scripts/summarize_evidence.py \
  --input /tmp/airank-codex-evidence.jsonl \
  --output /tmp/airank-vibe-summary.json
```

Claude Code：

```bash
python3 scripts/collect_sessions.py \
  --source claude \
  --root "$HOME/.claude/projects" \
  --output /tmp/airank-claude-evidence.jsonl
```

之后让 Codex 使用 `$vibe-coding-rank`，读取摘要和 `references/` 中的评级规则，生成最终报告。

如果要生成信息图，让 Codex 继续读取 `references/infographic-prompt.md`，并使用 imagegen / `gpt-image-2` 这类位图生图模型生成。不要让 Codex 写 HTML、SVG、Mermaid、canvas 或 CSS 来伪造信息图。

## 安装到 Codex

如果你的 `CODEX_HOME` 没有特殊配置，默认是 `~/.codex`：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R . "${CODEX_HOME:-$HOME/.codex}/skills/vibe-coding-rank"
```

安装后可以这样调用：

```text
Use $vibe-coding-rank to analyze my local Codex sessions and produce a Vibe Coding rank report.
```

## 评级边界

默认只根据可观察证据评级：

- 私有 Codex/Claude 记录通常最高只能稳定证明到七品。
- 八品需要团队级方法复制证据，例如 playbook、共享 rules、workflow、培训或团队落地记录。
- 九品需要公开范式影响证据，不能仅凭个人日志自动判定。

## 隐私原则

原始会话记录可能包含源码、客户信息、业务上下文或 token。默认流程会先在本地提取和脱敏，再生成摘要。不要把 `*-evidence.jsonl`、`*-summary.json`、`runs/` 或 `reports/` 提交到公开仓库。

## 测试

```bash
python3 -m unittest discover -s tests
```

脚本只使用 Python 标准库，没有额外依赖。
