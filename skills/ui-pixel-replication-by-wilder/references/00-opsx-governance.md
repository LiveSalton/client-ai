# 00 - opsx 治理

## 何时读取

- 每次触发 `ui-pixel-replication-by-wilder` 都先读。
- 发现需求变化、冲突、新约束或要开始实现时重读。

## 必须产出

- 当前 OpenSpec change 名称 / 路径
- 当前阶段状态
- 已锁定的约束
- 提案确认状态
- 置信度门禁状态
- 未决问题
- 下一步动作

## 必须遵守

| 规则 | 要求 |
| --- | --- |
| 唯一状态源 | 以当前 `opsx` / OpenSpec change 为唯一正式状态源。 |
| 禁止并行体系 | 不维护第二套规格、草稿、口头约定或临时笔记。 |
| 提案先行 | 必须先输出 OpenSpec proposal，等待用户确认后才进入编码。 |
| 证据先行 | proposal 必须含 ASCII 1:1、ASCII 层级线稿和置信度表。 |
| 置信度门禁 | 整体低于 0.85、关键区域低于 0.90 或 low 项未处理时不得实现。 |
| 先回写再推进 | 任何新事实、冲突、假设、资源决策都要回写当前 change。 |
| 先对齐再实现 | change 未对齐、范围未确认、冲突未收敛时，不进入代码。 |
| 低级模型保护 | 信息不够时先暂停，补齐分片和状态，不要硬撑着往下做。 |

## 阶段状态

| stage | 含义 | 下一步 |
| --- | --- | --- |
| `analyze` | 收集输入和视觉分析 | 输出元素表与冲突 |
| `proposal_pending` | 已写 proposal，等待用户确认 | 停止，不编码 |
| `confidence_blocked` | ASCII 或置信度未过门禁 | 进入低级模型循环或人工确认 |
| `confirmed` | 用户确认 proposal 且置信度过门禁 | 可以做实现分片 |
| `implement` | 编码子 agent 执行中 | 按所有权写入 |
| `review` | 主 agent 严审 | 标记风险与未验证项 |

## 最小输出模板

```text
change: <name>
stage: <analyze|proposal_pending|confidence_blocked|confirmed|implement|review>
locked: <已确认内容>
proposal_confirmed: <yes|no>
confidence_gate: <pass|blocked>
open: <待确认内容>
next: <下一步>
```
