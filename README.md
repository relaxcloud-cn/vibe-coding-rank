# Vibe Coding Rank

<p align="center">
  <img src="./assets/vibe-coding-rank-rank-map.png" alt="Vibe Coding 九品体系介绍图" width="100%">
</p>

一个用真实 AI 编程记录来评估开发者 **Vibe Coding 段位** 的 Codex skill，也是一套面向 Airank 的 AI 工作能力产品原型。

> 强者不是“会写代码的人”，而是“能在不亲手写每一行代码的情况下，仍然拥有系统结果的人”。

## 一条命令

```bash
npx github:relaxcloud-cn/vibe-coding-rank --open
```

它会自动探测本机 Codex 和 Claude Code 会话记录：如果两个来源都存在，就融合分析；如果只探测到一个，就只分析这个来源。CLI 会生成完整报告，启动本机报告服务，并打开 `http://127.0.0.1:4173/report/<id>`。默认不会上传公网。

只扫描 Codex：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --source codex --open
```

只扫描 Claude Code：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --source claude --open
```

显式融合 Codex 和 Claude Code：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --source codex,claude --open
```

先看样例：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --demo --open
```

检查本机是否能读取默认记录路径：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --doctor
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

这个 skill 会读取 Codex 和 Claude Code 会话记录，先在本地提取和脱敏证据，再按照九品体系生成评级报告。

现在的判定链路分三步：

```text
原始日志 -> 证据清洗和行为证据卡 -> 自动初筛/AI 深度判定 -> 中文段位报告
```

脚本不再直接充当高段位裁判。它负责把真实记录整理成行为证据卡，标出强证据、弱信号、封顶原因和高段位锁。CLI 默认输出的是 **自动初筛**，用于快速预览；八品和九品必须看更强证据，不能靠信号数量堆出来。

高段位还要看证据跨度：单条记录里写得再完整，也只能算候选证据。六品以上需要跨多次会话、多条强证据反复成立。

它不看你怎么包装自己，只看真实记录里有没有这些行为：

- 目标定义、非目标、验收标准
- 文件范围、模块边界、架构判断
- 测试、构建、lint、截图验证、smoke check
- bug 循环中的根因分析和边界重设
- 多 agent 分工、review gate、检查点
- AGENTS.md、CLAUDE.md、rules、skills、workflow、playbook
- 团队级方法复制和公开影响证据

其中，八品需要证明方法被团队或社区复用；九品需要公开范式影响。普通个人私有日志通常最高只自动确认到七品。

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

- 段位结论
- 判定模式：自动初筛或 AI 深度判定
- 置信度
- 系统归属判断
- 硬统计画像：总 token、峰值日 token、活跃天数、日均/会话均 token、可选美元成本估算、峰值集中度、有效样本比例、强证据密度、强记录占比、验证闭环密度、返工压力、工具事件占比、主动控制占比、用户决策占比、助手执行占比、信号覆盖度，以及对应的统计解读
- 硬指标卡：把 token、成本、活跃天数、有效样本、强证据密度、强记录占比、验证密度、返工压力、用户主动控制、用户决策占比翻译成评级意义
- 统计仪表盘：把硬统计归成投入强度、样本可信度、人类控制、验证闭环、效率风险五组，明确每组数字如何影响置信度、封顶原因和下一步
- 硬统计证据结论：统计上最多支撑到几品、哪些数字提高置信度、哪些数字会封顶、哪些 token/成本只说明投入强度
- 质量提示：主动控制偏低、用户决策偏低、助手执行过重、token 单日集中、信号过于集中等样本风险
- 拖累项：Bug 循环、Demo 偏重、片段偏重、弱信号偏重等会拉低系统归属的行为
- 六维能力画像：目标定义、边界控制、验证闭环、架构判断、系统归属、方法复制
- 支撑该段位的行为证据卡
- 限制段位上限的证据缺口
- 机器可读的段位门槛：每个门槛的通过状态、观测值、要求值和原因
- 八品/九品是否解锁
- 下一品升级路径：优先绑定第一个未通过的下一品门槛，而不是给泛泛建议
- 图片报告提示词：可直接交给 Imagen / imagegen 生成朋友圈海报
- 深度判定提示词：脱敏后交给 AI judge 或评审人复核，输出最终中文报告

