/* Deque — เพิ่ม/ลบ ทั้งหัวและท้าย (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'deque', vh: 220 });
  var W = 64, GAP = 10, CH = 52, Y = 90, VW = api.VW;
  var dq = [], nid = 0;
  function startX(n) { return (VW - (n * W + (n - 1) * GAP)) / 2; }
  function X(i, n) { return startX(n) + i * (W + GAP); }

  function model(hi, cls) {
    var n = dq.length, cells = [], labels = [];
    dq.forEach(function (e, i) { cells.push({ id: 'e' + e.id, x: X(i, n), y: Y, w: W, h: CH, text: e.v, sub: null, cls: (e.id === hi ? cls : '') }); });
    if (n) { labels.push({ id: 'f', x: X(0, n) + W / 2, y: Y - 14, text: '↑ front', cls: 'is-accent' }); labels.push({ id: 'b', x: X(n - 1, n) + W / 2, y: Y + CH + 22, text: 'back ↑', cls: 'is-accent' }); }
    return { cells: cells, labels: labels };
  }
  function show(desc, hi, cls) { var S = new DSA.Stepper(); S.add(DSA.NodeViz.snap(model(hi || -1, cls || '')), desc, { line: -1 }); api.setSteps(S.steps); }

  function val() { return document.getElementById('dq-val').value.trim(); }
  document.getElementById('dq-pf').addEventListener('click', function () { var v = val(); if (!v) { alert('ใส่ค่า'); return; } var e = { id: ++nid, v: v }; dq.unshift(e); show('pushFront("' + v + '") → ต่อที่หัว', e.id, 'is-new'); });
  document.getElementById('dq-pb').addEventListener('click', function () { var v = val(); if (!v) { alert('ใส่ค่า'); return; } var e = { id: ++nid, v: v }; dq.push(e); show('pushBack("' + v + '") → ต่อที่ท้าย', e.id, 'is-new'); });
  document.getElementById('dq-of').addEventListener('click', function () { if (!dq.length) { alert('deque ว่าง'); return; } var e = dq.shift(); show('popFront() → เอา "' + e.v + '" ออกจากหัว'); });
  document.getElementById('dq-ob').addEventListener('click', function () { if (!dq.length) { alert('deque ว่าง'); return; } var e = dq.pop(); show('popBack() → เอา "' + e.v + '" ออกจากท้าย'); });

  dq = [{ id: ++nid, v: 20 }, { id: ++nid, v: 30 }, { id: ++nid, v: 40 }];
  show('Deque ตัวอย่าง — เพิ่ม/ลบได้ทั้งสองด้าน');
})();
