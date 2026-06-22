/* Heap Sort — build max-heap แล้วดึง max ไปท้าย (SortViz, แท่งเลื่อนตอนสลับ) */
DSA.SortViz.init({
  topicId: 'heap-sort',
  pivotLabel: 'ลูกที่ใหญ่สุด / จุดซ่อม heap',
  code: [
    'buildMaxHeap: siftDown(parent) จากล่างขึ้นบน',  // 0
    'for end = n-1 downto 1:',                       // 1
    '  swap(A[0], A[end])   // ค่ามากสุดไปท้าย',       // 2
    '  siftDown(0, end)     // ซ่อม max-heap',        // 3
  ],
  generate: function (values) {
    var S = new DSA.Stepper();
    var snap = DSA.SortViz.snap;
    var a = values.slice(), n = a.length, sorted = [];
    var ids = a.map(function (_, i) { return i; });

    function step(desc, line, extra) { extra = extra || {}; extra.ids = ids; if (!extra.sorted) extra.sorted = sorted.slice(); S.add(snap(a, extra), desc, { line: line }); }
    function swap(i, j) { var t = a[i]; a[i] = a[j]; a[j] = t; var u = ids[i]; ids[i] = ids[j]; ids[j] = u; }

    function siftDown(i, size, line) {
      while (true) {
        var l = 2 * i + 1, r = 2 * i + 2, lg = i;
        if (l < size && a[l] > a[lg]) lg = l;
        if (r < size && a[r] > a[lg]) lg = r;
        if (lg === i) { step('A[' + i + ']=' + a[i] + ' ใหญ่กว่าลูกแล้ว → หยุด', line, { pivot: [i] }); return; }
        var kids = []; if (l < size) kids.push(l); if (r < size) kids.push(r);
        step('A[' + i + ']=' + a[i] + ' เทียบลูก ' + kids.map(function (k) { return 'A[' + k + ']=' + a[k]; }).join(', ') + ' → ลูกใหญ่สุด A[' + lg + ']', line, { compare: [i], pivot: [lg] });
        swap(i, lg);
        step('สลับ A[' + i + '] ↔ A[' + lg + '] (sift-down)', line, { swap: [i, lg] });
        i = lg;
      }
    }

    step('เริ่ม: สร้าง Max-Heap จากอาเรย์ ' + n + ' ตัว', -1);
    for (var i = Math.floor(n / 2) - 1; i >= 0; i--) {
      step('heapify ที่ index ' + i, 0, { pivot: [i] });
      siftDown(i, n, 0);
    }
    step('✓ ได้ Max-Heap แล้ว (ค่ามากสุดอยู่ราก) เริ่มดึงไปเรียงท้าย', 1);

    for (var end = n - 1; end >= 1; end--) {
      step('สลับราก (max=' + a[0] + ') ไปไว้ตำแหน่ง ' + end, 2, { swap: [0, end] });
      swap(0, end);
      sorted.unshift(end);
      step('A[' + end + '] เข้าที่แล้ว → ซ่อม heap ขนาด ' + end, 3);
      siftDown(0, end, 3);
    }
    sorted.unshift(0);
    step('✅ เรียงลำดับเสร็จสมบูรณ์', -1);
    return S.steps;
  },
});
