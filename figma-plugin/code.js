/**
 * 千岛建稿助手 v2
 * 从 HTML demos 同步生成 Figma 原型
 */

// ── Key 表（Claude 按需往里加，不删已有条目）─────────────────
var KEYS = {
  // ✅ 已验证可用（UIKit 库）
  StatusBarSolid: '2f0822c67ed4a4951a09fecb453f76ce7e882cf5',
  StatusBarGhost: 'fca61ad869eda2219a414e1bd3799bfd88245da4',
  NavBar:    '360f770dbdab8921993cf27def796d9fd3d0f172',
  Tabs:      'c9686e38126de8f12027187be1a44b71ec9788bc',
  TabBar:    '58d45fd34a20eb2b8530af131a5291d7fa8782a9',

  // ✅ 业务组件 · Feed
  FeedCard:  'bc257468a92875667be7ef8502c1014821c5d58a', // 👻 03.07_Feed / Post · 2ColumnMobile

  // ✅ 业务组件（来自 02_业务组件_👻_社区 · 👻 社区基础 页面）
  PostHeader:      'cb0eab1b81a0a45d20a3bb1bb935dc5a78149dce',
  PostUser:        'b6eac960c5bb3bf9df0d8e79db07f9b16a5dbdf2',
  PostContents:    '0db8b003a07bb39b759da6186f9f3ed2d2ec1bc5', // LargeImage3:4
  PostDescription: '059e26c0dab5204619d673572e4a46f609633fa5',
  PostInfo:        '391fcf6eecd471b9ba66e281bd9ad19e681721d1',
  PostComments:    '5b3fe9d88dd39248b843fb8635dbc642b3d572ff', // Type=Default
  PostActionBar:   '6a884579d0077d98245b801aca063eed54362576', // 01.07 BottomBar 类型=Post

  // ✅ 岛组件（来自 02_业务组件_👻_社区 · 👻 社区结构-岛 页面）
  IslandsHeader:         'eecbc6c90b1707359ded719fde7ea758538f1a50',
  IslandsPinCell:        '0ee323d2a0cc150322dd836552a8923f8dbddb4f', // Type=Home
  IslandsPin:            'e0eaba05d0e32d3ea7ef305765499b592ee04777',
  IslandsGrid:           '9c425cfa52d08f39c0bd2470df414befee021d0e',
  IslandsSlide:          '11f0f10369d4947c619c4f74b9d00219f04e32bc',
  IslandsPairQuickEntry: 'ea4a6b55bb1be319da0bae1cea506357e0a39f69', // 数量=3
  IslandsDiscoveryHeader:'8ad2c9f998309ad6cb0bb534d366da4152b6c25d',
  IslandsDiscovery:      '4cdfb97c4bad528e37bd4a4468dc95aa276e297e',

  // ⬜ 暂未找到
  HomeIndicator:   null,
  SearchBar:       null,
  TagHeader:       null,
};

var W = 375, H = 812;
var comps = {};

// ── Design Token 颜色映射（与 styles.css 保持一致）─────────────
var TOKEN_COLORS = {
  'bg-1':              { r: 1,     g: 1,     b: 1     }, // #FFFFFF
  'bg-2':              { r: 0.969, g: 0.969, b: 0.976 }, // #F7F7F9
  'secondary-solidBg': { r: 0.169, g: 0.149, b: 0.231 }, // #2B263B
  'primary-solidBg':   { r: 0.486, g: 0.400, b: 1.000 }, // #7C66FF
};
function tokenFills(key) {
  var c = key && TOKEN_COLORS[key];
  return c ? [{ type: 'SOLID', color: c }] : null;
}

// ── 组件默认背景（可在 config 里用 "bg":"none" 覆盖）──────────
var COMP_DEFAULT_BG = {
  'StatusBarGhost': 'secondary-solidBg',
};

// ── 显示 UI ──────────────────────────────────────────────────
figma.showUI(__html__, { width: 300, height: 380 });

