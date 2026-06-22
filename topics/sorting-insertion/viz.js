/* Insertion Sort — เลื่อนตัวที่แทรกด้วยการสลับคู่ติดกัน + ติดตาม ids ให้แท่งเลื่อน */
DSA.SortViz.init({
  topicId: 'sorting-insertion',
  pivotLabel: 'ตัวที่กำลังแทรก',
  code: [
    'for i = 1 to n-1:',                 // 0
    '  j = i',                           // 1
    '  while j > 0 and A[j-1] > A[j]:',  // 2
    '    swap(A[j-1], A[j])',            // 3
    '    j = j - 1',                     // 4
  ],
  generate: function (values) {
    var S = new DSA.Stepper();
    var snap = DSA.SortViz.snap;
    var a = values.slice(), n = a.length;
    var ids = a.map(function (_, i) { return i; });

    function sortedUpTo(k) { var s = []; for (var x = 0; x <= k; x++) s.push(x); return s; }
    function step(desc, line, extra) {
      extra = extra || {};
      extra.ids = ids;
      S.add(snap(a, extra), desc, { line: line });
    }
    function swap(i, j) {
      var t = a[i]; a[i] = a[j]; a[j] = t;
      var u = ids[i]; ids[i] = ids[j]; ids[j] = u;
    }

    step('เริ่มต้น: ถือว่า A[0] เรียงแล้ว', -1, { sorted: [0] });

    for (var i = 1; i < n; i++) {
      var j = i;
      step('หยิบ A[' + i + ']=' + a[i] + ' มาแทรกในส่วนที่เรียงแล้ว',
        1, { pivot: [i], sorted: sortedUpTo(i - 1) });

      while (j > 0 && a[j - 1] > a[j]) {
        step('เทียบ A[' + (j - 1) + ']=' + a[j - 1] + ' > A[' + j + ']=' + a[j] + ' → ต้องเลื่อน',
          2, { compare: [j - 1, j], pivot: [j], sorted: sortedUpTo(i - 1) });
        step('สลับให้ตัวที่แทรกเลื่อนไปทางซ้าย', 3, { swap: [j - 1, j], sorted: sortedUpTo(i - 1) });
        swap(j - 1, j);
        step('เลื่อนเสร็จ', 3, { pivot: [j - 1], sorted: sortedUpTo(i - 1) });
        j--;
      }
      if (j > 0) {
        step('A[' + (j - 1) + ']=' + a[j - 1] + ' ≤ A[' + j + ']=' + a[j] + ' → หยุด พบตำแหน่งแล้ว',
          2, { compare: [j - 1, j], pivot: [j], sorted: sortedUpTo(i - 1) });
      }
      step('แทรกเสร็จ ส่วนซ้าย 0..' + i + ' เรียงแล้ว', -1, { sorted: sortedUpTo(i) });
    }
    step('✅ เรียงลำดับเสร็จสมบูรณ์', -1, { sorted: sortedUpTo(n - 1) });
    return S.steps;
  },
});
