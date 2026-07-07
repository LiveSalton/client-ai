---
name: multi-agent-collaboration
description: 当仓库任务可能影响产品行为、UI/UX、代码、配置、资源、规格、文档或验证证据时使用；纯聊天说明、翻译或改写且不影响仓库产物时不要使用。
---

# 多角色协作

## 目标

用 Product、Designer、Coder、Reviewer 四个核心角色管理客户端研发任务，确保每次变更都绑定项目规则、规格事实、设计事实、当前代码事实、写入权限和验证证据。

这是编排契约。其他角色 skill、插件 skill 只能提供方法，不能覆盖本文件、项目规则或当前仓库事实。

## 铁律

```text
未完成角色选择和必要输入门禁前，不得实现。
未完成必要审查和 Product 最终验收前，不得交付。
```

只有在用户明确要求时才派发 Codex custom agents。选定角色后，主 Agent 必须明确调用 `product`、`designer`、`coder`、`reviewer` 中被选中的 custom agents；如果当前环境不能派发子 Agent，必须说明，并由主 Agent 按同一角色契约串行执行，不能假装子 Agent 已运行。

## 状态词表

只能使用这些状态：

- `READY`：角色门禁完成，下一个角色可以继续。
- `SKIPPED`：该角色与本任务无关，已记录跳过理由。
- `BLOCKED`：关键输入、权限、事实或证据缺失/冲突。
- `REWORK`：实现或设计必须返工。
- `PASS`：Reviewer 没有阻塞问题，且必要验证证据充分。
- `ACCEPTED`：Product 确认交付结果满足目标、范围和验收标准。
- `REJECTED`：Product 发现需求未满足或范围漂移。

不要使用“conditional pass”。如果仍有必须完成的工作，只能是 `REWORK` 或 `BLOCKED`。

## 启动协议

每个新任务、恢复任务或实质性范围变化开始前，先执行本协议。

### 1. 绑定项目事实

读取所有可访问的权威来源，并绑定这些值：

| 变量 | 含义 |
|---|---|
| `USER_GOAL` | 用户最新明确目标和最新纠正。 |
| `PROJECT_RULES` | 当前 `AGENTS.md`、覆盖规则、仓库规则、编码规范、目录级指令。 |
| `WRITE_GATE` | 当前沙箱、审批策略、保护路径、写入授权。 |
| `SPEC_SOURCE` | OpenSpec/opsx、PRD、issue、RFC、ADR、已批准计划或其他规格事实。 |
| `DESIGN_SOURCE` | `.stitch/DESIGN.md`、`.stitch/` 规则、设计稿、token、组件库、截图或等价设计事实。 |
| `CURRENT_FACTS` | 当前代码、配置、日志、仓库状态、diff、未跟踪文件、用户提供材料。 |
| `VALIDATION_POLICY` | 允许/必须运行的测试、构建、lint、设备检查、人工检查，以及禁止命令。 |
| `AVAILABLE_SKILLS` | 当前会话可见的精确 skill ID。 |

每项标记为 `FOUND`、`MISSING`、`N/A` 或 `CONFLICT`。

### 2. 按事实类型处理优先级

不要用一套全局优先级处理所有冲突。

执行权限：

```text
运行时/沙箱限制
> 项目写入和验证门禁
> 用户对本任务的授权
> skill 建议
```

产品意图：

```text
用户最新明确目标/纠正
> 当前已批准规格
> 旧计划和历史记录
```

实现事实：

```text
当前代码/配置/diff/日志
> 当前项目文档
> 参考项目
> 插件 skill 或示例
> Agent 推断
```

插件 skill 不是项目事实来源。

### 3. 处理缺失或冲突

先读可用来源，再决定是否提问。

1. 如果缺口会影响用户可见行为、产品范围、数据来源、设计真相、写入授权、验收标准或完成证据，相关角色必须返回 `BLOCKED` 并提出精确问题。
2. 如果缺口不会影响这些结果，且仓库有唯一清晰先例，可以复用该先例并记录证据。
3. “常见做法”“大概”“名字像”都不是证据。
4. 不得编造数据源、设计规则、命令、依赖或验收标准。

### 4. 选择角色

使用最小有效角色集合。每个跳过角色都要记录证据化理由。

