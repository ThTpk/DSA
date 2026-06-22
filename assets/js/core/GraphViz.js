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

  DSA.GraphViz = {
    snap: snap,

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
