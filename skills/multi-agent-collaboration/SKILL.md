---
name: multi-agent-collaboration
description: 当仓库任务可能影响产品行为、UI/UX、代码、配置、资源、规格、文档或验证证据时使用；纯聊天说明、翻译或改写且不影响仓库产物时不要使用。
---

# 多角色协作

## 目标

由 AI 根据当前目标和仓库事实，动态选择 Product、Designer、Coder、Reviewer 及其 Skill。只读取必要上下文，不依赖额外配置或解析程序。

## 铁律

1. 项目规则、写入门禁、当前代码/diff/日志和用户最新纠正优先于 Skill。
2. 复杂度按影响和风险判断，不按改动行数判断。
3. 每个 Skill 只能由下方允许的角色使用；跨角色需求必须交接，不能代跑。
4. Coder 必须等待已选 Product/Designer 为 `READY` 或明确 `SKIPPED`。
5. Reviewer 独立读取真实产物和新鲜证据；高风险或用户可见交付还需 Product 最终验收。

状态仅使用：`READY`、`SKIPPED`、`BLOCKED`、`REWORK`、`PASS`、`ACCEPTED`、`REJECTED`。

## 固定 Agent 身份与复用

Product、Designer、Coder、Reviewer 是固定 Codex custom agents，不是按功能、页面、阶段或重试次数创建的临时 Agent。固定配置来自目标项目 `.codex/agents/`：

| 角色 | `agent_type` | 固定 `task_name` |
|---|---|---|
| Product | `product` | `product` |
| Designer | `designer` | `designer` |
| Coder | `coder` | `coder` |
| Reviewer | `reviewer` | `reviewer` |

在同一个根任务树中执行以下规则：

1. 每个角色最多存在一个运行时实例。首次派发前，以及用户继续、恢复或实质改变范围后，先调用 `list_agents` 建立角色登记表。
2. 角色选择不等于创建 Agent；只派发本轮选中的角色，`SKIPPED` 角色不启动。
3. 已有固定角色时必须复用：空闲、完成或中断状态使用 `followup_task`；运行中补充信息使用 `send_message`；需要替换当前工作时先 `interrupt_agent`，再对同一 Agent 使用 `followup_task`。
4. 只有当前根任务树中完全不存在该固定角色时，才允许调用一次 `spawn_agent`，并且必须使用上表精确的 `agent_type` 与 `task_name`。
5. 禁止创建 `designer_xxx`、`coder_patch`、`reviewer_2` 等任务型、阶段型、日期型或重试型名称；禁止为 `REWORK`、超时、用户催促或补充上下文创建同角色替身。
6. `REWORK` 返回原 Designer 或 Coder，复审返回原 Reviewer，最终验收返回原 Product。主 Agent 不得把同一角色的不同阶段拆成多个 Agent。
7. 固定角色无法被查询、复用或创建时，由主 Agent 按同一角色契约串行执行并披露原因；不得用另一个临时同角色 Agent 绕过。

## 动态流程

```text
理解目标与门禁
  -> 判断复杂度
  -> 按需读取上下文
  -> 选择角色
  -> 每个角色选择 1 个主 Skill，必要时增加 1 个辅助 Skill
  -> 实施、审查、验收
```

### 复杂度

| 等级 | 判断信号 | 最小角色 |
|---|---|---|
| `SIMPLE` | 说明、文档、格式或可证明不改变行为的机械修改。 | Main；需要写入时加 Coder。 |
| `STANDARD` | 范围明确的 bugfix 或小功能，影响集中且验收清楚。 | Product `CONFIRM`、Coder、Reviewer；UI 不变则跳过 Designer。 |
| `COMPLEX` | 新页面/流程、UI/交互、多模块、状态、生命周期、导航或需求仍需澄清。 | Product、相关时 Designer、Coder、Reviewer。 |
| `HIGH_RISK` | 登录/认证/账号、支付、权限、安全、隐私、数据迁移、签名、发布、依赖/工具链升级或破坏性操作。 | Product、Coder、Reviewer；UI 受影响时加 Designer。 |

该表是判断参考，不是固定路由。发现新的行为、模块、数据、权限或发布影响时，必须重新分级。

`HIGH_RISK` 必须在实现前列出专项验证；Reviewer 只有在适用的认证/会话/凭据、支付、权限/隐私/数据、迁移回滚、签名/发布/依赖风险均有证据时才能 `PASS`，否则 `BLOCKED`。

