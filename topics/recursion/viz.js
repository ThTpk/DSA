/* Recursion — factorial(n) แสดง call stack ขยายแล้วคืนค่า + trace การคำนวณ */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'recursion');

  var host = document.getElementById('rcviz');
  host.innerHTML =
    '<div class="viz-grid">' +
      '<div><div class="viz-stage" id="rc-trace" style="min-height:240px;font-family:var(--font-mono);font-size:15px;line-height:2;padding:18px"></div><div id="rc-controls"></div></div>' +
      '<div><div class="stack-panel"><div class="stack-panel__head">📚 Call Stack</div><div id="rc-stack" class="stack-list"></div></div>' +
      '<div class="code-panel" id="rc-code"></div></div>' +
    '</div>';
  var traceEl = document.getElementById('rc-trace');
  var stackHost = document.getElementById('rc-stack');
  var codeEl = document.getElementById('rc-code');
  var CODE = ['factorial(n):', '  if n <= 1:', '    return 1            // กรณีฐาน', '  return n * factorial(n-1)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  function render(step) {
    var st = step.snapshot;
    traceEl.innerHTML = st.lines.map(function (l, i) {
      var hot = i === st.hot;
      return '<div style="' + (hot ? 'background:var(--c-primary-soft);border-radius:6px;padding:0 8px;font-weight:600' : '') + '">' + l + '</div>';
    }).join('');
    var frames = st.stack || [];
    var sel = d3.select('#rc-stack').selectAll('div.frame').data(frames, function (d) { return d.id; });
    sel.exit().remove();
    var ent = sel.enter().append('div').attr('class', 'frame');
    ent.append('span').attr('class', 'frame__title');
    ent.append('span').attr('class', 'frame__phase');
    var all = ent.merge(sel);
    all.attr('class', function (d, i) { return 'frame' + (i === frames.length - 1 ? ' is-top' : ''); }).style('margin-left', function (d, i) { return (i * 14) + 'px'; });
    all.select('.frame__title').text(function (d) { return d.title; });
    all.select('.frame__phase').text(function (d) { return d.phase || ''; });
    if (!frames.length) stackHost.setAttribute('data-empty', 'stack ว่าง'); else stackHost.removeAttribute('data-empty');
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build(n) {
    var S = new DSA.Stepper();
    var stack = [], fid = 0, lines = [];
    function snap(line) { return { stack: stack.map(function (f) { return { id: f.id, title: f.title, phase: f.phase }; }), lines: lines.slice(), hot: line == null ? lines.length - 1 : line }; }
    function add(desc, l) { S.add(snap(), desc, { line: l }); }

    function fact(n) {
      var f = { id: ++fid, title: 'factorial(' + n + ')', phase: 'เรียก' }; stack.push(f);
      if (n <= 1) {
        lines.push('factorial(1) = 1   ← กรณีฐาน');
        f.phase = 'คืน 1';
        add('ถึงกรณีฐาน factorial(1) = 1 → คืนค่า 1 แล้ว pop', 2);
        stack.pop();
        return 1;
      }
      lines.push('factorial(' + n + ') = ' + n + ' × factorial(' + (n - 1) + ')');
      f.phase = 'รอผล factorial(' + (n - 1) + ')';
      add('เรียก factorial(' + n + ') → ต้องรอผล factorial(' + (n - 1) + ') ก่อน (push เข้า stack)', 3);
      var r = fact(n - 1);
      var res = n * r;
      lines.push('factorial(' + n + ') = ' + n + ' × ' + r + ' = ' + res);
      f.phase = 'คืน ' + res;
      add('ได้ factorial(' + (n - 1) + ') = ' + r + ' → factorial(' + n + ') = ' + n + ' × ' + r + ' = ' + res + ' (pop)', 3);
      stack.pop();
      return res;
    }

    var ans = fact(n);
    S.add(snap(), '✅ factorial(' + n + ') = ' + ans, { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('rc-controls'), speed: 650 });
  function run() { var n = parseInt(document.getElementById('rc-n').value, 10); if (isNaN(n) || n < 1) { alert('ใส่จำนวนเต็มบวก'); return; } n = Math.min(n, 9); document.getElementById('rc-n').value = n; player.setSteps(build(n)); }
  document.getElementById('rc-run').addEventListener('click', run);
  run();
})();
