/* Binary Tree Traversal — pre/in/post (recursive + call stack) และ level-order (BFS + queue) */
(function () {
  var snap = DSA.TreeViz.snap;
  var api = DSA.TreeViz.init({ topicId: 'binary-tree', showStack: true });

  var root = null, nid = 0;
  function newNode(v) { return { id: ++nid, value: v, left: null, right: null }; }
  function insert(node, v) {
    if (node == null) return newNode(v);
    if (v < node.value) node.left = insert(node.left, v);
    else if (v > node.value) node.right = insert(node.right, v);
    return node;
  }
  function buildTree(values) { root = null; nid = 0; values.forEach(function (v) { root = insert(root, v); }); }

  // ---------- DFS (pre/in/post) ----------
  var DFS_CODE = {
    pre:  ['preorder(node):', '  if node == null: return', '  เยี่ยม node (process)', '  preorder(node.left)', '  preorder(node.right)'],
    in:   ['inorder(node):', '  if node == null: return', '  inorder(node.left)', '  เยี่ยม node (process)', '  inorder(node.right)'],
    post: ['postorder(node):', '  if node == null: return', '  postorder(node.left)', '  postorder(node.right)', '  เยี่ยม node (process)'],
  };
  var PROC_LINE = { pre: 2, in: 3, post: 4 };

  function dfsSteps(mode) {
    api.setCode(DFS_CODE[mode]);
    var S = new DSA.Stepper(), stack = [], fid = 0, result = [], visited = [];
    function step(desc, line, marks) {
      marks = marks || {}; marks.stack = stack; marks.visited = visited.slice();
      S.add(snap(root, marks), desc, { line: line });
    }
    function process(node) {
      visited.push(node.id); result.push(node.value);
      step('เยี่ยม ' + node.value + ' → ผลลัพธ์: [' + result.join(' ') + ']', PROC_LINE[mode], { current: [node.id] });
    }
    function rec(node) {
      if (node == null) return;
      stack.push({ id: 'f' + (++fid), title: mode + '(' + node.value + ')', phase: 'ทำงาน' });
      step('เข้าโหนด ' + node.value, 0, { current: [node.id] });
      if (mode === 'pre') process(node);
      rec(node.left);
      if (mode === 'in') process(node);
      rec(node.right);
      if (mode === 'post') process(node);
      stack.pop();
    }
    if (root == null) { S.add(snap(root, {}), 'ต้นไม้ว่าง', { line: 1 }); return S.steps; }
    rec(root);
    step('✅ จบ ' + mode + '-order: [' + result.join(' ') + ']', -1, {});
    return S.steps;
  }

  // ---------- BFS (level-order) ----------
  var BFS_CODE = [
    'queue = [root]',                       // 0
    'while queue not empty:',               // 1
    '  node = queue.dequeue()',             // 2
    '  เยี่ยม node',                         // 3
    '  if node.left:  queue.enqueue(left)', // 4
    '  if node.right: queue.enqueue(right)',// 5
  ];
  function bfsSteps() {
    api.setCode(BFS_CODE);
    var S = new DSA.Stepper(), result = [], visited = [];
    function qv(q) { return q.map(function (n) { return n.value; }).join(' '); }
    function step(desc, line, marks) {
      marks = marks || {}; marks.visited = visited.slice();
      S.add(snap(root, marks), desc, { line: line });
    }
    if (root == null) { S.add(snap(root, {}), 'ต้นไม้ว่าง', { line: 1 }); return S.steps; }
    var queue = [root];
    step('ใส่รากเข้า queue: [' + qv(queue) + ']', 0, { current: [root.id] });
    while (queue.length) {
      var node = queue.shift();
      step('ดึงหน้า queue: ' + node.value + '  (เหลือ [' + qv(queue) + '])', 2, { current: [node.id] });
      visited.push(node.id); result.push(node.value);
      step('เยี่ยม ' + node.value + ' → ผลลัพธ์: [' + result.join(' ') + ']', 3, { current: [node.id] });
      if (node.left)  { queue.push(node.left);  step('ใส่ลูกซ้าย ' + node.left.value + ' เข้า queue: [' + qv(queue) + ']', 4, {}); }
      if (node.right) { queue.push(node.right); step('ใส่ลูกขวา ' + node.right.value + ' เข้า queue: [' + qv(queue) + ']', 5, {}); }
    }
    step('✅ จบ level-order: [' + result.join(' ') + ']', -1, {});
    return S.steps;
  }

  // ---------- inputs ----------
  var valuesEl = document.getElementById('bt-values');
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 15); }
  function showTree() { var S = new DSA.Stepper(); S.add(snap(root, {}), 'ต้นไม้พร้อมแล้ว — เลือกวิธีท่อง (traversal) ด้านบน', { line: -1 }); return S.steps; }
  function build(values) { valuesEl.value = values.join(', '); buildTree(values); api.setCode([]); api.setSteps(showTree()); }

  document.getElementById('bt-build').addEventListener('click', function () {
    var v = parseList(valuesEl.value); if (v.length < 1) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } build(v);
  });
  document.getElementById('bt-random').addEventListener('click', function () {
    var set = {}, arr = []; while (arr.length < 7) { var r = 5 + Math.floor(Math.random() * 95); if (!set[r]) { set[r] = 1; arr.push(r); } } build(arr);
  });
  document.getElementById('bt-pre').addEventListener('click', function () { api.setSteps(dfsSteps('pre')); });
  document.getElementById('bt-in').addEventListener('click', function () { api.setSteps(dfsSteps('in')); });
  document.getElementById('bt-post').addEventListener('click', function () { api.setSteps(dfsSteps('post')); });
  document.getElementById('bt-level').addEventListener('click', function () { api.setSteps(bfsSteps()); });

  build([50, 30, 70, 20, 40, 60, 80]);
})();
