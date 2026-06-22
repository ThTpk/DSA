/* Strongly Connected Components — Kosaraju (DFS 2 รอบ) บน GraphViz */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'scc', directed: true });

  // ใช้ layout วงกลมจาก generate แล้วแทนเส้นด้วยกราฟที่มีวงจรชัด
  var g = DSA.GraphViz.generate(8, { directed: true });
  var NODES = g.nodes;
  var E = [
    ['A', 'B'], ['B', 'E'], ['E', 'A'],   // SCC {A,B,E}
    ['B', 'C'], ['C', 'D'], ['D', 'C'],   // SCC {C,D}
    ['C', 'H'], ['E', 'F'], ['F', 'G'], ['G', 'F'], // SCC {F,G}
    ['D', 'G'], ['G', 'H']                // H = singleton
  ];
  var EDGES = E.map(function (e) { return { id: e[0] + e[1], u: e[0], v: e[1] }; });
  var adj = {}, radj = {};
  NODES.forEach(function (n) { adj[n.id] = []; radj[n.id] = []; });
  EDGES.forEach(function (e) { adj[e.u].push(e.v); radj[e.v].push(e.u); });
  Object.keys(adj).forEach(function (k) { adj[k].sort(); radj[k].sort(); });

  function model(comp, cur, visited, intra) {
    var nodes = NODES.map(function (n) {
      var cls = n.id === cur ? 'is-current' : (visited[n.id] ? 'is-visited' : '');
      return { id: n.id, x: n.x, y: n.y, label: n.id, sub: (comp[n.id] != null ? 'SCC ' + (comp[n.id] + 1) : ''), cls: cls };
    });
    var edges = EDGES.map(function (e) { return { id: e.id, u: e.u, v: e.v, cls: (intra[e.id] ? 'is-tree' : '') }; });
    return { nodes: nodes, edges: edges };
  }

  var CODE = ['รอบ 1: DFS บนกราฟเดิม → ดันลำดับ finish ลงสแตก', 'กลับทิศทุกเส้น (transpose)', 'รอบ 2: DFS ตามลำดับ finish (หลัง→หน้า)', '  แต่ละต้นไม้ DFS = 1 SCC'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var visited = {}, order = [], comp = {};
    function add(cur, desc, line) { S.add(DSA.GraphViz.snap(model(comp, cur, visited, {})), desc, { line: line }); }

    // รอบ 1
    add(null, 'รอบ 1: DFS หาลำดับ finish', 0);
    function dfs1(u) {
      visited[u] = true; add(u, 'เยี่ยม ' + u, 0);
      adj[u].forEach(function (v) { if (!visited[v]) dfs1(v); });
      order.push(u); add(u, u + ' เสร็จ (finish) → ดันลงสแตก', 0);
    }
    NODES.forEach(function (n) { if (!visited[n.id]) dfs1(n.id); });
    add(null, 'ลำดับ finish (ล่างสุด→บนสุดของสแตก): ' + order.join(', '), 1);

    // รอบ 2 บน transpose
    var seen = {}, cid = 0, members;
    function dfs2(u) { seen[u] = true; comp[u] = cid; members.push(u); radj[u].forEach(function (v) { if (!seen[v]) dfs2(v); }); }
    for (var i = order.length - 1; i >= 0; i--) {
      var u = order[i];
      if (!seen[u]) {
        members = [];
        dfs2(u);
        // เส้นภายใน SCC
        var intra = {};
        EDGES.forEach(function (e) { if (comp[e.u] === cid && comp[e.v] === cid) intra[e.id] = true; });
        S.add(DSA.GraphViz.snap(model(comp, null, visited, intra)), '🎯 SCC ' + (cid + 1) + ' = {' + members.sort().join(', ') + '}', { line: 3 });
        cid++;
      }
    }
    var allIntra = {};
    EDGES.forEach(function (e) { if (comp[e.u] === comp[e.v]) allIntra[e.id] = true; });
    S.add(DSA.GraphViz.snap(model(comp, null, visited, allIntra)), '✅ เจอ ' + cid + ' SCC (เส้นในกลุ่มเดียวกันถูกไฮไลต์)', { line: -1 });
    return S.steps;
  }

  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  (function () { var S = new DSA.Stepper(); S.add(DSA.GraphViz.snap(model({}, null, {}, {})), 'กราฟมีทิศ 8 โหนด — กด "หา SCC" เพื่อรัน Kosaraju', { line: -1 }); api.setSteps(S.steps); })();
})();
