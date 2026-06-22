/* Modular Exponentiation — square-and-multiply (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'mod-exp');
  var host = document.getElementById('ntviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="nt-grid" style="overflow-x:auto"></div><div id="nt-controls"></div></div>' +
    '<div><div class="code-panel" id="nt-code"></div></div></div>';
  var gridEl = document.getElementById('nt-grid'), codeEl = document.getElementById('nt-code');
  var CODE = ['result = 1 ; base = base mod m', 'while exp > 0:', '  if (exp & 1) == 1:', '    result = result · base mod m', '  base = base · base mod m   // square', '  exp = exp >> 1', 'return result'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;').replace(/&(?!lt;)/g, '&amp;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var BASE = 7, EXP = 13, MOD = 11;

  function render(step) {
    var st = step.snapshot;
    var html = '<div style="margin-bottom:10px;font-family:JetBrains Mono,monospace">exp = ' + EXP + ' = <b>' + EXP.toString(2) + '</b>₂</div>';
    html += '<table class="dp-table"><tr><th>บิต</th><th>คูณเข้า result?</th><th>base</th><th>result</th></tr>';
    st.rows.forEach(function (row, i) {
      var cls = (i === st.cur) ? 'cur' : '';
      html += '<tr><td class="' + cls + '">' + row.bit + '</td><td class="' + cls + '">' + row.mul + '</td><td class="' + cls + '">' + row.base + '</td><td class="' + cls + '">' + row.result + '</td></tr>';
    });
    html += '</table>';
    if (st.result) html += '<div style="margin-top:12px;font-weight:600">' + st.result + '</div>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var S = new DSA.Stepper();
    var rows = [];
    function snap(cur, line, result) { return { rows: rows.map(function (x) { return { bit: x.bit, mul: x.mul, base: x.base, result: x.result }; }), cur: cur, result: result }; }
    var result = 1, base = BASE % MOD, exp = EXP;
    rows.push({ bit: '–', mul: 'เริ่มต้น', base: base, result: result });
    S.add(snap(0, 0), 'เริ่ม: result = 1, base = ' + BASE + ' mod ' + MOD + ' = ' + base, { line: 0 });
    while (exp > 0) {
      var bit = exp & 1, mul = '—';
      if (bit === 1) { result = (result * base) % MOD; mul = '✓ result·base'; }
      var prevBase = base;
      base = (base * base) % MOD;
      rows.push({ bit: bit, mul: mul, base: prevBase, result: result });
      S.add(snap(rows.length - 1, bit === 1 ? 3 : 4),
        'บิต = ' + bit + (bit === 1 ? ' → result = result·base mod ' + MOD + ' = ' + result : ' → ข้าม (ไม่คูณ)') + ' ; ยกกำลังสอง: base → ' + base, { line: bit === 1 ? 3 : 4 });
      exp >>= 1;
    }
    S.add(snap(rows.length - 1, 6, '✅ ' + BASE + '^' + EXP + ' mod ' + MOD + ' = ' + result), '✅ ผลลัพธ์ = ' + result, { line: 6 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('nt-controls'), speed: 700 });
  function getN(id, def) { var v = parseInt(document.getElementById(id).value, 10); return (isNaN(v) || v < 0) ? def : v; }
  function run() {
    BASE = getN('me-base', 7); EXP = getN('me-exp', 13); MOD = getN('me-mod', 11);
    if (MOD < 2) { alert('mod ต้อง ≥ 2'); return; }
    if (EXP > 4095) EXP = 4095;
    document.getElementById('me-base').value = BASE; document.getElementById('me-exp').value = EXP; document.getElementById('me-mod').value = MOD;
    player.setSteps(build());
  }
  document.getElementById('me-run').addEventListener('click', run);
  document.getElementById('me-random').addEventListener('click', function () {
    document.getElementById('me-base').value = 2 + Math.floor(Math.random() * 30);
    document.getElementById('me-exp').value = 5 + Math.floor(Math.random() * 60);
    document.getElementById('me-mod').value = 7 + Math.floor(Math.random() * 40); run();
  });
  run();
})();
