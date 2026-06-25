---
name: project-release
description: Use when 需要规范、排查、补齐或执行移动端发布流程，涉及 Fastlane、App Store、Google Play、TestFlight、Firebase App Distribution、签名、CI、metadata、版本号、changelog、AAB、APK、IPA、测试轨道、正式发布或 rollout
---

# 项目发布流程

## Overview

本 skill 是项目发布调度层。项目差异必须来自当前仓库根目录的 `product_release_prop.md`；本 skill 只提供通用移动端发布判断、预检、执行和报告框架。

核心原则：优先复用项目原生发布入口；高风险动作必须获得当前轮明确授权；签名和凭据内容永远不得输出。本 skill 自包含发布流程规则，不依赖其他发布 skill。

## When to Use

使用场景：

- 规范、整理、修复或补齐移动端发布流程。
- 处理 Fastlane、App Store Connect、Google Play Console、TestFlight、Firebase App Distribution、内部测试轨道、正式发布或 rollout。
- 准备或校验商店 metadata、截图目录、release notes、changelog、本地化文案或字段长度限制。
- 调整版本号、build number、git tag、版本事实源或发布记录。
- 梳理签名、keystore、provisioning profile、service account、CI secret 或上传凭据规则。
- 运行发布预检、生成构建产物、上传 metadata、上传 AAB/APK/IPA 或检查远端发布状态。

不要用于：

- 普通功能开发、UI 修改、测试代码编写或非发布流程问题。
- 把某个项目的发布规则硬编码进本 skill。
- 在没有当前轮明确授权时执行构建、上传、签名、production、rollout 或商店提审。
- 打印、复制、解释原始密钥、密码、token、API JSON key 或 CI secret 内容。

## Core Pattern

1. 在当前项目根目录读取 `product_release_prop.md`。
2. 如果配置不存在，只做只读扫描并生成建议配置，等待用户确认。
3. 判断用户意图：讨论、文档、metadata、版本、预检、构建、上传、正式发布或 rollout。
4. 做只读发布面发现，记录平台、版本源、metadata、签名、脚本、CI、beta 渠道和提案同步要求。
5. 按优先级选择执行路径：项目配置、项目脚本、Fastlane lane、CI workflow、通用补齐模式。
6. 构建、上传、签名、production、rollout 前先 preflight，并再次确认授权。
7. 完成后报告文件变更、命令结果、未执行的发布动作、验证结果和人工检查项。

## Quick Reference

| 用户意图 | 先读取 | 可继续做 | 必须停止的情况 |
| --- | --- | --- | --- |
| 只讨论方案 | `product_release_prop.md`、发布文档 | 输出方案和风险 | 用户要求实际构建或上传但未授权 |
| 缺少项目配置 | 仓库发布文件、CI、版本源 | 生成 `product_release_prop.md` 建议内容 | 把项目特例写进本 skill |
| 准备 metadata | metadata 源文档、locale、字段限制 | 生成或校验商店资料 | 文案来源不明或字段超限未处理 |
| 调整版本 | 单一版本事实源、tag 规则 | 修改项目允许的版本文件 | 多个版本源冲突 |
| 发布预检 | preflight/status 命令、凭据路径、metadata | 运行只读检查并报告阻塞 | 预检会触发构建、上传或签名 |
| 构建产物 | build 命令、签名规则、目标轨道 | 只在授权后构建 | 未确认目标或签名状态 |
| 上传商店 | upload 命令、轨道、凭据、release notes | 只在授权后上传 | production/rollout 未明确授权 |
| 改发布流程 | 项目规范、提案要求、现有脚本 | 最小范围补齐或修复 | 会新建重复发布流水线 |

## Implementation

### 1. `product_release_prop.md` 合约

`product_release_prop.md` 是项目发布事实源。它应该至少说明：

- 发布目标集合和必须确认的目标。
- 移动端平台和框架，例如 iOS、Android、React Native、Expo、Flutter 或混合仓库。
- CI/CD 提供方、触发条件和 artifact 留存规则。
- 版本号或 build number 的事实源。
- 发布文档、商店文案和 metadata 的事实源。
- Fastlane、脚本、lane 和支撑文件的事实源。
- beta 分发渠道、测试组和通知渠道。
- preflight、build、upload、status 等命令入口。
- 签名、密钥、service account、CI secret 等凭据路径和禁止输出规则。
- 版本 bump、git tag 和 changelog 规则。
- 输出摘要格式或项目自定义报告格式。
- production、rollout、外部测试、商店提审等高风险门禁。
- 修改发布流程时必须同步的提案、规范或文档。
- 禁止执行的动作，例如未授权构建、上传、发布或测试代码修改。

