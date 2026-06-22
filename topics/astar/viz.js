/* A* Search — หาเส้นทางสั้นสุดบน grid ด้วย f = g + h (custom svg grid) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'astar');
  var host = document.getElementById('asviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="as-svg" preserveAspectRatio="xMidYMid meet"></svg></div><div id="as-controls"></div></div>' +
    '<div><div class="code-panel" id="as-code"></div></div></div>';
  var svg = d3.select('#as-svg'), gCells = svg.append('g'), gText = svg.append('g'), gMark = svg.append('g');
  var codeEl = document.getElementById('as-code');
  var CODE = [
    'open = {start};  g[start]=0',                 // 0
    'while open ไม่ว่าง:',                          // 1
    '  cur = node ใน open ที่ f น้อยสุด',           // 2
    '  if cur == goal: คืนเส้นทาง ✓',               // 3
    '  ย้าย cur: open → closed',                    // 4
    '  for เพื่อนบ้าน nb ของ cur:',                 // 5
    '    g_new = g[cur] + 1',                       // 6
    '    if g_new < g[nb]: อัปเดต g,f,came_from',   // 7
  ];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var ROWS = 8, COLS = 11, CELL = 50, grid = [];
  var SR = 0, SC = 0, ER = ROWS - 1, EC = COLS - 1;
  function readSize() {
    var v = (document.getElementById('as-size').value || '8x11').split('x');
    ROWS = parseInt(v[0], 10); COLS = parseInt(v[1], 10);
    SR = 0; SC = 0; ER = ROWS - 1; EC = COLS - 1;
  }
  function key(r, c) { return r + ',' + c; }
  function manhattan(r, c) { return Math.abs(r - ER) + Math.abs(c - EC); }

  function reachable() {
    // BFS เช็กว่ามีทางจาก start ไป goal หรือไม่
    var seen = {}, q = [[SR, SC]]; seen[key(SR, SC)] = 1;
    var D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (q.length) {
      var cur = q.shift();
      if (cur[0] === ER && cur[1] === EC) return true;
      for (var i = 0; i < 4; i++) {
        var nr = cur[0] + D[i][0], nc = cur[1] + D[i][1];
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === 0 && !seen[key(nr, nc)]) {
          seen[key(nr, nc)] = 1; q.push([nr, nc]);
        }
      }
    }
    return false;
  }

  function genGrid() {
    do {
      grid = [];
      for (var r = 0; r < ROWS; r++) { grid.push([]); for (var c = 0; c < COLS; c++) grid[r].push(Math.random() < 0.28 ? 1 : 0); }
      grid[SR][SC] = 0; grid[ER][EC] = 0;
    } while (!reachable());
  }

  function render(step) {
    var st = step.snapshot;
    svg.attr('viewBox', '0 0 ' + (COLS * CELL) + ' ' + (ROWS * CELL));
    var cells = [];
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) cells.push({ r: r, c: c });
    var open = st.open || {}, closed = st.closed || {}, path = st.path || {}, info = st.info || {}, cur = st.current;

    function fill(d) {
      if (grid[d.r][d.c] === 1) return '#334155';
      if (cur && cur[0] === d.r && cur[1] === d.c) return '#f59e0b';
      if (path[key(d.r, d.c)]) return '#10b981';
      if (closed[key(d.r, d.c)]) return '#cbd5e1';
      if (open[key(d.r, d.c)]) return '#bfdbfe';
      return '#f8fafc';
    }
    var ce = gCells.selectAll('rect').data(cells, function (d) { return d.r + '_' + d.c; });
    ce.enter().append('rect').attr('width', CELL - 2).attr('height', CELL - 2)
        .attr('x', function (d) { return d.c * CELL + 1; }).attr('y', function (d) { return d.r * CELL + 1; }).attr('rx', 4)
      .merge(ce).attr('fill', fill).attr('stroke', '#e2e8f0');

    // f กลางช่อง (เลขใหญ่)
    function txt(sel, cls, fn, attrs) {
      var t = gText.selectAll('text.' + cls).data(cells, function (d) { return d.r + '_' + d.c; });
      var en = t.enter().append('text').attr('class', cls).attr('text-anchor', attrs.anchor).attr('font-size', attrs.size).attr('font-weight', attrs.weight).attr('fill', attrs.fill);
      en.merge(t).attr('x', attrs.x).attr('y', attrs.y).text(fn);
    }
    var showNum = function (d) { return grid[d.r][d.c] === 0 && info[key(d.r, d.c)]; };
    txt(svg, 'f-val', function (d) { return showNum(d) ? info[key(d.r, d.c)].f : ''; },
      { anchor: 'middle', size: 16, weight: 700, fill: '#0f172a', x: function (d) { return d.c * CELL + CELL / 2; }, y: function (d) { return d.r * CELL + CELL / 2 + 6; } });
    txt(svg, 'g-val', function (d) { return showNum(d) ? 'g' + info[key(d.r, d.c)].g : ''; },
      { anchor: 'start', size: 10, weight: 500, fill: '#2563eb', x: function (d) { return d.c * CELL + 4; }, y: function (d) { return d.r * CELL + 13; } });
    txt(svg, 'h-val', function (d) { return showNum(d) ? 'h' + info[key(d.r, d.c)].h : ''; },
      { anchor: 'end', size: 10, weight: 500, fill: '#7c3aed', x: function (d) { return d.c * CELL + CELL - 4; }, y: function (d) { return d.r * CELL + 13; } });

    // ป้าย S / E
    var marks = [{ r: SR, c: SC, t: 'S' }, { r: ER, c: EC, t: 'E' }];
    var ml = gMark.selectAll('text').data(marks);
    ml.enter().append('text').attr('text-anchor', 'middle').attr('font-weight', '700').attr('font-size', '13').attr('fill', '#4f46e5')
      .merge(ml).attr('x', function (d) { return d.c * CELL + CELL / 2; }).attr('y', function (d) { return d.r * CELL + CELL - 5; }).text(function (d) { return d.t; });

    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var S = new DSA.Stepper();
    var g = {}, h = {}, f = {}, came = {}, open = {}, closed = {};
    var DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    function info() {
      var o = {};
      for (var kk in f) o[kk] = { g: g[kk], h: h[kk], f: f[kk] };
      return o;
    }
    function snap(cur, extra) {
      var o = { open: {}, closed: {}, path: {}, info: info(), current: cur };
      for (var k1 in open) o.open[k1] = 1;
      for (var k2 in closed) o.closed[k2] = 1;
      for (var e in extra) o[e] = extra[e];
      return o;
    }
    function add(cur, desc, line, extra) { S.add(snap(cur, extra), desc, { line: line }); }

    var sk = key(SR, SC);
    g[sk] = 0; h[sk] = manhattan(SR, SC); f[sk] = h[sk]; open[sk] = 1;
    add([SR, SC], 'เริ่มที่ S (0,0): g=0, h=' + h[sk] + ', f=' + f[sk] + ' → ใส่ใน open set', 0);

    while (true) {
      // หา node ใน open ที่ f น้อยสุด (เสมอกัน → h น้อยกว่า)
      var bestK = null;
      for (var ok in open) {
        if (bestK === null || f[ok] < f[bestK] || (f[ok] === f[bestK] && h[ok] < h[bestK])) bestK = ok;
      }
      if (bestK === null) { add(null, '❌ open set ว่างแล้ว — ไม่มีเส้นทางไป E', 1); return S.steps; }

      var parts = bestK.split(','), cr = +parts[0], cc = +parts[1];
      add([cr, cc], 'เลือก (' + cr + ',' + cc + ') ที่มี f=' + f[bestK] + ' น้อยที่สุดใน open', 2);

      if (cr === ER && cc === EC) {
        // สร้างเส้นทางย้อนกลับ
        var path = {}, ck = bestK;
        while (ck != null) { path[ck] = 1; ck = came[ck]; }
        add([cr, cc], '🎉 ถึง E แล้ว! ย้อนรอย came_from ได้เส้นทางสั้นสุด (ระยะ = g = ' + g[bestK] + ')', 3, { path: path });
        return S.steps;
      }

      delete open[bestK]; closed[bestK] = 1;
      add([cr, cc], 'ย้าย (' + cr + ',' + cc + ') เข้า closed set แล้วสำรวจเพื่อนบ้าน', 4);

      for (var d = 0; d < 4; d++) {
        var nr = cr + DIRS[d][0], nc = cc + DIRS[d][1];
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (grid[nr][nc] === 1 || closed[key(nr, nc)]) continue;
        var nk = key(nr, nc);
        var gNew = g[bestK] + 1;
        if (g[nk] === undefined || gNew < g[nk]) {
          var fresh = (g[nk] === undefined);
          came[nk] = bestK; g[nk] = gNew; h[nk] = manhattan(nr, nc); f[nk] = gNew + h[nk]; open[nk] = 1;
          add([cr, cc], (fresh ? 'เพิ่ม' : 'อัปเดต') + ' (' + nr + ',' + nc + '): g=' + g[nk] + ', h=' + h[nk] + ', f=' + f[nk], 7);
        }
      }
    }
  }

  var player;
  function run() {
    if (!player) player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('as-controls'), speed: 350 });
    player.setSteps(build());
  }
  document.getElementById('as-run').addEventListener('click', run);
  document.getElementById('as-random').addEventListener('click', function () { genGrid(); run(); });
  document.getElementById('as-size').addEventListener('change', function () { readSize(); genGrid(); run(); });
  readSize(); genGrid(); run();
})();
