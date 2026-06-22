/* Rabin-Karp — rolling hash (NodeViz 2 แถว text/pattern) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'rabin-karp', vh: 270 });
  var W = 38, H = 44, TY = 80, PY = 160, SX = 24;
  var text = '', pat = '';
  function code(ch) { return ch.charCodeAt(0); }

  function model(shift, win, status, vi, found) {
    var cells = [];
    var inFound = {}; found.forEach(function (f) { for (var k = f; k < f + pat.length; k++) inFound[k] = true; });
    for (var k = 0; k < text.length; k++) {
      var cls = '';
      if (status === 'verify' && k === shift + vi) cls = 'is-active';
      else if (status === 'good' && k === shift + vi) cls = 'is-found';
      else if (status === 'bad' && k === shift + vi) cls = 'is-bad';
      else if (win && k >= shift && k < shift + pat.length) cls = 'is-highlight';
      else if (inFound[k]) cls = 'is-found';
      cells.push({ id: 't' + k, x: SX + k * W, y: TY, w: W, h: H, text: text[k], sub: k, cls: cls });
    }
    for (var j = 0; j < pat.length; j++) {
      var pcls = '';
      if ((status === 'verify') && j === vi) pcls = 'is-active';
      else if (status === 'good' && j === vi) pcls = 'is-found';
      else if (status === 'bad' && j === vi) pcls = 'is-bad';
      cells.push({ id: 'p' + j, x: SX + (shift + j) * W, y: PY, w: W, h: H, text: pat[j], sub: null, cls: pcls });
    }
    return { cells: cells };
  }
  function add(S, shift, win, status, vi, found, desc) { S.add(DSA.NodeViz.snap(model(shift, win, status, vi, found)), desc, { line: -1 }); }

  function build() {
    var n = text.length, m = pat.length, found = [];
    var patHash = 0; for (var i = 0; i < m; i++) patHash += code(pat[i]);
    var S = new DSA.Stepper();
    var winHash = 0; for (var i2 = 0; i2 < m; i2++) winHash += code(text[i2]);
    add(S, 0, true, '', -1, found, 'hash ของแพตเทิร์น "' + pat + '" = ' + patHash + ' · เริ่มที่หน้าต่างแรก');

    for (var s = 0; s <= n - m; s++) {
      add(S, s, true, '', -1, found, 'หน้าต่าง [' + s + '..' + (s + m - 1) + '] hash = ' + winHash + ' เทียบ patHash = ' + patHash);
      if (winHash === patHash) {
        var ok = true;
        for (var k = 0; k < m; k++) {
          var match = text[s + k] === pat[k];
          add(S, s, true, match ? 'good' : 'verify', k, found, 'hash ตรง → ตรวจตัวอักษร: text[' + (s + k) + ']=' + text[s + k] + (match ? ' = ' : ' ≠ ') + pat[k]);
          if (!match) { ok = false; add(S, s, true, 'bad', k, found, '✗ ตัวอักษรไม่ตรง = hash ชนกันโดยบังเอิญ (spurious hit) → ข้าม'); break; }
        }
        if (ok) { found.push(s); add(S, s, true, '', -1, found, '🎯 hash ตรงและตัวอักษรตรงครบ → พบที่ตำแหน่ง ' + s); }
      } else {
        add(S, s, true, '', -1, found, 'hash ไม่ตรง → ข้ามไปหน้าต่างถัดไป (ไม่ต้องเทียบตัวอักษร)');
      }
      // rolling: ออก text[s], เข้า text[s+m]
      if (s < n - m) winHash = winHash - code(text[s]) + code(text[s + m]);
    }
    add(S, 0, false, '', -1, found, '✅ เสร็จ — พบทั้งหมด ' + found.length + ' ตำแหน่ง: [' + found.join(', ') + ']');
    return S.steps;
  }

  function clean(s) { return (s || '').toUpperCase().replace(/[^A-Z]/g, ''); }
  function run() {
    text = clean(document.getElementById('rk-text').value).slice(0, 18) || 'AABAACAADAABAABA';
    pat = clean(document.getElementById('rk-pat').value).slice(0, 8) || 'AABA';
    document.getElementById('rk-text').value = text; document.getElementById('rk-pat').value = pat;
    api.setSteps(build());
  }
  document.getElementById('rk-run').addEventListener('click', run);
  run();
})();
