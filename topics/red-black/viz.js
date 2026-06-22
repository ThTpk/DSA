/* Red-Black Tree — insert + fixup (recolor / rotation 3 cases) */
(function () {
  var snap = DSA.TreeViz.snap;
  var api = DSA.TreeViz.init({ topicId: 'red-black' });

  var CODE = [
    'insert(x): ใส่แบบ BST, โหนดใหม่ = แดง',
    'fixup ขณะที่พ่อเป็นสีแดง:',
    '  Case 1: ลุงแดง → ทาพ่อ&ลุงดำ, ปู่แดง, เลื่อนขึ้น',
    '  Case 2: ลุงดำ + แนวหัก → หมุนให้เป็นแนวตรง',
    '  Case 3: ลุงดำ + แนวตรง → ทาพ่อดำ ปู่แดง, หมุนที่ปู่',
    'ราก = ดำเสมอ',
  ];

  var root = null, nid = 0;
  function N(v) { return { id: ++nid, value: v, color: 'R', left: null, right: null, parent: null }; }
  function isRed(n) { return !!n && n.color === 'R'; }
  function sync() { (function w(n) { if (!n) return; n.cls = n.color === 'R' ? 'rb-red' : 'rb-black'; w(n.left); w(n.right); })(root); }

  function rotateLeft(x) {
    var y = x.right; x.right = y.left; if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) root = y; else if (x === x.parent.left) x.parent.left = y; else x.parent.right = y;
    y.left = x; x.parent = y;
  }
  function rotateRight(x) {
    var y = x.left; x.left = y.right; if (y.right) y.right.parent = x;
    y.parent = x.parent;
    if (!x.parent) root = y; else if (x === x.parent.right) x.parent.right = y; else x.parent.left = y;
    y.right = x; x.parent = y;
  }

  function insertSteps(S, val) {
    function step(d, l, mark, id) { sync(); var m = {}; if (mark) m[mark] = [id]; S.add(snap(root, m), d, { line: l }); }
    var z = N(val), y = null, x = root;
    while (x) {
      step('ที่โหนด ' + x.value + ': เทียบ ' + val, 0, 'compare', x.id);
      y = x;
      if (val < x.value) x = x.left;
      else if (val > x.value) x = x.right;
      else { step(val + ' มีอยู่แล้ว ไม่เพิ่มซ้ำ', 0, 'compare', x.id); return; }
    }
    z.parent = y;
    if (!y) root = z; else if (val < y.value) y.left = z; else y.right = z;
    step('วางโหนดใหม่ ' + val + ' เป็น "สีแดง"', 0, 'found', z.id);

    // fixup
    while (z.parent && z.parent.color === 'R') {
      var p = z.parent, g = p.parent;
      if (!g) break;
      if (p === g.left) {
        var u = g.right;
        if (isRed(u)) { p.color = 'B'; u.color = 'B'; g.color = 'R'; step('Case 1: ลุง (' + u.value + ') แดง → ทาพ่อ&ลุงดำ, ปู่ (' + g.value + ') แดง, เลื่อนขึ้น', 2, 'compare', g.id); z = g; }
        else {
          if (z === p.right) { z = p; rotateLeft(z); p = z.parent; g = p.parent; step('Case 2: แนวหัก → หมุนซ้ายที่ ' + z.value + ' ให้เป็นแนวตรง', 3, 'compare', z.id); }
          p.color = 'B'; g.color = 'R'; rotateRight(g); step('Case 3: ทาพ่อ (' + p.value + ') ดำ, ปู่ (' + g.value + ') แดง, หมุนขวาที่ปู่', 4, 'found', p.id);
        }
      } else {
        var u2 = g.left;
        if (isRed(u2)) { p.color = 'B'; u2.color = 'B'; g.color = 'R'; step('Case 1 (กระจก): ลุง (' + u2.value + ') แดง → recolor, เลื่อนขึ้น', 2, 'compare', g.id); z = g; }
        else {
          if (z === p.left) { z = p; rotateRight(z); p = z.parent; g = p.parent; step('Case 2 (กระจก): หมุนขวาที่ ' + z.value, 3, 'compare', z.id); }
          p.color = 'B'; g.color = 'R'; rotateLeft(g); step('Case 3 (กระจก): recolor + หมุนซ้ายที่ปู่', 4, 'found', p.id);
        }
      }
    }
    if (root.color !== 'B') { root.color = 'B'; step('ทาราก (' + root.value + ') เป็นสีดำ', 5, 'found', root.id); }
  }

  function buildSteps(values) {
    api.setCode(CODE); root = null; nid = 0;
    var S = new DSA.Stepper();
    S.add(snap(null, {}), 'เริ่มจากต้นไม้ว่าง', { line: -1 });
    values.forEach(function (v) { insertSteps(S, v); });
    sync(); S.add(snap(root, {}), '✅ สร้าง Red-Black Tree เสร็จ — สมดุลตามกติกาแดง-ดำ', { line: -1 });
    return S.steps;
  }
  function insertOne(x) { api.setCode(CODE); var S = new DSA.Stepper(); insertSteps(S, x); sync(); S.add(snap(root, {}), '✅ insert ' + x + ' + ซ่อมสมดุลเสร็จ', { line: -1 }); return S.steps; }

  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 12); }
  var valuesEl = document.getElementById('rb-values');
  function build(v) { valuesEl.value = v.join(', '); api.setSteps(buildSteps(v)); }
  document.getElementById('rb-build').addEventListener('click', function () { var v = parseList(valuesEl.value); if (!v.length) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } build(v); });
  document.getElementById('rb-random').addEventListener('click', function () { var set = {}, a = []; while (a.length < 7) { var r = 5 + Math.floor(Math.random() * 95); if (!set[r]) { set[r] = 1; a.push(r); } } build(a); });
  document.getElementById('rb-insert').addEventListener('click', function () { var x = Number(document.getElementById('rb-val').value); if (isNaN(x)) { alert('ใส่ค่าที่จะเพิ่ม'); return; } api.setSteps(insertOne(x)); });

  build([10, 20, 30, 40, 50, 25]);
})();
