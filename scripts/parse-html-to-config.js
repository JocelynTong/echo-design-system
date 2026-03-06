/**
 * 解析 HTML demos → 生成 Figma 插件可用的 JSON config
 * 按 DOM 顺序扫描，精确匹配 class
 */

const fs = require('fs');
const path = require('path');

// HTML class → Figma component key 映射表
// key 必须是独立的 class（不作为其他 class 的前缀出现）
const CLASS_TO_KEY = {
  'status-bar--solid': 'StatusBarSolid',
  'status-bar--ghost': 'StatusBarGhost',
  'navbar': 'NavBar',
  'search-bar-row': 'SearchBar',
  'tabs-bar': 'Tabs',
  'tabbar': 'TabBar',
  'tag-header': 'TagHeader',
  'islands-header': 'IslandsHeader',
  'islands-pin-cell': 'IslandsPinCell',
  'islands-pin': 'IslandsPin',
  'islands-grid': 'IslandsGrid',
  'islands-slide': 'IslandsSlide',
  'islands-pair-quick-entry': 'IslandsPairQuickEntry',
  'islands-discovery-header': 'IslandsDiscoveryHeader',
  'islands-discovery': 'IslandsDiscovery',
  'feed-card': 'FeedCard',
  'post-header': 'PostHeader',
  'post-user': 'PostUser',
  'post-contents': 'PostContents',
  'post-description': 'PostDescription',
  'post-info': 'PostInfo',
  'post-comments': 'PostComments',
  'bottom-bar': 'PostActionBar',
};

// 检查一个 class 属性值中是否包含精确的目标 class
function hasExactClass(classAttr, targetClass) {
  return classAttr.split(/\s+/).includes(targetClass);
}

// 按 DOM 顺序扫描 HTML，返回匹配的组件列表
function parseHTMLFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const results = [];

  // 找出所有 class="..." 属性的位置和内容（按出现顺序）
  const classRegex = /class="([^"]*)"/g;
  let match;
  while ((match = classRegex.exec(html)) !== null) {
    const classAttr = match[1];
    for (const [cls, key] of Object.entries(CLASS_TO_KEY)) {
      if (hasExactClass(classAttr, cls)) {
        results.push({ key, class: cls });
        break; // 一个元素只取第一个匹配的 class
      }
    }
  }

  return results;
}

function generateConfig() {
  const demosDir = path.join(__dirname, '../demos');

  const pages = [
    { name: '01 首页 Feed', file: 'home-feed.html' },
    { name: '02 内容详情页', file: 'content-detail.html' },
    { name: '03 Tag 详情页', file: 'tag-detail.html' },
  ];

  const config = {
    pages: pages.map(p => ({
      name: p.name,
      components: parseHTMLFile(path.join(demosDir, p.file))
    })),
    connections: [
      { from: '01 首页 Feed',  to: '02 内容详情页', trigger: 'FeedCard' },
      { from: '02 内容详情页', to: '01 首页 Feed',  trigger: 'PostHeader' },
      { from: '02 内容详情页', to: '03 Tag 详情页', trigger: 'PostDescription' },
      { from: '03 Tag 详情页', to: '02 内容详情页', trigger: 'NavBar' },
    ]
  };

  return config;
}

module.exports = { generateConfig };

if (require.main === module) {
  const config = generateConfig();
  console.log(JSON.stringify(config, null, 2));
}
