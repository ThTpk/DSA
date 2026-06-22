/* Sieve of Eratosthenes — grid ขีดฆ่าพหุคูณ (custom svg) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'sieve');
  var host = document.getElementById('sieveviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="se-svg" preserveAspectRatio="xMidYMid meet"></svg></div><div id="se-controls"></div></div>' +
    '<div><div class="code-panel" id="se-code"></div></div></div>';
  var svg = d3.select('#se-svg'), gC = svg.append('g'), gT = svg.append('g');
  var codeEl = document.getElementById('se-code');
  var CODE = ['for p = 2 to √N:', '  if p ยังไม่ถูกขีด (เป็นจำนวนเฉพาะ):', '    ขีดฆ่าพหุคูณ: p², p²+p, p²+2p, ...', 'ตัวที่ไม่ถูกขีด (≥2) = จำนวนเฉพาะ'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var N = 60, COLS = 10, CELL = 50;
  function render(step) {
    var st = step.snapshot;
    var rows = Math.ceil(N / COLS);
    svg.attr('viewBox', '0 0 ' + (COLS * CELL) + ' ' + (rows * CELL));
    var data = []; for (var n = 1; n <= N; n++) data.push(n);
    function pos(n) { var i = n - 1; return { x: (i % COLS) * CELL, y: Math.floor(i / COLS) * CELL }; }
    function fill(n) {
      if (n === 1) return '#e2e8f0';
      if (n === st.marking) return '#ef4444';
      if (n === st.curP) return '#f59e0b';
      if (st.composite[n]) return '#e2e8f0';
      if (st.decided[n]) return '#a7f3d0';
      return '#ffffff';
    }
    var ce = gC.selectAll('rect').data(data, function (d) { return d; });
    ce.enter().append('rect').attr('width', CELL - 3).attr('height', CELL - 3).attr('rx', 6).attr('x', function (d) { return pos(d).x + 1.5; }).attr('y', function (d) { return pos(d).y + 1.5; })
      .merge(ce).attr('fill', fill).attr('stroke', '#cbd5e1');
    var tx = gT.selectAll('text').data(data, function (d) { return 't' + d; });
    tx.enter().append('text').attr('text-anchor', 'middle').attr('font-family', 'JetBrains Mono, monospace').attr('font-size', '17').attr('font-weight', '600')
      .merge(tx).attr('x', function (d) { return pos(d).x + CELL / 2; }).attr('y', function (d) { return pos(d).y + CELL / 2 + 6; })
      .attr('fill', function (d) { return (st.composite[d] || d === 1) ? '#94a3b8' : '#1e293b'; })
      .attr('text-decoration', function (d) { return st.composite[d] ? 'line-through' : 'none'; })
      .text(function (d) { return d; });
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var composite = {}, decided = {};
    var S = new DSA.Stepper();
    function snap(curP, marking) { var c = {}, d = {}; for (var k in composite) c[k] = 1; for (var k2 in decided) d[k2] = 1; return { composite: c, decided: d, curP: curP, marking: marking }; }
    function add(curP, marking, desc, line) { S.add(snap(curP, marking), desc, { line: line }); }
    add(null, null, 'เริ่มร่อนตะแกรงหาจำนวนเฉพาะถึง ' + N, 0);
    for (var p = 2; p * p <= N; p++) {
      if (!composite[p]) {
        decided[p] = 1;
        add(p, null, p + ' ยังไม่ถูกขีด = จำนวนเฉพาะ → ขีดฆ่าพหุคูณตั้งแต่ ' + (p * p), 2);
        for (var m = p * p; m <= N; m += p) {
          if (!composite[m]) { composite[m] = 1; add(p, m, 'ขีด ' + m + ' (= ' + (m / p) + '×' + p + ') ทิ้ง', 2); }
        }
      }
    }
    // ที่เหลือที่ยังไม่ถูกขีดและ ≥2 คือจำนวนเฉพาะ
    for (var x = 2; x <= N; x++) if (!composite[x]) decided[x] = 1;
    var primes = []; for (var y = 2; y <= N; y++) if (!composite[y]) primes.push(y);
    add(null, null, '✅ จำนวนเฉพาะถึง ' + N + ' มี ' + primes.length + ' ตัว: ' + primes.join(', '), 3);
    return S.steps;
  }

  var player;
  function run() { if (!player) player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('se-controls'), speed: 250 }); player.setSteps(build()); }
  document.getElementById('sv-run').addEventListener('click', run);
  run();
})();
