/* Backtracking — N-Queens (หาคำตอบแรก) + call stack */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'backtracking');

  var host = document.getElementById('nqviz');
  host.innerHTML =
    '<div class="viz-grid">' +
      '<div><div class="viz-stage"><svg id="nq-svg" preserveAspectRatio="xMidYMid meet"></svg></div><div id="nq-controls"></div></div>' +
      '<div><div class="stack-panel"><div class="stack-panel__head">📚 Call Stack — solve(row)</div><div id="nq-stack" class="stack-list"></div></div>' +
      '<div class="code-panel" id="nq-code"></div></div>' +
    '</div>';
  var svg = d3.select('#nq-svg');
  var gCells = svg.append('g'), gQ = svg.append('g');
  var stackHost = document.getElementById('nq-stack');
  var codeEl = document.getElementById('nq-code');
  var CODE = ['solve(row):', '  if row == N: พบคำตอบ ✓', '  for col in 0..N-1:', '    if safe(row,col): วางควีน → solve(row+1)', '    else / ตัน: ถอยกลับ (backtrack)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var CELL = 46, N = 6;

  function render(step) {
    var st = step.snapshot;
    N = st.n;
    var sz = N * CELL;
    svg.attr('viewBox', '0 0 ' + sz + ' ' + sz);
    var cells = [];
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) cells.push({ r: r, c: c });
    var tc = st.tryCell, cf = st.conflictCell;

    var ce = gCells.selectAll('rect').data(cells, function (d) { return d.r + '_' + d.c; });
    ce.exit().remove();
    ce.enter().append('rect').attr('width', CELL).attr('height', CELL)
        .attr('x', function (d) { return d.c * CELL; }).attr('y', function (d) { return d.r * CELL; })
      .merge(ce)
        .attr('x', function (d) { return d.c * CELL; }).attr('y', function (d) { return d.r * CELL; })
        .attr('class', function (d) {
          var base = 'board-cell ' + ((d.r + d.c) % 2 === 0 ? 'board-cell-l' : 'board-cell-d');
          if (cf && cf[0] === d.r && cf[1] === d.c) return base + ' conflict';
          if (tc && tc[0] === d.r && tc[1] === d.c) return base + ' try';
          return base;
        });

    // queens
    var qs = [];
    for (var rr = 0; rr < N; rr++) {
      if (st.queens[rr] != null) qs.push({ r: rr, c: st.queens[rr], kind: 'placed' });
      else if (tc && tc[0] === rr && st.status === 'try') qs.push({ r: rr, c: tc[1], kind: 'trying' });
    }
    var q = gQ.selectAll('text').data(qs, function (d) { return 'q' + d.r; });
    q.exit().remove();
    q.enter().append('text').attr('class', 'board-queen').attr('dy', '.05em').text('♛')
      .merge(q)
        .attr('class', function (d) { return 'board-queen ' + (d.kind === 'placed' ? 'placed' : 'trying'); })
        .attr('x', function (d) { return d.c * CELL + CELL / 2; })
        .attr('y', function (d) { return d.r * CELL + CELL / 2 + 8; });

    // stack
    var frames = st.stack || [];
    var sel = d3.select('#nq-stack').selectAll('div.frame').data(frames, function (d) { return d.id; });
    sel.exit().remove();
    var ent = sel.enter().append('div').attr('class', 'frame');
    ent.append('span').attr('class', 'frame__title');
    var all = ent.merge(sel);
    all.attr('class', function (d, i) { return 'frame' + (i === frames.length - 1 ? ' is-top' : ''); }).style('margin-left', function (d, i) { return (i * 14) + 'px'; });
    all.select('.frame__title').text(function (d) { return d.title; });
    if (!frames.length) stackHost.setAttribute('data-empty', 'stack ว่าง'); else stackHost.removeAttribute('data-empty');

    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build(n) {
    var S = new DSA.Stepper();
    var queens = new Array(n).fill(null);
    var stack = [], fid = 0, found = false;
    function qSnap(extra) { var o = { n: n, queens: queens.slice(), stack: stack.map(function (f) { return { id: f.id, title: f.title }; }), tryCell: null, conflictCell: null, status: '' }; for (var k in extra) o[k] = extra[k]; return o; }
    function add(extra, desc, line) { S.add(qSnap(extra), desc, { line: line }); }
    function safe(row, col) { for (var r = 0; r < row; r++) { if (queens[r] === col || Math.abs(queens[r] - col) === Math.abs(r - row)) return false; } return true; }

    function solve(row) {
      if (found) return true;
      var f = { id: ++fid, title: 'solve(row ' + row + ')' }; stack.push(f);
      if (row === n) { add({ status: 'solved' }, '🎉 วางครบ ' + n + ' แถวโดยไม่กินกัน = พบคำตอบ!', 1); found = true; return true; }
      add({ status: 'enter' }, 'เข้าแถว ' + row + ' — ลองหาคอลัมน์ที่วางได้', 0);
      for (var col = 0; col < n; col++) {
        if (safe(row, col)) {
          queens[row] = col;
          add({ status: 'place', tryCell: [row, col] }, 'แถว ' + row + ' คอลัมน์ ' + col + ': ปลอดภัย → วางควีน แล้วไปแถวถัดไป', 3);
          if (solve(row + 1)) { stack.pop(); return true; }
          queens[row] = null;
          add({ status: 'backtrack' }, 'แถว ' + (row + 1) + ' ไปต่อไม่ได้ → ถอย (backtrack) เอาควีนออกจากแถว ' + row, 4);
        } else {
          add({ status: 'conflict', conflictCell: [row, col] }, 'แถว ' + row + ' คอลัมน์ ' + col + ': ชนกับควีนเดิม → ลองคอลัมน์ถัดไป', 4);
        }
      }
      add({ status: 'deadend' }, 'แถว ' + row + ' ลองครบทุกคอลัมน์แล้ววางไม่ได้ → ถอยกลับ', 4);
      stack.pop();
      return false;
    }
    add({ status: 'start' }, 'เริ่ม N-Queens บนกระดาน ' + n + '×' + n, 0);
    solve(0);
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('nq-controls'), speed: 350 });
  function run() { var n = parseInt(document.getElementById('nq-n').value, 10) || 6; player.setSteps(build(n)); }
  document.getElementById('nq-run').addEventListener('click', run);
  run();
})();
