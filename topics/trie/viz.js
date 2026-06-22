/* Trie (Prefix Tree) — n-ary tree วางผังด้วย d3.tree() (ใช้ VizPlayer/Stepper เดิม) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'trie');

  var VW = 720, VH = 360, PAD = 36;
  var host = document.getElementById('trieviz');
  host.innerHTML =
    '<div class="viz-grid">' +
      '<div>' +
        '<div class="viz-stage"><svg class="viz-svg" id="tr-svg" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet"></svg></div>' +
        '<div class="viz-legend">' +
          '<span><i class="swatch" style="background:var(--tree-node)"></i> โหนดปกติ</span>' +
          '<span><i class="swatch" style="background:var(--viz-compare)"></i> กำลังดู</span>' +
          '<span><i class="swatch" style="background:var(--search-active)"></i> เส้นทางที่ผ่าน</span>' +
          '<span><i class="swatch" style="background:var(--viz-sorted)"></i> จุดจบคำ / เจอ</span>' +
        '</div>' +
        '<div id="tr-controls"></div>' +
      '</div>' +
      '<div><div class="code-panel" id="tr-code"></div></div>' +
    '</div>';

  var svg = d3.select('#tr-svg');
  var gE = svg.append('g').attr('class', 'edges');
  var gN = svg.append('g').attr('class', 'nodes');
  var codeEl = document.getElementById('tr-code');
  var codeLineEls = [];
  function setCode(lines) {
    codeEl.innerHTML = lines.map(function (l) {
      return '<span class="code__line">' + l.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>';
    }).join('');
    codeLineEls = codeEl.querySelectorAll('.code__line');
  }

  var INSERT_CODE = [
    'insert(word):  node = root',                    // 0
    'for c in word:',                                // 1
    '  if c not in node.children: สร้างโหนด c',       // 2
    '  node = node.children[c]',                     // 3
    'node.isEnd = true   // ทำเครื่องหมายจบคำ',        // 4
  ];
  var SEARCH_CODE = [
    'search(word):  node = root',                    // 0
    'for c in word:',                                // 1
    '  if c not in node.children: return ไม่พบ',      // 2
    '  node = node.children[c]',                     // 3
    'return node.isEnd',                             // 4
  ];

  // ----- โครงสร้าง trie -----
  var trie = { id: 0, char: '', isEnd: false, children: {} };
  var tid = 0;
  function serialize(node) {
    return {
      id: node.id, char: node.char, isEnd: node.isEnd,
      children: Object.keys(node.children).sort().map(function (k) { return serialize(node.children[k]); }),
    };
  }
  function snap(m) {
    m = m || {};
    return {
      root: serialize(trie),
      current: (m.current || []).slice(),
      path: (m.path || []).slice(),
      found: (m.found || []).slice(),
    };
  }

  // ----- render ด้วย d3.tree -----
  function renderStep(step) {
    var st = step.snapshot;
    var hier = d3.hierarchy(st.root, function (d) { return d.children; });
    d3.tree().size([VW - 2 * PAD, VH - 2 * PAD])(hier);
    var nodes = hier.descendants(), links = hier.links();
    function X(n) { return PAD + n.x; }
    function Y(n) { return PAD + n.y; }
    var dur = 300;

    var ln = gE.selectAll('line.edge').data(links, function (d) { return d.target.data.id; });
    ln.exit().remove();
    ln.enter().append('line').attr('class', 'edge')
        .attr('x1', function (d) { return X(d.source); }).attr('y1', function (d) { return Y(d.source); })
        .attr('x2', function (d) { return X(d.source); }).attr('y2', function (d) { return Y(d.source); })
      .merge(ln).transition().duration(dur)
        .attr('x1', function (d) { return X(d.source); }).attr('y1', function (d) { return Y(d.source); })
        .attr('x2', function (d) { return X(d.target); }).attr('y2', function (d) { return Y(d.target); });

    var lb = gE.selectAll('text.edge-label').data(links, function (d) { return 'L' + d.target.data.id; });
    lb.exit().remove();
    lb.enter().append('text').attr('class', 'edge-label')
      .merge(lb).text(function (d) { return d.target.data.char; })
        .transition().duration(dur)
        .attr('x', function (d) { return (X(d.source) + X(d.target)) / 2 + 8; })
        .attr('y', function (d) { return (Y(d.source) + Y(d.target)) / 2; });

    function ncls(d) {
      var c = 'tnode';
      if (st.found.indexOf(d.data.id) !== -1) c += ' is-found';
      else if (st.current.indexOf(d.data.id) !== -1) c += ' is-compare';
      else if (st.path.indexOf(d.data.id) !== -1) c += ' is-visited';
      if (d.data.isEnd) c += ' is-end';
      return c;
    }
    var nd = gN.selectAll('g.tnode').data(nodes, function (d) { return d.data.id; });
    nd.exit().remove();
    var ent = nd.enter().append('g').attr('class', 'tnode')
        .attr('transform', function (d) { return 'translate(' + X(d) + ',' + Y(d) + ')'; })
        .style('opacity', 0);
    ent.append('circle').attr('r', 15);
    ent.append('text').attr('class', 'tnode__val').attr('dy', '.34em');
    var all = ent.merge(nd);
    all.attr('class', ncls);
    all.select('.tnode__val').text(function (d) { return d.data.char || '•'; });
    all.transition().duration(dur).style('opacity', 1)
        .attr('transform', function (d) { return 'translate(' + X(d) + ',' + Y(d) + ')'; });

    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  var player = new DSA.VizPlayer({ steps: [], render: renderStep, controlsEl: document.getElementById('tr-controls'), speed: 650 });

  // ----- operations -----
  function insertSteps(S, word) {
    function step(d, l, m) { S.add(snap(m || {}), d, { line: l }); }
    var node = trie, path = [trie.id];
    step('insert "' + word + '": เริ่มที่ราก', 0, { current: [trie.id], path: path.slice() });
    for (var k = 0; k < word.length; k++) {
      var c = word[k];
      step('ตัวอักษร "' + c + '": มีลูกนี้หรือยัง?', 1, { current: [node.id], path: path.slice() });
      if (!node.children[c]) {
        node.children[c] = { id: ++tid, char: c, isEnd: false, children: {} };
        step('ไม่มี → สร้างโหนด "' + c + '"', 2, { current: [node.children[c].id], path: path.slice() });
      } else {
        step('มี "' + c + '" อยู่แล้ว → ใช้เส้นทางเดิม', 3, { current: [node.children[c].id], path: path.slice() });
      }
      node = node.children[c]; path.push(node.id);
    }
    node.isEnd = true;
    step('ทำเครื่องหมายจบคำที่ "' + word + '" (วงเขียว)', 4, { found: [node.id], path: path.slice() });
  }

  function searchSteps(word) {
    setCode(SEARCH_CODE);
    var S = new DSA.Stepper();
    function step(d, l, m) { S.add(snap(m || {}), d, { line: l }); }
    var node = trie, path = [trie.id];
    step('search "' + word + '": เริ่มที่ราก', 0, { current: [trie.id], path: path.slice() });
    for (var k = 0; k < word.length; k++) {
      var c = word[k];
      step('ตัวอักษร "' + c + '": มีเส้นทางนี้ไหม?', 1, { current: [node.id], path: path.slice() });
      if (!node.children[c]) { step('❌ ไม่มี "' + c + '" → ไม่พบคำ "' + word + '"', 2, { path: path.slice() }); return S.steps; }
      node = node.children[c]; path.push(node.id);
      step('เดินไปที่ "' + c + '"', 3, { current: [node.id], path: path.slice() });
    }
    if (node.isEnd) step('✅ ถึงปลายทางและเป็นจุดจบคำ → เจอ "' + word + '"', 4, { found: [node.id], path: path.slice() });
    else step('❌ ถึงปลายทางแต่ไม่ใช่จุดจบคำ → "' + word + '" เป็นแค่ prefix ไม่ใช่คำ', 4, { current: [node.id], path: path.slice() });
    return S.steps;
  }

  function buildSteps(words) {
    setCode(INSERT_CODE);
    trie = { id: 0, char: '', isEnd: false, children: {} }; tid = 0;
    var S = new DSA.Stepper();
    S.add(snap({}), 'เริ่มจาก Trie ว่าง (มีแต่ราก)', { line: -1 });
    words.forEach(function (w) { insertSteps(S, w); });
    S.add(snap({}), '✅ สร้าง Trie เสร็จ (' + words.length + ' คำ)', { line: -1 });
    return S.steps;
  }
  function insertOneSteps(w) { setCode(INSERT_CODE); var S = new DSA.Stepper(); insertSteps(S, w); S.add(snap({}), '✅ insert "' + w + '" เสร็จ', { line: -1 }); return S.steps; }

  // ----- inputs -----
  var wordsEl = document.getElementById('tr-words');
  var wordEl = document.getElementById('tr-word');
  function clean(s) { return s.toLowerCase().replace(/[^a-z]/g, ''); }
  function parseWords(s) { return s.split(/[,\s]+/).map(clean).filter(function (w) { return w.length > 0; }).slice(0, 12); }
  function build(words) { wordsEl.value = words.join(', '); player.setSteps(buildSteps(words)); }

  document.getElementById('tr-build').addEventListener('click', function () { var w = parseWords(wordsEl.value); if (!w.length) { alert('ใส่คำอย่างน้อย 1 คำ (a-z)'); return; } build(w); });
  document.getElementById('tr-insert').addEventListener('click', function () { var w = clean(wordEl.value); if (!w) { alert('ใส่คำ (a-z)'); return; } player.setSteps(insertOneSteps(w)); });
  document.getElementById('tr-search').addEventListener('click', function () { var w = clean(wordEl.value); if (!w) { alert('ใส่คำ (a-z)'); return; } player.setSteps(searchSteps(w)); });

  build(['cat', 'car', 'card', 'dog', 'do']);
})();
