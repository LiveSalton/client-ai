---
name: social-gateway-api-sync
description: 只用于 noviplay_cli Android 客户端基于 `doc/api-document/` 和现有实现逐接口补齐 Social Gateway 调用代码：`SocialApiPaths.kt`、`SocialGatewayApi.kt`、`SocialGatewayRepository.kt`、`ApiResp.kt` 与必要解析模型；不用于通用同步工具、服务端、iOS、管理端或工具链生成。
---

# Social Gateway API Sync

## 1. 目标
把 `doc/api-document/` 中的接口逐个落到 noviplay_cli Android 客户端现有 Social Gateway 调用链里。执行顺序固定为：读接口文档 -> 搜现有实现 -> 判断过滤 -> 判断复用 -> 补路径常量 -> 补 Retrofit 方法 -> 补 Repository 方法 -> 补响应模型 -> 做最小检查。

这个 skill 必须以当前代码为事实来源。不要照搬外部模板；真实实现里 `ApiResponse` 是 `open class`，响应类是 `ApiResp.kt` 中的顶层 `data class XxxResponse : ApiResponse()`，Repository 使用 `requestTyped(call)` 和 `payload()`。

## 2. 适用范围
- 只处理 noviplay_cli Android 客户端 Social Gateway 调用。
- 只处理接口生成与增量补齐，不做全量重写。
- 只处理这些接口文档：
  - HTTP：`social.md`、`account.md`、`room.md`、`gift.md`、`wallet.md`、`recommender.md`、`privilege.md`、`message.md`
  - 资产 / gRPC 映射：`asset-asset.md`、`asset-prop.md`
- 只改当前接口真正需要的最小文件：
  - `components/common/src/main/java/com/hello/network/SocialApiPaths.kt`
  - `components/common/src/main/java/com/hello/network/SocialGatewayApi.kt`
  - `components/common/src/main/java/com/hello/network/repository/SocialGatewayRepository.kt`
  - `components/common/src/main/java/com/hello/model/ApiResp.kt`
  - 当前接口已经依赖到的既有 parser / helper / model
- Kotlin 代码与新增注释必须使用英文。
- 不生成服务端、iOS、管理端、调试工具链或通用同步工具代码。

## 3. 真实代码事实
低级 AI 必须先记住这些事实，再开始修改。

### 3.1 `SocialApiPaths.kt`
- 包名是 `com.hello.network`。
- `SocialApiPaths` 是 `object`。
- 常量直接写在对象内，例如：

```kotlin
const val GIFT_GET_ALL_GIFT_TAB = "/gift/get_all_gift_tab"
```

- 文件按服务块组织，现有块包括 Social、Account、Room、Gift、Wallet、Recommender、Feed、Asset、Privilege。
- 新常量必须放入对应服务块，不要重排整文件。

### 3.2 `SocialGatewayApi.kt`
- 包名是 `com.hello.network`。
- `SocialGatewayApi` 是 Retrofit `interface`。
- 现有文件使用 `import com.hello.model.*`，响应类型是顶层模型名，不是 `ApiResp.XxxResponse`。
- 普通 POST 方法形态如下：

```kotlin
@POST(SocialApiPaths.GIFT_GET_ALL_GIFT_TAB)
suspend fun getAllGiftTab(@Body body: Map<String, @JvmSuppressWildcards Any?>): Response<GetAllGiftTabResponse>
```

- 无业务数据的接口返回 `Response<ApiResponse>`。
- ping 类接口通常也走 POST + body，只有现有 `PING` 是 `@GET` + `@Query`。新增接口不要主动改成 GET，除非文档和现有同类实现都明确要求。

### 3.3 `SocialGatewayRepository.kt`
- 包名是 `com.hello.network.repository`。
- `SocialGatewayRepository` 是普通 class，内部通过 `provideGatewayRetrofit().create(SocialGatewayApi::class.java)` 获取 API。
- 当前通用请求函数是：

```kotlin
private suspend fun <TResponse : ApiResponse> requestTyped(
    call: suspend () -> Response<TResponse>
): Result<TResponse>
```

- 当前参数 helper 是：

```kotlin
private fun payload(vararg entries: Pair<String, Any?>): Map<String, Any?>
```

- `payload()` 会过滤掉 value 为 `null` 的字段。
- 当前文件没有通用 `request()`，也没有 `pagedPayload()`。不要为了新接口新增这两个 helper。
- Repository 方法通常直接返回完整 response，例如 `Result<GetGiftListByTabIdResponse>`，不要默认把 response 映射成业务字段。
- 只有现有调用链确实需要业务对象时，才复用已有 converter 或 `mapData()` 模式做转换。
- `Result.Error` 只有 `ret` 和 `msg`，不能增加 `Exception` 字段。

