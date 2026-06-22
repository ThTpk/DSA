/* Merge Sort — บันทึกการแบ่ง/ผสาน + call stack ของการเรียกซ้ำ */
DSA.SortViz.init({
  topicId: 'sorting-merge',
  pivotLabel: 'ช่วงที่กำลังทำงาน',
  showStack: true,
  size: 8,
  code: [
    'mergeSort(lo, hi):',                            // 0
    '  if lo >= hi: return        // ฐาน',           // 1
    '  mid = (lo + hi) / 2',                         // 2
    '  mergeSort(lo, mid); mergeSort(mid+1, hi)',    // 3
    '  merge(lo, mid, hi)',                          // 4
  ],
  generate: function (values) {
    var S = new DSA.Stepper();
    var snap = DSA.SortViz.snap;
    var a = values.slice(), n = a.length;
    var stack = [], fid = 0;

    function range(lo, hi) { var r = []; for (var x = lo; x <= hi; x++) r.push(x); return r; }
    function step(desc, line, extra) {
      extra = extra || {};
      extra.stack = stack;
      S.add(snap(a, extra), desc, { line: line });
    }

    step('เริ่มต้น: ข้อมูล ' + n + ' ตัว', 0);

    function mergeSort(lo, hi) {
      var f = { id: ++fid, lo: lo, hi: hi, title: 'mergeSort(' + lo + ',' + hi + ')', phase: 'เข้าฟังก์ชัน' };
      stack.push(f);

      if (lo >= hi) {
        f.phase = 'ฐาน: ≤1 ตัว';
        step('เรียก mergeSort(' + lo + ',' + hi + ') → เหลือ ≤1 ตัว ถือว่าเรียงแล้ว คืนค่า',
          1, { pivot: (lo === hi ? [lo] : []) });
        stack.pop();
        return;
      }

      var mid = Math.floor((lo + hi) / 2);
      f.phase = 'แบ่ง';
      step('mergeSort(' + lo + ',' + hi + '): แบ่งครึ่งตรงกลางที่ ' + mid, 2, { pivot: range(lo, hi) });

      mergeSort(lo, mid);
      mergeSort(mid + 1, hi);

      f.phase = 'ผสาน';
      merge(lo, mid, hi);
      stack.pop();
    }

    function merge(lo, mid, hi) {
      var left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1);
      var i = 0, j = 0, k = lo;
      step('ผสานซ้าย [' + lo + '..' + mid + '] กับขวา [' + (mid + 1) + '..' + hi + ']', 4, { pivot: range(lo, hi) });

      while (i < left.length && j < right.length) {
        var chosen, from;
        if (left[i] <= right[j]) { chosen = left[i]; i++; from = 'ซ้าย'; }
        else { chosen = right[j]; j++; from = 'ขวา'; }
        a[k] = chosen;
        step('เลือก ' + chosen + ' (จาก' + from + ') เขียนลงตำแหน่ง ' + k, 4, { pivot: range(lo, hi), swap: [k] });
        k++;
      }
      while (i < left.length) {
        a[k] = left[i];
        step('นำ ' + left[i] + ' (ซ้ายที่เหลือ) ลงตำแหน่ง ' + k, 4, { pivot: range(lo, hi), swap: [k] });
        i++; k++;
      }
      while (j < right.length) {
        a[k] = right[j];
        step('นำ ' + right[j] + ' (ขวาที่เหลือ) ลงตำแหน่ง ' + k, 4, { pivot: range(lo, hi), swap: [k] });
        j++; k++;
      }
      step('ช่วง [' + lo + '..' + hi + '] ผสานเสร็จ', -1, { pivot: range(lo, hi) });
    }

    mergeSort(0, n - 1);
    step('✅ เรียงลำดับเสร็จสมบูรณ์', -1, { sorted: range(0, n - 1) });
    return S.steps;
  },
});