示例结构：

```json
{
  "source": "codex+claude",
  "sources": ["codex", "claude"],
  "roots": [
    {
      "source": "codex",
      "path": "/Users/example/.codex/sessions"
    },
    {
      "source": "claude",
      "path": "/Users/example/.claude/projects"
    }
  ],
  "analysisMode": "standard",
  "rank": {
    "level": 6,
    "label": "六品 · 已有大成",
    "score": 76,
    "confidence": "high",
    "systemOwnership": "strong"
  },
  "nextRank": {
    "level": 7,
    "label": "七品 · 已臻化境"
  },
  "judgmentMode": "自动初筛",
  "judgmentModeLabel": "自动初筛",
  "isFinal": false,
  "usageStats": {
    "total_tokens": 1280000,
    "peak_day_tokens": 420000,
    "active_days": 6,
    "active_span_days": 6,
    "average_day_tokens": 213333,
    "average_session_tokens": 106667,
    "peak_day_token_share": 0.3281,
    "token_note": "Token 是 AI 投入强度指标，不参与段位升品。"
  },
  "costEstimate": {
    "estimatedUsd": 0,
    "configured": false,
    "note": "未配置 token 单价；只展示 token 强度，不估算美元成本。"
  },
  "hardStats": {
    "raw_record_count": 170,
    "analyzed_record_count": 120,
    "scoring_candidate_record_count": 128,
    "tool_event_record_count": 0,
    "scorable_record_ratio": 0.9375,
    "strong_evidence_density": 0.1,
    "promotion_record_count": 32,
    "average_promotion_signals_per_record": 1.5,
    "promotion_usable_signal_count": 12,
    "promotion_usable_record_count": 8,
    "promotion_usable_signal_ratio": 0.25,
    "promotion_usable_record_ratio": 0.25,
    "downgraded_assistant_signal_count": 32,
    "downgraded_assistant_record_count": 18,
    "downgraded_assistant_signal_ratio": 0.5714,
    "downgraded_assistant_record_ratio": 0.15,
    "user_control_ratio": 0.1667,
    "promotion_user_decision_ratio": 0.1667,
    "promotion_assistant_execution_ratio": 0.75,
    "evidence_span_days": 6,
    "signal_coverage_ratio": 0.6364,
    "dominant_signal_ratio": 0.2321,
    "established_dimension_count": 5,
    "strong_record_density": 0.1,
    "validation_density": 0.1083,
    "bug_loop_density": 0,
    "tool_event_record_ratio": 0,
    "total_tokens": 1280000,
    "active_days": 6,
    "active_sessions": 12,
    "note": "硬统计只描述样本质量和 AI 投入强度，不直接参与段位升品。"
  },
  "statsInsight": "主动控制占比充足，用户在目标、边界、架构和验收上有明确主导痕迹。",
  "statEvidence": {
    "id": "supports_current_rank",
    "label": "硬统计支撑当前段位",
    "supportLevel": 6,
    "supportLabel": "六品统计支撑",
    "confidenceImpact": "降低置信度并可能封顶",
    "conclusion": "数字侧能支撑六品 · 已有大成的可信度，但不会单独升品。",
    "positiveSignals": [
      "用户决策 17%，达到七品复核线。",
      "验证密度 11%，结果有可托付证据。"
    ],
    "riskSignals": [
      "助手执行 75%，需要确认高阶结论不是 AI 自述完成。",
      "可升品高阶信号 25%，高阶词里用户行为支撑不足。"
    ],
    "investmentSignals": ["总 token 128万", "峰值日 42万"],
    "ratingUse": "硬统计用于支撑置信度、解释封顶和定位下一步；token 和成本只说明投入强度，不能直接升品。"
  },
  "statProfile": {
    "id": "assistant_self_report_heavy",
    "label": "助手自述偏重型",
    "summary": "高阶词不少，但大量来自助手自述完成；这能证明 AI 执行很多，不能直接证明人拥有系统。",
    "controlReading": "用户决策占比达到七品复核线，但可升品高阶信号仍偏薄。",
    "validationReading": "验证密度较好，系统结果有可托付证据；仍要确认验收是否由人定义。",
    "investmentReading": "token 投入能说明 AI 使用强度，但不会直接抬高段位。",
    "evidenceReading": "强记录存在，但助手自述被降权后，高阶证据厚度需要继续补强。",
    "riskLevel": "high",
    "ratingUse": "统计画像用于解释置信度、封顶和下一步，不直接升品。",
    "reasons": [
      "用户决策 17%，用户系统级取舍足够强。",
      "验证密度 11%，结果有可托付证据。",
      "可升品信号 25%，高阶词里用户行为支撑不足。"
    ],
    "matchedRules": [
      {
        "metric": "用户决策",
        "observed": "17%",
        "threshold": ">=12%",
        "interpretation": "用户系统级取舍足够强。"
      }
    ],
    "signals": ["用户决策 17%", "主动控制 17%", "助手执行 75%", "可升品信号 25%"]
  },
  "hardStatCards": [
    {
      "label": "AI 投入强度",
      "value": "128万 token",
      "detail": "活跃 6 天 / 12 会话",
      "interpretation": "只说明 AI 使用投入，不直接参与段位升品。"
    },
    {
      "label": "成本估算",
      "value": "未配置",
      "detail": "可传入 token 单价",
      "interpretation": "成本用于理解 AI 投入强度，不参与段位升品。"
    },
    {
      "label": "用户决策占比",
      "value": "17%",
      "detail": "助手执行 75%",
      "interpretation": "高段位必须看到人的系统级决策，而不是 AI 自述完成。"
    }
  ],
  "metricGroups": [
    {
      "id": "investment",
      "label": "投入强度",
      "value": "128万 token",
      "signal": "活跃 6 天 / 12 会话",
      "ratingImpact": "只解释 AI 使用投入和样本稳定性，不直接升品。",
      "risk": "投入分布没有明显单日集中风险。"
    },
    {
      "id": "human_control",
      "label": "人类控制",
      "value": "17%",
      "signal": "主动控制 17%，用户决策 17%",
      "ratingImpact": "决定六品、七品能否成立；高段位必须看到人的系统级决策。",
      "risk": "用户决策足以支撑更高段位复核。"
    }
  ],
  "qualityFlags": [
    {
      "id": "low_user_control",
      "severity": "risk",
      "label": "主动控制偏低",
      "metric": "1%",
      "message": "高阶信号主要不是由用户主动定义目标、边界、架构或验收触发。"
    }
  ],
  "dragFactors": [
    {
      "id": "bug_loop_heavy",
      "label": "Bug 循环偏重",
      "metric": "12%",
      "impact": "反复让 AI 修同一类问题，说明迭代控制可能停在局部 patch。",
      "advice": "失败两轮后先做根因分析。"
    }
  ],
  "dimensionProfile": [],
  "strongestEvidence": [],
  "rankCaps": [],
  "rankGates": [],
  "unlockStatus": {},
  "gateUpgradeAdvice": "沉淀 3 次以上用户主导的边界、架构、验收或取舍决策，把“为什么这样设计”留在记录里。",
  "upgradePath": [],
  "shareImagePrompt": "Use case: infographic-diagram..."
}
```

