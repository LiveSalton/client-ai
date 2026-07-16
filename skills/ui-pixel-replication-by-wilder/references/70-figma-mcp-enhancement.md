# 70 - Figma MCP 增量增强

## 何时读取

- 输入源包含 Figma 设计稿，且项目已经存在 Figma MCP 能力时读取。
- 进入设计稿实现、资产校准、组件复用判断或实现审查前读取。
- 只作为 `10-input-cache.md`、`20-visual-analysis.md`、`50-assets-icons.md`、`60-implementation-review.md` 的补充，不替换原流程。

## 非侵入原则

本文件是从 `figma-implement-design` 中抽取的复刻增强策略，但只以增量方式接入当前 skill：

- 不改写既有 opsx / OpenSpec 治理流程。
- 不跳过 proposal 确认、ASCII 证据和置信度门禁。
- 不新增第二套规格体系。
- 不重排原有模块、不替换原有输出模板。
- 不引入官方 Figma API、官方节点抓取流程或 `figma-implement-design` 的直接执行步骤。
- 设计稿数据的获取、解析与应用必须完全经由项目既有 Figma MCP 架构完成。

## 明确排除项

设计稿实现环节不得执行以下内容：

| 排除项 | 原因 | 替代方式 |
| --- | --- | --- |
| 直接采用 `figma-implement-design` 的 Step 1/2/3/4 | 这些步骤会把外部官方流程作为主流程，破坏当前 skill 的 opsx 与置信度门禁结构 | 仅借鉴其“结构化上下文 + 截图 + 资产 + 校验”的思想 |
| 技能自行解析 Figma URL 后调用官方节点接口 | 节点定位责任应由项目已有 Figma MCP 适配层承担 | 将 Figma 输入记录为 `design_ref`，交给项目 MCP 解析 |
| 新增官方 Figma API token、REST 调用或外部下载脚本 | 会引入并行数据通道，导致缓存、审计和复现困难 | 统一使用项目 MCP 返回的上下文、截图引用和资产引用 |
| 直接采用 MCP 返回的 React / Tailwind 代码作为最终实现 | 可能与项目技术栈、组件库和既有风格冲突 | 只把 MCP 输出当作设计事实和映射参考 |

## 整合思路

### 步骤衔接

| 原流程位置 | 增强接入方式 | 产物去向 |
| --- | --- | --- |
| `10-input-cache.md` 输入收集 | 通过项目 Figma MCP 生成 `DesignPacket`，并整块缓存原始响应 | 当前 OpenSpec change 的输入源、缓存路径、冲突表 |
| `20-visual-analysis.md` 视觉分析 | 用 MCP 的结构化节点、tokens、截图引用校准元素表、bounds、style 和 source | 元素表、区域表、图标候选、低置信度项 |
| `25-ascii-confidence.md` 门禁 | 用 MCP 几何和截图对 ASCII 1:1、ASCII 层级线稿做二次校验 | 置信度表、blocked 项、下一轮修复动作 |
| `40-subagent-splitting.md` 实现分片 | 将 MCP 数据解析、组件映射、资产处理、视觉校验作为独立分片输入，而不是改写原分片结构 | 子 agent 任务输入、所有权边界 |
| `50-assets-icons.md` 资产处理 | 优先使用项目 MCP 暴露的资产引用；失败时走原有 placeholder / deferred / failed 状态 | 资产候选表、资源路径与失败原因 |
| `60-implementation-review.md` 主审查 | 在原审查清单上追加 MCP 对照：结构化节点、截图 overlay、tokens、组件复用 | 复用点、最小修改、风险、未验证项 |

### 技术栈匹配度分析