### 按需上下文

始终先读：用户最新目标、适用的 `AGENTS.md`/项目规则、写入与验证门禁、仓库状态/diff、直接相关代码入口、可见精确 Skill ID。

| 触发 | 再读取 |
|---|---|
| 范围、流程、验收变化或争议 | 相关 PRD、OpenSpec、issue、RFC、ADR。 |
| UI、交互、资源、文案或 a11y | 设计源、截图、token、主题、组件和现有页面先例。 |
| 架构、依赖、构建或平台配置 | 相关模块、接口、构建文件、Manifest/平台配置。 |
| bug、崩溃、回归或性能 | 原始日志、错误、复现步骤、相关测试和最近 diff。 |
| 发布、权限、隐私或迁移 | 项目专用门禁、发布配置、平台声明和回滚要求。 |

每轮只读取足以支持下一个决策的上下文。关键事实缺失或冲突时返回 `BLOCKED`；非关键缺口有唯一仓库先例时可以复用并记录证据。

### 路由声明

`SIMPLE` 可用一句话；其他任务在工作前发布：

```yaml
complexity: STANDARD
reasons: []
context_now: []
roles:
  Product: CONFIRM
  Designer: SKIPPED
  Coder: REQUIRED
  Reviewer: REQUIRED
skills_by_role: {}
validation: []
blockers: []
```

## 角色

使用最小有效角色集合，跳过时说明依据。

| 角色 | 何时参与 | 必须输出 | 禁止 |
|---|---|---|---|
| Main | 所有受本 Skill 编排的任务。 | 复杂度、上下文、角色/Skill 路由、最终交付。 | 代替子角色使用其专属 Skill。 |
| Product | 目标、范围、流程、验收或高风险决策需要确认。 | 目标、范围、可观察验收标准；参与时做最终验收。 | 编辑实现或决定视觉细节。 |
| Designer | UI、交互、资源、动效、响应式或 a11y 受影响。 | 设计源、组件/token/状态约束和设计验收条件。 | 编辑实现或扩大产品范围。 |
| Coder | 需要修改代码、配置、资源、规格或脚本。 | 实际改动、验收映射、验证证据和未验证项。 | 自行扩大范围或替 Reviewer 宣布通过。 |
| Reviewer | 存在实现产物、用户可见行为、配置/发布变更或完成声明。 | 按严重度列问题及证据，给出 `PASS/REWORK/BLOCKED`。 | 直接修代码、补产品范围或做新设计。 |

环境支持 custom agents 时，Main 按“固定 Agent 身份与复用”协议调用选中的 `product`、`designer`、`coder`、`reviewer`；不支持时说明原因，并按同一契约串行执行。

## Skill 所有权

- 只能使用表中的精确 ID；不得模糊匹配、静默替换或编造 Skill。
- 每角色每轮默认 1 个主 Skill，确有独立需要时最多增加 1 个辅助 Skill。
- 必要 Skill 不可用时返回 `BLOCKED`；角色契约本身足够且风险可控时可不加载 Skill。
- 含 `:` 的 ID 是原生插件 Skill，直接使用，不包装、重命名或复制。
- 共享 Skill 按动作分工：Product 定义/验收，Designer 定设计，Coder 实施/修复，Reviewer 独立审查。

