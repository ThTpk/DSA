/* Exponential Search — หาขอบเขตด้วยการคูณสอง แล้ว Binary Search ในช่วงนั้น (SearchViz) */
DSA.SearchViz.init({
  topicId: 'exp-search',
  sorted: true,
  size: 14,
  code: [
    'if A[0] == target: return 0',                 // 0
    'bound = 1',                                    // 1
    'while bound < n and A[bound] < target:',      // 2
    '  bound *= 2   // คูณสองไปเรื่อยๆ',            // 3
    'binary search ในช่วง [bound/2 .. min(bound,n-1)]', // 4
    'เจอ → คืนตำแหน่ง ; ไม่เจอ → -1',               // 5
  ],
  generate: function (values, target) {
    var S = new DSA.Stepper();
    var snap = DSA.SearchViz.snap;
    var a = values.slice(), n = a.length, excluded = [];

    S.add(snap(a, { checking: [0], pointers: [{ label: 'bound', index: 0, color: '#f59e0b' }] }),
      'เริ่ม: ตรวจ A[0] = ' + a[0] + ' เทียบ target = ' + target, { line: 0 });
    if (a[0] === target) {
      S.add(snap(a, { found: [0] }), '✅ เจอ ' + target + ' ที่ตำแหน่ง 0', { line: 0 });
      return S.steps;
    }

    // ---- ขั้นที่ 1: หาขอบเขตด้วยการคูณสอง ----
    var bound = 1;
    S.add(snap(a, { checking: [Math.min(bound, n - 1)], pointers: [{ label: 'bound', index: Math.min(bound, n - 1), color: '#f59e0b' }] }),
      'หาขอบเขต: เริ่ม bound = 1', { line: 1 });
    while (bound < n && a[bound] < target) {
      S.add(snap(a, { checking: [bound], excluded: excluded.slice(), pointers: [{ label: 'bound', index: bound, color: '#f59e0b' }] }),
        'A[' + bound + '] = ' + a[bound] + ' < ' + target + ' → ยังไม่ถึง คูณสอง', { line: 2 });
      for (var e = 0; e <= bound; e++) if (excluded.indexOf(e) === -1) excluded.push(e);
      bound *= 2;
      S.add(snap(a, { excluded: excluded.slice(), pointers: [{ label: 'bound', index: Math.min(bound, n - 1), color: '#f59e0b' }] }),
        'คูณสอง → bound = ' + bound + (bound >= n ? ' (เกินขนาดอาเรย์ จะหยุด)' : ''), { line: 3 });
    }
    if (bound < n) {
      S.add(snap(a, { checking: [bound], excluded: excluded.slice(), pointers: [{ label: 'bound', index: bound, color: '#f59e0b' }] }),
        'A[' + bound + '] = ' + a[bound] + ' ≥ ' + target + ' → พบขอบเขตแล้ว', { line: 2 });
    }

    // ---- ขั้นที่ 2: Binary Search ใน [bound/2 .. min(bound, n-1)] ----
    var lo = Math.floor(bound / 2), hi = Math.min(bound, n - 1);
    function activeRange() { var r = []; for (var x = lo; x <= hi; x++) r.push(x); return r; }
    function ptrs(mid) {
      var p = [{ label: 'lo', index: lo, color: '#2563eb' }, { label: 'hi', index: hi, color: '#8b5cf6' }];
      if (mid != null) p.push({ label: 'mid', index: mid, color: '#f59e0b' });
      return p;
    }
    S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null) }),
      'Binary Search ในช่วง [' + lo + ' .. ' + hi + ']', { line: 4 });

    while (lo <= hi) {
      var mid = Math.floor((lo + hi) / 2);
      S.add(snap(a, { active: activeRange(), checking: [mid], excluded: excluded.slice(), pointers: ptrs(mid) }),
        'mid = ' + mid + ' → เทียบ A[' + mid + '] = ' + a[mid] + ' กับ ' + target, { line: 4 });
      if (a[mid] === target) {
        S.add(snap(a, { found: [mid], excluded: excluded.slice() }), '✅ เจอ ' + target + ' ที่ตำแหน่ง ' + mid, { line: 5 });
        return S.steps;
      } else if (a[mid] < target) {
        for (var x = lo; x <= mid; x++) if (excluded.indexOf(x) === -1) excluded.push(x);
        lo = mid + 1;
        S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null) }),
          'A[' + mid + '] < ' + target + ' → เลื่อน lo = ' + lo, { line: 4 });
      } else {
        for (var y = mid; y <= hi; y++) if (excluded.indexOf(y) === -1) excluded.push(y);
        hi = mid - 1;
        S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null) }),
          'A[' + mid + '] > ' + target + ' → เลื่อน hi = ' + hi, { line: 4 });
      }
    }
    S.add(snap(a, { excluded: excluded.slice() }), '❌ ไม่พบ ' + target + ' (คืนค่า -1)', { line: 5 });
    return S.steps;
  },
});