| 能力 | 当前 skill | Figma MCP 增强 | 匹配度 | 处理原则 |
| --- | --- | --- | --- | --- |
| 状态管理 | opsx / OpenSpec change 作为唯一状态源 | MCP 只提供输入事实 | 高 | MCP 产物必须回写 change，不单独成体系 |
| 视觉证据 | ASCII 1:1、层级线稿、置信度表 | 截图、节点树、tokens、assets | 高 | MCP 数据用于提高证据密度，不替代 ASCII |
| 实现组织 | 子 agent 分片 + 主 agent 严审 | 可拆成设计数据、组件映射、资产、校验分片 | 高 | 作为分片输入，不扩大 agent 数量上限 |
| 样式体系 | 项目既有代码、组件、资源优先复用 | Figma tokens 与设计事实 | 中高 | 先映射项目 tokens；冲突处记录并按优先级判定 |
| 资产来源 | 候选清单、命名 fallback、placeholder | MCP 资产引用 | 高 | 只接入当前实现需要的资产，禁止批量导入 |
| 代码风格 | 项目约定与最小修改 | MCP 可能输出示例代码 | 中 | 不直接粘贴示例代码，只提取设计约束 |

### 资源复用策略

1. 先扫描项目已有组件、tokens、图标和资源命名，再决定是否新增。
2. MCP 返回的颜色、字号、间距、圆角、阴影先映射到项目 design tokens；无法等价映射时标记为 `token_gap`。
3. 组件复用优先于重新创建；只有现有组件无法在验收阈值内达到视觉一致时，才允许新增变体或局部样式扩展。
4. 资产只导入当前确认范围内实际可见且实现必需的项；其余记录为 `deferred`。
5. 所有 MCP 原始响应、截图引用、派生索引和映射表分别缓存，禁止覆盖原始数据。

## 功能重叠与优先级判定

| 重叠点 | 原 skill 已有能力 | Figma MCP 增强能力 | 判定标准 | 最终处理 |
| --- | --- | --- | --- | --- |
| 输入优先级 | Figma 结构化数据优先 | MCP 可返回结构化上下文 | 数据通道必须来自项目既有 MCP | 保留原优先级，补充 MCP 来源约束 |
| 视觉分析 | VLM / CSS / Figma 共同生成元素表 | 节点树和截图可校准 bounds / style | 有 MCP 实测值时优先于截图推断；冲突必须回写 change | MCP 用于校准，不替代元素表 |
| ASCII 证据 | 必须输出 ASCII 1:1 与层级线稿 | MCP 可提供层级和几何参考 | ASCII 是门禁必需产物 | MCP 只用于提高 ASCII 准确度 |
| 资产处理 | 候选、下载、placeholder、failed | MCP 可提供资产引用 | 只使用确认范围内必需资产 | 接入候选表，不绕过原状态记录 |
| 组件复用 | 实现前扫描复用点 | Figma workflow 强调设计系统复用 | 项目已有组件优先，视觉偏差超阈值则记录冲突 | 保留最小修改原则 |
| 最终校验 | 主 agent 对照 ASCII / 置信度审查 | screenshot overlay 可量化比较 | 原审查不可省略，overlay 是增强证据 | 追加量化指标，不替换主审 |

### 优先级规则

从高到低执行：

1. 用户已确认的 OpenSpec proposal / design / tasks / spec。
2. 当前 skill 的硬门禁：proposal 先行、ASCII 证据、置信度阈值、用户确认、子 agent 所有权。
3. 项目既有 Figma MCP 架构返回的数据事实。
4. 项目既有组件、tokens、资源和代码风格。
5. Figma MCP 截图 overlay 与结构化节点校验结果。
6. 截图 / CSS / VLM 推断。
7. `figma-implement-design` 中可借鉴的通用经验。

若 3 与 4 冲突：

- 视觉偏差仍在验收阈值内：优先项目既有组件和 tokens。
- 视觉偏差超过验收阈值：记录为 `design_system_conflict`，在当前 change 中说明，并采用最小局部扩展或等待用户确认。
- 不允许为了局部像素一致性进行无关重构、批量格式化或跨模块替换。

## MCP 接口契约

