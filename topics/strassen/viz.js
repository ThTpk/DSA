/* Strassen — 7 products M1..M7 for 2x2 blocks (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'strassen');
  var host = document.getElementById('stviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="st-grid"></div><div id="st-controls"></div></div>' +
    '<div><div class="code-panel" id="st-code"></div></div></div>';
  var gridEl = document.getElementById('st-grid'), codeEl = document.getElementById('st-code');
  var CODE = ['M1 = a11·(b12−b22)', 'M2 = (a11+a12)·b22', 'M3 = (a21+a22)·b11', 'M4 = a22·(b21−b11)', 'M5 = (a11+a22)·(b11+b22)', 'M6 = (a12−a22)·(b21+b22)', 'M7 = (a11−a21)·(b11+b12)', 'C11=M5+M4−M2+M6 ; C12=M1+M2', 'C21=M3+M4 ; C22=M5+M1−M3−M7'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]];

  function mat(m, label, hot) {
    var h = '<table class="dp-table" style="display:inline-table;margin:4px 10px"><caption style="font-weight:600;caption-side:top">' + label + '</caption>';
    for (var i = 0; i < 2; i++) { h += '<tr>'; for (var j = 0; j < 2; j++) h += '<td class="' + (hot && hot[0] === i && hot[1] === j ? 'cur' : '') + '">' + m[i][j] + '</td>'; h += '</tr>'; }
    return h + '</table>';
  }

  function render(step) {
    var st = step.snapshot;
    var html = '<div>' + mat(A, 'A') + mat(B, 'B') + '</div>';
    html += '<table class="dp-table" style="margin-top:12px"><tr><th>ผลคูณช่วย</th><th>ค่า</th></tr>';
    ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'].forEach(function (name, i) {
      var cls = st.curM === i ? 'cur' : (st.M[i] != null ? 'path' : '');
      html += '<tr><td class="' + cls + '">' + name + '</td><td class="' + cls + '">' + (st.M[i] == null ? '' : st.M[i]) + '</td></tr>';
    });
    html += '</table>';
    if (st.C) html += '<div style="margin-top:12px">' + mat(st.C, 'C = A×B (Strassen)') + (st.check ? mat(st.check, 'ตรวจ (คูณปกติ)') : '') + '</div>';
    if (st.result) html += '<div style="margin-top:8px;font-weight:600">' + st.result + '</div>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var a11 = A[0][0], a12 = A[0][1], a21 = A[1][0], a22 = A[1][1];
    var b11 = B[0][0], b12 = B[0][1], b21 = B[1][0], b22 = B[1][1];
    var formulas = [
      ['M1 = a11·(b12−b22) = ' + a11 + '·(' + b12 + '−' + b22 + ')', a11 * (b12 - b22)],
      ['M2 = (a11+a12)·b22 = ' + (a11 + a12) + '·' + b22, (a11 + a12) * b22],
      ['M3 = (a21+a22)·b11 = ' + (a21 + a22) + '·' + b11, (a21 + a22) * b11],
      ['M4 = a22·(b21−b11) = ' + a22 + '·(' + b21 + '−' + b11 + ')', a22 * (b21 - b11)],
      ['M5 = (a11+a22)·(b11+b22) = ' + (a11 + a22) + '·' + (b11 + b22), (a11 + a22) * (b11 + b22)],
      ['M6 = (a12−a22)·(b21+b22) = ' + (a12 - a22) + '·' + (b21 + b22), (a12 - a22) * (b21 + b22)],
      ['M7 = (a11−a21)·(b11+b12) = ' + (a11 - a21) + '·' + (b11 + b12), (a11 - a21) * (b11 + b12)]
    ];
    var M = [null, null, null, null, null, null, null];
    var S = new DSA.Stepper();
    function snap(extra) { var o = { M: M.slice() }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({}), 'เริ่ม: คำนวณผลคูณช่วย M1…M7 (คูณแค่ 7 ครั้ง)', { line: 0 });
    for (var i = 0; i < 7; i++) {
      M[i] = formulas[i][1];
      S.add(snap({ curM: i }), formulas[i][0] + ' = ' + M[i], { line: i });
    }
    var C = [[M[4] + M[3] - M[1] + M[5], M[0] + M[1]], [M[2] + M[3], M[4] + M[0] - M[2] - M[6]]];
    var chk = [[a11 * b11 + a12 * b21, a11 * b12 + a12 * b22], [a21 * b11 + a22 * b21, a21 * b12 + a22 * b22]];
    S.add(snap({ C: C }), 'ประกอบบล็อก: C11=M5+M4−M2+M6, C12=M1+M2, C21=M3+M4, C22=M5+M1−M3−M7', { line: 7 });
    var ok = C[0][0] === chk[0][0] && C[0][1] === chk[0][1] && C[1][0] === chk[1][0] && C[1][1] === chk[1][1];
    S.add(snap({ C: C, check: chk, result: ok ? '✅ ตรงกับการคูณปกติทุกช่อง (ใช้คูณ 7 ครั้งแทน 8)' : '⚠️ ไม่ตรง' }), 'ตรวจผล', { line: 8 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('st-controls'), speed: 700 });
  function run() { player.setSteps(build()); }
  function rnd() { return Math.floor(Math.random() * 9) + 1; }
  document.getElementById('st-run').addEventListener('click', run);
  document.getElementById('st-random').addEventListener('click', function () { A = [[rnd(), rnd()], [rnd(), rnd()]]; B = [[rnd(), rnd()], [rnd(), rnd()]]; run(); });
  run();
})();
