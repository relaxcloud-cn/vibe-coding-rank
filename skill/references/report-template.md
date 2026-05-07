# 中文段位报告模板

输出目标：让用户觉得“这说的是我”，并且知道为什么是这个段位、为什么还不能到下一段、下一步具体怎么升。

不要写成冷冰冰的日志摘要。报告必须围绕一个核心问题：

> 这系统是你的，还是 AI 的？

## 标准输出结构

```markdown
# Vibe Coding 段位报告

## 一句话判定

你现在是：{rank_label}。{verdict}

判定模式：{judgment_mode}

## 为什么是这个段位

{rank_reason}

## 为什么还不是下一品

{next_rank_gap}

## 最强证据

1. **{evidence_type_1}**  
   {evidence_reason_1}  
   证据片段：{evidence_snippet_1}

2. **{evidence_type_2}**  
   {evidence_reason_2}  
   证据片段：{evidence_snippet_2}

3. **{evidence_type_3}**  
   {evidence_reason_3}  
   证据片段：{evidence_snippet_3}

## 段位封顶原因

{rank_cap}

## 六维画像

- 目标定义：{problem_definition}
- 边界控制：{boundary_control}
- 验证闭环：{validation_loop}
- 架构判断：{architecture_judgment}
- 系统归属：{system_ownership}
- 方法复制：{method_replication}

## 硬统计

- 总 token：{total_tokens}
- 峰值日 token：{peak_day_tokens}
- 活跃天数：{active_days}
- 活跃会话：{active_sessions}
- 活跃跨度：{active_span_days}
- 日均 token：{average_day_tokens}
- 会话均 token：{average_session_tokens}
- 峰值会话 token：{peak_session_tokens}
- 峰值日 token 占比：{peak_day_token_share}
- 有效样本比例：{scorable_record_ratio}
- 强证据密度：{strong_evidence_density}
- 主动控制占比：{user_control_ratio}
- 用户决策占比：{promotion_user_decision_ratio}
- 助手执行占比：{promotion_assistant_execution_ratio}
- 证据跨度：{evidence_span_days}
- 信号覆盖度：{signal_coverage_ratio}
- 最高信号集中度：{dominant_signal_ratio}
- 成立维度数：{established_dimension_count}/6
- 统计解读：{stats_insight}

说明：硬统计只描述 AI 投入强度和样本质量，不参与段位升品。

## 硬指标卡

把硬统计翻译成用户能理解的报告卡片：

- AI 投入强度：{ai_investment_card}
- 样本稳定性：{sample_stability_card}
- 有效样本：{sample_validity_card}
- 强证据密度：{strong_evidence_density_card}
- 用户主动控制：{user_control_card}
- 用户决策占比：{user_decision_card}
- 信号覆盖度：{signal_coverage_card}
- 维度成熟度：{dimension_maturity_card}

每张卡都必须有 `value`、`detail` 和 `interpretation`。不要只报数字，要解释这个数字对评级意味着什么。

## 下一品升级路线

优先使用 `gateUpgradeAdvice`。如果存在未通过的下一品门槛，升级路线必须对准这个门槛，而不是只给通用建议。

{gate_upgrade_advice}

## 证据质量

- 原始记录数：{record_count}
- 有效分析记录：{analyzed_record_count}
- 非评分记录：{excluded_record_count}
- 其中系统上下文：{context_excluded_record_count}
- 其中 token 统计：{usage_record_count}
- 其中工具结果：{tool_result_record_count}
- 置信度：{confidence}
- 强证据数：{strong_evidence_count}
- 高段位锁：{unlock_status}
```

## 文风要求

- 用中文。
- 直接判断，不要绕。
- 不要说“可能、大概、似乎”来逃避判断；证据不足时直接说证据不足。
- 不要堆工具名。
- 不要把 token 消耗当能力本身。
- 不要把关键词命中当证据；必须解释行为意义。
- 自动初筛不是最终高段位判定；八品和九品必须说明是否解锁，以及为什么。
- 不要暴露本地路径、session id、源码、客户信息或密钥。

## 好输出示例

```markdown
你现在是：六品 · 已有大成。

你已经不是在让 AI 随机写代码，而是在用目标、边界、验证和架构判断驱动 AI 交付。证据里多次出现“先定义验收标准、限制改动范围、运行测试、判断模块边界”的行为，这说明系统开始由你控制。

但还不能判七品。七品要求工具手段基本透明，审核和验证机制已经内化为系统的一部分。目前证据仍然显示你需要在关键节点亲自拉回方向，闭环还没有完全自动化。
```

## 差输出示例

```markdown
你有很多 test、build、workflow、agent 关键词，所以你是八品。
```

这是差输出。它没有说明行为意义，也没有解释封顶原因。
