/* Jump Search — กระโดดทีละ √n แล้วค้นเชิงเส้นในบล็อก (SearchViz) */
DSA.SearchViz.init({
  topicId: 'jump-search',
  sorted: true,
  size: 12,
  code: [
    'step = ⌊√n⌋',                              // 0
    'ขณะ A[ปลายบล็อก] < target: กระโดดข้ามบล็อก', // 1
    'ค้นเชิงเส้นภายในบล็อกที่คาดว่ามีเป้าหมาย',    // 2
    'เจอ → คืนตำแหน่ง ; เกิน target → ไม่พบ',      // 3
  ],
  generate: function (values, target) {
    var S = new DSA.Stepper();
    var snap = DSA.SearchViz.snap;
    var a = values.slice(), n = a.length, excluded = [];
    var step = Math.max(1, Math.floor(Math.sqrt(n)));
    S.add(snap(a, {}), 'Jump Search: ขนาดกระโดด = ⌊√' + n + '⌋ = ' + step, { line: 0 });

    var curr = 0, bend = 0;
    while (curr < n) {
      bend = Math.min(curr + step, n) - 1;
      S.add(snap(a, { checking: [bend], excluded: excluded.slice(), pointers: [{ label: 'jump', index: bend, color: '#f59e0b' }] }),
        'ดูค่าปลายบล็อก A[' + bend + '] = ' + a[bend] + ' เทียบ ' + target, { line: 1 });
      if (a[bend] >= target) break;
      for (var k = curr; k <= bend; k++) excluded.push(k);
      S.add(snap(a, { excluded: excluded.slice() }), 'A[' + bend + '] < ' + target + ' → กระโดดข้ามบล็อกนี้ (ไป index ' + (curr + step) + ')', { line: 1 });
      curr += step;
    }
    if (curr >= n) { S.add(snap(a, { excluded: excluded.slice() }), '❌ กระโดดเกินอาเรย์แล้ว ไม่พบ ' + target, { line: 3 }); return S.steps; }

    var endI = Math.min(curr + step, n);
    var blockRange = []; for (var b = curr; b < endI; b++) blockRange.push(b);
    for (var i = curr; i < endI; i++) {
      S.add(snap(a, { checking: [i], active: blockRange, excluded: excluded.slice(), pointers: [{ label: 'i', index: i, color: '#2563eb' }] }),
        'ค้นเชิงเส้น: เทียบ A[' + i + '] = ' + a[i] + ' กับ ' + target, { line: 2 });
      if (a[i] === target) { S.add(snap(a, { found: [i], excluded: excluded.slice() }), '✅ เจอ ' + target + ' ที่ตำแหน่ง ' + i, { line: 3 }); return S.steps; }
      if (a[i] > target) { S.add(snap(a, { excluded: excluded.slice() }), 'A[' + i + '] > ' + target + ' → เลยไปแล้ว ไม่พบ', { line: 3 }); return S.steps; }
    }
    S.add(snap(a, { excluded: excluded.slice() }), '❌ ไม่พบ ' + target, { line: 3 });
    return S.steps;
  },
});
