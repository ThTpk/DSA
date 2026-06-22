/* Ternary Search — แบ่งช่วงเป็น 3 ส่วนด้วยจุดตัด 2 จุด (ข้อมูลเรียงแล้ว) */
DSA.SearchViz.init({
  topicId: 'ternary-search',
  sorted: true,
  size: 13,
  code: [
    'lo = 0,  hi = n-1',                          // 0
    'while lo <= hi:',                            // 1
    '  mid1 = lo + (hi-lo)/3',                     // 2
    '  mid2 = hi - (hi-lo)/3',                     // 3
    '  if A[mid1]==t: return mid1',               // 4
    '  if A[mid2]==t: return mid2',               // 5
    '  if t < A[mid1]: hi = mid1-1',              // 6
    '  elif t > A[mid2]: lo = mid2+1',            // 7
    '  else: lo=mid1+1, hi=mid2-1  // ช่วงกลาง',  // 8
    'return -1   // ไม่พบ',                        // 9
  ],
  generate: function (values, target) {
    var S = new DSA.Stepper();
    var snap = DSA.SearchViz.snap;
    var a = values.slice(), n = a.length;
    var lo = 0, hi = n - 1, excluded = [];

    function activeRange() { var r = []; for (var x = lo; x <= hi; x++) r.push(x); return r; }
    function ptrs(m1, m2) {
      var p = [];
      if (lo <= hi) {
        p.push({ label: 'lo', index: lo, color: '#2563eb' });
        p.push({ label: 'hi', index: hi, color: '#8b5cf6' });
      }
      if (m1 != null) p.push({ label: 'm1', index: m1, color: '#f59e0b' });
      if (m2 != null) p.push({ label: 'm2', index: m2, color: '#ec4899' });
      return p;
    }
    function excl(from, to) { for (var x = from; x <= to; x++) if (excluded.indexOf(x) === -1) excluded.push(x); }

    S.add(snap(a, { active: activeRange(), pointers: ptrs(null, null) }),
      'เริ่ม: lo=0, hi=' + (n - 1) + ' (ค้นทั้งอาเรย์)', { line: 0 });

    while (lo <= hi) {
      var third = Math.floor((hi - lo) / 3);
      var mid1 = lo + third;
      var mid2 = hi - third;
      S.add(snap(a, { active: activeRange(), checking: [mid1, mid2], excluded: excluded.slice(), pointers: ptrs(mid1, mid2) }),
        'แบ่งสามส่วน: m1=' + mid1 + ' (A=' + a[mid1] + '), m2=' + mid2 + ' (A=' + a[mid2] + ')', { line: 2 });

      if (a[mid1] === target) {
        S.add(snap(a, { found: [mid1], excluded: excluded.slice() }), '✅ เจอ ' + target + ' ที่ตำแหน่ง ' + mid1 + ' (m1)', { line: 4 });
        return S.steps;
      }
      if (a[mid2] === target) {
        S.add(snap(a, { found: [mid2], excluded: excluded.slice() }), '✅ เจอ ' + target + ' ที่ตำแหน่ง ' + mid2 + ' (m2)', { line: 5 });
        return S.steps;
      }

      if (target < a[mid1]) {
        excl(mid1, hi); hi = mid1 - 1;
        S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null, null) }),
          target + ' < A[m1] → ตัด 2 ส่วนขวาทิ้ง เลื่อน hi=' + hi, { line: 6 });
      } else if (target > a[mid2]) {
        excl(lo, mid2); lo = mid2 + 1;
        S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null, null) }),
          target + ' > A[m2] → ตัด 2 ส่วนซ้ายทิ้ง เลื่อน lo=' + lo, { line: 7 });
      } else {
        excl(lo, mid1); excl(mid2, hi); lo = mid1 + 1; hi = mid2 - 1;
        S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null, null) }),
          'A[m1] < ' + target + ' < A[m2] → อยู่ช่วงกลาง: lo=' + lo + ', hi=' + hi, { line: 8 });
      }
    }

    var all = []; for (var z = 0; z < n; z++) all.push(z);
    S.add(snap(a, { excluded: all }), '❌ lo > hi แล้ว ไม่พบ ' + target + ' (คืนค่า -1)', { line: 9 });
    return S.steps;
  },
});
