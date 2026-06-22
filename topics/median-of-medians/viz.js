/* Median of Medians — deterministic select (กลุ่มละ 5) ด้วย SortViz */
DSA.SortViz.init({
  topicId: 'median-of-medians',
  pivotLabel: 'pivot / มัธยฐานกลุ่ม',
  size: 13,
  code: [
    'select(lo, hi, k):',                            // 0
    '  แบ่งเป็นกลุ่มละ 5 → หามัธยฐานแต่ละกลุ่ม',       // 1
    '  pivot = มัธยฐานของมัธยฐานเหล่านั้น',           // 2
    '  p = partition รอบ pivot',                      // 3
    '  if p==k: เจอ ; elif k<p: ซ้าย ; else: ขวา',    // 4
  ],
  generate: function (values) {
    var S = new DSA.Stepper();
    var snap = DSA.SortViz.snap;
    var a = values.slice(), n = a.length;
    var ids = a.map(function (_, i) { return i; });
    var settled = [];
    var k = Math.floor((n - 1) / 2);

    function step(desc, line, extra) { extra = extra || {}; extra.ids = ids; extra.sorted = settled.slice(); S.add(snap(a, extra), desc, { line: line }); }
    function swap(i, j) { var t = a[i]; a[i] = a[j]; a[j] = t; var u = ids[i]; ids[i] = ids[j]; ids[j] = u; }
    function sortRange(s, e) {
      var pairs = []; for (var x = s; x <= e; x++) pairs.push({ v: a[x], id: ids[x] });
      pairs.sort(function (p, q) { return p.v - q.v; });
      for (var y = s; y <= e; y++) { a[y] = pairs[y - s].v; ids[y] = pairs[y - s].id; }
    }

    step('หาค่าอันดับที่ k = ' + k + ' (มัธยฐาน) แบบรับประกัน O(n)', 0);

    function medianOfMedians(lo, hi) {
      var medIdx = [], range = [];
      for (var s = lo; s <= hi; s += 5) {
        var e = Math.min(s + 4, hi);
        sortRange(s, e);
        var mid = s + ((e - s) >> 1);
        medIdx.push(mid);
        var grp = []; for (var g = s; g <= e; g++) grp.push(g);
        step('กลุ่ม [' + s + '..' + e + '] เรียงแล้ว → มัธยฐาน = a[' + mid + '] = ' + a[mid], 1, { compare: grp, pivot: [mid] });
      }
      // มัธยฐานของค่ามัธยฐานกลุ่ม
      var medVals = medIdx.map(function (i) { return a[i]; }).slice().sort(function (x, y) { return x - y; });
      var mm = medVals[Math.floor((medVals.length - 1) / 2)];
      step('มัธยฐานของมัธยฐาน (จาก [' + medIdx.map(function (i) { return a[i]; }).join(', ') + ']) = ' + mm + ' → ใช้เป็น pivot', 2, { pivot: medIdx });
      return mm;
    }

    function partition(lo, hi, pivotVal) {
      var pi = lo; for (var x = lo; x <= hi; x++) if (a[x] === pivotVal) { pi = x; break; }
      swap(pi, hi);
      var i = lo;
      for (var j = lo; j < hi; j++) { if (a[j] < pivotVal) { if (i !== j) swap(i, j); i++; } }
      swap(i, hi);
      return i;
    }

    var lo = 0, hi = n - 1, guard = 0;
    while (lo <= hi && guard++ < 30) {
      if (lo === hi) { settled.push(lo); step('✅ เหลือช่วงเดียว → ค่าอันดับที่ ' + k + ' (มัธยฐาน) คือ a[' + lo + '] = ' + a[lo], 4, { pivot: [lo] }); break; }
      var mm = medianOfMedians(lo, hi);
      var p = partition(lo, hi, mm);
      settled.push(p);
      step('partition รอบ pivot=' + mm + ' → pivot ไปอยู่ตำแหน่ง ' + p, 3, { pivot: [p] });
      if (p === k) { step('✅ p = k = ' + k + ' → ค่าอันดับที่ ' + k + ' คือ ' + a[p], 4, { pivot: [p] }); return S.steps; }
      else if (k < p) { hi = p - 1; step('k < p → ค้นต่อฝั่งซ้าย [' + lo + '..' + hi + ']', 4, { pivot: [p] }); }
      else { lo = p + 1; step('k > p → ค้นต่อฝั่งขวา [' + lo + '..' + hi + ']', 4, { pivot: [p] }); }
    }
    return S.steps;
  },
});
