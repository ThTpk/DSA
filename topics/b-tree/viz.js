/* B-Tree (t=2, max 3 keys) — proactive split insert (custom svg + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'b-tree');
  var host = document.getElementById('btviz');
  host.innerHTML = '<div class="viz-grid"><div><div class="viz-stage"><svg id="bt-svg" preserveAspectRatio="xMidYMid meet"></svg></div><div id="bt-controls"></div></div>' +
    '<div><div class="code-panel" id="bt-code"></div></div></div>';
  var svg = d3.select('#bt-svg'), gE = svg.append('g'), gN = svg.append('g');
  var codeEl = document.getElementById('bt-code');
  var CODE = ['insert(key):', '  ถ้าราก "เต็ม" (3 คีย์): แยกรากก่อน (ต้นไม้สูงขึ้น)', '  เดินลงหาใบ — ถ้าลูกที่จะลงเต็ม: แยกก่อน', '  แยก: ดันคีย์กลางขึ้นแม่ แตกเป็น 2 โหนด', '  ใส่คีย์ลงใบที่ถูกตำแหน่ง (เรียงในโหนด)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var T = 2, MAX = 2 * T - 1, uid = 0, root = null;
  function node(leaf) { return { uid: ++uid, keys: [], children: [], leaf: leaf }; }

  // ----- โครงสร้าง B-tree (proactive split) -----
  var S, hotKey;
  function clone(n) { return { uid: n.uid, keys: n.keys.slice(), children: n.children.map(clone), leaf: n.leaf }; }
  function step(cur, splitU, desc, line) {
    S.add({ root: root ? clone(root) : null, cur: cur, split: splitU, hot: hotKey, msg: desc }, desc, { line: line });
  }
  function splitChild(parent, i) {
    var child = parent.children[i], right = node(child.leaf);
    var mid = child.keys[T - 1];
    right.keys = child.keys.slice(T);
    child.keys = child.keys.slice(0, T - 1);
    if (!child.leaf) { right.children = child.children.slice(T); child.children = child.children.slice(0, T); }
    parent.keys.splice(i, 0, mid);
    parent.children.splice(i + 1, 0, right);
    step(child.uid, child.uid, 'โหนดเต็ม → แยก: ดันคีย์กลาง ' + mid + ' ขึ้นแม่ แตกเป็น 2 โหนด', 3);
  }
  function insertNonFull(n, key) {
    step(n.uid, null, 'เดินผ่านโหนด [' + n.keys.join(', ') + ']', 2);
    if (n.leaf) {
      var p = n.keys.length; while (p > 0 && key < n.keys[p - 1]) p--;
      n.keys.splice(p, 0, key);
      step(n.uid, null, 'ใส่ ' + key + ' ลงใบ → [' + n.keys.join(', ') + ']', 4);
    } else {
      var i = n.keys.length; while (i > 0 && key < n.keys[i - 1]) i--;
      if (n.children[i].keys.length === MAX) { splitChild(n, i); if (key > n.keys[i]) i++; }
      insertNonFull(n.children[i], key);
    }
  }
  function insert(key) {
    hotKey = key;
    if (!root) { root = node(true); root.keys.push(key); step(root.uid, null, 'สร้างรากด้วยคีย์ ' + key, 4); return; }
    step(root.uid, null, 'แทรก ' + key + ': เริ่มที่ราก', 0);
    if (root.keys.length === MAX) {
      var s = node(false); s.children.push(root); root = s;
      splitChild(s, 0);
      step(root.uid, null, 'รากเต็ม → แยกราก ต้นไม้สูงขึ้น 1 ชั้น', 1);
    }
    insertNonFull(root, key);
  }

  // ----- delete (CLRS: เติมให้ลูกมี ≥ T คีย์ ก่อนเดินลง) -----
  function getPred(n) { while (!n.leaf) n = n.children[n.children.length - 1]; return n.keys[n.keys.length - 1]; }
  function getSucc(n) { while (!n.leaf) n = n.children[0]; return n.keys[0]; }
  function merge(parent, i) {
    var c = parent.children[i], rc = parent.children[i + 1];
    c.keys.push(parent.keys[i]); c.keys = c.keys.concat(rc.keys);
    if (!c.leaf) c.children = c.children.concat(rc.children);
    parent.keys.splice(i, 1); parent.children.splice(i + 1, 1);
    step(c.uid, c.uid, 'รวมโหนด: ลูกซ้าย + คีย์คั่น + ลูกขวา → โหนดเดียว', -1);
    return c;
  }
  function fill(parent, i) {
    var c = parent.children[i];
    var left = i > 0 ? parent.children[i - 1] : null;
    var right = i < parent.children.length - 1 ? parent.children[i + 1] : null;
    if (left && left.keys.length >= T) {
      c.keys.unshift(parent.keys[i - 1]); parent.keys[i - 1] = left.keys.pop();
      if (!c.leaf) c.children.unshift(left.children.pop());
      step(c.uid, null, 'ลูกมีคีย์น้อย → ยืมจากพี่ซ้าย (หมุนผ่านแม่)', -1); return i;
    } else if (right && right.keys.length >= T) {
      c.keys.push(parent.keys[i]); parent.keys[i] = right.keys.shift();
      if (!c.leaf) c.children.push(right.children.shift());
      step(c.uid, null, 'ลูกมีคีย์น้อย → ยืมจากพี่ขวา (หมุนผ่านแม่)', -1); return i;
    }
    if (left) { merge(parent, i - 1); return i - 1; }
    merge(parent, i); return i;
  }
  function del(n, key) {
    var i = 0; while (i < n.keys.length && n.keys[i] < key) i++;
    if (i < n.keys.length && n.keys[i] === key) {
      if (n.leaf) { n.keys.splice(i, 1); step(n.uid, null, 'ลบ ' + key + ' จากใบ', -1); return; }
      var lc = n.children[i], rc = n.children[i + 1];
      if (lc.keys.length >= T) { var pr = getPred(lc); step(n.uid, null, 'คีย์อยู่โหนดใน → แทน ' + key + ' ด้วย predecessor ' + pr + ' แล้วลบ ' + pr + ' ต่อ', -1); n.keys[i] = pr; del(lc, pr); }
      else if (rc.keys.length >= T) { var su = getSucc(rc); step(n.uid, null, 'แทน ' + key + ' ด้วย successor ' + su + ' แล้วลบ ' + su + ' ต่อ', -1); n.keys[i] = su; del(rc, su); }
      else { merge(n, i); del(n.children[i], key); }
    } else {
      if (n.leaf) { step(n.uid, null, '❌ ไม่พบ ' + key, -1); return; }
      step(n.children[i].uid, null, 'ยังไม่เจอ ' + key + ' → เดินลงลูกที่ ' + i, -1);
      if (n.children[i].keys.length < T) i = fill(n, i);
      del(n.children[Math.min(i, n.children.length - 1)], key);
    }
  }
  function deleteKey(key) {
    if (!root) return;
    hotKey = key;
    step(root.uid, null, 'ลบ ' + key + ': เริ่มที่ราก', -1);
    del(root, key);
    if (root.keys.length === 0 && !root.leaf) { root = root.children[0]; step(root.uid, null, 'รากว่าง → ยุบราก ต้นไม้เตี้ยลง 1 ชั้น', -1); }
  }

  // ----- layout + render -----
  var KW = 30, KH = 36, LEVELH = 82, GAP = 26, TOP = 24;
  function render(stepObj) {
    var st = stepObj.snapshot, r = st.root;
    gE.selectAll('*').remove(); gN.selectAll('*').remove();
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

    var nodes = [], links = [];
    (function walk(n) { nodes.push(n); n.children.forEach(function (c) { links.push({ s: n, t: c }); walk(c); }); })(r);

    gE.selectAll('line').data(links).enter().append('line')
      .attr('x1', function (d) { return d.s.x; }).attr('y1', function (d) { return d.s.y + KH; })
      .attr('x2', function (d) { return d.t.x; }).attr('y2', function (d) { return d.t.y; })
      .attr('stroke', '#94a3b8');

    var g = gN.selectAll('g.bn').data(nodes).enter().append('g');
    g.each(function (n) {
      var sel = d3.select(this), w = nw(n), x0 = n.x - w / 2;
      var fill = (st.split === n.uid) ? '#fee2e2' : (st.cur === n.uid ? '#fef3c7' : '#fff');
      var stroke = (st.split === n.uid) ? '#ef4444' : (st.cur === n.uid ? '#f59e0b' : '#64748b');
      sel.append('rect').attr('x', x0).attr('y', n.y).attr('width', w).attr('height', KH).attr('rx', 5).attr('fill', fill).attr('stroke', stroke).attr('stroke-width', 1.5);
      n.keys.forEach(function (key, ki) {
        if (ki > 0) sel.append('line').attr('x1', x0 + ki * (w / n.keys.length)).attr('y1', n.y).attr('x2', x0 + ki * (w / n.keys.length)).attr('y2', n.y + KH).attr('stroke', '#e2e8f0');
        sel.append('text').attr('x', x0 + (ki + 0.5) * (w / n.keys.length)).attr('y', n.y + KH / 2 + 5).attr('text-anchor', 'middle')
          .attr('font-family', 'JetBrains Mono, monospace').attr('font-weight', 600)
          .attr('fill', (key === st.hot ? '#10b981' : '#1e293b')).text(key);
      });
    });
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === stepObj.meta.line);
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('bt-controls'), speed: 650 });
  function build(keys) {
    uid = 0; root = null; S = new DSA.Stepper();
    S.add({ root: null, cur: null, split: null, hot: null }, 'เริ่มจากต้นไม้ว่าง (t=2: 1–3 คีย์ต่อโหนด)', { line: -1 });
    keys.forEach(function (k) { insert(k); });
    hotKey = null;
    S.add({ root: clone(root), cur: null, split: null, hot: null }, '✅ แทรกครบ ' + keys.length + ' คีย์ — ทุกใบลึกเท่ากัน (สมดุล)', { line: -1 });
    player.setSteps(S.steps);
  }
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x); }).slice(0, 14); }
  var keysEl = document.getElementById('bt-keys');
  document.getElementById('bt-build').addEventListener('click', function () { var v = parseList(keysEl.value); if (!v.length) { alert('ใส่คีย์อย่างน้อย 1 ตัว'); return; } keysEl.value = v.join(', '); build(v); });
  document.getElementById('bt-random').addEventListener('click', function () { var a = [], used = {}; while (a.length < 10) { var x = 1 + Math.floor(Math.random() * 49); if (!used[x]) { used[x] = 1; a.push(x); } } keysEl.value = a.join(', '); build(a); });
  document.getElementById('bt-insert').addEventListener('click', function () {
    var k = parseInt(document.getElementById('bt-key').value, 10); if (isNaN(k)) { alert('ใส่คีย์ (ตัวเลข)'); return; }
    S = new DSA.Stepper(); insert(k); hotKey = null;
    S.add({ root: clone(root), cur: null, split: null, hot: null }, '✅ แทรก ' + k + ' เสร็จ', { line: -1 });
    player.setSteps(S.steps);
  });
  document.getElementById('bt-delete').addEventListener('click', function () {
    var k = parseInt(document.getElementById('bt-key').value, 10); if (isNaN(k)) { alert('ใส่คีย์ (ตัวเลข)'); return; }
    if (!root) { alert('ต้นไม้ว่าง'); return; }
    S = new DSA.Stepper(); deleteKey(k); hotKey = null;
    S.add({ root: root ? clone(root) : null, cur: null, split: null, hot: null }, '✅ ลบ ' + k + ' เสร็จ (ยังสมดุล)', { line: -1 });
    player.setSteps(S.steps);
  });
  build(parseList(keysEl.value));
})();