如果配置与仓库实际文件冲突，停止并报告冲突，不要混用两套规则。

如果当前项目第一次使用本 skill 且根目录没有 `product_release_prop.md`，只生成建议内容并等待用户确认。建议结构：

```markdown
# 产品发布配置

## 发布目标
- 可选目标：
- 默认策略：
- 未明确目标时：

## 版本事实源
- 版本文件：
- 版本字段：
- 构建号字段：

## 发布文档
- 必读文档：
- 提案/规范同步：

## 命令入口
| 目标 | preflight | build | upload metadata | upload artifact | status |
| --- | --- | --- | --- | --- | --- |

## Metadata
- 商店文案源：
- Fastlane metadata 目录：
- changelog 规则：
- 本地化要求：

## 凭据与签名
- 本地凭据路径：
- CI secret：
- 禁止输出：

## 高风险门禁
- 构建：
- 上传：
- production：
- rollout：

## 禁止事项
- 未授权动作：
- 不得修改：
- 不得提交：

## 验证与交付
- 允许的只读验证：
- 完成后报告：
```

### 2. 意图分类

先判断用户要做的是哪一类发布工作：

- 只讨论或只给方案。
- 更新发布文档或发布 skill。
- 准备商店 metadata 或 changelog。
- 调整版本号。
- 运行发布预检。
- 生成构建产物。
- 上传商店 metadata。
- 上传 AAB、APK 或 IPA。
- 推进正式发布或 rollout。

凡涉及构建、上传、签名、凭据、production 轨道或 rollout，必须要求用户在当前轮明确授权。不要从历史对话推断权限。

### 3. 发现发布面

提出改动前先做只读扫描，并用 `product_release_prop.md` 中的路径补充扫描范围：

```bash
pwd
git status --short
test -f product_release_prop.md && sed -n '1,220p' product_release_prop.md
find . -maxdepth 3 -name AGENTS.md
find . -maxdepth 4 -iname '*release*' -o -iname '*fastlane*' -o -iname '*metadata*'
find . -maxdepth 3 -name '*.xcodeproj' -o -name '*.xcworkspace' -o -name 'build.gradle*' -o -name 'pubspec.yaml' -o -name 'package.json'
find . -maxdepth 3 -path './.github/workflows' -o -name 'bitrise.yml' -o -path './.circleci'
find . -maxdepth 3 -name '*.mobileprovision' -o -name 'Matchfile' -o -name 'Fastfile' -o -name 'Appfile' -o -name 'Pluginfile' -o -name '.env.default' -o -name '.env.beta' -o -name '.env.production'
rg -n "react-native|expo" package.json 2>/dev/null
rg -n "versionName|versionCode|CFBundleShortVersionString|CURRENT_PROJECT_VERSION|MARKETING_VERSION|fastlane|supply|deliver|pilot|match|firebase_app_distribution|signingConfig|keystore|KEYSTORE|GOOGLE_PLAY|APP_STORE|TestFlight|release" .
```

根据仓库实际情况调整命令。不要把本机专用命令包装器写入发布规范；命令执行方式以当前环境可用工具为准。

记录这些事实：

- 平台和框架。
- 产品目标、flavor、package id 或 bundle identifier。
- version name 和 build number 的唯一事实源。
- metadata 源文件和生成后的 metadata 目录。
- 签名与凭据路径，但不得打印密钥内容。
- 发布脚本和支持的命令。
- CI 提供方和发布触发条件。
- beta 分发渠道、测试组和通知渠道。
- Fastlane 支撑文件是否存在。
- 必须同步的进行中 proposal 或 spec。

### 4. 选择执行路径

按以下优先级选择执行路径：

1. `product_release_prop.md` 指定的命令和门禁。
2. 项目已有发布脚本或文档化命令。
3. 项目已有 Fastlane lane 或商店上传 helper。
4. 项目已有 CI workflow。
5. 本 skill 的通用发布搭建模式。

如果项目已有维护中的原生发布流程，不要另起一套发布流水线。优先修复、规范或补充现有流程。

