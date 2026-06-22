/* Dynamic Programming — LCS table fill + traceback (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'dp');

  var host = document.getElementById('dpviz');
  host.innerHTML =
    '<div class="viz-grid">' +
      '<div><div id="dp-grid" style="overflow-x:auto"></div><div id="dp-controls"></div></div>' +
      '<div><div class="code-panel" id="dp-code"></div></div>' +
    '</div>';
  var gridEl = document.getElementById('dp-grid');
  var codeEl = document.getElementById('dp-code');
  var CODE = [
    'for i = 1..m:',
    '  for j = 1..n:',
    '    if s1[i-1] == s2[j-1]:',
    '      dp[i][j] = dp[i-1][j-1] + 1',
    '    else:',
    '      dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
  ];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var s1 = 'ABCB', s2 = 'BDCB';

  function render(step) {
    var st = step.snapshot, dp = st.dp, m = s1.length, n = s2.length;
    function hasMark(set, i, j) { return set && set.indexOf(i + ',' + j) !== -1; }
    var html = '<table class="dp-table"><tr><th></th><th>∅</th>';
    for (var j = 0; j < n; j++) html += '<th class="' + (st.cj === j + 1 ? 'hl' : '') + '">' + s2[j] + '</th>';
    html += '</tr>';
    for (var i = 0; i <= m; i++) {
      html += '<tr><th class="' + (st.ci === i && i > 0 ? 'hl' : '') + '">' + (i === 0 ? '∅' : s1[i - 1]) + '</th>';
      for (var jj = 0; jj <= n; jj++) {
        var v = dp[i][jj];
        var cls = '';
        if (st.cur && st.cur[0] === i && st.cur[1] === jj) cls = 'cur';
        else if (hasMark(st.path, i, jj)) cls = 'path';
        else if (hasMark(st.deps, i, jj)) cls = 'dep';
        html += '<td class="' + cls + '">' + (v == null ? '' : v) + '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var m = s1.length, n = s2.length;
    var dp = []; for (var i = 0; i <= m; i++) { dp.push([]); for (var j = 0; j <= n; j++) dp[i].push(i === 0 || j === 0 ? 0 : null); }
    var S = new DSA.Stepper();
    function snap(extra) { var d = dp.map(function (r) { return r.slice(); }); var o = { dp: d }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({ ci: 0, cj: 0 }), 'ตั้งแถว/คอลัมน์แรกเป็น 0 (LCS กับสตริงว่าง = 0)', { line: 0 });

    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        var match = s1[i - 1] === s2[j - 1];
        if (match) {
          S.add(snap({ cur: [i, j], deps: [(i - 1) + ',' + (j - 1)], ci: i, cj: j }),
            's1[' + (i - 1) + ']=' + s1[i - 1] + ' = s2[' + (j - 1) + ']=' + s2[j - 1] + ' ตรงกัน → มุมทแยง ' + dp[i - 1][j - 1] + ' +1', { line: 3 });
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          S.add(snap({ cur: [i, j], deps: [(i - 1) + ',' + j, i + ',' + (j - 1)], ci: i, cj: j }),
            s1[i - 1] + ' ≠ ' + s2[j - 1] + ' → max(บน ' + dp[i - 1][j] + ', ซ้าย ' + dp[i][j - 1] + ')', { line: 5 });
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
        S.add(snap({ cur: [i, j], ci: i, cj: j }), 'dp[' + i + '][' + j + '] = ' + dp[i][j], { line: match ? 3 : 5 });
      }
    }

    // traceback
    var path = [], lcs = '', pi = m, pj = n;
    while (pi > 0 && pj > 0) {
      path.push(pi + ',' + pj);
      if (s1[pi - 1] === s2[pj - 1]) { lcs = s1[pi - 1] + lcs; pi--; pj--; }
      else if (dp[pi - 1][pj] >= dp[pi][pj - 1]) pi--; else pj--;
    }
    S.add(snap({ path: path.slice() }), 'traceback จากมุมขวาล่าง → ตามรอยที่ตัวอักษรตรงกัน', { line: -1 });
    S.add(snap({ path: path.slice() }), '✅ LCS = "' + lcs + '" (ยาว ' + dp[m][n] + ')', { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('dp-controls'), speed: 600 });
  function run() {
    s1 = (document.getElementById('dp-s1').value || 'ABCB').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8) || 'ABCB';
    s2 = (document.getElementById('dp-s2').value || 'BDCB').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8) || 'BDCB';
    document.getElementById('dp-s1').value = s1; document.getElementById('dp-s2').value = s2;
    player.setSteps(build());
  }
  document.getElementById('dp-run').addEventListener('click', run);
  run();
})();
