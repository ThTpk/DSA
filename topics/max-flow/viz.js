/* Maximum Flow — Edmonds-Karp (BFS augmenting paths) บน GraphViz */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'max-flow', weighted: true, directed: true });

  var NODES = [
    { id: 'S', x: 60, y: 200 }, { id: 'A', x: 250, y: 90 }, { id: 'B', x: 250, y: 320 },
    { id: 'C', x: 470, y: 90 }, { id: 'D', x: 470, y: 320 }, { id: 'T', x: 660, y: 200 }
  ];
  var ORIG = [
    { u: 'S', v: 'A', cap: 10 }, { u: 'S', v: 'B', cap: 10 }, { u: 'A', v: 'B', cap: 2 },
    { u: 'A', v: 'C', cap: 4 }, { u: 'A', v: 'D', cap: 8 }, { u: 'B', v: 'D', cap: 9 },
    { u: 'C', v: 'T', cap: 10 }, { u: 'D', v: 'C', cap: 6 }, { u: 'D', v: 'T', cap: 10 }
  ];
  ORIG.forEach(function (e) { e.id = e.u + e.v; });

  var res = {};
  function initRes() {
    res = {}; NODES.forEach(function (n) { res[n.id] = {}; });
    ORIG.forEach(function (e) { res[e.u][e.v] = (res[e.u][e.v] || 0) + e.cap; if (res[e.v][e.u] == null) res[e.v][e.u] = 0; });
  }

  function model(pathEdges, activeNodes) {
    var nodes = NODES.map(function (n) {
      var cls = (activeNodes && activeNodes.indexOf(n.id) !== -1) ? 'is-current' : '';
      return { id: n.id, x: n.x, y: n.y, label: n.id, cls: cls };
    });
    var edges = ORIG.map(function (e) {
      var flow = e.cap - res[e.u][e.v];
      var cls = pathEdges[e.id] ? 'is-active' : (flow > 0 ? 'is-tree' : '');
      return { id: e.id, u: e.u, v: e.v, w: Math.max(0, flow) + '/' + e.cap, cls: cls };
    });
    return { nodes: nodes, edges: edges };
  }

  var CODE = ['maxflow = 0', 'while มี augmenting path (BFS หา S→T ในกราฟส่วนเหลือ):', '  bottleneck = min ความจุเหลือบนเส้นทาง', '  ดันการไหล: res[u][v] −= b ; res[v][u] += b', '  maxflow += b', 'ไม่มี path แล้ว → maxflow คือคำตอบ'];

  function bfs() {
    var parent = {}, parentEdge = {}; parent['S'] = 'S';
    var q = ['S'];
    while (q.length) {
      var u = q.shift();
      for (var i = 0; i < NODES.length; i++) {
        var v = NODES[i].id;
        if (parent[v] == null && res[u][v] > 0) {
          parent[v] = u;
          // หา edge id เดิม (ถ้าเป็นทิศเดิม) เพื่อไฮไลต์
          parentEdge[v] = u + v;
          if (v === 'T') return { parent: parent, parentEdge: parentEdge };
          q.push(v);
        }
      }
    }
    return null;
  }

  function run() {
    api.setCode(CODE);
    initRes();
    var S = new DSA.Stepper();
    var maxflow = 0;
    S.add(DSA.GraphViz.snap(model({}, [])), 'เริ่ม: ทุกเส้น flow = 0 · หา augmenting path ด้วย BFS', { line: 0 });

    var guard = 0;
    while (guard++ < 50) {
      var r = bfs();
      if (!r) { S.add(DSA.GraphViz.snap(model({}, [])), 'ไม่มี augmenting path แล้ว → หยุด', { line: 1 }); break; }
      // สร้างเส้นทาง + bottleneck
      var path = [], node = 'T', bottleneck = Infinity, pe = {};
      while (node !== 'S') { var p = r.parent[node]; bottleneck = Math.min(bottleneck, res[p][node]); path.unshift(p + '→' + node); if (ORIG.some(function (e) { return e.id === p + node; })) pe[p + node] = true; node = p; }
      var pathNodes = []; node = 'T'; while (true) { pathNodes.unshift(node); if (node === 'S') break; node = r.parent[node]; }
      S.add(DSA.GraphViz.snap(model(pe, pathNodes)), 'พบเส้นทาง: ' + path.join(', ') + ' · คอขวด (bottleneck) = ' + bottleneck, { line: 2 });
      // augment
      node = 'T'; while (node !== 'S') { var p2 = r.parent[node]; res[p2][node] -= bottleneck; res[node][p2] += bottleneck; node = p2; }
      maxflow += bottleneck;
      S.add(DSA.GraphViz.snap(model({}, [])), 'ดันการไหล +' + bottleneck + ' ตามเส้นทาง → maxflow = ' + maxflow, { line: 4 });
    }
    S.add(DSA.GraphViz.snap(model({}, [])), '✅ การไหลสูงสุด (Max Flow) = ' + maxflow, { line: -1 });
    return S.steps;
  }

  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  (function () { initRes(); var S = new DSA.Stepper(); S.add(DSA.GraphViz.snap(model({}, [])), 'เครือข่ายการไหล (flow/capacity) — กด "หา Max Flow"', { line: -1 }); api.setSteps(S.steps); })();
})();
