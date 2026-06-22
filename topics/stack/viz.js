/* Stack — LIFO แนวตั้ง push/pop ที่ปลายบน */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'stack', vh: 380 });
  var CW = 90, CH = 46, GAP = 8;
  var VW = api.VW, VH = api.VH;
  var CX = (VW - CW) / 2;
  var BASE = VH - CH - 40;            // y ของ index 0 (ก้นสแตก)
  function Y(i) { return BASE - i * (CH + GAP); }

  var PUSH_CODE = ['push(x):', '  top = top + 1', '  stack[top] = x   // O(1) เพิ่มที่ปลายบน'];
  var POP_CODE  = ['pop():', '  x = stack[top]', '  top = top - 1   // O(1) เอาออกจากปลายบน', '  return x'];

  var st = [], ids = [], eid = 0;
  function model(hi, cls) {
    var cells = st.map(function (v, i) {
      return { id: 'e' + ids[i], x: CX, y: Y(i), w: CW, h: CH, text: v, sub: null,
        cls: (hi && hi.indexOf(i) !== -1) ? cls : '' };
    });
    var labels = [];
    if (st.length) labels.push({ id: 'top', x: CX + CW + 16, y: Y(st.length - 1) + CH / 2 + 4, text: '← TOP', anchor: 'start', cls: 'is-accent' });
    labels.push({ id: 'base', x: CX + CW / 2, y: BASE + CH + 22, text: 'ก้นสแตก (bottom)', anchor: 'middle' });
    return { cells: cells, labels: labels };
  }
  function add(S, hi, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hi, cls)), desc, { line: line }); }

  function pushSteps(x) {
    api.setCode(PUSH_CODE);
    var S = new DSA.Stepper();
    st.push(x); ids.push(++eid);
    add(S, [st.length - 1], 'is-new', 'push ' + x + ' → วางไว้บนสุด (top)', 2);
    return S.steps;
  }
  function popSteps() {
    api.setCode(POP_CODE);
    var S = new DSA.Stepper();
    if (!st.length) { add(S, [], '', 'สแตกว่าง (stack underflow) — ไม่มีอะไรให้ pop', 0); return S.steps; }
    var top = st.length - 1, v = st[top];
    add(S, [top], 'is-active', 'pop → อ่านค่าบนสุด = ' + v, 1);
    st.pop(); ids.pop();
    add(S, [], '', 'นำ ' + v + ' ออกจากสแตกแล้ว (top ลดลง 1)', 2);
    return S.steps;
  }

  var valEl = document.getElementById('st-val');
  document.getElementById('st-push').addEventListener('click', function () { var x = Number(valEl.value); if (isNaN(x)) { alert('ใส่ค่าที่จะ push'); return; } api.setSteps(pushSteps(x)); valEl.value = ''; });
  document.getElementById('st-pop').addEventListener('click', function () { api.setSteps(popSteps()); });
  document.getElementById('st-reset').addEventListener('click', function () { st = []; ids = []; api.setCode([]); var S = new DSA.Stepper(); add(S, [], '', 'สแตกว่าง — ลอง push ค่าดู', -1); api.setSteps(S.steps); });

  // เริ่มต้น: push ตัวอย่างไม่กี่ตัว
  st = [10, 20, 30]; ids = [++eid, ++eid, ++eid];
  api.setCode([]);
  var S0 = new DSA.Stepper(); add(S0, [], '', 'สแตกตัวอย่าง (เข้าตามลำดับ 10,20,30 → 30 อยู่บนสุด)', -1);
  api.setSteps(S0.steps);
})();
