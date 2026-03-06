# 千岛 Design System Browser

基于 Figma Variables 三级映射 Token 的 H5 设计系统浏览器。

## 目录结构

```
├── index.html                  # 设计系统浏览器页面
├── generate.py                 # Token 处理脚本
│
├── tokens/                     # 设计 token 源头（Figma 导出）
│   ├── Primitives-QD.json      # L1 原子 token
│   ├── 千岛.tokens.json         # L2/L3 亮色 token
│   ├── 千岛暗黑.tokens.json     # L2/L3 暗色 token
│   └── processed.json          # 自动生成，无需手动编辑
│
├── components/                 # 原子组件规范文档（JSON）
│   └── button.json / navbar.json / ...
│
├── business/                   # 各业务模块的页面规范（给 AI 读）
│   ├── community.md            # 社区：页面组件顺序、结构标准
│   └── c2c.md                  # C2C：同上
│
└── demos/                      # HTML 原型（一个需求一个文件夹）
    ├── [需求名]/
    │   ├── styles.css          # 全局 token + reset（从母版复制，冻结）
    │   ├── [页面].html         # 该需求涉及的每个页面
    │   └── figma-config.json   # 该需求的页面流转配置
    └── styles.css              # 母版，新建需求时从这里复制
```

---

## 新人理解指南

### 这个项目里谁读哪个文件？

| 文件 | 谁读 | 存什么 |
|------|------|--------|
| `tokens/*.json` | `generate.py` 脚本 | 颜色、间距、圆角的原始数值（Figma 导出）|
| `components/*.json` | AI | 组件的变体、尺寸、用法规范 |
| `business/*.md` | AI | 某个业务页面由哪些组件构成、顺序是什么 |
| `demos/*/styles.css` | 浏览器 | token 转成的 CSS 变量 + reset |
| `demos/*/*.html` | 浏览器 | 实际可预览的原型页面 |
| `demos/*/figma-config.json` | Figma 插件 | 页面流转关系，用于同步到 Figma |

---

### 为什么 token 要存两份？（JSON 和 CSS）

浏览器不认识 JSON，只认识 CSS。所以同一份 token 数据需要两种格式：

```
tokens/千岛.tokens.json          →   跑 generate.py   →   demos/styles.css
{ "primary": "#7C66FF" }                                   --primary-solid-bg: #7C66FF;

（设计师维护的源头）                                          （浏览器能读的形式）
```

`styles.css` 里的 token 变量是脚本生成的产物，不是手写的，不算重复。

---

### business/*.md 和 styles.css 有什么区别？

两者描述的维度完全不同：

- `business/community.md`：**结构规范**，回答「这个页面由哪些组件组成、顺序是什么」，给 AI 读
- `styles.css`：**视觉资源**，回答「这个元素长什么样」，给浏览器读

类比建筑：`community.md` 是建筑图纸（房间怎么布局），`styles.css` 是装修材料手册（用什么颜色、什么材质）。

---

### demos 为什么一个需求一个文件夹？

每个需求文件夹是一份**完整快照**，包含该需求交付时所有页面的样子。

这样做的好处：当设计 token 版本升级时，旧需求的视觉不受影响——因为它的 `styles.css` 是在创建时从母版复制进来的，之后与外部脱钩。

```
demos/
├── styles.css                  ← 母版，只用来复制
├── community-feed-v1/          ← 需求A，冻结在 token v1 时期的视觉
│   ├── styles.css
│   ├── home-feed.html
│   └── figma-config.json
└── community-feed-v2/          ← 需求B，冻结在 token v2 时期的视觉
    ├── styles.css
    ├── home-feed.html
    └── figma-config.json
```

---

### figma-config.json 是什么？

描述这个需求里各页面的跳转关系，供 Figma 插件读取，自动在 Figma 里生成可点击的原型流程。

```json
{
  "name": "社区首页 → 内容详情",
  "pages": [ ... ],
  "connections": [
    { "from": "首页Feed", "to": "帖子详情", "trigger": "FeedCard" }
  ]
}
```

---

### 完整工作流程

```
① PM 描述需求
       ↓
② AI 识别业务归属
       ↓
③ AI 规划页面清单
       ↓
④ 创建需求文件夹
       ↓
⑤ 搭建 HTML 原型
       ↓
⑥ 编写 figma-config.json
       ↓
⑦ 预览 & 迭代
       ↓
⑧ 确认交付 → 文件夹冻结存档
       ↓
⑨ 同步到 Figma（可选）
```

---

**① PM 描述需求**

PM 用自然语言描述需求，不需要特定格式。AI 需要从中识别：
- 属于哪个业务模块（社区？C2C？跨业务？）
- 涉及哪些页面（新页面还是在现有页面上改）
- 核心功能点是什么

---

**② AI 识别业务归属 → 读 `business/*.md`**

