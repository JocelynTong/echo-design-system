/**
 * 千岛新需求初始化
 * 用法: npm run new-demo <需求文件夹名>
 * 例如: npm run new-demo community-feed-v1
 *
 * 执行内容：
 *   1. 在 demos/ 下创建需求文件夹
 *   2. 从 business/_styles.css 复制冻结当前 token 版本
 *   3. 生成空白 figma-config.json 模板
 *   4. 显示候选池待决策数量
 */

const fs = require('fs');
const path = require('path');

const name = process.argv[2];
if (!name) {
  console.error('❌ 请指定需求文件夹名，例如: npm run new-demo community-feed-v1');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const targetDir = path.join(root, 'demos', name);

if (fs.existsSync(targetDir)) {
  console.error(`❌ 文件夹已存在: demos/${name}`);
  process.exit(1);
}

// 1. 创建文件夹
fs.mkdirSync(targetDir);

// 2. 从 business/_styles.css 复制（冻结当前 token 版本）
fs.copyFileSync(
  path.join(root, 'business', '_styles.css'),
  path.join(targetDir, 'styles.css')
);

// 3. 生成 figma-config.json 模板
const config = { name, pages: [], connections: [] };
fs.writeFileSync(
  path.join(targetDir, 'figma-config.json'),
  JSON.stringify(config, null, 2)
);

console.log(`\n✅ 需求文件夹已创建: demos/${name}/\n`);
console.log('  📁 styles.css        ← 当前 token 版本已冻结（来自 business/_styles.css）');
console.log('  📄 figma-config.json ← 页面流转模板，待填写');
console.log('\n接下来：');
console.log(`  1. 从 business/{module}/ 复制对应页面 HTML 到 demos/${name}/`);
console.log(`  2. 按需求改动 HTML`);
console.log(`  3. 填写 figma-config.json 的 pages 和 connections\n`);

// 4. 检查候选池
const candidatesPath = path.join(root, 'business', '_candidates.md');
if (fs.existsSync(candidatesPath)) {
  const content = fs.readFileSync(candidatesPath, 'utf-8');
  const highFreqRows = (content.match(/## 🔴[\s\S]*?(?=## 🟡|$)/)?.[0] || '')
    .split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('元素描述'));
  const lowFreqRows = (content.match(/## 🟡[\s\S]*/)?.[0] || '')
    .split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('元素描述'));

  if (highFreqRows.length > 0) {
    console.log(`⚠️  候选池有 ${highFreqRows.length} 项需要决策，${lowFreqRows.length} 项观察中`);
    console.log('   查看详情: business/_candidates.md');
    console.log('   或运行:   npm run review-candidates\n');
  }
}
