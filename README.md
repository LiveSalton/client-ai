# client-ai

`client-ai` 用于集中管理客户端研发场景下的 AI 辅助资产，当前沉淀为可复用的 `skills`、Codex custom agents 与 Codex plugins。这些资产面向 Android 客户端、OpenSpec 流程、Stitch/UI 设计、代码质量治理、多 Agent 协作、架构可视化、设计评审和文档反向梳理等工作流，便于在不同 AI 编码工具之间复用同一套规范。

> 当前仓库仍在整理中：已有内容以 `skills/` 和 `agents/codex/` 为主；`commands/`、`rules/` 已预留目录，但暂未放入可用文件。

## 目录结构

```text
client-ai/
├── .agents/
│   └── plugins/
│       └── marketplace.json   # repo-local Codex plugin marketplace
├── agents/
│   └── codex/               # Codex custom agents 配置
├── commands/                # 预留：命令模板或快捷指令
├── install-link-client-skills
├── plugins/
│   ├── architecture-visualization/
│   └── design-review/
├── rules/                   # 预留：通用规则、项目规则或工具规则
└── skills/
    ├── link-client-skills   # 将本仓库 skill 链接到目标 AI 工具目录的脚本
    ├── agent-harness/
    ├── multi-agent-collaboration/
    ├── before-you-build/
    ├── design-system-patterns/
    ├── interaction-design/
    ├── taste-quality-gate/
    ├── error-handling-patterns/
    ├── systematic-debugging/
    ├── code-review-excellence/
    ├── verification-before-completion/
    ├── android_ui_verification/
    ├── android-reverse-engineering/
    ├── app-store-optimization/
    ├── code-up-by-wilder/
    ├── code-cleanup-by-wilder/
    ├── code-reviewer-by-wilder/
    ├── code-rewrite-similarity/
    ├── coding-standards-by-wilder/
    ├── design-md/
    ├── openspec-apply-change/
    ├── openspec-archive-change/
    ├── openspec-explore/
    ├── openspec-propose/
    ├── page-route-book/
    ├── google-play-aso-stack/
    ├── project-release/
    ├── refactor-cleaner-by-wilder/
    ├── reverse-doc-skill/
    ├── social-gateway-api-sync/
    ├── solution-architecture-by-wilder/
    ├── stitch-design-taste/
    ├── stitch-ui-design/
    ├── touch-release/
    └── ui-pixel-replication-by-wilder/
```

## 核心功能

### 1. Skill 资产集中管理

每个 skill 使用独立目录维护，核心入口为 `SKILL.md`。部分 skill 还带有辅助文件，例如：

- `agents/openai.yaml`：特定 Agent 的配置补充。
- `references/`：工具说明、提示词或流程参考。

### 2. 多工具链接脚本

`skills/link-client-skills` 是一个 Python 脚本，用于把本仓库中的 skill 和 Codex custom agents 以符号链接方式安装到目标项目的 AI 工具目录。

当前脚本支持的目标工具：

- `claude` → `.claude/skills`
- `codex` → `.codex/skills`
- `agent` → `.agent/skills`
- `cursor` → `.cursor/skills`
- `lingma` → `.lingma/skills`
- `trae` → `.trae/skills`

Codex custom agents 单独链接到：

- `.codex/agents`

安装为全局命令：

```bash
cd /Users/salton/codeGit/client-ai
./install-link-client-skills
```

脚本会执行等价于下面的安装流程：

```bash
mkdir -p ~/.local/bin
chmod +x /Users/salton/codeGit/client-ai/skills/link-client-skills
ln -sfn /Users/salton/codeGit/client-ai/skills/link-client-skills ~/.local/bin/link-client-skills
```

如果 `~/.local/bin` 不在 `PATH` 中，需要把下面内容加入 shell 配置：

```bash
export PATH="$HOME/.local/bin:$PATH"
```

常用命令：

```bash
# 在任意项目目录交互式选择目标工具和 skill
cd /path/to/project
link-client-skills

# 在 client-ai 仓库内直接调用脚本
python3 skills/link-client-skills

# 链接全部 skill 到 Codex
link-client-skills --agents codex --skills all

# 链接多 Agent 协作能力；选中 multi-agent-collaboration 时会自动链接 Codex custom agents
link-client-skills --agents all \
  --skills multi-agent-collaboration,before-you-build,design-system-patterns,interaction-design,taste-quality-gate,error-handling-patterns,systematic-debugging,code-review-excellence,verification-before-completion

# 仅链接 Codex custom agents
link-client-skills --codex-agents all

# 只链接 skill，不自动链接 Codex custom agents
link-client-skills --agents all --skills multi-agent-collaboration --no-codex-agents

# 链接指定 skill 到多个工具
link-client-skills --agents codex,cursor --skills code-up-by-wilder,code-cleanup-by-wilder

# 重置已安装的 skill 软链接
link-client-skills --reset

# 查看将要执行的链接操作，不修改文件
link-client-skills --agents all --skills all --dry-run
```