| 任务形态 | Product | Designer | Coder | Reviewer |
|---|---|---|---|---|
| 纯聊天说明、翻译、改写，不影响仓库或产物 | `SKIPPED` | `SKIPPED` | `SKIPPED` | `SKIPPED` |
| 只涉及产品范围、用户流程、信息架构、验收标准 | `FULL` | UI/UX 受影响时需要 | `SKIPPED` | 有重大风险时需要 |
| UI/UX 设计但不实现 | `FULL` 或 `CONFIRM` | 必须 | `SKIPPED` | 可选设计合规审查 |
| UI/UX 实现 | `FULL` 或 `CONFIRM` | 必须 | 必须 | 必须 |
| 非 UI 功能实现且已有批准规格 | `CONFIRM` | `SKIPPED` | 必须 | 必须 |
| 非 UI bug、构建失败、行为回归 | `CONFIRM` | 用户可见 UI 行为变化时需要 | 必须 | 必须 |
| 只审查已有 diff | 验收标准缺失/争议时需要 | 设计合规在范围内时需要 | `SKIPPED` | 必须 |
| 纯机械格式化且可证明不影响行为、设计、规格、文档 | `SKIPPED` | `SKIPPED` | 主 Agent 或 Coder | 按项目审查策略 |

`FULL` 表示 Product 定义或修改目标、范围、流程、数据源和验收标准。`CONFIRM` 表示绑定已批准规格，防止 Coder 自行扩大范围。

### 5. 发布参与声明

角色工作开始前，主 Agent 必须说明：

- 选中的角色和角色模式。
- 跳过的角色及证据化理由。
- 每个角色的输入、输出和完成标准。
- 当前阻塞项。
- 已选用的精确 skill ID。

## Skill 与插件路由

每个角色只能使用 allowlist 中的精确 skill ID。默认每个角色每轮最多加载两个条件性 skill；一个足够时不要加载两个。

通用规则：

1. 不得模糊匹配、静默替换或使用“最接近”的 skill。
2. 精确 skill 不可用时，报告能力缺口；只有角色契约仍能安全覆盖时才继续。
3. 缺失 skill 是必要能力时，必须 `BLOCKED`。
4. 项目专用平台 skill 只能通过明确项目 allowlist 加入。
5. 如果 skill 建议与 `PROJECT_RULES`、`WRITE_GATE` 或 `VALIDATION_POLICY` 冲突，跳过冲突部分并记录原因。
6. 角色不得调用本角色 allowlist 之外的 skill；不能用“我只是辅助看一下”绕过角色边界。
7. 当任务、用户措辞、文件类型或当前证据触发某个 skill 时，主 Agent 必须先把该 skill 映射到下方对应角色，再由该角色审查、执行或跟进；当前角色不拥有该 skill 时必须交接给拥有角色，不能代跑。
8. 同一个 skill 出现在多个角色 allowlist 时，只能按本角色段落描述的边界使用：Product 定目标和验收，Designer 定设计事实和 UI 约束，Coder 执行实现，Reviewer 独立审查证据。
9. `skills_used` 只能记录该角色实际读取并且属于该角色 allowlist 的精确 skill ID；禁止把其他角色读取或应该读取的 skill 写入自己的交接信封。

### 角色 Skill 所有权

以这张表作为快速归属判断。更细触发条件以各角色 allowlist 条目为准。

