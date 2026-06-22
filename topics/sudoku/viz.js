/* Sudoku Solver — 9x9 backtracking (custom svg grid) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'sudoku');
  var host = document.getElementById('suviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="su-svg" viewBox="0 0 366 366" preserveAspectRatio="xMidYMid meet" style="max-width:420px"></svg></div><div id="su-controls"></div></div>' +
    '<div><div class="code-panel" id="su-code"></div></div></div>';
  var svg = d3.select('#su-svg'), gC = svg.append('g'), gT = svg.append('g'), gL = svg.append('g');
  var codeEl = document.getElementById('su-code');
  var CODE = ['solve():', '  หาช่องว่างถัดไป (ถ้าไม่มี = เสร็จ)', '  for v = 1..9:', '    if v ไม่ขัดแถว/คอลัมน์/บล็อก:', '      ใส่ v → solve()', '    ถ้าตัน: เอา v ออก (backtrack)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var CELL = 40, PAD = 3;
  // โจทย์: กริดสมบูรณ์ที่เจาะช่องว่างไว้ 8 ช่อง (0 = ว่าง)
  var SOLUTION = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2], [6, 7, 2, 1, 9, 5, 3, 4, 8], [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3], [4, 2, 6, 8, 5, 3, 7, 9, 1], [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4], [2, 8, 7, 4, 1, 9, 6, 3, 5], [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  var BLANKS = [[0, 2], [1, 5], [2, 0], [3, 8], [4, 4], [5, 1], [7, 3], [8, 6]];

  function render(step) {
    var st = step.snapshot, g = st.grid;
    var data = [];
    for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) data.push({ r: r, c: c });
    function fill(d) {
      if (st.cur && st.cur[0] === d.r && st.cur[1] === d.c) return st.status === 'conflict' ? '#fca5a5' : (st.status === 'place' ? '#a7f3d0' : '#fde68a');
      if (st.clue[d.r][d.c]) return '#e2e8f0';
      return '#ffffff';
    }
    var ce = gC.selectAll('rect').data(data, function (d) { return d.r + '_' + d.c; });
    ce.enter().append('rect').attr('width', CELL).attr('height', CELL).attr('x', function (d) { return PAD + d.c * CELL; }).attr('y', function (d) { return PAD + d.r * CELL; })
      .merge(ce).attr('fill', fill).attr('stroke', '#cbd5e1');
    var tx = gT.selectAll('text').data(data, function (d) { return 't' + d.r + '_' + d.c; });
    tx.enter().append('text').attr('text-anchor', 'middle').attr('font-family', 'JetBrains Mono, monospace').attr('font-size', '20').attr('font-weight', '700')
      .merge(tx).attr('x', function (d) { return PAD + d.c * CELL + CELL / 2; }).attr('y', function (d) { return PAD + d.r * CELL + CELL / 2 + 7; })
      .attr('fill', function (d) { return st.clue[d.r][d.c] ? '#1e293b' : '#2563eb'; })
      .text(function (d) { return g[d.r][d.c] || ''; });
    // เส้นแบ่งบล็อก 3x3 (วาดครั้งเดียว)
    if (gL.selectAll('line').empty()) {
      for (var i = 0; i <= 9; i += 3) {
        gL.append('line').attr('x1', PAD + i * CELL).attr('y1', PAD).attr('x2', PAD + i * CELL).attr('y2', PAD + 9 * CELL).attr('stroke', '#334155').attr('stroke-width', 2.5);
        gL.append('line').attr('x1', PAD).attr('y1', PAD + i * CELL).attr('x2', PAD + 9 * CELL).attr('y2', PAD + i * CELL).attr('stroke', '#334155').attr('stroke-width', 2.5);
      }
    }
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var grid = SOLUTION.map(function (r) { return r.slice(); });
    var clue = []; for (var r = 0; r < 9; r++) { clue.push([]); for (var c = 0; c < 9; c++) clue[r].push(true); }
    BLANKS.forEach(function (b) { grid[b[0]][b[1]] = 0; clue[b[0]][b[1]] = false; });

    var S = new DSA.Stepper();
    function snap(cur, status) { return { grid: grid.map(function (r) { return r.slice(); }), clue: clue, cur: cur, status: status }; }
    function add(cur, status, desc, line) { S.add(snap(cur, status), desc, { line: line }); }
    function ok(r, c, v) {
      for (var i = 0; i < 9; i++) { if (grid[r][i] === v || grid[i][c] === v) return false; }
      var br = r - r % 3, bc = c - c % 3;
      for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) if (grid[br + a][bc + b] === v) return false;
      return true;
    }
    function findEmpty() { for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) if (grid[r][c] === 0) return [r, c]; return null; }

    var solved = false;
    function solve() {
      if (solved) return true;
      var e = findEmpty();
      if (!e) { solved = true; add(null, '', '🎉 เติมครบทุกช่องถูกกฎ = แก้สำเร็จ!', 1); return true; }
      var r = e[0], c = e[1];
      for (var v = 1; v <= 9; v++) {
        if (ok(r, c, v)) {
          grid[r][c] = v;
          add([r, c], 'place', 'ช่อง (' + r + ',' + c + '): ลอง ' + v + ' → ไม่ขัดกฎ ใส่เลย', 4);
          if (solve()) return true;
          grid[r][c] = 0;
          add([r, c], 'backtrack', 'ช่อง (' + r + ',' + c + '): ใส่ ' + v + ' แล้วตันข้างหน้า → ถอยกลับ', 5);
        } else {
          add([r, c], 'conflict', 'ช่อง (' + r + ',' + c + '): ' + v + ' ขัดกับแถว/คอลัมน์/บล็อก → ข้าม', 3);
        }
      }
      return false;
    }
    add(null, '', 'โจทย์ซูโดกุ (เว้นว่าง ' + BLANKS.length + ' ช่อง) — เริ่มแก้แบบ backtracking', 0);
    solve();
    return S.steps;
  }

  var player;
  function run() { if (!player) player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('su-controls'), speed: 280 }); player.setSteps(build()); }
  document.getElementById('su-run').addEventListener('click', run);
  run();
})();
