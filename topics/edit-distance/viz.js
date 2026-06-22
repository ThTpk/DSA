/* Edit Distance (Levenshtein) — DP table 2 มิติ (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'edit-distance');
  var host = document.getElementById('dpviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="ed-grid" style="overflow-x:auto"></div><div id="ed-controls"></div></div>' +
    '<div><div class="code-panel" id="ed-code"></div></div></div>';
  var gridEl = document.getElementById('ed-grid'), codeEl = document.getElementById('ed-code');
  var CODE = ['dp[0][j]=j, dp[i][0]=i', 'for i,j:', '  if s1[i-1]==s2[j-1]:', '    dp[i][j] = dp[i-1][j-1]', '  else:', '    dp[i][j] = 1 + min(แทนที่, ลบ, แทรก)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var s1 = 'kitten', s2 = 'sitting';
  function render(step) {
    var st = step.snapshot, dp = st.dp, m = s1.length, n = s2.length;
    function mk(set, i, j) { return set && set.indexOf(i + ',' + j) !== -1; }
    var html = '<table class="dp-table"><tr><th></th><th>∅</th>';
    for (var j = 0; j < n; j++) html += '<th class="' + (st.cj === j + 1 ? 'hl' : '') + '">' + s2[j] + '</th>';
    html += '</tr>';
    for (var i = 0; i <= m; i++) {
      html += '<tr><th class="' + (st.ci === i && i > 0 ? 'hl' : '') + '">' + (i === 0 ? '∅' : s1[i - 1]) + '</th>';
      for (var jj = 0; jj <= n; jj++) {
        var v = dp[i][jj], cls = '';
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
    var m = s1.length, n = s2.length;
    var dp = []; for (var i = 0; i <= m; i++) { dp.push([]); for (var j = 0; j <= n; j++) dp[i].push(i === 0 ? j : (j === 0 ? i : null)); }
    var S = new DSA.Stepper();
    function snap(extra) { var d = dp.map(function (r) { return r.slice(); }); var o = { dp: d }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({ ci: 0, cj: 0 }), 'แถว/คอลัมน์แรก = ระยะจากสตริงว่าง (0,1,2,...)', { line: 0 });
    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          S.add(snap({ cur: [i, j], deps: [(i - 1) + ',' + (j - 1)], ci: i, cj: j }), s1[i - 1] + ' = ' + s2[j - 1] + ' ตรงกัน → คัดมุมทแยง ' + dp[i - 1][j - 1], { line: 3 });
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          var rep = dp[i - 1][j - 1], del = dp[i - 1][j], ins = dp[i][j - 1], best = 1 + Math.min(rep, del, ins);
          S.add(snap({ cur: [i, j], deps: [(i - 1) + ',' + (j - 1), (i - 1) + ',' + j, i + ',' + (j - 1)], ci: i, cj: j }),
            s1[i - 1] + ' ≠ ' + s2[j - 1] + ' → 1 + min(แทนที่ ' + rep + ', ลบ ' + del + ', แทรก ' + ins + ') = ' + best, { line: 5 });
          dp[i][j] = best;
        }
      }
    }
    var path = [], pi = m, pj = n;
    while (pi > 0 || pj > 0) {
      path.push(pi + ',' + pj);
      if (pi > 0 && pj > 0 && s1[pi - 1] === s2[pj - 1]) { pi--; pj--; }
      else { var rep = (pi > 0 && pj > 0) ? dp[pi - 1][pj - 1] : Infinity, del = pi > 0 ? dp[pi - 1][pj] : Infinity, ins = pj > 0 ? dp[pi][pj - 1] : Infinity; var mn = Math.min(rep, del, ins); if (mn === rep) { pi--; pj--; } else if (mn === del) pi--; else pj--; }
    }
    path.push('0,0');
    S.add(snap({ path: path.slice() }), 'traceback ตามทางที่ให้ค่าน้อยสุด', { line: -1 });
    S.add(snap({ path: path.slice() }), '✅ Edit Distance ("' + s1 + '" → "' + s2 + '") = ' + dp[m][n], { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('ed-controls'), speed: 400 });
  function clean(s) { return (s || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 9); }
  function run() {
    s1 = clean(document.getElementById('ed-s1').value) || 'kitten';
    s2 = clean(document.getElementById('ed-s2').value) || 'sitting';
    document.getElementById('ed-s1').value = s1; document.getElementById('ed-s2').value = s2;
    player.setSteps(build());
  }
  document.getElementById('ed-run').addEventListener('click', run);
  run();
})();