| 归属 | Skill | 审查和跟进责任 |
|---|---|---|
| Main Agent | `multi-agent-collaboration`, `agent-harness` | 主 Agent 负责启动、角色选择、项目事实绑定、harness 文档入口；子角色不得把这两个 skill 当作自己的业务能力。 |
| Product | `before-you-build`, `openspec-explore`, `openspec-propose`, `page-route-book`, `reverse-doc-skill`, `app-store-optimization`, `google-play-aso-stack`, `project-release`, `touch-release`, `architecture-visualization:explore`, `architecture-visualization:flow-visualizer`, `architecture-visualization:dependency-impact-analyzer` | Product 负责产品目标、范围、用户流程、信息架构、发布意图、商店定位、ASO 策略、验收标准和最终产品验收。 |
| Designer | `design-system-patterns`, `interaction-design`, `taste-quality-gate`, `design-md`, `stitch-design-taste`, `stitch-ui-design`, `ui-pixel-replication-by-wilder`, `architecture-visualization:flow-visualizer`, `architecture-visualization:architecture-communicator`, `design-review:design-system-capture`, `design-review:design-md-review`, `design-review:design-qa`, `design-review:ui-alignment-review`, `design-review:responsive-design`, `design-review:accessibility-review`, `design-review:ui-designer` | Designer 负责设计源、设计系统、组件/token/资源映射、交互状态、视觉质量、响应式、a11y 设计约束和设计侧 QA。 |
| Coder | `code-up-by-wilder`, `coding-standards-by-wilder`, `code-cleanup-by-wilder`, `refactor-cleaner-by-wilder`, `code-rewrite-similarity`, `error-handling-patterns`, `systematic-debugging`, `openspec-apply-change`, `android-reverse-engineering`, `social-gateway-api-sync`, `solution-architecture-by-wilder`, `project-release`, `touch-release`, `architecture-visualization:system-modeler`, `architecture-visualization:dependency-impact-analyzer`, `architecture-visualization:flow-visualizer`, `architecture-visualization:deployment-topology-analyzer`, `architecture-visualization:evolution-planner`, `architecture-visualization:legacy-system-visualizer`, `architecture-visualization:c4model`, `architecture-visualization:graphviz`, `architecture-visualization:drawio`, `design-review:ui-alignment-review`, `design-review:component-library-alignment`, `design-review:responsive-design` | Coder 负责在 Product/Designer READY 或 SKIPPED 后执行代码、调试、重构、OpenSpec task、发布实现、逆向分析和项目专项 API 同步。 |
| Reviewer | `code-review-excellence`, `code-reviewer-by-wilder`, `verification-before-completion`, `android_ui_verification`, `openspec-archive-change`, `coding-standards-by-wilder`, `error-handling-patterns`, `reverse-doc-skill`, `app-store-optimization`, `google-play-aso-stack`, `project-release`, `touch-release`, `architecture-visualization:risk-quality-reviewer`, `architecture-visualization:architecture-health`, `architecture-visualization:dependency-impact-analyzer`, `architecture-visualization:deployment-topology-analyzer`, `architecture-visualization:evolution-planner`, `design-review:design-qa`, `design-review:visual-regression-review`, `design-review:accessibility-review`, `design-review:component-library-alignment`, `design-review:design-debt-review`, `design-review:design-md-review` | Reviewer 负责只读独立审查真实 diff、设计/规格符合度、验证证据、发布证据、ASO 输出质量、架构健康和回归风险。 |

### 跨角色交接规则

- Product 触发的 scope、OpenSpec、ASO、发布目标或验收标准问题，必须由 Product 先 `READY` 或 `BLOCKED`；Coder 不能先实现，Reviewer 不能替 Product 定范围。
- Designer 触发的设计系统、Stitch、像素复刻、UI 对齐、响应式或 a11y 设计问题，必须由 Designer 先 `READY` 或 `BLOCKED`；Coder 不能猜设计，Reviewer 不能替 Designer 做新设计决策。
- Coder 触发的实现、调试、重构、逆向、发布执行或架构产物生成问题，必须由 Coder 跟进；Reviewer 发现问题后返回 `REWORK`，不能直接修。
- Reviewer 触发的代码审查、设计 QA、视觉回归、a11y 审查、架构健康、发布验证或完成验证问题，必须由 Reviewer 独立审查；Product/Designer/Coder 的自评不能替代 Reviewer。
- 共享 skill 必须按动作归属：定义/验收归 Product，设计/约束归 Designer，实施/修复归 Coder，审查/验证归 Reviewer。
- 如果一个角色发现需要其他角色 skill，当前角色输出 `handoff_to` 指向对应角色，并说明触发证据、所需 skill、待审查问题和阻塞条件。

### 外部 Codex 插件

`architecture-visualization` 和 `design-review` 是由 `client-ai` 管理的外部 Codex 插件。必须直接使用插件原生 skill，不要包装、重命名、复制到 `client-ai/skills`，也不要在插件 skill 可用时用本地 skill 替代。

预期插件 skill ID：

- 架构插件：`architecture-visualization:explore`、`architecture-visualization:system-modeler`、`architecture-visualization:flow-visualizer`、`architecture-visualization:dependency-impact-analyzer`、`architecture-visualization:deployment-topology-analyzer`、`architecture-visualization:evolution-planner`、`architecture-visualization:risk-quality-reviewer`、`architecture-visualization:architecture-health`、`architecture-visualization:architecture-communicator`、`architecture-visualization:c4model`、`architecture-visualization:graphviz`、`architecture-visualization:drawio`。
- 设计插件：`design-review:design-qa`、`design-review:ui-alignment-review`、`design-review:visual-regression-review`、`design-review:accessibility-review`、`design-review:component-library-alignment`、`design-review:design-debt-review`、`design-review:design-md-review`、`design-review:design-system-capture`、`design-review:responsive-design`、`design-review:ui-designer`。