脚本会在目标位置已存在普通文件、目录，或指向其他来源的符号链接时提示冲突路径；用户取消则停止，用户确认后才覆盖目标。

### 3. Codex 插件市场

`client-ai` 也维护 repo-local Codex plugin marketplace，用来分发原生 Codex 插件，而不是把插件内容复制成普通 skill。

Marketplace 文件：

```text
/Users/salton/codeGit/client-ai/.agents/plugins/marketplace.json
```

当前插件：

| Plugin | 来源 | 用途 |
| --- | --- | --- |
| `architecture-visualization` | Qoder `architecture-visualization` 转换为 Codex plugin | 架构建模、流程图、依赖影响、部署拓扑、演进计划、风险评审、架构健康检查 |
| `design-review` | Qoder `design-review` 转换为 Codex plugin | 设计契约、UI 对齐、视觉回归、可访问性、组件库一致性、设计债、响应式评审 |

首次安装到 Codex：

```bash
codex plugin marketplace add /Users/salton/codeGit/client-ai
codex plugin add architecture-visualization@client-ai
codex plugin add design-review@client-ai
```

安装后，多角色流程通过 `multi-agent-collaboration` 直接调用这些插件的原生 skill，例如：

- `architecture-visualization:system-modeler`
- `architecture-visualization:dependency-impact-analyzer`
- `architecture-visualization:risk-quality-reviewer`
- `design-review:design-qa`
- `design-review:ui-alignment-review`
- `design-review:accessibility-review`

原则：插件能力保持插件形态；`client-ai/skills/multi-agent-collaboration` 只定义 Product、Designer、Coder、Reviewer 在什么场景下调用哪个原生 plugin skill。

角色对应插件：

| 角色 | 默认插件 | 使用边界 |
| --- | --- | --- |
| Product | `architecture-visualization` | 用于业务流、数据流、范围影响和验收标准判断；不主导设计评审插件 |
| Designer | `design-review`, `architecture-visualization` | `design-review` 是主责插件；`architecture-visualization` 只用于页面流、状态流和架构约束表达 |
| Coder | `architecture-visualization`, `design-review` | `architecture-visualization` 是实现前/实现中的架构理解插件；`design-review` 只用于按设计评审结果修 UI |
| Reviewer | `architecture-visualization`, `design-review` | 两个插件都用于最终证据审核：架构风险/健康与设计 QA/视觉/a11y/设计债 |

插件主责：

| Plugin | 主责角色 | 协作角色 |
| --- | --- | --- |
| `architecture-visualization` | Coder, Reviewer | Product, Designer |
| `design-review` | Designer, Reviewer | Coder |

### 4. AI 动态任务编排

`skills/multi-agent-collaboration/SKILL.md` 是唯一编排来源，不再增加配置文件、登记表或解析代码。

每个任务由 AI 直接执行下面的流程：

```text
理解用户目标和项目规则
  -> 判断 SIMPLE / STANDARD / COMPLEX / HIGH_RISK
  -> 按风险读取最少必要上下文
  -> 选择 Product / Designer / Coder / Reviewer
  -> 从对应角色 allowlist 选择精确 Skill
  -> 实现、独立审查、必要时 Product 验收
```

AI 会在发现新事实时重新判断复杂度并扩大上下文，而不是预先读取整个仓库或全部 Skill。触发到某个 Skill 时，必须交给拥有该 Skill 的角色审查和跟进，不能跨角色代跑。

Android 设备和性能验证仍直接使用已存在的外部能力 `test-android-apps:android-emulator-qa` 与 `test-android-apps:android-performance`，两者归 Reviewer；不复制进本仓库，也不通过额外登记文件间接发现。

## 已收录 Skills

### 项目协作与文档