| 允许角色 | 精确 Skill ID |
|---|---|
| Main | `multi-agent-collaboration`, `agent-harness` |
| Product | `before-you-build`, `openspec-explore`, `openspec-propose`, `page-route-book`, `architecture-visualization:explore` |
| Designer | `design-system-patterns`, `interaction-design`, `taste-quality-gate`, `design-md`, `stitch-design-taste`, `stitch-ui-design`, `ui-pixel-replication-by-wilder`, `animation-vocabulary`, `find-animation-opportunities`, `architecture-visualization:architecture-communicator`, `design-review:design-system-capture`, `design-review:ui-designer` |
| Coder | `code-up-by-wilder`, `code-cleanup-by-wilder`, `refactor-cleaner-by-wilder`, `code-rewrite-similarity`, `systematic-debugging`, `openspec-apply-change`, `android-reverse-engineering`, `social-gateway-api-sync`, `solution-architecture-by-wilder`, `architecture-visualization:system-modeler`, `architecture-visualization:legacy-system-visualizer`, `architecture-visualization:c4model`, `architecture-visualization:graphviz`, `architecture-visualization:drawio` |
| Reviewer | `code-review-excellence`, `code-reviewer-by-wilder`, `verification-before-completion`, `review-animations`, `openspec-archive-change`, `architecture-visualization:risk-quality-reviewer`, `architecture-visualization:architecture-health`, `design-review:visual-regression-review`, `design-review:design-debt-review` |
| Reviewer（Android） | `android_ui_verification`, `test-android-apps:android-emulator-qa`, `test-android-apps:android-performance`。优先使用外部设备 QA；不得与 legacy 入口同时加载；性能 Skill 仅在明确性能任务中使用。 |
| Product + Reviewer | `reverse-doc-skill`, `app-store-optimization`, `google-play-aso-stack` |
| Product + Coder + Reviewer | `project-release`, `touch-release`, `architecture-visualization:dependency-impact-analyzer` |
| Product + Designer + Coder | `architecture-visualization:flow-visualizer` |
| Designer + Reviewer | `improve-animations`, `design-review:design-md-review`, `design-review:design-qa`, `design-review:accessibility-review` |
| Designer + Coder | `emil-design-eng`, `design-review:ui-alignment-review`, `design-review:responsive-design` |
| Designer + Coder + Reviewer | `apple-design` |
| Coder + Reviewer | `coding-standards-by-wilder`, `error-handling-patterns`, `architecture-visualization:deployment-topology-analyzer`, `architecture-visualization:evolution-planner`, `design-review:component-library-alignment` |

触发到当前角色不拥有的 Skill 时，必须交给允许角色；Coder 需要设备或性能证据时只能交给 Reviewer。

Emil Kowalski 能力包以 Web UI 和动效为主。Android/Flutter 任务只能复用目的、节奏、可中断性、性能和 reduced-motion 等平台无关原则，不得照搬 CSS、WAAPI、React 或 Web 组件实现。

## 执行与交接

```text
INTAKE -> PRODUCT/SKIP -> DESIGN/SKIP -> CODER/SKIP -> REVIEW/SKIP
REWORK -> 负责角色修正 -> REVIEW
PASS -> Product 最终验收（需要时） -> Main 交付
```

角色交接使用：

```yaml
role: Product | Designer | Coder | Reviewer
status: READY | SKIPPED | BLOCKED | REWORK | PASS | ACCEPTED | REJECTED
sources_read: []
skills_used: []
criteria: []
decisions: []
evidence: []
blockers: []
handoff_to: Product | Designer | Coder | Reviewer | Main
```

未读取的来源或 Skill 不得写入。Reviewer 发现问题只返回 `REWORK`；修正后必须重新审查。任何子角色都不能直接向用户交付最终结论。

## 快速路由示例

| 任务 | 结果 |
|---|---|
| 纯文档或格式修改 | `SIMPLE`；Main，写入时加 Coder；仅在已证明无行为影响且项目未强制审查时 `SKIPPED` Reviewer。 |
| 范围明确的非 UI bug | `STANDARD`；Product `CONFIRM`、Coder、Reviewer。 |
| 新 UI 页面或交互流程 | `COMPLEX`；Product、Designer、Coder、Reviewer。 |
| 登录、支付、权限或发布 | `HIGH_RISK`；Product、Coder、Reviewer，UI 受影响时加 Designer。 |
| Coder 需要 Android 设备证据 | 交接 Reviewer，由 Reviewer 选择对应设备 QA Skill。 |

## 完成门禁

Main 最终交付前必须确认：

- 所有选中角色已到终态，所有 `REWORK` 已复审关闭。
- 涉及代码、配置、用户行为或发布时，Reviewer 为 `PASS`。
- Product 参与，或任务用户可见/`HIGH_RISK` 时，Product 为 `ACCEPTED`。
- 已检查真实 diff/产物，没有覆盖无关用户改动。
- 验证证据新鲜，并明确区分已验证、未验证和受限验证。
- 没有角色越权调用 Skill，插件和项目规则没有被绕过。
- 每个选中角色只有一个固定 Agent 实例，继续、返工、复审和最终验收均复用原实例。
- 最终结论由 Main 汇总；仍缺关键事实或证据时只能 `BLOCKED`。