插件归属：

| 插件 | 主责角色 | 协作角色 | 用途 |
|---|---|---|---|
| `architecture-visualization` | Coder、Reviewer | Product、Designer | 架构理解、流程可视化、变更影响、部署拓扑、演进规划、架构健康。 |
| `design-review` | Designer、Reviewer | Coder | 设计契约、UI 对齐、视觉回归、可访问性、组件一致性、响应式、设计债。 |

角色到插件的路由：

| 角色 | 插件 | 使用边界 |
|---|---|---|
| Product | `architecture-visualization` | 澄清业务/数据流、评估范围和影响、辅助验收标准。 |
| Product | `design-review` | 默认不主导；只读取 Designer/Reviewer 输出用于最终验收。 |
| Designer | `architecture-visualization` | 表达页面流、状态流、数据移动和影响 UX 的架构约束。 |
| Designer | `design-review` | 主责设计系统捕获、`DESIGN.md`、Design QA、UI 对齐、响应式、可访问性设计约束和原型。 |
| Coder | `architecture-visualization` | 实现前/实现中理解系统、影响面、拓扑、演进和图源。 |
| Coder | `design-review` | 根据 UI 对齐、组件库、响应式结果修复实现。 |
| Reviewer | `architecture-visualization` | 审查架构风险、健康、影响、拓扑和演进证据。 |
| Reviewer | `design-review` | 审查 Design QA、视觉回归、可访问性、组件使用、设计债和 `DESIGN.md` 就绪度。 |

## 主 Agent 编排类 Skill

这些 skill 不归属于子角色，由主 Agent 在角色门禁前或门禁之间使用。

- `multi-agent-collaboration`：影响行为、UI/UX、代码、配置、资源、规格、文档或验证证据的仓库任务，都使用它作为编排契约。
- `agent-harness`：项目需要创建或刷新 `AGENTS.md` 与 `doc/` 协作文档体系时使用。

## Product 可调用 Skill

Product 负责用户价值、范围、优先级、规格形态、发布意图、商店定位和最终产品验收。

- `before-you-build`：新产品、MVP、上线、Agent 工作流或重大功能存在需求、定位、商业化、留存、信任、分发、采用风险时使用。
- `openspec-explore`：实现前澄清需求、探索方案或调查产品问题时使用。
- `openspec-propose`：把已批准方向生成 OpenSpec proposal/design/spec/tasks 时使用。
- `page-route-book`：需要页面清单、导航地图、页面归属或路由级产品理解时使用。
- `reverse-doc-skill`：需要从当前代码生成产品/技术文档时使用。
- `app-store-optimization`：处理 App Store / Google Play 定位、metadata、关键词、转化和商店表现时使用。
- `google-play-aso-stack`：处理 Google Play listing 审计、关键词、metadata、截图、icon、Store Listing Experiments、本地化、评分和增长衡量时使用。
- `project-release`：定义发布范围、目标渠道、metadata、changelog、rollout 和最终发布验收时使用。
- `touch-release`：仅用于定义发布需求和约束；实现和验证归 Coder/Reviewer。
- `architecture-visualization:explore`：重大功能定范围前需要广义架构判断时使用。
- `architecture-visualization:flow-visualizer`：产品范围依赖业务流、状态流、调用流或数据流时使用。
- `architecture-visualization:dependency-impact-analyzer`：优先级、发布范围或验收标准依赖跨模块/页面/服务/测试/数据/部署影响时使用。

OpenSpec/opsx 命令和连接器是项目工具或事实来源；除非当前环境暴露了精确 skill ID，否则不要发明 skill 名称。

## Designer 可调用 Skill

Designer 负责设计源转译、视觉系统、交互状态、组件映射、UI 验收标准和设计侧 QA。

