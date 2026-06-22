/* Huffman Coding — รวม 2 ความถี่น้อยสุด สร้างต้นไม้ (custom forest render) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'huffman');
  var host = document.getElementById('hfviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg class="viz-svg" id="hf-svg" viewBox="0 0 720 360" preserveAspectRatio="xMidYMid meet"></svg></div><div id="hf-controls"></div></div>' +
    '<div><div class="code-panel" id="hf-code"></div></div></div>';
  var svg = d3.select('#hf-svg'), gE = svg.append('g'), gL = svg.append('g'), gN = svg.append('g');
  var codeEl = document.getElementById('hf-code'), codesEl = document.getElementById('hf-codes');
  var CODE = ['สร้างใบจาก (ตัวอักษร, ความถี่) ใส่ min-heap', 'ขณะเหลือ > 1 ต้น:', '  ดึง 2 ต้นที่ความถี่น้อยสุด', '  รวมเป็นโหนดใหม่ (ความถี่ = ผลรวม)', '  ใส่กลับเข้า heap', 'เดินซ้าย=0 ขวา=1 → รหัสของแต่ละตัว'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var VW = 720, VH = 360, PADX = 40, PADY = 40, R = 22;

  function render(step) {
    var st = step.snapshot, nodes = st.nodes, roots = st.roots;
    var map = {}; nodes.forEach(function (n) { map[n.id] = n; });
    var xi = 0, pos = {}, maxD = 0;
    function ino(id, d) { if (id == null) return; var n = map[id]; ino(n.left, d + 1); pos[id] = { xi: xi++, d: d }; maxD = Math.max(maxD, d); ino(n.right, d + 1); }
    roots.forEach(function (rid) { ino(rid, 0); });
    var cols = xi, iW = VW - 2 * PADX, iH = VH - 2 * PADY;
    function X(id) { return cols <= 1 ? VW / 2 : PADX + pos[id].xi / (cols - 1) * iW; }
    function Y(id) { return PADY + (maxD === 0 ? 0 : pos[id].d / maxD * iH); }

    var edges = [];
    nodes.forEach(function (n) {
      if (n.left != null) edges.push({ id: 'e' + n.left, x1: X(n.id), y1: Y(n.id), x2: X(n.left), y2: Y(n.left), mx: (X(n.id) + X(n.left)) / 2, my: (Y(n.id) + Y(n.left)) / 2, lab: '0' });
      if (n.right != null) edges.push({ id: 'e' + n.right, x1: X(n.id), y1: Y(n.id), x2: X(n.right), y2: Y(n.right), mx: (X(n.id) + X(n.right)) / 2, my: (Y(n.id) + Y(n.right)) / 2, lab: '1' });
    });
    var dur = 300;
    var ln = gE.selectAll('line.edge').data(edges, function (d) { return d.id; });
    ln.exit().remove();
    ln.enter().append('line').attr('class', 'edge').merge(ln).transition().duration(dur)
      .attr('x1', function (d) { return d.x1; }).attr('y1', function (d) { return d.y1; }).attr('x2', function (d) { return d.x2; }).attr('y2', function (d) { return d.y2; });
    var el = gL.selectAll('text.edge-label').data(edges, function (d) { return 'L' + d.id; });
    el.exit().remove();
    el.enter().append('text').attr('class', 'edge-label').merge(el).text(function (d) { return d.lab; }).transition().duration(dur).attr('x', function (d) { return d.mx; }).attr('y', function (d) { return d.my; });

    var nd = gN.selectAll('g.tnode').data(nodes, function (d) { return d.id; });
    nd.exit().remove();
    var ent = nd.enter().append('g').attr('class', 'tnode').attr('transform', function (d) { return 'translate(' + X(d.id) + ',' + Y(d.id) + ')'; }).style('opacity', 0);
    ent.append('circle').attr('r', R);
    ent.append('text').attr('class', 'tnode__val').attr('dy', '.34em');
    var all = ent.merge(nd);
    all.attr('class', function (d) { var c = 'tnode'; if (st.parent === d.id) c += ' is-found'; else if (st.merge && st.merge.indexOf(d.id) !== -1) c += ' is-compare'; return c; });
    all.select('.tnode__val').style('font-size', '12px').text(function (d) { return d.char ? d.char + ':' + d.freq : d.freq; });
    all.transition().duration(dur).style('opacity', 1).attr('transform', function (d) { return 'translate(' + X(d.id) + ',' + Y(d.id) + ')'; });

    codesEl.innerHTML = st.codes ? '<b>รหัส Huffman:</b> ' + Object.keys(st.codes).sort().map(function (ch) { return ch + ' = ' + st.codes[ch]; }).join(' &nbsp; ') : '';
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build(items) {
    var nid = 0, allNodes = {};
    function N(freq, char, l, r) { var n = { id: ++nid, freq: freq, char: char || null, left: l ? l.id : null, right: r ? r.id : null }; allNodes[n.id] = n; return n; }
    var forest = items.map(function (it) { return N(it.f, it.c, null, null); });
    var S = new DSA.Stepper();
    function serialize() { var arr = []; for (var k in allNodes) { var n = allNodes[k]; if (reachable(n.id)) arr.push({ id: n.id, freq: n.freq, char: n.char, left: n.left, right: n.right }); } return arr; }
    var liveRoots = forest.map(function (n) { return n.id; });
    function reachable(id) { // node is in current forest (under some live root)
      for (var i = 0; i < liveRoots.length; i++) if (contains(liveRoots[i], id)) return true; return false;
    }
    function contains(root, id) { if (root == null) return false; if (root === id) return true; var n = allNodes[root]; return contains(n.left, id) || contains(n.right, id); }
    function snap(merge, parent, codes) { return { nodes: serialize(), roots: liveRoots.slice(), merge: merge, parent: parent, codes: codes }; }

    S.add(snap(null, null, null), 'เริ่ม: ' + items.length + ' ใบ (ตัวอักษร:ความถี่) — รวมทีละ 2 ตัวที่น้อยสุด', { line: 0 });
    while (liveRoots.length > 1) {
      liveRoots.sort(function (a, b) { return allNodes[a].freq - allNodes[b].freq; });
      var a = liveRoots[0], b = liveRoots[1];
      S.add(snap([a, b], null, null), 'เลือก 2 ความถี่น้อยสุด: ' + label(a) + ' (' + allNodes[a].freq + ') และ ' + label(b) + ' (' + allNodes[b].freq + ')', { line: 2 });
      var parent = N(allNodes[a].freq + allNodes[b].freq, null, allNodes[a], allNodes[b]);
      liveRoots = liveRoots.slice(2); liveRoots.push(parent.id);
      S.add(snap(null, parent.id, null), 'รวมเป็นโหนดใหม่ ความถี่ = ' + allNodes[a].freq + ' + ' + allNodes[b].freq + ' = ' + parent.freq, { line: 3 });
    }
    function label(id) { var n = allNodes[id]; return n.char ? n.char : '(' + n.freq + ')'; }
    // assign codes
    var codes = {};
    (function walk(id, code) { if (id == null) return; var n = allNodes[id]; if (n.char) { codes[n.char] = code || '0'; return; } walk(n.left, code + '0'); walk(n.right, code + '1'); })(liveRoots[0], '');
    S.add(snap(null, null, codes), '✅ สร้างต้นไม้เสร็จ — เดินซ้าย=0 ขวา=1 ได้รหัสด้านล่าง', { line: 5 });
    return S.steps;
  }

  var player;
  function run() {
    var items = (document.getElementById('hf-input').value || '').split(/[,]+/).map(function (s) { var m = s.trim().split(/[:=\s]+/); return { c: (m[0] || '').toUpperCase().slice(0, 1), f: parseInt(m[1], 10) }; }).filter(function (x) { return x.c && !isNaN(x.f) && x.f > 0; }).slice(0, 8);
    if (items.length < 2) { alert('ใส่อย่างน้อย 2 ตัว เช่น A:5, B:9'); return; }
    if (!player) player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('hf-controls'), speed: 700 });
    player.setSteps(build(items));
  }
  document.getElementById('hf-run').addEventListener('click', run);
  run();
})();
