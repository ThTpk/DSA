/* Hash Table (chaining) — hash(key)=key%m ; insert/search เห็น collision เป็น chain (m ปรับได้) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'hash-table', vh: 470 });
  var M = 7;
  var BX = 50, BW = 50, BH = 40, ROW = 44, BY = 28;
  var NW = 50, NH = 40, GAP = 26;
  function layout() { ROW = Math.min(44, Math.floor((470 - BY - BH - 10) / Math.max(1, M - 1))); }
  function Yi(i) { return BY + i * ROW; }
  function NX(j) { return BX + BW + GAP + j * (NW + GAP); }

  var buckets = [], kid = 0;
  function reset() { buckets = []; for (var i = 0; i < M; i++) buckets.push([]); }
  layout(); reset();

  function model(bHi, bCls, nHi, nCls) {
    var cells = [], arrows = [];
    for (var i = 0; i < M; i++) {
      cells.push({ id: 'b' + i, x: BX, y: Yi(i), w: BW, h: BH, text: i, sub: null, cls: 'bucket' + (i === bHi ? ' ' + bCls : '') });
      var ch = buckets[i];
      for (var j = 0; j < ch.length; j++) {
        cells.push({ id: 'k' + ch[j].id, x: NX(j), y: Yi(i), w: NW, h: NH, text: ch[j].key, sub: null, cls: (ch[j].id === nHi ? nCls : '') });
        if (j === 0) arrows.push({ id: 'ab' + i, x1: BX + BW, y1: Yi(i) + BH / 2, x2: NX(0), y2: Yi(i) + NH / 2 });
        else arrows.push({ id: 'a' + ch[j].id, x1: NX(j - 1) + NW, y1: Yi(i) + NH / 2, x2: NX(j), y2: Yi(i) + NH / 2 });
      }
    }
    return { cells: cells, arrows: arrows, labels: [{ id: 'ttl', x: BX + BW / 2, y: BY - 10, text: 'bucket' }] };
  }
  function add(S, bHi, bCls, nHi, nCls, desc, line) { S.add(DSA.NodeViz.snap(model(bHi, bCls, nHi, nCls)), desc, { line: line }); }

  function insertCode() { return ['insert(key):', '  i = hash(key) = key % ' + M, '  ต่อ key เข้า chain ของ bucket[i]', '  (bucket ไม่ว่าง = collision → ต่อใน chain)']; }
  function searchCode() { return ['search(key):', '  i = hash(key) = key % ' + M, '  ไล่ chain ของ bucket[i] เทียบทีละตัว', '  เจอ → return ; ถึงท้าย chain → ไม่พบ']; }

  function insertSteps(S, key) {
    var i = ((key % M) + M) % M;
    add(S, i, 'is-active', null, null, 'hash(' + key + ') = ' + key + ' % ' + M + ' = ' + i + ' → ไปที่ bucket ' + i, 1);
    var collision = buckets[i].length > 0;
    var node = { id: ++kid, key: key };
    buckets[i].push(node);
    add(S, i, 'is-active', node.id, 'is-new',
      collision ? 'bucket ' + i + ' มีของอยู่แล้ว = collision → ต่อท้าย chain' : 'bucket ' + i + ' ว่าง → ใส่ ' + key + ' ได้เลย',
      collision ? 3 : 2);
  }
  function searchSteps(key) {
    api.setCode(searchCode());
    var S = new DSA.Stepper();
    var i = ((key % M) + M) % M;
    add(S, i, 'is-active', null, null, 'hash(' + key + ') = ' + i + ' → ไปที่ bucket ' + i, 1);
    var ch = buckets[i];
    for (var j = 0; j < ch.length; j++) {
      add(S, i, '', ch[j].id, 'is-active', 'เทียบ ' + ch[j].key + ' กับ ' + key, 2);
      if (ch[j].key === key) { add(S, i, '', ch[j].id, 'is-found', '✅ เจอ ' + key + ' ใน bucket ' + i, 3); return S.steps; }
    }
    add(S, i, 'is-active', null, null, '❌ ไล่จบ chain ของ bucket ' + i + ' แล้ว ไม่พบ ' + key, 3);
    return S.steps;
  }
  function insertOne(key) { api.setCode(insertCode()); var S = new DSA.Stepper(); insertSteps(S, key); S.add(DSA.NodeViz.snap(model(-1, '', null, null)), '✅ insert ' + key + ' เสร็จ', { line: -1 }); return S.steps; }
  function buildSteps(keys) {
    api.setCode(insertCode()); reset();
    var S = new DSA.Stepper();
    S.add(DSA.NodeViz.snap(model(-1, '', null, null)), 'ตารางว่าง (' + M + ' buckets)', { line: 0 });
    keys.forEach(function (k) { insertSteps(S, k); });
    S.add(DSA.NodeViz.snap(model(-1, '', null, null)), '✅ ใส่ครบ ' + keys.length + ' key (สังเกต collision = chain ยาว)', { line: -1 });
    return S.steps;
  }

  var keysEl = document.getElementById('ht-keys');
  var keyEl = document.getElementById('ht-key');
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 12); }
  function build(keys) { keysEl.value = keys.join(', '); api.setSteps(buildSteps(keys)); }

  document.getElementById('ht-build').addEventListener('click', function () { var v = parseList(keysEl.value); if (!v.length) { alert('ใส่ key อย่างน้อย 1 ตัว'); return; } build(v); });
  document.getElementById('ht-random').addEventListener('click', function () { var a = []; for (var i = 0; i < 6; i++) a.push(Math.floor(Math.random() * 50)); build(a); });
  document.getElementById('ht-insert').addEventListener('click', function () { var k = Number(keyEl.value); if (isNaN(k)) { alert('ใส่ key'); return; } api.setSteps(insertOne(k)); });
  document.getElementById('ht-search').addEventListener('click', function () { var k = Number(keyEl.value); if (isNaN(k)) { alert('ใส่ key'); return; } api.setSteps(searchSteps(k)); });
  document.getElementById('ht-size').addEventListener('change', function () {
    M = parseInt(document.getElementById('ht-size').value, 10) || 7; layout();
    var v = parseList(keysEl.value); if (!v.length) v = [10, 17, 3, 24, 8];
    build(v);
  });

  build([10, 17, 3, 24, 8]);
})();
