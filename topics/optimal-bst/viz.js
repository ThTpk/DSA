/* Optimal BST — DP cost table (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'optimal-bst');
  var host = document.getElementById('dpviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="ob-grid" style="overflow-x:auto"></div><div id="ob-controls"></div></div>' +
    '<div><div class="code-panel" id="ob-code"></div></div></div>';
  var gridEl = document.getElementById('ob-grid'), codeEl = document.getElementById('ob-code');
  var CODE = ['cost[i][i-1] = 0  (ซับทรีว่าง)', 'for L = 1..n: for i: j = i+L-1', '  W = freq[i] + ... + freq[j]', '  cost[i][j] = W + min over r:', '    cost[i][r-1] + cost[r+1][j]'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var freq = [4, 2, 6, 3, 1, 5];

  function render(step) {
    var st = step.snapshot, cost = st.cost, n = freq.length;
    function mk(set, i, j) { return set && set.indexOf(i + ',' + j) !== -1; }
    var html = '<table class="dp-table"><tr><th>cost[i][j]</th>';
    for (var j = 1; j <= n; j++) html += '<th class="' + (st.cj === j ? 'hl' : '') + '">j=' + j + '</th>';
    html += '</tr>';
    for (var i = 1; i <= n; i++) {
      html += '<tr><th class="' + (st.ci === i ? 'hl' : '') + '">i=' + i + '</th>';
      for (var jj = 1; jj <= n; jj++) {
        if (jj < i) { html += '<td style="background:#f1f5f9"></td>'; continue; }
        var v = cost[i][jj], cls = '';
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
    var n = freq.length;
    // cost[i][j], i:1..n, j:0..n ; cost[i][i-1]=0
    var cost = [], root = [];
    for (var i = 0; i <= n + 1; i++) { cost.push([]); root.push([]); for (var j = 0; j <= n; j++) { cost[i].push(null); root[i].push(0); } }
    for (var b = 1; b <= n + 1; b++) cost[b][b - 1] = 0;
    var S = new DSA.Stepper();
    function snap(extra) { var d = cost.map(function (r) { return r.slice(); }); var o = { cost: d }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({}), 'ฐาน: cost[i][i-1] = 0 (ซับทรีว่าง ต้นทุน 0)', { line: 0 });

    for (var L = 1; L <= n; L++) {
      for (var i2 = 1; i2 <= n - L + 1; i2++) {
        var j = i2 + L - 1, W = 0;
        for (var w = i2; w <= j; w++) W += freq[w - 1];
        var best = Infinity, bestR = i2, bestDeps = [];
        for (var r = i2; r <= j; r++) {
          var c = cost[i2][r - 1] + cost[r + 1][j];
          if (c < best) { best = c; bestR = r; bestDeps = []; if (r - 1 >= i2) bestDeps.push(i2 + ',' + (r - 1)); if (r + 1 <= j) bestDeps.push((r + 1) + ',' + j); }
        }
        cost[i2][j] = W + best; root[i2][j] = bestR;
        S.add(snap({ cur: [i2, j], deps: bestDeps, ci: i2, cj: j }),
          'cost[' + i2 + '][' + j + '] (คีย์ k' + i2 + '..k' + j + '): ราก = k' + bestR + ' → W(' + W + ') + ' + best + ' = ' + cost[i2][j], { line: 4 });
      }
    }
    function tree(i, j) { if (i > j) return '·'; var r = root[i][j]; return 'k' + r + '(' + tree(i, r - 1) + ',' + tree(r + 1, j) + ')'; }
    S.add(snap({ path: [1 + ',' + n] }), '✅ ต้นทุนค้นหารวมน้อยสุด = ' + cost[1][n] + ' · โครงสร้าง: ' + tree(1, n), { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('ob-controls'), speed: 500 });
  function run() {
    var f = document.getElementById('ob-freq').value.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x) && x >= 0; }).slice(0, 8);
    if (f.length < 2) { alert('ใส่ frequency อย่างน้อย 2 คีย์'); return; }
    freq = f; document.getElementById('ob-freq').value = f.join(',');
    document.getElementById('ob-info').textContent = 'คีย์: ' + f.map(function (v, i) { return 'k' + (i + 1) + '(f=' + v + ')'; }).join('  ');
    player.setSteps(build());
  }
  document.getElementById('ob-run').addEventListener('click', run);
  run();
})();