// ── 监听 UI 消息 ─────────────────────────────────────────────
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'build') {
    try {
      var result = await buildFromConfig(msg.config);
      figma.ui.postMessage({ type: 'done', count: result.count, sectionW: result.sectionW, sectionH: result.sectionH });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: e.message });
    }
  } else if (msg.type === 'export') {
    try {
      var exported = await exportSelection();
      figma.ui.postMessage({ type: 'exported', json: exported });
    } catch (e) {
      figma.ui.postMessage({ type: 'export-error', message: e.message });
    }
  } else if (msg.type === 'resize') {
    figma.ui.resize(300, Math.min(Math.max(msg.height, 200), 640));
  }
};

// ── 核心构建逻辑 ─────────────────────────────────────────────
async function buildFromConfig(config) {
  figma.notify('⏳ 正在导入组件...', { timeout: 12000 });

  // 并行导入有效组件（null 的直接跳过，不发网络请求）
  var keyNames = Object.keys(KEYS);
  await Promise.all(keyNames.map(async function(kn) {
    if (!KEYS[kn]) { comps[kn] = null; return; }
    try {
      comps[kn] = await figma.importComponentByKeyAsync(KEYS[kn]);
    } catch (e) {
      console.warn('⚠️ 跳过 [' + kn + ']:', e.message);
      comps[kn] = null;
    }
  }));

  // 先算好放置位置，再创建 section（避免 section 混入现有节点计算）
  var startX = 0, startY = 0;
  var snapshot = Array.from(figma.currentPage.children);
  if (snapshot.length > 0) {
    var minX = Infinity, maxBottom = -Infinity;
    snapshot.forEach(function (n) {
      if (typeof n.x === 'number' && n.x < minX) minX = n.x;
      var b = (n.y || 0) + (n.height || 0);
      if (b > maxBottom) maxBottom = b;
    });
    startX = isFinite(minX) ? minX : 0;
    startY = isFinite(maxBottom) ? maxBottom + 200 : 0;
  }

  var section = figma.createSection();
  figma.currentPage.appendChild(section);
  section.name = config.name || '从 HTML 导入';
  section.fills = [{ type: 'SOLID', color: { r: 0.929, g: 0.929, b: 0.949 } }]; // secondary/2 #EDEDF2

  var PADDING = 100;
  var GAP = 120;           // 帧间距扩大，给可视化连线留空间
  var frames = {};
  var x = PADDING;
  var pageCount = config.pages.length;
  var totalW = PADDING * 2 + pageCount * W + (pageCount - 1) * GAP;
  var totalH = PADDING * 2 + H;

  // 左上角占位点，撑开 section 到 (0,0)
  // 注意：先 append 再设坐标，确保坐标在 section 本地空间
  var spacerTL = figma.createRectangle();
  spacerTL.resize(1, 1);
  spacerTL.fills = []; spacerTL.locked = true;
  section.appendChild(spacerTL);
  spacerTL.x = 0; spacerTL.y = 0;

  // 右下角占位点，撑开 section 到 (totalW, totalH)
  var spacerBR = figma.createRectangle();
  spacerBR.resize(1, 1);
  spacerBR.fills = []; spacerBR.locked = true;
  section.appendChild(spacerBR);
  spacerBR.x = totalW - 1; spacerBR.y = totalH - 1;

  // 根据 config 生成每个页面
  config.pages.forEach(function(page) {
    var frame = figma.createFrame();
    frame.name = page.name;
    frame.resize(W, H);
    frame.clipsContent = true;
    frame.fills = tokenFills(page.bg) || [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    section.appendChild(frame);
    frame.x = x;
    frame.y = PADDING;
    x += W + GAP;

    var y = 0;
    page.components.forEach(function(comp) {
      var node = comp.key === '__group' ? makeGroup(comp, W) : make(comp.key, W);
      // 应用背景：comp.bg 优先，其次组件默认值，"none" 跳过
      var bgKey = comp.bg !== undefined ? comp.bg : COMP_DEFAULT_BG[comp.key];
      if (bgKey && bgKey !== 'none') {
        var f = tokenFills(bgKey);
        if (f) node.fills = f;
      }
      frame.appendChild(node);
      node.x = 0;
      node.y = y;
      y += node.height;
    });

    frames[page.name] = frame;
  });

  // ── 1. Prototype 连线（Prototype tab 可见，保持不变）──────────
  config.connections.forEach(function(conn) {
    var from = frames[conn.from];
    var to   = frames[conn.to];
    if (from && to) {
      from.reactions = [{
        trigger: { type: 'ON_CLICK' },
        actions: [{
          type: 'NODE',
          destinationId: to.id,
          navigation: 'NAVIGATE',
          transition: { type: 'SMART_ANIMATE', duration: 0.3, easing: { type: 'EASE_IN_AND_OUT' } },
          preserveScrollPosition: false
        }]
      }];
    }
  });

  // ── 2. 可视化连线（Design / Dev Mode 均可见）────────────────
  // createConnector() 仅 FigJam 可用，用矩形横线 + 三角箭头 + 纯文本标签
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  var PRIMARY = { r: 0.486, g: 0.4, b: 1.0 }; // primary/5 #7C66FF

  config.connections.forEach(function(conn) {
    var from = frames[conn.from];
    var to   = frames[conn.to];
    if (!from || !to) return;

    var goRight = from.x < to.x;
    // 正向偏上 28px，返回偏下 28px，错开不重叠
    var lineY  = from.y + from.height / 2 + (goRight ? -28 : 28);
    // 端点：从 source 外边缘 → dest 外边缘
    var startX = goRight ? from.x + from.width : from.x;
    var endX   = goRight ? to.x : to.x + to.width;
    var lineW  = Math.abs(endX - startX);
    if (lineW <= 0) return;

    var alpha = goRight ? 1.0 : 0.5; // 返回箭头略淡，区分主次

    // 横线
    var line = figma.createRectangle();
    section.appendChild(line);
    line.resize(lineW, 2);
    line.fills = [{ type: 'SOLID', color: PRIMARY }];
    line.opacity = alpha;
    line.x = Math.min(startX, endX);
    line.y = lineY - 1;

    // 箭头三角
    // 用 relativeTransform 精确定位：避免 rotation + x/y 包围盒偏移导致 tip 错位
    // polygon 默认 tip 在 local (aw/2, 0)（顶部中心）
    // CW 90°  → 指右：local(x,y) → parent(-y, x)  → tip(aw/2,0) → (0, aw/2)+t = (endX, lineY)
    // CCW 90° → 指左：local(x,y) → parent(y, -x)  → tip(aw/2,0) → (0,-aw/2)+t = (endX, lineY)
    var aw = 10, ah = 8;
    var tip = figma.createPolygon();
    section.appendChild(tip);
    tip.pointCount = 3;
    tip.resize(aw, ah);
    tip.fills = [{ type: 'SOLID', color: PRIMARY }];
    tip.opacity = alpha;
    tip.relativeTransform = goRight
      ? [[0, -1, endX],      [1,  0, lineY - aw / 2]]  // CW 90°,  tip → 右
      : [[0,  1, endX],      [-1, 0, lineY + aw / 2]]; // CCW 90°, tip → 左

    // 纯文本标签，正向居上，返回居下，不加背景
    if (conn.trigger) {
      var lbl = figma.createText();
      section.appendChild(lbl);
      lbl.fontSize   = 10;
      lbl.characters = conn.trigger;
      lbl.fills      = [{ type: 'SOLID', color: PRIMARY }];
      lbl.opacity    = alpha;
      var midX = (startX + endX) / 2;
      lbl.x = midX - lbl.width / 2;
      lbl.y = goRight ? lineY - 16 : lineY + 6;
    }
  });

  // section 尺寸 = 四周 100px padding + 所有 frame + frame 间距
  section.resizeWithoutConstraints(totalW, totalH);
  section.x = startX;
  section.y = startY;

  figma.viewport.scrollAndZoomIntoView([section]);

  return {
    count: config.pages.length,
    sectionW: Math.round(section.width),
    sectionH: Math.round(section.height),
  };
}

// ── 导出选中 Section 结构（Figma → HTML 反哺）─────────────────
// 导出内容：组件 key + variants + 文字内容 + 非组件节点 CSS
// 同时校验 Frame 命名是否在已注册名单内
async function exportSelection() {
  // 已注册的 Frame 名单（与 business/community.md 保持同步）
  var REGISTERED_FRAMES = ['home-feed', 'content-detail'];

  // 建立 key → name 反向映射
  var keyToName = {};
  Object.keys(KEYS).forEach(function(name) {
    if (KEYS[name]) keyToName[KEYS[name]] = name;
  });

  var sel = figma.currentPage.selection;
  if (!sel || sel.length === 0) throw new Error('请先在 Figma 里选中一个 Section 或 Frame');

  var target = sel[0];
  var frames = [];
  if (target.type === 'SECTION') {
    frames = target.children.filter(function(n) { return n.type === 'FRAME'; });
  } else if (target.type === 'FRAME') {
    frames = [target];
  } else {
    throw new Error('请选中 Section 或 Frame，当前选中的是 ' + target.type);
  }

  // ── 校验 Frame 命名 ──────────────────────────────────────────
  var warnings = [];
  frames.forEach(function(frame) {
    if (!REGISTERED_FRAMES.includes(frame.name)) {
      warnings.push('⚠️ Frame「' + frame.name + '」不在已注册名单，请确认命名是否正确或需要新增 HTML 文件');
    }
  });

  // ── 提取文字内容（递归查找 TEXT 节点）────────────────────────
  function extractTexts(node, result) {
    if (!result) result = {};
    if (node.type === 'TEXT') {
      result[node.name] = node.characters;
    }
    if ('children' in node) {
      node.children.forEach(function(child) { extractTexts(child, result); });
    }
    return result;
  }

  // ── 处理每个 Frame ───────────────────────────────────────────
  var pages = await Promise.all(frames.map(async function(frame) {
    var children = Array.from(frame.children).sort(function(a, b) { return a.y - b.y; });
    var components = [];
    var customNodes = [];

    for (var i = 0; i < children.length; i++) {
      var node = children[i];

      if (node.type === 'INSTANCE' && node.mainComponent) {
        // ── 组件实例：key + variants + 文字覆盖 ──────────────
        var key = node.mainComponent.key;
        var compName = keyToName[key] || node.mainComponent.name;
        var entry = { key: compName };

        // variants
        if (node.variantProperties && Object.keys(node.variantProperties).length > 0) {
          entry.variants = node.variantProperties;
        }

        // 文字内容覆盖
        var texts = extractTexts(node);
        if (Object.keys(texts).length > 0) {
          entry.texts = texts;
        }

        components.push(entry);

      } else {
        // ── 非组件节点：getCSSAsync 导出 ─────────────────────
        try {
          var css = await node.getCSSAsync();
          // 过滤掉空值
          var filteredCss = {};
          Object.keys(css).forEach(function(k) {
            if (css[k] && css[k] !== 'undefined') filteredCss[k] = css[k];
          });
          customNodes.push({ name: node.name, css: filteredCss });
          warnings.push('🎨 自定义节点「' + node.name + '」已导出原始 CSS，建议评估是否 token 化');
        } catch(e) {
          warnings.push('❓ 节点「' + node.name + '」无法导出 CSS：' + e.message);
        }
      }
    }

    var result = { name: frame.name, components: components };
    if (customNodes.length > 0) result.customNodes = customNodes;
    return result;
  }));

  var output = { pages: pages };
  if (warnings.length > 0) output.warnings = warnings;

  return JSON.stringify(output, null, 2);
}


function makeGroup(spec, w) {
  var f = figma.createFrame();
  f.name = '[组]';
  f.resize(w, 100);
  f.layoutMode = 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'FIXED';
  f.itemSpacing = spec.gap !== undefined ? spec.gap : 8;
  f.paddingTop = 0; f.paddingBottom = 0;
  f.paddingLeft = 0; f.paddingRight = 0;
  f.fills = tokenFills(spec.bg) || [];
  f.clipsContent = false;
  var r = spec.topRadius !== undefined ? spec.topRadius : 0;
  f.topLeftRadius = r;
  f.topRightRadius = r;
  f.bottomLeftRadius = 0;
  f.bottomRightRadius = 0;
  (spec.children || []).forEach(function(child) {
    var node = make(child.key, w);
    f.appendChild(node);
    try { node.layoutSizingHorizontal = 'FILL'; } catch(e) {}
  });
  return f;
}

function make(name, w) {
  if (!comps[name]) {
    var ph = figma.createRectangle();
    ph.name = '[占位] ' + name;
    ph.resize(w || W, 44);
    ph.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0.5 }, opacity: 0.4 }];
    return ph;
  }
  var node = comps[name].createInstance();
  if (w != null) node.resize(w, node.height);
  return node;
}
