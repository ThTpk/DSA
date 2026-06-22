/* Selection Sort — ติดตาม ids เพื่อให้แท่งเลื่อนสลับตำแหน่งตอน swap */
DSA.SortViz.init({
  topicId: 'sorting-selection',
  pivotLabel: 'ค่าน้อยสุดที่พบ',
  code: [
    'for i = 0 to n-1:',                 // 0
    '  min = i',                         // 1
    '  for j = i+1 to n-1:',             // 2
    '    if A[j] < A[min]: min = j',     // 3
    '  swap(A[i], A[min])',              // 4
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
      var min = i;
      step('รอบที่ ' + (i + 1) + ': เริ่มสมมติว่า A[' + i + ']=' + a[i] + ' น้อยที่สุด', 1, { pivot: [min] });

      for (var j = i + 1; j < n; j++) {
        step('เทียบ A[' + j + ']=' + a[j] + ' กับค่าน้อยสุด A[' + min + ']=' + a[min],
          3, { compare: [j], pivot: [min] });
        if (a[j] < a[min]) {
          min = j;
          step('พบค่าน้อยกว่า → ค่าน้อยสุดใหม่คือ A[' + min + ']=' + a[min], 3, { pivot: [min] });
        }
      }
      if (min !== i) {
        step('สลับ A[' + i + '] กับ A[' + min + '] (ค่าน้อยสุดไปอยู่ซ้าย)', 4, { swap: [i, min] });
        swap(i, min);
        step('สลับเสร็จแล้ว', 4, { swap: [i, min] });
      } else {
        step('A[' + i + '] เป็นค่าน้อยสุดอยู่แล้ว ไม่ต้องสลับ', 4, { pivot: [i] });
      }
      sorted.push(i);
    }
    sorted.push(n - 1);
    step('✅ เรียงลำดับเสร็จสมบูรณ์', -1);
    return S.steps;
  },
});
