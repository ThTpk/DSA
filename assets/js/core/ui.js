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
      el.innerHTML =
        '<a class="navbar__brand" href="' + link('index.html') + '">' +
          '<span class="navbar__logo">⚙️</span> DSA Visualizer' +
        '</a>' +
        '<span class="navbar__spacer"></span>' +
        '<a class="navbar__link" href="' + link('roadmap/') + '">เส้นทางการเรียน</a>' +
        '<a class="navbar__link" href="' + link('index.html') + '">หน้าแรก</a>';
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
  };
})();
