/* Big-O — กราฟเทียบอัตราการเติบโต (interactive, ไม่ใช้ VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'big-o');

  var FUNCS = [
    { name: 'O(1)', color: '#10b981', f: function () { return 1; } },
    { name: 'O(log n)', color: '#0ea5e9', f: function (n) { return Math.log2(n); } },
    { name: 'O(n)', color: '#6366f1', f: function (n) { return n; } },
    { name: 'O(n log n)', color: '#8b5cf6', f: function (n) { return n * Math.log2(n); } },
    { name: 'O(n²)', color: '#f59e0b', f: function (n) { return n * n; } },
    { name: 'O(2ⁿ)', color: '#ef4444', f: function (n) { return Math.pow(2, n); } },
  ];

  var svg = d3.select('#bigo-svg');
  var W = 640, H = 400, PAD = { l: 56, r: 16, t: 16, b: 36 };
  var gAxis = svg.append('g'), gLines = svg.append('g'), gMark = svg.append('g');
  var tableEl = document.getElementById('bigo-table');

  function fmt(v) {
    if (v < 1000) return (Math.round(v * 10) / 10).toString();
    if (v < 1e6) return Math.round(v / 100) / 10 + 'K';
    if (v < 1e9) return Math.round(v / 1e5) / 10 + 'M';
    if (v < 1e12) return Math.round(v / 1e8) / 10 + 'B';
    return v.toExponential(1);
  }

  function draw(n) {
    var maxY = Math.max(Math.pow(2, n), n * n, 10);
    var x = d3.scaleLinear().domain([1, n]).range([PAD.l, W - PAD.r]);
    var y = d3.scaleLog().domain([1, maxY]).range([H - PAD.b, PAD.t]).clamp(true);

    gAxis.selectAll('*').remove();
    gAxis.append('g').attr('class', 'bigo-axis').attr('transform', 'translate(0,' + (H - PAD.b) + ')').call(d3.axisBottom(x).ticks(8).tickFormat(d3.format('d')));
    gAxis.append('g').attr('class', 'bigo-axis').attr('transform', 'translate(' + PAD.l + ',0)').call(d3.axisLeft(y).ticks(6, '~s'));
    gAxis.append('text').attr('x', (W) / 2).attr('y', H - 4).attr('text-anchor', 'middle').style('fill', 'var(--c-muted)').style('font-size', '12px').text('n (ขนาดข้อมูล)');

    var line = d3.line().x(function (d) { return x(d[0]); }).y(function (d) { return y(Math.max(d[1], 1)); });
    var data = FUNCS.map(function (fn) {
      var pts = []; for (var i = 1; i <= n; i++) pts.push([i, fn.f(i)]); return { fn: fn, pts: pts };
    });
    var sel = gLines.selectAll('path.bigo-line').data(data, function (d) { return d.fn.name; });
    sel.enter().append('path').attr('class', 'bigo-line').merge(sel)
      .attr('stroke', function (d) { return d.fn.color; })
      .attr('d', function (d) { return line(d.pts); });

    // table ที่ n ปัจจุบัน
    var rows = FUNCS.map(function (fn) {
      return '<tr><td><span class="bigo-swatch" style="background:' + fn.color + '"></span>' + fn.name + '</td><td>' + fmt(fn.f(n)) + '</td></tr>';
    }).join('');
    tableEl.innerHTML = '<div class="adj-title">จำนวนการทำงานที่ n = ' + n + '</div>' +
      '<table class="bigo-table"><tr><th>ความซับซ้อน</th><th>≈ จำนวนครั้ง</th></tr>' + rows + '</table>' +
      '<p style="color:var(--c-muted);font-size:.85rem;margin-top:10px">สังเกต: O(2ⁿ) โตเร็วจน "ระเบิด" — n=' + n + ' ก็คำนวณแทบไม่ไหวแล้ว ส่วน O(log n) แทบไม่ขยับ</p>';
  }

  var slider = document.getElementById('bigo-n'), nval = document.getElementById('bigo-nval');
  slider.addEventListener('input', function () { nval.textContent = slider.value; draw(+slider.value); });
  draw(+slider.value);
})();
