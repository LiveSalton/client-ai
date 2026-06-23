---
name: code-up-by-wilder
description: use when implementing, modifying, refactoring, debugging, or reviewing code, especially when deciding which coding, review, design, debugging, documentation, or cleanup skills to activate. routes code tasks through a 1% skill-trigger gate and selects the necessary skill combination without relying on code-up-guidelines-by-wilder.
---

# Code Up By Wilder

代码任务技能路由器。目标是先判断任务信号，再选择必要技能组合，保留“1% 触发门禁”以降低漏用关键技能的风险。

## Core Rules

- 先明确用户目标、已有上下文、成功标准和可验证方式，再行动。
- 保留“1% 触发门禁”：若判断某个技能哪怕有 `1%` 的适用可能，必须先调用该技能，再继续后续执行。
- “1% 触发门禁”发生在任何实现动作之前，包括改代码、跑命令、下结论。
- 小改动仍优先做最小变更，但不能以“任务很小”“先做一步再说”作为跳过适用技能的理由。
- 遇到不确定、冲突、跳过验证、工具失败或风险边界时，必须明确披露。

## Routing Flow

1. 识别任务类型：功能、缺陷、重构、评审、UI/设计、文档、清理。
2. 应用“1% 触发门禁”，检查所有可能相关技能。
3. 选择并调用命中的技能；默认保持技能集合尽量小，但不得跳过命中项。
4. 按顺序执行：读取上下文 -> 分析/实现 -> 验证 -> 风险复盘。
5. 在最终回复中说明触发了哪些技能，以及每个技能的触发理由。

## 1% Trigger Gate

- 若某个技能存在哪怕 `1%` 的适用可能，必须先调用该技能。
- 该检查必须发生在任何实现动作之前。
- 不得因为任务简单、修改范围小、用户催促、上下文紧张而跳过。
- 若某个技能理论相关但最终未调用，必须说明未调用原因。
- 若当前环境无法调用某个命中的技能，必须说明原因、影响和替代约束。

## Skill Selection Matrix

- 任何实质性编码或改代码任务 -> `coding-standards-by-wilder`
- bug、回归、行为不稳定、错误定位 -> `systematic-debugging`
- 新功能或缺陷修复需要可靠测试闭环 -> `test-driven-development`
- 多文件、多阶段、依赖顺序明显、回滚风险高 -> `roadbook-workflows-by-wilder`
- 模块边界、接口职责、扩展性或可靠性权衡不清 -> `solution-architecture-by-wilder`
- 复刻、像素级还原、按设计稿实现 -> `ui-pixel-replication-by-wilder`
- 输入包含 Figma 链接、节点或设计交付要求 -> `figma` + `figma-implement-design`
- 实现完成后做不改行为的收敛 -> `code-cleanup-by-wilder`
- 死代码、重复代码、未使用导出/依赖治理 -> `refactor-cleaner-by-wilder`
- 提交前质量把关、风险扫描、独立审查 -> `code-reviewer-by-wilder` 或 `requesting-code-review`
- 需要从现有代码反推产品/技术文档 -> `reverse-doc-skill`

## Roadbook Rule

仅在复杂度确实需要时使用 `roadbook-workflows-by-wilder`，例如：

- 涉及多个文件或多个阶段。
- 存在明显回滚、迁移或发布风险。
- 依赖顺序不清，需要先记录决策。
- 后续实现需要长期交接或复盘材料。

若使用 roadbook，在实现前创建 `doc/roadbook/<topic>-roadbook.md`；实现后回写同一文件，补充使用指南、验证结果、注意事项和后续衔接。

## Recommended Combinations

- 小型代码修改：`coding-standards-by-wilder`
- 缺陷修复：`systematic-debugging` -> `coding-standards-by-wilder` -> `code-reviewer-by-wilder`
- 功能开发：`coding-standards-by-wilder` -> `test-driven-development` -> `code-reviewer-by-wilder`
- 重构治理：`solution-architecture-by-wilder` -> `refactor-cleaner-by-wilder` -> `code-reviewer-by-wilder`
- 设计还原：`ui-pixel-replication-by-wilder` -> `figma` -> `figma-implement-design` -> `code-reviewer-by-wilder`

## Output Format

- `Activated Skills`: 本次触发的技能与理由；若某个理论相关技能未触发，说明原因。
- `Implementation Notes`: 关键分析或改动点。
- `Risk Notes`: 主要风险、边界和未完成项。
- `Verification`: 已验证、未验证和验证方式。