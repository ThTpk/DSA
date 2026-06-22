/* Quickselect — partition แบบ Quick Sort แต่ค้นต่อแค่ฝั่งที่มี k (SortViz) */
DSA.SortViz.init({
  topicId: 'quickselect',
  pivotLabel: 'pivot',
  code: [
    'select(lo, hi, k):',                          // 0
    '  p = partition(lo, hi)   // pivot = A[hi]',   // 1
    '  if p == k: return A[p]   // เจอ!',           // 2
    '  elif k < p: select(lo, p-1, k)',            // 3
    '  else:       select(p+1, hi, k)',            // 4
  ],
  generate: function (values) {
    var S = new DSA.Stepper();
    var snap = DSA.SortViz.snap;
    var a = values.slice(), n = a.length;
    var ids = a.map(function (_, i) { return i; });
    var settled = [], excluded = [];
    var k = Math.floor((n - 1) / 2);

    function step(desc, line, extra) {
      extra = extra || {}; extra.ids = ids;
      extra.sorted = settled.slice();
      S.add(snap(a, extra), desc, { line: line });
    }
    function swap(i, j) { var t = a[i]; a[i] = a[j]; a[j] = t; var u = ids[i]; ids[i] = ids[j]; ids[j] = u; }

    step('หาค่าอันดับที่ k = ' + k + ' (มัธยฐาน) จาก ' + n + ' ตัว', -1);

    function partition(lo, hi) {
      var pivot = a[hi], i = lo;
      step('เลือก pivot = A[' + hi + '] = ' + pivot, 1, { pivot: [hi] });
      for (var j = lo; j < hi; j++) {
        step('เทียบ A[' + j + '] = ' + a[j] + ' กับ pivot ' + pivot, 1, { pivot: [hi], compare: [j] });
        if (a[j] < pivot) {
          if (i !== j) { swap(i, j); step('A[' + j + '] < pivot → สลับมาฝั่งซ้าย (ตำแหน่ง ' + i + ')', 1, { pivot: [hi], swap: [i, j] }); }
          i++;
        }
      }
      if (i !== hi) { swap(i, hi); step('วาง pivot ลงตำแหน่ง ' + i, 1, { swap: [i, hi] }); }
      return i;
    }

    var lo = 0, hi = n - 1;
    while (lo <= hi) {
      var p = partition(lo, hi);
      settled.push(p);
      step('หลัง partition: pivot อยู่ตำแหน่ง ' + p + ' (ถูกต้องถาวร)', 1, { pivot: [p] });
      if (p === k) {
        step('✅ p = k = ' + k + ' → ค่าอันดับที่ ' + k + ' คือ ' + a[p], 2, { pivot: [p] });
        return S.steps;
      } else if (k < p) {
        hi = p - 1;
        step('k (' + k + ') < p (' + p + ') → ค้นต่อฝั่งซ้าย [' + lo + '..' + hi + ']', 3, { pivot: [p] });
      } else {
        lo = p + 1;
        step('k (' + k + ') > p (' + p + ') → ค้นต่อฝั่งขวา [' + lo + '..' + hi + ']', 4, { pivot: [p] });
      }
    }
    return S.steps;
  },
});
