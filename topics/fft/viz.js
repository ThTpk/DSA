/* FFT — iterative Cooley-Tukey, butterfly stages (custom table + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'fft');
  var host = document.getElementById('ftviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="ft-grid" style="overflow-x:auto"></div><div id="ft-controls"></div></div>' +
    '<div><div class="code-panel" id="ft-code"></div></div></div>';
  var gridEl = document.getElementById('ft-grid'), codeEl = document.getElementById('ft-code');
  var CODE = ['จัดเรียงอินพุตด้วย bit-reversal', 'for len = 2, 4, 8, … :', '  w = e^(−2πi/len)  (twiddle)', '  for แต่ละบล็อก, แต่ละคู่ (k):', '    u = a[i+k] ; t = wᵏ · a[i+k+len/2]', '    a[i+k] = u + t ; a[i+k+len/2] = u − t'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var input = [0, 1, 2, 3, 4, 5, 6, 7];
  function cstr(z) { var r = Math.round(z.re * 10) / 10, im = Math.round(z.im * 10) / 10; if (Math.abs(r) < 0.05) r = 0; if (Math.abs(im) < 0.05) im = 0; return r + (im >= 0 ? '+' : '−') + Math.abs(im) + 'i'; }

  function render(step) {
    var st = step.snapshot, a = st.a, n = a.length;
    var html = '<div style="margin-bottom:8px;color:var(--c-muted)">' + (st.stage || '') + '</div>';
    html += '<table class="dp-table"><tr><th>k</th>';
    for (var i = 0; i < n; i++) html += '<th class="' + (st.hi && st.hi.indexOf(i) !== -1 ? 'hl' : '') + '">' + i + '</th>';
    html += '</tr><tr><th>a[k]</th>';
    for (var j = 0; j < n; j++) html += '<td class="' + (st.hi && st.hi.indexOf(j) !== -1 ? 'cur' : '') + '" style="font-family:JetBrains Mono,monospace;font-size:.8rem">' + cstr(a[j]) + '</td>';
    html += '</tr></table>';
    if (st.result) html += '<div style="margin-top:12px;font-weight:600">' + st.result + '</div>';
    gridEl.innerHTML = html;
    for (var z = 0; z < codeLineEls.length; z++) codeLineEls[z].classList.toggle('is-active', z === step.meta.line);
  }

  function build() {
    var n = input.length;
    var a = input.map(function (v) { return { re: v, im: 0 }; });
    var S = new DSA.Stepper();
    function clone(arr) { return arr.map(function (z) { return { re: z.re, im: z.im }; }); }
    function snap(extra) { var o = { a: clone(a) }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({ stage: 'อินพุต' }), 'อินพุต (จำนวนจริง)', { line: 0 });

    // bit reversal
    for (var i = 1, j = 0; i < n; i++) {
      var bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { var t = a[i]; a[i] = a[j]; a[j] = t; }
    }
    S.add(snap({ stage: 'หลัง bit-reversal' }), 'จัดเรียงด้วย bit-reversal เรียบร้อย', { line: 0 });

    for (var len = 2; len <= n; len <<= 1) {
      var ang = -2 * Math.PI / len;
      for (var i2 = 0; i2 < n; i2 += len) {
        for (var k = 0; k < len / 2; k++) {
          var wr = Math.cos(ang * k), wi = Math.sin(ang * k);
          var p = a[i2 + k], q = a[i2 + k + len / 2];
          var tr = wr * q.re - wi * q.im, ti = wr * q.im + wi * q.re;
          a[i2 + k] = { re: p.re + tr, im: p.im + ti };
          a[i2 + k + len / 2] = { re: p.re - tr, im: p.im - ti };
          S.add(snap({ stage: 'ชั้น len=' + len, hi: [i2 + k, i2 + k + len / 2] }),
            'butterfly: a[' + (i2 + k) + '] และ a[' + (i2 + k + len / 2) + '] รวมด้วย wᵏ (k=' + k + ')', { line: 4 });
        }
      }
    }
    // ตรวจกับ DFT ตรง
    var ok = true;
    for (var f = 0; f < n; f++) {
      var re = 0, im = 0;
      for (var t2 = 0; t2 < n; t2++) { var an = -2 * Math.PI * f * t2 / n; re += input[t2] * Math.cos(an); im += input[t2] * Math.sin(an); }
      if (Math.abs(re - a[f].re) > 1e-6 || Math.abs(im - a[f].im) > 1e-6) ok = false;
    }
    S.add(snap({ stage: 'ผลลัพธ์ FFT', result: ok ? '✅ ตรงกับ DFT ตรงทุกค่า (O(n log n) แทน O(n²))' : '⚠️ ไม่ตรง' }), 'เสร็จ', { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('ft-controls'), speed: 600 });
  function run() {
    var v = document.getElementById('ft-in').value.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); });
    while (v.length < 8) v.push(0); v = v.slice(0, 8);
    input = v; document.getElementById('ft-in').value = v.join(',');
    player.setSteps(build());
  }
  document.getElementById('ft-run').addEventListener('click', run);
  run();
})();
