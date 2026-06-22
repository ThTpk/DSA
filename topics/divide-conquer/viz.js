/* Divide & Conquer — หา Max แบบแบ่งครึ่ง แสดงเป็นต้นไม้การเรียกซ้ำ (TreeViz + call stack) */
(function () {
  var snap = DSA.TreeViz.snap;
  var api = DSA.TreeViz.init({ topicId: 'divide-conquer', showStack: true });

  var CODE = [
    'findMax(lo, hi):',
    '  if lo == hi: return arr[lo]    // กรณีฐาน',
    '  mid = (lo + hi) / 2',
    '  L = findMax(lo, mid)           // แบ่งซ้าย',
    '  R = findMax(mid+1, hi)         // แบ่งขวา',
    '  return max(L, R)               // รวม',
  ];

  var arr = [], nid = 0;
  function buildTree(lo, hi) {
    var node = { id: ++nid, lo: lo, hi: hi, value: (lo === hi ? arr[lo] : lo + '–' + hi), left: null, right: null };
    if (lo < hi) { var mid = (lo + hi) >> 1; node.left = buildTree(lo, mid); node.right = buildTree(mid + 1, hi); }
    return node;
  }

  function buildSteps(values) {
    api.setCode(CODE);
    arr = values.slice(); nid = 0;
    var root = buildTree(0, arr.length - 1);
    var S = new DSA.Stepper();
    var stack = [], fid = 0;
    function step(node, d, l, mark) {
      var m = { stack: stack }; if (mark) m[mark] = [node.id];
      S.add(snap(root, m), d, { line: l });
    }
    S.add(snap(root, {}), 'ต้นไม้การเรียกซ้ำ (ยังไม่คิด) — แต่ละโหนดคือช่วง [lo–hi]', { line: 0 });

    function walk(node) {
      stack.push({ id: ++fid, title: 'findMax(' + node.lo + ',' + node.hi + ')', phase: 'ทำงาน' });
      if (node.lo === node.hi) {
        step(node, 'กรณีฐาน [' + node.lo + '–' + node.hi + ']: เหลือ 1 ตัว = ' + arr[node.lo], 1, 'found');
      } else {
        step(node, 'แบ่งช่วง [' + node.lo + '–' + node.hi + '] ตรงกลาง', 2, 'compare');
        walk(node.left);
        walk(node.right);
        node.value = Math.max(node.left.value, node.right.value);
        step(node, 'รวม: max(' + node.left.value + ', ' + node.right.value + ') = ' + node.value, 5, 'found');
      }
      stack.pop();
    }
    walk(root);
    S.add(snap(root, {}), '✅ ค่ามากที่สุด = ' + root.value, { line: -1 });
    return S.steps;
  }

  var valuesEl = document.getElementById('dc-values');
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 8); }
  function run() { var v = parseList(valuesEl.value); if (v.length < 2) { alert('ใส่อย่างน้อย 2 ตัว'); return; } valuesEl.value = v.join(', '); api.setSteps(buildSteps(v)); }
  document.getElementById('dc-run').addEventListener('click', run);
  document.getElementById('dc-random').addEventListener('click', function () { var a = []; for (var i = 0; i < 8; i++) a.push(1 + Math.floor(Math.random() * 99)); valuesEl.value = a.join(', '); run(); });
  run();
})();
