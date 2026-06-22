/* Activity Selection — greedy เรียงตามเวลาจบ (custom svg timeline + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'activity-selection');
  var host = document.getElementById('asviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="as-svg" preserveAspectRatio="xMidYMid meet"></svg></div><div id="as-controls"></div></div>' +
    '<div><div class="code-panel" id="as-code"></div></div></div>';
  var svg = d3.select('#as-svg');
  var codeEl = document.getElementById('as-code');
  var CODE = ['เรียงกิจกรรมตามเวลาจบ (finish) จากน้อยไปมาก', 'เลือกตัวแรก ; lastFinish = finish[0]', 'for กิจกรรมถัดไป:', '  if start ≥ lastFinish:', '    เลือก ; lastFinish = finish', '  else: ข้าม (เวลาทับ)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var acts = [];
  function gen() {
    var n = 6 + Math.floor(Math.random() * 3), a = [];
    for (var i = 0; i < n; i++) { var s = Math.floor(Math.random() * 14); var d = 2 + Math.floor(Math.random() * 5); a.push({ s: s, f: s + d }); }
    a.sort(function (x, y) { return x.f - y.f; });
    acts = a.map(function (act, i) { return { id: i, s: act.s, f: act.f, name: 'A' + (i + 1) }; });
  }

  var CELL = 40, LEFT = 50, ROWH = 38, TOP = 30;
  function tmax() { return Math.max.apply(null, acts.map(function (a) { return a.f; })); }
  function render(step) {
    var st = step.snapshot, n = acts.length, T = tmax();
    var W = LEFT + (T + 1) * CELL, H = TOP + n * ROWH + 20;
    svg.attr('viewBox', '0 0 ' + W + ' ' + H);
    function X(t) { return LEFT + t * CELL; }

    // เส้นเวลา
    var ticks = []; for (var t = 0; t <= T; t++) ticks.push(t);
    var tk = svg.selectAll('text.tk').data(ticks);
    tk.enter().append('text').attr('class', 'tk').attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#94a3b8')
      .merge(tk).attr('x', function (d) { return X(d); }).attr('y', TOP - 12).text(function (d) { return d; });

    function fill(a) {
      if (st.cur === a.id) return '#f59e0b';
      if (st.chosen.indexOf(a.id) !== -1) return '#10b981';
      if (st.rejected.indexOf(a.id) !== -1) return '#e5e7eb';
      return '#cbd5e1';
    }
    function tcolor(a) { return st.rejected.indexOf(a.id) !== -1 ? '#94a3b8' : '#1e293b'; }

    var g = svg.selectAll('g.act').data(acts, function (d) { return d.id; });
    var en = g.enter().append('g').attr('class', 'act');
    en.append('rect').attr('rx', 5).attr('height', ROWH - 12);
    en.append('text').attr('class', 'an').attr('font-size', 13).attr('font-weight', 600).attr('dy', '.34em');
    var all = en.merge(g);
    all.select('rect').attr('x', function (a) { return X(a.s); }).attr('y', function (a, i) { return TOP + i * ROWH; })
      .attr('width', function (a) { return X(a.f) - X(a.s); }).attr('fill', fill).attr('stroke', '#475569');
    all.select('.an').attr('x', function (a) { return X(a.s) + 6; }).attr('y', function (a, i) { return TOP + i * ROWH + (ROWH - 12) / 2; })
      .attr('fill', tcolor).text(function (a) { return a.name + ' [' + a.s + ',' + a.f + ']'; });

    // เส้น lastFinish
    var lf = svg.selectAll('line.lf').data(st.lastFinish == null ? [] : [st.lastFinish]);
    lf.exit().remove();
    lf.enter().append('line').attr('class', 'lf').attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '4 3')
      .merge(lf).attr('x1', function (d) { return X(d); }).attr('x2', function (d) { return X(d); }).attr('y1', TOP - 6).attr('y2', H - 16);

    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var S = new DSA.Stepper();
    var chosen = [], rejected = [], lastFinish = null;
    function snap(extra) { var o = { chosen: chosen.slice(), rejected: rejected.slice(), lastFinish: lastFinish }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({}), 'เรียงตามเวลาจบแล้ว: ' + acts.map(function (a) { return a.name + '(จบ ' + a.f + ')'; }).join(', '), { line: 0 });
    for (var i = 0; i < acts.length; i++) {
      var a = acts[i];
      if (lastFinish == null || a.s >= lastFinish) {
        S.add(snap({ cur: a.id }), 'พิจารณา ' + a.name + ' [' + a.s + ',' + a.f + ']: ' + (lastFinish == null ? 'ตัวแรก' : 'เริ่ม ' + a.s + ' ≥ ' + lastFinish) + ' → เลือก ✓', i === 0 ? 1 : 4);
        chosen.push(a.id); lastFinish = a.f;
        S.add(snap({}), a.name + ' ถูกเลือก · lastFinish = ' + lastFinish, 4);
      } else {
        S.add(snap({ cur: a.id }), 'พิจารณา ' + a.name + ' [' + a.s + ',' + a.f + ']: เริ่ม ' + a.s + ' < ' + lastFinish + ' → ข้าม (เวลาทับ)', 5);
        rejected.push(a.id);
      }
    }
    S.add(snap({}), '✅ เลือกได้ ' + chosen.length + ' กิจกรรม: ' + chosen.map(function (id) { return acts[id].name; }).join(', '), -1);
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('as-controls'), speed: 700 });
  function run() { player.setSteps(build()); }
  document.getElementById('as-run').addEventListener('click', run);
  document.getElementById('as-random').addEventListener('click', function () { gen(); run(); });
  gen(); run();
})();
