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
  };
})();
