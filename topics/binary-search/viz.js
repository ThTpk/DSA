/* Binary Search — ตัดครึ่งช่วงค้นหาทุกครั้ง (ข้อมูลเรียงแล้ว) */
DSA.SearchViz.init({
  topicId: 'binary-search',
  sorted: true,   // SearchViz จะเรียงอาเรย์ให้ก่อน
  size: 12,
  code: [
    'lo = 0,  hi = n-1',                      // 0
    'while lo <= hi:',                        // 1
    '  mid = (lo + hi) / 2',                  // 2
    '  if A[mid] == target: return mid',      // 3
    '  elif A[mid] < target: lo = mid + 1',   // 4
    '  else: hi = mid - 1',                   // 5
    'return -1   // ไม่พบ',                    // 6
  ],
  generate: function (values, target) {
    var S = new DSA.Stepper();
    var snap = DSA.SearchViz.snap;
    var a = values.slice(), n = a.length;
    var lo = 0, hi = n - 1;
    var excluded = [];

    function activeRange() { var r = []; for (var x = lo; x <= hi; x++) r.push(x); return r; }
    function ptrs(mid) {
      var p = [];
      if (lo <= hi) {
        p.push({ label: 'lo', index: lo, color: '#2563eb' });
        p.push({ label: 'hi', index: hi, color: '#8b5cf6' });
      }
      if (mid != null) p.push({ label: 'mid', index: mid, color: '#f59e0b' });
      return p;
    }

    S.add(snap(a, { active: activeRange(), pointers: ptrs(null) }),
      'เริ่ม: lo=0, hi=' + (n - 1) + ' (ค้นทั้งอาเรย์)', { line: 0 });

    while (lo <= hi) {
      var mid = Math.floor((lo + hi) / 2);
      S.add(snap(a, { active: activeRange(), checking: [mid], excluded: excluded.slice(), pointers: ptrs(mid) }),
        'mid=' + mid + ' → เทียบ A[' + mid + ']=' + a[mid] + ' กับ target=' + target, { line: 2 });

      if (a[mid] === target) {
        S.add(snap(a, { found: [mid], excluded: excluded.slice(), pointers: ptrs(mid) }),
          '✅ เจอ! A[' + mid + ']=' + target + ' ที่ตำแหน่ง ' + mid, { line: 3 });
        return S.steps;
      } else if (a[mid] < target) {
        for (var x = lo; x <= mid; x++) excluded.push(x);
        lo = mid + 1;
        S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null) }),
          'A[' + mid + '] < target → ตัดครึ่งซ้ายทิ้ง เลื่อน lo=' + lo, { line: 4 });
      } else {
        for (var y = mid; y <= hi; y++) excluded.push(y);
        hi = mid - 1;
        S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null) }),
          'A[' + mid + '] > target → ตัดครึ่งขวาทิ้ง เลื่อน hi=' + hi, { line: 5 });
      }
    }

    var all = []; for (var z = 0; z < n; z++) all.push(z);
    S.add(snap(a, { excluded: all }),
      '❌ lo > hi แล้ว ช่วงค้นหาหมด ไม่พบ ' + target + ' (คืนค่า -1)', { line: 6 });
    return S.steps;
  },
});
