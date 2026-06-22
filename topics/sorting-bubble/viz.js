/* Bubble Sort — ตรรกะเฉพาะหัวข้อ (วาด+ควบคุมมาจาก SortViz/D3)
   ติดตาม ids เพื่อให้ตอนสลับ แท่งเลื่อนสลับตำแหน่งกันจริง */
DSA.SortViz.init({
  topicId: 'sorting-bubble',
  code: [
    'for i = 0 to n-2:',                  // 0
    '  for j = 0 to n-2-i:',              // 1
    '    if A[j] > A[j+1]:',              // 2
    '      swap(A[j], A[j+1])',           // 3
    '  // ตำแหน่งขวาสุดของรอบนี้เรียบร้อย',  // 4
  ],
  generate: function (values) {
    var S = new DSA.Stepper();
    var snap = DSA.SortViz.snap;
    var a = values.slice(), n = a.length, sorted = [];
    var ids = a.map(function (_, i) { return i; });

    function step(desc, line, extra) {
      extra = extra || {};
      extra.ids = ids;
      if (!extra.sorted) extra.sorted = sorted;
      S.add(snap(a, extra), desc, { line: line });
    }
    function swap(i, j) {
      var t = a[i]; a[i] = a[j]; a[j] = t;
      var u = ids[i]; ids[i] = ids[j]; ids[j] = u;
    }

    step('เริ่มต้น: ข้อมูล ' + n + ' ตัว', -1);

    for (var i = 0; i < n - 1; i++) {
      for (var j = 0; j < n - 1 - i; j++) {
        step('เปรียบเทียบ A[' + j + ']=' + a[j] + ' กับ A[' + (j + 1) + ']=' + a[j + 1],
          2, { compare: [j, j + 1] });
        if (a[j] > a[j + 1]) {
          step('A[' + j + '] > A[' + (j + 1) + '] → สลับสองแท่งนี้', 3, { swap: [j, j + 1] });
          swap(j, j + 1);
          step('สลับเสร็จแล้ว', 3, { swap: [j, j + 1] });
        }
      }
      sorted.push(n - 1 - i);
      step('จบรอบที่ ' + (i + 1) + ': ตำแหน่ง ' + (n - 1 - i) + ' เรียบร้อย', 4);
    }
    sorted.push(0);
    step('✅ เรียงลำดับเสร็จสมบูรณ์', -1);
    return S.steps;
  },
});