### 3.4 `ApiResp.kt`
- 包名是 `com.hello.model`。
- `ApiResponse` 是 open class，不是 interface：

```kotlin
open class ApiResponse(
    @SerializedName("ret") open var ret: Int = 0,
    @SerializedName("msg") open var msg: String = ""
)
```

- 响应模型是顶层 `data class`，继承方式是 `: ApiResponse()`。
- 当前响应模型没有实现 `Serializable`，新增模型不要主动加 `Serializable`。
- 字段使用 `var` 和默认值，所有 JSON 字段都使用 `@SerializedName`。
- 无业务字段的成功响应直接复用 `ApiResponse`，不要创建空 response 类。

## 4. 文档读取规则
对每个接口，至少读取这些字段：
- 接口名称
- 接口描述
- 请求方法
- 请求路径
- 认证要求
- gRPC 路径
- 请求参数表
- 响应参数表
- 请求示例
- 响应示例

读取 `asset-asset.md`、`asset-prop.md` 时，额外关注 `items`、`rows`、`prop`、`meta` 的层级关系、列表嵌套和分页语义。

如果文档缺少路径、请求参数、响应字段或用途说明，先停下，不猜。

## 4.5 Git 版本对比与变更分析流程
在开始修改前，必须通过 git 对比明确当前工作区的变更状态，避免重复修改或遗漏。

### 4.5.1 查看未提交的本地变更
```bash
git status
git diff
```
- 确认哪些文件已被修改但未提交
- 检查是否有冲突或未解决的合并
- 识别本次任务相关的变更文件

### 4.5.2 对比文档更新前后的代码差异
当接口文档更新时，使用以下命令对比现有实现：

```bash
# 查看指定文件的最近提交历史
git log --oneline -10 -- components/common/src/main/java/com/hello/network/SocialGatewayRepository.kt

# 对比两个 commit 之间的差异
git diff <old-commit> <new-commit> -- components/common/src/main/java/com/hello/model/ApiResp.kt

# 查看某次提交的具体改动
git show <commit-hash>
```

### 4.5.3 结合现有代码思考变更应用策略
基于 git 对比结果，按以下步骤分析：

1. **识别新增接口**
   - 文档中有但代码中没有的接口 → 需要完整新增（路径常量 + Retrofit + Repository + Response）
   - 示例：`/account/upload_album` 在所有文件中都不存在 → 全链路新增

2. **识别字段补充**
   - 接口已存在但参数/响应字段不完整 → 局部补充缺失字段
   - 示例：`sendInAppNotification` 已存在但缺少 `material_image_urls`、`action.label`、`action.display_type` → 仅在 Repository 方法中补充参数

3. **识别命名/结构变化**
   - 文档字段名变化但语义相同 → 检查是否需要兼容旧字段（使用 `alternate`）
   - 示例：`pagination_context` 改为 `page_context` → 可能需要同时支持两种字段名

4. **识别废弃接口**
   - 文档删除但代码仍保留 → 标记为 @Deprecated 或评估是否删除
   - 注意：删除前必须确认无调用方依赖

5. **识别类型/结构升级**
   - 字段类型变化（如 Int → Long）→ 评估兼容性风险
   - 响应结构嵌套层级变化 → 更新 Response 模型

### 4.5.4 变更影响范围评估
对每个识别出的变更，评估影响范围：

| 变更类型 | 影响文件 | 风险评估 |
|---------|---------|----------|
| 新增路径常量 | SocialApiPaths.kt | 低 - 仅新增常量 |
| 新增 Retrofit 方法 | SocialGatewayApi.kt | 低 - 仅新增接口定义 |
| 新增 Repository 方法 | SocialGatewayRepository.kt | 中 - 需检查调用方 |
| 新增 Response 模型 | ApiResp.kt | 低 - 仅数据模型 |
| 修改现有方法签名 | SocialGatewayRepository.kt | **高** - 需检查所有调用方 |
| 修改 Response 字段类型 | ApiResp.kt | **高** - 可能破坏 JSON 解析 |
| 删除接口/字段 | 所有相关文件 | **极高** - 必须确认无依赖 |

### 4.5.5 制定最小化修改方案
基于影响评估，选择最安全的修改策略：

- **优先新增而非修改**：能新增方法就不改现有签名
- **可选参数优于必填**：新字段设为 nullable 并提供默认值
- **向后兼容**：保留旧字段作为 `alternate`，逐步迁移
- **分步实施**：复杂变更拆分为多个小提交，每步可独立回滚

