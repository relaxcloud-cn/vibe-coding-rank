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
  "rankGates": [
    {
      "id": "level7_user_decision_ratio",
      "level": 7,
      "label": "七品用户决策占比",
      "passed": true,
      "observed": 0.1667,
      "required": 0.08,
      "reason": "七品需要足够用户决策证据，证明人真正做边界、架构、验收或取舍。"
    }
  ],
  "gateUpgradeAdvice": "沉淀 3 次以上用户主导的边界、架构、验收或取舍决策，把“为什么这样设计”留在记录里。",
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
    "tool_event_record_count": 0,
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
    "promotion_record_count": 32,
    "strong_evidence_record_count": 12,
    "average_promotion_signals_per_record": 1.5,
    "user_control_count": 8,
    "user_control_record_count": 8,
    "user_control_signal_count": 8,
    "user_control_source_count": 3,
    "user_control_ratio": 0.1667,
    "user_control_signal_ratio": 0.1667,
    "behavior_counts": {
      "user_decision": 18,
      "user_instruction": 22,
      "assistant_execution": 64,
      "assistant_summary": 16
    },
    "promotion_behavior_counts": {
      "user_decision": 8,
      "assistant_execution": 36,
      "assistant_summary": 4
    },
    "user_decision_count": 18,
    "promotion_user_decision_ratio": 0.1667,
    "promotion_assistant_execution_ratio": 0.75,
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
  "hardStatCards": [
    {
      "id": "ai_investment",
      "label": "AI 投入强度",
      "value": "128万 token",
      "detail": "活跃 6 天 / 12 会话",
      "interpretation": "只说明 AI 使用投入，不直接参与段位升品。"
    },
    {
      "id": "user_decision",
      "label": "用户决策占比",
      "value": "17%",
      "detail": "助手执行 75%",
      "interpretation": "高段位必须看到人的系统级决策，而不是 AI 自述完成。"
    }
  ],
  "qualityFlags": [
    {
      "id": "low_user_control",
      "severity": "risk",
      "label": "主动控制偏低",
      "metric": "1%",
      "message": "高阶信号主要不是由用户主动定义目标、边界、架构或验收触发。"
    },
    {
      "id": "assistant_execution_watch",
      "severity": "info",
      "label": "助手执行占比较高",
      "metric": "52%",
      "message": "这不代表能力低，但需要更多用户决策证据来证明人在控。"
    }
  ],
  "dragFactors": [
    {
      "id": "bug_loop_heavy",
      "label": "Bug 循环偏重",
      "metric": "12%",
      "impact": "反复让 AI 修同一类问题，说明迭代控制可能停在局部 patch。",
      "advice": "失败两轮后先做根因分析，决定重构、缩小边界或补测试，再让 AI 执行。"
    }
  ],
  "statsInsight": "主动控制占比充足，用户在目标、边界、架构和验收上有明确主导痕迹。",
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