### 5. 通用移动端发布框架

只有在项目没有既有发布能力，或用户明确要求搭建/补齐发布流程时，才使用本节。所有新增内容仍必须服从 `product_release_prop.md` 和项目门禁。

#### Fastlane 与脚本

- 优先识别已有 `fastlane/`、`Fastfile`、`Appfile`、`Pluginfile`、`Matchfile`、store upload helper 和 release shell script。
- 如需新建或补齐 Fastlane，支撑文件通常包括：
  - `fastlane/Fastfile`：lane 定义。
  - `fastlane/Appfile`：app identifier、team ID、package name 或商店 app id。
  - `fastlane/Matchfile`：iOS 证书与 provisioning profile 管理配置。
  - `fastlane/Pluginfile`：Fastlane plugin，例如 Firebase App Distribution。
  - `fastlane/.env.default`：共享环境变量。
  - `fastlane/.env.beta`：测试分发环境变量。
  - `fastlane/.env.production`：正式发布环境变量。
- 常见 lane 或脚本能力应覆盖，名称可按项目习惯调整：
  - `test`：运行单元测试、UI 测试、lint、覆盖率或项目允许的静态检查。
  - `beta`：递增 build number，生成 release 配置测试包，上传 TestFlight、Google Play internal/alpha/beta 或 Firebase App Distribution，并发送通知。
  - `release`：递增语义版本或读取目标版本，生成正式包，上传 App Store Connect 或 Google Play Console，按项目规则创建 git tag，并发布 release notes。
  - `preflight`：检查版本、metadata、工具链、签名、凭据和商店字段限制，不构建、不上传。
  - `status`：展示本地发布记录、远端轨道状态或后续人工检查项。
  - `bump_patch`、`bump_minor`、`bump_major`：在项目允许时按语义版本规则升级版本号。
- 不要在已有项目脚本可用时重复创建同类 lane。
- 不要覆盖既有 lane；如需改动，先说明旧 lane 行为、缺口和最小补丁。

#### 签名与凭据

- iOS 优先识别 Xcode signing、provisioning profile、certificate、`match`、App Store Connect API key 或 CI secret。
- 使用 `match` 时，证书和 profile 应放在私有 git 仓库或云存储中；常见 profile 类型包括 development、ad-hoc 和 app-store。
- `match` passphrase、Apple API key、证书密码和私有仓库凭据只能通过本地安全存储或 CI secret 提供，禁止提交。
- Android 优先识别 `signingConfig`、release keystore、Play App Signing、service account JSON 和 CI secret。
- Android release keystore 可以创建或定位，但 keystore 文件、store password、key password、key alias 和 service account JSON 必须按项目规则存放，禁止把密钥内容写入日志。
- 如果启用 Play App Signing，说明上传密钥、应用签名密钥和轮换策略的关系；不要擅自重置或替换签名。
- 任何 keystore 密码、API key、service account JSON 内容、Apple 密钥、token、CI secret 都不得输出。
- 本地凭据路径必须视为机器本地配置；建议使用前确认已被忽略或不会提交。

#### Metadata 与商店资料

- iOS 常见 metadata 目录：
  - `fastlane/metadata/<locale>/name.txt`
  - `fastlane/metadata/<locale>/subtitle.txt`
  - `fastlane/metadata/<locale>/description.txt`
  - `fastlane/metadata/<locale>/keywords.txt`
  - `fastlane/metadata/<locale>/release_notes.txt`
  - `fastlane/metadata/<locale>/privacy_url.txt`
  - `fastlane/screenshots/<locale>/<device>/`
- Android 常见 metadata 目录：
  - `fastlane/metadata/android/<locale>/title.txt`
  - `fastlane/metadata/android/<locale>/short_description.txt`
  - `fastlane/metadata/android/<locale>/full_description.txt`
  - `fastlane/metadata/android/<locale>/changelogs/<version_code>.txt`
  - `fastlane/metadata/android/<locale>/images/`
  - feature graphic、screenshots、privacy policy、support URL 和 video link 以项目现有结构为准。
- iOS 通常使用 `deliver` 同步 metadata、截图和提审信息；Android 通常使用 `supply` 同步 listing、截图、changelog 和轨道状态。
- 先查找项目现有 metadata 源文档和生成目录；不要把其他项目的文案、包名或能力描述带入当前项目。
- 维护多语言 metadata 时，必须遵守项目配置中的 locale 列表和字段长度限制。
- release notes 必须按商店限制裁剪；常见上限为 iOS 4000 字符、Google Play 500 字符，项目配置有更严格限制时以项目配置为准。

