# 50 - 资产与图标

## 何时读取

- 需要处理图标、位图、占位图或命名规范时读取。
- 需要下载、保留或标记 deferred / failed 资产时读取。

## 必须产出

- 图标候选清单
- 项目命名扫描结果
- 下载 / 占位 / deferred 状态
- 失败原因
- 资源路径与文件名

## 规则

- 先收集候选，再决定是否下载。
- 只下载当前实现路径确实需要的图标。
- PNG 是默认交付格式；需要 SVG 只有在项目明确要求时才补。
- 下载失败时，用占位图保持布局尺寸，并把失败原因写回当前 change。
- 命名先扫描项目已有资源，再决定 fallback。

## 候选字段

| 字段 | 说明 |
| --- | --- |
| element_id | 对应元素 |
| region_id | 所属区域 |
| role | 图标语义 |
| bounds | 尺寸位置 |
| expected_size | 期望尺寸 |
| expected_color | 期望颜色 |
| need_export | 是否需要导出 |
| confidence | 置信度 |

## 命名 fallback

`ic_[page_slug]_[semantic_slug][_state].png`

## 状态记录

- `required`: 当前实现必须落盘
- `deferred`: 当前轮不下载，但保留候选
- `placeholder`: 使用占位图顶住布局
- `failed`: 下载或校验失败，记录原因
