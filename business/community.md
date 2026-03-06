# 千岛 · 社区业务规则

> PM 涉及社区模块的需求时，AI 读取本文件。
> 全局规则见 `business/_rules.md`，页面结构见 `business/community/*.html`。

---

## 业务组件 Key 表

### 内容详情页

| 组件名 | Figma Key |
|--------|-----------|
| `👻 Post / Header` | `cb0eab1b81a0a45d20a3bb1bb935dc5a78149dce` |
| `👻 Post / User` | `b6eac960c5bb3bf9df0d8e79db07f9b16a5dbdf2` |
| `👻 Post / Contents · LargeImage4:3` | `9a4e80ea008538345b1798d8f777a9ffcce4652e` |
| `👻 Post / Contents · LargeImage3:4` | `0db8b003a07bb39b759da6186f9f3ed2d2ec1bc5` |
| `👻 Post / Contents · NineGrid` | `ed86390c4894edb322d6632672ffc38871a0f65e` |
| `👻 Post / Contents · MainText` | `f53ed1436faf8d996e5dca9133a6a315a2346080` |
| `👻 Post / Description` | `059e26c0dab5204619d673572e4a46f609633fa5` |
| `👻 Post / Info` | `391fcf6eecd471b9ba66e281bd9ad19e681721d1` |
| `👻 Post / Comments · Default` | `5b3fe9d88dd39248b843fb8635dbc642b3d572ff` |
| `👻 Post / Comments · Empty` | `3a7f143be35176e5f0fae92ec31acf62add9b059` |
| `CommentInfo20260118`（底部互动栏） | `ad544c67ed0ecc59e1879c3a1176ce9e689af85e` |

### 首页 Feed

| 组件名 | Figma Key |
|--------|-----------|
| `👻 Feed / Post · 2ColumnMobile` | `bc257468a92875667be7ef8502c1014821c5d58a` |
| `👻 Feed / Post · 1ColumnMobile` | `1d1a919c166abcced25e50d747c1b634dc19fdba` |

---

## Post / Contents 变体选择指引

| PM 描述 | 使用 variant |
|---------|-------------|
| 图文帖（横版图） | `LargeImage4:3` |
| 图文帖（竖版图） | `LargeImage3:4` |
| 九宫格图片 | `NineGrid` |
| 纯文字帖 | `MainText` |

---

## 维护说明

- **新增业务组件**：设计师在 Figma 发布后，运行 `figma-plugin/extract-business-keys.js`，将新 key 补充到上方表格
- **页面结构调整**：设计师精调 Figma 后，使用插件导出 → AI 回写 `business/community/*.html`
- **已注册 Frame 名单**：`home-feed`、`content-detail`（插件导出时校验命名一致性）
