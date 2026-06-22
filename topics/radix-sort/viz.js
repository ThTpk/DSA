/* Radix Sort (LSD) — เรียงทีละหลักด้วยถัง 0-9 (NodeViz, แท่งเลื่อนตามลำดับใหม่) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'radix-sort', vh: 200 });
  var W = 72, GAP = 10, CH = 52, Y = 80, VW = api.VW;
  function startX(len) { return (VW - (len * W + (len - 1) * GAP)) / 2; }
  function digit(v, d) { return Math.floor(v / Math.pow(10, d)) % 10; }
  var PLACE = ['หน่วย', 'สิบ', 'ร้อย', 'พัน'];

  var arr = []; // {id, v}
  function model(d, highlight) {
    var n = arr.length, cells = [];
    arr.forEach(function (el, i) {
      cells.push({ id: 'e' + el.id, x: startX(n) + i * (W + GAP), y: Y, w: W, h: CH, text: el.v,
        sub: (d != null ? 'หลัก:' + digit(el.v, d) : null), cls: (highlight ? 'is-active' : '') });
    });
    return { cells: cells };
  }
  function add(S, d, hl, desc, line) { S.add(DSA.NodeViz.snap(model(d, hl)), desc, { line: line }); }

  var CODE = ['หาจำนวนหลักของค่าสูงสุด', 'for แต่ละหลัก (หน่วย→สิบ→ร้อย):', '  แจกเข้าถัง 0-9 ตามเลขหลักนั้น (เสถียร)', '  เก็บกลับจากถัง 0→9 ได้ลำดับใหม่'];

  function build(values) {
    api.setCode(CODE);
    arr = values.map(function (v, i) { return { id: i + 1, v: v }; });
    var maxV = Math.max.apply(null, values);
    var maxD = String(maxV).length;
    var S = new DSA.Stepper();
    add(S, null, false, 'เริ่ม: ค่าสูงสุด ' + maxV + ' มี ' + maxD + ' หลัก → ทำ ' + maxD + ' รอบ', 0);
    for (var d = 0; d < maxD; d++) {
      add(S, d, true, 'รอบที่ ' + (d + 1) + ': ดูเลขหลัก' + PLACE[d] + ' ของแต่ละตัว (ตัวเลขใต้กล่อง)', 1);
      var buckets = []; for (var b = 0; b < 10; b++) buckets.push([]);
      arr.forEach(function (el) { buckets[digit(el.v, d)].push(el); });
      var merged = []; for (var b2 = 0; b2 < 10; b2++) merged = merged.concat(buckets[b2]);
      arr = merged;
      add(S, d, false, 'แจกเข้าถัง 0-9 ตามหลัก' + PLACE[d] + ' แล้วเก็บกลับ → ลำดับใหม่: [' + arr.map(function (e) { return e.v; }).join(', ') + ']', 3);
    }
    add(S, null, false, '✅ เรียงเสร็จ: [' + arr.map(function (e) { return e.v; }).join(', ') + ']', -1);
    return S.steps;
  }

  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x) && x >= 0 && x < 10000; }).slice(0, 8); }
  var valuesEl = document.getElementById('rx-values');
  function run() { var v = parseList(valuesEl.value); if (v.length < 1) { alert('ใส่จำนวนเต็มบวก'); return; } valuesEl.value = v.join(', '); api.setSteps(build(v)); }
  document.getElementById('rx-run').addEventListener('click', run);
  document.getElementById('rx-random').addEventListener('click', function () { var a = []; for (var i = 0; i < 7; i++) a.push(Math.floor(Math.random() * 900) + 1); valuesEl.value = a.join(', '); run(); });
  run();
})();