- `design-system-patterns`：token 层级、主题、组件库规则、组件复用或设计到代码系统基础变化时使用。
- `interaction-design`：用户动作、加载、禁用、选中、空、错、成功、取消、重试、恢复、转场、手势或反馈状态在范围内时使用。
- `taste-quality-gate`：新视觉、改版、首屏、onboarding、空状态、订阅/升级、品牌表面或反模板化视觉质量检查时使用。
- `design-md`：分析 Stitch 项目并生成语义化 `DESIGN.md` 时使用。
- `stitch-design-taste`：为 Stitch 生成高质量视觉系统约束和反模板化 UI 标准时使用。
- `stitch-ui-design`：编写 Stitch 移动端或 Web UI/UX prompt 时使用。
- `ui-pixel-replication-by-wilder`：基于 Figma、截图或 CSS 做 UI 像素复刻和像素级设计约束时使用。
- `architecture-visualization:flow-visualizer`：需要可视化页面流、交互状态流、数据移动、失败/恢复路径以约束 UX 决策时使用。
- `architecture-visualization:architecture-communicator`：需要向产品、设计、工程或评审解释架构约束时使用。
- `design-review:design-system-capture`：从 Figma、截图、token、CSS、组件库或现有 UI 捕获/更新设计系统证据时使用。
- `design-review:design-md-review`：编写、审查或改进 `DESIGN.md` 设计契约时使用。
- `design-review:design-qa`：Designer 主导设计验收，覆盖契约、视觉、可访问性、组件和设计债时使用。
- `design-review:ui-alignment-review`：对比实现证据与批准设计参考时使用。
- `design-review:responsive-design`：响应式/自适应布局决策时使用。
- `design-review:accessibility-review`：设计或实现需要满足键盘、读屏、对比度、动效、触控目标或 WCAG 风格检查时使用。
- `design-review:ui-designer`：只用于 UI 概念、原型或设计系统探索。

不要加载 `mobile-android-design` 或发明跨平台替代 skill。平台指导必须来自项目事实或明确批准的精确 skill。

不要用 `design-review:ui-designer` 绕过 Product 范围或 Coder 所有权。仓库实现必须在 Product 和 Designer `READY` 后交给 Coder。

## Coder 可调用 Skill

Coder 负责实现、调试、重构、架构适配执行、OpenSpec task 执行、发布流水线改动和项目特定 API 集成。

- `code-up-by-wilder`：编码任务路由；用于决定实现、修改、重构、调试或审查时应启用哪些代码类 skill。
- `coding-standards-by-wilder`：编写、审查或重构应用代码时，按共享可读性、命名、错误处理、测试和结构标准使用。
- `code-cleanup-by-wilder`：保持行为不变，清理最近改动代码时使用。
- `refactor-cleaner-by-wilder`：保守删除死代码、重复代码、未使用导出或依赖时使用。
- `code-rewrite-similarity`：clean-room 风格重写、相似度检查和结构重写循环时使用。
- `error-handling-patterns`：网络、文件、存储、权限、系统 API、计费、广告、解析、异步、并发、生命周期、重试或用户可见失败路径在范围内时使用。
- `systematic-debugging`：bug、崩溃、测试失败、构建失败、性能问题、集成问题或异常行为修复前使用。
- `openspec-apply-change`：执行已批准 OpenSpec tasks 时使用。
- `android-reverse-engineering`：APK/XAPK/JAR/AAR 反编译、Android 逆向、接口提取、UI 到网络调用链追踪时使用。
- `social-gateway-api-sync`：只用于该 skill 定义的 `noviplay_cli` Android Social Gateway API 同步工作流。
- `solution-architecture-by-wilder`：实现需要架构设计、组件边界、接口、数据流或技术权衡时使用。
- `project-release`：Product 定义发布意图后，执行版本、metadata、产物、测试轨道、rollout 等发布任务时使用。
- `touch-release`：设置或修改移动端发布流水线、签名、Fastlane、CI、beta 分发或版本号时使用。
- `architecture-visualization:system-modeler`：跨模块实现前理解当前仓库架构时使用。
- `architecture-visualization:dependency-impact-analyzer`：改动可能影响模块、路由、API、测试、存储、权限、构建或部署前使用。
- `architecture-visualization:flow-visualizer`：实现需要精确业务流、数据流、调用流或状态流时使用。
- `architecture-visualization:deployment-topology-analyzer`：实现影响运行环境、CI/CD、发布拓扑、云资源或运维边界时使用。
- `architecture-visualization:evolution-planner`：迁移切片、现代化、架构演进或目标态实现规划时使用。
- `architecture-visualization:legacy-system-visualizer`：在文档不足的 legacy 系统中实现变更时使用。
- `architecture-visualization:c4model`：创建可维护 C4 / Structurizr DSL 架构产物时使用。
- `architecture-visualization:graphviz`：创建复杂 DOT 依赖、流程、部署、血缘、风险或影响图时使用。
- `architecture-visualization:drawio`：只有用户明确要求 Draw.io / diagrams.net 可编辑交付时使用。
- `design-review:ui-alignment-review`：修 UI 前解释设计与实现偏差时使用。
- `design-review:component-library-alignment`：实现必须使用现有设计系统组件或变体时使用。
- `design-review:responsive-design`：实现自适应布局时使用。

