/* ============================================================
   SortViz.js — เครื่องมือร่วมสำหรับ "หัวข้อการเรียงลำดับ" ทุกตัว
   สร้างแผงอินพุต + ภาพแท่ง D3 + แผงโค้ด + ปุ่มควบคุม ให้อัตโนมัติ
   แต่ละหัวข้อเรียก DSA.SortViz.init({...}) โดยส่งแค่
   - topicId, code (pseudocode), generate(values) -> steps
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};

  var W = 600, H = 320;
  var PAD = { top: 28, bottom: 26, left: 12, right: 12 };

  /** ตัวช่วยสร้าง snapshot (สำเนา) ของสถานะ ณ ขั้นหนึ่ง */
  function snap(arr, m) {
    m = m || {};
    return {
      arr: arr.slice(),
      compare: (m.compare || []).slice(),
      swap:    (m.swap    || []).slice(),
      sorted:  (m.sorted  || []).slice(),
      pivot:   (m.pivot   || []).slice(),
      // id ประจำตัวของค่าในแต่ละตำแหน่ง (ทำให้แท่ง "เลื่อนสลับ" ตอน swap ได้)
      ids:     m.ids ? m.ids.slice() : null,
      // สำเนาเฟรมของ call stack (สำหรับอัลกอริทึม recursive)
      stack:   (m.stack   || []).map(function (f) {
        return { id: f.id, title: f.title, phase: f.phase, lo: f.lo, hi: f.hi };
      }),
    };
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function legendHtml(pivotLabel) {
    var rows = [
      ['var(--viz-default)', 'ปกติ'],
      ['var(--viz-compare)', 'กำลังเปรียบเทียบ'],
      ['var(--viz-swap)',    'กำลังสลับ / เขียนค่า'],
      ['var(--viz-sorted)',  'เรียบร้อยแล้ว'],
    ];
    if (pivotLabel) rows.push(['var(--viz-pivot)', pivotLabel]);
    return rows.map(function (r) {
      return '<span><i class="swatch" style="background:' + r[0] + '"></i> ' + r[1] + '</span>';
    }).join('');
  }

  function widgetHtml(opts) {
    var stackBlock = opts.showStack
      ? '<div class="stack-panel">' +
          '<div class="stack-panel__head">📚 Call Stack — ลำดับการเรียกซ้ำ</div>' +
          '<div id="sv-stack" class="stack-list"></div>' +
        '</div>'
      : '';
    return '' +
      '<div class="viz-input">' +
        '<input type="text" id="sv-input" placeholder="ใส่ตัวเลขคั่นด้วยจุลภาค เช่น 5, 2, 9, 1, 7">' +
        '<button class="vp__btn vp__btn--primary" id="sv-apply">ใช้ข้อมูลนี้</button>' +
        '<button class="vp__btn" id="sv-random">🎲 สุ่มใหม่</button>' +
      '</div>' +
      '<div class="viz-grid">' +
        '<div>' +
          '<div class="viz-stage">' +
            '<svg class="viz-svg" id="sv-bars" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet"></svg>' +
          '</div>' +
          '<div class="viz-legend">' + legendHtml(opts.pivotLabel) + '</div>' +
          '<div id="sv-controls"></div>' +
        '</div>' +
        '<div>' + stackBlock + '<div class="code-panel" id="sv-code"></div></div>' +
      '</div>';
  }

  DSA.SortViz = {
    snap: snap,

    init: function (opts) {
      DSA.UI.mountNavbar('navbar');
      DSA.UI.mountSidebar('sidebar', opts.topicId);

      var host = document.getElementById(opts.mountId || 'sortviz');
      host.innerHTML = widgetHtml(opts);

      var svg     = d3.select('#sv-bars');
      var inputEl = document.getElementById('sv-input');
      var codeEl  = document.getElementById('sv-code');

      codeEl.innerHTML = opts.code.map(function (line) {
        return '<span class="code__line">' + escapeHtml(line) + '</span>';
      }).join('');
      var codeLineEls = codeEl.querySelectorAll('.code__line');

      // ---------- การวาดด้วย D3 ----------
      function renderStep(step) {
        var st = step.snapshot;
        var n = st.arr.length;
        var max = d3.max(st.arr) || 1;
        var bandW = (W - PAD.left - PAD.right) / n;
        var barW = Math.min(56, bandW - 8);
        var y = d3.scaleLinear().domain([0, max]).range([0, H - PAD.top - PAD.bottom]);
        var xOf = function (i) { return PAD.left + i * bandW + (bandW - barW) / 2; };
        // ถ้าอัลกอริทึมส่ง ids มา → ผูกแท่งกับ "ตัวตนของค่า" (สลับ = เลื่อนตำแหน่ง)
        // ถ้าไม่ส่ง (เช่น merge ที่ใช้การเขียนทับ) → ผูกกับตำแหน่ง (morph อยู่กับที่)
        var hasIds = !!st.ids;
        var data = st.arr.map(function (v, i) {
          return { v: v, i: i, id: hasIds ? st.ids[i] : i };
        });
        var keyFn = function (d) { return d.id; };

        function cls(i) {
          var c = 'bar';
          if (st.sorted.indexOf(i)  !== -1) c += ' is-sorted';
          if (st.pivot.indexOf(i)   !== -1) c += ' is-pivot';
          if (st.compare.indexOf(i) !== -1) c += ' is-compare';
          if (st.swap.indexOf(i)    !== -1) c += ' is-swap';
          return c;
        }
        var dur = 320;

        // --- แท่ง: x เลื่อนตามตำแหน่งปัจจุบัน (ทำให้สลับแท่งเห็นการเคลื่อนที่) ---
        var rects = svg.selectAll('rect.bar').data(data, keyFn);
        rects.exit().remove();
        rects.enter().append('rect')
            .attr('x', function (d) { return xOf(d.i); })
            .attr('width', barW)
            .attr('y', H - PAD.bottom)
            .attr('height', 0)
          .merge(rects)
            .attr('class', function (d) { return cls(d.i); })
            .attr('width', barW)
            .transition().duration(dur)
            .attr('x', function (d) { return xOf(d.i); })
            .attr('y', function (d) { return H - PAD.bottom - y(d.v); })
            .attr('height', function (d) { return y(d.v); });

        // --- ตัวเลขบนแท่ง: เดินทางไปพร้อมแท่ง (ผูกด้วย id เดียวกัน) ---
        var vals = svg.selectAll('text.bar-val').data(data, keyFn);
        vals.exit().remove();
        vals.enter().append('text').attr('class', 'bar-val')
            .attr('x', function (d) { return xOf(d.i) + barW / 2; })
            .attr('y', H - PAD.bottom)
          .merge(vals)
            .text(function (d) { return d.v; })
            .transition().duration(dur)
            .attr('x', function (d) { return xOf(d.i) + barW / 2; })
            .attr('y', function (d) { return H - PAD.bottom - y(d.v) - 6; });

        // --- ป้ายดัชนีใต้แท่ง: ผูกกับ "ตำแหน่ง" จึงอยู่นิ่งเป็นไม้บรรทัด 0..n-1 ---
        var idxData = st.arr.map(function (_, i) { return i; });
        var idx = svg.selectAll('text.bar-idx').data(idxData, function (i) { return 'idx-' + i; });
        idx.exit().remove();
        idx.enter().append('text').attr('class', 'bar-idx')
          .merge(idx)
            .attr('x', function (i) { return xOf(i) + barW / 2; })
            .attr('y', H - PAD.bottom + 16)
            .text(function (i) { return i; });

        for (var k = 0; k < codeLineEls.length; k++) {
          codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
        }

        renderStack(st.stack || []);
      }

      // ---------- วาด Call Stack ด้วย D3 (push = เข้า, pop = ออก) ----------
      // ลบเฟรมทันที (ไม่หน่วงเวลา) เพื่อให้ DOM ตรงกับสแตกจริงเสมอแม้กดเดินเร็วๆ
      // ส่วน fade-in ของเฟรมใหม่ใช้ CSS animation (.frame) จัดการให้
      var stackHost = document.getElementById('sv-stack');
      function renderStack(frames) {
        if (!stackHost) return;
        var sel = d3.select('#sv-stack').selectAll('div.frame')
          .data(frames, function (d) { return d.id; });

        sel.exit().remove();

        var ent = sel.enter().append('div').attr('class', 'frame');
        ent.append('span').attr('class', 'frame__title');
        ent.append('span').attr('class', 'frame__phase');

        var all = ent.merge(sel);
        all.attr('class', function (d, i) {
              return 'frame' + (i === frames.length - 1 ? ' is-top' : '');
            })
            .style('margin-left', function (d, i) { return (i * 16) + 'px'; });
        all.select('.frame__title').text(function (d) { return d.title; });
        all.select('.frame__phase').text(function (d) { return d.phase || ''; });

        if (frames.length === 0) {
          stackHost.setAttribute('data-empty', 'stack ว่าง (ยังไม่มีการเรียก / เรียกเสร็จหมดแล้ว)');
        } else {
          stackHost.removeAttribute('data-empty');
        }
      }

      // ---------- VizPlayer ----------
      var player = new DSA.VizPlayer({
        steps: [],
        render: renderStep,
        controlsEl: document.getElementById('sv-controls'),
        speed: 600,
      });

      // ---------- อินพุต ----------
      function loadArray(values) {
        inputEl.value = values.join(', ');
        player.setSteps(opts.generate(values));
      }
      function randomArray() {
        var size = opts.size || 8;
        var arr = [];
        for (var i = 0; i < size; i++) arr.push(2 + Math.floor(Math.random() * 98));
        return arr;
      }
      function parseInput() {
        return inputEl.value.split(/[,\s]+/).map(Number)
          .filter(function (x) { return !isNaN(x); })
          .slice(0, 14);
      }

      document.getElementById('sv-random').addEventListener('click', function () {
        loadArray(randomArray());
      });
      document.getElementById('sv-apply').addEventListener('click', function () {
        var vals = parseInput();
        if (vals.length < 2) { alert('กรุณาใส่ตัวเลขอย่างน้อย 2 ตัว'); return; }
        loadArray(vals);
      });

      loadArray(opts.initial || randomArray());
    },
  };
})();
