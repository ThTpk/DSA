/* Linear Search — ไล่ดูทีละตัวจากซ้ายไปขวา */
DSA.SearchViz.init({
  topicId: 'linear-search',
  sorted: false,
  size: 10,
  code: [
    'i = 0',                                    // 0
    'while i < n:',                             // 1
    '  if A[i] == target: return i   // เจอ',   // 2
    '  i = i + 1',                              // 3
    'return -1   // ไม่พบ',                      // 4
  ],
  generate: function (values, target) {
    var S = new DSA.Stepper();
    var snap = DSA.SearchViz.snap;
    var a = values.slice(), n = a.length;
    var excluded = [];
    var I = function (i) { return { label: 'i', index: i, color: '#f59e0b' }; };

    S.add(snap(a, { pointers: [I(0)] }),
      'เริ่มค้นหา target = ' + target + ' จากตำแหน่งซ้ายสุด', { line: 0 });

    for (var i = 0; i < n; i++) {
      S.add(snap(a, { checking: [i], excluded: excluded.slice(), pointers: [I(i)] }),
        'เทียบ A[' + i + ']=' + a[i] + ' กับ target=' + target, { line: 2 });

      if (a[i] === target) {
        S.add(snap(a, { found: [i], excluded: excluded.slice(), pointers: [I(i)] }),
          '✅ เจอ! A[' + i + ']=' + target + ' ที่ตำแหน่ง ' + i, { line: 2 });
        return S.steps;
      }

      excluded.push(i);
      var ni = (i + 1 < n) ? i + 1 : i;
      S.add(snap(a, { excluded: excluded.slice(), pointers: [I(ni)] }),
        'ไม่ตรง → ข้ามไปตัวถัดไป', { line: 3 });
    }

    S.add(snap(a, { excluded: excluded.slice() }),
      '❌ ดูครบทุกตัวแล้ว ไม่พบ ' + target + ' (คืนค่า -1)', { line: 4 });
    return S.steps;
  },
});