不要用后端导向的 `architecture-patterns` 替代 Android、iOS 或 Flutter 架构判断。当前仓库架构才是权威。

## Reviewer 可调用 Skill

Reviewer 负责独立审查、证据验证、回归风险、设计 QA 证据、架构健康、发布验证，以及 Product 验收前的最终质量门禁。

- `code-review-excellence`：审查代码、配置、资源、构建、迁移或脚本 diff 时使用。
- `code-reviewer-by-wilder`：合并前审查回归、安全、可维护性、缺失测试或架构偏移时使用。
- `verification-before-completion`：声明 `PASS`、`ACCEPTED`、可提交、可 PR 或可交付前使用。
- `android_ui_verification`：需要 Android Emulator / ADB UI 验证证据时使用。
- `openspec-archive-change`：实现和审查完成后归档 OpenSpec change 时使用。
- `coding-standards-by-wilder`：作为命名、结构、测试、可维护性审查标准时使用。
- `error-handling-patterns`：审查用户可见失败路径和恢复行为时使用。
- `reverse-doc-skill`：验证生成文档或检查文档与当前代码漂移时使用。
- `app-store-optimization`：审查 ASO 输出、metadata 质量和商店侧风险时使用。
- `google-play-aso-stack`：审查 Google Play ASO 方案、metadata、创意资产计划、实验队列、本地化、评分策略和衡量方案的证据质量时使用。
- `project-release`：验证发布证据、metadata、产物、测试轨道、rollout 和发布记录时使用。
- `touch-release`：验证移动端发布流水线、签名、Fastlane、CI、beta 分发和版本号变更时使用。
- `architecture-visualization:risk-quality-reviewer`：审查架构风险、质量属性、技术债、适应性函数和修复优先级时使用。
- `architecture-visualization:architecture-health`：验证架构产物是否与代码、配置、运行时、ADR 证据保持当前和可追溯时使用。
- `architecture-visualization:dependency-impact-analyzer`：检查 diff 是否影响了声明之外的模块、测试、数据或部署面时使用。
- `architecture-visualization:deployment-topology-analyzer`：审查运行、部署、发布拓扑风险时使用。
- `architecture-visualization:evolution-planner`：审查迁移计划、目标态缺口和架构演进切片时使用。
- `design-review:design-qa`：完整审查设计验收证据时使用。
- `design-review:visual-regression-review`：审查 expected/actual/diff 截图证据时使用。
- `design-review:accessibility-review`：审查可访问性证据和人工 a11y 判断时使用。
- `design-review:component-library-alignment`：检查设计系统组件使用时使用。
- `design-review:design-debt-review`：发现硬编码值、token 漂移、一次性 UI 模式和视觉维护风险时使用。
- `design-review:design-md-review`：审查 `DESIGN.md` 完整性和实现就绪度时使用。

不要用浏览器导向的 `e2e-testing-patterns` 作为通用客户端测试 skill。客户端用户路径审查属于 Reviewer 契约。只有项目明确使用 Espresso、XCUITest、Flutter integration-test、Patrol 或 Maestro 的精确 skill 时，才加入项目 allowlist。

## 工作流状态机

```text
INTAKE
  -> CONTEXT_BOUND
  -> PRODUCT_READY | PRODUCT_SKIPPED | BLOCKED
  -> DESIGN_READY | DESIGN_SKIPPED | BLOCKED
  -> IMPLEMENTED | IMPLEMENTATION_SKIPPED | BLOCKED
  -> REVIEW_PASS | REVIEW_REWORK | REVIEW_BLOCKED | REVIEW_SKIPPED

REVIEW_REWORK
  -> CODER_FIX or DESIGN_FIX
  -> REVIEW_AGAIN

REVIEW_PASS
  -> PRODUCT_ACCEPTED | PRODUCT_REJECTED | PRODUCT_FINAL_SKIPPED

PRODUCT_REJECTED
  -> RESPONSIBLE_ROLE_REWORK
  -> REVIEW_AGAIN when implementation/design artifacts changed
  -> PRODUCT_FINAL_AGAIN

PRODUCT_ACCEPTED or PRODUCT_FINAL_SKIPPED
  -> MAIN_AGENT_DELIVERY
```