| Skill | 用途 |
| --- | --- |
| `agent-harness` | 为项目生成 `AGENTS.md` 入口和 `doc/` 协作文档体系。 |
| `multi-agent-collaboration` | 编排 Product、Designer、Coder、Reviewer 的角色门禁、状态机、交接格式和交付门禁。 |
| `before-you-build` | 在新产品、MVP、Agent 工作流或重大功能开工前做产品风险预检。 |
| `page-route-book` | 扫描页面、生成页面路书，并维护页面中文定位注释。 |
| `reverse-doc-skill` | 从现有代码反向生成产品文档和技术文档。 |

### 多 Agent 角色方法

| Skill | 用途 |
| --- | --- |
| `design-system-patterns` | 将设计事实映射为组件、token、资源和命名约束。 |
| `interaction-design` | 定义交互流、状态表、反馈、取消、重试和恢复行为。 |
| `taste-quality-gate` | 对新视觉、重设计、首屏、订阅页等做最终视觉质量检查。 |
| `error-handling-patterns` | 处理网络、文件、权限、系统 API、计费、广告、并发和生命周期等失败路径。 |
| `systematic-debugging` | 在 bug、崩溃、构建失败或异常行为修复前做根因调查。 |
| `code-review-excellence` | 对代码、配置、资源、构建、迁移或脚本变更做独立审查。 |
| `verification-before-completion` | 在声明完成、通过、可提交或可交付前收集新鲜验证证据。 |

### 编码规范与质量治理

| Skill | 用途 |
| --- | --- |
| `code-up-by-wilder` | 编码、重构、修复、审查前的技能调度入口，用于判断应启用哪些质量工作流。 |
| `coding-standards-by-wilder` | 跨项目通用编码规范，覆盖命名、状态、错误处理、测试和结构组织。 |
| `code-cleanup-by-wilder` | 在保持功能不变的前提下清理最近改动代码，提升清晰度、一致性和可维护性。 |
| `refactor-cleaner-by-wilder` | 用于保守清理死代码、重复代码、未使用导出或依赖。 |
| `code-reviewer-by-wilder` | 面向合并前审查，重点检查回归、安全风险、可维护性风险和缺失测试。 |
| `code-rewrite-similarity` | 按功能重写项目并检查新旧代码相似度。 |

### 规划、架构与流程

| Skill | 用途 |
| --- | --- |
| `solution-architecture-by-wilder` | 设计或调整系统架构时，梳理职责、接口、数据流和权衡。 |
| `openspec-explore` | 进入 OpenSpec 探索模式，用于需求澄清、问题调查和方案讨论。 |
| `openspec-propose` | 创建 OpenSpec change，并生成 proposal、design、tasks 等提案文档。 |
| `openspec-apply-change` | 按 OpenSpec change 的任务清单实施变更。 |
| `openspec-archive-change` | 在变更完成后归档 OpenSpec change。 |

### UI、Stitch 与设计

| Skill | 用途 |
| --- | --- |
| `design-md` | 分析 Stitch 项目并生成语义化 `DESIGN.md`。 |
| `stitch-design-taste` | 为 Google Stitch 生成高质量视觉风格约束和设计系统提示。 |
| `stitch-ui-design` | 编写 Google Stitch UI/UX 设计提示词。 |
| `ui-pixel-replication-by-wilder` | 统一处理 Figma、截图、CSS 的 UI 像素级复刻和校验。 |

### 移动端专项

| Skill | 用途 |
| --- | --- |
| `android_ui_verification` | legacy 兼容入口；默认优先由 Reviewer 使用外部 `test-android-apps:android-emulator-qa`，两者不同时加载。 |
| `android-reverse-engineering` | 对 APK、XAPK、JAR 或 AAR 做反编译、接口提取和调用链分析。 |
| `app-store-optimization` | App Store 和 Google Play 的 ASO 研究、优化与跟踪。 |
| `google-play-aso-stack` | Google Play 商店元数据、素材、实验、本地化和评价策略专项。 |
| `project-release` | 按项目事实编排版本检查、构建、发布和发布后验证。 |
| `touch-release` | 移动端发布流水线、Fastlane、签名、CI 和 beta 分发。 |

### 项目特定专项

| Skill | 用途 |
| --- | --- |
| `social-gateway-api-sync` | 面向 `noviplay_cli` Android 客户端补齐 Social Gateway 接口调用链。 |

## 使用建议

1. 将本仓库作为中心仓库维护，通过 `install-link-client-skills` 安装全局命令。
2. 进入目标项目根目录后执行 `link-client-skills`，脚本会把当前工作目录作为目标项目目录。
3. 使用 `--dry-run` 预览链接结果，确认不会与已有 skill 冲突。
4. 将需要共享的 skill 链接到对应工具目录，例如 `.codex/skills`、`.cursor/skills`。
5. 在具体项目的 `AGENTS.md` 或工具规则中声明必须启用的入口 skill，例如 `code-up-by-wilder`。

