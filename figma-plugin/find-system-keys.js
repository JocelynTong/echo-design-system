/**
 * 查询 Status Bar & Home Indicator 的 key（含 variant 展开）
 * 先切到这两个组件所在的页面，再运行
 */
(function () {
  var results = figma.currentPage.findAll(function (n) {
    return (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')
      && (n.name.includes('Status Bar') || n.name.includes('StatusBar')
          || n.name.includes('Home Indicator') || n.name.includes('HomeIndicator')
          || n.name.includes('01.00') || n.name.includes('01.11'));
  });

  if (!results.length) {
    figma.notify('❌ 当前页未找到，请切换到正确页面再跑', { timeout: 4000 });
  } else {
    results.forEach(function (n) {
      console.log('[' + n.type + '] ' + n.name);
      console.log('  key: ' + n.key);
      if (n.type === 'COMPONENT_SET') {
        n.children.forEach(function (v) {
          console.log('  variant [' + v.name + ']: ' + v.key);
        });
      }
    });
    figma.notify('✅ 查看 Console', { timeout: 3000 });
  }
  figma.closePlugin();
})();

