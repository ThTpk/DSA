/* LIS — dp[i] = LIS ที่จบที่ i (NodeViz: array + dp ใต้กล่อง) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'lis', vh: 200 });
  var W = 60, GAP = 10, CH = 54, Y = 80, VW = api.VW;
  var a = [], dp = [];
  function startX(n) { return (VW - (n * W + (n - 1) * GAP)) / 2; }
  function model(ci, cj, lisSet) {
    var n = a.length, cells = [];
    a.forEach(function (v, i) {
      var cls = '';
      if (lisSet && lisSet.indexOf(i) !== -1) cls = 'is-found';
      else if (i === ci) cls = 'is-active';
      else if (i === cj) cls = 'is-highlight';
      cells.push({ id: 'e' + i, x: startX(n) + i * (W + GAP), y: Y, w: W, h: CH, text: v, sub: 'dp=' + (dp[i] == null ? '?' : dp[i]), cls: cls });
    });
    return { cells: cells };
  }
  function add(S, ci, cj, lisSet, desc, line) { S.add(DSA.NodeViz.snap(model(ci, cj, lisSet)), desc, { line: line }); }

  var CODE = ['dp[i] = 1 (ทุกตัว)', 'for i: for j < i:', '  if A[j] < A[i] และ dp[j]+1 > dp[i]:', '    dp[i] = dp[j] + 1', 'คำตอบ = max(dp)'];

  function build(values) {
    api.setCode(CODE);
    a = values.slice(); dp = new Array(a.length).fill(null);
    var prev = new Array(a.length).fill(-1);
    var S = new DSA.Stepper();
    add(S, -1, -1, null, 'เริ่ม: dp ทุกตัว = 1 (อย่างน้อยตัวมันเอง)', 0);
    for (var i = 0; i < a.length; i++) {
      dp[i] = 1;
      add(S, i, -1, null, 'พิจารณา A[' + i + '] = ' + a[i] + ' → ตั้ง dp[' + i + '] = 1', 1);
      for (var j = 0; j < i; j++) {
        if (a[j] < a[i]) {
          var better = dp[j] + 1 > dp[i];
          add(S, i, j, null, 'A[' + j + ']=' + a[j] + ' < A[' + i + ']=' + a[i] + (better ? ' และ dp[' + j + ']+1=' + (dp[j] + 1) + ' > dp[' + i + ']=' + dp[i] + ' → อัปเดต' : ' แต่ไม่ทำให้ยาวขึ้น'), 2);
          if (better) { dp[i] = dp[j] + 1; prev[i] = j; }
        }
      }
    }
    // หา max + traceback
    var best = 0, bi = 0; for (var k = 0; k < a.length; k++) if (dp[k] > best) { best = dp[k]; bi = k; }
    var lis = []; var c = bi; while (c !== -1) { lis.unshift(c); c = prev[c]; }
    add(S, -1, -1, lis, '✅ LIS ยาว = ' + best + ' → ลำดับ: ' + lis.map(function (idx) { return a[idx]; }).join(' < '), -1);
    return S.steps;
  }

  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 10); }
  var valuesEl = document.getElementById('lis-values');
  function run() { var v = parseList(valuesEl.value); if (v.length < 2) { alert('ใส่อย่างน้อย 2 ตัว'); return; } valuesEl.value = v.join(', '); api.setSteps(build(v)); }
  document.getElementById('lis-run').addEventListener('click', run);
  document.getElementById('lis-random').addEventListener('click', function () { var x = []; for (var i = 0; i < 8; i++) x.push(Math.floor(Math.random() * 50)); valuesEl.value = x.join(', '); run(); });
  run();
})();