## 当前状态与后续补充

### Codex Custom Agents

| Agent | 用途 |
| --- | --- |
| `product` | 需求目标、范围、用户流程、数据源、验收标准和最终产品验收。 |
| `designer` | 设计源转译、组件映射、状态、token、资源、交互和动效约束。 |
| `coder` | 在 Product/Designer 已确认范围内实现，不扩大范围，不绕过项目规则。 |
| `reviewer` | 独立检查实际 diff、文档同步、验证证据、回归风险和交付结论。 |

### 角色 Skill 分配

`multi-agent-collaboration` 是完整路由源，这里只保留人类可快速扫描的摘要。当前只启用 Product、Designer、Coder、Reviewer 四个核心角色；架构、QA、发布、安全、数据能力先由四个核心角色按 skill 路由承担。

| 角色 | 默认主责 Skill |
| --- | --- |
| Main Agent | `multi-agent-collaboration`, `agent-harness` |
| Product | `before-you-build`, `openspec-explore`, `openspec-propose`, `page-route-book`, `reverse-doc-skill`, `app-store-optimization`, `google-play-aso-stack`, `project-release`, `touch-release`, `architecture-visualization:explore`, `architecture-visualization:flow-visualizer`, `architecture-visualization:dependency-impact-analyzer` |
| Designer | `design-system-patterns`, `interaction-design`, `taste-quality-gate`, `design-md`, `stitch-design-taste`, `stitch-ui-design`, `ui-pixel-replication-by-wilder`, `architecture-visualization:flow-visualizer`, `architecture-visualization:architecture-communicator`, `design-review:design-system-capture`, `design-review:design-md-review`, `design-review:design-qa`, `design-review:ui-alignment-review`, `design-review:responsive-design`, `design-review:accessibility-review`, `design-review:ui-designer` |
| Coder | `code-up-by-wilder`, `coding-standards-by-wilder`, `code-cleanup-by-wilder`, `refactor-cleaner-by-wilder`, `code-rewrite-similarity`, `error-handling-patterns`, `systematic-debugging`, `openspec-apply-change`, `android-reverse-engineering`, `social-gateway-api-sync`, `solution-architecture-by-wilder`, `project-release`, `touch-release`, `architecture-visualization:system-modeler`, `architecture-visualization:dependency-impact-analyzer`, `architecture-visualization:flow-visualizer`, `architecture-visualization:deployment-topology-analyzer`, `architecture-visualization:evolution-planner`, `architecture-visualization:legacy-system-visualizer`, `architecture-visualization:c4model`, `architecture-visualization:graphviz`, `architecture-visualization:drawio`, `design-review:ui-alignment-review`, `design-review:component-library-alignment`, `design-review:responsive-design` |
| Reviewer | `code-review-excellence`, `code-reviewer-by-wilder`, `verification-before-completion`, `android_ui_verification`, `test-android-apps:android-emulator-qa`, `test-android-apps:android-performance`, `openspec-archive-change`, `coding-standards-by-wilder`, `error-handling-patterns`, `reverse-doc-skill`, `app-store-optimization`, `google-play-aso-stack`, `project-release`, `touch-release`, `architecture-visualization:risk-quality-reviewer`, `architecture-visualization:architecture-health`, `architecture-visualization:dependency-impact-analyzer`, `architecture-visualization:deployment-topology-analyzer`, `architecture-visualization:evolution-planner`, `design-review:design-qa`, `design-review:visual-regression-review`, `design-review:accessibility-review`, `design-review:component-library-alignment`, `design-review:design-debt-review`, `design-review:design-md-review` |

当前已具备：

- 一组客户端研发相关 skill。
- Stitch 与 UI 设计相关 skill。
- OpenSpec 常用工作流 skill。
- 多 Agent 协作 skill、角色方法 skill 和 Codex custom agents。
- Codex plugin marketplace，以及 `architecture-visualization`、`design-review` 两个已转换插件。
- 面向多 AI 工具的 skill 链接脚本。
- 全局安装脚本 `install-link-client-skills`。

当前暂未体现：

- `commands/` 下的命令模板。
- `rules/` 下的通用规则文件。

后续补齐这些目录后，应同步更新本文档，保持 README 与仓库实际内容一致。
