/* Hash Table: Open Addressing (linear probing) — NodeViz array */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'hash-open', vh: 200 });
  var M = 11, W = 56, GAP = 6, CH = 50, Y = 100, VW = api.VW;
  function startX() { return (VW - (M * W + (M - 1) * GAP)) / 2; }
  function X(i) { return startX() + i * (W + GAP); }
  var slots = new Array(M).fill(null);

  function model(hi, cls, hi2, cls2) {
    var cells = [];
    for (var i = 0; i < M; i++) {
      var c = '';
      if (i === hi) c = cls; else if (i === hi2) c = cls2; else if (slots[i] !== null) c = 'is-found';
      cells.push({ id: 's' + i, x: X(i), y: Y, w: W, h: CH, text: slots[i] === null ? '·' : slots[i], sub: i, cls: c });
    }
    return { cells: cells };
  }
  function add(S, hi, cls, desc, line, hi2, cls2) { S.add(DSA.NodeViz.snap(model(hi, cls, hi2, cls2)), desc, { line: line }); }

  var INS_CODE = ['insert(key): i = hash(key) = key % 11', 'while slot[i] ไม่ว่าง:', '  i = (i + 1) % 11   // probe ช่องถัดไป', 'slot[i] = key'];
  var SR_CODE = ['search(key): i = hash(key)', 'while slot[i] ไม่ว่าง:', '  if slot[i] == key: เจอ', '  i = (i + 1) % 11', 'ช่องว่าง → ไม่พบ'];

  function insertSteps(key) {
    api.setCode(INS_CODE);
    var S = new DSA.Stepper();
    var i = ((key % M) + M) % M, start = i, probes = 0;
    add(S, i, 'is-active', 'insert(' + key + '): hash = ' + key + ' % ' + M + ' = ' + i, 0);
    while (slots[i] !== null && probes < M) {
      if (slots[i] === key) { add(S, i, 'is-found', key + ' มีอยู่แล้วที่ช่อง ' + i, 1); return S.steps; }
      add(S, i, 'is-bad', 'ช่อง ' + i + ' ไม่ว่าง (มี ' + slots[i] + ') → probe ไปช่องถัดไป', 2);
      i = (i + 1) % M; probes++;
    }
    if (probes >= M) { add(S, start, 'is-bad', 'ตารางเต็ม! ใส่ ' + key + ' ไม่ได้', 3); return S.steps; }
    slots[i] = key;
    add(S, i, 'is-active', '✅ ช่อง ' + i + ' ว่าง → ใส่ ' + key + (i === start ? '' : ' (probe ' + probes + ' ครั้ง)'), 3);
    return S.steps;
  }
  function searchSteps(key) {
    api.setCode(SR_CODE);
    var S = new DSA.Stepper();
    var i = ((key % M) + M) % M, probes = 0;
    add(S, i, 'is-active', 'search(' + key + '): hash = ' + i, 0);
    while (slots[i] !== null && probes < M) {
      if (slots[i] === key) { add(S, i, 'is-found', '✅ เจอ ' + key + ' ที่ช่อง ' + i, 2); return S.steps; }
      add(S, i, 'is-bad', 'ช่อง ' + i + ' มี ' + slots[i] + ' ≠ ' + key + ' → probe ต่อ', 3);
      i = (i + 1) % M; probes++;
    }
    add(S, i, 'is-active', '❌ เจอช่องว่าง (หรือวนครบ) → ไม่พบ ' + key, 4);
    return S.steps;
  }

  function show(desc) { var S = new DSA.Stepper(); add(S, -1, '', desc, -1); api.setSteps(S.steps); }
  document.getElementById('ho-insert').addEventListener('click', function () { var k = parseInt(document.getElementById('ho-key').value, 10); if (isNaN(k)) { alert('ใส่ key (ตัวเลข)'); return; } api.setSteps(insertSteps(k)); });
  document.getElementById('ho-search').addEventListener('click', function () { var k = parseInt(document.getElementById('ho-key').value, 10); if (isNaN(k)) { alert('ใส่ key'); return; } api.setSteps(searchSteps(k)); });
  document.getElementById('ho-reset').addEventListener('click', function () { slots = new Array(M).fill(null); api.setCode([]); show('ตารางว่าง (m=' + M + ') — ลอง insert (key 22,11,33 จะชนกันที่ช่อง 0)'); });

  [22, 1, 13, 11, 24].forEach(function (k) { var i = k % M; while (slots[i] !== null) i = (i + 1) % M; slots[i] = k; });
  api.setCode([]);
  show('ตารางตัวอย่าง (ใส่ 22,1,13,11,24 แล้ว — 11 ชนกับ 22 ที่ช่อง 0 จึง probe) ลอง insert 33');
})();