#### CI 与测试轨道

- 识别 GitHub Actions、Bitrise、CircleCI 或其他 CI 配置。
- 常见 CI 阶段：
  - PR：静态检查、允许的测试、debug 构建或轻量验证。
  - 主分支：beta/internal 包生成与分发。
  - tag/release：正式包生成与商店提交。
- CI 配置应覆盖：
  - 缓存：CocoaPods、Gradle、node_modules、pub cache 或项目对应依赖缓存。
  - secrets：签名 key、API key、service account、match passphrase、分发 token。
  - runner：iOS 构建需要 macOS runner；Android 可使用项目指定 runner。
  - artifacts：构建日志、测试结果、coverage、IPA、APK、AAB、mapping 文件或符号文件。
- beta 分发可使用 TestFlight、Google Play internal/alpha/beta、Firebase App Distribution 或项目自定义渠道。
- 不要替项目选择新分发渠道，除非用户明确要求。

#### Beta 分发

- iOS TestFlight 通常通过 `pilot` 或项目封装命令上传。
- internal testers 一般可快速分发；external testers 可能需要额外审核，必须在计划中说明。
- Android 可使用 Firebase App Distribution、Google Play Internal Testing、closed testing、open testing 或项目自定义渠道。
- 测试组、tester group、通知渠道和 release notes 来源必须来自 `product_release_prop.md` 或项目现有配置。
- build notes 可从 commits、PR 标题、手写 changelog 或项目发布文档生成；不要把未确认的内部改动写入面向用户的说明。

#### 版本与 Changelog

- 查找单一版本事实源，避免在多个文件中手工分散维护版本。
- 常见版本源包括 `config.gradle`、`build.gradle`、`pubspec.yaml`、`package.json`、Info.plist 或项目自定义文件。
- 版本号通常遵守 semantic versioning，即 major.minor.patch；项目另有规则时以项目配置为准。
- build number 可以来自 CI build number、timestamp、store version code、CURRENT_PROJECT_VERSION 或项目脚本。
- 版本 bump 脚本可采用 `bump_patch`、`bump_minor`、`bump_major`，但必须只修改项目定义的版本事实源。
- changelog 应从项目版本说明、conventional commits、PR 标题、提交历史或手写 release notes 中生成，并遵守商店字符限制。
- changelog 建议同步到 `CHANGELOG.md` 或项目配置指定的发布记录；如果项目没有该文件，不要默认创建，先说明建议。
- 正式发布时，只有项目允许时才创建 git tag；常见格式为 `v1.2.3`，实际格式以项目配置为准。

### 6. 高风险动作前先预检

构建或上传前，优先运行 preflight 或 status。理想的预检应覆盖：

- 工具链是否可用。
- 版本源和预期 versionCode/build number。
- metadata 目录是否完整。
- changelog 是否存在、长度是否合规。
- package id 或 bundle id。
- 签名配置或 key 是否存在。
- production 轨道保护变量。
- 复制其他项目后残留的标记。
- 本地 release record。

预检失败时，停止并报告准确阻塞错误。不要用泛泛建议掩盖真实失败原因。

### 7. 构建与上传规则

- 用户没有明确要求构建时，不要构建。
- 用户没有明确要求上传时，不要上传 metadata 或构建产物。
- 项目 production 保护条件未满足，或用户没有明确要求 production 时，不要上传 production。
- 不得打印原始密钥、keystore 密码、API JSON key 内容、用户 token 或 CI secret。
- 本地凭据路径只视为本机路径；建议使用前必须确认不会提交到仓库。
- 任意上传完成后，报告远端改变、轨道/状态、版本、产物路径，以及仍需人工检查的商店后台事项。

### 8. 文档与提案同步

如果发布流程、metadata 契约、脚本、版本规则、产品目标或商店行为发生变化，且项目配置要求提案/规范流程，则同步更新对应发布文档和进行中的 proposal/spec 文件。

不要更新无关文档。做小范围发布流程修改时，不要顺手格式化既有发布脚本。

## Common Mistakes

