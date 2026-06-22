/* ============================================================
   NodeViz.js — เครื่องมือร่วมสำหรับ "โครงสร้างเชิงเส้น"
   (Array, Stack, Queue, Linked List, Hash Table)
   เป็นตัวเรนเดอร์ทั่วไป: แต่ละ step ส่งโมเดลภาพมาเป็น
   { cells:[{id,x,y,w,h,text,sub,cls}], arrows:[{id,x1,y1,x2,y2,cls}], labels:[{id,x,y,text,cls,anchor}] }
   cell/arrow/label ผูกด้วย id → ย้ายตำแหน่งมี transition
   ใช้ร่วมกับ VizPlayer/Stepper
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};

  function clone(o) { var c = {}; for (var k in o) c[k] = o[k]; return c; }

  function snap(m) {
    m = m || {};
    return {
      cells:  (m.cells  || []).map(clone),
      arrows: (m.arrows || []).map(clone),
      labels: (m.labels || []).map(clone),
    };
  }

  function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  DSA.NodeViz = {
    snap: snap,

    init: function (opts) {
      DSA.UI.mountNavbar('navbar');
      DSA.UI.mountSidebar('sidebar', opts.topicId);

      var VW = opts.vw || 760, VH = opts.vh || 320;
      var host = document.getElementById(opts.mountId || 'nodeviz');
      host.innerHTML =
        '<div class="viz-grid">' +
          '<div>' +
            '<div class="viz-stage"><svg class="viz-svg" id="nv-svg" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet"></svg></div>' +
            (opts.legend ? '<div class="viz-legend">' + opts.legend + '</div>' : '') +
            '<div id="nv-controls"></div>' +
          '</div>' +
          '<div><div class="code-panel" id="nv-code"></div></div>' +
        '</div>';

      var svg = d3.select('#nv-svg');
      svg.append('defs').html(
        '<marker id="nv-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">' +
        '<path d="M0,0 L7,3 L0,6 Z" fill="#475569"></path></marker>');
      var gArrows = svg.append('g').attr('class', 'nv-arrows');
      var gCells  = svg.append('g').attr('class', 'nv-cells');
      var gLabels = svg.append('g').attr('class', 'nv-labels');

      var codeEl = document.getElementById('nv-code');
      var codeLineEls = [];
      function setCode(lines) {
        codeEl.innerHTML = (lines || []).map(function (l) {
          return '<span class="code__line">' + escapeHtml(l) + '</span>';
        }).join('');
        codeLineEls = codeEl.querySelectorAll('.code__line');
      }
      if (opts.code) setCode(opts.code);

      function renderStep(step) {
        var st = step.snapshot;
        var dur = 300;

        // ---- arrows ----
        var ar = gArrows.selectAll('line.nv-arrow-line').data(st.arrows, function (d) { return d.id; });
        ar.exit().remove();
        ar.enter().append('line').attr('class', 'nv-arrow-line')
            .attr('marker-end', 'url(#nv-arrow)')
            .attr('x1', function (d) { return d.x1; }).attr('y1', function (d) { return d.y1; })
            .attr('x2', function (d) { return d.x1; }).attr('y2', function (d) { return d.y1; })
          .merge(ar)
            .attr('class', function (d) { return 'nv-arrow-line ' + (d.cls || ''); })
            .transition().duration(dur)
            .attr('x1', function (d) { return d.x1; }).attr('y1', function (d) { return d.y1; })
            .attr('x2', function (d) { return d.x2; }).attr('y2', function (d) { return d.y2; });

        // ---- cells ----
        // ลบทันที + ไม่ใช้ animation opacity (กัน element ค้างตอนกดเดินรัวๆ) — เลื่อนด้วย transform เท่านั้น
        var ce = gCells.selectAll('g.cell').data(st.cells, function (d) { return d.id; });
        ce.exit().remove();
        var cEnter = ce.enter().append('g').attr('class', 'cell')
            .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
        cEnter.append('rect');
        cEnter.append('text').attr('class', 'cell__val');
        cEnter.append('text').attr('class', 'cell__sub');
        var cAll = cEnter.merge(ce);
        cAll.attr('class', function (d) { return 'cell ' + (d.cls || ''); });
        cAll.select('rect')
            .attr('width', function (d) { return d.w; }).attr('height', function (d) { return d.h; })
            .attr('rx', 8);
        cAll.select('.cell__val')
            .attr('x', function (d) { return d.w / 2; }).attr('y', function (d) { return d.h / 2; })
            .attr('dy', '.34em').text(function (d) { return d.text; });
        cAll.select('.cell__sub')
            .attr('x', function (d) { return d.w / 2; }).attr('y', function (d) { return d.h + 14; })
            .text(function (d) { return d.sub == null ? '' : d.sub; });
        cAll.transition().duration(dur)
            .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });

        // ---- labels ----
        var lb = gLabels.selectAll('text.nv-label').data(st.labels, function (d) { return d.id; });
        lb.exit().remove();
        lb.enter().append('text').attr('class', 'nv-label')
          .merge(lb)
            .attr('class', function (d) { return 'nv-label ' + (d.cls || ''); })
            .attr('text-anchor', function (d) { return d.anchor || 'middle'; })
            .text(function (d) { return d.text; })
            .transition().duration(dur)
            .attr('x', function (d) { return d.x; }).attr('y', function (d) { return d.y; });

        for (var k = 0; k < codeLineEls.length; k++)
          codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
      }

      var player = new DSA.VizPlayer({
        steps: [], render: renderStep,
        controlsEl: document.getElementById('nv-controls'),
        speed: opts.speed || 650,
      });

      return { setSteps: function (s) { player.setSteps(s); }, setCode: setCode, player: player, VW: VW, VH: VH };
    },
  };
})();
