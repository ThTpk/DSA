/* Union-Find (Disjoint Set) — parent array + find (path compression) + union */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'union-find', vh: 220 });
  var N = 7, CW = 70, CH = 52, GAP = 14, Y = 110;
  var VW = api.VW;
  var SX = 10;
  function layout() {
    CW = Math.min(70, Math.floor((VW - 20 - (N - 1) * GAP) / N));
    SX = (VW - (N * CW + (N - 1) * GAP)) / 2;
  }
  function X(i) { return SX + i * (CW + GAP); }

  var parent = [];
  function reset() { parent = []; for (var i = 0; i < N; i++) parent.push(i); }
  layout(); reset();

  function model(hi, cls) {
    var cells = parent.map(function (p, i) {
      return { id: 'e' + i, x: X(i), y: Y, w: CW, h: CH, text: p, sub: '[' + i + ']',
        cls: (hi && hi.indexOf(i) !== -1) ? cls : (p === i ? 'is-highlight' : '') };
    });
    return { cells: cells, labels: [{ id: 'hint', x: VW / 2, y: 40, text: 'ช่อง = parent[i] · กรอบม่วง = root (ชี้ตัวเอง)' }] };
  }
  function add(S, hi, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hi, cls)), desc, { line: line }); }

  var CODE = [
    'find(x): while parent[x] != x: x = parent[x]   // ตามขึ้นไปหา root',
    '  (path compression: ชี้ทุกตัวบนทางไป root ตรงๆ)',
    'union(a,b): ra=find(a); rb=find(b)',
    '  if ra != rb: parent[ra] = rb   // รวมกลุ่ม',
  ];

  function findRoot(S, x, compress) {
    var path = [], c = x;
    while (parent[c] !== c) {
      add(S, [c], 'is-active', 'parent[' + c + '] = ' + parent[c] + ' (ไม่ใช่ root) → ตามขึ้นไป', 0);
      path.push(c); c = parent[c];
    }
    add(S, [c], 'is-found', 'พบ root ของ ' + x + ' คือ ' + c, 0);
    if (compress && path.length) {
      path.forEach(function (p) { parent[p] = c; });
      add(S, path, 'is-new', 'path compression: ให้ ' + path.join(',') + ' ชี้ตรงไป root ' + c, 1);
    }
    return c;
  }

  function findSteps(x) {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    add(S, [x], 'is-active', 'find(' + x + '): เริ่มตามตัวชี้ขึ้นไป', 0);
    var r = findRoot(S, x, true);
    add(S, [r], 'is-found', '✅ find(' + x + ') = ' + r, -1);
    return S.steps;
  }
  function unionSteps(a, b) {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    add(S, [a, b], 'is-active', 'union(' + a + ',' + b + '): หา root ของทั้งสอง', 2);
    var ra = findRoot(S, a, true);
    var rb = findRoot(S, b, true);
    if (ra !== rb) {
      parent[ra] = rb;
      add(S, [ra, rb], 'is-new', 'root ต่างกัน (' + ra + ' กับ ' + rb + ') → ให้ parent[' + ra + '] = ' + rb + ' รวมเป็นกลุ่มเดียว', 3);
    } else {
      add(S, [ra], 'is-found', a + ' กับ ' + b + ' อยู่กลุ่มเดียวกันอยู่แล้ว (root = ' + ra + ') → ไม่ต้องรวม', 3);
    }
    return S.steps;
  }

  function show(desc) { var S = new DSA.Stepper(); add(S, [], '', desc, -1); api.setSteps(S.steps); }

  function val(id) { var x = parseInt(document.getElementById(id).value, 10); return (x >= 0 && x < N) ? x : null; }
  document.getElementById('uf-union').addEventListener('click', function () { var a = val('uf-a'), b = val('uf-b'); if (a == null || b == null) { alert('ใส่ a,b (0-' + (N - 1) + ')'); return; } api.setSteps(unionSteps(a, b)); });
  document.getElementById('uf-find').addEventListener('click', function () { var a = val('uf-a'); if (a == null) { alert('ใส่ a (0-' + (N - 1) + ')'); return; } api.setSteps(findSteps(a)); });
  document.getElementById('uf-reset').addEventListener('click', function () { reset(); api.setCode([]); show('รีเซ็ต — ทุกตัวเป็นกลุ่มของตัวเอง (parent[i]=i)'); });
  document.getElementById('uf-demo').addEventListener('click', function () {
    api.setCode(CODE); reset();
    var S = new DSA.Stepper();
    add(S, [], '', 'เริ่ม: ' + N + ' กลุ่มแยกกัน', -1);
    var seq = []; for (var i = 0; i + 1 < N; i += 2) seq.push([i, i + 1]);
    if (N > 3) seq.push([0, 2]); if (N > 5) seq.push([4, Math.min(6, N - 1)]);
    seq.forEach(function (p) {
      add(S, [p[0], p[1]], 'is-active', 'union(' + p[0] + ',' + p[1] + ')', 2);
      var ra = findRoot(S, p[0], true), rb = findRoot(S, p[1], true);
      if (ra !== rb) { parent[ra] = rb; add(S, [ra, rb], 'is-new', 'รวมกลุ่ม: parent[' + ra + '] = ' + rb, 3); }
    });
    add(S, [], '', '✅ เดโมจบ — เกิดหลายกลุ่ม สังเกต root (กรอบม่วง) ของแต่ละกลุ่ม', -1);
    api.setSteps(S.steps);
  });
  document.getElementById('uf-size').addEventListener('change', function () {
    N = parseInt(document.getElementById('uf-size').value, 10) || 7;
    layout(); reset(); api.setCode([]);
    show(N + ' สมาชิก แต่ละตัวเป็นกลุ่มของตัวเอง (parent[i]=i) — ลอง union/find');
  });

  api.setCode([]);
  show(N + ' สมาชิก แต่ละตัวเป็นกลุ่มของตัวเอง — ลอง union/find หรือกดเดโม');
})();
