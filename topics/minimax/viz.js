/* Minimax / Alpha-Beta — game tree วางผังด้วย d3.tree() (custom + VizPlayer/Stepper) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'minimax');

  var PAD = 44, VW = 760, VH = 380;
  var host = document.getElementById('mmviz');
  host.innerHTML =
    '<div class="viz-grid">' +
      '<div>' +
        '<div class="viz-stage"><svg class="viz-svg" id="mm-svg" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet"></svg></div>' +
        '<div id="mm-ctrls"></div>' +
      '</div>' +
      '<div><div class="code-panel" id="mm-code"></div></div>' +
    '</div>';

  var svg = d3.select('#mm-svg');
  var gE = svg.append('g'), gL = svg.append('g'), gN = svg.append('g');
  var codeEl = document.getElementById('mm-code');
  var codeLineEls = [];
  function setCode(lines) {
    codeEl.innerHTML = lines.map(function (l) { return '<span class="code__line">' + l.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>'; }).join('');
    codeLineEls = codeEl.querySelectorAll('.code__line');
  }
  var MM_CODE = [
    'minimax(node, isMax):',                       // 0
    '  if leaf: return value',                     // 1
    '  if MAX:  best = −∞',                         // 2
    '    for child: best = max(best, minimax(child, MIN))', // 3
    '  if MIN:  best = +∞',                         // 4
    '    for child: best = min(best, minimax(child, MAX))', // 5
    '  return best',                               // 6
  ];
  var AB_CODE = [
    'ab(node, α, β, isMax):',                      // 0
    '  if leaf: return value',                     // 1
    '  if MAX: best=−∞ ; for child:',               // 2
    '    best=max(best, ab(child,α,β,MIN)); α=max(α,best)', // 3
    '    if α ≥ β: ✂️ ตัดกิ่งที่เหลือ (β-cutoff)',  // 4
    '  if MIN: best=+∞ ; for child:',               // 5
    '    best=min(best, ab(child,α,β,MAX)); β=min(β,best)', // 6
    '    if α ≥ β: ✂️ ตัดกิ่งที่เหลือ (α-cutoff)',  // 7
  ];

  // ---- โครงต้นไม้เกม ----
  var ROOT, leafCount, DEPTH = 3, BRANCH = 2;
  function buildTree() {
    var idc = 0, leaves = 0;
    function make(d) {
      var node = { id: idc++, d: d, children: [] };
      if (d === DEPTH) { node.leaf = true; node.v = 2 + Math.floor(Math.random() * 98); leaves++; }
      else for (var i = 0; i < BRANCH; i++) node.children.push(make(d + 1));
      return node;
    }
    ROOT = make(0); leafCount = leaves;
  }

  // ---- state ต่อ step ----
  var val, cls, ab;
  function snap() {
    var s = { val: {}, cls: {}, ab: {} };
    for (var k in val) s.val[k] = val[k];
    for (var k2 in cls) s.cls[k2] = cls[k2];
    for (var k3 in ab) s.ab[k3] = ab[k3];
    return s;
  }

  function render(step) {
    var st = step.snapshot;
    // ขนาด viewBox ตามจำนวนใบไม้/ความลึก
    var w = Math.max(700, leafCount * 70), h = Math.max(300, (DEPTH + 1) * 96);
    svg.attr('viewBox', '0 0 ' + w + ' ' + h);
    var hier = d3.hierarchy(ROOT, function (d) { return d.children; });
    d3.tree().size([w - 2 * PAD, h - 2 * PAD])(hier);
    var nodes = hier.descendants(), links = hier.links();
    function X(n) { return PAD + n.x; } function Y(n) { return PAD + n.y; }
    var dur = 260;

    function edgeCls(t) { return st.cls[t.data.id] === 'pruned' ? 'is-faded' : ''; }
    var ln = gE.selectAll('line.gedge').data(links, function (d) { return d.target.data.id; });
    ln.exit().remove();
    ln.enter().append('line').attr('class', 'gedge')
      .merge(ln).attr('class', function (d) { return 'gedge ' + edgeCls(d.target); })
        .transition().duration(dur)
        .attr('x1', function (d) { return X(d.source); }).attr('y1', function (d) { return Y(d.source); })
        .attr('x2', function (d) { return X(d.target); }).attr('y2', function (d) { return Y(d.target); });

    function fill(d) {
      var c = st.cls[d.data.id];
      if (c === 'pruned') return '#e5e7eb';
      if (c === 'active') return '#f59e0b';
      if (c === 'done') return '#10b981';
      if (d.data.leaf) return '#ffffff';
      return d.data.d % 2 === 0 ? '#dbeafe' : '#fce7f3';
    }
    function valText(d) {
      if (d.data.leaf) return d.data.v;
      var c = st.cls[d.data.id];
      if (c === 'pruned') return '×';
      return (st.val[d.data.id] == null) ? '?' : st.val[d.data.id];
    }
    var nd = gN.selectAll('g.mnode').data(nodes, function (d) { return d.data.id; });
    nd.exit().remove();
    var ent = nd.enter().append('g').attr('class', 'mnode');
    ent.append('circle').attr('r', 18);
    ent.append('text').attr('class', 'mn-val').attr('text-anchor', 'middle').attr('dy', '.34em').attr('font-weight', '700');
    ent.append('text').attr('class', 'mn-ab').attr('text-anchor', 'middle').attr('y', -26).attr('font-size', '11').attr('font-weight', '600').attr('fill', '#475569');
    ent.append('text').attr('class', 'mn-type').attr('text-anchor', 'middle').attr('y', 32).attr('font-size', '10').attr('fill', '#94a3b8');
    var all = ent.merge(nd);
    all.transition().duration(dur).attr('transform', function (d) { return 'translate(' + X(d) + ',' + Y(d) + ')'; });
    all.select('circle').attr('stroke', '#334155').attr('stroke-width', 1.5).attr('fill', fill);
    all.select('.mn-val').attr('fill', function (d) { return st.cls[d.data.id] === 'pruned' ? '#94a3b8' : '#0f172a'; }).text(valText);
    all.select('.mn-ab').text(function (d) { return st.ab[d.data.id] || ''; });
    all.select('.mn-type').text(function (d) { return d.data.leaf ? '' : (d.data.d % 2 === 0 ? 'MAX' : 'MIN'); });

    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('mm-ctrls'), speed: 600 });

  function fmt(x) { return x === Infinity ? '+∞' : (x === -Infinity ? '−∞' : x); }

  function go(usePrune) {
    setCode(usePrune ? AB_CODE : MM_CODE);
    val = {}; cls = {}; ab = {};
    var S = new DSA.Stepper(), visited = 0;
    function step(msg, line) { S.add(snap(), msg, { line: line }); }
    function prune(node) { cls[node.id] = 'pruned'; node.children.forEach(prune); }

    function rec(node, alpha, beta, isMax) {
      cls[node.id] = 'active';
      if (usePrune) ab[node.id] = 'α=' + fmt(alpha) + ' β=' + fmt(beta);
      if (node.leaf) {
        visited++; val[node.id] = node.v;
        step('🍃 ใบไม้: ค่า = ' + node.v, 1);
        cls[node.id] = 'done';
        return node.v;
      }
      step((isMax ? 'MAX' : 'MIN') + ': เริ่มพิจารณาลูก' + (usePrune ? ' (α=' + fmt(alpha) + ', β=' + fmt(beta) + ')' : ''), isMax ? 2 : (usePrune ? 5 : 4));
      var best = isMax ? -Infinity : Infinity;
      for (var i = 0; i < node.children.length; i++) {
        var v = rec(node.children[i], alpha, beta, !isMax);
        if (isMax) { best = Math.max(best, v); alpha = Math.max(alpha, best); }
        else { best = Math.min(best, v); beta = Math.min(beta, best); }
        val[node.id] = best; cls[node.id] = 'active';
        if (usePrune) ab[node.id] = 'α=' + fmt(alpha) + ' β=' + fmt(beta);
        step((isMax ? 'MAX' : 'MIN') + ': ลูกคืน ' + v + ' → best=' + best + (usePrune ? ', α=' + fmt(alpha) + ', β=' + fmt(beta) : ''), usePrune ? (isMax ? 3 : 6) : (isMax ? 3 : 5));
        if (usePrune && alpha >= beta) {
          for (var j = i + 1; j < node.children.length; j++) prune(node.children[j]);
          step('✂️ α(' + fmt(alpha) + ') ≥ β(' + fmt(beta) + ') → ตัดกิ่งที่เหลือของโหนดนี้', isMax ? 4 : 7);
          break;
        }
      }
      val[node.id] = best; cls[node.id] = 'done';
      return best;
    }

    step('เริ่ม: รากเป็น MAX' + (usePrune ? ' · α=−∞, β=+∞' : ''), 0);
    var result = rec(ROOT, -Infinity, Infinity, true);
    var msg = '✅ ' + (usePrune ? 'Alpha-Beta' : 'Minimax') + ' เสร็จ — ค่าที่ราก (MAX) = ' + result +
      ' · เยี่ยมใบไม้ ' + visited + '/' + leafCount + ' ใบ' + (usePrune ? ' (ตัดทิ้ง ' + (leafCount - visited) + ' ใบ)' : '');
    step(msg, -1);
    player.setSteps(S.steps);
  }

  function showIdle() {
    val = {}; cls = {}; ab = {};
    setCode(MM_CODE);
    var S = new DSA.Stepper();
    S.add(snap(), 'ต้นไม้เกม ' + leafCount + ' ใบ (ลึก ' + DEPTH + ', แตก ' + BRANCH + ') — กด Minimax หรือ Alpha-Beta', { line: -1 });
    player.setSteps(S.steps);
  }
  function regen() { buildTree(); showIdle(); }

  document.getElementById('mm-mini').addEventListener('click', function () { go(false); });
  document.getElementById('mm-ab').addEventListener('click', function () { go(true); });
  document.getElementById('mm-random').addEventListener('click', regen);
  document.getElementById('mm-size').addEventListener('change', function () {
    var p = document.getElementById('mm-size').value.split(','); DEPTH = +p[0]; BRANCH = +p[1]; regen();
  });

  regen();
})();
