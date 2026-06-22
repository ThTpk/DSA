/* Suffix Array — เรียง suffix ทั้งหมด (selection sort เพื่อให้เห็นการเทียบ) custom + VizPlayer */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'suffix-array');
  var host = document.getElementById('saviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="sa-grid" style="overflow-x:auto"></div><div id="sa-controls"></div></div>' +
    '<div><div class="code-panel" id="sa-code"></div></div></div>';
  var gridEl = document.getElementById('sa-grid'), codeEl = document.getElementById('sa-code');
  var CODE = ['สร้าง suffix ทุกตัว: s[i..] สำหรับ i = 0..n-1', 'เรียง suffix ตามพจนานุกรม', '  เทียบทีละคู่ (selection sort)', 'Suffix Array = ลำดับ index หลังเรียง'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var s = 'banana';

  function render(step) {
    var st = step.snapshot, order = st.order;
    var html = '<table class="dp-table"><tr><th>อันดับ</th><th>index</th><th style="text-align:left;padding:4px 10px">suffix</th></tr>';
    order.forEach(function (idx, rank) {
      var cls = '';
      if (st.done != null && rank <= st.done) cls = 'path';
      if (st.cur === rank) cls = 'cur';
      else if (st.cmp === rank) cls = 'dep';
      html += '<tr><td class="' + cls + '">' + rank + '</td><td class="' + cls + '">' + idx + '</td>' +
        '<td class="' + cls + '" style="text-align:left;padding:4px 10px;font-family:JetBrains Mono,monospace">' + s.slice(idx) + '</td></tr>';
    });
    html += '</table>';
    if (st.result) html += '<div style="margin-top:12px;font-weight:600">' + st.result + '</div>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var n = s.length;
    var order = []; for (var i = 0; i < n; i++) order.push(i);
    var S = new DSA.Stepper();
    function snap(extra) { var o = { order: order.slice() }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({}), 'สร้าง suffix ทั้ง ' + n + ' ตัว (ยังไม่เรียง)', { line: 0 });
    // selection sort ตาม suffix string
    for (var a = 0; a < n - 1; a++) {
      var min = a;
      for (var b = a + 1; b < n; b++) {
        S.add(snap({ cur: min, cmp: b, done: a - 1 }), 'เทียบ "' + s.slice(order[b]) + '" กับตัวเล็กสุด "' + s.slice(order[min]) + '"', { line: 2 });
        if (s.slice(order[b]) < s.slice(order[min])) min = b;
      }
      if (min !== a) { var t = order[a]; order[a] = order[min]; order[min] = t; }
      S.add(snap({ done: a }), 'อันดับ ' + a + ' = suffix เริ่มที่ index ' + order[a] + ' ("' + s.slice(order[a]) + '")', { line: 1 });
    }
    S.add(snap({ done: n - 1, result: '✅ Suffix Array ของ "' + s + '" = [' + order.join(', ') + ']' }), 'เสร็จ', { line: 3 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('sa-controls'), speed: 450 });
  function run() {
    s = (document.getElementById('sa-text').value || 'banana').toLowerCase().replace(/[^a-z]/g, '').slice(0, 10) || 'banana';
    document.getElementById('sa-text').value = s;
    player.setSteps(build());
  }
  document.getElementById('sa-run').addEventListener('click', run);
  run();
})();
