/* Bellman-Ford — relax ทุกเส้น V-1 รอบ (GraphViz directed weighted, มีน้ำหนักลบได้) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'bellman-ford', directed: true, weighted: true });

  var NODES, EDGES, START;

  function fmt(d) { return d === Infinity ? '∞' : String(d); }
  function model(dist, active, tree) {
    var nodes = NODES.map(function (n) { return { id: n.id, x: n.x, y: n.y, label: n.id, sub: fmt(dist[n.id]), cls: '' }; });
    var edges = EDGES.map(function (e) { return { id: e.id, u: e.u, v: e.v, w: e.w, cls: (e.id === active ? 'is-active' : (tree[e.v] === e.id ? 'is-tree' : '')) }; });
    return { nodes: nodes, edges: edges };
  }
  var CODE = ['dist[start]=0, อื่นๆ=∞', 'ทำซ้ำ V-1 รอบ:', '  for ทุกเส้น (u→v, w):', '    if dist[u]+w < dist[v]: dist[v]=dist[u]+w (relax)'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var dist = {}, tree = {}; NODES.forEach(function (n) { dist[n.id] = Infinity; }); dist[START] = 0;
    S.add(DSA.GraphViz.snap(model(dist, null, tree)), 'ตั้ง dist[' + START + ']=0, ที่เหลือ=∞ · จะ relax ทุกเส้น ' + (NODES.length - 1) + ' รอบ', { line: 0 });
    for (var iter = 1; iter < NODES.length; iter++) {
      var changed = false;
      for (var i = 0; i < EDGES.length; i++) {
        var e = EDGES[i];
        if (dist[e.u] === Infinity) continue;
        var nd = dist[e.u] + e.w;
        if (nd < dist[e.v]) {
          dist[e.v] = nd; tree[e.v] = e.id; changed = true;
          S.add(DSA.GraphViz.snap(model(dist, e.id, tree)), 'รอบ ' + iter + ': relax ' + e.u + '→' + e.v + ' : ' + (nd - e.w) + (e.w < 0 ? '−' + (-e.w) : '+' + e.w) + ' = ' + nd + ' ดีกว่าเดิม → อัปเดต dist[' + e.v + ']=' + nd, { line: 3 });
        }
      }
      if (!changed) { S.add(DSA.GraphViz.snap(model(dist, null, tree)), 'รอบ ' + iter + ': ไม่มีการเปลี่ยนแปลง → หยุดก่อนได้', { line: 1 }); break; }
    }
    var res = NODES.map(function (n) { return n.id + '=' + fmt(dist[n.id]); }).join(', ');
    S.add(DSA.GraphViz.snap(model(dist, null, tree)), '✅ ระยะสั้นสุดจาก ' + START + ': ' + res, { line: -1 });
    return S.steps;
  }

  function showInitial() {
    var dist = {}; NODES.forEach(function (n) { dist[n.id] = Infinity; }); dist[START] = 0;
    var neg = EDGES.filter(function (e) { return e.w < 0; }).map(function (e) { return e.u + e.v + '=' + e.w; });
    var S = new DSA.Stepper();
    S.add(DSA.GraphViz.snap(model(dist, null, {})), 'กราฟมีทิศ + น้ำหนัก ' + NODES.length + ' โหนด' + (neg.length ? ' (เส้นลบ: ' + neg.join(', ') + ')' : '') + ' — กดรัน', { line: -1 });
    api.setSteps(S.steps);
  }
  function regen() {
    var g = DSA.GraphViz.generate(cfg.getN(), { directed: true, weighted: true, allowNeg: true });
    NODES = g.nodes; EDGES = g.edges; START = NODES[0].id; showInitial();
  }

  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  var cfg = DSA.GraphViz.mountConfig({ defaultN: 5, onChange: regen });
  regen();
})();
