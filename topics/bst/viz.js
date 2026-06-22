/* Binary Search Tree — insert / search แบบ recursive พร้อม call stack
   ต้นไม้เก็บไว้ใน closure (tree) คงอยู่ข้ามการกระทำ; แต่ละ snapshot บรรจุทั้งต้นไม้ */
(function () {
  var snap = DSA.TreeViz.snap;
  var api = DSA.TreeViz.init({ topicId: 'bst', showStack: true });

  var INSERT_CODE = [
    'insert(node, x):',                    // 0
    '  if node == null → สร้างโหนดใหม่',    // 1
    '  if x < node.value → ไปทางซ้าย',      // 2
    '  if x > node.value → ไปทางขวา',       // 3
    '  else → มีค่านี้แล้ว (ไม่เพิ่มซ้ำ)',    // 4
  ];
  var SEARCH_CODE = [
    'search(node, x):',                    // 0
    '  if node == null → ไม่พบ',            // 1
    '  if x == node.value → เจอ',           // 2
    '  if x < node.value → ไปทางซ้าย',      // 3
    '  else → ไปทางขวา',                    // 4
  ];

  var tree = null, nid = 0, gframe = 0;
  function newNode(v) { return { id: ++nid, value: v, left: null, right: null }; }

  // ---------- INSERT ----------
  function insertSteps(S, x, stack) {
    function step(desc, line, marks) {
      marks = marks || {}; marks.stack = stack;
      S.add(snap(tree, marks), desc, { line: line });
    }
    step('แทรกค่า ' + x + ' : เริ่มที่ราก', 0, {});
    if (tree == null) { tree = newNode(x); step('ต้นไม้ว่าง → สร้างเป็นราก', 1, { found: [tree.id] }); return; }

    var cur = tree;
    while (true) {
      stack.push({ id: 'f' + (++gframe), title: 'insert(' + cur.value + ')', phase: 'เทียบ' });
      step('ที่โหนด ' + cur.value + ': เทียบ ' + x + ' กับ ' + cur.value, 0, { current: [cur.id], compare: [cur.id] });
      if (x < cur.value) {
        if (cur.left == null) { cur.left = newNode(x); step(x + ' < ' + cur.value + ' → ไปซ้าย (ว่าง) วางโหนดใหม่', 1, { found: [cur.left.id] }); break; }
        step(x + ' < ' + cur.value + ' → ไปทางซ้าย', 2, { current: [cur.left.id] }); cur = cur.left;
      } else if (x > cur.value) {
        if (cur.right == null) { cur.right = newNode(x); step(x + ' > ' + cur.value + ' → ไปขวา (ว่าง) วางโหนดใหม่', 1, { found: [cur.right.id] }); break; }
        step(x + ' > ' + cur.value + ' → ไปทางขวา', 3, { current: [cur.right.id] }); cur = cur.right;
      } else {
        step(x + ' มีอยู่แล้วในต้นไม้ ไม่เพิ่มซ้ำ', 4, { found: [cur.id] }); break;
      }
    }
  }

  // ---------- SEARCH ----------
  function searchSteps(x) {
    api.setCode(SEARCH_CODE);
    var S = new DSA.Stepper();
    var stack = [], visited = [];
    function step(desc, line, marks) {
      marks = marks || {}; marks.stack = stack; marks.visited = visited.slice();
      S.add(snap(tree, marks), desc, { line: line });
    }
    if (tree == null) { S.add(snap(tree, {}), 'ต้นไม้ว่าง ไม่มีอะไรให้ค้นหา', { line: 1 }); return S.steps; }

    step('ค้นหา ' + x + ' : เริ่มที่ราก', 0, {});
    var cur = tree;
    while (cur != null) {
      stack.push({ id: 'f' + (++gframe), title: 'search(' + cur.value + ')', phase: 'เทียบ' });
      step('ที่โหนด ' + cur.value + ': เทียบ ' + x + ' กับ ' + cur.value, 2, { current: [cur.id], compare: [cur.id] });
      if (x === cur.value) { step('✅ เจอ ' + x + ' !', 2, { found: [cur.id] }); return S.steps; }
      visited.push(cur.id);
      if (x < cur.value) { step(x + ' < ' + cur.value + ' → ไปทางซ้าย', 3, { current: cur.left ? [cur.left.id] : [] }); cur = cur.left; }
      else { step(x + ' > ' + cur.value + ' → ไปทางขวา', 4, { current: cur.right ? [cur.right.id] : [] }); cur = cur.right; }
    }
    step('❌ ถึงทางตัน (null) ไม่พบ ' + x, 1, {});
    return S.steps;
  }

  // ---------- BUILD ----------
  function buildSteps(values) {
    api.setCode(INSERT_CODE);
    tree = null; nid = 0;
    var S = new DSA.Stepper();
    S.add(snap(tree, {}), 'เริ่มจากต้นไม้ว่าง', { line: -1 });
    values.forEach(function (v) { insertSteps(S, v, []); });
    S.add(snap(tree, {}), '✅ สร้างต้นไม้ BST เสร็จ (' + values.length + ' โหนด)', { line: -1 });
    return S.steps;
  }
  function insertOneSteps(x) {
    api.setCode(INSERT_CODE);
    var S = new DSA.Stepper();
    insertSteps(S, x, []);
    S.add(snap(tree, {}), '✅ เพิ่ม ' + x + ' เสร็จ', { line: -1 });
    return S.steps;
  }

  // ---------- inputs ----------
  var valuesEl = document.getElementById('bst-values');
  var opEl = document.getElementById('bst-op-val');

  function parseList(s) {
    return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 15);
  }
  function build(values) { valuesEl.value = values.join(', '); api.setSteps(buildSteps(values)); }

  document.getElementById('bst-build').addEventListener('click', function () {
    var v = parseList(valuesEl.value);
    if (v.length < 1) { alert('กรุณาใส่ค่าอย่างน้อย 1 ตัว'); return; }
    build(v);
  });
  document.getElementById('bst-random').addEventListener('click', function () {
    var set = {}, arr = [];
    while (arr.length < 7) { var r = 5 + Math.floor(Math.random() * 95); if (!set[r]) { set[r] = 1; arr.push(r); } }
    build(arr);
  });
  document.getElementById('bst-insert').addEventListener('click', function () {
    var x = Number(opEl.value);
    if (isNaN(x)) { alert('กรุณาใส่ค่าที่จะเพิ่ม'); return; }
    api.setSteps(insertOneSteps(x));
  });
  document.getElementById('bst-search').addEventListener('click', function () {
    var x = Number(opEl.value);
    if (isNaN(x)) { alert('กรุณาใส่ค่าที่จะค้นหา'); return; }
    api.setSteps(searchSteps(x));
  });

  // เริ่มต้น
  build([50, 30, 70, 20, 40, 60, 80]);
})();
