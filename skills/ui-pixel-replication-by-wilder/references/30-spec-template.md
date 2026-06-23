# 30 - OpenSpec 规格模板

## 何时读取

- 需要写 proposal、design、tasks 或 spec 时读取。
- 需要把视觉分析结果变成正式规格时读取。

## 必须产出

- 当前 change 内的 proposal 更新
- design 决策
- tasks 分解
- spec 需求条目
- ASCII 1:1 复刻稿
- ASCII 层级线稿
- 置信度门禁结果
- 复刻验收点

## 规则

- 当前 OpenSpec change 承接所有正式规格，不再拆并行文档体系。
- 新发现必须回写到 proposal / design / tasks / spec。
- 规格要能让另一个模型或工程师不看原图也能执行。
- 低级模型容易丢步骤时，先把职责拆清，再写内容。
- proposal 必须先给用户确认；确认前 tasks 只能到“准备实现”，不能启动编码。
- ASCII 和置信度是 proposal 的一部分，不是可选附录。

## 推荐结构

```text
1. 背景与目标
2. 输入源与优先级
3. 冲突与假设
4. ASCII 1:1 复刻稿
5. ASCII 层级线稿
6. 元素表
7. 布局与视觉参数
8. 置信度表和门禁结论
9. UI -> Code 映射
10. 资产与图标
11. 验收标准
12. 未决项
```

## 元素表最小字段

| 字段 | 说明 |
| --- | --- |
| id | 稳定元素 ID |
| name | 元素名 |
| role | 语义角色 |
| bounds | 坐标尺寸 |
| style | 颜色 / 字体 / 圆角 / 阴影等 |
| source | Figma / CSS / VLM / 用户文本 |
| confidence | 置信度 |

## proposal 确认块

```text
proposal_status: <pending_user_confirmation|confirmed|blocked>
ascii_1_1: <present|missing>
ascii_tree: <present|missing>
confidence_gate: <pass|blocked>
implementation_allowed: <yes|no>
```

## 终止原则

- 规格没写完前，不进入实现。
- 用户未确认 proposal 前，不进入实现。
- 置信度门禁未通过前，不进入实现。
- 规格出现新事实时，先回写当前 change，再继续。
