/* ============================================================
   SearchViz.js — เครื่องมือร่วมสำหรับ "หัวข้อการค้นหา"
   วาดอาเรย์ + ตัวชี้ (lo/mid/hi/i) + ช่วงที่กำลังค้นหา/ตัดทิ้ง
   แต่ละหัวข้อเรียก DSA.SearchViz.init({...}) ส่ง code + generate(values, target)
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};

  var W = 600, H = 360;
  var PAD = { top: 28, bottom: 64, left: 12, right: 12 };

  function snap(arr, m) {
    m = m || {};
    return {
      arr: arr.slice(),
      active:   (m.active   || []).slice(),  // อยู่ในช่วงที่ยังค้นหา
      checking: (m.checking || []).slice(),  // กำลังเทียบ
      excluded: (m.excluded || []).slice(),  // ถูกตัดทิ้งแล้ว
      found:    (m.found    || []).slice(),  // เจอเป้าหมาย
      pointers: (m.pointers || []).map(function (p) {
        return { label: p.label, index: p.index, color: p.color };
      }),
    };
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function legendHtml(sorted) {
    var rows = [
      ['var(--viz-default)', 'ยังไม่ตรวจ'],
      ['var(--search-active)', 'อยู่ในช่วงค้นหา'],
      ['var(--viz-compare)', 'กำลังเทียบ'],
      ['var(--search-excluded)', 'ตัดทิ้งแล้ว'],
      ['var(--viz-sorted)', 'เจอเป้าหมาย'],
    ];
    return rows.map(function (r) {
      return '<span><i class="swatch" style="background:' + r[0] + '"></i> ' + r[1] + '</span>';
    }).join('');
  }

  function widgetHtml(opts) {
    return '' +
      '<div class="viz-input">' +
        '<input type="text" id="sv-input" placeholder="ตัวเลขคั่นด้วยจุลภาค">' +
        '<input type="text" id="sv-target" class="sv-target-input" placeholder="ค่าที่ค้นหา">' +
        '<button class="vp__btn vp__btn--primary" id="sv-apply">ค้นหา</button>' +
        '<button class="vp__btn" id="sv-random">🎲 สุ่มใหม่</button>' +
      '</div>' +
      '<div class="search-target" id="sv-target-display"></div>' +
      '<div class="viz-grid">' +
        '<div>' +
          '<div class="viz-stage">' +
            '<svg class="viz-svg" id="sv-bars" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet"></svg>' +
          '</div>' +
          '<div class="viz-legend">' + legendHtml(opts.sorted) + '</div>' +
          '<div id="sv-controls"></div>' +
        '</div>' +
        '<div><div class="code-panel" id="sv-code"></div></div>' +
      '</div>';
  }

  DSA.SearchViz = {
    snap: snap,

    init: function (opts) {
      DSA.UI.mountNavbar('navbar');
      DSA.UI.mountSidebar('sidebar', opts.topicId);

      var host = document.getElementById(opts.mountId || 'searchviz');
      host.innerHTML = widgetHtml(opts);

      var svg      = d3.select('#sv-bars');
      var inputEl  = document.getElementById('sv-input');
      var targetEl = document.getElementById('sv-target');
      var dispEl   = document.getElementById('sv-target-display');
      var codeEl   = document.getElementById('sv-code');

      codeEl.innerHTML = opts.code.map(function (line) {
        return '<span class="code__line">' + escapeHtml(line) + '</span>';
      }).join('');
      var codeLineEls = codeEl.querySelectorAll('.code__line');

      function renderStep(step) {
        var st = step.snapshot;
        var n = st.arr.length;
        var max = d3.max(st.arr) || 1;
        var bandW = (W - PAD.left - PAD.right) / n;
        var barW = Math.min(56, bandW - 8);
        var y = d3.scaleLinear().domain([0, max]).range([0, H - PAD.top - PAD.bottom]);
        var xOf = function (i) { return PAD.left + i * bandW + (bandW - barW) / 2; };
        var data = st.arr.map(function (v, i) { return { v: v, i: i }; });

        function cls(i) {
          var c = 'bar';
          if (st.found.indexOf(i)    !== -1) return c + ' is-found';
          if (st.checking.indexOf(i) !== -1) return c + ' is-checking';
          if (st.excluded.indexOf(i) !== -1) return c + ' is-excluded';
          if (st.active.indexOf(i)   !== -1) return c + ' is-active';
          return c;
        }
        var dur = 260;

        var rects = svg.selectAll('rect.bar').data(data, function (d) { return d.i; });
        rects.exit().remove();
        rects.enter().append('rect')
            .attr('x', function (d) { return xOf(d.i); })
            .attr('width', barW)
            .attr('y', H - PAD.bottom)
            .attr('height', 0)
          .merge(rects)
            .attr('class', function (d) { return cls(d.i); })
            .attr('width', barW)
            .attr('x', function (d) { return xOf(d.i); })
            .transition().duration(dur)
            .attr('y', function (d) { return H - PAD.bottom - y(d.v); })
            .attr('height', function (d) { return y(d.v); });

        var vals = svg.selectAll('text.bar-val').data(data, function (d) { return d.i; });
        vals.exit().remove();
        vals.enter().append('text').attr('class', 'bar-val')
          .merge(vals)
            .attr('x', function (d) { return xOf(d.i) + barW / 2; })
            .text(function (d) { return d.v; })
            .transition().duration(dur)
            .attr('y', function (d) { return H - PAD.bottom - y(d.v) - 6; });

        var idx = svg.selectAll('text.bar-idx').data(data, function (d) { return d.i; });
        idx.exit().remove();
        idx.enter().append('text').attr('class', 'bar-idx')
          .merge(idx)
            .attr('x', function (d) { return xOf(d.i) + barW / 2; })
            .attr('y', H - PAD.bottom + 16)
            .text(function (d) { return d.i; });

        // ---- ตัวชี้ lo / mid / hi / i ----
        var band = H - PAD.bottom + 34;
        var pts = st.pointers || [];
        var byIndex = {};
        pts.forEach(function (p) { p._k = (byIndex[p.index] || 0); byIndex[p.index] = p._k + 1; });

        var psel = svg.selectAll('g.ptr').data(pts, function (d) { return d.label; });
        psel.exit().remove();
        var pen = psel.enter().append('g').attr('class', 'ptr');
        pen.append('text').attr('class', 'ptr__arrow').text('▲');
        pen.append('text').attr('class', 'ptr__label');
        var pall = pen.merge(psel);
        // ลูกศร: แสดงเฉพาะตัวแรกของแต่ละดัชนี (กันซ้อน) เลื่อนตาม x
        pall.select('.ptr__arrow')
            .style('fill', function (d) { return d.color; })
            .style('opacity', function (d) { return d._k === 0 ? 1 : 0; })
            .transition().duration(dur)
            .attr('x', function (d) { return xOf(d.index) + barW / 2; })
            .attr('y', band);
        // ป้ายชื่อ: ซ้อนลงล่างเมื่อชี้ดัชนีเดียวกัน (lo/mid/hi ทับกัน)
        pall.select('.ptr__label')
            .style('fill', function (d) { return d.color; })
            .text(function (d) { return d.label; })
            .transition().duration(dur)
            .attr('x', function (d) { return xOf(d.index) + barW / 2; })
            .attr('y', function (d) { return band + 13 + d._k * 13; });

        for (var k = 0; k < codeLineEls.length; k++) {
          codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
        }
      }

      var player = new DSA.VizPlayer({
        steps: [],
        render: renderStep,
        controlsEl: document.getElementById('sv-controls'),
        speed: 700,
      });

      function loadData(values, target) {
        var vals = values.slice();
        if (opts.sorted) vals.sort(function (a, b) { return a - b; });
        inputEl.value = vals.join(', ');
        targetEl.value = target;
        dispEl.innerHTML = '🎯 ' + (opts.targetLabel || 'ค้นหาค่า') + ' <b>' + target + '</b>' +
          (opts.sorted ? ' <span class="note">(อาเรย์ถูกเรียงจากน้อยไปมากแล้ว)</span>' : '');
        player.setSteps(opts.generate(vals, target));
      }

      function randomVals() {
        var size = opts.size || 10;
        var arr = [];
        for (var i = 0; i < size; i++) arr.push(2 + Math.floor(Math.random() * 98));
        return arr;
      }
      var pickTarget = opts.pickTarget || function (vals) {
        // ~65% เลือกค่าที่มีอยู่ (เจอ), ที่เหลือสุ่ม (อาจไม่เจอ)
        if (Math.random() < 0.65) return vals[Math.floor(Math.random() * vals.length)];
        return 2 + Math.floor(Math.random() * 98);
      };
      function parseArr() {
        return inputEl.value.split(/[,\s]+/).map(Number)
          .filter(function (x) { return !isNaN(x); }).slice(0, 16);
      }

      document.getElementById('sv-random').addEventListener('click', function () {
        var v = randomVals(); loadData(v, pickTarget(v));
      });
      document.getElementById('sv-apply').addEventListener('click', function () {
        var arr = parseArr();
        var t = Number(targetEl.value);
        if (arr.length < 2) { alert('กรุณาใส่ตัวเลขอย่างน้อย 2 ตัว'); return; }
        if (isNaN(t)) { alert('กรุณาใส่ค่าที่ต้องการค้นหา'); return; }
        loadData(arr, t);
      });

      var init = randomVals();
      loadData(init, pickTarget(init));
    },
  };
})();
