/* ============================================================
   GraphViz.js — เครื่องมือร่วมสำหรับ "กราฟ" (วาดด้วย D3)
   ตำแหน่ง node กำหนดเอง (x,y) ; edge อ้างถึง node ด้วย id
   รองรับมีทิศ/ไม่มีทิศ และน้ำหนัก
   แต่ละ step ส่ง { nodes:[{id,x,y,label,sub,cls}], edges:[{id,u,v,w,cls}] }
   ใช้ร่วมกับ VizPlayer/Stepper
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};
  function clone(o) { var c = {}; for (var k in o) c[k] = o[k]; return c; }

  function snap(m) {
    m = m || {};
    return { nodes: (m.nodes || []).map(clone), edges: (m.edges || []).map(clone) };
  }
  function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var R = 21;

  /* สุ่มสร้างกราฟ: วาง node เป็นวงกลม + รับประกันเชื่อมต่อ (undirected) หรือ DAG (directed)
     opts: { directed, weighted, allowNeg, density, vw, vh, minW, maxW } */
  function generate(n, opts) {
    opts = opts || {};
    n = Math.max(3, Math.min(10, (n | 0) || 6));
    var directed = !!opts.directed, weighted = !!opts.weighted, allowNeg = !!opts.allowNeg;
    var VW = opts.vw || 720, VH = opts.vh || 400;
    var minW = opts.minW || 1, maxW = opts.maxW || 9;
    var density = (opts.density == null) ? (directed ? 0.5 : 0.4) : opts.density;
    function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

    var nodes = [];
    var cx = VW / 2, cy = VH / 2, rx = VW * 0.40, ry = VH * 0.40;
    for (var i = 0; i < n; i++) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
      nodes.push({ id: String.fromCharCode(65 + i), x: Math.round(cx + rx * Math.cos(ang)), y: Math.round(cy + ry * Math.sin(ang)) });
    }
    function wt() { var w = rnd(minW, maxW); if (allowNeg && Math.random() < 0.3) w = -rnd(1, 4); return w; }

    var edges = [], seen = {};
    function key(a, b) { return directed ? (a + '>' + b) : (a < b ? a + '-' + b : b + '-' + a); }
    function addEdge(ai, bi) {
      var a = nodes[ai].id, b = nodes[bi].id, k = key(a, b);
      if (ai === bi || seen[k]) return false; seen[k] = 1;
      var e = { id: a + b, u: a, v: b }; if (weighted) e.w = wt();
      edges.push(e); return true;
    }

    if (directed) {
      // DAG: ทุกโหนด j มี parent i<j (รากที่ A เข้าถึงได้ทุกโหนด) + เส้น forward เพิ่ม
      for (var j = 1; j < n; j++) addEdge(rnd(0, j - 1), j);
      var extra = Math.round((n - 1) * density), t = 0;
      while (extra > 0 && t < n * n * 2) { t++; var a = rnd(0, n - 2), b = rnd(a + 1, n - 1); if (addEdge(a, b)) extra--; }
    } else {
      // เชื่อมต่อแน่นอน: spanning tree + เส้นเพิ่ม
      for (var j2 = 1; j2 < n; j2++) addEdge(rnd(0, j2 - 1), j2);
      var extra2 = Math.round(n * density), t2 = 0;
      while (extra2 > 0 && t2 < n * n * 2) { t2++; if (addEdge(rnd(0, n - 1), rnd(0, n - 1))) extra2--; }
    }
    return { nodes: nodes, edges: edges };
  }

  /* แทรกตัวควบคุม "จำนวนโหนด + สุ่มกราฟ" เข้าไปใน .viz-input ของหน้า
     คืน { getN } ; เรียก onChange ทุกครั้งที่ผู้ใช้เปลี่ยนจำนวนโหนดหรือกดสุ่ม */
  function mountConfig(opts) {
    opts = opts || {};
    var bar = document.querySelector('.viz-input');
    var minN = opts.minN || 4, maxN = opts.maxN || 10, defN = opts.defaultN || 6;
    var label = document.createElement('label');
    label.textContent = 'จำนวนโหนด:';
    label.style.cssText = 'align-self:center;color:var(--c-muted)';
    var input = document.createElement('input');
    input.type = 'number'; input.id = 'g-nodes'; input.min = minN; input.max = maxN; input.value = defN;
    input.className = 'sv-target-input'; input.style.cssText = 'flex:0 0 64px';
    var btn = document.createElement('button');
    btn.className = 'vp__btn'; btn.id = 'g-random'; btn.textContent = '🎲 สุ่มกราฟ';
    if (bar) { bar.appendChild(label); bar.appendChild(input); bar.appendChild(btn); }
    function getN() { var v = parseInt(input.value, 10); if (isNaN(v)) v = defN; return Math.max(minN, Math.min(maxN, v)); }
    if (opts.onChange) {
      btn.addEventListener('click', function () { opts.onChange(); });
      input.addEventListener('change', function () { input.value = getN(); opts.onChange(); });
    }
    return { getN: getN };
  }

  DSA.GraphViz = {
    snap: snap,
    generate: generate,
    mountConfig: mountConfig,

    init: function (opts) {
      DSA.UI.mountNavbar('navbar');
      DSA.UI.mountSidebar('sidebar', opts.topicId);
      var VW = opts.vw || 720, VH = opts.vh || 400;
      var directed = !!opts.directed;
      var weighted = !!opts.weighted;

      var host = document.getElementById(opts.mountId || 'graphviz');
      host.innerHTML =
        '<div class="viz-grid">' +
          '<div>' +
            '<div class="viz-stage"><svg class="viz-svg" id="gv-svg" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet"></svg></div>' +
            (opts.legend ? '<div class="viz-legend">' + opts.legend + '</div>' : '') +
            '<div id="gv-controls"></div>' +
          '</div>' +
          '<div><div class="code-panel" id="gv-code"></div></div>' +
        '</div>';

      var svg = d3.select('#gv-svg');
      svg.append('defs').html(
        '<marker id="gv-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">' +
        '<path d="M0,0 L8,3 L0,6 Z" fill="#475569"></path></marker>');
      var gEdges = svg.append('g'); var gW = svg.append('g'); var gNodes = svg.append('g');

      var codeEl = document.getElementById('gv-code');
      var codeLineEls = [];
      function setCode(lines) {
        codeEl.innerHTML = (lines || []).map(function (l) { return '<span class="code__line">' + escapeHtml(l) + '</span>'; }).join('');
        codeLineEls = codeEl.querySelectorAll('.code__line');
      }
      if (opts.code) setCode(opts.code);

      function renderStep(step) {
        var st = step.snapshot;
        var map = {}; st.nodes.forEach(function (n) { map[n.id] = n; });
        var dur = 280;

        function geom(e) {
          var a = map[e.u], b = map[e.v];
          var dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy) || 1;
          var ux = dx / L, uy = dy / L;
          return { x1: a.x + ux * R, y1: a.y + uy * R, x2: b.x - ux * R, y2: b.y - uy * R, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, nx: -uy, ny: ux };
        }

        // ---- edges ----
        var ed = gEdges.selectAll('line.gedge').data(st.edges, function (d) { return d.id; });
        ed.exit().remove();
        ed.enter().append('line').attr('class', 'gedge')
          .merge(ed)
            .attr('class', function (d) { return 'gedge ' + (d.cls || ''); })
            .attr('marker-end', directed ? 'url(#gv-arrow)' : null)
            .each(function (d) { var g = geom(d); d._g = g; })
            .transition().duration(dur)
            .attr('x1', function (d) { return d._g.x1; }).attr('y1', function (d) { return d._g.y1; })
            .attr('x2', function (d) { return d._g.x2; }).attr('y2', function (d) { return d._g.y2; });

        // ---- weight labels ----
        if (weighted) {
          var wl = gW.selectAll('text.gweight').data(st.edges, function (d) { return 'w' + d.id; });
          wl.exit().remove();
          wl.enter().append('text').attr('class', 'gweight')
            .merge(wl)
              .text(function (d) { return d.w; })
              .transition().duration(dur)
              .attr('x', function (d) { var g = geom(d); return g.mx + g.nx * 14; })
              .attr('y', function (d) { var g = geom(d); return g.my + g.ny * 14 + 4; });
        }

        // ---- nodes ----
        var nd = gNodes.selectAll('g.gnode').data(st.nodes, function (d) { return d.id; });
        nd.exit().remove();
        var ent = nd.enter().append('g').attr('class', 'gnode')
          .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
        ent.append('circle').attr('r', R);
        ent.append('text').attr('class', 'gnode__label').attr('dy', '.34em');
        ent.append('text').attr('class', 'gnode__sub').attr('y', R + 15);
        var all = ent.merge(nd);
        all.attr('class', function (d) { return 'gnode ' + (d.cls || ''); });
        all.select('.gnode__label').text(function (d) { return d.label; });
        all.select('.gnode__sub').text(function (d) { return d.sub == null ? '' : d.sub; });
        all.transition().duration(dur).attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });

        for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
      }

      var player = new DSA.VizPlayer({ steps: [], render: renderStep, controlsEl: document.getElementById('gv-controls'), speed: opts.speed || 700 });
      return { setSteps: function (s) { player.setSteps(s); }, setCode: setCode, player: player };
    },
  };
})();
