/* Segment Tree — range sum query + point update (TreeViz + call stack)
   โหนดป้าย = ผลรวมของช่วง (range อยู่ในคำอธิบาย) */
(function () {
  var snap = DSA.TreeViz.snap;
  var api = DSA.TreeViz.init({ topicId: 'segment-tree', showStack: true });

  var arr = [], root = null, nid = 0;
  function buildTree(lo, hi) {
    var node = { id: ++nid, lo: lo, hi: hi, value: 0, left: null, right: null };
    if (lo < hi) { var mid = (lo + hi) >> 1; node.left = buildTree(lo, mid); node.right = buildTree(mid + 1, hi); }
    return node;
  }
  function rng(n) { return '[' + n.lo + '–' + n.hi + ']'; }

  var BUILD_CODE = ['build(node):', '  if leaf: node.sum = arr[i]', '  else: build(ซ้าย); build(ขวา)', '  node.sum = ซ้าย.sum + ขวา.sum'];
  var QUERY_CODE = ['query(node, l, r):', '  if นอกช่วง: return 0', '  if อยู่ในช่วงเต็ม: return node.sum', '  return query(ซ้าย)+query(ขวา)'];
  var UPDATE_CODE = ['update(node, i, val):', '  if leaf: node.sum = val', '  else: ลงไปฝั่งที่มี i', '  node.sum = ซ้าย.sum + ขวา.sum'];

  function buildSteps(values) {
    api.setCode(BUILD_CODE);
    arr = values.slice(); nid = 0; root = buildTree(0, arr.length - 1);
    var S = new DSA.Stepper(); var stack = [], fid = 0;
    function step(n, d, l, mark) { var m = { stack: stack }; if (mark) m[mark] = [n.id]; S.add(snap(root, m), d, { line: l }); }
    function bs(node) {
      stack.push({ id: ++fid, title: 'build' + rng(node) });
      if (node.lo === node.hi) { node.value = arr[node.lo]; step(node, 'ใบ ' + rng(node) + ' = ' + node.value, 1, 'found'); }
      else { bs(node.left); bs(node.right); node.value = node.left.value + node.right.value; step(node, rng(node) + ' = ' + node.left.value + ' + ' + node.right.value + ' = ' + node.value, 3, 'found'); }
      stack.pop();
    }
    S.add(snap(root, {}), 'สร้าง Segment Tree จากอาเรย์ ' + arr.length + ' ตัว', { line: 0 });
    bs(root);
    S.add(snap(root, {}), '✅ สร้างเสร็จ — รากเก็บผลรวมทั้งหมด = ' + root.value, { line: -1 });
    return S.steps;
  }

  function querySteps(l, r) {
    api.setCode(QUERY_CODE);
    var S = new DSA.Stepper(); var stack = [], fid = 0, total = 0;
    function step(n, d, line, mark) { var m = { stack: stack }; if (mark) m[mark] = [n.id]; S.add(snap(root, m), d, { line: line }); }
    function q(node) {
      stack.push({ id: ++fid, title: 'query' + rng(node) });
      var res;
      if (node.hi < l || node.lo > r) { step(node, rng(node) + ' อยู่นอกช่วง [' + l + '–' + r + '] → ข้าม (0)', 1, 'visited'); res = 0; }
      else if (l <= node.lo && node.hi <= r) { total += node.value; step(node, rng(node) + ' อยู่ในช่วงเต็ม → บวก ' + node.value + ' (รวม = ' + total + ')', 2, 'found'); res = node.value; }
      else { step(node, rng(node) + ' ซ้อนบางส่วน → ลงลึกซ้าย/ขวา', 3, 'compare'); res = q(node.left) + q(node.right); }
      stack.pop();
      return res;
    }
    var ans = q(root);
    S.add(snap(root, {}), '✅ ผลรวม A[' + l + '..' + r + '] = ' + ans, { line: -1 });
    return S.steps;
  }

  function updateSteps(i, val) {
    api.setCode(UPDATE_CODE);
    arr[i] = val;
    var S = new DSA.Stepper(); var stack = [], fid = 0;
    function step(n, d, line, mark) { var m = { stack: stack }; if (mark) m[mark] = [n.id]; S.add(snap(root, m), d, { line: line }); }
    function u(node) {
      stack.push({ id: ++fid, title: 'update' + rng(node) });
      if (node.lo === node.hi) { node.value = val; step(node, 'ถึงใบ A[' + i + '] → ตั้งค่าใหม่ = ' + val, 1, 'found'); }
      else {
        var mid = (node.lo + node.hi) >> 1;
        step(node, rng(node) + ': ' + i + ' ' + (i <= mid ? '≤' : '>') + ' mid → ลง' + (i <= mid ? 'ซ้าย' : 'ขวา'), 2, 'compare');
        if (i <= mid) u(node.left); else u(node.right);
        node.value = node.left.value + node.right.value;
        step(node, 'อัปเดต ' + rng(node) + ' = ' + node.left.value + ' + ' + node.right.value + ' = ' + node.value, 3, 'found');
      }
      stack.pop();
    }
    u(root);
    S.add(snap(root, {}), '✅ update เสร็จ — A[' + i + ']=' + val + ', รากรวม = ' + root.value, { line: -1 });
    return S.steps;
  }

  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 8); }
  var valuesEl = document.getElementById('sg-values');
  function build(v) { valuesEl.value = v.join(', '); api.setSteps(buildSteps(v)); }
  document.getElementById('sg-build').addEventListener('click', function () { var v = parseList(valuesEl.value); if (v.length < 1) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } build(v); });
  document.getElementById('sg-query').addEventListener('click', function () {
    var l = parseInt(document.getElementById('sg-l').value, 10), r = parseInt(document.getElementById('sg-r').value, 10);
    if (isNaN(l) || isNaN(r) || l > r || l < 0 || r >= arr.length) { alert('ใส่ l,r ให้ถูก (0 ≤ l ≤ r ≤ ' + (arr.length - 1) + ')'); return; }
    api.setSteps(querySteps(l, r));
  });
  document.getElementById('sg-update').addEventListener('click', function () {
    var i = parseInt(document.getElementById('sg-i').value, 10), v = parseInt(document.getElementById('sg-v').value, 10);
    if (isNaN(i) || isNaN(v) || i < 0 || i >= arr.length) { alert('ใส่ i (0-' + (arr.length - 1) + ') และค่าใหม่'); return; }
    api.setSteps(updateSteps(i, v));
  });

  build([2, 5, 1, 4, 9, 3]);
})();
