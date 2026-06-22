/* Interpolation Search — ประมาณตำแหน่ง pos จากค่า (SearchViz) */
DSA.SearchViz.init({
  topicId: 'interpolation-search',
  sorted: true,
  size: 12,
  code: [
    'lo = 0, hi = n-1',                                       // 0
    'while lo<=hi และ A[lo] ≤ target ≤ A[hi]:',              // 1
    '  pos = lo + (target−A[lo])·(hi−lo) / (A[hi]−A[lo])',   // 2
    '  if A[pos]==target: return pos',                        // 3
    '  elif A[pos]<target: lo = pos+1',                       // 4
    '  else: hi = pos-1',                                     // 5
  ],
  generate: function (values, target) {
    var S = new DSA.Stepper();
    var snap = DSA.SearchViz.snap;
    var a = values.slice(), n = a.length, lo = 0, hi = n - 1, excluded = [];
    function activeRange() { var r = []; for (var x = lo; x <= hi; x++) r.push(x); return r; }
    function ptrs(pos) {
      var p = [];
      if (lo <= hi) { p.push({ label: 'lo', index: lo, color: '#2563eb' }); p.push({ label: 'hi', index: hi, color: '#8b5cf6' }); }
      if (pos != null) p.push({ label: 'pos', index: pos, color: '#f59e0b' });
      return p;
    }
    S.add(snap(a, { active: activeRange(), pointers: ptrs(null) }), 'เริ่ม: lo=0, hi=' + (n - 1) + ' หา ' + target, { line: 0 });

    var guard = 0;
    while (lo <= hi && target >= a[lo] && target <= a[hi] && guard++ < 60) {
      var pos;
      if (a[hi] === a[lo]) pos = lo;
      else pos = lo + Math.floor((target - a[lo]) * (hi - lo) / (a[hi] - a[lo]));
      if (pos < lo) pos = lo; if (pos > hi) pos = hi;
      S.add(snap(a, { active: activeRange(), checking: [pos], excluded: excluded.slice(), pointers: ptrs(pos) }),
        'ประมาณ pos = ' + lo + ' + (' + target + '−' + a[lo] + ')·(' + hi + '−' + lo + ')/(' + a[hi] + '−' + a[lo] + ') = ' + pos + ' → เทียบ A[' + pos + ']=' + a[pos], { line: 2 });
      if (a[pos] === target) { S.add(snap(a, { found: [pos], excluded: excluded.slice() }), '✅ เจอ ' + target + ' ที่ตำแหน่ง ' + pos, { line: 3 }); return S.steps; }
      else if (a[pos] < target) { for (var x = lo; x <= pos; x++) excluded.push(x); lo = pos + 1; S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null) }), 'A[' + pos + '] < ' + target + ' → ตัดซ้ายทิ้ง, lo = ' + lo, { line: 4 }); }
      else { for (var y = pos; y <= hi; y++) excluded.push(y); hi = pos - 1; S.add(snap(a, { active: activeRange(), excluded: excluded.slice(), pointers: ptrs(null) }), 'A[' + pos + '] > ' + target + ' → ตัดขวาทิ้ง, hi = ' + hi, { line: 5 }); }
    }
    var all = []; for (var z = 0; z < n; z++) all.push(z);
    S.add(snap(a, { excluded: all }), '❌ ไม่พบ ' + target + ' (target อยู่นอกช่วงที่เหลือ)', { line: 1 });
    return S.steps;
  },
});
