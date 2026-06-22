/* Permutations — backtracking สร้างทุกการเรียงสับเปลี่ยน + call stack (custom) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'permutations');
  var host = document.getElementById('pmviz');
  host.innerHTML =
    '<div class="viz-grid">' +
      '<div><div class="viz-stage" id="pm-stage" style="min-height:240px;padding:16px"></div><div id="pm-controls"></div></div>' +
      '<div><div class="stack-panel"><div class="stack-panel__head">📚 Call Stack — ตำแหน่งที่กำลังเลือก</div><div id="pm-stack" class="stack-list"></div></div>' +
      '<div class="code-panel" id="pm-code"></div></div>' +
    '</div>';
  var stageEl = document.getElementById('pm-stage'), stackHost = document.getElementById('pm-stack'), codeEl = document.getElementById('pm-code');
  var CODE = ['permute(current):', '  if เต็ม n ตัว: บันทึกผลลัพธ์', '  for ตัวที่ยังไม่ใช้:', '    เลือก → permute(current) → ถอย (backtrack)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var arr = [];
  function render(step) {
    var st = step.snapshot, n = arr.length;
    var boxes = '';
    for (var i = 0; i < n; i++) boxes += '<div class="perm-box ' + (i < st.current.length ? 'filled' : 'empty') + '">' + (i < st.current.length ? st.current[i] : '·') + '</div>';
    var avail = arr.filter(function (v, i) { return st.used.indexOf(i) === -1; });
    var results = st.results.map(function (r, k) { return '<span class="perm-chip ' + (k === st.results.length - 1 && st.justAdded ? 'latest' : '') + '">[' + r.join(',') + ']</span>'; }).join('');
    stageEl.innerHTML =
      '<div style="font-size:1.1rem;margin-bottom:8px">กำลังสร้าง:</div><div>' + boxes + '</div>' +
      '<div style="margin:12px 0;color:var(--c-muted)">ตัวที่ยังเลือกได้: ' + (avail.length ? avail.join(', ') : '— (ครบแล้ว)') + '</div>' +
      '<div style="color:var(--c-muted);margin-bottom:6px">ผลลัพธ์ที่ได้ (' + st.results.length + ' / ' + factorial(n) + '):</div><div>' + (results || '<span style="color:var(--c-faint)">ยังไม่มี</span>') + '</div>';

    var frames = st.stack || [];
    var sel = d3.select('#pm-stack').selectAll('div.frame').data(frames, function (d) { return d.id; });
    sel.exit().remove();
    var ent = sel.enter().append('div').attr('class', 'frame'); ent.append('span').attr('class', 'frame__title');
    var all = ent.merge(sel);
    all.attr('class', function (d, i) { return 'frame' + (i === frames.length - 1 ? ' is-top' : ''); }).style('margin-left', function (d, i) { return (i * 14) + 'px'; });
    all.select('.frame__title').text(function (d) { return d.title; });
    if (!frames.length) stackHost.setAttribute('data-empty', 'stack ว่าง'); else stackHost.removeAttribute('data-empty');
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }
  function factorial(n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return f; }

  function build(values) {
    arr = values.slice();
    var n = arr.length, used = [], current = [], results = [], stack = [], fid = 0;
    var S = new DSA.Stepper();
    function snap(extra) { var o = { current: current.slice(), used: used.slice(), results: results.map(function (r) { return r.slice(); }), stack: stack.map(function (f) { return { id: f.id, title: f.title }; }), justAdded: false }; for (var k in extra) o[k] = extra[k]; return o; }
    function add(extra, desc, line) { S.add(snap(extra), desc, { line: line }); }

    function rec() {
      var f = { id: ++fid, title: 'permute(ลึก ' + current.length + ')' }; stack.push(f);
      if (current.length === n) { results.push(current.slice()); add({ justAdded: true }, 'ครบ ' + n + ' ตัว → บันทึก [' + current.join(',') + ']', 1); stack.pop(); return; }
      add({}, 'ตำแหน่งที่ ' + current.length + ': เลือกตัวที่ยังไม่ใช้', 2);
      for (var i = 0; i < n; i++) {
        if (used.indexOf(i) !== -1) continue;
        used.push(i); current.push(arr[i]);
        add({}, 'เลือก ' + arr[i] + ' → [' + current.join(',') + ']', 3);
        rec();
        current.pop(); used.splice(used.indexOf(i), 1);
        add({}, 'ถอย (backtrack) เอา ' + arr[i] + ' ออก', 3);
      }
      stack.pop();
    }
    rec();
    add({}, '✅ สร้างครบ ' + results.length + ' แบบ (' + n + '! = ' + factorial(n) + ')', -1);
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('pm-controls'), speed: 450 });
  function parseList(s) { return s.split(/[,\s]+/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length; }).slice(0, 4); }
  function run() { var v = parseList(document.getElementById('pm-values').value); if (v.length < 1) { alert('ใส่ค่าอย่างน้อย 1 ตัว'); return; } document.getElementById('pm-values').value = v.join(', '); player.setSteps(build(v)); }
  document.getElementById('pm-run').addEventListener('click', run);
  run();
})();