### 4.5.6 验证变更完整性
修改完成后，再次使用 git 对比确认：

```bash
# 查看所有修改的文件
git diff --name-only

# 查看具体改动内容
git diff

# 确认没有意外修改无关文件
git diff --stat
```

检查清单：
- [ ] 只修改了目标接口相关的文件
- [ ] 没有意外格式化或重排无关代码
- [ ] 新增字段都有合理的默认值
- [ ] 方法签名变化有充分的理由且已评估影响
- [ ] 所有 import 都是必需的

## 5. 逐接口执行步骤
每个接口都按这 10 步走，不允许先写代码再补判断。

### Step 1. 读文档片段
- 摘取路径、方法、参数、响应结构、分页特征、是否标量、是否列表、是否回调、是否认证相关。
- 把接口语义写成一句内部判断。
- 关键字段缺失时停止。

### Step 2. 搜现有实现
- **先通过 git 确认当前状态**：
  ```bash
  git status  # 查看未提交变更
  git diff --name-only  # 列出已修改文件
  ```
  - 如果目标文件已在本次任务中修改过，优先在现有变更基础上补充，不要重复新增
  - 如果发现冲突或未预期的修改，先解决冲突再继续

- **再搜代码实现**：
  - 先搜路径字符串，例如 `/gift/get_all_gift_tab`。
  - 再搜常量名片段，例如 `GIFT_GET_ALL_GIFT_TAB`。
  - 再搜 Retrofit 方法名、Repository 方法名、Response 类名。
  - 再搜可复用模型和 helper。
  - 已有实现覆盖同语义接口时，不新增第二套。

### Step 3. 判断是否过滤
- 命中固定跳过项时直接过滤：
  - `/wallet/apple_create_order`
  - `/wallet/apple_ticket_recharge`
  - `/wallet/get_in_app_purchase_product`
  - `/recommender/offline_calculate_hot_tab`
- iOS / Apple 专属、管理端、后台、运营后台、调试、测试、mock、internal、非 Android 客户端接口都过滤。
- 路径含 `callback` 时默认优先过滤；只有现有代码已有明确客户端场景时，才保守保留。
- 不能证明 Android 客户端需要的接口，过滤。

### Step 4. 判断是否复用
- 能复用现有常量、Retrofit 方法、Repository 方法、Response 模型、业务模型或 helper 时，必须复用。
- 同语义但命名不同，优先保持现有代码风格。
- 只是路径值变化时，优先原地更新旧常量，不新增别名。
- 复用会扩大改动范围时，退回最小补缺。

### Step 5. 补 `SocialApiPaths.kt`
- 只在没有同语义常量时新增。
- 常量名使用 `SCREAMING_SNAKE_CASE`。
- 常量名按现有服务前缀：`ACCOUNT_`、`ROOM_`、`GIFT_`、`WALLET_`、`RECOMMENDER_`、`FEED_`、`ASSET_`、`ASSET_PROP_`、`PRIVILEGE_` 等。
- 路径值必须与文档完全一致。
- 放到对应服务块末尾附近，不重排其他常量。

### Step 6. 补 `SocialGatewayApi.kt`
- 只在没有同语义 Retrofit 方法时新增。
- 新方法放到对应服务块。
- POST 方法使用：

```kotlin
@POST(SocialApiPaths.CONSTANT_NAME)
suspend fun methodName(@Body body: Map<String, @JvmSuppressWildcards Any?>): Response<XxxResponse>
```

- 无业务字段返回 `Response<ApiResponse>`。
- 结构化响应返回 `Response<XxxResponse>`。
- 不写 `Response<ApiResp.XxxResponse>`。
- 不为了简单接口引入 `JsonObject`，除非现有同类接口已经这样写。

### Step 7. 补 `SocialGatewayRepository.kt`
- 只在没有同语义 Repository 方法时新增。
- 方法签名使用：

```kotlin
suspend fun methodName(...): Result<XxxResponse>
```

- 无业务字段返回 `Result<ApiResponse>`。
- 用 `payload("json_key" to value)` 构造请求体。
- 不要新增 `pagedPayload()`；分页参数直接放进 `payload()`。
- 调用形态保持：

```kotlin
return requestTyped(call = {
    api.methodName(
        payload(
            "field_name" to value
        )
    )
})
```

- 可空参数交给 `payload()` 过滤。
- 需要校验入参时，沿用现有 `Result.Error(ret = -1, msg = "...")` 风格。
- 不新增通用 `request()`。

