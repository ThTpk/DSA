/* van Emde Boas (u=16, top-level) — summary + 4 clusters, min stored separately (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'veb');
  var host = document.getElementById('vbviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="vb-grid"></div><div id="vb-controls"></div></div>' +
    '<div><div class="code-panel" id="vb-code"></div></div></div>';
  var gridEl = document.getElementById('vb-grid'), codeEl = document.getElementById('vb-code');
  var CODE = ['insert(x): ถ้าว่าง → min=max=x (ไม่แตะคลัสเตอร์)', '  ถ้า x<min: สลับ x กับ min (min เดิมลงคลัสเตอร์)', '  h=high(x), l=low(x) ; summary[h]=1 ; cluster[h][l]=1', 'successor(x): ถ้า x<min → min', '  ถ้าคลัสเตอร์ h มีค่า > l → อยู่คลัสเตอร์เดิม', '  ไม่งั้น: หา summary คลัสเตอร์ถัดไป → min ของคลัสเตอร์นั้น'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var SQ = 4;
  var min, max, summary, clusters;
  function reset() { min = null; max = null; summary = [0, 0, 0, 0]; clusters = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; }
  reset();

  function render(step) {
    var st = step.snapshot;
    function cell(on, label, cls) { return '<td class="' + cls + '" style="width:40px;height:34px;text-align:center">' + (on ? label : '·') + '</td>'; }
    var html = '<table class="dp-table" style="margin-bottom:14px"><tr><th>min</th><th>max</th></tr><tr>' +
      '<td class="' + (st.min != null ? 'path' : '') + '">' + (st.min == null ? '·' : st.min) + '</td>' +
      '<td class="' + (st.max != null ? 'path' : '') + '">' + (st.max == null ? '·' : st.max) + '</td></tr></table>';
    // summary
    html += '<table class="dp-table" style="margin-bottom:10px"><tr><th>summary</th>';
    for (var c = 0; c < SQ; c++) html += '<th class="' + (st.h === c ? 'hl' : '') + '">C' + c + '</th>';
    html += '</tr><tr><th>ไม่ว่าง?</th>';
    for (var c2 = 0; c2 < SQ; c2++) { var cls = st.h === c2 ? 'cur' : (st.summary[c2] ? 'path' : ''); html += '<td class="' + cls + '">' + st.summary[c2] + '</td>'; }
    html += '</tr></table>';
    // clusters
    html += '<table class="dp-table"><tr><th></th>';
    for (var j = 0; j < SQ; j++) html += '<th>low=' + j + '</th>';
    html += '</tr>';
    for (var ci = 0; ci < SQ; ci++) {
      html += '<tr><th class="' + (st.h === ci ? 'hl' : '') + '">C' + ci + '</th>';
      for (var jj = 0; jj < SQ; jj++) {
        var val = ci * SQ + jj, on = st.clusters[ci][jj];
        var cls = '';
        if (st.succ === val) cls = 'dep';
        else if (st.h === ci && st.l === jj) cls = 'cur';
        else if (on) cls = 'path';
        html += '<td class="' + cls + '" style="font-family:JetBrains Mono,monospace">' + (on ? val : '·') + '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    if (st.result) html += '<div style="margin-top:12px;font-weight:600">' + st.result + '</div>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  var S;
  function snap(extra) {
    var o = { min: min, max: max, summary: summary.slice(), clusters: clusters.map(function (r) { return r.slice(); }) };
    for (var k in extra) o[k] = extra[k]; return o;
  }
  function step(extra, desc, line) { S.add(snap(extra), desc, { line: line }); }

  function member(x) { if (x === min || x === max) return true; return !!clusters[x >> 2][x & 3]; }

  function insert(x) {
    if (member(x)) { step({}, x + ' มีอยู่แล้ว', 0); return; }
    if (min == null) { min = max = x; step({}, 'เซตว่าง → เก็บ min=max=' + x + ' (ไม่แตะคลัสเตอร์ = O(1))', 0); return; }
    if (x < min) { step({}, x + ' < min(' + min + ') → สลับ: min ใหม่=' + x + ', นำ ' + min + ' ลงคลัสเตอร์', 1); var t = min; min = x; x = t; }
    var h = x >> 2, l = x & 3;
    summary[h] = 1; clusters[h][l] = 1;
    if (x > max) max = x;
    step({ h: h, l: l }, 'insert ' + x + ': high=' + h + ', low=' + l + ' → summary[' + h + ']=1, cluster[' + h + '][' + l + ']=1', 2);
  }

  function successor(x) {
    if (min == null || x >= max) { step({}, 'ไม่มี successor ของ ' + x + (max != null ? ' (max=' + max + ')' : ''), 3); return; }
    if (x < min) { step({ succ: min }, x + ' < min → successor = min = ' + min, 3); return; }
    var h = x >> 2, l = x & 3;
    // ในคลัสเตอร์เดิม
    for (var j = l + 1; j < SQ; j++) if (clusters[h][j]) { var v = h * SQ + j; step({ h: h, l: j, succ: v }, 'คลัสเตอร์ ' + h + ' มีค่าถัดจาก low=' + l + ' → successor = ' + v, 4); return; }
    // คลัสเตอร์ถัดไปจาก summary
    for (var c = h + 1; c < SQ; c++) if (summary[c]) {
      for (var j2 = 0; j2 < SQ; j2++) if (clusters[c][j2]) { var v2 = c * SQ + j2; step({ h: c, succ: v2 }, 'ข้ามไปคลัสเตอร์ไม่ว่างถัดไป (' + c + ') → min ของมัน = ' + v2, 5); return; }
    }
    step({}, 'ไม่มี successor', 3);
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('vb-controls'), speed: 800 });
  function flush() { player.setSteps(S.steps); }
  function getX() { var v = parseInt(document.getElementById('vb-x').value, 10); return (v >= 0 && v <= 15) ? v : null; }

  document.getElementById('vb-insert').addEventListener('click', function () { var x = getX(); if (x == null) { alert('ใส่ 0-15'); return; } S = new DSA.Stepper(); insert(x); flush(); });
  document.getElementById('vb-succ').addEventListener('click', function () { var x = getX(); if (x == null) { alert('ใส่ 0-15'); return; } S = new DSA.Stepper(); successor(x); flush(); });
  document.getElementById('vb-reset').addEventListener('click', function () { reset(); S = new DSA.Stepper(); step({}, 'ล้างเซตแล้ว', -1); flush(); });
  document.getElementById('vb-demo').addEventListener('click', function () {
    reset(); S = new DSA.Stepper();
    [6, 2, 13, 9, 1, 11].forEach(insert);
    successor(2);
    flush();
  });

  reset(); S = new DSA.Stepper();
  [6, 2, 13, 9, 1, 11].forEach(insert);
  step({ result: 'เซต = {1,2,6,9,11,13} · ลอง successor หรือ insert ต่อ' }, 'พร้อมแล้ว', -1);
  flush();
})();
