/* Topological Sort — Kahn's algorithm บน DAG (GraphViz directed) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'topological-sort', directed: true });

  var NODES, EDGES;

  function model(indeg, removed, cur) {
    var nodes = NODES.map(function (n) {
      var cls = n.id === cur ? 'is-current' : (removed[n.id] ? 'is-visited' : '');
      return { id: n.id, x: n.x, y: n.y, label: n.id, sub: removed[n.id] ? '✓' : ('in:' + indeg[n.id]), cls: cls };
    });
    var edges = EDGES.map(function (e) { return { id: e.id, u: e.u, v: e.v, cls: (removed[e.u] ? 'is-faded' : '') }; });
    return { nodes: nodes, edges: edges };
  }
  var CODE = ['คำนวณ in-degree ของทุกโหนด', 'คิว = โหนดที่ in-degree = 0', 'ขณะคิวไม่ว่าง:', '  เอาโหนดออก → ใส่ผลลัพธ์', '  ลด in-degree ของเพื่อนบ้าน (เหลือ 0 → เข้าคิว)'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var indeg = {}; NODES.forEach(function (n) { indeg[n.id] = 0; });
    EDGES.forEach(function (e) { indeg[e.v]++; });
    var removed = {}, order = [];
    S.add(DSA.GraphViz.snap(model(indeg, removed, null)), 'นับ in-degree เสร็จ (ตัวเลขใต้โหนด)', { line: 0 });
    var queue = NODES.filter(function (n) { return indeg[n.id] === 0; }).map(function (n) { return n.id; });
    S.add(DSA.GraphViz.snap(model(indeg, removed, null)), 'เริ่ม: โหนด in-degree=0 → คิว [' + queue.join(', ') + ']', { line: 1 });
    while (queue.length) {
      queue.sort();
      var u = queue.shift();
      S.add(DSA.GraphViz.snap(model(indeg, removed, u)), 'เอา ' + u + ' ออก (in-degree=0) → ใส่ผลลัพธ์', { line: 3 });
      removed[u] = true; order.push(u);
      EDGES.forEach(function (e) {
        if (e.u === u && !removed[e.v]) { indeg[e.v]--; if (indeg[e.v] === 0) queue.push(e.v); }
      });
      S.add(DSA.GraphViz.snap(model(indeg, removed, null)), u + ' ออกแล้ว → ลด in-degree เพื่อนบ้าน · คิว [' + queue.slice().sort().join(', ') + ']', { line: 4 });
    }
    S.add(DSA.GraphViz.snap(model(indeg, removed, null)), '✅ ลำดับทอพอโลยี: ' + order.join(' → '), { line: -1 });
    return S.steps;
  }

  function showInitial() {
    var indeg = {}; NODES.forEach(function (n) { indeg[n.id] = 0; }); EDGES.forEach(function (e) { indeg[e.v]++; });
    var S = new DSA.Stepper();
    S.add(DSA.GraphViz.snap(model(indeg, {}, null)), 'DAG ' + NODES.length + ' โหนด — กด "จัดลำดับ" เพื่อรัน Kahn\'s algorithm', { line: -1 });
    api.setSteps(S.steps);
  }
  function regen() {
    var g = DSA.GraphViz.generate(cfg.getN(), { directed: true });
    NODES = g.nodes; EDGES = g.edges; showInitial();
  }

  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  var cfg = DSA.GraphViz.mountConfig({ defaultN: 6, onChange: regen });
  regen();
})();