### Step 8. 决定是否补 `ApiResp.kt`
- 无业务字段响应：复用 `ApiResponse`。
- `pong` 响应：按现有 `PingResponse` / `GiftPingResponse` / `WalletPingResponse` 风格建模。
- 列表、多字段对象、分页对象、资产对象：新增 typed response。
- 新 response 命名使用 `XxxResponse`，例如 `GetUserAssetListResponse`。
- 字段命名使用 camelCase，JSON 字段用 `@SerializedName("snake_case")`。
- 类形态必须贴近现有代码：

```kotlin
data class XxxResponse(
    @SerializedName("items") var items: List<XxxItem> = emptyList(),
    @SerializedName("has_more") var hasMore: Boolean = false,
    @SerializedName("page_context") var pageContext: String = ""
) : ApiResponse()
```

- 嵌套业务模型也放在 `ApiResp.kt` 中对应服务区附近，除非已有同类模型可复用。
- 不加 `Serializable`，不把 `ret` / `msg` 重复写进每个 data class 构造函数。

### Step 9. 做最小修改
- 只修改当前接口相关代码块。
- 不重排 import，除非新增类型导致必须清理。
- 不改无关中文旧注释；新增注释必须英文。
- 不触碰无关模块、资源、流程、测试脚手架或工具链。

### Step 10. 收尾检查
- **Git 变更验证**：
  ```bash
  git diff --stat  # 查看修改统计
  git diff  # 审查具体改动
  ```
  - 确认只修改了目标接口相关文件
  - 确认没有意外格式化或重排无关代码
  - 如果有未预期的修改，立即回滚

- **文档与代码对照**：
  - 对照文档检查路径、方法、参数 key、返回字段。
  - 对照现有代码检查命名、服务分组、返回类型和调用方式。
  
- **质量检查**：
  - 检查是否误生成过滤接口。
  - 检查是否引入不存在的 helper，比如 `pagedPayload()`、`request()`、`ParseUtil.parseBoolean()`。
  - 检查是否写了错误类型，比如 `ApiResp.XxxResponse` 或 `ApiResponse` interface。
  - 检查 `Result.Error` 是否仍只使用 `ret` / `msg`。

## 6. 生成规则

### 6.1 路径常量
- 一个接口一个常量。
- 常量值与文档路径完全一致。
- 常量放在 `SocialApiPaths` 对应服务块里。
- 已有重复语义常量时，优先复用，不新增。

### 6.2 Retrofit
- 默认 POST + `@Body Map<String, @JvmSuppressWildcards Any?>`。
- 返回类型优先 typed response。
- 无业务字段用 `Response<ApiResponse>`。
- 已有文件使用 `com.hello.model.*`，所以直接写 `Response<XxxResponse>`。
- 不主动引入 `JsonObject`。

### 6.3 Repository
- 默认返回 `Result<XxxResponse>`，不是 `Result<业务字段>`。
- 只使用现有 `requestTyped(call)` 和 `payload()`。
- 分页字段直接传入 `payload()`，例如 `"page" to page`、`"page_size" to pageSize`、`"page_context" to pageContext`。
- Cursor 分页优先使用 `pageContext: String? = null` 或现有同类签名。
- 传统分页沿用现有 `page: Int, pageSize: Int` 风格。
- 不新增跨接口抽象。

### 6.4 响应模型
- `ApiResponse` 是基类，新增 response 继承 `ApiResponse()`。
- 新模型字段全部使用 `@SerializedName`。
- 字段类型优先贴合现有代码：
  - ID 在现有同类接口用 `Int` 时继续用 `Int`。
  - Feed / transaction 这类现有用 `Long` 的 ID 继续用 `Long`。
  - 金额类若现有同类用 `String`，继续用 `String`，不要改成 `Double`。
- `int32` -> `Int`。
- `int64` / `uint64` 默认按本项目旧约定用 `Int`；如果现有同类模型已经用 `Long`，跟随现有同类模型。
- `bool` -> `Boolean`。
- `array` -> `List<T>`。
- `object` -> 现有模型或新增小 data class。
- 不新增 `Serializable`。

