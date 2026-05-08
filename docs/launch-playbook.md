# Vibe Coding Rank 运营手册

## 定位

一句话：

> 不是测你会不会用 AI，而是用真实 Codex / Claude Code 记录，看系统到底是不是你的。

用户看到它时应该立刻明白三件事：

- 这不是问卷，是基于真实工作记录的评级。
- 本地执行一条命令，就能生成云端可分享报告。
- 结果不是简单分数，而是“你现在卡在哪一品，下一品怎么升”。

## 目标用户

第一圈：Codex、Claude Code、Cursor、OpenClaw 重度用户。

第二圈：正在做 AI coding 工作流的技术负责人、独立开发者、创业者。

第三圈：想评估团队 AI-native 工作能力的 HR、培训负责人、研发管理者。

## 11 星体验梯度

1 星：看 README 知道这是一个 AI 编程评级工具。

3 星：复制一条命令，能在本地跑出自己的段位。

5 星：命令自动打开云端报告，报告能分享给朋友圈、X、微信群。

7 星：报告里不仅有分数，还有证据、上限、下一品升级路径。

9 星：用户能比较自己的 Codex / Claude / Cursor 使用差异，形成个人 AI 工作雷达。

11 星：团队成员一键生成报告，组织看到部门分布、训练建议和 AI 转型路线。

## 上线节奏

### Day 0：开源仓库

- README 首屏突出命题、九品图、一条命令。
- GitHub topics：`codex`、`claude-code`、`ai-coding`、`vibe-coding`、`ai-assessment`。
- Release title：`Vibe Coding Rank: evidence-based AI coding rank reports`

### Day 1：朋友圈和微信群

传播主题：

> 我做了一个东西，读取你的 Codex / Claude Code 真实记录，给你评 Vibe Coding 九品。

核心钩子：

- “系统是你的，还是 AI 的？”
- “你不是 AI coding 高手，你可能只是高级复制粘贴。”
- “八品以上不能靠自嗨，必须有团队复制证据。”

### Day 2：X / Reddit / Hacker News

英文钩子：

> I built a local-first skill that rates your AI coding ability from real Codex / Claude Code sessions. Not prompt trivia. Evidence.

适合投放社区：

- X AI coding 圈
- r/ClaudeAI
- r/LocalLLaMA
- r/programming
- Hacker News Show HN
- GitHub Trending 预热

### Day 3：内容拆条

可拆成 6 条短内容：

- 什么是 Vibe Coding 九品？
- 为什么私有会话最高通常只能证明到七品？
- 三品和五品的本质区别是什么？
- 为什么八品需要团队复制证据？
- 一条命令如何生成云端报告？
- Airank 想成为 AI 工作能力的标准评分系统。

## 朋友圈文案

### 版本 A：直接型

最近做了一个开源小工具：Vibe Coding Rank。

它会读取你的 Codex / Claude Code 真实使用记录，然后按照“Vibe Coding 九品体系”给你评级。

我想测的不是“你会不会用 AI”，而是：

> 系统到底是不是你的？

从零品 · 门外汉，到九品 · 大宗师。

私有记录通常最高只能证明到七品；八品要看你有没有把方法复制给团队；九品要看你有没有定义新的协作范式。

一条命令，本地取证，云端生成可分享报告。

GitHub：  
https://github.com/relaxcloud-cn/vibe-coding-rank

### 版本 B：挑衅型

你以为自己很会 AI coding，可能只是很会让 AI 改 bug。

我做了一个 Vibe Coding 九品评级工具，直接读你的 Codex / Claude Code 使用记录，看你到底在哪一品。

真正的分界不是“会不会写 prompt”，而是：

- 你会不会定义目标和边界？
- 你会不会验证 AI 输出？
- 你会不会判断该 patch 还是重构？
- 你能不能在不亲手写每一行代码的情况下，仍然拥有系统结果？

强者不是“会写代码的人”，而是“能在不亲手写每一行代码的情况下，仍然拥有系统结果的人”。

开源了，欢迎来测。

GitHub：  
https://github.com/relaxcloud-cn/vibe-coding-rank

## GitHub README 首屏要求

必须在首屏出现：

- 产品名：Vibe Coding Rank
- 核心命题：系统到底是不是你的
- 一条命令：`npx github:relaxcloud-cn/vibe-coding-rank --open`
- 九品图或九品表
- GitHub star / install CTA

## 指标

第一阶段只看 5 个指标：

- GitHub stars
- README 到 CLI 的转化
- CLI 运行成功率
- 云端报告打开数
- 分享链接二次访问数

第二阶段再看：

- 用户自评“结果准不准”
- 用户愿不愿意晒图
- 团队版咨询数
- 训练营 / 企业诊断线索数
