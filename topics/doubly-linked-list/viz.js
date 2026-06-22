/* Doubly / Circular Linked List — ลูกศร next + prev (NodeViz) */
(function () {
  var api = DSA.NodeViz.init({ topicId: 'doubly-linked-list', vh: 240 });
  var NW = 66, NH = 50, GAP = 56, Y = 80, SX = 40, VW = api.VW;
  function X(i) { return SX + i * (NW + GAP); }
  var list = [], nid = 0, circular = false;

  function model(hi, cls) {
    var n = list.length, cells = [], arrows = [], labels = [];
    list.forEach(function (nd, i) {
      cells.push({ id: 'n' + nd.id, x: X(i), y: Y, w: NW, h: NH, text: nd.v, sub: (i === 0 ? 'head' : (i === n - 1 ? 'tail' : null)), cls: (nd.id === hi ? cls : '') });
      if (i < n - 1) {
        arrows.push({ id: 'nx' + i, x1: X(i) + NW, y1: Y + 14, x2: X(i + 1), y2: Y + 14 });          // next →
        arrows.push({ id: 'pv' + i, x1: X(i + 1), y1: Y + NH - 14, x2: X(i) + NW, y2: Y + NH - 14 });  // prev ←
      }
    });
    if (n) {
      if (circular) {
        arrows.push({ id: 'cyc-nx', x1: X(n - 1) + NW / 2, y1: Y + NH, x2: X(0) + NW / 2, y2: Y + NH + 30, cls: 'is-active' });
        labels.push({ id: 'cyc', x: (X(0) + X(n - 1)) / 2 + NW / 2, y: Y + NH + 46, text: '↩ next ของท้าย วนกลับหัว (และ prev ของหัว → ท้าย)', anchor: 'middle', cls: 'is-accent' });
      } else {
        labels.push({ id: 'nl', x: X(n - 1) + NW + 18, y: Y + 18, text: 'null', anchor: 'start' });
        labels.push({ id: 'nl2', x: X(0) - 18, y: Y + NH - 10, text: 'null', anchor: 'end' });
      }
    }
    return { cells: cells, arrows: arrows, labels: labels };
  }
  function add(S, hi, cls, desc, line) { S.add(DSA.NodeViz.snap(model(hi, cls)), desc, { line: line }); }
  function show(desc, hi, cls) { var S = new DSA.Stepper(); add(S, hi || -1, cls || '', desc, -1); api.setSteps(S.steps); }

  function build(values) { list = values.map(function (v) { return { id: ++nid, v: v }; }); show('Doubly Linked List พร้อม — แทรก/ลบ ที่หัวหรือท้ายได้ O(1) (กดปุ่ม 🔄 ดูแบบวน)'); }
  document.getElementById('dl-head').addEventListener('click', function () { var v = document.getElementById('dl-val').value.trim(); if (!v) { alert('ใส่ค่า'); return; } var node = { id: ++nid, v: v }; list.unshift(node); show('แทรก "' + v + '" ที่หัว → ปรับ prev/next ของหัวเดิม (O(1))', node.id, 'is-new'); });
  document.getElementById('dl-tail').addEventListener('click', function () { var v = document.getElementById('dl-val').value.trim(); if (!v) { alert('ใส่ค่า'); return; } var node = { id: ++nid, v: v }; list.push(node); show('แทรก "' + v + '" ที่ท้าย → ปรับ next/prev ของท้ายเดิม (O(1))', node.id, 'is-new'); });
  document.getElementById('dl-del').addEventListener('click', function () { var i = parseInt(document.getElementById('dl-idx').value, 10); if (isNaN(i) || i < 0 || i >= list.length) { alert('ใส่ตำแหน่ง 0-' + (list.length - 1)); return; } var v = list[i].v; list.splice(i, 1); show('ลบโหนดตำแหน่ง ' + i + ' (ค่า ' + v + ') → ต่อ prev↔next ของเพื่อนบ้านเข้าหากัน'); });
  document.getElementById('dl-circular').addEventListener('click', function () { circular = !circular; show(circular ? 'โหมดวน (circular): ท้าย→หัว และ หัว→ท้าย' : 'โหมดปกติ: ปลายทั้งสองข้างชี้ null'); });

  build([10, 20, 30, 40]);
})();
