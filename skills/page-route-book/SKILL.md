---
name: page-route-book
description: 扫描项目源码，构建结构化页面路书（route book），含中文页面名、功能描述、类名、文件路径和导航关系图。在源码中为每个页面添加中文注释，使对话中可通过中文名快速定位页面代码。适用于用户要求创建路书、页面地图、导航地图、screen index，或需要结构化梳理项目页面时使用。
version: 1.0.0
---

# 页面路书（Page Route Book）

为项目构建一份结构化的页面索引文档，并在每个页面源码中添加中文注释，使团队成员在对话中说出页面中文名即可精准定位到对应代码。

## 工作流程

### Phase 1: 扫描页面

根据项目平台，搜索所有页面级组件：

| 平台 | 搜索目标 |
|------|---------|
| Android | Activity, Fragment, @Composable 顶层函数, DialogFragment |
| iOS | UIViewController, SwiftUI View (顶层页面) |
| Flutter | StatelessWidget/StatefulWidget (路由注册的页面) |
| React/Next | pages/ 或 app/ 下的路由文件, 顶层页面组件 |
| Vue/Nuxt | pages/ 下的路由文件, 顶层页面组件 |
| 通用 | 路由配置文件、导航图、Manifest 注册 |

**扫描手段**（并行执行提高效率）：
1. Grep 搜索页面基类的继承关系（如 `: Activity()`, `: Fragment()`, `: UIViewController`）
2. 读取路由/导航配置文件（AndroidManifest.xml, Info.plist, router.ts 等）
3. Glob 搜索页面目录结构（`**/ui/**/*.kt`, `**/pages/**/*.tsx` 等）
4. 读取项目已有的结构文档（如有）

### Phase 2: 命名与描述

为每个页面确定：
- **中文名**：2-6 字，简洁直观，如「启动引导页」「应用列表」「签到弹窗」
- **功能描述**：50 字以内，概括页面核心功能和用户可执行的操作

命名原则：
- 用户视角优先：「存储统计页」优于「StatsActivity」
- 避免技术术语：「升级页」优于「计费页面」
- 弹窗用「XX弹窗」后缀，Activity/ViewController 用「XX页」后缀
- 如项目有国际化字符串资源，可参考其中的 title 来命名

### Phase 3: 源码注释

在每个页面类/组件的声明前添加文档注释：

**Kotlin/Java/TypeScript:**
```kotlin
/**
 * 【中文页面名】功能描述（50字内）
 */
class PageClass : BaseClass() {
```

**Swift:**
```swift
/// 【中文页面名】功能描述（50字内）
class PageViewController: UIViewController {
```

**Dart:**
```dart
/// 【中文页面名】功能描述（50字内）
class PageScreen extends StatelessWidget {
```

**Vue:**
```html
<!-- 【中文页面名】功能描述（50字内） -->
<template>
```

### Phase 4: 编写路书文档

在项目的结构文档（如 `doc/project-structure.md`）中新增「页面路书」章节，或创建独立文件 `doc/page-route-book.md`。

文档结构（参考 [route-book-template.md](route-book-template.md)）：

1. **维护门禁声明** — 增删页面必须同步更新路书
2. **页面分类表格** — 按页面类型分表（Activity/Fragment/Dialog 或 Pages/Components/Modals）
3. **导航关系图** — 用中文页面名表示页面间的跳转关系

表格列定义：

| 列 | 说明 |
|----|------|
| 中文名 | `【】`括号内的页面名，对话中的检索关键词 |
| 类名 | 代码中的类名或组件名 |
| 文件路径 | 相对于源码根目录的路径 |
| 功能 | 50字内的功能描述 |

### Phase 5: 验证

1. 用 Grep 搜索每个中文页面名，确认能唯一命中对应源文件
2. 检查路书表格覆盖所有已发现的页面
3. 检查导航关系图与实际跳转代码一致

## 维护规则

写入路书时，必须在文档顶部声明以下门禁：

> **维护门禁：增加或删除页面时，必须同步更新路书表格和导航关系图。每个页面类声明前必须添加 `/** 【中文页面名】功能描述 */` 注释。**

这些规则也应同步写入项目的协作规范（如 `AGENTS.md`、`CONTRIBUTING.md`）。

## 对话检索

路书完成后，当对话中提到中文页面名时：
1. 在路书表格中查找中文名对应的类名和文件路径
2. 或在源码中 Grep `【中文页面名】` 直接定位到类声明行
3. 两种方式均可在秒级时间内找到目标页面

## 注意事项

- 基类/工具类（如 BaseActivity、BaseFragment）不纳入路书，它们不是用户可见页面
- 弹窗/对话框虽然是子页面，但功能独立且重要，应纳入路书
- Adapter、ViewModel、Repository 等辅助类不纳入路书
- 导航协调器（如统一弹窗调度器）应纳入路书，因为它是交互逻辑的关键节点
- 文件路径使用相对于源码根目录的短路径，提高可读性
