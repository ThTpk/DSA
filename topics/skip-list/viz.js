/* Skip List — ค้นหาแบบเดินขวา/ลงล่าง (NodeViz หลายชั้น) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'skip-list', vh: 280 });
  var VALUES = [3, 7, 12, 19, 23, 29, 37, 43];
  var HEIGHTS = [1, 2, 1, 3, 1, 2, 1, 2];   // ความสูงของแต่ละโหนด
  var MAXL = 3, N = VALUES.length;
  var W = 50, GAP = 22, ROWH = 64, TOP = 30, HX = 30, VW = api.VW;
  function slot(col) { return col + 1; }       // head col=-1 → slot 0
  function X(col) { return HX + slot(col) * (W + GAP); }
  function Yl(level) { return TOP + (MAXL - 1 - level) * ROWH; }
  function present(col, level) { return col === -1 ? true : HEIGHTS[col] > level; }
  function valOf(col) { return col === -1 ? 'H' : VALUES[col]; }
  function rightOf(col, level) { for (var c = col + 1; c < N; c++) if (present(c, level)) return c; return null; }

  function model(curCol, curLevel, path, foundCol) {
    var cells = [], arrows = [];
    function key(col, level) { return col + ',' + level; }
    var pset = {}; (path || []).forEach(function (p) { pset[key(p[0], p[1])] = 1; });
    for (var col = -1; col < N; col++) {
      for (var L = 0; L < MAXL; L++) {
        if (!present(col, L)) continue;
        var cls = '';
        if (col === foundCol) cls = 'is-found';
        else if (col === curCol && L === curLevel) cls = 'is-active';
        else if (pset[key(col, L)]) cls = 'is-highlight';
        cells.push({ id: 'm' + col + '_' + L, x: X(col), y: Yl(L), w: W, h: 44, text: valOf(col), sub: null, cls: cls });
      }
    }
    for (var L2 = 0; L2 < MAXL; L2++) {
      var prev = -1; // head always present
      var nx;
      while ((nx = rightOf(prev, L2)) !== null) {
        arrows.push({ id: 'a' + L2 + '_' + prev, x1: X(prev) + W, y1: Yl(L2) + 22, x2: X(nx), y2: Yl(L2) + 22 });
        prev = nx;
      }
    }
    return { cells: cells, arrows: arrows };
  }
  function add(S, cur, lvl, path, found, desc, line) { S.add(DSA.NodeViz.snap(model(cur, lvl, path, found)), desc, { line: line }); }

  var CODE = ['cur = head, level = ชั้นบนสุด', 'while level >= 0:', '  while ขวา ≤ target: เลื่อนขวา', '  ลงล่าง 1 ชั้น (level--)', 'ถึงชั้นล่างสุด: เจอ/ไม่เจอ'];

  function search(target) {
    api.setCode(CODE);
    var S = new DSA.Stepper();
    var cur = -1, level = MAXL - 1, path = [[-1, level]];
    add(S, cur, level, path, null, 'เริ่มที่ head ชั้นบนสุด (ชั้น ' + level + ') หา ' + target, 0);
    while (level >= 0) {
      var nx = rightOf(cur, level);
      while (nx !== null && VALUES[nx] <= target) {
        add(S, cur, level, path, null, 'ชั้น ' + level + ': ทางขวาคือ ' + VALUES[nx] + ' ≤ ' + target + ' → เลื่อนขวา', 2);
        cur = nx; path.push([cur, level]);
        if (VALUES[cur] === target) { add(S, cur, level, path, cur, '✅ เจอ ' + target + ' ที่ชั้น ' + level, 2); return S.steps; }
        nx = rightOf(cur, level);
      }
      add(S, cur, level, path, null, 'ชั้น ' + level + ': ทางขวา ' + (nx === null ? 'ไม่มี (null)' : '= ' + VALUES[nx] + ' > ' + target) + ' → ลงล่าง 1 ชั้น', 3);
      level--;
      if (level >= 0) path.push([cur, level]);
    }
    add(S, cur, 0, path, null, '❌ ถึงชั้นล่างสุดแล้ว ไม่พบ ' + target, 4);
    return S.steps;
  }

  function go(t) { api.setSteps(search(t)); }
  document.getElementById('sk-search').addEventListener('click', function () { var t = parseInt(document.getElementById('sk-target').value, 10); if (isNaN(t)) { alert('ใส่ตัวเลข'); return; } go(t); });
  document.getElementById('sk-target').value = '29';
  go(29);
})();
