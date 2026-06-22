/* Floyd-Warshall — all-pairs shortest path (custom matrix table + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'floyd-warshall');
  var host = document.getElementById('fwviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="fw-grid" style="overflow-x:auto"></div><div id="fw-controls"></div></div>' +
    '<div><div class="code-panel" id="fw-code"></div></div></div>';
  var gridEl = document.getElementById('fw-grid'), codeEl = document.getElementById('fw-code');
  var CODE = ['for k = 1..n:   // จุดพักกลางทาง', '  for i = 1..n:', '    for j = 1..n:', '      if dist[i][k]+dist[k][j] < dist[i][j]:', '        dist[i][j] = dist[i][k] + dist[k][j]'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var LBL = ['1', '2', '3', '4'], n = 4, INF = Infinity;
  // กราฟมีทิศ + น้ำหนัก
  var BASE = [
    [0, 3, INF, 7], [8, 0, 2, INF], [5, INF, 0, 1], [INF, INF, 2, 0],
  ];
  function fmt(v) { return v === INF ? '∞' : v; }

  function render(step) {
    var st = step.snapshot, d = st.dist;
    var html = '<table class="dp-table"><tr><th>i\\j</th>';
    for (var j = 0; j < n; j++) html += '<th class="' + (st.k === j ? 'hl' : '') + '">' + LBL[j] + '</th>';
    html += '</tr>';
    for (var i = 0; i < n; i++) {
      html += '<tr><th class="' + (st.k === i ? 'hl' : '') + '">' + LBL[i] + '</th>';
      for (var jj = 0; jj < n; jj++) {
        var cls = '';
        if (st.cur && st.cur[0] === i && st.cur[1] === jj) cls = 'cur';
        else if (st.dep && ((st.dep[0][0] === i && st.dep[0][1] === jj) || (st.dep[1][0] === i && st.dep[1][1] === jj))) cls = 'dep';
        html += '<td class="' + cls + '">' + fmt(d[i][jj]) + '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    if (st.k != null && st.k >= 0) html += '<div style="margin-top:8px;color:var(--c-primary-dark);font-weight:600">จุดพัก k = ' + LBL[st.k] + '</div>';
    gridEl.innerHTML = html;
    for (var c = 0; c < codeLineEls.length; c++) codeLineEls[c].classList.toggle('is-active', c === step.meta.line);
  }

  function build() {
    var d = BASE.map(function (r) { return r.slice(); });
    var S = new DSA.Stepper();
    function snap(extra) { var dd = d.map(function (r) { return r.slice(); }); var o = { dist: dd, k: -1 }; for (var key in extra) o[key] = extra[key]; return o; }
    S.add(snap({}), 'เริ่มจากตารางระยะทางตรง (∞ = ยังไปไม่ถึง, แนวทแยง = 0)', { line: 0 });
    for (var k = 0; k < n; k++) {
      S.add(snap({ k: k }), 'ลองให้โหนด ' + LBL[k] + ' เป็นจุดพักกลางทาง', { line: 0 });
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          if (i === j || d[i][k] === INF || d[k][j] === INF) continue;
          var via = d[i][k] + d[k][j];
          if (via < d[i][j]) {
            S.add(snap({ k: k, cur: [i, j], dep: [[i, k], [k, j]] }), LBL[i] + '→' + LBL[j] + ' ผ่าน ' + LBL[k] + ': ' + d[i][k] + '+' + d[k][j] + ' = ' + via + ' < ' + fmt(d[i][j]) + ' → อัปเดต', { line: 4 });
            d[i][j] = via;
          }
        }
      }
    }
    S.add(snap({}), '✅ ได้ระยะสั้นสุดของทุกคู่แล้ว (ตารางสุดท้าย)', { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('fw-controls'), speed: 550 });
  document.getElementById('fw-run').addEventListener('click', function () { player.setSteps(build()); });
  player.setSteps(build());
})();
