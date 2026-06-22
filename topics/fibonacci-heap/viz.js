/* Fibonacci Heap — insert + extract-min (consolidate) custom forest (VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'fibonacci-heap');
  var host = document.getElementById('fhviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="fh-svg" preserveAspectRatio="xMidYMid meet"></svg></div><div id="fh-controls"></div></div>' +
    '<div><div class="code-panel" id="fh-code"></div></div></div>';
  var svg = d3.select('#fh-svg'), gE = svg.append('g'), gN = svg.append('g');
  var codeEl = document.getElementById('fh-code');
  var CODE = ['insert(k): เพิ่มต้นไม้ใหม่เข้า root list ; อัปเดต min', 'extract-min:', '  เอา min ออก → ลูกของ min ขึ้นมาเป็น root', '  consolidate: รวมต้นไม้ที่ดีกรีเท่ากัน', '    (คีย์น้อยกว่าเป็นพ่อ) จนทุกดีกรีไม่ซ้ำ', '  หา min ใหม่จาก root list'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var uidc = 0;
  function makeNode(k) { return { uid: ++uidc, key: k, children: [] }; }
  var roots = [];
  function degree(n) { return n.children.length; }

  var S, hot;
  function clone(n) { return { uid: n.uid, key: n.key, children: n.children.map(clone) }; }
  function minUid() { var m = null; roots.forEach(function (r) { if (m === null || r.key < m.key) m = r; }); return m ? m.uid : null; }
  function step(desc, line) { S.add({ roots: roots.map(clone), min: minUid(), hot: hot ? hot.slice() : [], msg: desc }, desc, { line: line }); }

  function insert(k) { roots.push(makeNode(k)); step('insert ' + k + ' → เพิ่มเข้า root list (min = ' + Math.min.apply(null, roots.map(function (r) { return r.key; })) + ')', 0); }

  function extractMin() {
    if (!roots.length) { step('heap ว่าง', 1); return; }
    var mi = 0; for (var i = 1; i < roots.length; i++) if (roots[i].key < roots[mi].key) mi = i;
    var m = roots[mi];
    step('extract-min: เอา ' + m.key + ' ออก → ลูก ' + (m.children.length ? m.children.map(function (c) { return c.key; }).join(',') : '(ไม่มี)') + ' ขึ้นเป็น root', 2);
    roots.splice(mi, 1);
    m.children.forEach(function (c) { roots.push(c); });
    m.children = [];
    // consolidate
    var byDeg = {};
    var queue = roots.slice(); roots = [];
    while (queue.length) {
      var x = queue.shift(), d = degree(x);
      while (byDeg[d]) {
        var y = byDeg[d]; byDeg[d] = null;
        // คีย์น้อยกว่าเป็นพ่อ
        var parent = x.key <= y.key ? x : y, child = x.key <= y.key ? y : x;
        hot = [parent.uid, child.uid];
        roots = []; for (var q in byDeg) if (byDeg[q]) roots.push(byDeg[q]); roots = roots.concat(queue).concat([parent, child]);
        step('ดีกรี ' + d + ' ซ้ำ → เชื่อม: ' + child.key + ' กลายเป็นลูกของ ' + parent.key, 4);
        parent.children.push(child);
        x = parent; d = degree(x);
      }
      byDeg[d] = x;
      hot = [];
    }
    roots = []; for (var dd in byDeg) if (byDeg[dd]) roots.push(byDeg[dd]);
    roots.sort(function (a, b) { return degree(a) - degree(b); });
    step('✅ consolidate เสร็จ — min ใหม่ = ' + (roots.length ? Math.min.apply(null, roots.map(function (r) { return r.key; })) : '(ว่าง)'), 5);
  }

  // ---- layout + render ----
  var NW = 32, VGAP = 56, HGAP = 18, TOP = 30, TREEGAP = 30;
  function render(stepObj) {
    var st = stepObj.snapshot;
    gE.selectAll('*').remove(); gN.selectAll('*').remove();
    var cursor = 20, maxD = 0, maxX = 200;
    var rootsR = st.roots;
    function place(n, depth) {
      n.y = TOP + depth * VGAP; maxD = Math.max(maxD, depth);
      if (!n.children.length) { n.x = cursor + NW / 2; cursor += NW + HGAP; }
      else { n.children.forEach(function (c) { place(c, depth + 1); }); n.x = (n.children[0].x + n.children[n.children.length - 1].x) / 2; }
      maxX = Math.max(maxX, n.x + NW);
    }
    rootsR.forEach(function (r) { place(r, 0); cursor += TREEGAP; });
    svg.attr('viewBox', '0 0 ' + Math.max(640, maxX + 20) + ' ' + (TOP + (maxD + 1) * VGAP));

    var nodes = [], links = [];
    rootsR.forEach(function (r) { (function w(n) { nodes.push(n); n.children.forEach(function (c) { links.push({ s: n, t: c }); w(c); }); })(r); });

    gE.selectAll('line').data(links).enter().append('line')
      .attr('x1', function (d) { return d.s.x; }).attr('y1', function (d) { return d.s.y; })
      .attr('x2', function (d) { return d.t.x; }).attr('y2', function (d) { return d.t.y; }).attr('stroke', '#94a3b8');

    var g = gN.selectAll('g').data(nodes).enter().append('g').attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    g.append('circle').attr('r', NW / 2)
      .attr('fill', function (d) { return st.hot && st.hot.indexOf(d.uid) !== -1 ? '#f59e0b' : (d.uid === st.min ? '#10b981' : '#fff'); })
      .attr('stroke', '#334155').attr('stroke-width', 1.5);
    g.append('text').attr('text-anchor', 'middle').attr('dy', '.34em').attr('font-family', 'JetBrains Mono, monospace').attr('font-weight', 600)
      .attr('fill', function (d) { return (d.uid === st.min || (st.hot && st.hot.indexOf(d.uid) !== -1)) ? '#fff' : '#1e293b'; }).text(function (d) { return d.key; });

    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === stepObj.meta.line);
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('fh-controls'), speed: 750 });
  function flush() { player.setSteps(S.steps); }
  function fresh() { S = new DSA.Stepper(); hot = []; }

  document.getElementById('fh-insert').addEventListener('click', function () {
    var k = parseInt(document.getElementById('fh-key').value, 10); if (isNaN(k)) { alert('ใส่คีย์'); return; }
    fresh(); insert(k); flush();
  });
  document.getElementById('fh-extract').addEventListener('click', function () { fresh(); extractMin(); flush(); });
  document.getElementById('fh-demo').addEventListener('click', function () {
    roots = []; uidc = 0; fresh();
    [7, 3, 18, 52, 38, 24, 17, 30, 26, 46].forEach(insert);
    extractMin();
    flush();
  });

  // เริ่ม: เดโมเลย
  roots = []; fresh();
  [7, 3, 18, 52, 38, 24, 17].forEach(insert);
  extractMin();
  flush();
})();
