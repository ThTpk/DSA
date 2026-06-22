/* Bloom Filter — bit array + k=3 hash (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'bloom-filter', vh: 200 });
  var M = 16, K = 3, W = 42, GAP = 4, CH = 46, Y = 90, VW = api.VW;
  function startX() { return (VW - (M * W + (M - 1) * GAP)) / 2; }
  function X(i) { return startX() + i * (W + GAP); }

  var bits = new Array(M).fill(0), added = [];
  var SEEDS = [7, 13, 1009];
  function hashes(word) {
    return SEEDS.map(function (seed) { var x = seed; for (var i = 0; i < word.length; i++) x = (x * 31 + word.charCodeAt(i)) % 100003; return x % M; });
  }

  function model(hi, cls) {
    var cells = [];
    for (var i = 0; i < M; i++) cells.push({ id: 'b' + i, x: X(i), y: Y, w: W, h: CH, text: bits[i], sub: i, cls: (hi && hi.indexOf(i) !== -1) ? cls : (bits[i] ? 'is-found' : '') });
    return { cells: cells };
  }
  function add(S, hi, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hi, cls)), desc, { line: line }); }

  var ADD_CODE = ['add(x):', '  for i = 1..k:  bits[hashᵢ(x)] = 1'];
  var Q_CODE = ['query(x):', '  for i = 1..k:', '    if bits[hashᵢ(x)] == 0: return "ไม่มีแน่นอน"', '  return "อาจมี" (อาจ false positive)'];

  function addSteps(word) {
    api.setCode(ADD_CODE);
    var S = new DSA.Stepper();
    var hs = hashes(word);
    add(S, hs.slice(), 'is-active', 'add("' + word + '"): hash ได้ตำแหน่ง [' + hs.join(', ') + '] → ตั้งบิตเป็น 1', 1);
    hs.forEach(function (h) { bits[h] = 1; });
    if (added.indexOf(word) === -1) added.push(word);
    add(S, hs.slice(), 'is-active', '✅ เพิ่ม "' + word + '" แล้ว (ตั้งบิต ' + hs.join(', ') + ')', 1);
    document.getElementById('bf-added').textContent = 'เพิ่มแล้ว: ' + (added.join(', ') || '—');
    return S.steps;
  }
  function querySteps(word) {
    api.setCode(Q_CODE);
    var S = new DSA.Stepper();
    var hs = hashes(word);
    add(S, hs.slice(), 'is-active', 'query("' + word + '"): ต้องเช็กบิตตำแหน่ง [' + hs.join(', ') + ']', 1);
    var allSet = true;
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      if (bits[h] === 0) { allSet = false; add(S, [h], 'is-bad', 'บิตตำแหน่ง ' + h + ' = 0 → ❌ "' + word + '" ไม่มีแน่นอน', 2); break; }
      add(S, [h], 'is-active', 'บิตตำแหน่ง ' + h + ' = 1 ✓ เช็กต่อ', 1);
    }
    if (allSet) add(S, hs.slice(), 'is-found', '⚠️ ทุกบิตเป็น 1 → "' + word + '" อาจมี (ถ้าไม่เคยเพิ่ม = false positive)', 3);
    return S.steps;
  }

  function clean(s) { return (s || '').toLowerCase().replace(/[^a-z]/g, ''); }
  function show(desc) { var S = new DSA.Stepper(); add(S, [], '', desc, -1); api.setSteps(S.steps); }
  document.getElementById('bf-add').addEventListener('click', function () { var w = clean(document.getElementById('bf-word').value); if (!w) { alert('ใส่คำ a-z'); return; } api.setSteps(addSteps(w)); });
  document.getElementById('bf-query').addEventListener('click', function () { var w = clean(document.getElementById('bf-word').value); if (!w) { alert('ใส่คำ a-z'); return; } api.setSteps(querySteps(w)); });
  document.getElementById('bf-reset').addEventListener('click', function () { bits = new Array(M).fill(0); added = []; document.getElementById('bf-added').textContent = 'เพิ่มแล้ว: —'; api.setCode([]); show('ล้างบิตทั้งหมดแล้ว — ลอง add คำดู'); });

  // เริ่มต้น: เพิ่มตัวอย่างไว้
  ['cat', 'dog', 'bird'].forEach(function (w) { hashes(w).forEach(function (h) { bits[h] = 1; }); added.push(w); });
  document.getElementById('bf-added').textContent = 'เพิ่มแล้ว: ' + added.join(', ');
  api.setCode([]);
  show('Bloom Filter (m=' + M + ' บิต, k=' + K + ' hash) — เพิ่ม cat/dog/bird ไว้แล้ว ลอง query ดู');
})();
