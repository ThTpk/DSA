/* KMP — string matching ด้วย LPS (วาดด้วย NodeViz: 2 แถว text/pattern) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'string-algo', vh: 260 });
  var W = 38, H = 44, TY = 70, PY = 150, SX = 24;
  var text = '', pat = '', lps = [];

  function computeLPS(p) {
    var n = p.length, lps = new Array(n).fill(0), len = 0, i = 1;
    while (i < n) { if (p[i] === p[len]) { len++; lps[i] = len; i++; } else if (len > 0) { len = lps[len - 1]; } else { lps[i] = 0; i++; } }
    return lps;
  }

  function model(ci, cj, status, found) {
    var cells = [];
    var inFound = {}; found.forEach(function (f) { for (var k = f; k < f + pat.length; k++) inFound[k] = true; });
    for (var k = 0; k < text.length; k++) {
      var cls = '';
      if (k === ci) cls = (status === 'match' ? 'is-found' : status === 'mismatch' ? 'is-bad' : 'is-active');
      else if (inFound[k]) cls = 'is-found';
      cells.push({ id: 't' + k, x: SX + k * W, y: TY, w: W, h: H, text: text[k], sub: k, cls: cls });
    }
    var shift = ci - cj;
    for (var j = 0; j < pat.length; j++) {
      var pcls = '';
      if (j === cj) pcls = (status === 'match' ? 'is-found' : status === 'mismatch' ? 'is-bad' : 'is-active');
      cells.push({ id: 'p' + j, x: SX + (shift + j) * W, y: PY, w: W, h: H, text: pat[j], sub: null, cls: pcls });
    }
    var labels = [
      { id: 'lt', x: 6, y: TY + H / 2 + 4, text: '', anchor: 'start' },
      { id: 'lp', x: 6, y: PY + H / 2 + 4, text: '', anchor: 'start' },
      { id: 'lps', x: SX, y: PY + H + 30, text: 'LPS = [' + lps.join(', ') + ']', anchor: 'start', cls: 'is-accent' },
    ];
    return { cells: cells, labels: labels };
  }
  function add(S, ci, cj, status, found, desc) { S.add(DSA.NodeViz.snap(model(ci, cj, status, found)), desc, { line: -1 }); }

  function build() {
    lps = computeLPS(pat);
    var S = new DSA.Stepper();
    var n = text.length, m = pat.length, i = 0, j = 0, found = [];
    add(S, -1, -1, '', found, 'เตรียม LPS ของแพตเทิร์น = [' + lps.join(', ') + '] แล้วเริ่มเทียบ');
    var guard = 0;
    while (i < n && guard++ < 500) {
      add(S, i, j, 'compare', found, 'เทียบ text[' + i + ']=' + text[i] + ' กับ pat[' + j + ']=' + pat[j]);
      if (text[i] === pat[j]) {
        add(S, i, j, 'match', found, 'ตรงกัน → เลื่อนทั้งคู่ไปขวา');
        i++; j++;
        if (j === m) {
          found.push(i - j);
          add(S, -1, -1, '', found, '🎯 พบแพตเทิร์นที่ตำแหน่ง ' + (i - j) + ' ! → ใช้ LPS เลื่อน j = ' + lps[j - 1]);
          j = lps[j - 1];
        }
      } else {
        add(S, i, j, 'mismatch', found, 'ไม่ตรง');
        if (j > 0) { add(S, -1, -1, '', found, 'ใช้ LPS: เลื่อน j = lps[' + (j - 1) + '] = ' + lps[j - 1] + ' (ไม่ย้อนอ่าน text ซ้ำ)'); j = lps[j - 1]; }
        else { i++; }
      }
    }
    add(S, -1, -1, '', found, '✅ เสร็จ — พบทั้งหมด ' + found.length + ' ตำแหน่ง: [' + found.join(', ') + ']');
    return S.steps;
  }

  function clean(s) { return (s || '').toUpperCase().replace(/[^A-Z]/g, ''); }
  function run() {
    text = clean(document.getElementById('km-text').value).slice(0, 18) || 'AABAACAADAABAABA';
    pat = clean(document.getElementById('km-pat').value).slice(0, 8) || 'AABA';
    document.getElementById('km-text').value = text; document.getElementById('km-pat').value = pat;
    api.setSteps(build());
  }
  document.getElementById('km-run').addEventListener('click', run);
  run();
})();
