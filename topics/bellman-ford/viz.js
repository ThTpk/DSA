/* Bellman-Ford — relax ทุกเส้น V-1 รอบ (GraphViz directed weighted, มีน้ำหนักลบ) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'bellman-ford', directed: true, weighted: true });
  var NODES = [
    { id: 'A', x: 80, y: 180 }, { id: 'B', x: 290, y: 70 }, { id: 'C', x: 290, y: 300 },
    { id: 'D', x: 520, y: 70 }, { id: 'E', x: 520, y: 300 },
  ];
  var EDGES = [
    { id: 'AB', u: 'A', v: 'B', w: 6 }, { id: 'AC', u: 'A', v: 'C', w: 7 }, { id: 'BC', u: 'B', v: 'C', w: 8 },
    { id: 'BD', u: 'B', v: 'D', w: 5 }, { id: 'BE', u: 'B', v: 'E', w: -4 }, { id: 'CD', u: 'C', v: 'D', w: -3 },
    { id: 'CE', u: 'C', v: 'E', w: 9 }, { id: 'DB', u: 'D', v: 'B', w: -2 }, { id: 'ED', u: 'E', v: 'D', w: 7 }, { id: 'EA', u: 'E', v: 'A', w: 2 },
  ];
  function fmt(d) { return d === Infinity ? '∞' : String(d); }
  function model(dist, active, tree) {
    var nodes = NODES.map(function (n) { return { id: n.id, x: n.x, y: n.y, label: n.id, sub: fmt(dist[n.id]), cls: '' }; });
    var edges = EDGES.map(function (e) { return { id: e.id, u: e.u, v: e.v, w: e.w, cls: (e.id === active ? 'is-active' : (tree[e.v] === e.id ? 'is-tree' : '')) }; });
    return { nodes: nodes, edges: edges };
  }
  var CODE = ['dist[A]=0, อื่นๆ=∞', 'ทำซ้ำ V-1 รอบ:', '  for ทุกเส้น (u→v, w):', '    if dist[u]+w < dist[v]: dist[v]=dist[u]+w (relax)'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var dist = {}, tree = {}; NODES.forEach(function (n) { dist[n.id] = Infinity; }); dist.A = 0;
    S.add(DSA.GraphViz.snap(model(dist, null, tree)), 'ตั้ง dist[A]=0, ที่เหลือ=∞ · จะ relax ทุกเส้น ' + (NODES.length - 1) + ' รอบ', { line: 0 });
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
    S.add(DSA.GraphViz.snap(model(dist, null, tree)), '✅ ระยะสั้นสุดจาก A: ' + res, { line: -1 });
    return S.steps;
  }
  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  (function () { var dist = {}; NODES.forEach(function (n) { dist[n.id] = Infinity; }); dist.A = 0; var S = new DSA.Stepper(); S.add(DSA.GraphViz.snap(model(dist, null, {})), 'กราฟมีทิศ + น้ำหนักลบ (BE=−4, CD=−3, DB=−2) — กดรัน', { line: -1 }); api.setSteps(S.steps); })();
})();
