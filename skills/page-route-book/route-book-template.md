# 路书文档模板

以下是路书章节的标准模板，复制到项目结构文档中使用。

---

## 页面路书

> **维护门禁：增加或删除页面时，必须同步更新本节的路书表格和导航关系图。每个页面类声明前必须添加 `/** 【中文页面名】功能描述（50字内） */` 注释。对话中可通过中文页面名快速检索到对应页面和代码文件。**

### Activity 页面

| 中文名 | 类名 | 文件路径 | 功能 |
|--------|------|----------|------|
| 启动引导页 | `OnboardingActivity` | `ui/onboarding/OnboardingActivity.kt` | 新用户引导与订阅试用，展示套餐定价和免费试用期 |
| 主页面 | `MainActivity` | `MainActivity.kt` | 底部Tab导航切换各功能Fragment，管理广告和初始化 |
| ... | ... | ... | ... |

### Fragment 页面

| 中文名 | 类名 | 文件路径 | 功能 |
|--------|------|----------|------|
| 首页 | `HomeFragment` | `ui/home/HomeFragment.kt` | 设备概览仪表盘，展示关键指标和快捷入口 |
| ... | ... | ... | ... |

### Dialog 弹窗

| 中文名 | 类名 | 文件路径 | 功能 |
|--------|------|----------|------|
| 应用详情弹窗 | `AppDetailsDialog` | `ui/dialog/AppDetailsDialog.kt` | 展示应用详细信息和操作入口 |
| ... | ... | ... | ... |

### 导航关系

```
启动引导页 (入口)
  ├── [完成] → 主页面
  └── [条款] → 网页页

主页面 (底部Tab)
  ├── Tab: 首页
  │   ├── [功能A] → 功能A页
  │   └── [升级] → 升级页
  ├── Tab: 列表页
  │   └── [点击] → 详情弹窗
  └── Tab: 设置页
      ├── [隐私] → 网页页
      └── [开发者] → 开发者页 (仅debug)
```

---

## 适配不同平台

### iOS 项目

将表格分类改为：
- ViewController 页面
- SwiftUI View 页面
- Alert / Sheet 弹窗

导航关系用 UINavigationController push/present 或 SwiftUI NavigationLink 表示。

### Web 项目 (React/Vue)

将表格分类改为：
- 路由页面（pages/ 目录下）
- 布局组件（layouts/ 目录下）
- 模态框 / 抽屉

导航关系用路由路径表示（如 `/dashboard` → 仪表盘页）。

### Flutter 项目

将表格分类改为：
- 路由页面（routes 注册的页面）
- 弹窗 / BottomSheet

导航关系用 Navigator.push / GoRouter 路由表示。