说明：上面是本地完整报告结构。

- 默认 `analysisMode` 为 `standard`，不会生成 `advancedAnalysis`；开启 `--advanced-analysis` 或 `--advanced` 后才会加入高级分析字段。
- 高级分析包含 `decisionTrace`、`gateAudit`、`dimensionRubric`、`evidenceAudit`、`upgradePlan` 和 `limitations`，只是把本地规则引擎的中间依据转成透明审计信息，不调用外部 LLM，不要求 API key，也不上传原始日志。
- `source` 表示本次实际评分来源，融合模式为 `codex+claude`；`sources` 是实际参与评分的来源数组；`roots` 只出现在本地完整报告里。
- CLI 的本地完整报告使用 camelCase 字段，并包含 `usageStats`、`signalCounts`、`narrative`、`shareImagePrompt` / `judgePrompt` 这类自查和二次生成字段。
- 本地 `/report/<id>` 读取同一份完整本地报告；显式 `--share` 生成的公网 `/share/<id>` 使用压缩后的 public payload，不包含原始日志、本地路径、源码片段、session id、提示词长文本，也不会包含 `roots`。
- 公网分享 payload 会去掉 `usageStats`、`signalCounts`、`narrative` 等可由网页 fallback 或 `hardStats` 还原展示的冗余字段。