Coder 只能在 Product `READY` 或明确 `SKIPPED`，且 Designer `READY` 或明确 `SKIPPED` 后开始。Reviewer 只能在已有实现或可审查产物后开始。任何子角色都不能直接向用户交付最终结论。

## Product 契约

Product 负责澄清用户价值、目标、范围、非目标、用户流程、信息架构、数据源、产品风险和可测试验收标准，并在 Reviewer `PASS` 后做最终产品验收。

Product 不编辑代码、不决定视觉细节、不批准代码质量。

输入：

- `USER_GOAL`、`PROJECT_RULES`、`SPEC_SOURCE`、相关 `CURRENT_FACTS`。
- 初始模式：`FULL` 或 `CONFIRM`。
- 最终验收模式：Designer/Coder/Reviewer 输出和证据。

初始输出：

- 模式。
- 目标和用户价值。
- 范围内与范围外。
- 相关用户流程/信息架构。
- 权威数据源。
- 稳定 ID 的验收标准，例如 `AC-01`。
- 假设和产品风险。
- 阻塞项。
- 状态：`READY` 或 `BLOCKED`。

每条验收标准必须可观察。不要写“表现良好”“看起来不错”等不可测试表述。

最终验收：

- `ACCEPTED`、`REJECTED` 或 `BLOCKED`。
- 未满足的验收标准 ID。
- 是否存在范围漂移。
- 剩余产品风险。
- 主 Agent 是否可以交付。

## Designer 契约

Designer 负责把已批准产品意图和当前设计事实转成布局、组件映射、token、资源命名、交互、动效和完整组件状态。

Designer 不编辑实现代码，除非主 Agent 明确改变本轮角色范围。

输入：

- Product 输出和验收标准。
- `DESIGN_SOURCE` 与相关 `.stitch/` 文件。
- 现有组件、主题、资源、命名约定和平台约束。
- 需要时读取当前实现。

Stitch 项目必须先读 `.stitch/DESIGN.md`。如果需要新设计决策但权威设计源缺失或冲突，返回 `BLOCKED`。窄范围变更若有唯一现有组件先例，可以复用并引用证据。

输出：

- 已读取的设计源。
- 页面/流程结构。
- 现有组件和资源映射。
- token 和命名决策。
- 相关默认、按下/聚焦、禁用、选中、加载、空、错、成功、取消、恢复状态。
- 交互和动效规则，包括减少动态效果和性能约束。
- 给 Coder 的实现约束。
- 设计风险和阻塞项。
- 状态：`READY` 或 `BLOCKED`。

项目设计事实优先于 `taste-quality-gate` 和所有插件示例。

## Coder 契约

Coder 只能在已批准范围内实现，并复用当前仓库架构、命名、模块边界、组件和文档约定。

入口门禁：

- Product `READY` 或已记录 `SKIPPED`。
- Designer `READY` 或已记录 `SKIPPED`。
- `PROJECT_RULES`、`WRITE_GATE`、相关规格/设计事实、`VALIDATION_POLICY`。
- 当前仓库状态和 diff，确保不覆盖用户已有改动。

行为要求：

- 不扩大范围。
- 未经明确批准不新增第三方依赖。
- 不复制参考项目实现。
- 不覆盖无关用户改动。
- 保持现有客户端架构，不按后端模式类比套用。
- 覆盖范围内失败状态，不只实现 happy path。
- 同步更新项目要求的规格/文档。
- 只运行授权验证命令。
- 验证被禁止或不可用时，明确报告未验证声明。

输出：

- 实现摘要。
- 改动文件和目的。
- 验收标准映射。
- 关键技术决策和仓库先例。
- 依赖和范围说明。
- 错误/失败处理。
- 规格/文档同步情况。
- 新鲜验证证据和未验证项。
- 风险和 Reviewer 关注点。
- 状态：`READY` 或 `BLOCKED`。

## Reviewer 契约

Reviewer 必须独立审查真实 diff/产物，对照 Product 验收标准、Designer 约束、项目规则、规格、文档要求、验证策略和回归风险。不得只依赖 Coder 总结。

审查维度：

- 需求和范围符合度。
- 相关设计系统和交互符合度。
- 正确性和边界情况。
- 基于真实仓库的架构/模块边界适配。
- 错误处理和用户反馈。
- 权限、隐私、安全、数据完整性、计费/广告、文件/存储、并发、性能、生命周期风险。
- 文档/规格同步。
- 验证充分性和新鲜度。
- 回归风险。

