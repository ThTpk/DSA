/* Prim's MST — ขยายต้นไม้จากโหนดเดียว เลือก edge ข้ามที่เบาสุด (GraphViz) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'prim', weighted: true });

  var NODES, EDGES, START;

  function model(tree, active, treeEdges) {
    var nodes = NODES.map(function (n) { return { id: n.id, x: n.x, y: n.y, label: n.id, cls: tree[n.id] ? 'is-visited' : '' }; });
    var edges = EDGES.map(function (e) { return { id: e.id, u: e.u, v: e.v, w: e.w, cls: (e.id === active ? 'is-active' : (treeEdges[e.id] ? 'is-tree' : '')) }; });
    return { nodes: nodes, edges: edges };
  }
  var CODE = ['เริ่มต้นด้วยโหนดเดียวใน tree', 'ทำซ้ำจนครบทุกโหนด:', '  หา edge เบาสุดที่เชื่อม tree → โหนดนอก tree', '  เพิ่ม edge + โหนดนั้นเข้า tree'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var tree = {}, treeEdges = {}, total = 0;
    tree[START] = true;
    S.add(DSA.GraphViz.snap(model(tree, null, treeEdges)), 'เริ่มต้นที่ ' + START + ' (อยู่ใน tree)', { line: 0 });
    var count = 1;
    while (count < NODES.length) {
      var best = null;
      EDGES.forEach(function (e) {
        var io = (tree[e.u] ? 1 : 0) + (tree[e.v] ? 1 : 0);
        if (io === 1) { if (!best || e.w < best.w) best = e; }
      });
      if (!best) break;
      S.add(DSA.GraphViz.snap(model(tree, best.id, treeEdges)), 'พิจารณาเส้นข้ามขอบ tree → เลือกเบาสุด: ' + best.u + '–' + best.v + ' (' + best.w + ')', { line: 2 });
      treeEdges[best.id] = true; total += best.w;
      var addNode = tree[best.u] ? best.v : best.u;
      tree[addNode] = true; count++;
      S.add(DSA.GraphViz.snap(model(tree, null, treeEdges)), 'เพิ่ม ' + best.u + '–' + best.v + ' และดึงโหนด ' + addNode + ' เข้า tree (รวม ' + total + ')', { line: 3 });
    }
    var used = EDGES.filter(function (e) { return treeEdges[e.id]; }).map(function (e) { return e.u + e.v; });
    S.add(DSA.GraphViz.snap(model(tree, null, treeEdges)), '✅ MST เสร็จ — เส้น: ' + used.join(', ') + ' · น้ำหนักรวม = ' + total, { line: -1 });
    return S.steps;
  }

  function showInitial() {
    var t = {}; t[START] = true;
    var S = new DSA.Stepper();
    S.add(DSA.GraphViz.snap(model(t, null, {})), 'กราฟมีน้ำหนัก ' + NODES.length + ' โหนด — กด "รัน Prim" เพื่อสร้าง MST', { line: -1 });
    api.setSteps(S.steps);
  }
  function regen() {
    var g = DSA.GraphViz.generate(cfg.getN(), { weighted: true });
    NODES = g.nodes; EDGES = g.edges; START = NODES[0].id; showInitial();
  }

  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  var cfg = DSA.GraphViz.mountConfig({ defaultN: 6, onChange: regen });
  regen();
})();
