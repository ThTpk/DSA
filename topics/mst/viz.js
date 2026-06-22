/* MST — Kruskal (เรียงเส้น + Union-Find ตรวจวงจร) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'mst', weighted: true });

  var NODES, EDGES;

  function model(active, tree, faded, hiNodes) {
    var nodes = NODES.map(function (n) { return { id: n.id, x: n.x, y: n.y, label: n.id, cls: (hiNodes && hiNodes.indexOf(n.id) !== -1) ? 'is-current' : '' }; });
    var edges = EDGES.map(function (e) {
      var cls = e.id === active ? 'is-active' : (tree[e.id] ? 'is-tree' : (faded[e.id] ? 'is-faded' : ''));
      return { id: e.id, u: e.u, v: e.v, w: e.w, cls: cls };
    });
    return { nodes: nodes, edges: edges };
  }

  var CODE = ['Kruskal: เรียง edge ตามน้ำหนักจากน้อยไปมาก', 'for (u,v,w) in edges เรียงแล้ว:', '  if find(u) != find(v):   // ไม่เกิดวงจร', '    union(u,v); เพิ่ม (u,v) เข้า MST', '  else: ข้าม (เกิดวงจร)'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var tree = {}, faded = {}, total = 0, count = 0;
    var parent = {}; NODES.forEach(function (n) { parent[n.id] = n.id; });
    function find(x) { while (parent[x] !== x) x = parent[x]; return x; }

    var sorted = EDGES.slice().sort(function (a, b) { return a.w - b.w; });
    S.add(DSA.GraphViz.snap(model(null, tree, faded, [])), 'เรียงเส้นตามน้ำหนัก: ' + sorted.map(function (e) { return e.u + e.v + '(' + e.w + ')'; }).join(', '), { line: 0 });

    for (var i = 0; i < sorted.length; i++) {
      var e = sorted[i];
      S.add(DSA.GraphViz.snap(model(e.id, tree, faded, [e.u, e.v])), 'พิจารณา ' + e.u + '–' + e.v + ' (น้ำหนัก ' + e.w + '): หา root ของ ' + e.u + ',' + e.v, { line: 1 });
      if (find(e.u) !== find(e.v)) {
        parent[find(e.u)] = find(e.v); tree[e.id] = true; total += e.w; count++;
        S.add(DSA.GraphViz.snap(model(null, tree, faded, [])), '✔ คนละกลุ่ม → เพิ่ม ' + e.u + '–' + e.v + ' เข้า MST (รวม ' + total + ', ' + count + '/' + (NODES.length - 1) + ' เส้น)', { line: 3 });
        if (count === NODES.length - 1) break;
      } else {
        faded[e.id] = true;
        S.add(DSA.GraphViz.snap(model(null, tree, faded, [])), '✘ กลุ่มเดียวกันแล้ว → เพิ่มจะเกิดวงจร ข้าม ' + e.u + '–' + e.v, { line: 4 });
      }
    }
    var used = EDGES.filter(function (e) { return tree[e.id]; }).map(function (e) { return e.u + e.v; });
    S.add(DSA.GraphViz.snap(model(null, tree, faded, [])), '✅ MST เสร็จ — เส้น: ' + used.join(', ') + ' · น้ำหนักรวม = ' + total, { line: -1 });
    return S.steps;
  }

  function showInitial() {
    var S = new DSA.Stepper();
    S.add(DSA.GraphViz.snap(model(null, {}, {}, [])), 'กราฟมีน้ำหนัก ' + NODES.length + ' โหนด — กด "รัน Kruskal" เพื่อหา MST', { line: -1 });
    api.setSteps(S.steps);
  }
  function regen() {
    var g = DSA.GraphViz.generate(cfg.getN(), { weighted: true });
    NODES = g.nodes; EDGES = g.edges; showInitial();
  }

  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  var cfg = DSA.GraphViz.mountConfig({ defaultN: 6, onChange: regen });
  regen();
})();
