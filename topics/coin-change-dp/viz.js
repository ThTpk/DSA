/* Coin Change (DP) — 1D table dp[amount] (custom + VizPlayer) */
(function () {
  DSA.UI.mountNavbar('navbar');
  DSA.UI.mountSidebar('sidebar', 'coin-change-dp');
  var host = document.getElementById('dpviz');
  host.innerHTML = '<div class="viz-grid"><div><div id="cc-grid" style="overflow-x:auto"></div><div id="cc-controls"></div></div>' +
    '<div><div class="code-panel" id="cc-code"></div></div></div>';
  var gridEl = document.getElementById('cc-grid'), codeEl = document.getElementById('cc-code');
  var CODE = ['dp[0]=0, dp[1..amount]=∞', 'for a = 1..amount:', '  for เหรียญ c ≤ a:', '    dp[a] = min(dp[a], dp[a-c] + 1)'];
  codeEl.innerHTML = CODE.map(function (l) { return '<span class="code__line">' + l.replace(/</g, '&lt;') + '</span>'; }).join('');
  var codeLineEls = codeEl.querySelectorAll('.code__line');

  var coins = [], amount = 0;
  function fmt(v) { return v === Infinity ? '∞' : v; }
  function render(step) {
    var st = step.snapshot, dp = st.dp;
    var html = '<table class="dp-table"><tr><th>ยอด</th>';
    for (var a = 0; a <= amount; a++) html += '<th class="' + (st.cur === a ? 'hl' : '') + '">' + a + '</th>';
    html += '</tr><tr><th>dp</th>';
    for (var a2 = 0; a2 <= amount; a2++) {
      var cls = st.cur === a2 ? 'cur' : (st.deps && st.deps.indexOf(a2) !== -1 ? 'dep' : (st.path && st.path.indexOf(a2) !== -1 ? 'path' : ''));
      html += '<td class="' + cls + '">' + fmt(dp[a2]) + '</td>';
    }
    html += '</tr></table>';
    gridEl.innerHTML = html;
    for (var k = 0; k < codeLineEls.length; k++) codeLineEls[k].classList.toggle('is-active', k === step.meta.line);
  }

  function build() {
    var dp = [0]; for (var a = 1; a <= amount; a++) dp.push(Infinity);
    var from = new Array(amount + 1).fill(-1);
    var S = new DSA.Stepper();
    function snap(extra) { var o = { dp: dp.slice() }; for (var k in extra) o[k] = extra[k]; return o; }
    S.add(snap({}), 'dp[0]=0 (ทอน 0 ใช้ 0 เหรียญ), ที่เหลือ = ∞', { line: 0 });
    for (var a = 1; a <= amount; a++) {
      var deps = [];
      for (var i = 0; i < coins.length; i++) { var c = coins[i]; if (c <= a) deps.push(a - c); }
      var best = Infinity, bestCoin = -1;
      for (var j = 0; j < coins.length; j++) {
        var c2 = coins[j]; if (c2 <= a && dp[a - c2] + 1 < best) { best = dp[a - c2] + 1; bestCoin = c2; }
      }
      dp[a] = best; from[a] = bestCoin;
      S.add(snap({ cur: a, deps: deps }), 'ยอด ' + a + ': ลองทุกเหรียญ ≤ ' + a + ' → ' + (best === Infinity ? 'ทอนไม่ได้ (∞)' : 'น้อยสุด ' + best + ' เหรียญ'), { line: 3 });
    }
    // traceback
    var path = [], a3 = amount, used = [];
    if (dp[amount] !== Infinity) { while (a3 > 0) { path.push(a3); used.push(from[a3]); a3 -= from[a3]; } path.push(0); }
    S.add(snap({ path: path }), dp[amount] === Infinity ? '❌ ทอนยอด ' + amount + ' ไม่ได้ด้วยเหรียญชุดนี้' : '✅ เหรียญน้อยสุด = ' + dp[amount] + ' (ใช้: ' + used.join(' + ') + ')', { line: -1 });
    return S.steps;
  }

  var player = new DSA.VizPlayer({ steps: [], render: render, controlsEl: document.getElementById('cc-controls'), speed: 600 });
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(function (x) { return !isNaN(x) && x > 0; }); }
  function run() {
    coins = parseList(document.getElementById('cc-coins').value).slice(0, 6);
    amount = Math.min(20, Math.max(1, parseInt(document.getElementById('cc-amount').value, 10) || 6));
    if (!coins.length) { alert('ใส่เหรียญอย่างน้อย 1 ชนิด'); return; }
    document.getElementById('cc-amount').value = amount;
    player.setSteps(build());
  }
  document.getElementById('cc-run').addEventListener('click', run);
  run();
})();
