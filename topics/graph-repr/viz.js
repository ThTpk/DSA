/* การแทนกราฟ — วาดกราฟ + สร้าง Adjacency Matrix และ List ทีละเส้น (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'graph-repr');

  var NODES, IDS, POS, EDGES;

  var host = document.getElementById('reprviz');
  host.innerHTML =
    '<div class="viz-input">' +
      '<label style="align-self:center;color:var(--c-muted)">จำนวนโหนด:</label>' +
      '<input type="number" id="g-nodes" min="3" max="8" value="5" class="sv-target-input" style="flex:0 0 64px">' +
      '<button class="vp__btn" id="g-random">🎲 สุ่มกราฟใหม่</button>' +
    '</div>' +
    '<div class="viz-grid">' +
      '<div><div class="viz-stage"><svg class="viz-svg" id="rv-svg" viewBox="0 0 390 380" preserveAspectRatio="xMidYMid meet"></svg></div><div id="rv-controls"></div></div>' +
      '<div class="adj-wrap">' +
        '<div><div class="adj-title">Adjacency Matrix (n×n)</div><div id="rv-matrix"></div></div>' +
        '<div><div class="adj-title">Adjacency List</div><div id="rv-list" class="adj-list"></div></div>' +
      '</div>' +
    '</div>';

  var svg = d3.select('#rv-svg');
  var R = 20;
  var matrixEl = document.getElementById('rv-matrix');
  var listEl = document.getElementById('rv-list');

  function render(step) {
    var st = step.snapshot;
    var filled = st.filled, active = st.active;
    var adjSet = {}; IDS.forEach(function (u) { adjSet[u] = {}; });
    EDGES.forEach(function (e) { if (filled[e.id]) { adjSet[e.u][e.v] = 1; adjSet[e.v][e.u] = 1; } });
    var act = active ? EDGES.filter(function (e) { return e.id === active; })[0] : null;

    svg.selectAll('line.gedge').attr('class', function () {
      var id = this.getAttribute('data-id');
      return 'gedge ' + (id === active ? 'is-active' : (filled[id] ? 'is-tree' : 'is-faded'));
    });

    var html = '<table class="adj-matrix"><tr><th></th>' + IDS.map(function (v) { return '<th>' + v + '</th>'; }).join('') + '</tr>';
    IDS.forEach(function (u) {
      html += '<tr><th>' + u + '</th>';
      IDS.forEach(function (v) {
        var on = adjSet[u][v] ? 1 : 0;
        var isAct = act && ((act.u === u && act.v === v) || (act.u === v && act.v === u));
        html += '<td class="' + (isAct ? 'active' : (on ? 'on' : '')) + '">' + on + '</td>';
      });
      html += '</tr>';
    });
    html += '</table>';
    matrixEl.innerHTML = html;

    listEl.innerHTML = IDS.map(function (u) {
      var nb = IDS.filter(function (v) { return adjSet[u][v]; });
      var hot = act && (act.u === u || act.v === u);
      var items = nb.map(function (v) {
        var isNew = act && ((act.u === u && act.v === v) || (act.v === u && act.u === v));
        return isNew ? '<span class="hl">' + v + '</span>' : v;
      }).join(', ');
      return '<div' + (hot ? ' style="font-weight:600"' : '') + '><span class="node">' + u + '</span> → ' + (items || '—') + '</div>';
    }).join('');
  }

  function buildSteps() {
    var S = new DSA.Stepper();
    var filled = {};
    S.add({ filled: {}, active: null }, 'กราฟเปล่า — matrix เป็น 0 ทั้งหมด, list ว่าง', { line: -1 });
    EDGES.forEach(function (e) {
      var snap = {}; for (var k in filled) snap[k] = filled[k]; snap[e.id] = true;
      S.add({ filled: snap, active: e.id }, 'เพิ่มเส้น ' + e.u + '–' + e.v + ' → matrix[' + e.u + '][' + e.v + '] และ [' + e.v + '][' + e.u + '] = 1 ; เพิ่มในลิสต์ของทั้งสองโหนด', { line: -1 });
      filled[e.id] = true;
    });
    var allFilled = {}; EDGES.forEach(function (e) { allFilled[e.id] = true; });
    S.add({ filled: allFilled, active: null }, '✅ ใส่ครบ ' + EDGES.length + ' เส้น — เทียบ 2 รูปแบบได้เลย', { line: -1 });
    return S.steps;
  }

  function drawStatic() {
    svg.selectAll('*').remove();
    svg.append('g').selectAll('line').data(EDGES).enter().append('line').attr('class', 'gedge').attr('data-id', function (e) { return e.id; })
      .each(function (e) {
        var a = POS[e.u], b = POS[e.v], dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy) || 1;
        d3.select(this).attr('x1', a.x + dx / L * R).attr('y1', a.y + dy / L * R).attr('x2', b.x - dx / L * R).attr('y2', b.y - dy / L * R);
      });
    var gn = svg.append('g').selectAll('g').data(NODES).enter().append('g').attr('class', 'gnode').attr('transform', function (n) { return 'translate(' + n.x + ',' + n.y + ')'; });
    gn.append('circle').attr('r', R);
    gn.append('text').attr('class', 'gnode__label').attr('dy', '.34em').text(function (n) { return n.id; });
  }

  var nodesInput = document.getElementById('g-nodes');
  function getN() { var v = parseInt(nodesInput.value, 10); if (isNaN(v)) v = 5; return Math.max(3, Math.min(8, v)); }

  var player;
  function regen() {
    var g = DSA.GraphViz.generate(getN(), { vw: 390, vh: 380, density: 0.35 });
    NODES = g.nodes; EDGES = g.edges;
    IDS = NODES.map(function (n) { return n.id; });
    POS = {}; NODES.forEach(function (n) { POS[n.id] = n; });
    drawStatic();
    if (!player) player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('rv-controls'), speed: 800 });
    player.setSteps(buildSteps());
  }

  document.getElementById('g-random').addEventListener('click', regen);
  nodesInput.addEventListener('change', function () { nodesInput.value = getN(); regen(); });
  regen();
})();
