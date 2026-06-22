/* ============================================================
   VizPlayer.js — เครื่องยนต์เล่นภาพเคลื่อนไหวกลาง
   รับ "รายการขั้นตอน" จาก Stepper แล้วสร้างแผงควบคุม
   เล่น / หยุด / ก้าวหน้า / ถอยหลัง / ปรับความเร็ว / รีเซ็ต
   ให้ทุกหัวข้อใช้ร่วมกัน หน้าตา+การควบคุมเหมือนกันหมด
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};

  function VizPlayer(opts) {
    this.render = opts.render;                 // ฟังก์ชันวาดของหัวข้อ: render(step, index, total)
    this.controlsEl = opts.controlsEl;         // element สำหรับวางแผงควบคุม
    this.speed = opts.speed || 600;            // มิลลิวินาทีต่อ 1 ขั้น
    this.steps = opts.steps || [];
    this.index = 0;
    this.playing = false;
    this._timer = null;

    this._build();
    this.seek(0);
  }

  VizPlayer.prototype._build = function () {
    var self = this;
    var el = this.controlsEl;
    el.classList.add('vp');
    el.innerHTML =
      '<div class="vp__row">' +
        '<button class="vp__btn" data-act="reset" title="เริ่มใหม่">⏮ เริ่มใหม่</button>' +
        '<button class="vp__btn" data-act="prev" title="ถอยหลัง">◀ ถอย</button>' +
        '<button class="vp__btn vp__btn--primary" data-act="toggle">▶ เล่น</button>' +
        '<button class="vp__btn" data-act="next" title="ก้าวหน้า">เดิน ▶</button>' +
        '<div class="vp__speed">' +
          '<label>ความเร็ว</label>' +
          '<input type="range" min="100" max="1500" step="100" data-act="speed">' +
        '</div>' +
      '</div>' +
      '<div class="vp__progress"><div class="vp__progress-bar"></div></div>' +
      '<div class="vp__status">' +
        '<span class="vp__counter"></span>' +
        '<span class="vp__desc"></span>' +
      '</div>';

    this._btnToggle = el.querySelector('[data-act="toggle"]');
    this._barFill   = el.querySelector('.vp__progress-bar');
    this._counterEl = el.querySelector('.vp__counter');
    this._descEl    = el.querySelector('.vp__desc');
    var speedEl     = el.querySelector('[data-act="speed"]');
    // slider: ค่าน้อย = เร็ว -> เก็บเป็น (1600 - speed) เพื่อให้เลื่อนขวา = เร็วขึ้น
    speedEl.value = String(1600 - this.speed);

    el.querySelector('[data-act="reset"]').addEventListener('click', function () { self.reset(); });
    el.querySelector('[data-act="prev"]').addEventListener('click', function () { self.prev(); });
    el.querySelector('[data-act="next"]').addEventListener('click', function () { self.next(); });
    this._btnToggle.addEventListener('click', function () { self.toggle(); });
    speedEl.addEventListener('input', function (e) {
      self.speed = 1600 - Number(e.target.value);
    });
  };

  VizPlayer.prototype.setSteps = function (steps) {
    this.pause();
    this.steps = steps || [];
    this.seek(0);
  };

  VizPlayer.prototype.seek = function (i) {
    if (this.steps.length === 0) return;
    this.index = Math.max(0, Math.min(i, this.steps.length - 1));
    var step = this.steps[this.index];
    this.render(step, this.index, this.steps.length);
    this._updateUI(step);
  };

  VizPlayer.prototype._updateUI = function (step) {
    var total = this.steps.length;
    var pct = total <= 1 ? 100 : (this.index / (total - 1)) * 100;
    this._barFill.style.width = pct + '%';
    this._counterEl.textContent = 'ขั้นที่ ' + (this.index + 1) + ' / ' + total;
    this._descEl.textContent = step.description || '';
  };

  VizPlayer.prototype.next = function () {
    if (this.index >= this.steps.length - 1) { this.pause(); return false; }
    this.seek(this.index + 1);
    return true;
  };

  VizPlayer.prototype.prev = function () {
    this.pause();
    this.seek(this.index - 1);
  };

  VizPlayer.prototype.reset = function () {
    this.pause();
    this.seek(0);
  };

  VizPlayer.prototype.play = function () {
    var self = this;
    if (this.index >= this.steps.length - 1) this.seek(0); // เล่นจบแล้วกดเล่น = เริ่มใหม่
    this.playing = true;
    this._btnToggle.innerHTML = '⏸ หยุด';
    var tick = function () {
      if (!self.playing) return;
      var moved = self.next();
      if (moved && self.playing) {
        self._timer = setTimeout(tick, self.speed);
      } else {
        self.pause();
      }
    };
    this._timer = setTimeout(tick, this.speed);
  };

  VizPlayer.prototype.pause = function () {
    this.playing = false;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    if (this._btnToggle) this._btnToggle.innerHTML = '▶ เล่น';
  };

  VizPlayer.prototype.toggle = function () {
    if (this.playing) this.pause();
    else this.play();
  };

  DSA.VizPlayer = VizPlayer;
})();
