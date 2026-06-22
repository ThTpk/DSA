/* Boyer-Moore (bad character) — เทียบขวาไปซ้าย แล้วกระโดด (NodeViz 2 แถว) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'boyer-moore', vh: 280 });
  var W = 38, H = 44, TY = 70, PY = 150, SX = 24;
  var text = '', pat = '', last = {};

  function model(s, j, status, found) {
    var cells = [];
    var inFound = {}; found.forEach(function (f) { for (var k = f; k < f + pat.length; k++) inFound[k] = true; });
    for (var k = 0; k < text.length; k++) {
      var cls = '';
      if (s >= 0 && k === s + j) cls = (status === 'match' ? 'is-found' : status === 'mismatch' ? 'is-bad' : 'is-active');
      else if (inFound[k]) cls = 'is-found';
      cells.push({ id: 't' + k, x: SX + k * W, y: TY, w: W, h: H, text: text[k], sub: k, cls: cls });
    }
    if (s >= 0) for (var p = 0; p < pat.length; p++) {
      var pcls = '';
      if (p === j) pcls = (status === 'match' ? 'is-found' : status === 'mismatch' ? 'is-bad' : 'is-active');
      cells.push({ id: 'p' + p, x: SX + (s + p) * W, y: PY, w: W, h: H, text: pat[p], sub: null, cls: pcls });
    }
    var lt = Object.keys(last).sort().map(function (c) { return c + '=' + last[c]; }).join('  ');
    var labels = [{ id: 'lc', x: SX, y: PY + H + 30, text: 'ตำแหน่งขวาสุดในแพตเทิร์น: ' + lt, anchor: 'start', cls: 'is-accent' }];
    return { cells: cells, labels: labels };
  }
  function add(S, s, j, status, found, desc) { S.add(DSA.NodeViz.snap(model(s, j, status, found)), desc, { line: -1 }); }

  function build() {
    last = {}; for (var i = 0; i < pat.length; i++) last[pat[i]] = i;
    var S = new DSA.Stepper();
    var n = text.length, m = pat.length, found = [], guard = 0;
    add(S, -1, -1, '', found, 'สร้างตาราง bad-character (ตำแหน่งขวาสุดของแต่ละตัวในแพตเทิร์น) แล้วเริ่มที่ s=0');
    var s = 0;
    while (s <= n - m && guard++ < 400) {
      var j = m - 1, mism = false;
      while (j >= 0) {
        add(S, s, j, 'compare', found, 's=' + s + ': เทียบ (ขวา→ซ้าย) text[' + (s + j) + ']=' + text[s + j] + ' กับ pat[' + j + ']=' + pat[j]);
        if (text[s + j] === pat[j]) { add(S, s, j, 'match', found, 'ตรงกัน → ขยับซ้าย'); j--; }
        else { mism = true; break; }
      }
      if (!mism) {
        found.push(s);
        add(S, s, 0, 'match', found, '🎯 พบแพตเทิร์นที่ตำแหน่ง ' + s + ' ! → เลื่อน 1');
        s += 1;
      } else {
        var c = text[s + j], bc = (last[c] == null) ? -1 : last[c];
        var shift = Math.max(1, j - bc);
        add(S, s, j, 'mismatch', found, 'ไม่ตรงที่ "' + c + '" · bad-char: เลื่อน max(1, ' + j + ' − ' + bc + ') = ' + shift + ' → s=' + (s + shift));
        s += shift;
      }
    }
    add(S, -1, -1, '', found, '✅ เสร็จ — พบ ' + found.length + ' ตำแหน่ง: [' + found.join(', ') + ']');
    return S.steps;
  }

  function clean(s) { return (s || '').toUpperCase().replace(/[^A-Z]/g, ''); }
  function run() {
    text = clean(document.getElementById('bm-text').value).slice(0, 18) || 'GCTTCTGCTACCTTC';
    pat = clean(document.getElementById('bm-pat').value).slice(0, 8) || 'CTAC';
    document.getElementById('bm-text').value = text; document.getElementById('bm-pat').value = pat;
    api.setSteps(build());
  }
  document.getElementById('bm-run').addEventListener('click', run);
  run();
})();
