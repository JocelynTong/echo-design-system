/**
 * 最小验证脚本 —— 只放一个 Button
 * 在设计系统 Figma 文件中打开 Console 运行
 */
(async function () {

  // 1. 找 Button ComponentSet
  const cs = figma.root.findAll(
    n => n.type === 'COMPONENT_SET' && n.name.includes('00.05_Button')
  )[0];

  if (!cs) {
    figma.notify('❌ 未找到 Button，确认在设计系统文件内运行', { error: true });
    console.error('找到的 ComponentSet:', figma.root.findAll(n => n.type === 'COMPONENT_SET').map(n => n.name));
    return;
  }

  console.log('✅ 找到 ComponentSet:', cs.name);
  console.log('默认变体:', cs.defaultVariant.name);

  // 2. 创建实例
  const btn = cs.defaultVariant.createInstance();

  // 3. 设置变体属性（Primary Solid Large）
  try {
    btn.setProperties({ Color: 'Primary', Type: 'Solid', Size: 'Large(40)' });
    console.log('✅ setProperties 成功');
  } catch (e) {
    console.warn('⚠️ setProperties 失败:', e.message);
    console.log('可用属性:', cs.componentPropertyDefinitions);
  }

  // 4. 放到当前页面
  figma.currentPage.appendChild(btn);
  btn.x = 100;
  btn.y = 100;

  figma.viewport.scrollAndZoomIntoView([btn]);
  figma.notify('✅ Button 实例创建成功！');

})();
