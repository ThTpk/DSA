/* Kadane's — max subarray sum (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'kadane', vh: 200 });
  var W = 56, GAP = 8, CH = 54, Y = 80, VW = api.VW;
  var a = [];
  function startX(n) { return (VW - (n * W + (n - 1) * GAP)) / 2; }
  function inRange(i, lo, hi) { return lo != null && i >= lo && i <= hi; }
  function model(i, cs, bs, be, done) {
    var n = a.length, cells = [];
    a.forEach(function (v, k) {
      var cls = '';
      if (inRange(k, bs, be)) cls = 'is-found';
      if (!done) { if (k === i) cls = 'is-active'; else if (inRange(k, cs, i) && !inRange(k, bs, be)) cls = 'is-highlight'; }
      cells.push({ id: 'e' + k, x: startX(n) + k * (W + GAP), y: Y, w: W, h: CH, text: v, sub: null, cls: cls });
    });
    return { cells: cells };
  }
  function add(S, i, cs, bs, be, done, desc, line) { S.add(DSA.NodeViz.snap(model(i, cs, bs, be, done)), desc, { line: line }); }

  var CODE = ['cur = best = A[0]', 'for i = 1..n-1:', '  if cur + A[i] < A[i]: cur = A[i] (เริ่มใหม่)', '  else: cur += A[i]', '  best = max(best, cur)'];

  function build(values) {
    api.setCode(CODE);
    a = values.slice();
    var cur = a[0], best = a[0], cs = 0, bs = 0, be = 0;
    var S = new DSA.Stepper();
    add(S, 0, 0, 0, 0, false, 'เริ่ม: cur = best = A[0] = ' + a[0], 0);
    for (var i = 1; i < a.length; i++) {
      if (cur + a[i] < a[i]) { cur = a[i]; cs = i; add(S, i, cs, bs, be, false, 'cur+A[' + i + '] = ' + (cur) + ' แย่กว่า A[' + i + ']=' + a[i] + ' → เริ่มช่วงใหม่ที่ ' + i + ' (cur=' + cur + ')', 2); }
      else { cur += a[i]; add(S, i, cs, bs, be, false, 'cur += A[' + i + '] → cur = ' + cur, 3); }
      if (cur > best) { best = cur; bs = cs; be = i; add(S, i, cs, bs, be, false, 'cur ' + cur + ' > best → อัปเดต best = ' + best + ', ช่วง [' + bs + '..' + be + ']', 4); }
      else add(S, i, cs, bs, be, false, 'cur ' + cur + ' ≤ best ' + best + ' → best เท่าเดิม', 4);
    }
    add(S, -1, null, bs, be, true, '✅ ผลรวมมากสุด = ' + best + ' · ช่วง A[' + bs + '..' + be + '] = [' + a.slice(bs, be + 1).join(', ') + ']', -1);
    return S.steps;
  }

  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 11); }
  var valuesEl = document.getElementById('kd-values');
  function run() { var v = parseList(valuesEl.value); if (v.length < 1) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } valuesEl.value = v.join(', '); api.setSteps(build(v)); }
  document.getElementById('kd-run').addEventListener('click', run);
  document.getElementById('kd-random').addEventListener('click', function () { var x = []; for (var i = 0; i < 9; i++) x.push(Math.floor(Math.random() * 21) - 10); valuesEl.value = x.join(', '); run(); });
  run();
})();
