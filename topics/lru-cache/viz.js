/* LRU Cache — DLL เรียงตามความใหม่ (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'lru-cache', vh: 200 });
  var CAP = 4, W = 86, GAP = 16, CH = 56, Y = 80, VW = api.VW;
  var list = []; // front = MRU ; {key, val}
  function startX(n) { return Math.max(20, (VW - (n * W + (n - 1) * GAP)) / 2); }
  function X(i, n) { return startX(n) + i * (W + GAP); }

  function model(hiKey, cls) {
    var n = list.length, cells = [], arrows = [];
    list.forEach(function (e, i) {
      cells.push({ id: 'k' + e.key, x: X(i, n), y: Y, w: W, h: CH, text: e.key + ':' + e.val, sub: (i === 0 ? 'MRU' : (i === n - 1 && n > 1 ? 'LRU' : null)), cls: (e.key === hiKey ? cls : '') });
      if (i < n - 1) arrows.push({ id: 'a' + i, x1: X(i, n) + W, y1: Y + CH / 2, x2: X(i + 1, n), y2: Y + CH / 2 });
    });
    return { cells: cells, arrows: arrows };
  }
  function add(S, hiKey, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hiKey, cls)), desc, { line: line }); }

  var CODE = ['get/put: ถ้ามี key → ย้ายไปหน้าสุด (MRU)', 'put: ถ้าใหม่ → ใส่หน้าสุด', '  ถ้าเกินความจุ → ลบตัวท้าย (LRU)'];

  function idx(k) { for (var i = 0; i < list.length; i++) if (list[i].key === k) return i; return -1; }

  function putSteps(k, v) {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var i = idx(k);
    if (i !== -1) {
      list[i].val = v;
      add(S, k, 'is-active', 'มี key "' + k + '" อยู่แล้ว → อัปเดตค่า = ' + v + ' และย้ายไปหน้าสุด', 0);
      var e = list.splice(i, 1)[0]; list.unshift(e);
      add(S, k, 'is-active', '"' + k + '" เป็น MRU แล้ว', 0);
    } else {
      list.unshift({ key: k, val: v });
      add(S, k, 'is-new', 'key ใหม่ "' + k + '" → ใส่ไว้หน้าสุด (MRU)', 1);
      if (list.length > CAP) {
        var evicted = list[list.length - 1];
        add(S, evicted.key, 'is-bad', 'เกินความจุ (' + CAP + ') → ไล่ตัวท้าย "' + evicted.key + '" (LRU) ออก', 2);
        list.pop();
        add(S, null, '', 'ลบ "' + evicted.key + '" แล้ว', 2);
      }
    }
    return S.steps;
  }
  function getSteps(k) {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var i = idx(k);
    if (i === -1) { add(S, null, '', 'get("' + k + '") → ❌ ไม่มีในแคช (miss)', -1); return S.steps; }
    add(S, k, 'is-active', 'get("' + k + '") → เจอ! ค่า = ' + list[i].val + ' → ย้ายไปหน้าสุด (MRU)', 0);
    var e = list.splice(i, 1)[0]; list.unshift(e);
    add(S, k, 'is-active', '"' + k + '" เป็น MRU แล้ว (ใช้ล่าสุด)', 0);
    return S.steps;
  }

  function show(desc) { var S = new DSA.Stepper(); add(S, null, '', desc, -1); api.setSteps(S.steps); }
  document.getElementById('lru-put').addEventListener('click', function () { var k = (document.getElementById('lru-k').value || '').trim(), v = (document.getElementById('lru-v').value || '').trim(); if (!k || !v) { alert('ใส่ key และ value'); return; } api.setSteps(putSteps(k, v)); });
  document.getElementById('lru-get').addEventListener('click', function () { var k = (document.getElementById('lru-k').value || '').trim(); if (!k) { alert('ใส่ key'); return; } api.setSteps(getSteps(k)); });
  document.getElementById('lru-reset').addEventListener('click', function () { list = []; api.setCode([]); show('แคชว่าง (ความจุ ' + CAP + ') — ลอง put(k,v)'); });

  list = [{ key: 'C', val: 3 }, { key: 'B', val: 2 }, { key: 'A', val: 1 }];
  api.setCode([]);
  show('แคชตัวอย่าง (ใส่ A,B,C ตามลำดับ → C ใหม่สุด) ลอง get/put ดูการเลื่อน');
})();
