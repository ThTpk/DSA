/* Rod Cutting — 1D DP r[len] = max(price[i] + r[len-i]) (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'rod-cutting');
  var host = document.getElementById('dpviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="rc-grid" style="overflow-x:auto"></div><div id="rc-controls"></div></div>' +
    '<div><div class="code-panel" id="rc-code"></div></div></div>';
  var gridEl = document.getElementById('rc-grid'), codeEl = document.getElementById('rc-code');
  var CODE = ['r[0] = 0', 'for len = 1..n:', '  best = −∞', '  for i = 1..len:', '    best = max(best, price[i] + r[len − i])', '  r[len] = best'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var price = [1, 5, 8, 9, 10, 17, 17, 20];

  function render(step) {
    var st = step.snapshot, r = st.r, n = price.length;
    // ตารางราคา
    var html = '<table class="dp-table" style="margin-bottom:14px"><tr><th>ความยาว</th>';
    for (var L = 1; L <= n; L++) html += '<th class="' + (st.useI === L ? 'dep' : '') + '">' + L + '</th>';
    html += '</tr><tr><th>ราคา</th>';
    for (var L2 = 1; L2 <= n; L2++) html += '<td class="' + (st.useI === L2 ? 'dep' : '') + '">' + price[L2 - 1] + '</td>';
    html += '</tr></table>';
    // ตาราง r[]
    html += '<table class="dp-table"><tr><th>len</th>';
    for (var j = 0; j <= n; j++) html += '<th class="' + (st.cur === j ? 'hl' : '') + '">' + j + '</th>';
    html += '</tr><tr><th>r[len]</th>';
    for (var jj = 0; jj <= n; jj++) {
      var cls = '';
      if (st.cur === jj) cls = 'cur';
      else if (st.depLen === jj) cls = 'dep';
      else if (st.done != null && jj <= st.done) cls = 'path';
      html += '<td class="' + cls + '">' + (r[jj] == null ? '' : r[jj]) + '</td>';
    }
    html += '</tr></table>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var n = price.length;
    var r = new Array(n + 1).fill(null), choice = new Array(n + 1).fill(0);
    r[0] = 0;
    var S = new DSA.Stepper();
    function snap(extra) { var o = { r: r.slice() }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({ done: 0 }), 'r[0] = 0 (ท่อนยาว 0 ขายได้ 0)', { line: 0 });
    for (var len = 1; len <= n; len++) {
      var best = -Infinity, bi = 1;
      for (var i = 1; i <= len; i++) {
        var cand = price[i - 1] + r[len - i];
        S.add(snap({ cur: len, useI: i, depLen: len - i, done: len - 1 }),
          'r[' + len + ']: ลองตัดท่อนแรกยาว ' + i + ' → price[' + i + '] (' + price[i - 1] + ') + r[' + (len - i) + '] (' + r[len - i] + ') = ' + cand, { line: 4 });
        if (cand > best) { best = cand; bi = i; }
      }
      r[len] = best; choice[len] = bi;
      S.add(snap({ cur: len, done: len }), 'r[' + len + '] = ' + best + ' (ตัดท่อนแรกยาว ' + bi + ' ดีสุด)', { line: 5 });
    }
    var cuts = [], rem = n; while (rem > 0) { cuts.push(choice[rem]); rem -= choice[rem]; }
    S.add(snap({ done: n }), '✅ รายได้สูงสุดของท่อนยาว ' + n + ' = ' + r[n] + ' · ตัดเป็น: [' + cuts.join(' + ') + ']', { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('rc-controls'), speed: 450 });
  function run() {
    var pr = document.getElementById('rc-prices').value.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x) && x >= 0; }).slice(0, 10);
    if (pr.length < 2) { alert('ใส่ราคาอย่างน้อย 2 ความยาว'); return; }
    price = pr; document.getElementById('rc-prices').value = pr.join(',');
    player.setSteps(build());
  }
  document.getElementById('rc-run').addEventListener('click', run);
  run();
})();