本 skill 不规定具体函数名，只规定项目 Figma MCP 适配层必须能提供以下语义产物；实际调用名称以项目现有架构为准。

### 输入

```text
design_ref: <用户给出的 Figma 引用、项目内部设计稿引用或当前 MCP 选择态>
scope: <page|frame|component|region>
change: <当前 OpenSpec change>
cache_dir: <当前页面工作区缓存目录>
```

### 输出

```text
DesignPacket:
  source: project_figma_mcp
  design_ref: <稳定引用>
  viewport: <width x height>
  raw_context_cache: <path>
  screenshot_ref: <path|mcp_ref>
  node_tree: <nodes with stable ids, bounds, hierarchy>
  tokens: <colors, typography, spacing, radii, effects>
  assets: <image/icon/svg refs with bounds and semantic role>
  warnings: <missing/truncated/conflict/unsupported>
```

### 异常状态

| 状态 | 处理 |
| --- | --- |
| `mcp_unavailable` | 不进入实现；回写 change，并降级到截图 / CSS / VLM 分析或请求用户补充输入 |
| `selection_missing` | 不猜测节点；要求通过项目 MCP 重新提供可解析的 `design_ref` |
| `payload_truncated` | 按区域或子节点拆分获取；原始截断响应仍需缓存 |
| `asset_unavailable` | 记录 `failed` 或 `placeholder`，不得静默替换为无关资源 |
| `token_gap` | 记录 Figma 值、项目候选 token、偏差和处理决策 |
| `visual_mismatch` | 回到 R4 Repair；连续两轮无法改善时转人工确认 |

## 对比测试方案

目标是比较“原 skill 流程”与“原 skill + 项目 Figma MCP 增强”在同一设计稿上的复刻表现。每个测试样本必须保留原始输入、实现 commit、截图和审查记录。

### 测试集

| 样本类型 | 最少数量 | 目的 |
| --- | --- | --- |
| 简单组件 | 3 | 测 button / input / card 等组件级还原 |
| 中等页面区块 | 3 | 测导航、列表、表单、弹层等组合布局 |
| 复杂首屏 | 2 | 测多区域、图像、图标、响应式和异常处理 |

### 三个维度指标

| 维度 | 指标 | 计算方式 | 目标阈值 |
| --- | --- | --- | --- |
| 视觉还原度 | `visual_score` | `0.35*layout + 0.25*style + 0.20*typography + 0.10*assets + 0.10*responsive` | 增强后 `>= 0.92` |
| 开发效率 | `efficiency_gain` | `(baseline_minutes - enhanced_minutes) / baseline_minutes` | 相对提升 `20% - 35%` |
| 可维护性 | `maintainability_score` | `0.30*reuse + 0.25*token_mapping + 0.20*minimal_diff + 0.15*test_pass + 0.10*docs` | 增强后 `>= 0.85` |

#### 视觉还原度子指标

| 子项 | 衡量标准 | 满分条件 |
| --- | --- | --- |
| `layout` | 关键元素 bounds 偏差、间距偏差、对齐偏差 | 关键元素位置 / 尺寸偏差 `<= 2px`，普通元素 `<= 4px` |
| `style` | 颜色、圆角、边框、阴影 | 颜色 RGB 单通道偏差 `<= 3`，圆角 / 边框偏差 `<= 2px` |
| `typography` | 字号、字重、行高、字距 | 字号 / 行高偏差 `<= 1px`，字重等价或有明确映射 |
| `assets` | 图标、图片、头像、状态徽标 | 必需资产无缺失，尺寸偏差 `<= 2px` |
| `responsive` | 约束、换行、溢出、状态 | 目标断点无明显错位或截断 |

#### 开发效率子指标

| 子项 | 衡量标准 |
| --- | --- |
| `analysis_minutes` | 从输入锁定到 proposal 可确认的时间 |
| `implementation_minutes` | 从确认到首个可审实现的时间 |
| `repair_rounds` | R4 Repair 次数，越少越好 |
| `manual_questions` | 因设计稿识别不清向用户追问次数 |

