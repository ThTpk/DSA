/* Bipartite Matching — Kuhn's augmenting path (GraphViz) */
(function () {
  var api = DSA.GraphViz.init({ topicId: 'bipartite-matching' });

  var L = ['L1', 'L2', 'L3', 'L4'], R = ['R1', 'R2', 'R3', 'R4'];
  var NODES = [];
  L.forEach(function (id, i) { NODES.push({ id: id, x: 230, y: 70 + i * 90 }); });
  R.forEach(function (id, i) { NODES.push({ id: id, x: 500, y: 70 + i * 90 }); });
  var ADJ = { L1: ['R1', 'R2'], L2: ['R1'], L3: ['R2', 'R3'], L4: ['R3', 'R4'] };
  var EDGES = [];
  Object.keys(ADJ).forEach(function (u) { ADJ[u].forEach(function (v) { EDGES.push({ id: u + v, u: u, v: v }); }); });

  function model(matchL, tryEdges, cur) {
    var nodes = NODES.map(function (n) {
      var matched = (matchL[n.id] != null) || Object.keys(matchL).some(function (k) { return matchL[k] === n.id; });
      var cls = n.id === cur ? 'is-current' : (matched ? 'is-visited' : '');
      return { id: n.id, x: n.x, y: n.y, label: n.id, cls: cls };
    });
    var edges = EDGES.map(function (e) {
      var inMatch = matchL[e.u] === e.v;
      var cls = tryEdges[e.id] ? 'is-active' : (inMatch ? 'is-tree' : '');
      return { id: e.id, u: e.u, v: e.v, cls: cls };
    });
    return { nodes: nodes, edges: edges };
  }

  var CODE = ['for แต่ละโหนดซ้าย u:', '  ลองหา augmenting path: augment(u)', 'augment(u):', '  for v ใน adj[u]:', '    if v ยังไม่ลองรอบนี้:', '      if v ว่าง หรือ augment(เจ้าของเดิมของ v) สำเร็จ:', '        จับคู่ u–v ; return true'];

  function run() {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var matchR = {}, matchL = {}, count = 0;
    function snap(tryEdges, cur, desc, line) { S.add(DSA.GraphViz.snap(model(matchL, tryEdges || {}, cur)), desc, { line: line }); }
    snap({}, null, 'เริ่ม: ยังไม่มีคู่', 0);

    L.forEach(function (u) {
      var seen = {};
      snap({}, u, 'ลองจับคู่ให้ ' + u, 1);
      function augment(x) {
        for (var i = 0; i < ADJ[x].length; i++) {
          var v = ADJ[x][i];
          if (seen[v]) continue;
          seen[v] = true;
          var te = {}; te[x + v] = true;
          snap(te, x, x + ' ลองเส้น → ' + v + (matchR[v] == null ? ' (ว่าง)' : ' (จองโดย ' + matchR[v] + ' → ลองดันไปที่อื่น)'), matchR[v] == null ? 5 : 5);
          if (matchR[v] == null || augment(matchR[v])) {
            matchR[v] = x; matchL[x] = v;
            snap({}, x, '✔ จับคู่ ' + x + ' – ' + v, 6);
            return true;
          }
        }
        return false;
      }
      if (augment(u)) count++;
      else snap({}, u, '✘ หาคู่ให้ ' + u + ' ไม่ได้', 1);
    });
    snap({}, null, '✅ จับคู่ได้สูงสุด ' + count + ' คู่: ' + L.filter(function (u) { return matchL[u]; }).map(function (u) { return u + '–' + matchL[u]; }).join(', '), -1);
    return S.steps;
  }

  document.getElementById('g-run').addEventListener('click', function () { api.setSteps(run()); });
  (function () { var S = new DSA.Stepper(); S.add(DSA.GraphViz.snap(model({}, {}, null)), 'กราฟสองฝั่ง (ซ้าย L · ขวา R) — กด "จับคู่"', { line: -1 }); api.setSteps(S.steps); })();
})();
