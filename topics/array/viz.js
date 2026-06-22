/* Array — เข้าถึง O(1), แทรก/ลบ O(n) (เห็นการเลื่อนสมาชิก) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'array' });
  var CW = 58, CH = 52, GAP = 10, Y = 110;
  var VW = api.VW;

  var ACCESS_CODE = ['access(i): return A[i]', '// เข้าถึงด้วย index ได้ทันที O(1)'];
  var INSERT_CODE = ['insert(i, x):', '  for k = n-1 downto i:  A[k+1] = A[k]   // เลื่อนขวา', '  A[i] = x ;  n = n + 1'];
  var DELETE_CODE = ['delete(i):', '  for k = i to n-2:  A[k] = A[k+1]   // เลื่อนซ้าย', '  n = n - 1'];

  var arr = [], ids = [], eid = 0;
  function startX(n) { return (VW - (n * CW + (n - 1) * GAP)) / 2; }
  function X(i, n) { return startX(n) + i * (CW + GAP); }
  function cells(hi, cls) {
    var n = arr.length;
    return arr.map(function (v, i) {
      return { id: 'e' + ids[i], x: X(i, n), y: Y, w: CW, h: CH, text: v, sub: '[' + i + ']',
        cls: (hi && hi.indexOf(i) !== -1) ? cls : '' };
    });
  }
  function S_add(S, hi, cls, desc, line) { S.add(DSA.NodeViz.snap({ cells: cells(hi, cls) }), desc, { line: line }); }

  function accessSteps(i) {
    api.setCode(ACCESS_CODE);
    var S = new DSA.Stepper();
    if (i < 0 || i >= arr.length) { S_add(S, [], '', 'index ' + i + ' อยู่นอกขอบเขต (0..' + (arr.length - 1) + ')', 1); return S.steps; }
    S_add(S, [i], 'is-found', '✅ เข้าถึง A[' + i + '] = ' + arr[i] + ' ได้ทันที (O(1))', 0);
    return S.steps;
  }
  function insertSteps(i, x) {
    api.setCode(INSERT_CODE);
    var S = new DSA.Stepper();
    var n = arr.length;
    if (i < 0 || i > n) { S_add(S, [], '', 'index ' + i + ' ใส่ได้แค่ 0..' + n, 0); return S.steps; }
    var range = []; for (var k = i; k < n; k++) range.push(k);
    S_add(S, range, 'is-active', 'แทรก ' + x + ' ที่ index ' + i + ' → ต้องเลื่อนสมาชิก index ' + i + '..' + (n - 1) + ' ไปขวา', 1);
    arr.splice(i, 0, x); ids.splice(i, 0, ++eid);
    S_add(S, [i], 'is-new', 'เลื่อนเสร็จแล้ววาง ' + x + ' ลง A[' + i + '] (ต้องเลื่อน n-i ตัว → O(n))', 2);
    return S.steps;
  }
  function deleteSteps(i) {
    api.setCode(DELETE_CODE);
    var S = new DSA.Stepper();
    var n = arr.length;
    if (i < 0 || i >= n) { S_add(S, [], '', 'index ' + i + ' อยู่นอกขอบเขต', 0); return S.steps; }
    S_add(S, [i], 'is-faded', 'ลบ A[' + i + '] = ' + arr[i] + ' → จะนำออกแล้วเลื่อนตัวที่เหลือมาซ้าย', 1);
    arr.splice(i, 1); ids.splice(i, 1);
    S_add(S, [], '', 'นำออกแล้ว เลื่อนสมาชิก index ' + (i + 1) + '.. มาทางซ้าย (O(n))', 2);
    return S.steps;
  }

  var valuesEl = document.getElementById('ar-values');
  var idxEl = document.getElementById('ar-idx');
  var valEl = document.getElementById('ar-val');
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 12); }
  function build(values) {
    valuesEl.value = values.join(', ');
    arr = values.slice(); ids = arr.map(function () { return ++eid; });
    api.setCode([]);
    var S = new DSA.Stepper(); S_add(S, [], '', 'Array พร้อม (' + arr.length + ' สมาชิก) — เลือกการทำงานด้านบน', -1);
    api.setSteps(S.steps);
  }

  document.getElementById('ar-build').addEventListener('click', function () { var v = parseList(valuesEl.value); if (!v.length) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } build(v); });
  document.getElementById('ar-random').addEventListener('click', function () { var a = []; for (var i = 0; i < 6; i++) a.push(2 + Math.floor(Math.random() * 98)); build(a); });
  document.getElementById('ar-access').addEventListener('click', function () { api.setSteps(accessSteps(parseInt(idxEl.value, 10))); });
  document.getElementById('ar-insert').addEventListener('click', function () { var i = parseInt(idxEl.value, 10), x = Number(valEl.value); if (isNaN(i) || isNaN(x)) { alert('ใส่ index และค่า'); return; } api.setSteps(insertSteps(i, x)); });
  document.getElementById('ar-delete').addEventListener('click', function () { var i = parseInt(idxEl.value, 10); if (isNaN(i)) { alert('ใส่ index'); return; } api.setSteps(deleteSteps(i)); });

  build([10, 20, 30, 40, 50]);
})();