公开分享 payload 的压缩规则：

- `hardStats` 只保留关键统计，不包含完整行为明细。
- `hardStatCards` 只保留优先级最高的 6 张解释卡。
- `rankGates` 只保留第一个未通过的下一品门槛。
- `qualityFlags` / `dragFactors` 各只保留前 2 条。
- `strongestEvidence` 只保留前 3 条脱敏摘要；公开 payload 的 `evidence` 为空数组。
- `statEvidence` 只保留硬统计证据结论、前 3 条正向/风险/投入依据。
- `statProfile` 只保留分享所需字段，不包含完整 `matchedRules`。
- 高级模式下的 `advancedAnalysis` 只保留关键门槛、最多 6 个维度、3-5 条证据摘要和 2-3 条升级建议。
- `source` 和 `sources` 会进入公开 payload，用于说明评分来源；`roots`、完整证据、路径、片段和完整规则只保存在本地报告，不进入公网分享存储。

## 适合谁

- 想知道自己 AI 编程真实水平的开发者
- 想把 Codex / Claude Code 使用记录变成能力报告的人
- 想做 AI-native 工程能力评估的团队
- 想把 Airank 做成“AI 工作能力评级体系”的产品团队

## 本地完整报告，公网显式分享

默认命令会自动启动或复用本机报告服务，绑定 `127.0.0.1:4173`：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --open
```

CLI 会把完整报告写入 `.airank/reports/<reportId>.json`，并打开 `/report/<reportId>`。本地完整报告不会上传公网。`--site` 可用于手动指定本地站点：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --site http://127.0.0.1:4173 --open
```

本地服务默认只绑定本机地址。报告目录默认 `.airank/reports`，可用 `VIBE_RANK_REPORT_DIR` 覆盖。`npm run site` 仍可用于手动启动站点。默认不传 `--source` 时会自动探测 `~/.codex/sessions` 和 `~/.claude/projects`；两个来源都存在就融合评分，只存在一个就单源评分。

如果不写本地报告，例如传入 `--no-write`，CLI 无法生成 `/report/<id>`。此时必须同时使用 `--share` 或 `--upload-url`，显式上传脱敏摘要并生成公网 `/share/<id>`：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --share --no-write --open
```

需要透明审计信息时，可以开启高级分析模式：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --advanced-analysis --open
```

高级分析模式仍然只在本地使用规则引擎，不调用外部 LLM，不上传原始日志；公网分享链接里只包含脱敏后的精简审计摘要。

如果想要公网分享链接，必须显式开启上传模式：

```bash
npx github:relaxcloud-cn/vibe-coding-rank \
  --share \
  --open
```