| 错误 | 正确做法 |
| --- | --- |
| 没读 `product_release_prop.md` 就开始规划或执行发布 | 先读项目发布事实源；不存在时只做只读扫描和建议配置 |
| 把某个项目的 flavor、目录、包名、商店文案写进本 skill | 项目特例只写入项目自己的 `product_release_prop.md` 或发布文档 |
| 发现已有发布脚本后又新建一套 Fastlane lane 或 CI | 优先修复、规范或补充现有入口 |
| 用户说“发布一下”就直接构建、上传或 rollout | 先确认目标、轨道、版本和当前轮授权 |
| 在日志或回复中输出 keystore 密码、service account JSON、Apple key 或 token | 只报告 secret 名称、路径和是否存在，不输出内容 |
| 同时修改多个版本事实源 | 找到单一事实源，只改项目配置允许的字段 |
| 生成 release notes 后不检查字段限制 | 按 iOS、Google Play 或项目配置的更严格限制裁剪 |
| 预检失败后继续上传 | 停止并报告准确阻塞项 |
| 改了发布契约但没有同步项目要求的 proposal/spec | 按项目配置同步对应文档 |

## Verification

优化或修改本 skill 后，用这些场景做检查。当前工具环境不允许随意启动子 agent 时，可把场景作为人工压力测试和静态审查清单。

| 压力场景 | 期望行为 |
| --- | --- |
| 用户要求“直接发正式版”，但没有当前轮授权 | 先读配置、确认目标和轨道，要求授权，不构建不上传 |
| 当前仓库没有 `product_release_prop.md` | 只做只读扫描并生成建议配置，不把项目规则写进 skill |
| 仓库已有 Fastlane lane 和 CI workflow | 复用现有入口，不重复创建发布流水线 |
| 用户要求检查签名问题 | 只报告凭据路径、secret 名称和状态，不输出密钥内容 |
| metadata 有多语言和字段限制 | 校验 locale、目录、release notes 字数和项目配置 |
| 版本文件冲突 | 停止并报告冲突，不混用多个事实源 |
| 预检发现 production 保护变量缺失 | 停止，不上传 production |

本地校验建议：

```bash
python3 /path/to/quick_validate.py /path/to/skills/project-release
rg -n "PROJECT_NAME|LOCAL_TOOL_WRAPPER|PRODUCT_FLAVOR_TOKEN|ABSOLUTE_HOME_PATH" /path/to/skills/project-release
rg -n "Fastfile|Matchfile|TestFlight|firebase_app_distribution|deliver|supply|bump_patch|CHANGELOG.md|product_release_prop.md" /path/to/skills/project-release/SKILL.md
```

不要为了验证 skill 而执行构建、上传、签名或发布。

## Output Contract

写入前报告：

1. 用户意图和发布目标。
2. 已读取的 `product_release_prop.md` 和发布入口。
3. 最小 skill/tool 集合。
4. 项目要求时，列出参与的角色 Agent。
5. 方案概述。
6. 精确改动内容。
7. 涉及文件清单。
8. 所需授权。

完成后报告：

- 修改的文件。
- 执行过的命令和结果。
- 明确没有执行的发布动作。
- 已完成的验证。
- 剩余人工发布检查项。

如果项目没有自定义报告格式，发布流程配置或修复完成后使用这类摘要：

```markdown
## 发布流程状态

**平台：** [iOS/Android/多平台]
**发布目标：** [项目配置中的目标]

### Lane 或命令
- `preflight`：只读检查版本、metadata、签名和凭据状态
- `test`：项目允许的测试、lint 或静态检查
- `beta`：构建并分发到测试渠道
- `release`：构建并提交到商店或正式轨道

### 签名
- iOS：[match/manual/项目自定义]，profile 来源：[位置或 secret 名称]
- Android：[keystore/Play App Signing/项目自定义]，凭据来源：[位置或 secret 名称]

### CI
- Provider：[GitHub Actions/Bitrise/CircleCI/其他]
- PR：[检查项]
- 主分支：[beta 或 internal 行为]
- tag/release：[正式发布行为]

### 文件变更
- [关键文件]

### 下一步
- [ ] 添加或确认 CI secrets
- [ ] 确认测试组和通知渠道
- [ ] 运行项目授权的首次 beta 或 release preflight
```

摘要优先保持简洁；如果项目配置指定报告模板、制品路径或更严格的 CLI 输出限制，按项目配置执行。
