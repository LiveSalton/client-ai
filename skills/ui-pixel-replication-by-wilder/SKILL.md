---
name: ui-pixel-replication-by-wilder
description: 中文 UI 像素级复刻调度器，覆盖 Figma / 截图 / CSS 输入分析、opsx 提案先行、ASCII 1:1 与层级线稿、置信度门禁、低级模型多轮循环、子 agent 分片和主 agent 严审。
---

# UI 像素级复刻 By Wilder

本 skill 只做入口和调度，不跳过提案确认，不绕过置信度门禁，不维护并行文档体系。

## 硬门禁

1. 任何 UI 复刻都必须先走当前 `opsx` / OpenSpec change，当前 change 是唯一状态源。
2. 必须先输出 `opsx` / OpenSpec 提案，并等用户确认后，才允许进入编码实现。
3. 提案必须包含 `ASCII 1:1 复刻稿`、`ASCII 层级线稿` 和置信度表；缺一项不得进入实现。
4. 整体置信度低于 `0.85`、关键区域低于 `0.90`、或存在未解释的 low confidence 项时，不得编码。
5. 任何新发现、冲突、假设、资源决策、实现约束，都要回写当前 change，不能只留在聊天里。
6. `SKILL.md` 只保留入口规则和读取时机，细节必须放到 `references/`。
7. 需要实现时必须先分片，再由多个子 agent 执行，最后由主 agent 严格审查。
8. 子 agent 最多 6 个；每个子 agent 必须有明确文件或模块所有权。
9. 低级模型一旦上下文不足、分工不清、置信度不足或任务过大，必须按循环流程补齐证据，再继续。
10. 不维护第二套规格体系，不把草稿、口头约定或临时笔记当成正式产物。

## 读取顺序

- 每次触发先读 `references/00-opsx-governance.md`
- 有 Figma、截图、CSS 输入时，再读 `references/10-input-cache.md` 和 `references/20-visual-analysis.md`
- 需要判断复刻识别是否可靠时，再读 `references/25-ascii-confidence.md`
- 低级模型输出粗糙、提前结束或证据不足时，再读 `references/35-low-tier-loop.md`
- 需要写 proposal、design、tasks 或 spec 时，再读 `references/30-spec-template.md`
- 需要开始实现时，再读 `references/40-subagent-splitting.md`、`references/50-assets-icons.md`、`references/60-implementation-review.md`
- 有 Figma 输入且项目存在 Figma MCP 时，再读 `references/70-figma-mcp-enhancement.md`；设计稿数据必须通过项目既有 Figma MCP 获取、解析和应用，不执行官方 `figma-implement-design` 节点获取步骤。

## 工作流

1. 锁定当前 OpenSpec change、目标页面和交付范围。
2. 收集输入源，确认优先级、冲突和待确认项。
3. 做视觉语义分析，产出 ASCII 证据、元素表和置信度表。
4. 先产出或更新 OpenSpec proposal / design / tasks / spec，并停止等待用户确认。
5. 用户确认后，按分片计划调度编码子 agent，明确每个 agent 的所有权。
6. 子 agent 只补齐自己负责范围的内容，不越界改写别人的产物。
7. 主 agent 对照已确认提案、ASCII 线稿、置信度表和代码改动统一严审。

## 必须产出

- 当前 change 号或名称
- 已锁定的输入源和冲突
- `ASCII 1:1 复刻稿`
- `ASCII 层级线稿`
- 元素表与 UI -> Code 映射表
- 页面、区域、关键元素置信度
- 需要人工确认的低置信度项
- 用户确认状态
- 子 agent 分工和所有权
- 主 agent 审查结论
- 未完成项、风险和下一步

## 终止条件

- 需求不清、素材不全、change 未对齐、ASCII 证据缺失、置信度不足、用户未确认、或实现分片未完成时，不得直接进入代码。
- 发现与当前 change 冲突的新事实时，先回写 OpenSpec，再继续。
- 如果只需要文档，就停在 OpenSpec 对齐和规格输出，不进入实现。
- 如果用户要求继续实现，就按分片进入代码，并保留审查记录。
