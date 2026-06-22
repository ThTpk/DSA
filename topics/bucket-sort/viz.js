/* Bucket Sort — โยนเข้าถังตามช่วงค่า → เรียงในถัง → ต่อกัน (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'bucket-sort', vh: 440 });
  var W = 44, GAP = 8, CH = 40, VW = api.VW;
  var NB = 5, RANGE = 20;            // 5 ถัง ช่วงละ 20 (ค่า 0-99)
  var YI = 34, YO = 392, BINY = [104, 162, 220, 278, 336];
  var BINX = 96;

  var vals = {};                      // id -> value
  var input = [], buckets = [], output = [];
  function bin(v) { return Math.min(NB - 1, Math.floor(v / RANGE)); }
  function rowStart(len) { return Math.max(BINX, (VW - (len * W + (len - 1) * GAP)) / 2); }

  function model(hiId, cls) {
    var cells = [], labels = [];
    function put(id, x, y) { cells.push({ id: 'e' + id, x: x, y: y, w: W, h: CH, text: vals[id], sub: null, cls: (id === hiId ? cls : (output.indexOf(id) !== -1 ? 'is-found' : '')) }); }
    var ix = rowStart(input.length);
    input.forEach(function (id, i) { put(id, ix + i * (W + GAP), YI); });
    for (var b = 0; b < NB; b++) {
      buckets[b].forEach(function (id, j) { put(id, BINX + j * (W + GAP), BINY[b]); });
      labels.push({ id: 'lb' + b, x: 12, y: BINY[b] + CH / 2 + 4, text: (b * RANGE) + '–' + (b * RANGE + RANGE - 1), anchor: 'start', cls: 'is-accent' });
    }
    var ox = rowStart(output.length || 1);
    output.forEach(function (id, k) { put(id, ox + k * (W + GAP), YO); });
    labels.push({ id: 'li', x: 12, y: YI + CH / 2 + 4, text: 'input', anchor: 'start' });
    labels.push({ id: 'lo', x: 12, y: YO + CH / 2 + 4, text: 'output', anchor: 'start' });
    return { cells: cells, labels: labels };
  }
  function add(S, hiId, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hiId, cls)), desc, { line: line }); }

  var CODE = ['1. แบ่ง k ถังตามช่วงค่า', '2. โยนแต่ละตัวเข้าถัง: bin = ⌊v / ช่วง⌋', '3. เรียงข้อมูลในแต่ละถัง', '4. ต่อถัง 0,1,2,... เข้าด้วยกัน = ผลลัพธ์'];

  function build(values) {
    api.setCode(CODE);
    vals = {}; input = []; buckets = []; output = [];
    for (var b = 0; b < NB; b++) buckets.push([]);
    values.forEach(function (v, i) { vals[i] = v; input.push(i); });
    var S = new DSA.Stepper();
    add(S, -1, '', 'เริ่ม: ' + values.length + ' ตัว, เตรียม ' + NB + ' ถัง (ช่วงละ ' + RANGE + ')', 0);

    // โยนเข้าถัง
    while (input.length) {
      var id = input.shift();
      var b = bin(vals[id]);
      buckets[b].push(id);
      add(S, id, 'is-active', 'โยน ' + vals[id] + ' → ถัง ' + b + ' (' + (b * RANGE) + '–' + (b * RANGE + RANGE - 1) + ')', 1);
    }
    // เรียงในแต่ละถัง
    for (var bb = 0; bb < NB; bb++) {
      if (buckets[bb].length > 1) {
        buckets[bb].sort(function (x, y) { return vals[x] - vals[y]; });
        add(S, -1, '', 'เรียงในถัง ' + bb + ': [' + buckets[bb].map(function (id) { return vals[id]; }).join(', ') + ']', 2);
      }
    }
    // ต่อกัน
    for (var c = 0; c < NB; c++) {
      for (var j = 0; j < buckets[c].length; j++) {
        var oid = buckets[c][j];
        output.push(oid);
        add(S, oid, 'is-active', 'ต่อจากถัง ' + c + ': ใส่ ' + vals[oid] + ' ลง output[' + (output.length - 1) + ']', 3);
      }
    }
    buckets = []; for (var z = 0; z < NB; z++) buckets.push([]); // เคลียร์ถัง (ของไป output หมด)
    add(S, -1, '', '✅ เรียงเสร็จ: [' + output.map(function (id) { return vals[id]; }).join(', ') + ']', -1);
    return S.steps;
  }

  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x) && x >= 0 && x <= 99; }).slice(0, 12); }
  var valuesEl = document.getElementById('bk-values');
  function run() { var v = parseList(valuesEl.value); if (v.length < 2) { alert('ใส่ค่า 0-99 อย่างน้อย 2 ตัว'); return; } valuesEl.value = v.join(', '); api.setSteps(build(v)); }
  document.getElementById('bk-run').addEventListener('click', run);
  document.getElementById('bk-random').addEventListener('click', function () { var a = []; for (var i = 0; i < 9; i++) a.push(Math.floor(Math.random() * 100)); valuesEl.value = a.join(', '); run(); });
  run();
})();
