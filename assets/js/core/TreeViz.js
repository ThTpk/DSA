/* ============================================================
   TreeViz.js — เครื่องมือร่วมสำหรับ "โครงสร้างต้นไม้" (วาดด้วย D3)
   - จัดตำแหน่งโหนดแบบ in-order (ซ้ายทั้งหมดอยู่ซ้ายจริง — เหมาะกับ BST)
   - โหนดผูกด้วย id → แทรก/ย้ายตำแหน่งมี transition
   - รองรับ call stack (showStack) สำหรับการเรียกซ้ำ
   ใช้ร่วมกับ VizPlayer/Stepper เดิม
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};

  var VW = 700, VH = 380, PADX = 44, PADY = 46, R = 20;

  function serialize(root) {
    var nodes = [];
    (function walk(node, depth) {
      if (!node) return;
      nodes.push({
        id: node.id, value: node.value,
        left: node.left ? node.left.id : null,
        right: node.right ? node.right.id : null,
        depth: depth,
        cls: node.cls || '',   // คลาสประจำโหนด (เช่น สีของ Red-Black Tree)
      });
      walk(node.left, depth + 1);
      walk(node.right, depth + 1);
    })(root, 0);
    return nodes;
  }

  function snap(root, m) {
    m = m || {};
    return {
      nodes:   serialize(root),
      current: (m.current || []).slice(),
      visited: (m.visited || []).slice(),
      found:   (m.found   || []).slice(),
      compare: (m.compare || []).slice(),
      stack:   (m.stack   || []).map(function (f) {
        return { id: f.id, title: f.title, phase: f.phase };
      }),
    };
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var LEGEND = [
    ['var(--tree-node)',   'โหนดปกติ'],
    ['var(--viz-compare)', 'กำลังเทียบ'],
    ['var(--search-active)', 'เส้นทางที่ผ่าน'],
    ['var(--viz-sorted)',  'เป้าหมาย / วางเสร็จ'],
  ];

  function widgetHtml(opts) {
    var stackBlock = opts.showStack
      ? '<div class="stack-panel"><div class="stack-panel__head">📚 Call Stack — ลำดับการเรียกซ้ำ</div>' +
        '<div id="tv-stack" class="stack-list"></div></div>'
      : '';
    var legend = LEGEND.map(function (r) {
      return '<span><i class="swatch" style="background:' + r[0] + '"></i> ' + r[1] + '</span>';
    }).join('');
    return '' +
      '<div class="viz-grid">' +
        '<div>' +
          '<div class="viz-stage">' +
            '<svg class="viz-svg" id="tv-svg" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet"></svg>' +
          '</div>' +
          '<div class="viz-legend">' + legend + '</div>' +
          '<div id="tv-controls"></div>' +
        '</div>' +
        '<div>' + stackBlock + '<div class="code-panel" id="tv-code"></div></div>' +
      '</div>';
  }

  DSA.TreeViz = {
    snap: snap,

    init: function (opts) {
      DSA.UI.mountNavbar('navbar');
      DSA.UI.mountSidebar('sidebar', opts.topicId);

      var host = document.getElementById(opts.mountId || 'treeviz');
      host.innerHTML = widgetHtml(opts);

      var svg = d3.select('#tv-svg');
      var gEdges = svg.append('g').attr('class', 'edges');
      var gNodes = svg.append('g').attr('class', 'nodes');
      var codeEl = document.getElementById('tv-code');
      var stackHost = document.getElementById('tv-stack');
      var codeLineEls = [];

      function setCode(lines) {
        codeEl.innerHTML = lines.map(function (l) {
          return '<span class="code__line">' + escapeHtml(l) + '</span>';
        }).join('');
        codeLineEls = codeEl.querySelectorAll('.code__line');
      }
      if (opts.code) setCode(opts.code);

      function renderStep(step) {
        var st = step.snapshot;
        var nodes = st.nodes;

        // ----- คำนวณตำแหน่งแบบ in-order -----
        var map = {}; nodes.forEach(function (n) { map[n.id] = n; });
        var isChild = {};
        nodes.forEach(function (n) {
          if (n.left  != null) isChild[n.left]  = 1;
          if (n.right != null) isChild[n.right] = 1;
        });
        var root = null;
        for (var r = 0; r < nodes.length; r++) { if (!isChild[nodes[r].id]) { root = nodes[r]; break; } }

        var order = 0, xi = {};
        (function inorder(id) {
          if (id == null) return;
          inorder(map[id].left);
          xi[id] = order++;
          inorder(map[id].right);
        })(root ? root.id : null);

        var cols = order;
        var maxDepth = nodes.length ? d3.max(nodes, function (d) { return d.depth; }) : 0;
        var innerW = VW - 2 * PADX, innerH = VH - 2 * PADY;
        function X(id) { return cols <= 1 ? VW / 2 : PADX + (xi[id] / (cols - 1)) * innerW; }
        function Y(id) { return PADY + (maxDepth === 0 ? 0 : (map[id].depth / maxDepth) * innerH); }

        var edges = [];
        nodes.forEach(function (n) {
          if (n.left != null)  edges.push({ id: 'e' + n.left,  x1: X(n.id), y1: Y(n.id), x2: X(n.left),  y2: Y(n.left) });
          if (n.right != null) edges.push({ id: 'e' + n.right, x1: X(n.id), y1: Y(n.id), x2: X(n.right), y2: Y(n.right) });
        });

        var dur = 320;

        // ----- เส้นเชื่อม -----
        var ln = gEdges.selectAll('line.edge').data(edges, function (d) { return d.id; });
        ln.exit().remove();
        ln.enter().append('line').attr('class', 'edge')
            .attr('x1', function (d) { return d.x1; }).attr('y1', function (d) { return d.y1; })
            .attr('x2', function (d) { return d.x1; }).attr('y2', function (d) { return d.y1; })
            .style('opacity', 0)
          .merge(ln)
            .transition().duration(dur)
            .style('opacity', 1)
            .attr('x1', function (d) { return d.x1; }).attr('y1', function (d) { return d.y1; })
            .attr('x2', function (d) { return d.x2; }).attr('y2', function (d) { return d.y2; });

        // ----- โหนด -----
        function ncls(d) {
          var id = d.id, c = 'tnode';
          if (d.cls) c += ' ' + d.cls;          // สีประจำโหนด (Red-Black ฯลฯ)
          if (st.found.indexOf(id)   !== -1) c += ' is-found';
          else if (st.compare.indexOf(id) !== -1) c += ' is-compare';
          else if (st.current.indexOf(id) !== -1) c += ' is-compare';
          else if (st.visited.indexOf(id) !== -1) c += ' is-visited';
          return c;
        }

        var nd = gNodes.selectAll('g.tnode').data(nodes, function (d) { return d.id; });
        nd.exit().remove();
        var ent = nd.enter().append('g')
            .attr('class', 'tnode')
            .attr('transform', function (d) { return 'translate(' + X(d.id) + ',' + Y(d.id) + ')'; })
            .style('opacity', 0);
        ent.append('circle').attr('r', R);
        ent.append('text').attr('class', 'tnode__val').attr('dy', '.34em');

        var all = ent.merge(nd);
        all.attr('class', function (d) { return ncls(d); });
        all.select('.tnode__val').text(function (d) { return d.value; });
        all.transition().duration(dur)
            .style('opacity', 1)
            .attr('transform', function (d) { return 'translate(' + X(d.id) + ',' + Y(d.id) + ')'; });

        // ----- code highlight -----
        for (var k = 0; k < codeLineEls.length; k++) {
          codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
        }

        renderStack(st.stack || []);
      }

      function renderStack(frames) {
        if (!stackHost) return;
        var sel = d3.select('#tv-stack').selectAll('div.frame').data(frames, function (d) { return d.id; });
        sel.exit().remove();
        var ent = sel.enter().append('div').attr('class', 'frame');
        ent.append('span').attr('class', 'frame__title');
        ent.append('span').attr('class', 'frame__phase');
        var all = ent.merge(sel);
        all.attr('class', function (d, i) { return 'frame' + (i === frames.length - 1 ? ' is-top' : ''); })
           .style('margin-left', function (d, i) { return (i * 16) + 'px'; });
        all.select('.frame__title').text(function (d) { return d.title; });
        all.select('.frame__phase').text(function (d) { return d.phase || ''; });
        if (frames.length === 0) stackHost.setAttribute('data-empty', 'stack ว่าง');
        else stackHost.removeAttribute('data-empty');
      }

      var player = new DSA.VizPlayer({
        steps: [],
        render: renderStep,
        controlsEl: document.getElementById('tv-controls'),
        speed: 700,
      });

      return {
        setSteps: function (steps) { player.setSteps(steps); },
        setCode: setCode,
        player: player,
      };
    },
  };
})();
