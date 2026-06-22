/* Floyd's Cycle Detection — slow/fast pointers (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'floyds-cycle', vh: 250 });
  var NW = 54, NH = 46, GAP = 40, Y = 70, SX = 30, VW = api.VW;
  function X(i) { return SX + i * (NW + GAP); }
  var N = 9, cycleStart = 4, hasCycle = true;
  function next(i) { if (i === N - 1) return hasCycle ? cycleStart : -1; return i + 1; }

  function model(slow, fast, meet) {
    var cells = [], arrows = [], labels = [];
    for (var i = 0; i < N; i++) {
      var cls = '';
      if (meet != null && i === meet) cls = 'is-found';
      else if (i === slow && i === fast) cls = 'is-found';
      else if (i === slow) cls = 'is-highlight';
      else if (i === fast) cls = 'is-active';
      cells.push({ id: 'n' + i, x: X(i), y: Y, w: NW, h: NH, text: i, sub: null, cls: cls });
      if (i < N - 1) arrows.push({ id: 'a' + i, x1: X(i) + NW, y1: Y + NH / 2, x2: X(i + 1), y2: Y + NH / 2 });
    }
    if (hasCycle) arrows.push({ id: 'acyc', x1: X(N - 1) + NW / 2, y1: Y + NH, x2: X(cycleStart) + NW / 2, y2: Y + NH + 38, cls: 'is-active' });
    else { arrows.push({ id: 'anull', x1: X(N - 1) + NW, y1: Y + NH / 2, x2: X(N - 1) + NW + GAP - 6, y2: Y + NH / 2 }); labels.push({ id: 'null', x: X(N - 1) + NW + GAP, y: Y + NH / 2 + 4, text: 'null', anchor: 'start' }); }
    if (hasCycle) labels.push({ id: 'cyc', x: (X(cycleStart) + X(N - 1)) / 2 + NW / 2, y: Y + NH + 52, text: '↑ วนกลับมาที่ ' + cycleStart, anchor: 'middle' });
    if (slow >= 0) labels.push({ id: 'slow', x: X(slow) + NW / 2, y: Y - 12, text: '🐢 slow', anchor: 'middle', cls: 'is-accent' });
    if (fast >= 0) labels.push({ id: 'fast', x: X(fast) + NW / 2, y: Y - 30, text: '🐇 fast', anchor: 'middle', cls: 'is-accent' });
    return { cells: cells, arrows: arrows, labels: labels };
  }
  function add(S, slow, fast, meet, desc, line) { S.add(DSA.NodeViz.snap(model(slow, fast, meet)), desc, { line: line }); }

  var CODE = ['slow = fast = head', 'while fast และ fast.next ไม่ใช่ null:', '  slow = slow.next        // 1 ก้าว', '  fast = fast.next.next    // 2 ก้าว', '  if slow == fast: เจอวงวน ✓', 'ถ้า fast ถึง null = ไม่มีวงวน'];

  function build() {
    var S = new DSA.Stepper();
    var slow = 0, fast = 0, guard = 0;
    add(S, slow, fast, null, 'เริ่ม: slow และ fast อยู่ที่ head (โหนด 0)', 0);
    while (guard++ < 40) {
      var f1 = next(fast); if (f1 === -1) { add(S, slow, fast, null, 'fast ถึง null → ❌ ไม่มีวงวน', 5); return S.steps; }
      var f2 = next(f1); if (f2 === -1) { add(S, slow, fast, null, 'fast.next ถึง null → ❌ ไม่มีวงวน', 5); return S.steps; }
      slow = next(slow); fast = f2;
      add(S, slow, fast, null, 'slow → ' + slow + ' (1 ก้าว), fast → ' + fast + ' (2 ก้าว)', 3);
      if (slow === fast) { add(S, slow, fast, slow, '🎉 slow เจอ fast ที่โหนด ' + slow + ' → มีวงวน!', 4); return S.steps; }
    }
    return S.steps;
  }

  function go() { api.setCode(CODE); api.setSteps(build()); }
  document.getElementById('fc-run').addEventListener('click', go);
  document.getElementById('fc-toggle').addEventListener('click', function () { hasCycle = !hasCycle; go(); });
  go();
})();
