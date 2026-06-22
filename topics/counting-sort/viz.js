/* Counting Sort — 3 แถว input / count / output (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'counting-sort', vh: 330 });
  var W = 48, GAP = 8, CH = 44, VW = api.VW;
  var YI = 56, YC = 162, YO = 268;

  var input = [], count = [], output = [], maxV = 0;
  function rowStart(len) { return (VW - (len * W + (len - 1) * GAP)) / 2; }
  function model(hiIn, hiCnt, hiOut, cls) {
    var cells = [], labels = [];
    var inX = rowStart(input.length);
    input.forEach(function (v, i) { cells.push({ id: 'in' + i, x: inX + i * (W + GAP), y: YI, w: W, h: CH, text: v, sub: null, cls: (hiIn === i ? cls : '') }); });
    var cntX = rowStart(maxV + 1);
    for (var v = 0; v <= maxV; v++) cells.push({ id: 'c' + v, x: cntX + v * (W + GAP), y: YC, w: W, h: CH, text: count[v], sub: 'ค่า ' + v, cls: (hiCnt === v ? cls : '') });
    var outX = rowStart(input.length);
    output.forEach(function (v, k) { cells.push({ id: 'o' + k, x: outX + k * (W + GAP), y: YO, w: W, h: CH, text: v, sub: null, cls: (hiOut === k ? 'is-new' : 'is-found') }); });
    labels.push({ id: 'li', x: 12, y: YI + CH / 2 + 4, text: 'input', anchor: 'start' });
    labels.push({ id: 'lc', x: 12, y: YC + CH / 2 + 4, text: 'count', anchor: 'start' });
    labels.push({ id: 'lo', x: 12, y: YO + CH / 2 + 4, text: 'output', anchor: 'start' });
    return { cells: cells, labels: labels };
  }
  function add(S, hiIn, hiCnt, hiOut, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hiIn, hiCnt, hiOut, cls)), desc, { line: line }); }

  var CODE = ['นับจำนวนแต่ละค่า: count[x]++', 'ไล่ค่า v = 0..max:', '  ใส่ v ลง output ตามจำนวน count[v]'];

  function build(values) {
    api.setCode(CODE);
    input = values.slice(); maxV = Math.max.apply(null, input); count = new Array(maxV + 1).fill(0); output = [];
    var S = new DSA.Stepper();
    add(S, -1, -1, -1, '', 'เริ่ม: เตรียม count[] ขนาด ' + (maxV + 1) + ' (ค่า 0..' + maxV + ') เป็น 0', -1);
    for (var i = 0; i < input.length; i++) {
      count[input[i]]++;
      add(S, i, input[i], -1, 'is-active', 'นับ: input[' + i + '] = ' + input[i] + ' → count[' + input[i] + '] = ' + count[input[i]], 0);
    }
    add(S, -1, -1, -1, '', 'นับครบแล้ว → ไล่ค่าจากน้อยไปมาก เติม output', 1);
    for (var v = 0; v <= maxV; v++) {
      for (var c = 0; c < count[v]; c++) {
        output.push(v);
        add(S, -1, v, output.length - 1, 'is-active', 'ค่า ' + v + ' มี count=' + count[v] + ' → ใส่ลง output[' + (output.length - 1) + ']', 2);
      }
    }
    add(S, -1, -1, -1, '', '✅ เรียงเสร็จ: [' + output.join(', ') + ']', -1);
    return S.steps;
  }

  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x) && x >= 0 && x <= 15; }).slice(0, 9); }
  var valuesEl = document.getElementById('cs-values');
  function run() { var v = parseList(valuesEl.value); if (v.length < 1) { alert('ใส่จำนวนเต็ม 0-15 อย่างน้อย 1 ตัว'); return; } valuesEl.value = v.join(', '); api.setSteps(build(v)); }
  document.getElementById('cs-run').addEventListener('click', run);
  document.getElementById('cs-random').addEventListener('click', function () { var a = []; for (var i = 0; i < 7; i++) a.push(Math.floor(Math.random() * 10)); valuesEl.value = a.join(', '); run(); });
  run();
})();
