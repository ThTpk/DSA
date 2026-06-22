/* Min-Heap — array-backed, แสดงเป็นต้นไม้ด้วย TreeViz
   insert (sift-up) / extract-min (sift-down) ; element ผูก id ให้เลื่อนตอนสลับ */
(function () {
  var snap = DSA.TreeViz.snap;
  var api = DSA.TreeViz.init({ topicId: 'heap' });

  var INSERT_CODE = [
    'insert(x): heap.push(x); i = size-1',     // 0
    'while i > 0 and heap[parent] > heap[i]:',  // 1
    '  swap(heap[i], heap[parent]); i = parent',// 2
  ];
  var EXTRACT_CODE = [
    'extractMin(): min = heap[0]',              // 0
    'heap[0] = heap.pop()   // ย้ายตัวท้ายมาราก', // 1
    'i = 0',                                    // 2
    'while มีลูกที่เล็กกว่า:',                    // 3
    '  swap กับลูกที่เล็กสุด; i = ลูกนั้น',         // 4
  ];

  var h = [], ids = [], eid = 0;
  function makeTree() {
    function build(i) {
      if (i >= h.length) return null;
      return { id: ids[i], value: h[i], left: build(2 * i + 1), right: build(2 * i + 2) };
    }
    return build(0);
  }
  function swap(i, j) {
    var t = h[i]; h[i] = h[j]; h[j] = t;
    var u = ids[i]; ids[i] = ids[j]; ids[j] = u;
  }

  // ---------- insert (sift-up) ----------
  function insertSteps(S, x) {
    function step(d, l, m) { S.add(snap(makeTree(), m || {}), d, { line: l }); }
    h.push(x); ids.push(++eid);
    var i = h.length - 1;
    step('เพิ่ม ' + x + ' ที่ตำแหน่งท้าย (index ' + i + ')', 0, { found: [ids[i]] });
    while (i > 0) {
      var p = Math.floor((i - 1) / 2);
      step('เทียบกับพ่อ heap[' + p + ']=' + h[p] + ' กับ ' + h[i], 1, { compare: [ids[i], ids[p]] });
      if (h[p] > h[i]) {
        swap(i, p);
        step('พ่อมากกว่า → sift-up สลับขึ้นไป', 2, { compare: [ids[p]] });
        i = p;
      } else {
        step('พ่อ ≤ ตัวเรา → หยุด ตำแหน่งถูกต้องแล้ว', 1, { found: [ids[i]] });
        return;
      }
    }
    step('ขึ้นถึงรากแล้ว', 1, { found: [ids[0]] });
  }

  // ---------- extract-min (sift-down) ----------
  function extractSteps(S) {
    function step(d, l, m) { S.add(snap(makeTree(), m || {}), d, { line: l }); }
    if (h.length === 0) { step('heap ว่าง ไม่มีอะไรให้ดึง', 0, {}); return; }
    var min = h[0];
    step('ดึงค่าน้อยสุด (ราก) = ' + min, 0, { compare: [ids[0]] });
    var last = h.length - 1;
    h[0] = h[last]; ids[0] = ids[last]; h.pop(); ids.pop();
    if (h.length === 0) { step('นำ ' + min + ' ออก heap ว่างแล้ว', 1, {}); return; }
    step('ย้ายตัวสุดท้าย ' + h[0] + ' ขึ้นมาเป็นราก', 1, { current: [ids[0]] });
    var i = 0;
    while (true) {
      var l = 2 * i + 1, r = 2 * i + 2, sm = i;
      if (l < h.length && h[l] < h[sm]) sm = l;
      if (r < h.length && h[r] < h[sm]) sm = r;
      if (sm === i) { step('ไม่มีลูกที่เล็กกว่า → หยุด', 3, { found: [ids[i]] }); break; }
      step('ลูกที่เล็กสุดคือ ' + h[sm] + ' < ' + h[i] + ' → ต้องจมลง', 3, { compare: [ids[i], ids[sm]] });
      swap(i, sm);
      step('sift-down สลับลงไป', 4, { compare: [ids[sm]] });
      i = sm;
    }
  }

  // ---------- build ----------
  function buildSteps(values) {
    api.setCode(INSERT_CODE);
    h = []; ids = []; eid = 0;
    var S = new DSA.Stepper();
    S.add(snap(null, {}), 'เริ่มจาก heap ว่าง', { line: -1 });
    values.forEach(function (v) { insertSteps(S, v); });
    S.add(snap(makeTree(), {}), '✅ สร้าง Min-Heap เสร็จ (ค่าน้อยสุด ' + h[0] + ' อยู่ที่ราก)', { line: -1 });
    return S.steps;
  }
  function insertOneSteps(x) { api.setCode(INSERT_CODE); var S = new DSA.Stepper(); insertSteps(S, x); S.add(snap(makeTree(), {}), '✅ insert ' + x + ' เสร็จ', { line: -1 }); return S.steps; }
  function extractOneSteps() { api.setCode(EXTRACT_CODE); var S = new DSA.Stepper(); extractSteps(S); S.add(snap(makeTree(), {}), '✅ extract-min เสร็จ', { line: -1 }); return S.steps; }

  // ---------- inputs ----------
  var valuesEl = document.getElementById('hp-values');
  var valEl = document.getElementById('hp-val');
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 15); }
  function build(values) { valuesEl.value = values.join(', '); api.setSteps(buildSteps(values)); }

  document.getElementById('hp-build').addEventListener('click', function () { var v = parseList(valuesEl.value); if (!v.length) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } build(v); });
  document.getElementById('hp-random').addEventListener('click', function () { var a = []; for (var i = 0; i < 7; i++) a.push(2 + Math.floor(Math.random() * 98)); build(a); });
  document.getElementById('hp-insert').addEventListener('click', function () { var x = Number(valEl.value); if (isNaN(x)) { alert('ใส่ค่าที่จะเพิ่ม'); return; } api.setSteps(insertOneSteps(x)); });
  document.getElementById('hp-extract').addEventListener('click', function () { api.setSteps(extractOneSteps()); });

  build([50, 30, 70, 20, 40, 60, 80]);
})();
