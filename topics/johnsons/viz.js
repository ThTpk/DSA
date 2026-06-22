/* Johnson's Algorithm — reweight (Bellman-Ford) + Dijkstra ทุกแหล่ง (custom svg + matrix) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'johnsons');
  var host = document.getElementById('jhviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="jh-svg" viewBox="0 0 420 360" preserveAspectRatio="xMidYMid meet"></svg></div><div id="jh-controls"></div></div>' +
    '<div class="adj-wrap"><div><div class="adj-title">ระยะสั้นสุดทุกคู่ d(u,v)</div><div id="jh-matrix"></div></div>' +
    '<div class="code-panel" id="jh-code"></div></div></div>';
  var svg = d3.select('#jh-svg'), gE = svg.append('g'), gW = svg.append('g'), gN = svg.append('g');
  var matrixEl = document.getElementById('jh-matrix'), codeEl = document.getElementById('jh-code');
  svg.append('defs').html('<marker id="jh-ar" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#475569"></path></marker>');
  var CODE = ['1) เพิ่ม q→ทุกโหนด (0) ; Bellman-Ford หา h(v)', '2) reweight: w\' = w + h(u) − h(v)  (≥ 0)', '3) Dijkstra จากทุกโหนดบน w\'', '4) แปลงกลับ d(u,v) = d\'(u,v) − h(u) + h(v)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var IDS = ['A', 'B', 'C', 'D'];
  var POS = { A: { x: 70, y: 90 }, B: { x: 330, y: 70 }, C: { x: 70, y: 280 }, D: { x: 330, y: 280 } };
  var E = [['A', 'B', -1], ['A', 'C', 4], ['B', 'C', 3], ['B', 'D', 2], ['D', 'C', -5], ['C', 'D', 6]];
  var EDGES = E.map(function (e) { return { id: e[0] + e[1], u: e[0], v: e[1], w: e[2] }; });

  function render(step) {
    var st = step.snapshot, R = 20;
    // edges
    gE.selectAll('*').remove(); gW.selectAll('*').remove();
    EDGES.forEach(function (e) {
      var a = POS[e.u], b = POS[e.v], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      var ux = dx / L, uy = dy / L;
      gE.append('line').attr('x1', a.x + ux * R).attr('y1', a.y + uy * R).attr('x2', b.x - ux * R).attr('y2', b.y - uy * R)
        .attr('stroke', '#94a3b8').attr('marker-end', 'url(#jh-ar)');
      var w = st.reweighted ? (e.w + st.h[e.u] - st.h[e.v]) : e.w;
      gW.append('text').attr('x', (a.x + b.x) / 2 - uy * 12).attr('y', (a.y + b.y) / 2 + ux * 12 + 4).attr('text-anchor', 'middle')
        .attr('font-size', 12).attr('font-weight', 600).attr('fill', st.reweighted ? '#059669' : '#b45309').text(w);
    });
    // nodes
    var nd = gN.selectAll('g').data(IDS, function (d) { return d; });
    var en = nd.enter().append('g');
    en.append('circle').attr('r', R).attr('fill', '#fff').attr('stroke', '#334155').attr('stroke-width', 1.5);
    en.append('text').attr('class', 'lbl').attr('text-anchor', 'middle').attr('dy', '.34em').attr('font-weight', 700);
    en.append('text').attr('class', 'sub').attr('text-anchor', 'middle').attr('y', R + 15).attr('font-size', 12).attr('fill', '#7c3aed');
    var all = en.merge(nd);
    all.attr('transform', function (d) { return 'translate(' + POS[d].x + ',' + POS[d].y + ')'; });
    all.select('circle').attr('fill', function (d) { return d === st.src ? '#fde68a' : '#fff'; });
    all.select('.lbl').text(function (d) { return d; });
    all.select('.sub').text(function (d) { return st.h && st.h[d] != null ? 'h=' + st.h[d] : ''; });
    // matrix
    var html = '<table class="adj-matrix"><tr><th></th>' + IDS.map(function (v) { return '<th>' + v + '</th>'; }).join('') + '</tr>';
    IDS.forEach(function (u) {
      html += '<tr><th>' + u + '</th>';
      IDS.forEach(function (v) {
        var val = st.D && st.D[u] && st.D[u][v] != null ? st.D[u][v] : '';
        var cls = (st.cell && st.cell[0] === u && st.cell[1] === v) ? 'active' : (val !== '' ? 'on' : '');
        html += '<td class="' + cls + '">' + (val === '' ? '·' : val) + '</td>';
      });
      html += '</tr>';
    });
    matrixEl.innerHTML = html + '</table>';
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var S = new DSA.Stepper();
    var adj = {}; IDS.forEach(function (n) { adj[n] = []; });
    EDGES.forEach(function (e) { adj[e.u].push(e); });
    function snap(extra) { var o = {}; for (var k in extra) o[k] = extra[k]; return o; }

    // 1) Bellman-Ford from virtual q (h init 0)
    var h = {}; IDS.forEach(function (n) { h[n] = 0; });
    for (var it = 0; it < IDS.length; it++) EDGES.forEach(function (e) { if (h[e.u] + e.w < h[e.v]) h[e.v] = h[e.u] + e.w; });
    S.add(snap({ h: clone(h) }), '1) Bellman-Ford จาก q → h(v) = [' + IDS.map(function (n) { return n + '=' + h[n]; }).join(', ') + ']', { line: 0 });
    S.add(snap({ h: clone(h), reweighted: true }), '2) reweight ทุกเส้น w\' = w + h(u) − h(v) → ไม่มีน้ำหนักลบ (ป้ายเขียว)', { line: 1 });

    // 3+4) Dijkstra per source on reweighted
    var D = {}; IDS.forEach(function (u) { D[u] = {}; });
    IDS.forEach(function (s) {
      var dist = {}; IDS.forEach(function (n) { dist[n] = Infinity; }); dist[s] = 0;
      var done = {};
      for (var c = 0; c < IDS.length; c++) {
        var u = null; IDS.forEach(function (n) { if (!done[n] && dist[n] < (u === null ? Infinity : dist[u])) u = n; });
        if (u === null) break; done[u] = true;
        adj[u].forEach(function (e) { var wp = e.w + h[e.u] - h[e.v]; if (dist[u] + wp < dist[e.v]) dist[e.v] = dist[u] + wp; });
      }
      IDS.forEach(function (v) { D[s][v] = dist[v] === Infinity ? '∞' : (dist[v] - h[s] + h[v]); });
      S.add(snap({ h: clone(h), reweighted: true, src: s, D: cloneD(D), cell: [s, s] }),
        '3-4) Dijkstra จาก ' + s + ' → แปลงกลับเป็นระยะจริง: ' + IDS.map(function (v) { return v + '=' + D[s][v]; }).join(', '), { line: 3 });
    });
    S.add(snap({ h: clone(h), reweighted: true, D: cloneD(D) }), '✅ เสร็จ — ได้ระยะสั้นสุดทุกคู่ (ตารางขวา)', { line: -1 });
    return S.steps;
  }
  function clone(o) { var c = {}; for (var k in o) c[k] = o[k]; return c; }
  function cloneD(D) { var c = {}; for (var u in D) { c[u] = {}; for (var v in D[u]) c[u][v] = D[u][v]; } return c; }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('jh-controls'), speed: 850 });
  document.getElementById('jh-run').addEventListener('click', function () { player.setSteps(build()); });
  player.setSteps(build());
})();
