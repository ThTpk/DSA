/* B+ Tree (max 3 keys) — คีย์อยู่ที่ใบ, ใบเชื่อมกัน, leaf-split คัดลอกขึ้น (custom svg + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'b-plus-tree');
  var host = document.getElementById('bpviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="bp-svg" preserveAspectRatio="xMidYMid meet"></svg></div><div id="bp-controls"></div></div>' +
    '<div><div class="code-panel" id="bp-code"></div></div></div>';
  var svg = d3.select('#bp-svg'), gE = svg.append('g'), gLink = svg.append('g'), gN = svg.append('g');
  var codeEl = document.getElementById('bp-code');
  var CODE = ['insert(key): เดินลงหา "ใบ" ที่ถูกช่วง', '  ใส่คีย์ลงใบ (เรียงในใบ)', 'ถ้าใบเต็ม (>3): แยกใบ', '  คัดลอกคีย์แรกของใบขวาขึ้นเป็นตัวคั่น', '  เชื่อมใบซ้าย → ใบขวา (ลิงก์)', 'ถ้าโหนดในเต็ม: แยก ดันตัวคั่นกลางขึ้น (ย้าย)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var MAX = 3, uid = 0, root = null;
  function node(leaf) { return { uid: ++uid, keys: [], children: [], leaf: leaf, next: null }; }

  var S, hotKey;
  function clone(n) { return { uid: n.uid, keys: n.keys.slice(), leaf: n.leaf, nextUid: n.next ? n.next.uid : null, children: n.children.map(clone) }; }
  function step(cur, split, desc, line) { S.add({ root: root ? clone(root) : null, cur: cur, split: split, hot: hotKey, msg: desc }, desc, { line: line }); }

  function splitLeaf(leaf) {
    var mid = Math.ceil((MAX + 1) / 2);          // 4 → 2
    var right = node(true);
    right.keys = leaf.keys.slice(mid);
    leaf.keys = leaf.keys.slice(0, mid);
    right.next = leaf.next; leaf.next = right;
    step(leaf.uid, leaf.uid, 'ใบเต็ม → แยก: คัดลอกคีย์ ' + right.keys[0] + ' ขึ้นเป็นตัวคั่น (ใบยังเก็บไว้) + เชื่อมลิงก์', 3);
    return { key: right.keys[0], right: right };
  }
  function splitInternal(n) {
    var up = Math.floor(n.keys.length / 2);      // 4 → 2
    var upKey = n.keys[up];
    var right = node(false);
    right.keys = n.keys.slice(up + 1);
    right.children = n.children.slice(up + 1);
    n.keys = n.keys.slice(0, up);
    n.children = n.children.slice(0, up + 1);
    step(n.uid, n.uid, 'โหนดในเต็ม → แยก: ดันตัวคั่น ' + upKey + ' ขึ้น (ย้าย ไม่คัดลอก)', 5);
    return { key: upKey, right: right };
  }
  function ins(n, key) {
    if (n.leaf) {
      var p = 0; while (p < n.keys.length && n.keys[p] < key) p++;
      if (n.keys[p] === key) { step(n.uid, null, 'มี ' + key + ' อยู่แล้ว — ไม่ใส่ซ้ำ', 1); return null; }
      n.keys.splice(p, 0, key);
      step(n.uid, null, 'ใส่ ' + key + ' ลงใบ → [' + n.keys.join(', ') + ']', 1);
      if (n.keys.length > MAX) return splitLeaf(n);
      return null;
    }
    var i = 0; while (i < n.keys.length && key >= n.keys[i]) i++;
    step(n.uid, null, 'เดินผ่านตัวคั่น [' + n.keys.join(', ') + '] → ลงลูกที่ ' + i, 0);
    var res = ins(n.children[i], key);
    if (res) {
      n.keys.splice(i, 0, res.key);
      n.children.splice(i + 1, 0, res.right);
      if (n.keys.length > MAX) return splitInternal(n);
    }
    return null;
  }
  function insert(key) {
    hotKey = key;
    if (!root) { root = node(true); root.keys.push(key); step(root.uid, null, 'สร้างใบรากด้วยคีย์ ' + key, 1); return; }
    step(root.uid, null, 'แทรก ' + key + ': เริ่มที่ราก', 0);
    var res = ins(root, key);
    if (res) { var nr = node(false); nr.keys = [res.key]; nr.children = [root, res.right]; root = nr; step(root.uid, null, 'รากแยก → สร้างรากใหม่ ต้นไม้สูงขึ้น', 5); }
  }

  // ---- delete (คีย์อยู่ที่ใบ ; underflow → ยืม/รวม ; ปรับตัวคั่นใหม่) ----
  var MIN = 1;
  function leftmost(n) { while (!n.leaf) n = n.children[0]; return n.keys[0]; }
  function refreshSeparators(n) { if (n.leaf) return; for (var j = 0; j < n.keys.length; j++) n.keys[j] = leftmost(n.children[j + 1]); }
  function fixChild(parent, i) {
    var c = parent.children[i];
    var left = i > 0 ? parent.children[i - 1] : null, right = i < parent.children.length - 1 ? parent.children[i + 1] : null;
    if (c.leaf) {
      if (left && left.keys.length > MIN) { c.keys.unshift(left.keys.pop()); step(c.uid, null, 'ใบคีย์น้อย → ยืมจากพี่ซ้าย', 3); }
      else if (right && right.keys.length > MIN) { c.keys.push(right.keys.shift()); step(c.uid, null, 'ใบคีย์น้อย → ยืมจากพี่ขวา', 3); }
      else if (left) { left.keys = left.keys.concat(c.keys); left.next = c.next; parent.children.splice(i, 1); parent.keys.splice(i - 1, 1); step(left.uid, left.uid, 'รวมใบกับพี่ซ้าย + ต่อลิงก์', 4); }
      else { c.keys = c.keys.concat(right.keys); c.next = right.next; parent.children.splice(i + 1, 1); parent.keys.splice(i, 1); step(c.uid, c.uid, 'รวมใบกับพี่ขวา + ต่อลิงก์', 4); }
    } else {
      if (left && left.keys.length > MIN) { c.keys.unshift(parent.keys[i - 1]); c.children.unshift(left.children.pop()); parent.keys[i - 1] = left.keys.pop(); step(c.uid, null, 'โหนดในยืมจากพี่ซ้าย', 3); }
      else if (right && right.keys.length > MIN) { c.keys.push(parent.keys[i]); c.children.push(right.children.shift()); parent.keys[i] = right.keys.shift(); step(c.uid, null, 'โหนดในยืมจากพี่ขวา', 3); }
      else if (left) { left.keys.push(parent.keys[i - 1]); left.keys = left.keys.concat(c.keys); left.children = left.children.concat(c.children); parent.children.splice(i, 1); parent.keys.splice(i - 1, 1); step(left.uid, left.uid, 'รวมโหนดในกับพี่ซ้าย', 5); }
      else { c.keys.push(parent.keys[i]); c.keys = c.keys.concat(right.keys); c.children = c.children.concat(right.children); parent.children.splice(i + 1, 1); parent.keys.splice(i, 1); step(c.uid, c.uid, 'รวมโหนดในกับพี่ขวา', 5); }
    }
  }
  function del(n, key) {
    if (n.leaf) {
      var idx = n.keys.indexOf(key);
      if (idx < 0) { step(n.uid, null, '❌ ไม่พบ ' + key, 0); return; }
      n.keys.splice(idx, 1); step(n.uid, null, 'ลบ ' + key + ' จากใบ → [' + n.keys.join(', ') + ']', 1);
      return;
    }
    var i = 0; while (i < n.keys.length && key >= n.keys[i]) i++;
    step(n.children[i].uid, null, 'เดินผ่านตัวคั่น [' + n.keys.join(', ') + '] → ลงลูกที่ ' + i, 0);
    del(n.children[i], key);
    if (n.children[i].keys.length < MIN) fixChild(n, i);
    refreshSeparators(n);
  }
  function deleteKey(key) {
    if (!root) return;
    hotKey = key;
    step(root.uid, null, 'ลบ ' + key + ': เริ่มที่ราก', 0);
    del(root, key);
    if (!root.leaf && root.keys.length === 0) { root = root.children[0]; step(root.uid, null, 'รากเหลือลูกเดียว → ยุบราก ต้นไม้เตี้ยลง', 5); }
    if (root.leaf && root.keys.length === 0) { root = null; step(null, null, 'ต้นไม้ว่างแล้ว', -1); }
  }

  // ---- layout + render ----
  var KW = 30, KH = 36, LEVELH = 84, GAP = 30, TOP = 24;
  function render(stepObj) {
    var st = stepObj.snapshot, r = st.root;
    gE.selectAll('*').remove(); gLink.selectAll('*').remove(); gN.selectAll('*').remove();
    if (!r) { svg.attr('viewBox', '0 0 640 200'); for (var z = 0; z < codeLineEls.length; z++) codeLineEls[z].classList.toggle('is-active', z === stepObj.meta.line); return; }
    var cursor = 20, maxX = 0, maxD = 0;
    function nw(n) { return Math.max(KW, n.keys.length * KW); }
    function place(n, depth) {
      n.y = TOP + depth * LEVELH; maxD = Math.max(maxD, depth);
      if (n.leaf || !n.children.length) { n.x = cursor + nw(n) / 2; cursor += nw(n) + GAP; }
      else { n.children.forEach(function (c) { place(c, depth + 1); }); n.x = (n.children[0].x + n.children[n.children.length - 1].x) / 2; }
      maxX = Math.max(maxX, n.x + nw(n) / 2);
    }
    place(r, 0);
    svg.attr('viewBox', '0 0 ' + Math.max(640, maxX + 20) + ' ' + (TOP + (maxD + 1) * LEVELH));

    var nodes = [], links = [], byUid = {};
    (function walk(n) { nodes.push(n); byUid[n.uid] = n; n.children.forEach(function (c) { links.push({ s: n, t: c }); walk(c); }); })(r);

    gE.selectAll('line').data(links).enter().append('line')
      .attr('x1', function (d) { return d.s.x; }).attr('y1', function (d) { return d.s.y + KH; })
      .attr('x2', function (d) { return d.t.x; }).attr('y2', function (d) { return d.t.y; }).attr('stroke', '#94a3b8');

    // leaf links (→)
    svg.select('defs').remove();
    svg.append('defs').html('<marker id="bp-ar" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#0ea5e9"></path></marker>');
    nodes.forEach(function (n) {
      if (n.leaf && n.nextUid && byUid[n.nextUid]) {
        var t = byUid[n.nextUid];
        gLink.append('line').attr('x1', n.x + nw(n) / 2).attr('y1', n.y + KH / 2).attr('x2', t.x - nw(t) / 2 - 2).attr('y2', t.y + KH / 2)
          .attr('stroke', '#0ea5e9').attr('stroke-dasharray', '4 3').attr('marker-end', 'url(#bp-ar)');
      }
    });

    var g = gN.selectAll('g.bn').data(nodes).enter().append('g');
    g.each(function (n) {
      var sel = d3.select(this), w = nw(n), x0 = n.x - w / 2;
      var fill = (st.split === n.uid) ? '#fee2e2' : (st.cur === n.uid ? '#fef3c7' : (n.leaf ? '#e0f2fe' : '#fff'));
      var stroke = (st.split === n.uid) ? '#ef4444' : (st.cur === n.uid ? '#f59e0b' : (n.leaf ? '#0ea5e9' : '#64748b'));
      sel.append('rect').attr('x', x0).attr('y', n.y).attr('width', w).attr('height', KH).attr('rx', 5).attr('fill', fill).attr('stroke', stroke).attr('stroke-width', 1.5);
      n.keys.forEach(function (key, ki) {
        if (ki > 0) sel.append('line').attr('x1', x0 + ki * (w / n.keys.length)).attr('y1', n.y).attr('x2', x0 + ki * (w / n.keys.length)).attr('y2', n.y + KH).attr('stroke', '#cbd5e1');
        sel.append('text').attr('x', x0 + (ki + 0.5) * (w / n.keys.length)).attr('y', n.y + KH / 2 + 5).attr('text-anchor', 'middle')
          .attr('font-family', 'JetBrains Mono, monospace').attr('font-weight', 600)
          .attr('fill', (key === st.hot && n.leaf ? '#10b981' : (n.leaf ? '#0c4a6e' : '#475569'))).text(key);
      });
    });
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === stepObj.meta.line);
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('bp-controls'), speed: 650 });
  function build(keys) {
    uid = 0; root = null; S = new DSA.Stepper();
    S.add({ root: null, cur: null, split: null, hot: null }, 'เริ่มจากต้นไม้ว่าง (คีย์จริงจะอยู่ที่ใบ)', { line: -1 });
    keys.forEach(function (k) { insert(k); });
    hotKey = null;
    S.add({ root: clone(root), cur: null, split: null, hot: null }, '✅ แทรกครบ ' + keys.length + ' คีย์ — คีย์จริงอยู่ที่ใบ เชื่อมกันด้วยลิงก์ (สแกนช่วงได้เร็ว)', { line: -1 });
    player.setSteps(S.steps);
  }
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 14); }
  var keysEl = document.getElementById('bp-keys');
  document.getElementById('bp-build').addEventListener('click', function () { var v = parseList(keysEl.value); if (!v.length) { alert('ใส่คีย์อย่างน้อย 1 ตัว'); return; } keysEl.value = v.join(', '); build(v); });
  document.getElementById('bp-random').addEventListener('click', function () { var a = [], used = {}; while (a.length < 10) { var x = 1 + Math.floor(Math.random() * 49); if (!used[x]) { used[x] = 1; a.push(x); } } keysEl.value = a.join(', '); build(a); });
  document.getElementById('bp-insert').addEventListener('click', function () {
    var k = parseInt(document.getElementById('bp-key').value, 10); if (isNaN(k)) { alert('ใส่คีย์ (ตัวเลข)'); return; }
    S = new DSA.Stepper(); insert(k); hotKey = null;
    S.add({ root: clone(root), cur: null, split: null, hot: null }, '✅ แทรก ' + k + ' เสร็จ', { line: -1 });
    player.setSteps(S.steps);
  });
  document.getElementById('bp-delete').addEventListener('click', function () {
    var k = parseInt(document.getElementById('bp-key').value, 10); if (isNaN(k)) { alert('ใส่คีย์ (ตัวเลข)'); return; }
    if (!root) { alert('ต้นไม้ว่าง'); return; }
    S = new DSA.Stepper(); deleteKey(k); hotKey = null;
    S.add({ root: root ? clone(root) : null, cur: null, split: null, hot: null }, '✅ ลบ ' + k + ' เสร็จ (คีย์จริงอยู่ที่ใบเสมอ)', { line: -1 });
    player.setSteps(S.steps);
  });
  build(parseList(keysEl.value));
})();
