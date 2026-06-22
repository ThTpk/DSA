/* Articulation Points & Bridges — DFS disc/low (GraphViz, undirected) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'articulation' });

  var g = DSA.GraphViz.generate(7, {});
  var NODES = g.nodes;
  var E = [['A', 'B'], ['B', 'C'], ['A', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'F'], ['D', 'F'], ['F', 'G']];
  var EDGES = E.map(function (e) { return { id: e[0] + e[1], u: e[0], v: e[1] }; });
  var adj = {}; NODES.forEach(function (n) { adj[n.id] = []; });
  EDGES.forEach(function (e) { adj[e.u].push(e.v); adj[e.v].push(e.u); });
  Object.keys(adj).forEach(function (k) { adj[k].sort(); });
  function eid(u, v) { for (var i = 0; i < EDGES.length; i++) { var e = EDGES[i]; if ((e.u === u && e.v === v) || (e.u === v && e.v === u)) return e.id; } return null; }

  function model(cur, ap, bridge, info) {
    var nodes = NODES.map(function (n) {
      var cls = n.id === cur ? 'is-current' : (ap[n.id] ? 'is-visited' : '');
      return { id: n.id, x: n.x, y: n.y, label: n.id, sub: (info[n.id] || ''), cls: cls };
    });
    var edges = EDGES.map(function (e) { return { id: e.id, u: e.u, v: e.v, cls: (bridge[e.id] ? 'is-active' : '') }; });
    return { nodes: nodes, edges: edges };
  }

  var CODE = ['dfs(u, parent):', '  disc[u] = low[u] = ++timer', '  for v in adj[u]:', '    if v ยังไม่ค้นพบ: dfs(v,u); low[u] = min(low[u], low[v])', '      if low[v] ≥ disc[u] (ไม่ใช่ราก): u = จุดบอบบาง', '      if low[v] > disc[u]: (u,v) = สะพาน', '    elif v ≠ parent: low[u] = min(low[u], disc[v])'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var disc = {}, low = {}, ap = {}, bridge = {}, timer = 0;
    function info() { var o = {}; NODES.forEach(function (n) { if (disc[n.id] != null) o[n.id] = disc[n.id] + '/' + low[n.id]; }); return o; }
    function add(cur, desc, line) { S.add(DSA.GraphViz.snap(model(cur, ap, bridge, info())), desc, { line: line }); }

    function dfs(u, parent) {
      disc[u] = low[u] = ++timer; var children = 0;
      add(u, 'เยี่ยม ' + u + ': disc=low=' + disc[u], 1);
      adj[u].forEach(function (v) {
        if (disc[v] == null) {
          children++;
          add(u, u + ' → ลงลึกไป ' + v, 3);
          dfs(v, u);
          low[u] = Math.min(low[u], low[v]);
          add(u, 'กลับมา ' + u + ': low[' + u + '] = min → ' + low[u], 3);
          if (parent !== null && low[v] >= disc[u]) { ap[u] = true; add(u, '🔶 ' + u + ' เป็นจุดบอบบาง (low[' + v + ']=' + low[v] + ' ≥ disc[' + u + ']=' + disc[u] + ')', 4); }
          if (low[v] > disc[u]) { bridge[eid(u, v)] = true; add(u, '🌉 เส้น ' + u + '–' + v + ' เป็นสะพาน (low[' + v + ']=' + low[v] + ' > disc[' + u + ']=' + disc[u] + ')', 5); }
        } else if (v !== parent) {
          low[u] = Math.min(low[u], disc[v]);
          add(u, 'back-edge ' + u + '→' + v + ': low[' + u + '] = min → ' + low[u], 6);
        }
      });
      if (parent === null && children > 1) { ap[u] = true; add(u, '🔶 ราก ' + u + ' มีลูก ' + children + ' ต้น → เป็นจุดบอบบาง', 4); }
    }

    add(null, 'เริ่ม DFS หา disc/low (ตัวเลขใต้โหนด = disc/low)', 0);
    NODES.forEach(function (n) { if (disc[n.id] == null) dfs(n.id, null); });
    var apList = Object.keys(ap).sort(), brList = Object.keys(bridge);
    S.add(DSA.GraphViz.snap(model(null, ap, bridge, info())), '✅ จุดบอบบาง: {' + apList.join(', ') + '} · สะพาน: ' + brList.join(', '), { line: -1 });
    return S.steps;
  }

  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  (function () { var S = new DSA.Stepper(); S.add(DSA.GraphViz.snap(model(null, {}, {}, {})), 'กราฟไม่มีทิศ — กด "หา AP / Bridge"', { line: -1 }); api.setSteps(S.steps); })();
})();
