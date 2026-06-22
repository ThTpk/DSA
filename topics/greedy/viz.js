/* Greedy — coin change (เลือกเหรียญใหญ่สุดที่ไม่เกินยอดเหลือ) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'greedy');

  var DENOMS = [25, 10, 5, 1];
  var host = document.getElementById('greedyviz');
  host.innerHTML =
    '<div class="viz-grid">' +
      '<div><div class="viz-stage" id="gr-stage" style="min-height:240px"></div><div id="gr-controls"></div></div>' +
      '<div><div class="code-panel" id="gr-code"></div></div>' +
    '</div>';
  var stageEl = document.getElementById('gr-stage');
  var codeEl = document.getElementById('gr-code');
  var CODE = ['เรียงเหรียญจากมากไปน้อย: 25,10,5,1', 'while ยอดที่เหลือ > 0:', '  เลือกเหรียญใหญ่สุดที่ ≤ ยอดที่เหลือ', '  ทอนเหรียญนั้น ; ยอดที่เหลือ -= เหรียญ'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  function coinChip(v, hot) {
    var bg = hot ? 'var(--viz-compare)' : '#fde68a';
    var col = hot ? '#fff' : '#92400e';
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:' + bg + ';color:' + col + ';font-weight:700;font-family:var(--font-mono);margin:4px;border:2px solid #f59e0b">' + v + '</span>';
  }

  function render(step) {
    var st = step.snapshot;
    var html = '<div style="padding:16px">';
    html += '<div style="font-size:1.5rem;margin-bottom:6px">ยอดที่เหลือต้องทอน: <b style="color:var(--c-primary)">' + st.remaining + '</b> บาท</div>';
    html += '<div style="color:var(--c-muted);margin-bottom:16px">เหรียญที่ใช้ได้: ' + DENOMS.join(', ') + '</div>';
    html += '<div style="margin-bottom:6px;color:var(--c-muted)">เหรียญที่ทอนไปแล้ว (' + st.picked.length + ' เหรียญ, รวม ' + st.pickedSum + ' บาท):</div>';
    html += '<div style="min-height:60px">' + st.picked.map(function (v, i) { return coinChip(v, i === st.picked.length - 1 && st.justPicked); }).join('') + '</div>';
    html += '</div>';
    stageEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build(amount) {
    var S = new DSA.Stepper();
    var remaining = amount, picked = [], sum = 0;
    function snap(extra) { var o = { remaining: remaining, picked: picked.slice(), pickedSum: sum, justPicked: false }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({}), 'ต้องทอน ' + amount + ' บาท — เลือกเหรียญใหญ่สุดที่ไม่เกินยอดที่เหลือ', { line: 0 });
    var guard = 0;
    while (remaining > 0 && guard++ < 200) {
      var d = 0;
      for (var i = 0; i < DENOMS.length; i++) { if (DENOMS[i] <= remaining) { d = DENOMS[i]; break; } }
      remaining -= d; picked.push(d); sum += d;
      S.add(snap({ justPicked: true }), 'เลือกเหรียญ ' + d + ' บาท (ใหญ่สุดที่ ≤ ยอดเหลือ) → ทอนแล้วเหลือ ' + remaining, { line: 2 });
    }
    S.add(snap({}), '✅ ทอนครบ ' + amount + ' บาท ใช้ทั้งหมด ' + picked.length + ' เหรียญ', { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('gr-controls'), speed: 700 });
  function run() { var a = parseInt(document.getElementById('gr-amount').value, 10); if (isNaN(a) || a < 1) { alert('ใส่ยอดเงิน (จำนวนเต็มบวก)'); return; } a = Math.min(a, 999); document.getElementById('gr-amount').value = a; player.setSteps(build(a)); }
  document.getElementById('gr-run').addEventListener('click', run);
  run();
})();
