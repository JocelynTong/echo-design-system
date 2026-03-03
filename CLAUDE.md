# 千岛设计系统 · AI 使用说明

> 本文件供 AI（如 Claude）自动读取。当产品经理或设计师向你描述界面需求时，请严格按照本文件中的规范输出设计方案。

设计系统浏览器：https://jocelyntong.github.io/qd-design-system/
组件文档目录：`components/` 目录下每个 JSON 文件

---

## 一、Token 三级映射规范

### 核心原则
颜色**只能**使用 L2 或 L3 token，**禁止**直接写 HEX 值。

```
L1 Primitives（原始值）
  └─ primarypurple_05 = #7C66FF
        ↓
L2 Tokens（语义层）
  ├─ 色阶层：primary/5 → primarypurple_05
  └─ 角色层：primary/solidBg → primary/5
        ↓
L3 Tokens（组件层）
  └─ primary/bt/solidBg → primary/solidBg
```

### 常用 L2 颜色 Token 速查

| Token | 用途 |
|-------|------|
| `primary/solidBg` | 主色实底背景 |
| `primary/softBg` | 主色淡底背景 |
| `primary/color` | 主色文字/图标 |
| `text/1` | 主要文字颜色 |
| `text/2` | 次要文字颜色 |
| `text/disabled` | 禁用文字颜色 |
| `icon/1` | 主要图标颜色 |
| `icon/2` | 次要图标颜色 |
| `bg/1` | 页面/卡片背景 |
| `border/1` | 常规描边颜色 |
| `success/solidBg` | 成功色背景 |
| `warning/solidBg` | 警告色背景 |
| `error/solidBg` | 错误色背景 |

### 间距 Token

| Token | 像素值 |
|-------|--------|
| `Spacing/Large` | 16px |
| `Spacing/Medium` | 12px |
| `Spacing/Normal` | 8px |
| `Spacing/Small` | 4px |
| `Spacing/Mini` | 2px |

### 圆角 Token

| Token | 像素值 |
|-------|--------|
| `Radius/Large` | 16px |
| `Radius/Medium` | 12px |
| `Radius/Normal` | 8px |
| `Radius/Small` | 4px |
| `Radius/Mini` | 2px |

---

## 二、组件规范（已录入）

### Button 按钮

详细规范见 `components/button.json`，核心速查：

#### 选哪种 Button？

| 场景 | 使用组件 |
|------|---------|
| 主操作（唯一 CTA） | `MH` Color=Primary, Type=Solid |
| 次要操作 | `MH` Color=Primary, Type=Soft 或 Outline |
| 仅需主品牌色 | `QH` Type=Solid/Soft/Outline/Text |
| 双品牌色场景 | `MH` Color=Primary 或 Secondary |
| 全局浮动操作 | `FAB` |
| 购物车场景 | `FloatCart` |
| 纯图标按钮 | `Icon` |

#### 尺寸选择

| Size | 高度 | 适用场景 |
|------|------|---------|
| Large(40) | 40px | 页面主 CTA，底部固定操作区 |
| Medium(36) | 36px | 表单提交，弹窗确认 |
| Normal(32) | 32px | 列表行内操作，卡片内操作 |
| Small(28) | 28px | 紧凑型操作区 |
| Mini(24) | 24px | 角标、Tag 内操作 |

#### 禁用规则
- `Disable Temp`：表单未填完、条件未满足等**临时**状态
- `Disable`：权限不足、功能不可用等**永久**状态

---

## 三、如何帮 PM 画原型

当 PM 描述一个页面需求时，请按以下步骤输出：

### 步骤 1：识别页面中的组件
将 PM 描述的每个 UI 元素映射到设计系统中的组件名称。

### 步骤 2：确定变体参数
对每个组件，给出完整的变体参数组合，例如：
```
按钮：💙 00.05_Button / MH
  Color = Primary
  Type = Solid
  Size = Large(40)
  Disable = False
```

### 步骤 3：输出 Figma 操作指引
告诉 PM 在 Figma 中如何找到和配置组件：
1. 在组件库中搜索组件名（如 `00.05_Button`）
2. 拖入画布
3. 在右侧面板切换 Variant 属性

### 步骤 4：给出布局建议
使用 Spacing token 描述间距：
- 页面边距：Spacing/Large (16px)
- 组件间距：Spacing/Normal (8px)
- 紧凑间距：Spacing/Small (4px)

---

## 四、输出格式模板

当帮 PM 设计一个页面时，请使用以下格式：

```
## [页面名称] 原型方案

### 页面结构
[描述页面的整体布局]

### 组件清单
| 区域 | 组件 | 变体参数 | 说明 |
|------|------|---------|------|
| 顶部 | NavigationBar | ... | ... |
| 内容区 | ... | ... | ... |
| 底部 | Button/MH | Color=Primary, Type=Solid, Size=Large(40) | 主 CTA |

### Figma 操作步骤
1. ...
2. ...

### Token 使用
- 背景色：bg/1
- 主文字：text/1
- ...
```

---

## 五、暂未录入的组件

以下组件页面存在于 Figma 文件中，但尚未整理成结构化文档，在帮 PM 设计时需谨慎使用，建议先确认组件可用性：

**Bar 系列**：Status Bar, Navigation Bar, Search Bar, Tabs, SegmentedControl, Tab Bar, Bottom Bar, Menu, Steps

**Form 系列**：FormItem, Input, Textarea, Radio, Checkbox, Switch, Stepper, Upload, DateTimePicker

**Data 系列**：Badge, Tag, Avatar, Feed, Spu, Price

**Feedback 系列**：NoticeBar, SnackBar, Toast, Dialog, Popup, Dropdown

> 如需使用以上组件，请告知设计师补充录入对应 `components/*.json` 文件。
