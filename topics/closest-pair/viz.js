/* Closest Pair of Points — Divide & Conquer (custom svg + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'closest-pair');
  var host = document.getElementById('cpviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="cp-svg" viewBox="0 0 640 420" preserveAspectRatio="xMidYMid meet"></svg></div><div id="cp-controls"></div></div>' +
    '<div><div class="code-panel" id="cp-code"></div></div></div>';
  var svg = d3.select('#cp-svg');
  var gStrip = svg.append('g'), gLine = svg.append('g'), gLink = svg.append('g'), gPts = svg.append('g');
  var codeEl = document.getElementById('cp-code');
  var CODE = ['เรียงจุดตามแกน x', 'rec(lo, hi):', '  ถ้าจุดน้อย (≤3): เทียบทุกคู่ (brute force)', '  แบ่งครึ่งด้วยเส้นตั้งที่ x กลาง', '  d = min(คู่ใกล้สุดซ้าย, ขวา)', '  ตรวจแถบกลางกว้าง 2d (เรียงตาม y, เทียบ ≤7 จุดถัดไป)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var pts = [];
  function gen() {
    var n = 9 + Math.floor(Math.random() * 3); pts = [];
    for (var i = 0; i < n; i++) pts.push({ id: i, x: 50 + Math.floor(Math.random() * 540), y: 40 + Math.floor(Math.random() * 340) });
  }

  function render(step) {
    var st = step.snapshot;
    var pe = gPts.selectAll('g.pt').data(pts, function (d) { return d.id; });
    var en = pe.enter().append('g').attr('class', 'pt');
    en.append('circle').attr('r', 6);
    en.merge(pe).attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    en.merge(pe).select('circle').attr('fill', function (d) {
      if (st.best && st.best.indexOf(d.id) !== -1) return '#10b981';
      if (st.cur && st.cur.indexOf(d.id) !== -1) return '#f59e0b';
      return '#475569';
    });

    var lines = (st.divides || []).map(function (x, i) { return { x: x, i: i }; });
    var dl = gLine.selectAll('line.dv').data(lines, function (d) { return d.i; });
    dl.exit().remove();
    dl.enter().append('line').attr('class', 'dv').attr('stroke', '#cbd5e1').attr('stroke-dasharray', '5 4').attr('y1', 10).attr('y2', 410)
      .merge(dl).attr('x1', function (d) { return d.x; }).attr('x2', function (d) { return d.x; });

    var strips = st.strip ? [st.strip] : [];
    var sr = gStrip.selectAll('rect.strip').data(strips);
    sr.exit().remove();
    sr.enter().append('rect').attr('class', 'strip').attr('y', 10).attr('height', 400).attr('fill', '#94a3b8').attr('opacity', 0.15)
      .merge(sr).attr('x', function (d) { return d.x0; }).attr('width', function (d) { return d.w; });

    var links = st.bestPair ? [st.bestPair] : [];
    var lk = gLink.selectAll('line.lk').data(links);
    lk.exit().remove();
    lk.enter().append('line').attr('class', 'lk').attr('stroke', '#10b981').attr('stroke-width', 2.5)
      .merge(lk).attr('x1', function (d) { return d.x1; }).attr('y1', function (d) { return d.y1; }).attr('x2', function (d) { return d.x2; }).attr('y2', function (d) { return d.y2; });

    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var S = new DSA.Stepper();
    var P = pts.slice().sort(function (a, b) { return a.x - b.x; });
    var best = { d: Infinity, a: null, b: null }, divides = [];
    function dist(p, q) { return Math.hypot(p.x - q.x, p.y - q.y); }
    function pairObj() { return best.a ? { x1: best.a.x, y1: best.a.y, x2: best.b.x, y2: best.b.y } : null; }
    function bestIds() { return best.a ? [best.a.id, best.b.id] : []; }
    function snap(extra) { var o = { divides: divides.slice(), best: bestIds(), bestPair: pairObj() }; for (var k in extra) o[k] = extra[k]; return o; }
    function consider(p, q, line, msg) {
      var d = dist(p, q);
      if (d < best.d) { best.d = d; best.a = p; best.b = q; S.add(snap({ cur: [p.id, q.id] }), msg + ' → คู่ใกล้สุดใหม่! ระยะ ' + d.toFixed(1), { line: line }); }
    }

    S.add(snap({}), 'เรียงจุดตามแกน x แล้วเริ่มแบ่ง', { line: 0 });

    function rec(lo, hi) {
      if (hi - lo <= 2) {
        for (var i = lo; i <= hi; i++) for (var j = i + 1; j <= hi; j++) consider(P[i], P[j], 2, 'เทียบตรง (' + i + ',' + j + ')');
        return;
      }
      var mid = (lo + hi) >> 1, midX = P[mid].x;
      divides.push(midX);
      S.add(snap({ cur: [] }), 'แบ่งที่ x = ' + midX + ' (ช่วง [' + lo + '..' + hi + '])', { line: 3 });
      rec(lo, mid); rec(mid + 1, hi);
      var d = best.d;
      // strip
      var strip = [];
      for (var s = lo; s <= hi; s++) if (Math.abs(P[s].x - midX) < d) strip.push(P[s]);
      strip.sort(function (a, b) { return a.y - b.y; });
      S.add(snap({ strip: { x0: midX - d, w: 2 * d } }), 'รวม: ตรวจแถบกลางกว้าง 2d (' + strip.length + ' จุด, d=' + d.toFixed(1) + ')', { line: 5 });
      for (var x = 0; x < strip.length; x++) for (var y = x + 1; y < strip.length && (strip[y].y - strip[x].y) < d; y++) consider(strip[x], strip[y], 5, 'แถบกลาง');
    }
    rec(0, P.length - 1);
    divides = [];
    S.add(snap({}), '✅ คู่ใกล้สุด: จุด (' + best.a.x + ',' + best.a.y + ') กับ (' + best.b.x + ',' + best.b.y + ') · ระยะ = ' + best.d.toFixed(2), { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('cp-controls'), speed: 600 });
  function run() { player.setSteps(build()); }
  document.getElementById('cp-run').addEventListener('click', run);
  document.getElementById('cp-random').addEventListener('click', function () { gen(); run(); });
  gen(); run();
})();
