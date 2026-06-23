/* ============================================================
   learning-path.js — เส้นทางการเรียนตามลำดับที่เหมาะสม
   ต่างจาก topics.js (จัดตาม "หมวดเนื้อหา") ไฟล์นี้จัดตาม
   "ลำดับการเรียนรู้" แยกเป็น 2 สาย: Data Structure / Algorithm
   แต่ละสายแบ่งเป็นระดับ (level) ที่ควรเรียนไล่จากบนลงล่าง
   id ทุกตัวอ้างอิงจาก topics.js (ชื่อ/ลิงก์ดึงมาอัตโนมัติ)
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};

  DSA.learningPath = {
    // เรียนก่อนทั้งสองสาย — เป็นพื้นฐานร่วม
    prelude: {
      title: 'เริ่มต้นที่นี่ · พื้นฐานร่วม',
      desc: 'ภาษากลางในการวิเคราะห์และคิดแบบเรียกซ้ำ ใช้ต่อยอดได้ทั้งสองสาย',
      items: ['big-o', 'recursion'],
    },

    tracks: [
      {
        id: 'ds',
        icon: '🧱',
        title: 'สาย Data Structure',
        subtitle: 'โครงสร้างข้อมูล — "เก็บข้อมูลอย่างไรให้ใช้งานได้เร็ว"',
        levels: [
          { n: 1, title: 'เชิงเส้นพื้นฐาน',
            desc: 'โครงสร้างเรียงต่อกัน เริ่มจากสิ่งที่ใช้บ่อยที่สุด',
            items: ['array', 'linked-list', 'stack', 'queue'] },
          { n: 2, title: 'เชิงเส้นต่อยอด',
            desc: 'ส่วนขยายของลิสต์/คิว และเทคนิคตัวชี้บนลิสต์',
            items: ['doubly-linked-list', 'deque', 'floyds-cycle'] },
          { n: 3, title: 'Hashing',
            desc: 'เข้าถึงด้วย key เฉลี่ย O(1) และโครงสร้างที่ต่อยอดจากแฮช',
            items: ['hash-table', 'hash-open', 'bloom-filter', 'lru-cache'] },
          { n: 4, title: 'ต้นไม้พื้นฐาน',
            desc: 'จากต้นไม้ทั่วไป สู่ BST และ heap/priority queue',
            items: ['binary-tree', 'bst', 'heap', 'priority-queue', 'trie'] },
          { n: 5, title: 'ต้นไม้ปรับสมดุลเอง',
            desc: 'แก้ปัญหา BST เอียงเป็นเส้น ให้รับประกัน O(log n)',
            items: ['avl', 'red-black', 'skip-list'] },
          { n: 6, title: 'ต้นไม้/ฮีปสำหรับงานเฉพาะ',
            desc: 'range query, ดิสก์/ฐานข้อมูล และฮีปขั้นสูง',
            items: ['segment-tree', 'fenwick-tree', 'b-tree', 'b-plus-tree', 'fibonacci-heap', 'veb'] },
          { n: 7, title: 'โครงสร้างสำหรับกราฟ',
            desc: 'วิธีแทนกราฟและจัดการกลุ่ม — ปูทางสู่สายอัลกอริทึมกราฟ',
            items: ['graph-repr', 'union-find'] },
        ],
      },
      {
        id: 'algo',
        icon: '⚙️',
        title: 'สาย Algorithm',
        subtitle: 'อัลกอริทึม — "ขั้นตอนการแก้ปัญหาอย่างมีประสิทธิภาพ"',
        levels: [
          { n: 1, title: 'การค้นหา',
            desc: 'จากค้นแบบเชิงเส้น สู่การตัดครึ่งและเทคนิคตัวชี้',
            items: ['linear-search', 'binary-search', 'jump-search', 'exp-search', 'interpolation-search', 'ternary-search', 'two-pointers', 'sliding-window'] },
          { n: 2, title: 'การเรียงลำดับพื้นฐาน',
            desc: 'อัลกอริทึมเรียง O(n²) ที่เข้าใจง่าย เห็นแนวคิดชัด',
            items: ['sorting-bubble', 'sorting-selection', 'sorting-insertion'] },
          { n: 3, title: 'การเรียงลำดับขั้นสูง & การเลือก',
            desc: 'เรียงแบบ O(n log n), เรียงแบบไม่เทียบ และการหาอันดับที่ k',
            items: ['sorting-merge', 'sorting-quick', 'heap-sort', 'counting-sort', 'radix-sort', 'bucket-sort', 'quickselect', 'median-of-medians'] },
          { n: 4, title: 'เทคนิคออกแบบอัลกอริทึม',
            desc: 'กระบวนทัศน์หลัก 4 แบบที่ใช้กับโจทย์ส่วนใหญ่',
            items: ['divide-conquer', 'greedy', 'dp', 'backtracking'] },
          { n: 5, title: 'Dynamic Programming ต่อยอด',
            desc: 'โจทย์ DP คลาสสิกที่ออกสัมภาษณ์บ่อย',
            items: ['knapsack', 'coin-change-dp', 'edit-distance', 'lis', 'matrix-chain', 'rod-cutting', 'optimal-bst', 'kadane'] },
          { n: 6, title: 'Greedy & Backtracking ต่อยอด',
            desc: 'การประยุกต์โลภและการลองย้อนกลับกับโจทย์จริง',
            items: ['activity-selection', 'huffman', 'permutations', 'maze-solver', 'sudoku', 'minimax'] },
          { n: 7, title: 'อัลกอริทึมกราฟ',
            desc: 'ต่อจากสาย Data Structure ระดับ 7 — ท่องกราฟ, เส้นทางสั้นสุด, MST, การไหล',
            items: ['bfs-dfs', 'topological-sort', 'dijkstra', 'bellman-ford', 'floyd-warshall', 'johnsons', 'mst', 'prim', 'scc', 'articulation', 'max-flow', 'bipartite-matching', 'astar'] },
          { n: 8, title: 'อัลกอริทึมสตริง',
            desc: 'การค้นหา pattern ในข้อความอย่างมีประสิทธิภาพ',
            items: ['string-algo', 'rabin-karp', 'z-algorithm', 'boyer-moore', 'suffix-array'] },
          { n: 9, title: 'คณิตศาสตร์ & ทฤษฎีจำนวน',
            desc: 'เลขฐานสอง, ตัวหารร่วม, เลขยกกำลังมอดุลาร์, จำนวนเฉพาะ',
            items: ['bit-manip', 'gcd', 'mod-exp', 'sieve', 'miller-rabin'] },
          { n: 10, title: 'เรขาคณิต & ทฤษฎีขั้นสูง',
            desc: 'เรขาคณิตเชิงคำนวณ, การคูณเมทริกซ์/พหุนามเร็ว, และขอบเขตความยาก',
            items: ['closest-pair', 'convex-hull', 'strassen', 'fft', 'simplex', 'vertex-cover', 'p-np'] },
        ],
      },
    ],
  };
})();
