/* 0/1 Knapsack — DP table fill + traceback (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'knapsack');

  var host = document.getElementById('dpviz');
  host.innerHTML =
    '<div class="viz-grid"><div><div id="kn-grid" style="overflow-x:auto"></div><div id="kn-controls"></div></div>' +
    '<div><div class="code-panel" id="kn-code"></div></div></div>';
  var gridEl = document.getElementById('kn-grid');
  var codeEl = document.getElementById('kn-code');
  var CODE = ['for i = 1..n:', '  for w = 0..W:', '    if wt[i] > w:', '      dp[i][w] = dp[i-1][w]', '    else:', '      dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var wt = [], val = [], W = 0;

  function render(step) {
    var st = step.snapshot, dp = st.dp, n = wt.length;
    function mark(set, i, j) { return set && set.indexOf(i + ',' + j) !== -1; }
    var html = '<table class="dp-table"><tr><th>ชิ้น \\ w</th>';
    for (var w = 0; w <= W; w++) html += '<th class="' + (st.cw === w ? 'hl' : '') + '">' + w + '</th>';
    html += '</tr>';
    for (var i = 0; i <= n; i++) {
      var rowlbl = i === 0 ? '∅' : (i + ' (w' + wt[i - 1] + ',v' + val[i - 1] + ')');
      html += '<tr><th class="' + (st.ci === i && i > 0 ? 'hl' : '') + '">' + rowlbl + '</th>';
      for (var ww = 0; ww <= W; ww++) {
        var v = dp[i][ww], cls = '';
        if (st.cur && st.cur[0] === i && st.cur[1] === ww) cls = 'cur';
        else if (mark(st.path, i, ww)) cls = 'path';
        else if (mark(st.deps, i, ww)) cls = 'dep';
        html += '<td class="' + cls + '">' + (v == null ? '' : v) + '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var n = wt.length;
    var dp = []; for (var i = 0; i <= n; i++) { dp.push([]); for (var w = 0; w <= W; w++) dp[i].push(i === 0 ? 0 : null); }
    var S = new DSA.Stepper();
    function snap(extra) { var d = dp.map(function (r) { return r.slice(); }); var o = { dp: d }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({ ci: 0 }), 'แถว 0 (ไม่เลือกของเลย) = 0 ทั้งหมด', { line: 0 });

    for (var i = 1; i <= n; i++) {
      for (var w = 0; w <= W; w++) {
        if (wt[i - 1] > w) {
          S.add(snap({ cur: [i, w], deps: [(i - 1) + ',' + w], ci: i, cw: w }), 'ชิ้น ' + i + ' หนัก ' + wt[i - 1] + ' > ' + w + ' → เอาไม่ได้ ใช้ค่าด้านบน ' + dp[i - 1][w], { line: 3 });
          dp[i][w] = dp[i - 1][w];
        } else {
          var skip = dp[i - 1][w], take = dp[i - 1][w - wt[i - 1]] + val[i - 1];
          S.add(snap({ cur: [i, w], deps: [(i - 1) + ',' + w, (i - 1) + ',' + (w - wt[i - 1])], ci: i, cw: w }),
            'ชิ้น ' + i + ': ไม่เอา=' + skip + ' vs เอา=' + dp[i - 1][w - wt[i - 1]] + '+' + val[i - 1] + '=' + take + ' → max=' + Math.max(skip, take), { line: 5 });
          dp[i][w] = Math.max(skip, take);
        }
      }
    }
    // traceback
    var path = [], chosen = [], ci = n, cw = W;
    while (ci > 0) {
      path.push(ci + ',' + cw);
      if (dp[ci][cw] !== dp[ci - 1][cw]) { chosen.unshift(ci); cw -= wt[ci - 1]; ci--; }
      else ci--;
    }
    S.add(snap({ path: path.slice() }), 'traceback: ถ้าค่าต่างจากแถวบน = "เลือก" ชิ้นนั้น', { line: -1 });
    S.add(snap({ path: path.slice() }), '✅ มูลค่าสูงสุด = ' + dp[n][W] + ' · เลือกชิ้น: ' + (chosen.join(', ') || 'ไม่มี'), { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('kn-controls'), speed: 450 });
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }); }
  function run() {
    wt = parseList(document.getElementById('kn-w').value).slice(0, 6);
    val = parseList(document.getElementById('kn-v').value).slice(0, 6);
    W = Math.min(12, Math.max(1, parseInt(document.getElementById('kn-cap').value, 10) || 7));
    if (wt.length !== val.length || !wt.length) { alert('น้ำหนักและมูลค่าต้องมีจำนวนเท่ากัน'); return; }
    document.getElementById('kn-cap').value = W;
    player.setSteps(build());
  }
  document.getElementById('kn-run').addEventListener('click', run);
  run();
})();
