/* Matrix-Chain Multiplication — DP table (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'matrix-chain');
  var host = document.getElementById('dpviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="mc-grid" style="overflow-x:auto"></div><div id="mc-controls"></div></div>' +
    '<div><div class="code-panel" id="mc-code"></div></div></div>';
  var gridEl = document.getElementById('mc-grid'), codeEl = document.getElementById('mc-code');
  var CODE = ['m[i][i] = 0  (เมทริกซ์เดียว ไม่ต้องคูณ)', 'for L = 2..n  (ความยาวโซ่):', '  for i: j = i+L-1', '    m[i][j] = min over k:', '      m[i][k] + m[k+1][j] + p[i-1]·p[k]·p[j]'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var p = [30, 35, 15, 5, 10, 20];

  function render(step) {
    var st = step.snapshot, m = st.m, n = m.length - 1;
    function mk(set, i, j) { return set && set.indexOf(i + ',' + j) !== -1; }
    var html = '<table class="dp-table"><tr><th>m[i][j]</th>';
    for (var j = 1; j <= n; j++) html += '<th class="' + (st.cj === j ? 'hl' : '') + '">j=' + j + '</th>';
    html += '</tr>';
    for (var i = 1; i <= n; i++) {
      html += '<tr><th class="' + (st.ci === i ? 'hl' : '') + '">i=' + i + '</th>';
      for (var jj = 1; jj <= n; jj++) {
        if (jj < i) { html += '<td style="background:#f1f5f9"></td>'; continue; }
        var v = m[i][jj], cls = '';
        if (st.cur && st.cur[0] === i && st.cur[1] === jj) cls = 'cur';
        else if (mk(st.path, i, jj)) cls = 'path';
        else if (mk(st.deps, i, jj)) cls = 'dep';
        html += '<td class="' + cls + '">' + (v == null ? '' : v) + '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var n = p.length - 1;
    var m = [], s = [];
    for (var i = 0; i <= n; i++) { m.push([]); s.push([]); for (var j = 0; j <= n; j++) { m[i].push(i === j && i > 0 ? 0 : (i > 0 && j > 0 ? null : null)); s[i].push(0); } }
    var S = new DSA.Stepper();
    function snap(extra) { var d = m.map(function (r) { return r.slice(); }); var o = { m: d }; for (var k in extra) o[k] = extra[k]; return o; }
    var diag = []; for (var d0 = 1; d0 <= n; d0++) diag.push(d0 + ',' + d0);
    S.add(snap({ path: diag }), 'เส้นทแยง m[i][i] = 0 (เมทริกซ์เดียว ไม่ต้องคูณ)', { line: 0 });

    for (var L = 2; L <= n; L++) {
      for (var i2 = 1; i2 <= n - L + 1; i2++) {
        var j = i2 + L - 1, best = Infinity, bestK = i2, bestDeps = [];
        for (var k = i2; k < j; k++) {
          var cost = m[i2][k] + m[k + 1][j] + p[i2 - 1] * p[k] * p[j];
          if (cost < best) { best = cost; bestK = k; bestDeps = [i2 + ',' + k, (k + 1) + ',' + j]; }
        }
        m[i2][j] = best; s[i2][j] = bestK;
        S.add(snap({ cur: [i2, j], deps: bestDeps, ci: i2, cj: j }),
          'm[' + i2 + '][' + j + '] (โซ่ A' + i2 + '..A' + j + '): แยกที่ k=' + bestK + ' → ' + m[i2][bestK] + ' + ' + m[bestK + 1][j] + ' + ' + p[i2 - 1] + '·' + p[bestK] + '·' + p[j] + ' = ' + best, { line: 4 });
      }
    }

    function paren(i, j) { if (i === j) return 'A' + i; return '(' + paren(i, s[i][j]) + '·' + paren(s[i][j] + 1, j) + ')'; }
    S.add(snap({ path: [1 + ',' + n] }), '✅ ต้นทุนน้อยสุด = ' + m[1][n] + ' การคูณ · จัดวงเล็บ: ' + paren(1, n), { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('mc-controls'), speed: 500 });
  function run() {
    var dims = document.getElementById('mc-dims').value.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x) && x > 0; }).slice(0, 8);
    if (dims.length < 3) { alert('ใส่มิติอย่างน้อย 3 ตัว (= เมทริกซ์ 2 ตัว)'); return; }
    p = dims; document.getElementById('mc-dims').value = dims.join(',');
    document.getElementById('mc-info').textContent = 'เมทริกซ์ ' + (p.length - 1) + ' ตัว: ' + p.slice(0, -1).map(function (_, i) { return 'A' + (i + 1) + '(' + p[i] + '×' + p[i + 1] + ')'; }).join('  ');
    player.setSteps(build());
  }
  document.getElementById('mc-run').addEventListener('click', run);
  run();
})();
