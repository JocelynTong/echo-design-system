# 千岛 Design System Browser

基于 Figma Variables 三级映射 Token 的 H5 设计系统浏览器。

## 目录结构

```
├── index.html          # 设计系统浏览器页面
├── generate.py         # Token 处理脚本
└── tokens/
    ├── Primitives-QD.json      # L1 原子 token（Figma 导出）
    ├── 千岛.tokens.json         # L2/L3 亮色 token（Figma 导出）
    ├── 千岛暗黑.tokens.json     # L2/L3 暗色 token（Figma 导出）
    └── processed.json          # 自动生成，无需手动编辑
```

## 更新 Token 的流程

1. 从 Figma 重新导出 JSON → 覆盖 `tokens/` 目录下对应文件
2. `git add tokens/ && git commit -m "update: tokens" && git push`
3. GitHub Actions 自动运行 `generate.py` → 更新 `tokens/processed.json`
4. GitHub Pages 自动部署 → 团队访问 URL 即可看到最新版本

## 本地预览

```bash
# 本地运行 HTTP 服务（fetch 需要服务器环境）
python3 -m http.server 8080
# 访问 http://localhost:8080
```

> 注意：直接双击 HTML 文件无法加载数据（浏览器 CORS 限制），需要通过 HTTP 服务访问。
