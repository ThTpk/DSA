/* Linear Programming (Simplex) — เดินมุมของพื้นที่เป็นไปได้ (custom svg + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'simplex');
  var host = document.getElementById('lpviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="lp-svg" viewBox="0 0 460 440" preserveAspectRatio="xMidYMid meet"></svg></div><div id="lp-controls"></div></div>' +
    '<div><div class="code-panel" id="lp-code"></div></div></div>';
  var svg = d3.select('#lp-svg');
  var gPoly = svg.append('g'), gAxis = svg.append('g'), gLines = svg.append('g'), gPath = svg.append('g'), gPts = svg.append('g');
  var codeEl = document.getElementById('lp-code');
  var CODE = ['พื้นที่เป็นไปได้ = จุดที่สอดคล้องทุกข้อจำกัด (รูปหลายเหลี่ยมนูน)', 'เริ่มที่มุมหนึ่ง (เช่น จุดกำเนิด)', 'while มีมุมข้างเคียงที่ objective สูงกว่า:', '  เดินไปตามขอบสู่มุมนั้น', 'ไม่มีมุมข้างเคียงดีกว่า → จุดเหมาะที่สุด'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  // ข้อจำกัด a*x + b*y <= c (รวม x>=0,y>=0)
  var cons = [{ a: 1, b: 1, c: 4 }, { a: 1, b: 3, c: 6 }, { a: 3, b: 1, c: 9 }];
  var cx = 3, cy = 2; // objective 3x+2y
  var SCALE = 70, OX = 50, OY = 390;
  function PX(x) { return OX + x * SCALE; }
  function PY(y) { return OY - y * SCALE; }
  function feasible(x, y) {
    if (x < -1e-9 || y < -1e-9) return false;
    for (var i = 0; i < cons.length; i++) if (cons[i].a * x + cons[i].b * y > cons[i].c + 1e-9) return false;
    return true;
  }
  function obj(p) { return cx * p.x + cy * p.y; }

  // หามุมทั้งหมด (ตัดกันของเส้นขอบ) ที่เป็นไปได้
  var lines = cons.concat([{ a: 1, b: 0, c: 0 }, { a: 0, b: 1, c: 0 }]); // + x=0, y=0
  var verts = [];
  for (var i = 0; i < lines.length; i++) for (var j = i + 1; j < lines.length; j++) {
    var L1 = lines[i], L2 = lines[j], det = L1.a * L2.b - L2.a * L1.b;
    if (Math.abs(det) < 1e-9) continue;
    var x = (L1.c * L2.b - L2.c * L1.b) / det, y = (L1.a * L2.c - L2.a * L1.c) / det;
    if (feasible(x, y) && !verts.some(function (v) { return Math.abs(v.x - x) < 1e-6 && Math.abs(v.y - y) < 1e-6; })) verts.push({ x: x, y: y });
  }
  // เรียงรอบ centroid (CCW) เป็นลำดับ hull
  var cxm = d3.mean(verts, function (v) { return v.x; }), cym = d3.mean(verts, function (v) { return v.y; });
  verts.sort(function (p, q) { return Math.atan2(p.y - cym, p.x - cxm) - Math.atan2(q.y - cym, q.x - cxm); });

  function render(step) {
    var st = step.snapshot;
    // โพลิกอน
    gPoly.selectAll('polygon').remove();
    gPoly.append('polygon').attr('points', verts.map(function (v) { return PX(v.x) + ',' + PY(v.y); }).join(' ')).attr('fill', '#c7d2fe').attr('opacity', 0.5).attr('stroke', '#6366f1');
    // แกน
    gAxis.selectAll('*').remove();
    gAxis.append('line').attr('x1', OX).attr('y1', OY).attr('x2', 440).attr('y2', OY).attr('stroke', '#475569');
    gAxis.append('line').attr('x1', OX).attr('y1', OY).attr('x2', OX).attr('y2', 20).attr('stroke', '#475569');
    gAxis.append('text').attr('x', 446).attr('y', OY + 4).text('x').attr('font-size', 13);
    gAxis.append('text').attr('x', OX - 4).attr('y', 16).attr('text-anchor', 'end').text('y').attr('font-size', 13);
    // เส้นทางที่เดินมา
    gPath.selectAll('*').remove();
    if (st.path && st.path.length > 1) {
      for (var k = 1; k < st.path.length; k++) {
        var p0 = verts[st.path[k - 1]], p1 = verts[st.path[k]];
        gPath.append('line').attr('x1', PX(p0.x)).attr('y1', PY(p0.y)).attr('x2', PX(p1.x)).attr('y2', PY(p1.y)).attr('stroke', '#f59e0b').attr('stroke-width', 3);
      }
    }
    // จุดมุม
    var pe = gPts.selectAll('g.v').data(verts);
    var en = pe.enter().append('g').attr('class', 'v');
    en.append('circle').attr('r', 7);
    en.append('text').attr('font-size', 11).attr('dy', -10).attr('text-anchor', 'middle');
    var all = en.merge(pe);
    all.attr('transform', function (v) { return 'translate(' + PX(v.x) + ',' + PY(v.y) + ')'; });
    all.select('circle').attr('fill', function (v, i) { return st.opt === i ? '#10b981' : (st.cur === i ? '#f59e0b' : '#fff'); }).attr('stroke', '#334155');
    all.select('text').attr('fill', '#1e293b').text(function (v) { return '(' + (+v.x.toFixed(1)) + ',' + (+v.y.toFixed(1)) + ')=' + (+obj(v).toFixed(1)); });

    for (var z = 0; z < codeLineEls.length; z++) codeLineEls[z].classList.toggle('is-active', z === step.meta.line);
  }

  function build() {
    var S = new DSA.Stepper();
    function snap(extra) { var o = {}; for (var k in extra) o[k] = extra[k]; return o; }
    var n = verts.length;
    // เริ่มที่จุดกำเนิด
    var start = 0; for (var i = 0; i < n; i++) if (Math.abs(verts[i].x) < 1e-6 && Math.abs(verts[i].y) < 1e-6) start = i;
    var cur = start, path = [cur];
    S.add(snap({ cur: cur, path: path.slice() }), 'พื้นที่เป็นไปได้มี ' + n + ' มุม · เริ่มที่จุดกำเนิด objective = ' + obj(verts[cur]).toFixed(1), { line: 1 });
    var guard = 0;
    while (guard++ < 20) {
      var left = (cur - 1 + n) % n, right = (cur + 1) % n;
      var best = cur, bestVal = obj(verts[cur]);
      [left, right].forEach(function (nb) { if (obj(verts[nb]) > bestVal + 1e-9) { bestVal = obj(verts[nb]); best = nb; } });
      if (best === cur) { S.add(snap({ opt: cur, path: path.slice() }), '✅ ไม่มีมุมข้างเคียงดีกว่า → จุดเหมาะที่สุด (' + (+verts[cur].x.toFixed(2)) + ', ' + (+verts[cur].y.toFixed(2)) + ') ค่า = ' + obj(verts[cur]).toFixed(1), { line: 4 }); break; }
      cur = best; path.push(cur);
      S.add(snap({ cur: cur, path: path.slice() }), 'เดินไปมุมข้างเคียงที่ objective สูงขึ้น → (' + (+verts[cur].x.toFixed(2)) + ', ' + (+verts[cur].y.toFixed(2)) + ') ค่า = ' + obj(verts[cur]).toFixed(1), { line: 3 });
    }
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('lp-controls'), speed: 850 });
  document.getElementById('lp-run').addEventListener('click', function () { player.setSteps(build()); });
  player.setSteps(build());
})();
