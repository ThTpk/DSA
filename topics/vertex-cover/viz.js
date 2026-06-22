/* Vertex Cover 2-approximation — pick edge, take both ends (GraphViz) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'vertex-cover' });

  var NODES, EDGES;
  function regen() {
    var g = DSA.GraphViz.generate(cfg.getN(), { density: 0.6 });
    NODES = g.nodes; EDGES = g.edges; showInitial();
  }

  function model(cover, activeEdge, covered) {
    var nodes = NODES.map(function (n) { return { id: n.id, x: n.x, y: n.y, label: n.id, cls: cover[n.id] ? 'is-visited' : '' }; });
    var edges = EDGES.map(function (e) {
      var cls = e.id === activeEdge ? 'is-active' : (covered[e.id] ? 'is-faded' : '');
      return { id: e.id, u: e.u, v: e.v, cls: cls };
    });
    return { nodes: nodes, edges: edges };
  }
  var CODE = ['cover = {}', 'while ยังมีเส้นที่ไม่ถูกคลุม:', '  เลือกเส้น (u, v)', '  cover += {u, v}', '  ลบทุกเส้นที่ติด u หรือ v'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var cover = {}, covered = {};
    S.add(DSA.GraphViz.snap(model(cover, null, covered)), 'เริ่ม: เซตคำตอบว่าง', { line: 0 });
    var remaining = EDGES.slice();
    while (true) {
      var e = null;
      for (var i = 0; i < remaining.length; i++) { if (!covered[remaining[i].id]) { e = remaining[i]; break; } }
      if (!e) break;
      S.add(DSA.GraphViz.snap(model(cover, e.id, covered)), 'เลือกเส้นที่ยังไม่ถูกคลุม: ' + e.u + '–' + e.v, { line: 2 });
      cover[e.u] = true; cover[e.v] = true;
      EDGES.forEach(function (x) { if (x.u === e.u || x.v === e.u || x.u === e.v || x.v === e.v) covered[x.id] = true; });
      S.add(DSA.GraphViz.snap(model(cover, null, covered)), 'ใส่ ' + e.u + ', ' + e.v + ' ลงเซต → ลบทุกเส้นที่ติดทั้งสอง', { line: 4 });
    }
    var list = Object.keys(cover).sort();
    S.add(DSA.GraphViz.snap(model(cover, null, covered)), '✅ Vertex Cover (≤ 2× ดีสุด) = {' + list.join(', ') + '} · ขนาด ' + list.length, { line: -1 });
    return S.steps;
  }

  function showInitial() {
    var S = new DSA.Stepper();
    S.add(DSA.GraphViz.snap(model({}, null, {})), 'กราฟไม่มีทิศ ' + NODES.length + ' โหนด — กด "หา Vertex Cover"', { line: -1 });
    api.setSteps(S.steps);
  }
  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  var cfg = DSA.GraphViz.mountConfig({ minN: 5, maxN: 9, defaultN: 7, onChange: regen });
  regen();
})();
