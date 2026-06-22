/* Euclidean + Extended GCD — ตารางขั้นตอน (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'gcd');
  var host = document.getElementById('ntviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="nt-grid" style="overflow-x:auto"></div><div id="nt-controls"></div></div>' +
    '<div><div class="code-panel" id="nt-code"></div></div></div>';
  var gridEl = document.getElementById('nt-grid'), codeEl = document.getElementById('nt-code');
  var CODE = ['(old_r, r) = (a, b)', '(old_s, s) = (1, 0) ; (old_t, t) = (0, 1)', 'while r ≠ 0:', '  q = old_r ÷ r', '  (old_r, r) = (r, old_r − q·r)', '  (old_s, s) = (s, old_s − q·s)', '  (old_t, t) = (t, old_t − q·t)', 'gcd = old_r ; a·old_s + b·old_t = gcd'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var A = 240, B = 46;

  function render(step) {
    var st = step.snapshot;
    var html = '<table class="dp-table"><tr><th>q</th><th>r</th><th>s</th><th>t</th></tr>';
    st.rows.forEach(function (row, i) {
      var cls = (i === st.cur) ? 'cur' : '';
      html += '<tr><td class="' + cls + '">' + (row.q == null ? '–' : row.q) + '</td>' +
        '<td class="' + cls + '">' + row.r + '</td><td class="' + cls + '">' + row.s + '</td><td class="' + cls + '">' + row.t + '</td></tr>';
    });
    html += '</table>';
    if (st.result) html += '<div style="margin-top:12px;font-weight:600">' + st.result + '</div>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var S = new DSA.Stepper();
    var rows = [{ q: null, r: A, s: 1, t: 0 }, { q: null, r: B, s: 0, t: 1 }];
    function snap(cur, line, result) { return { rows: rows.map(function (x) { return { q: x.q, r: x.r, s: x.s, t: x.t }; }), cur: cur, result: result }; }
    S.add(snap(0, 1), 'เริ่ม: แถวบน = a=' + A + ' (s=1,t=0), แถวล่าง = b=' + B + ' (s=0,t=1)', { line: 1 });

    var oldr = A, r = B, olds = 1, s = 0, oldt = 0, t = 1;
    while (r !== 0) {
      var q = Math.floor(oldr / r);
      var nr = oldr - q * r, ns = olds - q * s, nt = oldt - q * t;
      oldr = r; r = nr; olds = s; s = ns; oldt = t; t = nt;
      rows.push({ q: q, r: oldr, s: olds, t: oldt });
      S.add(snap(rows.length - 1, 4), 'q = ' + q + ' → r ใหม่ = ' + oldr + ' (s=' + olds + ', t=' + oldt + ')' + (r === 0 ? ' · r ถัดไป = 0 → หยุด' : ''), { line: 4 });
    }
    var verify = A + '·(' + olds + ') + ' + B + '·(' + oldt + ') = ' + (A * olds + B * oldt);
    S.add(snap(rows.length - 1, 7, '✅ gcd(' + A + ', ' + B + ') = ' + oldr + ' · สัมประสิทธิ์เบซู x=' + olds + ', y=' + oldt + ' · ตรวจ: ' + verify),
      'gcd = ' + oldr + ' · ' + verify, { line: 7 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('nt-controls'), speed: 700 });
  function run() {
    var a = Math.abs(parseInt(document.getElementById('g-a').value, 10)), b = Math.abs(parseInt(document.getElementById('g-b').value, 10));
    if (isNaN(a) || isNaN(b) || (a === 0 && b === 0)) { alert('ใส่จำนวนเต็มบวก a, b'); return; }
    if (a < b) { var tmp = a; a = b; b = tmp; }
    A = a; B = b; document.getElementById('g-a').value = A; document.getElementById('g-b').value = B;
    player.setSteps(build());
  }
  document.getElementById('g-run').addEventListener('click', run);
  document.getElementById('g-random').addEventListener('click', function () {
    document.getElementById('g-a').value = 20 + Math.floor(Math.random() * 480);
    document.getElementById('g-b').value = 6 + Math.floor(Math.random() * 200); run();
  });
  run();
})();