客户端用户路径必须覆盖相关分支：

```text
入口 -> 主操作 -> 成功结果
             -> 失败与恢复
             -> 取消/返回
             -> 权限拒绝/重试
             -> 系统页或外部跳转返回
             -> 进程中断/状态恢复
```

问题格式：

- 严重度：`Blocker`、`High`、`Medium`、`Low`。
- 文件和行号/符号/位置。
- 违反的验收标准、设计规则或项目规则。
- 问题和证据。
- 后果。
- 建议修正。
- 是否阻塞：yes/no。

结论只能是：

- `PASS`：无阻塞问题，且 `VALIDATION_POLICY` 要求的验证证据新鲜充分。
- `REWORK`：仍有可修正问题。
- `BLOCKED`：无法检查真实 diff、关键事实、授权或必要证据。

如果项目策略只允许静态/人工验证，必须明确说明范围。缺少必要证据不能用信心代替。

## 通用交接信封

每个角色回复必须以这个机器可读块开头：

```yaml
role: Product | Designer | Coder | Reviewer
mode: FULL | CONFIRM | INITIAL | FINAL_ACCEPTANCE | N/A
status: READY | SKIPPED | BLOCKED | REWORK | PASS | ACCEPTED | REJECTED
sources_read:
  - path-or-source
skills_used:
  - exact-skill-id
criteria_covered:
  - AC-01
decisions:
  - decision
evidence:
  - command/output/diff/path/manual-check
blockers:
  - blocker-or-none
handoff_to: Product | Designer | Coder | Reviewer | Main
```

没有读取的来源或 skill，不得写进 `sources_read` 或 `skills_used`。

## 主 Agent 交付门禁

最终回复前，主 Agent 必须确认：

- 已发布参与声明。
- 每个选中角色都有终态。
- 所有 `REWORK` 都已重新审查关闭。
- 需要 Reviewer 时，Reviewer 为 `PASS`。
- Product 参与时，Product 为 `ACCEPTED`。
- 已检查真实改动文件和新鲜验证证据。
- 已区分已执行验证和未执行验证。
- 风险和剩余事项明确。
- 没有子 Agent 或插件 skill 绕过项目规则。

最终回复应总结：

- Product 决策和最终验收。
- Designer 决策（如使用）。
- Coder 改动（如使用）。
- Reviewer 结论和发现（如使用）。
- 验证证据和未验证项。
- 风险、剩余工作，以及是否精确完成请求。

## 反合理化规则

| 合理化借口 | 必须响应 |
|---|---|
| “只是一行。” | 先判断影响，明确选择/跳过角色。大小不能证明低风险。 |
| “用户要快。” | 速度不能覆盖写入、设计、审查、文档或验收门禁。 |
| “产品需求很明显。” | 绑定已批准规格或 Product `CONFIRM`，不能让 Coder 自行推断范围。 |
| “设计可以猜。” | 读取设计源或引用唯一仓库先例，否则 `BLOCKED`。 |
| “名字相似的 skill 也行。” | 不得替代。报告缺失 skill，并按角色契约处理。 |
| “子 Agent 说通过了。” | 主 Agent 必须独立检查真实 diff 和新鲜证据。 |
| “测试跑不了，但应该没问题。” | 报告 `BLOCKED` 或精确说明有限证据，不能声称完成。 |
| “文档以后再补。” | 如果项目要求同步文档，任务未完成。 |
| “Reviewer 可以直接修。” | 返回负责角色 `REWORK`，修完后重新审查。 |
| “Product 已经同意计划。” | 最终验收仍需核对交付结果和验收标准。 |

## 自检

离开本 skill 前，用证据回答：

- 是否绑定了项目、规格、设计、写入、当前事实和验证来源？
- 是否选择或明确跳过了每个角色？
- 是否明确调用了选中的 Codex custom agents？
- 每个角色是否只使用精确 allowlist skill？
- Coder 是否等待 Product/Designer `READY` 或记录 `SKIPPED`？
- Reviewer 是否检查了真实产物和新鲜证据？
- 返工是否回到负责角色，并重新审查？
- 需要 Product 时，Product 是否完成最终验收？
- 最终交付是否由主 Agent 汇总，而不是子角色直接交付？

任一答案为“否”，流程就不能交付。
