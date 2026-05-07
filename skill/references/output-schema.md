# 输出结构

输出分两层：

1. 结构化 JSON：给 CLI、网页、图片报告使用。
2. 中文段位报告：给用户阅读和分享。

## JSON 字段

```json
{
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
  "verdict": "你已经形成从问题定义到系统交付的闭环。",
  "whyThisRank": "你不是只在指挥 AI 写代码，而是在把目标、架构、验证和工作流连成一个系统。",
  "whyNotNextRank": "要进入七品，需要让审核、验证和架构判断更系统化。",
  "strongestEvidence": [
    {
      "signal": "architecture",
      "label": "架构判断证据",
      "reason": "这类证据说明你关注模块边界、权限、数据模型、重构或系统设计。",
      "source": "codex:session.jsonl:47",
      "role": "user",
      "snippet": "这个模块继续 patch 没意义，重设数据边界..."
    }
  ],
  "rankCaps": [
    "缺少团队级 playbook、共享 workflow 或方法复制证据。"
  ],
  "upgradePath": [
    "把个人方法复制给团队：playbook、skills、培训、评测和团队报告。"
  ],
  "narrative": {
    "title": "Vibe Coding 段位报告",
    "oneLine": "你现在是：六品 · 已有大成。你已经形成从问题定义到系统交付的闭环。",
    "rankReason": "你不是只在指挥 AI 写代码，而是在把目标、架构、验证和工作流连成一个系统。",
    "nextRankGap": "要进入七品，需要让审核、验证和架构判断更系统化。",
    "capSummary": "缺少团队级 playbook、共享 workflow 或方法复制证据。",
    "upgradeSummary": "把个人方法复制给团队：playbook、skills、培训、评测和团队报告。"
  },
  "recordCount": 128,
  "analyzedRecordCount": 120,
  "excludedRecordCount": 8,
  "excludedReasonCounts": {
    "agents_context": 5,
    "codex_system_prompt": 3
  }
}
```

## 中文报告要求

必须包含：

- 一句话判定
- 为什么是这个段位
- 为什么还不是下一品
- 最强证据
- 段位封顶原因
- 下一品升级路线
- 证据质量

不要只输出分数。分数只是辅助，段位判断必须能被证据解释。
