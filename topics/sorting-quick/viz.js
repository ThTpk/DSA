/* Quick Sort (Lomuto, pivot = ตัวขวาสุด) + call stack + ติดตาม ids ให้แท่งเลื่อนตอน swap */
DSA.SortViz.init({
  topicId: 'sorting-quick',
  pivotLabel: 'pivot',
  showStack: true,
  code: [
    'quickSort(lo, hi):  if lo >= hi: return',     // 0
    '  p = partition(lo, hi)   // pivot = A[hi]',   // 1
    '  quickSort(lo, p-1)',                         // 2
    '  quickSort(p+1, hi)',                         // 3
    '  // partition: เทียบ & สลับ แล้ววาง pivot',    // 4
  ],
  generate: function (values) {
    var S = new DSA.Stepper();
    var snap = DSA.SortViz.snap;
    var a = values.slice(), n = a.length;
    var ids = a.map(function (_, i) { return i; });
    var stack = [], fid = 0, sorted = [];

    function step(desc, line, extra) {
      extra = extra || {};
      extra.stack = stack;
      extra.ids = ids;
      if (!extra.sorted) extra.sorted = sorted;
      S.add(snap(a, extra), desc, { line: line });
    }
    function swap(i, j) {
      var t = a[i]; a[i] = a[j]; a[j] = t;
      var u = ids[i]; ids[i] = ids[j]; ids[j] = u;
    }

    step('เริ่มต้น: ข้อมูล ' + n + ' ตัว', -1);

    function partition(lo, hi) {
      var pivot = a[hi], i = lo;
      step('เลือก pivot = A[' + hi + ']=' + pivot, 1, { pivot: [hi] });

      for (var j = lo; j < hi; j++) {
        step('เทียบ A[' + j + ']=' + a[j] + ' กับ pivot=' + pivot, 4, { pivot: [hi], compare: [j] });
        if (a[j] < pivot) {
          if (i !== j) {
            step('A[' + j + '] < pivot → สลับไปฝั่งซ้าย (ตำแหน่ง ' + i + ')', 4, { pivot: [hi], swap: [i, j] });
            swap(i, j);
            step('สลับเสร็จแล้ว', 4, { pivot: [hi], swap: [i, j] });
          } else {
            step('A[' + j + '] < pivot → อยู่ฝั่งซ้ายถูกต้องแล้ว', 4, { pivot: [hi], compare: [i] });
          }
          i++;
        }
      }
      if (i !== hi) {
        step('วาง pivot ลงตำแหน่งสุดท้ายที่ ' + i + ' (สลับกับ A[' + hi + '])', 4, { swap: [i, hi] });
        swap(i, hi);
        step('pivot อยู่ตำแหน่งที่ถูกต้องแล้ว', 4, { swap: [i, hi] });
      }
      return i;
    }

    function quickSort(lo, hi) {
      if (lo > hi) return;
      var f = { id: ++fid, lo: lo, hi: hi, title: 'quickSort(' + lo + ',' + hi + ')', phase: 'เข้าฟังก์ชัน' };
      stack.push(f);

      if (lo === hi) {
        sorted.push(lo);
        f.phase = 'ฐาน: 1 ตัว';
        step('quickSort(' + lo + ',' + hi + '): เหลือ 1 ตัว เข้าที่แล้ว', 0);
        stack.pop();
        return;
      }

      f.phase = 'partition';
      var p = partition(lo, hi);
      sorted.push(p);
      f.phase = 'เรียกซ้ำซ้าย-ขวา';
      step('pivot อยู่ตำแหน่ง ' + p + ' เรียบร้อย → เรียกซ้ำสองฝั่ง', 1);

      quickSort(lo, p - 1);
      quickSort(p + 1, hi);
      stack.pop();
    }

    quickSort(0, n - 1);
    var all = []; for (var x = 0; x < n; x++) all.push(x);
    step('✅ เรียงลำดับเสร็จสมบูรณ์', -1, { sorted: all });
    return S.steps;
  },
});
