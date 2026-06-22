/* Queue — FIFO แนวนอน enqueue ท้าย / dequeue หน้า */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'queue', vh: 260 });
  var CW = 64, CH = 52, GAP = 10, Y = 90;
  var VW = api.VW;
  function startX(n) { return (VW - (n * CW + (n - 1) * GAP)) / 2; }
  function X(i, n) { return startX(n) + i * (CW + GAP); }

  var ENQ_CODE = ['enqueue(x):', '  rear = rear + 1', '  queue[rear] = x   // เพิ่มที่ท้าย O(1)'];
  var DEQ_CODE = ['dequeue():', '  x = queue[front]', '  front = front + 1   // เอาออกจากหน้า O(1)', '  return x'];

  var q = [], ids = [], eid = 0;
  function model(hi, cls) {
    var n = q.length;
    var cells = q.map(function (v, i) {
      return { id: 'e' + ids[i], x: X(i, n), y: Y, w: CW, h: CH, text: v, sub: null,
        cls: (hi && hi.indexOf(i) !== -1) ? cls : '' };
    });
    var labels = [];
    if (n) {
      labels.push({ id: 'front', x: X(0, n) + CW / 2, y: Y + CH + 22, text: '↑ front', cls: 'is-accent' });
      labels.push({ id: 'rear', x: X(n - 1, n) + CW / 2, y: Y - 14, text: 'rear ↓', cls: 'is-accent' });
    }
    return { cells: cells, labels: labels };
  }
  function add(S, hi, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hi, cls)), desc, { line: line }); }

  function enqSteps(x) {
    api.setCode(ENQ_CODE);
    var S = new DSA.Stepper();
    q.push(x); ids.push(++eid);
    add(S, [q.length - 1], 'is-new', 'enqueue ' + x + ' → ต่อท้ายแถว (rear)', 2);
    return S.steps;
  }
  function deqSteps() {
    api.setCode(DEQ_CODE);
    var S = new DSA.Stepper();
    if (!q.length) { add(S, [], '', 'คิวว่าง — ไม่มีอะไรให้ dequeue', 0); return S.steps; }
    var v = q[0];
    add(S, [0], 'is-active', 'dequeue → อ่านค่าหน้าสุด (front) = ' + v, 1);
    q.shift(); ids.shift();
    add(S, [], '', 'นำ ' + v + ' ออกจากหน้าแถว สมาชิกที่เหลือเลื่อนมาข้างหน้า', 2);
    return S.steps;
  }

  var valEl = document.getElementById('qu-val');
  document.getElementById('qu-enq').addEventListener('click', function () { var x = Number(valEl.value); if (isNaN(x)) { alert('ใส่ค่าที่จะ enqueue'); return; } api.setSteps(enqSteps(x)); valEl.value = ''; });
  document.getElementById('qu-deq').addEventListener('click', function () { api.setSteps(deqSteps()); });
  document.getElementById('qu-reset').addEventListener('click', function () { q = []; ids = []; api.setCode([]); var S = new DSA.Stepper(); add(S, [], '', 'คิวว่าง — ลอง enqueue ดู', -1); api.setSteps(S.steps); });

  q = [10, 20, 30]; ids = [++eid, ++eid, ++eid];
  api.setCode([]);
  var S0 = new DSA.Stepper(); add(S0, [], '', 'คิวตัวอย่าง (10 เข้าก่อน อยู่หน้าสุด, 30 เข้าหลัง อยู่ท้าย)', -1);
  api.setSteps(S0.steps);
})();
