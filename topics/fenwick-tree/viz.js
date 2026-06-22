/* Fenwick Tree (BIT) — prefix sum + update เห็นการกระโดด i±lowbit(i) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'fenwick-tree', vh: 220 });
  var CW = 64, CH = 52, GAP = 12, Y = 110, VW = api.VW;
  var n = 0, tree = [], A = [];
  function startX() { return (VW - (n * CW + (n - 1) * GAP)) / 2; }
  function X(i) { return startX() + (i - 1) * (CW + GAP); } // 1-indexed
  function lowbit(i) { return i & (-i); }

  function model(hi, cls) {
    var cells = [];
    for (var i = 1; i <= n; i++) {
      cells.push({ id: 'b' + i, x: X(i), y: Y, w: CW, h: CH, text: tree[i], sub: 'tree[' + i + ']',
        cls: (hi && hi.indexOf(i) !== -1) ? cls : '' });
    }
    return { cells: cells, labels: [{ id: 'hint', x: VW / 2, y: 40, text: 'อาเรย์ BIT (1-indexed) — แต่ละช่องเก็บผลรวมของช่วงตาม lowbit' }] };
  }
  function add(S, hi, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hi, cls)), desc, { line: line }); }

  var P_CODE = ['prefix(i):  s = 0', 'while i > 0:', '  s += tree[i]', '  i -= lowbit(i)   // i & (-i)', 'return s'];
  var U_CODE = ['update(i, Δ):', 'while i <= n:', '  tree[i] += Δ', '  i += lowbit(i)   // i & (-i)'];

  function rawUpdate(i, d) { for (; i <= n; i += lowbit(i)) tree[i] += d; }

  function buildSteps(values) {
    api.setCode([]);
    A = values.slice(); n = A.length; tree = new Array(n + 1).fill(0);
    for (var i = 1; i <= n; i++) rawUpdate(i, A[i - 1]);
    var S = new DSA.Stepper();
    add(S, [], '', 'สร้าง BIT จาก A = [' + A.join(', ') + '] เสร็จ — แต่ละ tree[i] เก็บผลรวมช่วงของมัน', -1);
    return S.steps;
  }

  function prefixSteps(i) {
    api.setCode(P_CODE);
    var S = new DSA.Stepper();
    var s = 0, idx = i;
    add(S, [i], 'is-active', 'prefix(' + i + '): หาผลรวม A[1..' + i + '] เริ่มที่ index ' + i, 0);
    while (idx > 0) {
      s += tree[idx];
      var lb = lowbit(idx);
      add(S, [idx], 'is-active', 'บวก tree[' + idx + '] = ' + tree[idx] + ' (รวม = ' + s + ') → กระโดด ' + idx + ' − lowbit(' + idx + ')=' + lb + ' = ' + (idx - lb), 2);
      idx -= lb;
    }
    add(S, [], '', '✅ ผลรวม A[1..' + i + '] = ' + s, -1);
    return S.steps;
  }

  function updateSteps(i, d) {
    api.setCode(U_CODE);
    var S = new DSA.Stepper();
    var idx = i;
    add(S, [i], 'is-active', 'update: เพิ่ม ' + d + ' ให้ A[' + i + '] → ไล่อัปเดต BIT จาก index ' + i, 0);
    while (idx <= n) {
      tree[idx] += d;
      var lb = lowbit(idx);
      add(S, [idx], 'is-active', 'tree[' + idx + '] += ' + d + ' = ' + tree[idx] + ' → กระโดด ' + idx + ' + lowbit(' + idx + ')=' + lb + ' = ' + (idx + lb), 2);
      idx += lb;
    }
    A[i - 1] += d;
    add(S, [], '', '✅ update เสร็จ — A[' + i + '] เพิ่มขึ้น ' + d, -1);
    return S.steps;
  }

  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 8); }
  var valuesEl = document.getElementById('fw-values');
  function build(v) { valuesEl.value = v.join(', '); api.setSteps(buildSteps(v)); }
  document.getElementById('fw-build').addEventListener('click', function () { var v = parseList(valuesEl.value); if (v.length < 1) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } build(v); });
  document.getElementById('fw-prefix').addEventListener('click', function () { var i = parseInt(document.getElementById('fw-pi').value, 10); if (isNaN(i) || i < 1 || i > n) { alert('ใส่ i (1-' + n + ')'); return; } api.setSteps(prefixSteps(i)); });
  document.getElementById('fw-update').addEventListener('click', function () { var i = parseInt(document.getElementById('fw-ui').value, 10), d = parseInt(document.getElementById('fw-ud').value, 10); if (isNaN(i) || isNaN(d) || i < 1 || i > n) { alert('ใส่ i (1-' + n + ') และ Δ'); return; } api.setSteps(updateSteps(i, d)); });

  build([1, 2, 3, 4, 5, 6, 7, 8]);
})();
