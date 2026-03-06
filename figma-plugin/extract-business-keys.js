/**
 * 千岛建稿助手 · 业务组件 Key 提取（含位置排序）
 * 在 02_业务组件_👻_社区 文件中运行
 * 输出结果按组件在 Figma 中从上到下的 Y 坐标排序
 */
(async function () {

  var targetPage = null;
  for (var i = 0; i < figma.root.children.length; i++) {
    var p = figma.root.children[i];
    if (p.name.includes('社区基础')) { targetPage = p; break; }
  }
  if (targetPage) figma.currentPage = targetPage;
  console.log('扫描页面:', figma.currentPage.name);

  var allNodes = figma.currentPage.findAll(function (n) {
    return (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')
      && (n.name.includes('👻') || n.name.includes('Post') || n.name === 'CommentInfo20260118');
  });

  var results = [];
  allNodes.forEach(function (node) {
    var entry = {
      name: node.name,
      type: node.type,
      key: node.key,
      y: node.absoluteBoundingBox ? node.absoluteBoundingBox.y : 0,
      x: node.absoluteBoundingBox ? node.absoluteBoundingBox.x : 0,
    };
    if (node.type === 'COMPONENT_SET') {
      entry.defaultVariantKey = node.defaultVariant ? node.defaultVariant.key : null;
      entry.variants = {};
      node.children.forEach(function (v) {
        entry.variants[v.name] = v.key;
      });
    }
    results.push(entry);
  });

  // 按 Y 坐标从上到下排序（Y 相近时按 X 排）
  results.sort(function (a, b) {
    if (Math.abs(a.y - b.y) < 10) return a.x - b.x;
    return a.y - b.y;
  });

  console.log('\n=== 按页面位置排序的组件列表 ===\n');
  results.forEach(function (r, idx) {
    console.log((idx + 1) + '. [y=' + Math.round(r.y) + '] ' + r.name);
    console.log('   key: ' + r.key);
    if (r.defaultVariantKey) {
      console.log('   defaultVariantKey: ' + r.defaultVariantKey);
    }
    if (r.variants) {
      Object.keys(r.variants).forEach(function (vname) {
        console.log('   variant ' + vname + ': ' + r.variants[vname]);
      });
    }
  });

  figma.notify('✅ 已完成！查看 Console', { timeout: 3000 });
  figma.closePlugin();
})();
