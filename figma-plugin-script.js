/**
 * 千岛设计系统 · 自动建稿脚本
 *
 * 使用方式：
 *   在设计系统 Figma 文件 (HjpmfUPwU7HGMRj9X80TAY) 中打开
 *   Plugins → Development → Open Console → 粘贴此脚本 → 回车
 *
 * 会在当前页面创建两个 Frame：
 *   🏠 首页 Feed  |  📄 内容详情页
 */

(async function () {

  // ──────────────────────────────────────────────
  //  常量
  // ──────────────────────────────────────────────
  const W = 390, H = 844;
  const STATUS_H  = 44;   // iOS 状态栏
  const NAVBAR_H  = 44;
  const SEARCHBAR_H = 36;
  const TABS_H    = 40;
  const TABBAR_H  = 83;   // TabBar + HomeIndicator
  const BOTTOMBAR_H = 83;
  const LG = 16, NM = 8, SM = 4;

  // ──────────────────────────────────────────────
  //  工具：查找 ComponentSet / Component
  // ──────────────────────────────────────────────
  const _csCache = {};

  function findComponentSet(name) {
    if (_csCache[name]) return _csCache[name];
    // 精确匹配 ComponentSet
    let found = figma.root.findAll(
      n => n.type === 'COMPONENT_SET' && n.name === name
    )[0];
    // 模糊匹配（去掉 emoji 前缀）
    if (!found) {
      const bare = name.replace(/^[^\w]+/, '').trim();
      found = figma.root.findAll(
        n => n.type === 'COMPONENT_SET' && n.name.includes(bare)
      )[0];
    }
    // 单独 Component（无变体的组件）
    if (!found) {
      found = figma.root.findAll(
        n => n.type === 'COMPONENT' && n.name === name
      )[0];
    }
    if (found) _csCache[name] = found;
    return found || null;
  }

  /**
   * 创建组件实例
   * @param {string}  csName   ComponentSet 名称（来自 CLAUDE.md）
   * @param {object}  props    变体属性，如 { Terminal: 'App', Ghost: 'False' }
   * @param {number}  w        可选：覆盖宽度
   * @param {number}  h        可选：覆盖高度
   */
  function inst(csName, props = {}, w = null, h = null) {
    const cs = findComponentSet(csName);
    if (!cs) {
      console.warn(`❌ 未找到组件: "${csName}"`);
      const rect = figma.createRectangle();
      rect.name = `[缺失] ${csName}`;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.6, b: 0.6 }, opacity: 0.4 }];
      if (w) rect.resize(w, h ?? 44);
      return rect;
    }

    const base = cs.type === 'COMPONENT_SET' ? cs.defaultVariant : cs;
    const node = base.createInstance();

    if (Object.keys(props).length) {
      try { node.setProperties(props); }
      catch (e) { console.warn(`⚠️ setProperties 失败 (${csName}):`, e.message); }
    }
    if (w !== null) node.resize(w, h ?? node.height);
    return node;
  }

  // 添加子节点并设置坐标
  function add(frame, node, x, y) {
    frame.appendChild(node);
    node.x = x;
    node.y = y;
    return node;
  }

  // 占位矩形（颜色模拟）
  function placeholder(name, w, h, r, g, b) {
    const rect = figma.createRectangle();
    rect.name = name;
    rect.resize(w, h);
    rect.fills = [{ type: 'SOLID', color: { r, g, b } }];
    return rect;
  }

  // ══════════════════════════════════════════════
  //  Frame 1：🏠 首页 Feed
  // ══════════════════════════════════════════════
  const homeFrame = figma.createFrame();
  homeFrame.name = '🏠 首页 Feed';
  homeFrame.resize(W, H);
  homeFrame.clipsContent = true;
  // bg/1 ≈ #F7F7F9
  homeFrame.fills = [{ type: 'SOLID', color: { r: 0.969, g: 0.969, b: 0.976 } }];
  figma.currentPage.appendChild(homeFrame);

  let y = 0;

  // 状态栏
  add(homeFrame, placeholder('Status Bar', W, STATUS_H, 1, 1, 1), 0, y);
  y += STATUS_H;

  // Navigation Bar（实底，App 形态）
  const homeNav = inst('💙 01.01_Navigation Bar', { Terminal: 'App', Ghost: 'False' }, W, NAVBAR_H);
  homeNav.name = 'NavBar';
  add(homeFrame, homeNav, 0, y);
  y += NAVBAR_H + SM;

  // Search Bar（嵌在 Nav 下方，左右 16px 边距）
  const sb = inst('💙 01.04_Search Bar', {}, W - LG * 2, SEARCHBAR_H);
  sb.name = 'SearchBar';
  add(homeFrame, sb, LG, y);
  y += SEARCHBAR_H + NM;

  // Tabs（内容分类：推荐 / 关注 / 视频 / 好物 / 同城）
  const tabsComp = inst('💙 01.02_Tabs / Echo',
    { className: 'CardDefault', Amount: '>3' }, W, TABS_H);
  tabsComp.name = 'Tabs 内容分类';
  add(homeFrame, tabsComp, 0, y);
  y += TABS_H + NM;

  // Feed 双列瀑布流（4张卡片，交替 4:3 / 3:4）
  const CARD_W = 174;
  const ratios = ['4:3', '3:4', '3:4', '4:3'];
  let colY = [y, y]; // 两列各自的当前 y
  const colX = [NM, NM + CARD_W + NM];

  for (let i = 0; i < 4; i++) {
    const col = colY[0] <= colY[1] ? 0 : 1;
    const card = inst('💙 03.07_Feed / Post',
      { Size: ratios[i], Image: 'True' }, CARD_W);
    card.name = `Feed Card ${i + 1} (${ratios[i]})`;
    add(homeFrame, card, colX[col], colY[col]);
    colY[col] += card.height + NM;
  }

  // Tab Bar（底部固定）
  const homeTabBar = inst('💙 01.05 Tab Bar / APP / 5Tabs', {}, W, TABBAR_H);
  homeTabBar.name = 'TabBar';
  add(homeFrame, homeTabBar, 0, H - TABBAR_H);

  console.log('✅ 首页 Feed 创建完成');

  // ══════════════════════════════════════════════
  //  Frame 2：📄 内容详情页
  // ══════════════════════════════════════════════
  const detailFrame = figma.createFrame();
  detailFrame.name = '📄 内容详情页';
  detailFrame.resize(W, H);
  detailFrame.clipsContent = true;
  detailFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // bg/2 白底
  detailFrame.x = W + 40; // 并排放在首页右侧
  figma.currentPage.appendChild(detailFrame);

  // 封面图（全出血，NavBar Ghost 叠在上方）
  const coverH = 390;
  const cover = placeholder('封面图 390×390', W, coverH, 0.82, 0.82, 0.88);
  add(detailFrame, cover, 0, 0);

  // Status Bar（透明，叠在封面上）
  const statusDetail = placeholder('Status Bar', W, STATUS_H, 0, 0, 0);
  statusDetail.opacity = 0;
  add(detailFrame, statusDetail, 0, 0);

  // Navigation Bar Ghost=True（透明背景，叠在封面图上）
  const detailNav = inst('💙 01.01_Navigation Bar',
    { Terminal: 'App', Ghost: 'True' }, W, NAVBAR_H);
  detailNav.name = 'NavBar (Ghost)';
  add(detailFrame, detailNav, 0, STATUS_H);

  // 正文内容区
  let dy = coverH + LG;

  // 标题文字（占位）
  await figma.loadFontAsync({ family: 'PingFang SC', style: 'Medium' });
  const title = figma.createText();
  title.fontName = { family: 'PingFang SC', style: 'Medium' };
  title.fontSize = 18;          // H3
  title.lineHeight = { value: 25, unit: 'PIXELS' };
  title.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.13, b: 0.18 } }]; // text/1
  title.characters = '内容标题：H3 样式 / 18px Medium';
  title.resize(W - LG * 2, 25);
  add(detailFrame, title, LG, dy);
  dy += 25 + NM;

  // 正文文字（占位）
  await figma.loadFontAsync({ family: 'PingFang SC', style: 'Regular' });
  const body = figma.createText();
  body.fontName = { family: 'PingFang SC', style: 'Regular' };
  body.fontSize = 14;           // B5
  body.lineHeight = { value: 22, unit: 'PIXELS' };
  body.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.38 } }]; // text/2
  body.characters = '正文内容区域，B5 样式（14px Regular / 行高22px）。\n点赞/评论数字使用 N6 样式（12px Roboto Medium）。';
  body.textAutoResize = 'HEIGHT';
  body.resize(W - LG * 2, 22);
  add(detailFrame, body, LG, dy);
  dy += body.height + NM;

  // Bottom Bar（底部固定，含评论输入+互动按钮）
  const bottomBar = inst('💙 01.07_Bottom Bar', {}, W, BOTTOMBAR_H);
  bottomBar.name = 'BottomBar';
  add(detailFrame, bottomBar, 0, H - BOTTOMBAR_H);

  console.log('✅ 内容详情页创建完成');

  // ──────────────────────────────────────────────
  //  完成：聚焦视图
  // ──────────────────────────────────────────────
  figma.viewport.scrollAndZoomIntoView([homeFrame, detailFrame]);
  figma.notify('🎉 两个页面创建完成！缺失组件会显示为红色矩形。', { timeout: 4000 });

})();
