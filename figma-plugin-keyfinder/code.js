/**
 * 千岛 · 提取业务组件 Key
 * 在 02_业务组件_👻_社区 文件中运行
 */

figma.showUI(`
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: monospace; padding: 12px; background:#fff; display:flex; flex-direction:column; gap:8px; }
    h3 { font-size:12px; color:#333; }
    select { width:100%; padding:4px; font-size:11px; border:1px solid #ddd; border-radius:4px; }
    button { padding:6px; background:#7C66FF; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:11px; }
    textarea { width:100%; height:280px; border:1px solid #ddd; border-radius:4px; padding:8px; font-size:10px; font-family:monospace; resize:none; outline:none; }
    p { font-size:10px; color:#888; }
  </style>
  <h3>提取组件 Key</h3>
  <select id="pageSelect"></select>
  <button id="scanBtn">扫描选中页面</button>
  <textarea id="out" readonly>选择页面后点「扫描」</textarea>
  <p>⌘A 全选 → ⌘C 复制 → 发给 Claude</p>
  <script>
    window.onmessage = function(e) {
      var msg = e.data.pluginMessage;
      if (!msg) return;
      if (msg.type === 'pages') {
        var sel = document.getElementById('pageSelect');
        msg.pages.forEach(function(p, i) {
          var opt = document.createElement('option');
          opt.value = i;
          opt.textContent = p;
          sel.appendChild(opt);
        });
      }
      if (msg.type === 'result') {
        document.getElementById('out').value = msg.text;
      }
    };
    document.getElementById('scanBtn').onclick = function() {
      var idx = parseInt(document.getElementById('pageSelect').value);
      document.getElementById('out').value = '扫描中...';
      parent.postMessage({ pluginMessage: { type: 'scan', pageIndex: idx } }, '*');
    };
  </script>
`, { width: 440, height: 460 });

// 发送所有页面名
var pageNames = figma.root.children.map(function(p) { return p.name; });
figma.ui.postMessage({ type: 'pages', pages: pageNames });

figma.ui.onmessage = async function(msg) {
  if (msg.type !== 'scan') return;
  var page = figma.root.children[msg.pageIndex];
  if (!page) return;
  figma.currentPage = page;

  var allNodes = figma.currentPage.findAll(function (n) {
    return n.type === 'COMPONENT' || n.type === 'COMPONENT_SET';
  });

  allNodes.sort(function (a, b) {
    var ay = a.absoluteBoundingBox ? a.absoluteBoundingBox.y : 0;
    var by = b.absoluteBoundingBox ? b.absoluteBoundingBox.y : 0;
    return ay - by;
  });

  var lines = ['页面: ' + page.name, '共 ' + allNodes.length + ' 个组件\n'];
  allNodes.forEach(function (node, idx) {
    lines.push((idx + 1) + '. ' + node.name + '  [' + node.type + ']');
    lines.push('   key: ' + node.key);
    if (node.type === 'COMPONENT_SET' && node.defaultVariant) {
      lines.push('   defaultVariantKey: ' + node.defaultVariant.key);
      node.children.forEach(function (v) {
        lines.push('   variant [' + v.name + ']: ' + v.key);
      });
    }
    lines.push('');
  });

  figma.ui.postMessage({ type: 'result', text: lines.join('\n') });
};
