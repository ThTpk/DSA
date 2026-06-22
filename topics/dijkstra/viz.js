/* Dijkstra — เส้นทางสั้นที่สุดจากจุดเริ่ม (กราฟมีน้ำหนัก ไม่ติดลบ) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'dijkstra', weighted: true });

  var NODES, EDGES, adj;
  function buildAdj() {
    adj = {}; NODES.forEach(function (n) { adj[n.id] = []; });
    EDGES.forEach(function (e) { adj[e.u].push({ v: e.v, w: e.w, id: e.id }); adj[e.v].push({ v: e.u, w: e.w, id: e.id }); });
  }

  function fmt(d) { return d === Infinity ? '∞' : String(d); }
  function model(cur, dist, visited, activeEdge, tree) {
    var nodes = NODES.map(function (n) {
      var cls = n.id === cur ? 'is-current' : (visited[n.id] ? 'is-visited' : '');
      return { id: n.id, x: n.x, y: n.y, label: n.id, sub: fmt(dist[n.id]), cls: cls };
    });
    var edges = EDGES.map(function (e) {
      var cls = (e.id === activeEdge) ? 'is-active' : (tree[e.id] ? 'is-tree' : '');
      return { id: e.id, u: e.u, v: e.v, w: e.w, cls: cls };
    });
    return { nodes: nodes, edges: edges };
  }

  var CODE = ['dist[start]=0, อื่นๆ=∞ ; visited={}', 'ทำซ้ำจนครบ:', '  เลือก u ที่ยังไม่ visited & dist น้อยสุด', '  mark u visited', '  for (v,w) in adj[u]:', '    if dist[u]+w < dist[v]: dist[v]=dist[u]+w  // relax'];

  function run(start) {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var dist = {}, visited = {}, prev = {}, tree = {};
    NODES.forEach(function (n) { dist[n.id] = Infinity; });
    dist[start] = 0;
    function add(cur, ae, d, l) { S.add(DSA.GraphViz.snap(model(cur, dist, visited, ae, tree)), d, { line: l }); }
    add(null, null, 'ตั้ง dist[' + start + ']=0, ที่เหลือ=∞', 0);

    while (true) {
      var u = null, best = Infinity;
      NODES.forEach(function (n) { if (!visited[n.id] && dist[n.id] < best) { best = dist[n.id]; u = n.id; } });
      if (u == null) break;
      add(u, null, 'เลือก ' + u + ' (dist=' + dist[u] + ' น้อยสุดในกลุ่มที่ยังไม่ยืนยัน) → ยืนยัน', 2);
      visited[u] = true;
      if (prev[u]) tree[prev[u].eid] = true;
      for (var i = 0; i < adj[u].length; i++) {
        var e = adj[u][i]; if (visited[e.v]) continue;
        var nd = dist[u] + e.w;
        if (nd < dist[e.v]) {
          dist[e.v] = nd; prev[e.v] = { node: u, eid: e.id };
          add(u, e.id, 'relax ' + u + '→' + e.v + ': ' + dist[u] + '+' + e.w + ' = ' + nd + ' ดีกว่าเดิม → อัปเดต dist[' + e.v + ']=' + nd, 5);
        } else {
          add(u, e.id, 'ตรวจ ' + u + '→' + e.v + ': ' + dist[u] + '+' + e.w + ' = ' + nd + ' ไม่ดีกว่า dist[' + e.v + ']=' + fmt(dist[e.v]) + ' → ไม่เปลี่ยน', 5);
        }
      }
    }
    var res = NODES.map(function (n) { return n.id + '=' + fmt(dist[n.id]); }).join(', ');
    S.add(DSA.GraphViz.snap(model(null, dist, visited, null, tree)), '✅ เสร็จ — ระยะสั้นสุดจาก ' + start + ': ' + res, { line: -1 });
    return S.steps;
  }

  function getStart() { var s = (document.getElementById('g-start').value || 'A').trim().toUpperCase(); return adj[s] ? s : NODES[0].id; }

  function showInitial() {
    var dist = {}; NODES.forEach(function (n) { dist[n.id] = Infinity; });
    var S = new DSA.Stepper();
    S.add(DSA.GraphViz.snap(model(null, dist, {}, null, {})), 'กราฟมีน้ำหนัก ' + NODES.length + ' โหนด — กด "รัน Dijkstra" เพื่อเริ่ม', { line: -1 });
    api.setSteps(S.steps);
  }
  function regen() {
    var g = DSA.GraphViz.generate(cfg.getN(), { weighted: true });
    NODES = g.nodes; EDGES = g.edges; buildAdj(); showInitial();
  }

  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run(getStart())); });
  var cfg = DSA.GraphViz.mountConfig({ defaultN: 6, onChange: regen });
  regen();
})();
