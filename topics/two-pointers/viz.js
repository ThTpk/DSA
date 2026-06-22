/* Two Pointers — หาคู่ที่บวกกันได้เท่ากับเป้าหมาย (อาเรย์เรียงแล้ว) */
DSA.SearchViz.init({
  topicId: 'two-pointers',
  sorted: true,
  size: 10,
  targetLabel: 'หาคู่ที่รวมได้',
  // เลือกเป้าหมายเป็น "ผลรวมของสองตัว" เพื่อให้สาธิตเจอบ่อย
  pickTarget: function (vals) {
    if (vals.length >= 2 && Math.random() < 0.75) {
      var i = Math.floor(Math.random() * vals.length);
      var j = Math.floor(Math.random() * vals.length);
      while (j === i) j = Math.floor(Math.random() * vals.length);
      return vals[i] + vals[j];
    }
    return 5 + Math.floor(Math.random() * 190);
  },
  code: [
    'L = 0,  R = n-1',                          // 0
    'while L < R:',                             // 1
    '  sum = A[L] + A[R]',                      // 2
    '  if sum == target: return (L, R)',        // 3
    '  elif sum < target: L = L + 1',           // 4
    '  else: R = R - 1',                        // 5
    'return ไม่พบ',                              // 6
  ],
  generate: function (values, target) {
    var S = new DSA.Stepper();
    var snap = DSA.SearchViz.snap;
    var a = values.slice(), n = a.length;
    var lo = 0, hi = n - 1, excluded = [];

    function activeRange() { var r = []; for (var x = lo; x <= hi; x++) r.push(x); return r; }
    function ptrs() {
      var p = [];
      if (lo < hi) {
        p.push({ label: 'L', index: lo, color: '#2563eb' });
        p.push({ label: 'R', index: hi, color: '#8b5cf6' });
      }
      return p;
    }

    S.add(snap(a, { active: activeRange(), pointers: ptrs() }),
      'เริ่ม: L=0, R=' + (n - 1) + ' (หาคู่ที่รวมได้ ' + target + ')', { line: 0 });

    while (lo < hi) {
      var sum = a[lo] + a[hi];
      S.add(snap(a, { active: activeRange(), checking: [lo, hi], excluded: excluded.slice(), pointers: ptrs() }),
        'A[' + lo + ']+A[' + hi + '] = ' + a[lo] + '+' + a[hi] + ' = ' + sum, { line: 2 });

      if (sum === target) {
        S.add(snap(a, { found: [lo, hi], excluded: excluded.slice() }),
          '✅ เจอคู่! ' + a[lo] + ' + ' + a[hi] + ' = ' + target + ' (ตำแหน่ง ' + lo + ',' + hi + ')', { line: 3 });
        return S.steps;
      } else if (sum < target) {
        excluded.push(lo); lo++;
        S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs() }),
          'ผลรวม ' + sum + ' < ' + target + ' → น้อยไป เลื่อน L ไปขวา (L=' + lo + ')', { line: 4 });
      } else {
        excluded.push(hi); hi--;
        S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs() }),
          'ผลรวม ' + sum + ' > ' + target + ' → มากไป เลื่อน R ไปซ้าย (R=' + hi + ')', { line: 5 });
      }
    }

    var all = []; for (var z = 0; z < n; z++) all.push(z);
    S.add(snap(a, { excluded: all }),
      '❌ L พบ R แล้ว ไม่มีคู่ที่รวมได้ ' + target, { line: 6 });
    return S.steps;
  },
});
