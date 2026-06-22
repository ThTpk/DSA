/* Linked List (singly) — node + pointer (ลูกศร) ; แทรก/ลบ/ค้นหา */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'linked-list', vh: 230 });
  var NW = 66, NH = 48, GAP = 46, Y = 80, SX = 34;
  var VW = api.VW;
  function X(i) { return SX + i * (NW + GAP); }

  function model(hi, cls) {
    var n = list.length;
    var cells = list.map(function (nd, i) {
      return { id: 'n' + nd.id, x: X(i), y: Y, w: NW, h: NH, text: nd.value, sub: (i === 0 ? 'head' : null),
        cls: (hi && hi.indexOf(i) !== -1) ? cls : '' };
    });
    var arrows = [], labels = [];
    for (var i = 0; i < n - 1; i++) arrows.push({ id: 'a' + i, x1: X(i) + NW, y1: Y + NH / 2, x2: X(i + 1), y2: Y + NH / 2 });
    if (n) {
      arrows.push({ id: 'anull', x1: X(n - 1) + NW, y1: Y + NH / 2, x2: X(n - 1) + NW + GAP - 6, y2: Y + NH / 2 });
      labels.push({ id: 'null', x: X(n - 1) + NW + GAP, y: Y + NH / 2 + 4, text: 'null', anchor: 'start' });
    } else {
      labels.push({ id: 'empty', x: VW / 2, y: Y + NH / 2, text: 'head → null (ว่าง)' });
    }
    return { cells: cells, arrows: arrows, labels: labels };
  }
  function add(S, hi, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hi, cls)), desc, { line: line }); }

  var list = [], nid = 0;

  var SEARCH_CODE = ['search(x): curr = head', 'while curr != null:', '  if curr.value == x: return curr', '  curr = curr.next   // ไล่ทีละโหนด', 'return ไม่พบ'];
  var INSHEAD_CODE = ['insertHead(x):', '  node = new Node(x)', '  node.next = head', '  head = node   // O(1)'];
  var INSAT_CODE = ['insertAt(i, x): ไล่ไปโหนดที่ i-1', '  node.next = prev.next', '  prev.next = node   // เปลี่ยน pointer'];
  var DELAT_CODE = ['deleteAt(i): ไล่ไปโหนดที่ i-1', '  prev.next = target.next   // ข้ามโหนด target', '  (ตัด target ออกจากสายโซ่)'];

  function searchSteps(x) {
    api.setCode(SEARCH_CODE);
    var S = new DSA.Stepper();
    if (!list.length) { add(S, [], '', 'list ว่าง', 0); return S.steps; }
    add(S, [0], 'is-highlight', 'เริ่มที่ head', 0);
    for (var i = 0; i < list.length; i++) {
      add(S, [i], 'is-active', 'ที่โหนด ' + list[i].value + ': เทียบกับ ' + x, 2);
      if (list[i].value === x) { add(S, [i], 'is-found', '✅ เจอ ' + x + ' ที่ตำแหน่ง ' + i, 2); return S.steps; }
      add(S, [i], 'is-highlight', 'ไม่ตรง → curr = curr.next', 3);
    }
    add(S, [], '', '❌ ถึง null แล้ว ไม่พบ ' + x, 4);
    return S.steps;
  }
  function insHeadSteps(x) {
    api.setCode(INSHEAD_CODE);
    var S = new DSA.Stepper();
    list.unshift({ id: ++nid, value: x });
    add(S, [0], 'is-new', 'สร้างโหนดใหม่ ' + x + ' ให้ next ชี้ head เดิม แล้ว head = โหนดใหม่ (O(1))', 3);
    return S.steps;
  }
  function insAtSteps(i, x) {
    api.setCode(INSAT_CODE);
    var S = new DSA.Stepper();
    if (i <= 0) return insHeadSteps(x);
    if (i > list.length) { add(S, [], '', 'ตำแหน่ง ' + i + ' เกินความยาว list', 0); return S.steps; }
    for (var k = 0; k < i; k++) add(S, [k], 'is-highlight', 'ไล่ไปโหนดก่อนหน้า (ตำแหน่ง ' + k + ')', 0);
    list.splice(i, 0, { id: ++nid, value: x });
    add(S, [i], 'is-new', 'แทรก ' + x + ' ที่ตำแหน่ง ' + i + ': เปลี่ยน pointer ให้ชี้โหนดใหม่', 2);
    return S.steps;
  }
  function delAtSteps(i) {
    api.setCode(DELAT_CODE);
    var S = new DSA.Stepper();
    if (i < 0 || i >= list.length) { add(S, [], '', 'ตำแหน่ง ' + i + ' อยู่นอกขอบเขต', 0); return S.steps; }
    for (var k = 0; k < i; k++) add(S, [k], 'is-highlight', 'ไล่ไปโหนดก่อนหน้า (ตำแหน่ง ' + k + ')', 0);
    add(S, [i], 'is-active', 'จะลบโหนดตำแหน่ง ' + i + ' (ค่า ' + list[i].value + ')', 1);
    list.splice(i, 1);
    add(S, [], '', 'เปลี่ยน pointer ให้ข้ามโหนดที่ลบ — โหนดถูกตัดออกจากสายโซ่', 1);
    return S.steps;
  }

  var valuesEl = document.getElementById('ll-values');
  var valEl = document.getElementById('ll-val');
  var idxEl = document.getElementById('ll-idx');
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 8); }
  function build(values) {
    valuesEl.value = values.join(', ');
    list = values.map(function (v) { return { id: ++nid, value: v }; });
    api.setCode([]);
    var S = new DSA.Stepper(); add(S, [], '', 'Linked List พร้อม (' + list.length + ' โหนด) — เลือกการทำงานด้านบน', -1);
    api.setSteps(S.steps);
  }

  document.getElementById('ll-build').addEventListener('click', function () { var v = parseList(valuesEl.value); if (!v.length) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } build(v); });
  document.getElementById('ll-random').addEventListener('click', function () { var a = []; for (var i = 0; i < 4; i++) a.push(2 + Math.floor(Math.random() * 98)); build(a); });
  document.getElementById('ll-inshead').addEventListener('click', function () { var x = Number(valEl.value); if (isNaN(x)) { alert('ใส่ค่า'); return; } api.setSteps(insHeadSteps(x)); });
  document.getElementById('ll-insat').addEventListener('click', function () { var x = Number(valEl.value), i = parseInt(idxEl.value, 10); if (isNaN(x) || isNaN(i)) { alert('ใส่ค่าและตำแหน่ง'); return; } api.setSteps(insAtSteps(i, x)); });
  document.getElementById('ll-delat').addEventListener('click', function () { var i = parseInt(idxEl.value, 10); if (isNaN(i)) { alert('ใส่ตำแหน่ง'); return; } api.setSteps(delAtSteps(i)); });
  document.getElementById('ll-search').addEventListener('click', function () { var x = Number(valEl.value); if (isNaN(x)) { alert('ใส่ค่าที่จะค้นหา'); return; } api.setSteps(searchSteps(x)); });

  build([10, 20, 30, 40]);
})();
