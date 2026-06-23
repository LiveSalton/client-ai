# 25 - ASCII 证据与置信度门禁

## 何时读取

- 完成视觉语义分析后、写 proposal 之前读取。
- 用户质疑“AI 是否看懂设计”或低级模型输出粗糙时读取。
- 准备进入实现前必须重读。

## 必须产出

- `ASCII 1:1 复刻稿`
- `ASCII 层级线稿`
- 元素 ID 对照表
- 页面 / 区域 / 关键元素置信度表
- 未达标项与下一轮修复动作

## ASCII 1:1 复刻稿

目标是让人能在不看原图时检查布局识别是否正确。字符画可以按比例压缩，但必须声明画布、缩放和坐标，元素边界必须回到原始画布坐标。

```text
canvas: <width>x<height>
scale: <1 char = N px wide, 1 row = M px high>

+------------------------------------------------+
| A01 status bar                 A02 action      |
+------------------------------------------------+
| H01 avatar | H02 title                         |
|            | H03 subtitle                      |
+------------------------------------------------+
| C01 metric | C02 metric | C03 metric           |
+------------------------------------------------+
```

每个 ASCII 区块必须能在元素表中找到同名 ID。无法定位的可见元素不能省略，必须标为 `unknown-*` 并降低置信度。

## ASCII 层级线稿

目标是检查布局树、分组关系和阅读顺序。

```text
PageRoot
|- A StatusBar
|- H Hero
|  |- H01 Avatar
|  |- H02 Title
|  `- H03 Subtitle
|- C MetricsRow
|  |- C01 MetricCard
|  |- C02 MetricCard
|  `- C03 MetricCard
`- L ListSection
```

层级线稿必须只表达结构，不写解释性散文。每个节点必须对应元素表或区域表。

## 置信度规则

| 级别 | 分数 | 含义 |
| --- | --- | --- |
| high | `>= 0.90` | 有 Figma / CSS / 测量证据，或截图中边界清晰。 |
| medium | `0.75 - 0.89` | 可见但存在推断，例如阴影、圆角、字号或图标语义不完全确定。 |
| low | `< 0.75` | 边界、内容、层级或样式无法可靠判断。 |

## 实现门禁

| 检查项 | 阈值 |
| --- | --- |
| 页面整体置信度 | `>= 0.85` |
| 首屏 / 关键区域置信度 | `>= 0.90` |
| 关键 CTA / 关键数据 / 主视觉元素 | `>= 0.90` |
| low confidence 项 | 必须有处理策略或用户确认 |

不满足门禁时，只能进入低级模型循环或请求用户确认，不能进入编码。

## 最小输出模板

```text
ascii_1_1: <已输出 / 缺失>
ascii_tree: <已输出 / 缺失>
overall_confidence: <0.00-1.00>
critical_regions: <region_id=score>
low_confidence: <element_id + reason + next_action>
gate: <pass|blocked>
```
