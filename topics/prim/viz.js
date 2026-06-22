/* Prim's MST — ขยายต้นไม้จากโหนดเดียว เลือก edge ข้ามที่เบาสุด (GraphViz) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'prim', weighted: true });
  var NODES = [
    { id: 'A', x: 90, y: 210 }, { id: 'B', x: 250, y: 90 }, { id: 'C', x: 250, y: 330 },
    { id: 'D', x: 450, y: 90 }, { id: 'E', x: 450, y: 330 }, { id: 'F', x: 630, y: 210 },
  ];
  var EDGES = [
    { id: 'AB', u: 'A', v: 'B', w: 4 }, { id: 'AC', u: 'A', v: 'C', w: 2 }, { id: 'BC', u: 'B', v: 'C', w: 1 },
    { id: 'BD', u: 'B', v: 'D', w: 5 }, { id: 'CE', u: 'C', v: 'E', w: 8 }, { id: 'DE', u: 'D', v: 'E', w: 3 },
    { id: 'DF', u: 'D', v: 'F', w: 6 }, { id: 'EF', u: 'E', v: 'F', w: 2 },
  ];
  function model(tree, active, treeEdges) {
    var nodes = NODES.map(function (n) { return { id: n.id, x: n.x, y: n.y, label: n.id, cls: tree[n.id] ? 'is-visited' : '' }; });
    var edges = EDGES.map(function (e) { return { id: e.id, u: e.u, v: e.v, w: e.w, cls: (e.id === active ? 'is-active' : (treeEdges[e.id] ? 'is-tree' : '')) }; });
    return { nodes: nodes, edges: edges };
  }
  var CODE = ['เริ่มต้นด้วยโหนดเดียวใน tree', 'ทำซ้ำจนครบทุกโหนด:', '  หา edge เบาสุดที่เชื่อม tree → โหนดนอก tree', '  เพิ่ม edge + โหนดนั้นเข้า tree'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var tree = { A: true }, treeEdges = {}, total = 0;
    S.add(DSA.GraphViz.snap(model(tree, null, treeEdges)), 'เริ่มต้นที่ A (อยู่ใน tree)', { line: 0 });
    var count = 1;
    while (count < NODES.length) {
      // หา edge ข้ามที่เบาสุด
      var best = null;
      EDGES.forEach(function (e) {
        var io = (tree[e.u] ? 1 : 0) + (tree[e.v] ? 1 : 0);
        if (io === 1) { S; if (!best || e.w < best.w) best = e; }
      });
      // แสดง candidate ทั้งหมด (ไฮไลต์ตัวที่เลือก)
      S.add(DSA.GraphViz.snap(model(tree, best.id, treeEdges)), 'พิจารณาเส้นข้ามขอบ tree → เลือกเบาสุด: ' + best.u + '–' + best.v + ' (' + best.w + ')', { line: 2 });
      treeEdges[best.id] = true; total += best.w;
      var add = tree[best.u] ? best.v : best.u;
      tree[add] = true; count++;
      S.add(DSA.GraphViz.snap(model(tree, null, treeEdges)), 'เพิ่ม ' + best.u + '–' + best.v + ' และดึงโหนด ' + add + ' เข้า tree (รวม ' + total + ')', { line: 3 });
    }
    var used = EDGES.filter(function (e) { return treeEdges[e.id]; }).map(function (e) { return e.u + e.v; });
    S.add(DSA.GraphViz.snap(model(tree, null, treeEdges)), '✅ MST เสร็จ — เส้น: ' + used.join(', ') + ' · น้ำหนักรวม = ' + total, { line: -1 });
    return S.steps;
  }
  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  (function () { var S = new DSA.Stepper(); S.add(DSA.GraphViz.snap(model({ A: true }, null, {})), 'กราฟมีน้ำหนัก — กด "รัน Prim" เพื่อสร้าง MST', { line: -1 }); api.setSteps(S.steps); })();
})();
