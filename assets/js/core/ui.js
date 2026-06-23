/* ============================================================
   ui.js — สร้าง navbar / sidebar / หน้าแรก จาก topics.js
   ใช้ JS ล้วน ไม่ใช้ fetch จึงเปิดผ่าน file:// ได้
   หน้าใดเป็นหน้าหัวข้อ ให้ตั้ง window.DSA.basePath = '../../' ก่อนโหลดไฟล์นี้
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};
  var base = DSA.basePath || '';

  // เติม index.html ให้ลิงก์ที่ลงท้ายด้วย '/' เพื่อให้เปิดผ่าน file:// (ดับเบิลคลิก) ได้
  function link(path) {
    if (path.charAt(path.length - 1) === '/') path += 'index.html';
    return base + path;
  }

  DSA.UI = {
    /** วาง navbar ลงใน element id ที่กำหนด */
    mountNavbar: function (elId) {
      var el = document.getElementById(elId);
      if (!el) return;
      el.className = 'navbar';
      var hasSidebar = !!document.getElementById('sidebar');
      var toggle = hasSidebar
        ? '<button class="navbar__toggle" id="sidebarToggle" title="ซ่อน/แสดงเมนู" aria-label="สลับเมนูด้านซ้าย">☰</button>'
        : '';
      el.innerHTML =
        toggle +
        '<a class="navbar__brand" href="' + link('index.html') + '">' +
          '<span class="navbar__logo">⚙️</span> DSA Visualizer' +
        '</a>' +
        '<span class="navbar__spacer"></span>' +
        '<a class="navbar__link" href="' + link('roadmap/') + '">เส้นทางการเรียน</a>' +
        '<a class="navbar__link" href="' + link('index.html') + '">หน้าแรก</a>';

      if (hasSidebar) {
        var shell = document.querySelector('.shell');
        var btn = document.getElementById('sidebarToggle');
        // จำสถานะข้ามหน้าไว้ใน localStorage
        var hidden = false;
        try { hidden = localStorage.getItem('dsa-sidebar') === 'hidden'; } catch (e) {}
        if (shell && hidden) shell.classList.add('sidebar-hidden');
        if (btn && shell) {
          btn.addEventListener('click', function () {
            var nowHidden = shell.classList.toggle('sidebar-hidden');
            try { localStorage.setItem('dsa-sidebar', nowHidden ? 'hidden' : 'shown'); } catch (e) {}
          });
        }
      }
    },

    /** วาง sidebar (เมนูตามหมวด) — currentId = id หัวข้อปัจจุบัน */
    mountSidebar: function (elId, currentId) {
      var el = document.getElementById(elId);
      if (!el) return;
      el.className = 'sidebar';
      var html = '';
      DSA.sections.forEach(function (sec) {
        html += '<div class="sidebar__section">';
        html += '<div class="sidebar__title">' + sec.id + ' · ' + sec.title + '</div>';
        sec.items.forEach(function (it) {
          if (it.status === 'ready') {
            var active = it.id === currentId ? ' is-active' : '';
            html += '<a class="sidebar__item' + active + '" href="' + link(it.path) + '">' +
                      '<span>' + it.title + '</span></a>';
          } else {
            html += '<span class="sidebar__item is-planned">' +
                      '<span>' + it.title + '</span>' +
                      '<span class="badge-soon">เร็วๆ นี้</span></span>';
          }
        });
        html += '</div>';
      });
      el.innerHTML = html;
    },

    /** วางแผนผังหลักสูตร (การ์ดในหน้าแรก) */
    mountHome: function (elId) {
      var el = document.getElementById(elId);
      if (!el) return;
      var html = '';
      DSA.sections.forEach(function (sec) {
        html += '<div class="card">';
        html += '<h2><span class="tag">หมวด ' + sec.id + '</span> &nbsp;' + sec.title + '</h2>';
        html += '<div class="home-grid">';
        sec.items.forEach(function (it) {
          if (it.status === 'ready') {
            html += '<a class="home-item is-ready" href="' + link(it.path) + '">' +
                      '<span class="home-item__title">' + it.title + '</span>' +
                      '<span class="home-item__go">เปิดตัวจำลอง →</span></a>';
          } else {
            html += '<span class="home-item is-planned">' +
                      '<span class="home-item__title">' + it.title + '</span>' +
                      '<span class="badge-soon">เร็วๆ นี้</span></span>';
          }
        });
        html += '</div></div>';
      });
      el.innerHTML = html;
    },

    /** วางหน้า "เส้นทางการเรียน" (roadmap) จาก learning-path.js */
    mountRoadmap: function (elId) {
      var el = document.getElementById(elId);
      if (!el || !DSA.learningPath) return;

      // สร้างตารางค้นหา id -> {title, path, status}
      var lookup = {};
      DSA.sections.forEach(function (sec) {
        sec.items.forEach(function (it) { lookup[it.id] = it; });
      });

      // วาดชิปหัวข้อแบบมีลำดับ (มีลูกศรคั่น)
      function chips(ids) {
        var out = '';
        ids.forEach(function (id, i) {
          var it = lookup[id];
          if (!it) return;
          if (i > 0) out += '<span class="rm-arrow">→</span>';
          if (it.status === 'ready') {
            out += '<a class="rm-chip" href="' + link(it.path) + '">' + it.title + '</a>';
          } else {
            out += '<span class="rm-chip is-planned">' + it.title +
                   '<span class="badge-soon">เร็วๆ นี้</span></span>';
          }
        });
        return out;
      }

      var p = DSA.learningPath.prelude;
      var html = '';

      // พื้นฐานร่วม
      html += '<div class="rm-prelude">' +
                '<div class="rm-prelude__head">🚩 ' + p.title + '</div>' +
                '<p class="rm-prelude__desc">' + p.desc + '</p>' +
                '<div class="rm-chiprow">' + chips(p.items) + '</div>' +
              '</div>';

      // สองสาย
      html += '<div class="rm-tracks">';
      DSA.learningPath.tracks.forEach(function (track) {
        html += '<section class="rm-track rm-track--' + track.id + '">';
        html += '<header class="rm-track__head">' +
                  '<span class="rm-track__icon">' + track.icon + '</span>' +
                  '<div><h2 class="rm-track__title">' + track.title + '</h2>' +
                  '<p class="rm-track__sub">' + track.subtitle + '</p></div>' +
                '</header>';
        html += '<div class="rm-levels">';
        track.levels.forEach(function (lv) {
          html += '<div class="rm-level">' +
                    '<div class="rm-level__badge">' + lv.n + '</div>' +
                    '<div class="rm-level__body">' +
                      '<div class="rm-level__title">' + lv.title + '</div>' +
                      '<div class="rm-level__desc">' + lv.desc + '</div>' +
                      '<div class="rm-chiprow">' + chips(lv.items) + '</div>' +
                    '</div>' +
                  '</div>';
        });
        html += '</div></section>';
      });
      html += '</div>';

      el.innerHTML = html;
    },

    /** สร้างการ์ด จุดเด่น/จุดด้อย/ความเหมาะสม จาก DSA.topicMeta[id] แล้ว append ลง .main */
    renderTopicMeta: function (topicId) {
      var meta = (DSA.topicMeta || {})[topicId];
      var main = document.querySelector('.main');
      if (!meta || !main || document.querySelector('.te-card')) return;

      function list(items, cls) {
        var ul = document.createElement('ul');
        ul.className = 'te-list';
        (items || []).forEach(function (t) {
          var li = document.createElement('li');
          li.className = cls;
          li.textContent = t;
          ul.appendChild(li);
        });
        return ul;
      }

      var card = document.createElement('div');
      card.className = 'card te-card';

      var h2 = document.createElement('h2');
      h2.textContent = '⚖️ จุดเด่น · จุดด้อย · ความเหมาะสม';
      card.appendChild(h2);

      var grid = document.createElement('div');
      grid.className = 'te-grid';

      var colPros = document.createElement('div');
      colPros.className = 'te-col te-col--pros';
      var hPros = document.createElement('h3');
      hPros.textContent = '✅ จุดเด่น';
      colPros.appendChild(hPros);
      colPros.appendChild(list(meta.pros, 'te-pro'));

      var colCons = document.createElement('div');
      colCons.className = 'te-col te-col--cons';
      var hCons = document.createElement('h3');
      hCons.textContent = '⚠️ จุดด้อย';
      colCons.appendChild(hCons);
      colCons.appendChild(list(meta.cons, 'te-con'));

      grid.appendChild(colPros);
      grid.appendChild(colCons);
      card.appendChild(grid);

      if (meta.use) {
        var use = document.createElement('p');
        use.className = 'te-use';
        var b = document.createElement('strong');
        b.textContent = '🎯 เหมาะกับงาน: ';
        use.appendChild(b);
        use.appendChild(document.createTextNode(meta.use));
        card.appendChild(use);
      }

      main.appendChild(card);
    },
  };

  /* ---- auto-inject การ์ด topic meta บนหน้าหัวข้อ (ไม่ต้องแก้ทีละไฟล์) ---- */
  (function autoTopicMeta() {
    var m = /\/topics\/([^\/]+)\//.exec(location.pathname);
    if (!m) return;                 // ไม่ใช่หน้าหัวข้อ (home/roadmap) ข้าม
    var topicId = m[1];

    // ใส่ style ครั้งเดียว
    if (!document.getElementById('te-style')) {
      var st = document.createElement('style');
      st.id = 'te-style';
      st.textContent =
        '.te-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:6px 0 4px}' +
        '@media(max-width:640px){.te-grid{grid-template-columns:1fr}}' +
        '.te-col{border:1px solid var(--c-border);border-radius:var(--radius-sm);padding:12px 14px;background:var(--c-surface-2)}' +
        '.te-col--pros{border-left:4px solid #16a34a}' +
        '.te-col--cons{border-left:4px solid #f59e0b}' +
        '.te-col h3{margin:0 0 8px;font-size:.98rem}' +
        '.te-list{margin:0;padding-left:18px}' +
        '.te-list li{margin:4px 0;font-size:.9rem;line-height:1.5}' +
        '.te-use{margin:12px 0 0;background:var(--c-primary-soft);border-radius:var(--radius-sm);padding:10px 14px;font-size:.92rem;color:var(--c-primary-dark)}';
      (document.head || document.documentElement).appendChild(st);
    }

    function go() {
      // โหลด topic-meta.js ถ้ายังไม่มี แล้วค่อย render
      if (DSA.topicMeta) { DSA.UI.renderTopicMeta(topicId); return; }
      var s = document.createElement('script');
      s.src = (DSA.basePath || '') + 'assets/js/data/topic-meta.js';
      s.onload = function () { DSA.UI.renderTopicMeta(topicId); };
      document.body.appendChild(s);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', go);
    } else {
      go();
    }
  })();
})();
