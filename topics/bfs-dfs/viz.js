/* BFS & DFS — ท่องกราฟตัวอย่าง (undirected) เห็นลำดับการเยี่ยม + queue/stack */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'bfs-dfs' });

  // ----- กราฟตัวอย่าง -----
  var NODES = [
    { id: 'A', x: 90, y: 210 }, { id: 'B', x: 250, y: 90 }, { id: 'C', x: 250, y: 330 },
    { id: 'D', x: 450, y: 90 }, { id: 'E', x: 450, y: 330 }, { id: 'F', x: 630, y: 210 },
  ];
  var EDGES = [
    { id: 'AB', u: 'A', v: 'B' }, { id: 'AC', u: 'A', v: 'C' }, { id: 'BC', u: 'B', v: 'C' },
    { id: 'BD', u: 'B', v: 'D' }, { id: 'CE', u: 'C', v: 'E' }, { id: 'DE', u: 'D', v: 'E' },
    { id: 'DF', u: 'D', v: 'F' }, { id: 'EF', u: 'E', v: 'F' },
  ];
  var adj = {};
  NODES.forEach(function (n) { adj[n.id] = []; });
  EDGES.forEach(function (e) { adj[e.u].push(e.v); adj[e.v].push(e.u); });
  Object.keys(adj).forEach(function (k) { adj[k].sort(); });
  function edgeId(u, v) { for (var i = 0; i < EDGES.length; i++) { var e = EDGES[i]; if ((e.u === u && e.v === v) || (e.u === v && e.v === u)) return e.id; } return null; }

  function model(cur, done, inq, treeEdges) {
    var nodes = NODES.map(function (n) {
      var cls = '';
      if (n.id === cur) cls = 'is-current';
      else if (done[n.id]) cls = 'is-visited';
      else if (inq[n.id]) cls = 'is-frontier';
      return { id: n.id, x: n.x, y: n.y, label: n.id, cls: cls };
    });
    var edges = EDGES.map(function (e) { return { id: e.id, u: e.u, v: e.v, cls: treeEdges[e.id] ? 'is-tree' : '' }; });
    return { nodes: nodes, edges: edges };
  }

  var BFS_CODE = ['BFS(start): queue=[start]; visited={start}', 'while queue ไม่ว่าง:', '  u = queue.dequeue()  // เยี่ยม u', '  for v in adj[u]:', '    if v ยังไม่ visited: visited.add(v); queue.enqueue(v)'];
  var DFS_CODE = ['DFS(u): visited.add(u)  // เยี่ยม u', 'for v in adj[u]:', '  if v ยังไม่ visited:', '    DFS(v)   // ลงลึกก่อน'];

  function bfsSteps(start) {
    api.setCode(BFS_CODE);
    var S = new DSA.Stepper();
    var done = {}, inq = {}, tree = {}, order = [];
    var queue = [start]; inq[start] = true;
    function add(cur, d, l) { S.add(DSA.GraphViz.snap(model(cur, done, inq, tree)), d, { line: l }); }
    add(null, 'เริ่ม BFS ที่ ' + start + ' → ใส่เข้า queue [' + queue.join(',') + ']', 0);
    while (queue.length) {
      var u = queue.shift(); delete inq[u];
      add(u, 'ดึง ' + u + ' จาก queue → เยี่ยม (queue เหลือ [' + queue.join(',') + '])', 2);
      done[u] = true; order.push(u);
      for (var i = 0; i < adj[u].length; i++) {
        var v = adj[u][i];
        if (!done[v] && !inq[v]) {
          inq[v] = true; queue.push(v); tree[edgeId(u, v)] = true;
          add(u, 'พบเพื่อนบ้าน ' + v + ' ยังไม่เยี่ยม → ใส่ queue [' + queue.join(',') + ']', 4);
        }
      }
    }
    S.add(DSA.GraphViz.snap(model(null, done, inq, tree)), '✅ จบ BFS — ลำดับการเยี่ยม: ' + order.join(' → '), { line: -1 });
    return S.steps;
  }

  function dfsSteps(start) {
    api.setCode(DFS_CODE);
    var S = new DSA.Stepper();
    var done = {}, tree = {}, order = [], stack = [];
    function inqMap() { var m = {}; stack.forEach(function (x) { m[x] = true; }); return m; }
    function add(cur, d, l) { S.add(DSA.GraphViz.snap(model(cur, done, inqMap(), tree)), d, { line: l }); }
    function dfs(u, parent) {
      stack.push(u);
      add(u, 'เยี่ยม ' + u + ' (call stack: [' + stack.join(',') + '])', 0);
      done[u] = true; order.push(u);
      if (parent != null) tree[edgeId(parent, u)] = true;
      for (var i = 0; i < adj[u].length; i++) {
        var v = adj[u][i];
        if (!done[v]) { add(u, u + ' → ไปต่อที่ ' + v + ' (ยังไม่เยี่ยม)', 2); dfs(v, u); add(u, 'ถอยกลับมาที่ ' + u, 1); }
      }
      stack.pop();
    }
    dfs(start, null);
    S.add(DSA.GraphViz.snap(model(null, done, {}, tree)), '✅ จบ DFS — ลำดับการเยี่ยม: ' + order.join(' → '), { line: -1 });
    return S.steps;
  }

  function getStart() { var s = (document.getElementById('g-start').value || 'A').trim().toUpperCase(); return adj[s] ? s : 'A'; }
  document.getElementById('g-bfs').addEventListener('click', function () { api.setSteps(bfsSteps(getStart())); });
  document.getElementById('g-dfs').addEventListener('click', function () { api.setSteps(dfsSteps(getStart())); });

  // เริ่มต้น: แสดงกราฟเฉยๆ
  (function () { var S = new DSA.Stepper(); S.add(DSA.GraphViz.snap(model(null, {}, {}, {})), 'กราฟตัวอย่าง — กด BFS หรือ DFS เพื่อเริ่มท่อง', { line: -1 }); api.setSteps(S.steps); })();
})();