公网分享模式只上传脱敏 public payload 到 Cloudflare KV，并返回 `https://vibe.yisec.ai/share/<id>`。它不上传原始 Codex / Claude Code 日志，也不上传本地完整报告。报告默认 30 天过期。

如果你部署到自己的 Worker，也可以指定上传地址：

```bash
npx github:relaxcloud-cn/vibe-coding-rank \
  --upload-url https://your-worker.example.com \
  --open
```

部署配置在 `wrangler.toml`。默认子域名为 `vibe.yisec.ai`，公网分享存储使用 Cloudflare KV namespace `REPORTS`。

常用 CLI 参数：

```bash
--source codex|claude|codex,claude  会话来源；默认自动探测并融合 Codex + Claude Code
--root <path>                   自定义单一来源会话目录；必须配合 --source codex 或 --source claude
--since YYYY-MM-DD              只扫描指定日期后的记录
--site <url>                    报告站点地址
--upload-url <url>              显式上传脱敏摘要，生成公网 /share 链接
--share                         显式上传脱敏摘要，生成公网 /share 链接
--advanced-analysis, --advanced 输出本地高级分析审计；不调用外部 LLM
--usd-per-million-input-tokens <n>      输入 token 每百万美元单价，用于成本估算
--usd-per-million-cached-input-tokens <n> 缓存输入 token 每百万美元单价，用于成本估算
--usd-per-million-output-tokens <n>     输出 token 每百万美元单价，用于成本估算
--usd-per-million-reasoning-tokens <n>  reasoning token 每百万美元单价，用于成本估算
--out <path>                    本地报告 JSON 输出路径
--doctor                        检查本机依赖、默认记录路径和建议命令
--write-link <path>             输出完整公开报告链接
--write-share-prompt <path>     输出脱敏后的图片报告提示词
--write-judge-prompt <path>     输出脱敏后的 AI 深度判定提示词
--no-write                      不写本地报告文件
--print-json                    输出机器可读 JSON
--open                          自动打开报告链接
```

本地默认会生成 `/report/<id>`。需要公网分享时，可以显式上传脱敏摘要生成 `/share/<id>`：

```bash
npx github:relaxcloud-cn/vibe-coding-rank --share --open
```

CLI 会在机器可读输出里返回 `url`、`reportId`、`reportLinkMode`、`reportPayloadType`、`outPath` 和 `qrUrl`。当公开链接超过建议阈值时，`linkAdvice.warning` 会变成 `true`，并给出 `--share --open` 或 `--write-link .airank/report-url.txt` 建议。

如果你需要把当前报告链接写入文件：

```bash
npx github:relaxcloud-cn/vibe-coding-rank \
  --write-link .airank/report-url.txt
```

生成朋友圈/海报提示词：

```bash
npx github:relaxcloud-cn/vibe-coding-rank \
  --write-share-prompt .airank/share-poster-prompt.txt
```

这个文件只包含段位、分数、硬统计、证据摘要、封顶原因和下一步，不包含原始日志、本地路径、session id、源码或密钥。可以直接交给 Imagen、imagegen 或其他图片模型生成中文报告图。

如果要让 Codex 从报告继续生成信息图，可以读取 `skill/references/infographic-prompt.md` 作为通用模板，并使用 imagegen / `gpt-image-2` 这类位图生图模型生成。不要用 HTML、SVG、Mermaid、canvas 或 CSS 伪造信息图。

生成 AI 深度判定提示词：

```bash
npx github:relaxcloud-cn/vibe-coding-rank \
  --write-judge-prompt .airank/deep-judge-prompt.txt
```

这个提示词用于把自动初筛升级为最终复核：要求 AI judge 先看封顶条件，再看证据链，明确是否维持、上调或下调自动初筛结果。它同样只使用脱敏报告摘要，不包含原始日志、本地路径、session id、源码或密钥。

