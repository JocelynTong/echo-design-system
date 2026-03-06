# 千岛设计系统 · 全局规则

> 适用所有业务模块。AI 接任何需求前必须读此文件。

---

## Frame 命名约定

- Figma Frame 名字必须与对应 HTML 文件名一致（不含 .html 后缀）
- 例：Figma Frame `home-feed` → `business/community/home-feed.html`
- 命名确定后不可更改；删除重建时保持同名，ID 变了不影响按名字同步

---

## Token 铁律

- 所有颜色、间距、圆角必须使用 CSS `var()` token
- 禁止裸 hex / rgba() / px 颜色值直接写入 HTML
- 需要新值时：先在 `business/_styles.css` 加 token，再用 `var()`

---

## 图片占位规则

- 图片占位用实色色块（如 `background: var(--bg-4)`）
- 禁止用渐变作为占位（渐变看起来像设计元素，会误导评审）

---

## iOS 安全区规则

- ActionBar / TabBar / BottomBar 高度 83px，已含 34px 安全区，不另加 Home Indicator
- 独立页面（无底部 Bar）才需要单独放置 Home Indicator 组件（34px）

---

## 10% 新创意规则

- 允许不完全使用 token 和组件的新创意设计
- 新创意元素由插件导出时自动标记，记录进 `business/_candidates.md`
- 收口人在每次新需求开始时做决策（见候选池决策规则）

---

## 候选池决策规则

| 出现频次 | 状态 | 处理时机 |
|---|---|---|
| 3 次以上 | 🔴 需要决策 | 本周处理，飞书周报提醒 |
| 1-2 次 | 🟡 观察中 | 暂不处理，继续观察 |

决策三选一：**token 化** / **业务组件** / **忽略（一次性）**

---

## 新需求初始化规则

```bash
npm run new-demo <需求文件夹名>
# 例：npm run new-demo community-feed-v1
```

脚本自动从 `business/_styles.css` 复制冻结版 CSS，从 `business/{module}/` 复制规范 HTML 作为起点。
