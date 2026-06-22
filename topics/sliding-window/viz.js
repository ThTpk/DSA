/* Sliding Window — max sum ของช่วงยาว k (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'sliding-window', vh: 200 });
  var W = 56, GAP = 8, CH = 54, Y = 80, VW = api.VW;
  var a = [], k = 3;
  function startX(n) { return (VW - (n * W + (n - 1) * GAP)) / 2; }
  function model(ws, bs, enter, done) {
    var n = a.length, cells = [];
    a.forEach(function (v, i) {
      var cls = '';
      if (bs != null && i >= bs && i < bs + k) cls = 'is-found';
      if (!done && ws != null && i >= ws && i < ws + k && cls === '') cls = 'is-highlight';
      if (!done && i === enter) cls = 'is-active';
      cells.push({ id: 'e' + i, x: startX(n) + i * (W + GAP), y: Y, w: W, h: CH, text: v, sub: null, cls: cls });
    });
    return { cells: cells };
  }
  function add(S, ws, bs, enter, done, desc, line) { S.add(DSA.NodeViz.snap(model(ws, bs, enter, done)), desc, { line: line }); }

  var CODE = ['sum = ผลรวม k ตัวแรก ; best = sum', 'for i = k..n-1:', '  sum += A[i] − A[i-k]   // เข้า-ออก', '  best = max(best, sum)'];

  function build(values, kk) {
    api.setCode(CODE);
    a = values.slice(); k = kk;
    var n = a.length, sum = 0;
    for (var i = 0; i < k; i++) sum += a[i];
    var best = sum, bestStart = 0;
    var S = new DSA.Stepper();
    add(S, 0, 0, -1, false, 'หน้าต่างแรก [0..' + (k - 1) + '] ผลรวม = ' + sum + ' → best = ' + sum, 0);
    for (var s = 1; s + k - 1 < n; s++) {
      var inI = s + k - 1, outI = s - 1;
      sum += a[inI] - a[outI];
      add(S, s, bestStart, inI, false, 'เลื่อน: +A[' + inI + ']=' + a[inI] + ' −A[' + outI + ']=' + a[outI] + ' → ผลรวม = ' + sum, 2);
      if (sum > best) { best = sum; bestStart = s; add(S, s, bestStart, -1, false, 'ผลรวม ' + sum + ' > best → best = ' + best + ', หน้าต่าง [' + s + '..' + (s + k - 1) + ']', 3); }
      else add(S, s, bestStart, -1, false, 'ผลรวม ' + sum + ' ≤ best ' + best + ' → best เท่าเดิม', 3);
    }
    add(S, null, bestStart, -1, true, '✅ ผลรวมมากสุดของช่วงยาว ' + k + ' = ' + best + ' · ช่วง [' + bestStart + '..' + (bestStart + k - 1) + '] = [' + a.slice(bestStart, bestStart + k).join(', ') + ']', -1);
    return S.steps;
  }

  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 12); }
  function run() {
    var v = parseList(document.getElementById('sw-values').value);
    var kk = Math.max(1, Math.min(v.length, parseInt(document.getElementById('sw-k').value, 10) || 3));
    if (v.length < 2) { alert('ใส่ค่าอย่างน้อย 2 ตัว'); return; }
    document.getElementById('sw-values').value = v.join(', '); document.getElementById('sw-k').value = kk;
    api.setSteps(build(v, kk));
  }
  document.getElementById('sw-run').addEventListener('click', run);
  run();
})();