成本估算是可选项。不同模型、套餐、缓存策略和供应商折扣会变化，所以 CLI 不内置固定价格。需要展示美元成本时，把你当前实际价格传进去：

```bash
npx github:relaxcloud-cn/vibe-coding-rank \
  --usd-per-million-input-tokens 1.25 \
  --usd-per-million-cached-input-tokens 0.125 \
  --usd-per-million-output-tokens 10
```

## 作为 Codex skill 使用

在本目录下运行：

```bash
python3 skill/scripts/collect_sessions.py \
  --source codex \
  --root "$HOME/.codex/sessions" \
  --since 2026-02-01 \
  --output /tmp/airank-codex-evidence.jsonl

python3 skill/scripts/prepare_evidence.py \
  --input /tmp/airank-codex-evidence.jsonl \
  --output /tmp/airank-vibe-summary.json
```

Claude Code：

```bash
python3 skill/scripts/collect_sessions.py \
  --source claude \
  --root "$HOME/.claude/projects" \
  --output /tmp/airank-claude-evidence.jsonl
```

如果要融合两个来源，先分别收集，再合并 JSONL 后统一准备证据：

```bash
cat /tmp/airank-codex-evidence.jsonl /tmp/airank-claude-evidence.jsonl > /tmp/airank-merged-evidence.jsonl

python3 skill/scripts/prepare_evidence.py \
  --input /tmp/airank-merged-evidence.jsonl \
  --output /tmp/airank-vibe-summary.json
```

然后让 Codex 使用 `$vibe-coding-rank`，读取摘要里的 `evidence_cards`、`rank_caps`、`unlock_status` 和 `skill/references/` 中的判定规则，生成最终中文报告。

## 安装到 Codex

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skill "${CODEX_HOME:-$HOME/.codex}/skills/vibe-coding-rank"
```

调用示例：

```text
Use $vibe-coding-rank to analyze my local Codex sessions and produce a Vibe Coding rank report.
```

## 项目结构

```text
.
├── README.md                        # 项目介绍和使用说明
├── package.json                     # CLI 元信息和本地检查脚本
├── wrangler.toml                    # Cloudflare Worker / 静态资源部署配置
├── apps/
│   └── report-site/                 # vibe.yisec.ai 静态报告页
├── assets/                          # README 和产品展示图
├── docs/
│   ├── deployment/yisec.md          # vibe.yisec.ai 部署说明
│   └── launch-playbook.md           # 宣传运营打法
├── skill/                           # 可单独安装的 Codex skill
│   ├── SKILL.md                     # Skill 入口
│   ├── agents/openai.yaml           # Skill UI 元信息
│   ├── references/                  # 九品体系、证据规则、AI 判定流程、输出结构
│   └── scripts/                     # 本地取证和证据准备脚本
├── src/
│   ├── cli/vibe-rank.mjs            # npx 一条命令入口
│   └── worker/index.js              # Cloudflare Worker API
└── tests/                           # CLI 和脚本回归测试
```

## 隐私原则

原始会话记录可能包含源码、客户信息、业务上下文或 token。默认流程会先在本地提取和脱敏，再生成报告。本地 `/report/<reportId>` 从 `.airank/reports/<reportId>.json` 读取完整报告，只在本机报告服务使用；公网 `/share/<reportId>` 只有在你显式传入 `--share` 时才会创建，并且只存储压缩后的公开报告摘要，不包含原始日志、本地路径、源码片段或提示词长文本。完整本地报告仍会写到 `.airank/vibe-report.json`，方便你自己审计证据。

不要把这些文件提交到公开仓库：

- `.airank/`
- `.npm-cache/`
- `.wrangler/`
- `node_modules/`
- `*-evidence.jsonl`
- `*-summary.json`
- `runs/`
- `reports/`

## 测试

```bash
npm run check
```

核心脚本只使用 Python / Node 标准库，没有额外运行时依赖。
