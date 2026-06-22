/* Z-algorithm — Z-array ของ pattern#text (NodeViz 1 แถว + ค่า Z ใต้ช่อง) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'z-algorithm', vh: 240 });
  var VW = api.VW, H = 46, Y = 80;
  var s = '', m = 0, sep = 1;

  function model(z, i, l, r, found) {
    var n = s.length;
    var W = Math.min(40, Math.floor((VW - 30) / n));
    var SX = (VW - n * W) / 2;
    var inFound = {}; found.forEach(function (f) { for (var k = f; k < f + m; k++) inFound[k] = true; });
    var cells = [];
    for (var k = 0; k < n; k++) {
      var cls = '';
      if (k === i) cls = 'is-active';
      else if (i >= 0 && k > i && k <= r && k >= l) cls = 'is-frontier';
      else if (inFound[k]) cls = 'is-found';
      var ch = s[k] === '#' ? '#' : s[k];
      cells.push({ id: 'c' + k, x: SX + k * W, y: Y, w: W - 2, h: H, text: ch, sub: (z[k] == null ? '' : z[k]), cls: (s[k] === '#' ? '' : cls) });
    }
    var labels = [{ id: 'lr', x: SX, y: Y + H + 34, text: (i < 0 ? 's = pattern + "#" + text (เลขใต้ช่อง = Z[i])' : 'i=' + i + '  หน้าต่าง [l=' + l + ', r=' + r + ']'), anchor: 'start', cls: 'is-accent' }];
    return { cells: cells, labels: labels };
  }
  function add(S, z, i, l, r, found, desc) { S.add(DSA.NodeViz.snap(model(z, i, l, r, found)), desc, { line: -1 }); }

  function build() {
    var n = s.length, z = new Array(n).fill(null);
    var S = new DSA.Stepper();
    var found = [];
    z[0] = 0; // ไม่นิยามให้ตัวเอง
    add(S, z.slice(), -1, 0, 0, found, 's = "' + s + '" (ยาว ' + n + ') · |pattern| = ' + m);
    var l = 0, r = 0;
    for (var i = 1; i < n; i++) {
      if (i < r) { z[i] = Math.min(r - i, z[i - l]); add(S, z.slice(), i, l, r, found, 'i=' + i + ' อยู่ในหน้าต่าง → เริ่ม Z[' + i + '] = min(' + (r - i) + ', Z[' + (i - l) + ']=' + z[i - l] + ') = ' + z[i]); }
      else { z[i] = 0; }
      while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
      add(S, z.slice(), i, l, r, found, 'ขยายการเทียบ → Z[' + i + '] = ' + z[i]);
      if (i + z[i] > r) { l = i; r = i + z[i]; add(S, z.slice(), i, l, r, found, 'อัปเดตหน้าต่าง [l, r] = [' + l + ', ' + r + ']'); }
      if (z[i] === m && m > 0) {
        var pos = i - (m + 1);
        found.push(i);
        add(S, z.slice(), i, l, r, found, '🎯 Z[' + i + '] = |pattern| = ' + m + ' → พบแพตเทิร์นในข้อความที่ตำแหน่ง ' + pos);
      }
    }
    var positions = found.map(function (i) { return i - (m + 1); });
    add(S, z.slice(), -1, 0, 0, found, '✅ เสร็จ — พบแพตเทิร์น ' + positions.length + ' ตำแหน่ง: [' + positions.join(', ') + ']');
    return S.steps;
  }

  function clean(x) { return (x || '').toUpperCase().replace(/[^A-Z]/g, ''); }
  function run() {
    var text = clean(document.getElementById('z-text').value).slice(0, 16) || 'ABABABA';
    var pat = clean(document.getElementById('z-pat').value).slice(0, 6) || 'ABA';
    document.getElementById('z-text').value = text; document.getElementById('z-pat').value = pat;
    m = pat.length; s = pat + '#' + text;
    api.setSteps(build());
  }
  document.getElementById('z-run').addEventListener('click', run);
  run();
})();
