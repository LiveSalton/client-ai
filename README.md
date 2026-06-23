# client-ai

`client-ai` 用于集中管理客户端研发场景下的 AI 辅助资产，当前主要沉淀为可复用的 `skills`。这些 skill 面向 Android 客户端、OpenSpec 流程、Figma 设计还原、代码质量治理和文档反向梳理等工作流，便于在不同 AI 编码工具之间复用同一套规范。

> 当前仓库仍在整理中：已有内容以 `skills/` 为主；`agents/`、`commands/`、`rules/` 已预留目录，但暂未放入可用文件。

## 目录结构

```text
client-ai/
├── agents/                  # 预留：不同 AI Agent 的配置或编排文件
├── commands/                # 预留：命令模板或快捷指令
├── rules/                   # 预留：通用规则、项目规则或工具规则
└── skills/
    ├── link-client-skills   # 将本仓库 skill 链接到目标 AI 工具目录的脚本
    ├── code-up-by-wilder/
    ├── code-cleanup-by-wilder/
    ├── code-reviewer-by-wilder/
    ├── coding-standards-by-wilder/
    ├── figma/
    ├── figma-implement-design/
    ├── implement-design/
    ├── karpathy-guidelines/
    ├── openspec-apply-change/
    ├── openspec-archive-change/
    ├── openspec-explore/
    ├── openspec-propose/
    ├── planning-workflows-by-wilder/
    ├── refactor-cleaner-by-wilder/
    ├── reverse-doc-skill/
    ├── social-gateway-api-sync/  # 预留：当前为空，待补充具体 skill 内容
    ├── solution-architecture-by-wilder/
    └── ui-pixel-replication-by-wilder/
```

## 核心功能

### 1. Skill 资产集中管理

每个 skill 使用独立目录维护，核心入口为 `SKILL.md`。部分 skill 还带有辅助文件，例如：

- `agents/openai.yaml`：特定 Agent 的配置补充。
- `assets/`：Figma 相关图标资源。
- `references/`：Figma MCP 配置、工具说明和提示词参考。

### 2. 多工具链接脚本

`skills/link-client-skills` 是一个 Python 脚本，用于把本仓库中的 skill 以符号链接方式安装到目标项目的 AI 工具目录。

当前脚本支持的目标工具：

- `claude` → `.claude/skills`
- `codex` → `.codex/skills`
- `cursor` → `.cursor/skills`
- `lingma` → `.lingma/skills`
- `trae` → `.trae/skills`

常用命令：

```bash
# 交互式选择目标工具和 skill
python3 skills/link-client-skills

# 链接全部 skill 到 Codex
python3 skills/link-client-skills --agents codex --skills all

# 链接指定 skill 到多个工具
python3 skills/link-client-skills --agents codex,cursor --skills code-up-by-wilder,code-cleanup-by-wilder

# 查看将要执行的链接操作，不修改文件
python3 skills/link-client-skills --agents all --skills all --dry-run
```

脚本会在发现目标位置已存在普通文件、目录，或指向其他来源的符号链接时停止，并提示冲突路径，避免覆盖已有配置。

## 已收录 Skills

### 工作流入口

| Skill | 用途 |
| --- | --- |
| `code-up-by-wilder` | 编码、重构、修复、审查前的技能调度入口，用于判断应启用哪些质量工作流。 |
| `karpathy-guidelines` | 减少常见 LLM 编码错误，强调先思考、保持简单、最小改动和可验证目标。 |

### 编码规范与质量治理

| Skill | 用途 |
| --- | --- |
| `coding-standards-by-wilder` | 跨项目通用编码规范，覆盖命名、状态、错误处理、测试和结构组织。 |
| `code-cleanup-by-wilder` | 在保持功能不变的前提下清理最近改动代码，提升清晰度、一致性和可维护性。 |
| `refactor-cleaner-by-wilder` | 用于保守清理死代码、重复代码、未使用导出或依赖。 |
| `code-reviewer-by-wilder` | 面向合并前审查，重点检查回归、安全风险、可维护性风险和缺失测试。 |

### 规划、架构与文档

| Skill | 用途 |
| --- | --- |
| `planning-workflows-by-wilder` | 在编码前输出有路径、边界、步骤和验证标准的实施计划。 |
| `solution-architecture-by-wilder` | 设计或调整系统架构时，梳理职责、接口、数据流和权衡。 |
| `reverse-doc-skill` | 从现有代码反向生成产品文档和技术文档，强调以代码为事实来源。 |

### Figma 与 UI 还原

| Skill | 用途 |
| --- | --- |
| `figma` | 使用 Figma MCP 获取设计结构、截图、变量和素材，并转译到项目约定。 |
| `figma-implement-design` | 基于 Figma 节点实现生产代码，强调截图、资产和项目约定的 1:1 对齐。 |
| `implement-design` | Figma 设计转代码的通用实现流程。 |
| `ui-pixel-replication-by-wilder` | 统一处理 Figma、截图、CSS 的 UI 像素级复刻和校验。 |

### OpenSpec 工作流

| Skill | 用途 |
| --- | --- |
| `openspec-explore` | 进入探索模式，用于需求澄清、问题调查和方案讨论。 |
| `openspec-propose` | 创建 OpenSpec change，并生成 proposal、design、tasks 等提案文档。 |
| `openspec-apply-change` | 按 OpenSpec change 的任务清单实施变更。 |
| `openspec-archive-change` | 在变更完成后归档 OpenSpec change。 |

## 使用建议

1. 先把本仓库放在目标项目内或目标项目附近，确保 `skills/link-client-skills` 能找到项目根目录。
2. 使用 `--dry-run` 预览链接结果，确认不会与已有 skill 冲突。
3. 将需要共享的 skill 链接到对应工具目录，例如 `.codex/skills`、`.cursor/skills`。
4. 在具体项目的 `AGENTS.md` 或工具规则中声明必须启用的入口 skill，例如 `code-up-by-wilder`。

## 当前状态与后续补充

当前已具备：

- 一组客户端研发相关 skill。
- Figma 设计实现相关参考文件与资源。
- OpenSpec 常用工作流 skill。
- 面向多 AI 工具的 skill 链接脚本。

当前暂未体现：

- `agents/` 下的 Agent 配置集合。
- `commands/` 下的命令模板。
- `rules/` 下的通用规则文件。
- `skills/social-gateway-api-sync/` 的具体 skill 内容。

后续补齐这些目录后，应同步更新本文档，保持 README 与仓库实际内容一致。