### 6.5 特殊解析与复用
- 用户列表优先直接使用 `List<UserInfo>`，因为 `UserInfo` 已通过 `@SerializedName(... alternate = [...])` 兼容多种字段。
- 单用户优先使用 `UserInfo` 或现有 `GetBasicUserInfoResponse.toUserInfo()`，不要写不存在的 `UserInfo.fromJson()`。
- 礼物 tab 使用现有 `GiftTab`。
- 礼物详情使用现有 `GiftInfo`，不是 `GiftDetails`。
- 礼物版本 hash 使用现有 `TabVersionHash` 和 `TabVersionHash.toJson()` 模式。
- 资产接口优先复用现有 `GetUserAssetListResponse`、`UpdateUserPropResponse`、`WearPropResponse`、`GetUserPropAssetsResponse`、`BatchGetUserPropAssetsResponse` 及其相关模型。
- Recommender 接口可能使用 `CachedCallEngine`；新增 recommender 方法前先看同块缓存模式，不要随意绕开缓存。
- `ParseUtil` 里 boolean 方法叫 `parseBool()`，不是 `parseBoolean()`。只有手动解析旧 JSON 时才需要它。

### 6.6 标准响应格式
所有 typed response 都依赖 `ApiResponse` 基类提供的 `ret` 和 `msg`。新增 data class 只写业务字段，除非现有同类代码已有特殊处理。

## 7. 判断分支

### 7.1 文档接口已存在
- 不新增。
- 只在路径、参数或字段确实变化时做局部更新。
- 更新前先确认调用方不会被破坏。

### 7.2 文档返回字段比现有模型多
- 只有客户端当前需要或明显属于响应核心字段时才补。
- 补字段时给默认值。
- 不为不使用字段扩大模型。

### 7.3 文档是分页接口
- `page` / `page_size`：按传统分页参数传入 `payload()`。
- `page_context`：按游标分页参数传入 `payload()`。
- 响应字段常见为 `has_more`、`page_context` 或 `next_page_context`，按文档和现有同类模型选择。

### 7.4 文档是回调接口
- 默认过滤。
- 若现有代码已有明确客户端入口，例如 `liveMemberStateCallback`，则按现有 `Map<String, Any?>` + `ApiResponse` 风格保守处理。

### 7.5 文档是认证接口
- 沿用现有 Account service 方法和 token 字段命名。
- 不新增全局认证流程。
- 不修改 Retrofit 创建、拦截器或 token 注入链路。

## 8. 产物模板

### 8.1 接口处理清单
```text
接口名:
文档路径:
处理结论: 复用 / 局部修改 / 新增 / 过滤
复用项:
新增项:
最小修改文件:
```

### 8.2 已过滤接口清单
```text
接口名:
文档路径:
过滤原因:
```

### 8.3 变更文件清单
```text
- SocialApiPaths.kt: 新增/更新哪些常量
- SocialGatewayApi.kt: 新增/更新哪些方法
- SocialGatewayRepository.kt: 新增/更新哪些方法
- ApiResp.kt: 新增/更新哪些模型
- 既有 helper/model: 复用或小改了什么
```

### 8.4 残留风险清单
```text
- 文档不清的接口
- 仍需人工确认的字段映射
- 因不能证明 Android 客户端用途而过滤的接口
- 沿用现有不一致风格的原因
```

## 9. 最终检查清单
- 只改当前接口必需的最小范围文件。
- 没有主动执行构建、编译、发布。
- 没有生成通用同步工具、服务端、iOS、管理端或工具链代码。
- 每个接口都完成：读文档 -> 搜现有实现 -> 判断过滤 -> 判断复用 -> 决定常量 -> 决定 Retrofit -> 决定 Repository -> 决定响应模型 -> 最小修改 -> 收尾检查。
- 新增代码贴合真实实现：`XxxResponse : ApiResponse()`、`Response<XxxResponse>`、`requestTyped(call)`、`payload()`。
- 没有引用不存在的 helper 或错误模板。
- 过滤接口没有生成任何产物。
- Kotlin 新增代码和注释都是英文。
- `Result.Error` 仍只包含 `ret` / `msg`。
- 没有留下无用 import、临时日志、调试代码、重复 helper、重复模型。

## 10. 禁止事项
- 禁止引用外部说明文件或要求读取它。
- 禁止把这个 skill 当通用 API 同步工具。
- 禁止主动编译、构建、发布。
- 禁止先新增再判断。
- 禁止先修改再找复用。
- 禁止照搬 `ApiResponse` interface、`Serializable`、`ApiResp.XxxResponse`、`pagedPayload()`、`request()`、`UserInfo.fromJson()`、`ParseUtil.parseBoolean()` 这类不符合当前代码的模板。
- 禁止为了“完整”扩出新抽象。
- 禁止修改无关模块、资源、流程、文档、测试脚手架。
- 禁止生成服务端、iOS、管理端、调试、工具链代码。
- 禁止把 `Result.Error` 扩成异常容器。
- 禁止把不能证明给 Android 客户端用的接口生成出来。
- 禁止全量重写已有实现。
- 禁止留下临时调试痕迹。
