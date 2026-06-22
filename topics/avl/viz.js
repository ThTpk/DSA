/* AVL Tree — insert พร้อมปรับสมดุลด้วยการหมุน (LL/RR/LR/RL)
   ใช้ path เก็บเส้นทางลง แล้วเดินขึ้นปรับ height + หมุนเมื่อ |bf|>1 (อย่างมาก 1 ครั้งต่อ insert) */
(function () {
  var snap = DSA.TreeViz.snap;
  var api = DSA.TreeViz.init({ topicId: 'avl' });

  var CODE = [
    'insert(x): ลงตาม BST (เทียบไปซ้าย/ขวา)',                 // 0
    'เดินขึ้น: อัปเดต height & คำนวณ balance factor (bf)',     // 1
    'ถ้า bf > 1 (เอียงซ้าย):',                                  // 2
    '   LL → หมุนขวา ; LR → หมุนซ้ายที่ลูกซ้าย แล้วหมุนขวา',     // 3
    'ถ้า bf < -1 (เอียงขวา):',                                 // 4
    '   RR → หมุนซ้าย ; RL → หมุนขวาที่ลูกขวา แล้วหมุนซ้าย',    // 5
  ];

  var root = null, nid = 0;
  function newNode(v) { return { id: ++nid, value: v, left: null, right: null, height: 1 }; }
  function H(n) { return n ? n.height : 0; }
  function upd(n) { n.height = 1 + Math.max(H(n.left), H(n.right)); }
  function bf(n) { return n ? H(n.left) - H(n.right) : 0; }
  function rotR(y) { var x = y.left, T2 = x.right; x.right = y; y.left = T2; upd(y); upd(x); return x; }
  function rotL(x) { var y = x.right, T2 = y.left; y.left = x; x.right = T2; upd(x); upd(y); return y; }

  function insertAVL(S, x) {
    function step(d, l, m) { S.add(snap(root, m || {}), d, { line: l }); }

    if (root == null) { root = newNode(x); step('ต้นไม้ว่าง → สร้าง ' + x + ' เป็นราก', 0, { found: [root.id] }); return; }

    // ----- ลง BST เก็บ path -----
    var path = [], cur = root;
    while (true) {
      path.push(cur);
      step('ที่โหนด ' + cur.value + ': เทียบ ' + x, 0, { current: [cur.id], compare: [cur.id] });
      if (x < cur.value) {
        if (cur.left == null) { cur.left = newNode(x); path.push(cur.left); step(x + ' < ' + cur.value + ' → วางใหม่ทางซ้าย', 0, { found: [cur.left.id] }); break; }
        step(x + ' < ' + cur.value + ' → ไปซ้าย', 0, { current: [cur.left.id] }); cur = cur.left;
      } else if (x > cur.value) {
        if (cur.right == null) { cur.right = newNode(x); path.push(cur.right); step(x + ' > ' + cur.value + ' → วางใหม่ทางขวา', 0, { found: [cur.right.id] }); break; }
        step(x + ' > ' + cur.value + ' → ไปขวา', 0, { current: [cur.right.id] }); cur = cur.right;
      } else { step(x + ' มีอยู่แล้ว ไม่เพิ่มซ้ำ', 0, { found: [cur.id] }); return; }
    }

    // ----- เดินขึ้นปรับ height + หมุน -----
    for (var i = path.length - 1; i >= 0; i--) {
      var node = path[i];
      upd(node);
      var b = bf(node);
      step('อัปเดต ' + node.value + ': สูง=' + node.height + ', bf=' + b, 1, { current: [node.id] });

      if (b > 1 || b < -1) {
        var parent = i > 0 ? path[i - 1] : null;
        var sub;
        if (b > 1 && x < node.left.value) {
          step('โหนด ' + node.value + ' bf=' + b + ' (LL) → หมุนขวา', 3, { compare: [node.id] }); sub = rotR(node);
        } else if (b > 1) {
          step('โหนด ' + node.value + ' bf=' + b + ' (LR) → หมุนซ้ายที่ลูกซ้าย แล้วหมุนขวา', 3, { compare: [node.id] });
          node.left = rotL(node.left); sub = rotR(node);
        } else if (b < -1 && x > node.right.value) {
          step('โหนด ' + node.value + ' bf=' + b + ' (RR) → หมุนซ้าย', 5, { compare: [node.id] }); sub = rotL(node);
        } else {
          step('โหนด ' + node.value + ' bf=' + b + ' (RL) → หมุนขวาที่ลูกขวา แล้วหมุนซ้าย', 5, { compare: [node.id] });
          node.right = rotR(node.right); sub = rotL(node);
        }
        if (parent == null) root = sub;
        else if (parent.left === node) parent.left = sub;
        else parent.right = sub;
        step('ปรับสมดุลแล้ว: ' + sub.value + ' ขึ้นเป็นหัวซับทรีนี้', 1, { found: [sub.id] });
      }
    }
  }

  function buildSteps(values) {
    api.setCode(CODE);
    root = null; nid = 0;
    var S = new DSA.Stepper();
    S.add(snap(null, {}), 'เริ่มจากต้นไม้ว่าง', { line: -1 });
    values.forEach(function (v) { insertAVL(S, v); });
    S.add(snap(root, {}), '✅ สร้าง AVL เสร็จ — ต้นไม้สมดุลเสมอ', { line: -1 });
    return S.steps;
  }
  function insertOneSteps(x) { api.setCode(CODE); var S = new DSA.Stepper(); insertAVL(S, x); S.add(snap(root, {}), '✅ insert ' + x + ' + ปรับสมดุลเสร็จ', { line: -1 }); return S.steps; }

  var valuesEl = document.getElementById('avl-values');
  var valEl = document.getElementById('avl-val');
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 15); }
  function build(values) { valuesEl.value = values.join(', '); api.setSteps(buildSteps(values)); }

  document.getElementById('avl-build').addEventListener('click', function () { var v = parseList(valuesEl.value); if (!v.length) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } build(v); });
  document.getElementById('avl-random').addEventListener('click', function () { var set = {}, a = []; while (a.length < 7) { var r = 5 + Math.floor(Math.random() * 95); if (!set[r]) { set[r] = 1; a.push(r); } } build(a); });
  document.getElementById('avl-insert').addEventListener('click', function () { var x = Number(valEl.value); if (isNaN(x)) { alert('ใส่ค่าที่จะเพิ่ม'); return; } api.setSteps(insertOneSteps(x)); });

  build([10, 20, 30, 40, 50, 25]);
})();
