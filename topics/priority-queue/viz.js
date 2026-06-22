/* Priority Queue (max) — แสดงเป็นอาเรย์เรียง (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'priority-queue', vh: 200 });
  var W = 58, GAP = 8, CH = 54, Y = 90, VW = api.VW;
  var pq = [], nid = 0;  // เรียงจากมากไปน้อย (front = สูงสุด)
  function startX(n) { return (VW - (n * W + (n - 1) * GAP)) / 2; }
  function X(i, n) { return startX(n) + i * (W + GAP); }
  function model(hi, cls, scan) {
    var n = pq.length, cells = [], labels = [];
    pq.forEach(function (e, i) {
      var c = e.id === hi ? cls : (i === scan ? 'is-active' : '');
      cells.push({ id: 'e' + e.id, x: X(i, n), y: Y, w: W, h: CH, text: e.v, sub: (i === 0 ? 'สูงสุด' : null), cls: c });
    });
    return { cells: cells, labels: labels };
  }
  function add(S, hi, cls, scan, desc, line) { S.add(DSA.NodeViz.snap(model(hi, cls, scan)), desc, { line: line }); }

  var CODE = ['enqueue(x): หาตำแหน่งให้เรียงมาก→น้อย แล้วแทรก', 'dequeue(): เอาตัวหน้าสุด (สูงสุด) ออก', '// ของจริงใช้ heap → O(log n)'];

  function enqSteps(v) {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var pos = 0; while (pos < pq.length && pq[pos].v >= v) pos++;
    for (var s = 0; s < pos; s++) add(S, null, '', s, 'หาตำแหน่งแทรก: A[' + s + ']=' + pq[s].v + ' ≥ ' + v + ' → เลื่อนต่อ', 0);
    var node = { id: ++nid, v: v }; pq.splice(pos, 0, node);
    add(S, node.id, 'is-new', -1, 'แทรก ' + v + ' ที่ตำแหน่ง ' + pos + ' (คงลำดับมาก→น้อย)', 0);
    return S.steps;
  }
  function deqSteps() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    if (!pq.length) { add(S, null, '', -1, 'คิวว่าง', 1); return S.steps; }
    var top = pq[0];
    add(S, top.id, 'is-active', -1, 'dequeue → เอาตัวหน้าสุด (สูงสุด = ' + top.v + ') ออก', 1);
    pq.shift();
    add(S, null, '', -1, 'นำ ' + top.v + ' ออกแล้ว ตัวถัดมาเลื่อนเป็นหัว', 1);
    return S.steps;
  }
  function show(desc) { var S = new DSA.Stepper(); add(S, null, '', -1, desc, -1); api.setSteps(S.steps); }
  document.getElementById('pq-enq').addEventListener('click', function () { var v = parseInt(document.getElementById('pq-val').value, 10); if (isNaN(v)) { alert('ใส่ความสำคัญ (ตัวเลข)'); return; } api.setSteps(enqSteps(v)); });
  document.getElementById('pq-deq').addEventListener('click', function () { api.setSteps(deqSteps()); });
  document.getElementById('pq-reset').addEventListener('click', function () { pq = []; api.setCode([]); show('คิวว่าง — ลอง enqueue'); });

  [50, 30, 70, 20].forEach(function (v) { var pos = 0; while (pos < pq.length && pq[pos].v >= v) pos++; pq.splice(pos, 0, { id: ++nid, v: v }); });
  api.setCode([]);
  show('Priority Queue ตัวอย่าง (เรียงมาก→น้อย: 70,50,30,20) ลอง enqueue/dequeue');
})();