| PM 说的关键词 | AI 读取的文件 |
|-------------|-------------|
| 社区、帖子、Feed、内容详情 | `business/community.md` |
| C2C、商品、二手、下单 | `business/c2c.md` |
| 跨业务（如社区内容变现） | 两个都读 |

读取目的：确认页面的**基线组件顺序**，不自己发明结构。

---

**③ AI 规划页面清单**

确定本次需求涉及的所有页面，区分：
- **改已有页面**：在基线结构上增删组件
- **新建页面**：按 `business/*.md` 的模板从头搭

同时规划页面间的跳转关系，为后续写 `figma-config.json` 做准备。

---

**④ 创建需求文件夹**

命名规则：`{业务}-{需求简称}-v{版本号}`，一键初始化：

```bash
npm run new-demo community-feed-v1
```

自动从 `business/_styles.css` 复制冻结 CSS，此刻复制即冻结，后续 token 升级不影响旧需求视觉。同时显示候选池待决策数量。

---

**⑤ 搭建 HTML 原型**

从 `business/{module}/` 复制对应页面 HTML 作为起点，按需求修改：
- 引用 `./styles.css`（文件夹内的冻结版本）
- 页面专属样式写在 HTML 的 `<style>` 块里
- 图片占位用实色色块，不用渐变

---

**⑥ 编写 `figma-config.json`**

描述需求内所有页面的跳转关系：

```json
{
  "name": "社区内容变现 v1",
  "pages": [
    { "name": "01 首页Feed" },
    { "name": "02 帖子详情" },
    { "name": "03 商品弹层" }
  ],
  "connections": [
    { "from": "01 首页Feed", "to": "02 帖子详情", "trigger": "FeedCard" },
    { "from": "02 帖子详情", "to": "03 商品弹层", "trigger": "商品标签" }
  ]
}
```

跨业务跳转直接在 `connections` 里写，不受业务模块归属限制。

---

**⑦ 预览 & 迭代**

```bash
bash preview.sh    # 默认打开 community-default/home-feed.html
bash preview.sh demos/community-feed-v1/home-feed.html  # 指定页面
```

同一需求的迭代在同一文件夹内改，不新建文件夹。

---

**⑧ 确认交付 → 文件夹冻结存档**

PM 最终确认后该文件夹不再修改，下一期迭代新建 v2 文件夹。

---

**⑨ 同步到 Figma**

```bash
npm run figma-sync community-feed-v1
```

读取需求文件夹的 `figma-config.json` → 自动在 Figma 里生成页面和跳转关系，供设计师精调。

---

**⑩ 设计师精调 → 插件导出 → 回写 business/ 规范稿**

设计师精调完成后：
1. 在 Figma 里选中对应 Section
2. 插件点「导出结构」→ 自动导出 variants + 文字内容 + 自定义节点 CSS
3. 将导出 JSON 粘给 AI
4. AI 对比差异，回写 `business/{module}/*.html` 规范稿
5. 规范稿更新后，下次 PM 新需求从最新规范稿开始

导出时插件自动校验 Frame 命名，并将非 token 节点追加到 `business/_candidates.md`。

---

**⑪ 候选池决策（每周一 11:00 飞书提醒）**

飞书群机器人每周一自动推送候选池状态，收口人做三选一决策：

| 选项 | 操作 |
|---|---|
| token 化 | AI 将新值加入 `business/_styles.css` |
| 业务组件 | AI 在 `business/{module}/` 里建组件片段 |
| 忽略 | 从候选池移除，保留为一次性裸值 |

---

## 飞书机器人配置

**第一步：在飞书群里创建机器人**

1. 打开目标飞书群 → 群设置 → 机器人 → 添加机器人
2. 选择「自定义机器人」→ 填写名称（如「设计系统助手」）
3. 复制生成的 **Webhook 地址**（格式：`https://open.feishu.cn/open-apis/bot/v2/hook/xxx`）

**第二步：将 Webhook 存入 GitHub Secrets**

1. 打开仓库 → Settings → Secrets and variables → Actions
2. 点击「New repository secret」
3. Name 填 `FEISHU_WEBHOOK`，Value 填上一步复制的地址
4. 点击「Add secret」

完成后，每周一 11:00 飞书群会自动收到候选池周报。也可手动触发：
仓库 → Actions → 「设计系统候选池提醒」→ Run workflow

---

## 更新 Token 的流程

1. 从 Figma 重新导出 JSON → 覆盖 `tokens/` 目录下对应文件
2. `git add tokens/ && git commit -m "update: tokens" && git push`
3. GitHub Actions 自动运行 `generate.py` → 更新 `tokens/processed.json`
4. 同步更新 `business/_styles.css`：重新运行 generate.py 并覆盖

## 本地预览

```bash
python3 -m http.server 8080
# 访问 http://localhost:8080
```

> 注意：直接双击 HTML 文件无法加载数据（浏览器 CORS 限制），需要通过 HTTP 服务访问。
