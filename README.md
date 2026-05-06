# Vibe Coding Rank

<p align="center">
  <img src="./assets/vibe-coding-rank-rank-map.png" alt="Vibe Coding 九品体系介绍图" width="100%">
</p>

一个用真实 AI 编程记录来评估开发者 **Vibe Coding 段位** 的 Codex skill，也是一套面向 Airank 的 AI 工作能力产品原型。

> 强者不是“会写代码的人”，而是“能在不亲手写每一行代码的情况下，仍然拥有系统结果的人”。

## 一条命令

```bash
npx github:relaxcloud-cn/vibe-coding-rank --source codex --open
```

它会在本地读取 Codex 会话记录，生成脱敏后的证据摘要，并打开一个可以分享的云端报告链接。

Claude Code：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --source claude --open
```

先看样例：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --demo --open
```

## 为什么做这个

AI 编程能力不应该只靠自评，也不应该只问“你平时用什么工具”“一天烧多少 token”“会不会写 prompt”。

这些问题有传播性，但它们只能描述使用习惯，不能证明一个人是否真的能把 AI 放进工作系统里。

Vibe Coding Rank 想测的是更深的一层：

- 你是否能把模糊目标变成 AI 可执行的产品和工程任务。
- 你是否能控制 AI 的工作边界，而不是让它无限改代码。
- 你是否能判断什么时候该 patch，什么时候该重构。
- 你是否会验证 AI 输出，而不是只看“能不能跑”。
- 你是否能把一次成功协作沉淀成可复用的 workflow、rules、skill 或团队方法。

一句话：**这套体系测的不是你会不会用 AI，而是系统到底是不是你的。**

## 用户会得到什么

用户不是拿到一个冷冰冰的分数，而是拿到一份能分享、能复盘、能升级的报告：

- 我的 Vibe Coding 段位是什么。
- 哪些真实记录支撑了这个段位。
- 哪些证据缺口限制了我的上限。
- 我离下一品差什么。
- 我该把哪些行为沉淀成 workflow、rules、skill 或团队 playbook。

## 它怎么评

这个 skill 会读取 Codex、Claude Code 或通用 AI 编程会话记录，先在本地提取和脱敏证据，再按照九品体系生成评级报告。

它不看你怎么包装自己，只看真实记录里有没有这些行为：

- 目标定义、非目标、验收标准
- 文件范围、模块边界、架构判断
- 测试、构建、lint、截图验证、smoke check
- bug 循环中的根因分析和边界重设
- 多 agent 分工、review gate、检查点
- AGENTS.md、CLAUDE.md、rules、skills、workflow、playbook
- 团队级方法复制和公开影响证据

## Vibe Coding 九品体系

| 《庆余年》层级 | Vibe Coding 品级 | 一句话要义 |
|:---|:---|:---|
| 未入门 | **零品 · 门外汉** | 尚未入场。 |
| 四品 | **一品 · 初识真气** | 能用 AI 生成代码片段，但系统是 AI 的，不是你的。 |
| 五品 | **二品 · 初窥门径** | 能拼凑出能跑的 Demo，但控制不了结果，系统还是 AI 的。 |
| 六品 | **三品 · 小有所成** | 能交付功能，但精力耗在修 bug 循环里，系统是拼凑出来的。 |
| 七品 | **四品 · 登堂入室** | 开始用架构和验收标准约束 AI；系统开始是你的。 |
| 八品 | **五品 · 炉火纯青** | 以产品目标驱动 AI；用护栏和检查点控制交付，系统是你的。 |
| 八品顶尖 | **六品 · 已有大成** | 定义问题、设计系统、驱动交付形成闭环；跨领域也能快速建立控制力。 |
| 九品 | **七品 · 已臻化境** | 手段完全透明，注意力只在系统和结果上。AI 是你的延伸。 |
| 九品上 | **八品 · 半步宗师** | 把“拥有系统”的方法论体系化，让团队也能做到。 |
| 大宗师 | **九品 · 大宗师** | 定义人与 AI 的协作范式，重塑行业对“拥有系统”的理解。 |

## 核心分界

一至三品：能让 AI 写代码，但系统归属不稳。典型证据是代码片段、demo、功能交付和反复修 bug。

四至六品：开始真正拥有系统。典型证据是目标定义、边界控制、验收标准、架构判断和交付闭环。

七品：个人能力顶点。工具和代码细节变得透明，注意力集中在系统目标、质量、演进和结果责任上。

八品：方法论可复制。你不只是自己会用 AI，而是能让团队也进入同一套协作范式。

九品：范式创造者。需要公开影响或行业级创造证据，不能只靠私有会话自动判定。

## 输出是什么

一次完整分析会输出：

- 最终段位
- 置信度
- 系统归属判断
- 支撑该段位的证据
- 限制段位上限的证据缺口
- 下一品升级路径

示例结构：

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

## 适合谁

- 想知道自己 AI 编程真实水平的开发者
- 想把 Codex / Claude Code 使用记录变成能力报告的人
- 想做 AI-native 工程能力评估的团队
- 想把 Airank 做成“AI 工作能力评级体系”的产品团队

## 本地取证，云端报告

默认模式不上传原始日志。CLI 只把最终报告编码到 URL hash 里，云端页面负责展示：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --source codex --site https://vibe.yisec.com --open
```

如果你部署了 Cloudflare Worker 和 KV，可以开启短链接上传：

```bash
npx github:relaxcloud-cn/vibe-coding-rank \
  --source codex \
  --upload-url https://vibe.yisec.com \
  --open
```

部署配置在 `wrangler.toml`。默认子域名占位为 `vibe.yisec.com`，上线前把 Cloudflare KV namespace id 替换掉即可。

## 作为 Codex skill 使用

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

然后让 Codex 使用 `$vibe-coding-rank`，读取摘要和 `references/` 中的评级规则，生成最终报告。

## 安装到 Codex

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R . "${CODEX_HOME:-$HOME/.codex}/skills/vibe-coding-rank"
```

调用示例：

```text
Use $vibe-coding-rank to analyze my local Codex sessions and produce a Vibe Coding rank report.
```

## 项目结构

```text
.
├── SKILL.md                         # Codex 读取的 skill 入口
├── agents/openai.yaml               # UI 元信息
├── assets/                          # README 和产品展示图
├── cli/vibe-rank.mjs                # npx 一条命令入口
├── docs/LAUNCH_PLAYBOOK.md          # 宣传运营打法
├── references/
│   ├── vibe-coding-rank.md          # 九品体系
│   ├── evidence-rubric.md           # 证据解释规则
│   └── output-schema.md             # 报告输出结构
├── scripts/
│   ├── collect_sessions.py          # 提取并脱敏会话证据
│   └── summarize_evidence.py        # 生成启发式证据摘要
├── site/                            # 云端报告展示页
├── worker/index.js                  # Cloudflare Worker API
└── tests/test_scripts.py            # 脚本回归测试
```

## 隐私原则

原始会话记录可能包含源码、客户信息、业务上下文或 token。默认流程会先在本地提取和脱敏，再生成摘要。

不要把这些文件提交到公开仓库：

- `*-evidence.jsonl`
- `*-summary.json`
- `runs/`
- `reports/`

## 测试

```bash
npm run check
```

核心脚本只使用 Python / Node 标准库，没有额外运行时依赖。