#### 可维护性子指标

| 子项 | 衡量标准 |
| --- | --- |
| `reuse` | 复用项目已有组件 / tokens / 资源的比例，目标 `>= 70%` |
| `token_mapping` | Figma tokens 映射到项目 tokens 的覆盖率，目标 `>= 80%` |
| `minimal_diff` | 实际修改文件和 LOC 是否只覆盖确认范围 |
| `test_pass` | lint / typecheck / unit / visual review 是否通过 |
| `docs` | 冲突、假设、未验证项是否写回 change |

## 设计准确性提升评估

### 准确性总分

```text
accuracy_score =
  0.30 * element_coverage +
  0.25 * geometry_accuracy +
  0.20 * style_accuracy +
  0.15 * hierarchy_accuracy +
  0.10 * asset_accuracy
```

| 子项 | 衡量标准 | 目标 |
| --- | --- | --- |
| `element_coverage` | Figma / 截图中可见元素是否全部进入元素表和 ASCII | `>= 0.95` |
| `geometry_accuracy` | bounds、间距、对齐、容器尺寸 | `>= 0.92` |
| `style_accuracy` | 颜色、字体、圆角、阴影、透明度 | `>= 0.90` |
| `hierarchy_accuracy` | 层级线稿与 MCP node tree / 视觉阅读顺序一致 | `>= 0.92` |
| `asset_accuracy` | 必需资产识别、引用、尺寸和语义 | `>= 0.90` |

### 预期提升

在同等输入质量和同等实现范围下，预期增强后相对原流程达到：

- 综合 `accuracy_score` 相对提升 `12% - 20%`。
- `geometry_accuracy` 相对提升 `15% - 25%`。
- `element_coverage` 相对提升 `8% - 15%`。
- low confidence 项数量下降 `30% - 50%`。
- 因设计稿识别不清导致的返工轮次下降 `20% - 35%`。

以上为目标提升区间；每次实际执行必须基于同一设计稿、同一验收范围和同一截图基线记录实测值，不能用预期值替代测试结果。

## 增量质量校验清单

- [ ] 是否只新增本增强文件和必要入口读取规则。
- [ ] 是否未改写原有 opsx、ASCII、低级模型循环、子 agent 分片和主审查规则。
- [ ] 是否明确排除了官方 `figma-implement-design` 节点获取流程。
- [ ] 是否所有 Figma 数据均经项目已有 Figma MCP 进入。
- [ ] 是否定义了 MCP 语义输入 / 输出 / 异常状态。
- [ ] 是否保留原始 MCP 响应缓存与派生数据分离。
- [ ] 是否建立功能重叠优先级和冲突处理规则。
- [ ] 是否提供视觉还原度、开发效率、可维护性三维量化评估。
- [ ] 是否定义准确性提升衡量标准和预期提升百分比。

## 版本控制策略

- 本增强必须作为单独 commit 或单独 patch 提交，commit message 建议为：`docs(skill): add project Figma MCP replication enhancement`。
- 禁止在同一 commit 中混入格式化、重命名、目录重组或无关文案调整。
- 审查时先看 `git diff --stat`，再看新增块是否只影响本文件和入口读取规则。
- 若后续要扩展实现细节，继续新增 `references/7x-*` 文件，不直接重写已有 `00-60` 模块。

## 最小主审结论模板

```text
module_structure: <pass|blocked> - <模块划分是否仍保持 00-70 单向补充>
interface_definition: <pass|blocked> - <DesignPacket 输入输出是否清晰>
flow_completeness: <pass|blocked> - <异常、版本、质量校验是否覆盖>
official_figma_excluded: <pass|blocked> - <是否完全排除官方节点获取步骤>
minimal_change: <pass|blocked> - <是否仅新增增强和入口读取规则>
open_risks: <未验证项>
```
