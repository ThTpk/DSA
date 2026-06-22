/* Maze Solver — DFS/backtracking หาทางจาก S ไป E (custom svg grid) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'maze-solver');
  var host = document.getElementById('mzviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="mz-svg" preserveAspectRatio="xMidYMid meet"></svg></div><div id="mz-controls"></div></div>' +
    '<div><div class="code-panel" id="mz-code"></div></div></div>';
  var svg = d3.select('#mz-svg'), gC = svg.append('g'), gT = svg.append('g');
  var codeEl = document.getElementById('mz-code');
  var CODE = ['solve(r, c):', '  if (r,c) == ออก: เจอทาง ✓', '  mark visited', '  for ทิศ (ลง/ขวา/บน/ซ้าย):', '    if ช่องว่าง & ยังไม่เคยไป: solve(ช่องนั้น)', '  ถ้าทุกทิศตัน: ถอยกลับ (backtrack)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var ROWS = 7, COLS = 9, CELL = 42, maze = [];
  function readSize() {
    var v = (document.getElementById('mz-size').value || '7x9').split('x');
    ROWS = parseInt(v[0], 10); COLS = parseInt(v[1], 10);
  }
  function genMaze() {
    // เริ่มจากกำแพงทั้งหมด แล้วเจาะทางเดิน (recursive backtracker) → มีทางออกแน่นอน
    maze = []; for (var r = 0; r < ROWS; r++) { maze.push([]); for (var c = 0; c < COLS; c++) maze[r].push(1); }
    function carve(r, c) {
      maze[r][c] = 0;
      var dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];
      for (var i = dirs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = dirs[i]; dirs[i] = dirs[j]; dirs[j] = t; }
      dirs.forEach(function (d) {
        var nr = r + d[0], nc = c + d[1];
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && maze[nr][nc] === 1) { maze[r + d[0] / 2][c + d[1] / 2] = 0; carve(nr, nc); }
      });
    }
    carve(0, 0);
    maze[ROWS - 1][COLS - 1] = 0; maze[ROWS - 1][COLS - 2] = 0; maze[ROWS - 2][COLS - 1] = 0;
  }

  function render(step) {
    var st = step.snapshot, sz = { w: COLS * CELL, h: ROWS * CELL };
    svg.attr('viewBox', '0 0 ' + sz.w + ' ' + sz.h);
    var cells = [];
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) cells.push({ r: r, c: c });
    var vis = st.visited || {}, path = st.path || {}, cur = st.current;
    function fill(d) {
      if (maze[d.r][d.c] === 1) return '#334155';
      if (cur && cur[0] === d.r && cur[1] === d.c) return '#f59e0b';
      if (path[d.r + ',' + d.c]) return '#10b981';
      if (vis[d.r + ',' + d.c]) return '#cbd5e1';
      return '#f8fafc';
    }
    var ce = gC.selectAll('rect').data(cells, function (d) { return d.r + '_' + d.c; });
    ce.enter().append('rect').attr('width', CELL - 2).attr('height', CELL - 2).attr('x', function (d) { return d.c * CELL + 1; }).attr('y', function (d) { return d.r * CELL + 1; }).attr('rx', 4)
      .merge(ce).attr('fill', fill).attr('stroke', '#e2e8f0');
    // S / E labels
    var marks = [{ r: 0, c: 0, t: 'S' }, { r: ROWS - 1, c: COLS - 1, t: 'E' }];
    var tl = gT.selectAll('text').data(marks);
    tl.enter().append('text').attr('text-anchor', 'middle').attr('font-weight', '700').attr('font-size', '18').attr('fill', '#4f46e5')
      .merge(tl).attr('x', function (d) { return d.c * CELL + CELL / 2; }).attr('y', function (d) { return d.r * CELL + CELL / 2 + 6; }).text(function (d) { return d.t; });
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var S = new DSA.Stepper();
    var visited = {}, path = {};
    function snap(cur, extra) { var o = { visited: {}, path: {}, current: cur }; for (var k in visited) o.visited[k] = 1; for (var k2 in path) o.path[k2] = 1; for (var e in extra) o[e] = extra[e]; return o; }
    function add(cur, desc, line) { S.add(snap(cur), desc, { line: line }); }
    var ER = ROWS - 1, EC = COLS - 1, found = false;
    var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    function dfs(r, c) {
      if (found) return true;
      visited[r + ',' + c] = 1; path[r + ',' + c] = 1;
      add([r, c], 'อยู่ที่ (' + r + ',' + c + ')', 0);
      if (r === ER && c === EC) { found = true; add(null, '🎉 ถึงทางออก (E) แล้ว! เส้นทางสีเขียวคือคำตอบ', 1); return true; }
      for (var i = 0; i < DIRS.length; i++) {
        var nr = r + DIRS[i][0], nc = c + DIRS[i][1];
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && maze[nr][nc] === 0 && !visited[nr + ',' + nc]) {
          add([r, c], 'ลองเดินไป (' + nr + ',' + nc + ')', 4);
          if (dfs(nr, nc)) return true;
          if (!found) add([r, c], 'ทาง (' + nr + ',' + nc + ') ตัน → กลับมา (' + r + ',' + c + ')', 5);
        }
      }
      if (!found) { delete path[r + ',' + c]; add(null, '(' + r + ',' + c + ') ทุกทิศตัน → ถอยกลับ (เอาออกจากเส้นทาง)', 5); }
      return false;
    }
    add([0, 0], 'เริ่มที่ S (0,0) หาทางไป E (' + ER + ',' + EC + ')', 0);
    dfs(0, 0);
    return S.steps;
  }

  var player;
  function run() {
    if (!player) player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('mz-controls'), speed: 250 });
    player.setSteps(build());
  }
  document.getElementById('mz-run').addEventListener('click', run);
  document.getElementById('mz-random').addEventListener('click', function () { genMaze(); run(); });
  document.getElementById('mz-size').addEventListener('change', function () { readSize(); genMaze(); run(); });
  readSize(); genMaze(); run();
})();
