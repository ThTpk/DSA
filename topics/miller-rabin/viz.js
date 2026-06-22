/* Miller-Rabin primality test — ทดสอบทีละพยาน (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'miller-rabin');
  var host = document.getElementById('ntviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="nt-grid"></div><div id="nt-controls"></div></div>' +
    '<div><div class="code-panel" id="nt-code"></div></div></div>';
  var gridEl = document.getElementById('nt-grid'), codeEl = document.getElementById('nt-code');
  var CODE = ['เขียน n−1 = d · 2ˢ  (d เป็นเลขคี่)', 'for พยาน a:', '  x = aᵈ mod n', '  if x == 1 or x == n−1: ผ่าน (พยานนี้)', '  ทำซ้ำ s−1 ครั้ง: x = x² mod n', '    if x == n−1: ผ่าน', '  ถ้าไม่เจอ n−1 เลย → ประกอบแน่นอน'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var N = 561;
  function modpow(b, e, m) { var r = 1; b %= m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return r; }

  function render(step) {
    var st = step.snapshot;
    var html = '<div style="margin-bottom:10px;font-family:JetBrains Mono,monospace">n = ' + N + ' · n−1 = ' + st.d + ' · 2<sup>' + st.s + '</sup></div>';
    html += '<table class="dp-table"><tr><th>พยาน a</th><th>ลำดับ x (aᵈ, ยกกำลังสอง…)</th><th>ผล</th></tr>';
    st.rows.forEach(function (row, i) {
      var cls = (i === st.cur) ? 'cur' : (row.verdict === 'ประกอบ' ? 'dep' : (row.verdict === 'ผ่าน' ? 'path' : ''));
      html += '<tr><td class="' + cls + '">' + row.a + '</td><td class="' + cls + '" style="font-family:JetBrains Mono,monospace;text-align:left;padding:4px 8px">' + row.seq + '</td><td class="' + cls + '">' + (row.verdict || '') + '</td></tr>';
    });
    html += '</table>';
    if (st.result) html += '<div style="margin-top:12px;font-weight:600">' + st.result + '</div>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var S = new DSA.Stepper();
    // n-1 = d * 2^s
    var d = N - 1, s = 0; while (d % 2 === 0) { d /= 2; s++; }
    var rows = [];
    function snap(cur, line, result) { return { d: d, s: s, rows: rows.map(function (x) { return { a: x.a, seq: x.seq, verdict: x.verdict }; }), cur: cur, result: result }; }

    if (N < 3 || N % 2 === 0) {
      rows.push({ a: '–', seq: '', verdict: (N === 2 ? 'เฉพาะ' : 'ประกอบ') });
      S.add(snap(0, 0, '✅ n = ' + N + ' → ' + (N === 2 ? 'จำนวนเฉพาะ' : 'ไม่ใช่ (≤2 หรือเลขคู่)')), 'กรณีพิเศษ', { line: 0 });
      return S.steps;
    }
    S.add(snap(-1, 0), 'เขียน ' + N + '−1 = ' + (N - 1) + ' = ' + d + ' · 2^' + s, { line: 0 });

    var witnesses = [2, 3, 5, 7, 11, 13].filter(function (a) { return a < N; });
    var isComposite = false;
    for (var w = 0; w < witnesses.length && !isComposite; w++) {
      var a = witnesses[w];
      var x = modpow(a, d, N);
      var seq = [x], verdict = null;
      if (x === 1 || x === N - 1) { verdict = 'ผ่าน'; }
      else {
        var found = false;
        for (var i = 0; i < s - 1; i++) { x = (x * x) % N; seq.push(x); if (x === N - 1) { found = true; break; } }
        verdict = found ? 'ผ่าน' : 'ประกอบ';
        if (!found) isComposite = true;
      }
      rows.push({ a: a, seq: seq.join(' → '), verdict: verdict });
      S.add(snap(rows.length - 1, verdict === 'ประกอบ' ? 6 : 3),
        'พยาน a=' + a + ': aᵈ mod n = ' + seq[0] + ' → ลำดับ [' + seq.join(', ') + '] → ' + (verdict === 'ผ่าน' ? 'ผ่าน ✓' : '❌ ไม่เจอ n−1 = ประกอบแน่นอน'),
        { line: verdict === 'ประกอบ' ? 6 : 3 });
    }
    var msg = isComposite ? '❌ n = ' + N + ' เป็นจำนวนประกอบแน่นอน (พยานพบหลักฐาน)' : '✅ n = ' + N + ' ผ่านทุกพยาน → น่าจะเป็นจำนวนเฉพาะ';
    S.add(snap(rows.length - 1, isComposite ? 6 : 5, msg), msg, { line: isComposite ? 6 : 5 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('nt-controls'), speed: 750 });
  function isPrime(x) { if (x < 2) return false; for (var i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; }
  function run() {
    var n = parseInt(document.getElementById('mr-n').value, 10);
    if (isNaN(n) || n < 2 || n > 1000000) { alert('ใส่ n ระหว่าง 2–1,000,000'); return; }
    N = n; document.getElementById('mr-n').value = N; player.setSteps(build());
  }
  document.getElementById('mr-run').addEventListener('click', run);
  document.getElementById('mr-prime').addEventListener('click', function () { var n; do { n = 100 + Math.floor(Math.random() * 9900); } while (!isPrime(n)); document.getElementById('mr-n').value = n; run(); });
  document.getElementById('mr-comp').addEventListener('click', function () { var n; do { n = 100 + Math.floor(Math.random() * 9900); } while (isPrime(n)); document.getElementById('mr-n').value = n; run(); });
  run();
})();
