/* Convex Hull — Andrew's monotone chain (custom svg) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'convex-hull');
  var host = document.getElementById('chviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="ch-svg" viewBox="0 0 600 380" preserveAspectRatio="xMidYMid meet"></svg></div><div id="ch-controls"></div></div>' +
    '<div><div class="code-panel" id="ch-code"></div></div></div>';
  var svg = d3.select('#ch-svg'), gPoly = svg.append('g'), gPts = svg.append('g');
  var codeEl = document.getElementById('ch-code');
  var CODE = ['เรียงจุดตามแกน x', 'สร้างขอบล่าง แล้วขอบบน:', '  for แต่ละจุด p:', '    while 2 จุดท้าย + p เลี้ยวผิดทาง (ไม่นูน):', '      ถอยจุดท้ายออก', '    เพิ่ม p เข้า hull'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var pts = [];
  function genPoints() {
    pts = []; var n = 11;
    for (var i = 0; i < n; i++) pts.push({ x: 50 + Math.floor(Math.random() * 500), y: 40 + Math.floor(Math.random() * 300) });
  }
  function cross(o, a, b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }

  function render(step) {
    var st = step.snapshot;
    // polygon / chain
    var chain = (st.chain || []).map(function (i) { return pts[i]; });
    var poly = gPoly.selectAll('polyline').data([0]);
    poly.enter().append('polyline').attr('fill', 'none').attr('stroke', 'var(--c-primary)').attr('stroke-width', 2.5)
      .merge(poly).attr('points', chain.map(function (p) { return p.x + ',' + p.y; }).join(' '))
      .attr('fill', st.done ? 'rgba(79,70,229,0.10)' : 'none');
    // points
    var sel = gPts.selectAll('g.pt').data(pts.map(function (p, i) { return { p: p, i: i }; }), function (d) { return d.i; });
    var ent = sel.enter().append('g').attr('class', 'pt'); ent.append('circle');
    var all = ent.merge(sel);
    all.attr('transform', function (d) { return 'translate(' + d.p.x + ',' + d.p.y + ')'; });
    all.select('circle').attr('r', function (d) { return d.i === st.cur ? 9 : 6; })
      .attr('fill', function (d) { return d.i === st.cur ? '#f59e0b' : (d.i === st.pop ? '#ef4444' : ((st.hull && st.hull.indexOf(d.i) !== -1) ? '#10b981' : '#64748b')); });
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var sorted = pts.map(function (p, i) { return i; }).sort(function (a, b) { return pts[a].x - pts[b].x || pts[a].y - pts[b].y; });
    var S = new DSA.Stepper();
    function snap(chain, cur, pop, hull, done) { return { chain: chain.slice(), cur: cur, pop: pop, hull: hull ? hull.slice() : null, done: done }; }
    function add(chain, cur, pop, hull, done, desc, line) { S.add(snap(chain, cur, pop, hull, done), desc, { line: line }); }

    add(sorted.slice(0, 0), null, null, null, false, 'เรียงจุดตามแกน x แล้วเริ่มสร้างขอบล่าง', 0);
    function chainBuild(order, label) {
      var st = [];
      for (var idx = 0; idx < order.length; idx++) {
        var p = order[idx];
        add(st, p, null, null, false, label + ': พิจารณาจุด ' + p, 2);
        while (st.length >= 2 && cross(pts[st[st.length - 2]], pts[st[st.length - 1]], pts[p]) <= 0) {
          var popped = st.pop();
          add(st.concat([p]), p, popped, null, false, label + ': จุด ' + st[st.length - 1] + '→' + popped + '→' + p + ' เลี้ยวผิดทาง → ถอย ' + popped + ' ออก', 4);
        }
        st.push(p);
        add(st, p, null, null, false, label + ': เพิ่มจุด ' + p + ' เข้า hull', 5);
      }
      return st;
    }
    var lower = chainBuild(sorted, 'ขอบล่าง');
    var upper = chainBuild(sorted.slice().reverse(), 'ขอบบน');
    var hull = lower.slice(0, -1).concat(upper.slice(0, -1));
    var closed = hull.concat([hull[0]]);
    add(closed, null, null, hull, true, '✅ Convex Hull มี ' + hull.length + ' จุด (จุดเขียวคือมุมของกรอบนูน)', -1);
    return S.steps;
  }

  var player;
  function run() { if (!player) player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('ch-controls'), speed: 350 }); player.setSteps(build()); }
  document.getElementById('ch-run').addEventListener('click', run);
  document.getElementById('ch-random').addEventListener('click', function () { genPoints(); run(); });
  genPoints(); run();
})();
