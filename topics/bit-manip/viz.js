/* Bit Manipulation — interactive bit playground (8-bit) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'bit-manip');

  var BITS = 8;
  var A = 12, B = 10, result = null, changed = [];

  function bitsHtml(v, editable) {
    var h = '';
    for (var i = BITS - 1; i >= 0; i--) {
      var on = (v >> i) & 1;
      var ch = changed.indexOf(i) !== -1 && !editable ? ' changed' : '';
      h += '<div class="bit ' + (on ? 'on' : '') + (editable ? '' : ' readonly') + ch + '" data-bit="' + i + '">' + on + '<span class="bit__pos">2^' + i + '</span></div>';
    }
    return h;
  }

  function render() {
    document.getElementById('bits-a').innerHTML = bitsHtml(A, true);
    document.getElementById('bits-b').innerHTML = bitsHtml(B, true);
    document.getElementById('dec-a').textContent = '= ' + A;
    document.getElementById('dec-b').textContent = '= ' + B;
    if (result == null) {
      document.getElementById('bits-r').innerHTML = bitsHtml(0, false).replace(/on/g, '');
      document.getElementById('dec-r').textContent = '';
    } else {
      document.getElementById('bits-r').innerHTML = bitsHtml(result & 0xFF, false);
      document.getElementById('dec-r').textContent = '= ' + (result & 0xFF);
    }
    // bind clicks
    bindRow('bits-a', function (i) { A ^= (1 << i); result = null; changed = []; render(); });
    bindRow('bits-b', function (i) { B ^= (1 << i); result = null; changed = []; render(); });
  }
  function bindRow(id, fn) {
    [].slice.call(document.querySelectorAll('#' + id + ' .bit')).forEach(function (el) {
      el.onclick = function () { fn(+el.getAttribute('data-bit')); };
    });
  }

  function diffBits(r) { var c = []; for (var i = 0; i < BITS; i++) if (((r >> i) & 1) !== ((A >> i) & 1)) c.push(i); return c; }

  var OPS = {
    and: function () { return { r: A & B, label: 'A & B', note: 'AND: บิตเป็น 1 เฉพาะตำแหน่งที่ A และ B เป็น 1 ทั้งคู่' }; },
    or: function () { return { r: A | B, label: 'A | B', note: 'OR: บิตเป็น 1 ถ้า A หรือ B ตำแหน่งนั้นเป็น 1' }; },
    xor: function () { return { r: A ^ B, label: 'A ^ B', note: 'XOR: บิตเป็น 1 ถ้า A กับ B ตำแหน่งนั้น "ต่างกัน"' }; },
    notA: function () { return { r: (~A) & 0xFF, label: '~A', note: 'NOT: กลับทุกบิตของ A (0↔1) ในขอบเขต 8 บิต' }; },
    shlA: function () { return { r: (A << 1) & 0xFF, label: 'A << 1', note: 'เลื่อนซ้าย 1 บิต = คูณ 2 (' + A + ' → ' + ((A << 1) & 0xFF) + ')' }; },
    shrA: function () { return { r: A >> 1, label: 'A >> 1', note: 'เลื่อนขวา 1 บิต = หาร 2 ปัดลง (' + A + ' → ' + (A >> 1) + ')' }; },
  };

  [].slice.call(document.querySelectorAll('[data-op]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var o = OPS[btn.getAttribute('data-op')]();
      result = o.r; changed = diffBits(result & 0xFF);
      document.getElementById('res-label').textContent = o.label;
      document.getElementById('bit-note').textContent = '💡 ' + o.note + '  →  ผลลัพธ์ = ' + (result & 0xFF);
      render();
    });
  });

  render();
})();
