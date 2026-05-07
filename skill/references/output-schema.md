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
  "judgmentMode": "自动初筛",
  "judgmentModeLabel": "自动初筛",
  "isFinal": false,
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
      "dimension": "系统设计",
      "strength": "强",
      "supportsLevels": [5, 6, 7],
      "usableForPromotion": true,
      "snippet": "这个模块继续 patch 没意义，重设数据边界..."
    }
  ],
  "rankCaps": [
    "缺少团队级 playbook、共享 workflow 或方法复制证据。"
  ],
  "upgradePath": [
    "把个人方法复制给团队：playbook、skills、培训、评测和团队报告。"
  ],
  "unlockStatus": {
    "level8": {
      "unlocked": false,
      "label": "八品 · 半步宗师",
      "reason": "八品需要团队级方法复制强证据，自动初筛默认不会仅凭私有会话放行。"
    },
    "level9": {
      "unlocked": false,
      "label": "九品 · 大宗师",
      "reason": "九品需要公开范式影响证据，不能仅凭私有会话自动判定。"
    }
  },
  "qualityNotes": [
    "脚本只做证据清洗和自动初筛，不是最终 AI 段位判定。"
  ],
  "shareImagePrompt": "Use case: infographic-diagram...",
  "userControlCount": 14,
  "usageStats": {
    "usage_record_count": 42,
    "total_tokens": 1280000,
    "peak_day": "2026-05-07",
    "peak_day_tokens": 420000,
    "active_days": 6,
    "active_sessions": 12,
    "active_span_days": 6,
    "average_day_tokens": 213333,
    "average_session_tokens": 106667,
    "peak_day_token_share": 0.3281,
    "peak_session_token_share": 0.2031,
    "token_note": "Token 是 AI 投入强度指标，不参与段位升品。"
  },
  "hardStats": {
    "raw_record_count": 170,
    "analyzed_record_count": 120,
    "non_scoring_record_count": 50,
    "usage_record_count": 42,
    "tool_result_record_count": 0,
    "context_excluded_record_count": 8,
    "scoring_candidate_record_count": 128,
    "scorable_record_ratio": 0.9375,
    "source_count": 3,
    "evidence_span_days": 6,
    "average_records_per_source": 40,
    "signal_count": 56,
    "signal_density": 0.4667,
    "signal_type_count": 7,
    "signal_coverage_ratio": 0.6364,
    "dominant_signal": "validation",
    "dominant_signal_ratio": 0.2321,
    "strong_evidence_count": 12,
    "strong_evidence_density": 0.1,
    "strong_signal_type_count": 3,
    "strong_evidence_source_count": 3,
    "promotion_evidence_count": 48,
    "user_control_count": 8,
    "user_control_source_count": 3,
    "user_control_ratio": 0.1667,
    "established_dimension_count": 5,
    "stable_dimension_count": 1,
    "total_tokens": 1280000,
    "active_days": 6,
    "active_sessions": 12,
    "active_span_days": 6,
    "average_day_tokens": 213333,
    "average_session_tokens": 106667,
    "peak_day": "2026-05-07",
    "peak_day_tokens": 420000,
    "peak_session_tokens": 260000,
    "peak_day_token_share": 0.3281,
    "peak_session_token_share": 0.2031,
    "note": "硬统计只描述样本质量和 AI 投入强度，不直接参与段位升品。"
  },
  "dimensionProfile": [
    {
      "id": "architecture_judgment",
      "label": "架构判断",
      "status": "成立",
      "score": 65,
      "evidence_count": 9,
      "strong_evidence_count": 9,
      "source_count": 3
    }
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

如果 `isFinal` 是 `false`，报告必须明确写出：这是自动初筛，不是最终高段位判定。八品和九品要看 `unlockStatus`，不能只因为信号数量多就放行。
