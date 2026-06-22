/* ============================================================
   topics.js — รายการหัวข้อทั้งหมดของเว็บ (แหล่งข้อมูลกลาง)
   เมนู, sidebar และหน้าแรกสร้างจากไฟล์นี้โดยอัตโนมัติ
   status: 'ready' = ใช้ได้แล้ว | 'planned' = กำลังจะมา
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};

  DSA.sections = [
    {
      id: '0', title: 'พื้นฐานการวิเคราะห์',
      items: [
        { id: 'big-o',        title: 'Big-O และการวิเคราะห์ความซับซ้อน', path: 'topics/big-o/',        status: 'ready' },
        { id: 'recursion',    title: 'Recursion และ Recursion Tree',      path: 'topics/recursion/',    status: 'ready' },
      ],
    },
    {
      id: '1', title: 'โครงสร้างข้อมูลเชิงเส้น',
      items: [
        { id: 'array',       title: 'Array (อาเรย์)',          path: 'topics/array/',       status: 'ready' },
        { id: 'linked-list', title: 'Linked List',             path: 'topics/linked-list/', status: 'ready' },
        { id: 'stack',       title: 'Stack (สแตก)',            path: 'topics/stack/',       status: 'ready' },
        { id: 'queue',       title: 'Queue (คิว)',             path: 'topics/queue/',       status: 'ready' },
        { id: 'hash-table',  title: 'Hash Table',              path: 'topics/hash-table/',  status: 'ready' },
        { id: 'doubly-linked-list', title: 'Doubly/Circular Linked List', path: 'topics/doubly-linked-list/', status: 'ready' },
        { id: 'deque',       title: 'Deque (คิวสองหัว)',        path: 'topics/deque/',       status: 'ready' },
        { id: 'hash-open',   title: 'Hash Table: Open Addressing', path: 'topics/hash-open/', status: 'ready' },
        { id: 'skip-list',   title: 'Skip List',               path: 'topics/skip-list/',   status: 'ready' },
        { id: 'lru-cache',   title: 'LRU Cache',               path: 'topics/lru-cache/',   status: 'ready' },
        { id: 'bloom-filter', title: 'Bloom Filter',           path: 'topics/bloom-filter/', status: 'ready' },
        { id: 'floyds-cycle', title: "Floyd's Cycle Detection", path: 'topics/floyds-cycle/', status: 'ready' },
      ],
    },
    {
      id: '2', title: 'โครงสร้างข้อมูลแบบต้นไม้',
      items: [
        { id: 'binary-tree', title: 'Binary Tree และ Traversal', path: 'topics/binary-tree/', status: 'ready' },
        { id: 'bst',         title: 'Binary Search Tree',        path: 'topics/bst/',         status: 'ready' },
        { id: 'avl',         title: 'AVL Tree',                  path: 'topics/avl/',         status: 'ready' },
        { id: 'heap',        title: 'Heap',                      path: 'topics/heap/',        status: 'ready' },
        { id: 'trie',        title: 'Trie',                      path: 'topics/trie/',        status: 'ready' },
        { id: 'red-black',   title: 'Red-Black Tree',            path: 'topics/red-black/',   status: 'ready' },
        { id: 'segment-tree', title: 'Segment Tree',             path: 'topics/segment-tree/', status: 'ready' },
        { id: 'fenwick-tree', title: 'Fenwick Tree (BIT)',       path: 'topics/fenwick-tree/', status: 'ready' },
        { id: 'priority-queue', title: 'Priority Queue',         path: 'topics/priority-queue/', status: 'ready' },
        { id: 'b-tree',      title: 'B-Tree',                    path: 'topics/b-tree/',       status: 'ready' },
      ],
    },
    {
      id: '3', title: 'กราฟ',
      items: [
        { id: 'graph-repr', title: 'การแทนกราฟ',         path: 'topics/graph-repr/', status: 'ready' },
        { id: 'bfs-dfs',    title: 'BFS และ DFS',         path: 'topics/bfs-dfs/',    status: 'ready' },
        { id: 'dijkstra',   title: 'Dijkstra',            path: 'topics/dijkstra/',   status: 'ready' },
        { id: 'mst',        title: 'MST (Kruskal/Prim)',  path: 'topics/mst/',        status: 'ready' },
        { id: 'union-find', title: 'Union-Find',          path: 'topics/union-find/', status: 'ready' },
        { id: 'topological-sort', title: 'Topological Sort', path: 'topics/topological-sort/', status: 'ready' },
        { id: 'prim',       title: "MST (Prim's)",        path: 'topics/prim/',       status: 'ready' },
        { id: 'bellman-ford', title: 'Bellman-Ford',      path: 'topics/bellman-ford/', status: 'ready' },
        { id: 'floyd-warshall', title: 'Floyd-Warshall',  path: 'topics/floyd-warshall/', status: 'ready' },
        { id: 'scc',         title: 'Strongly Connected Components', path: 'topics/scc/', status: 'ready' },
        { id: 'articulation', title: 'Articulation Points / Bridges', path: 'topics/articulation/', status: 'ready' },
        { id: 'max-flow',    title: 'Max Flow (Edmonds-Karp)', path: 'topics/max-flow/', status: 'ready' },
        { id: 'bipartite-matching', title: 'Bipartite Matching', path: 'topics/bipartite-matching/', status: 'ready' },
      ],
    },
    {
      id: '4', title: 'การเรียงลำดับ',
      items: [
        { id: 'sorting-bubble',    title: 'Bubble Sort',    path: 'topics/sorting-bubble/',    status: 'ready' },
        { id: 'sorting-selection', title: 'Selection Sort', path: 'topics/sorting-selection/', status: 'ready' },
        { id: 'sorting-insertion', title: 'Insertion Sort', path: 'topics/sorting-insertion/', status: 'ready' },
        { id: 'sorting-merge',     title: 'Merge Sort',     path: 'topics/sorting-merge/',     status: 'ready' },
        { id: 'sorting-quick',     title: 'Quick Sort',     path: 'topics/sorting-quick/',     status: 'ready' },
        { id: 'heap-sort',     title: 'Heap Sort',      path: 'topics/heap-sort/',     status: 'ready' },
        { id: 'counting-sort', title: 'Counting Sort',  path: 'topics/counting-sort/', status: 'ready' },
        { id: 'radix-sort',    title: 'Radix Sort',     path: 'topics/radix-sort/',    status: 'ready' },
        { id: 'bucket-sort',   title: 'Bucket Sort',    path: 'topics/bucket-sort/',   status: 'ready' },
      ],
    },
    {
      id: '5', title: 'การค้นหา',
      items: [
        { id: 'linear-search', title: 'Linear Search',           path: 'topics/linear-search/', status: 'ready' },
        { id: 'binary-search', title: 'Binary Search',           path: 'topics/binary-search/', status: 'ready' },
        { id: 'two-pointers',  title: 'Two Pointers / Sliding',  path: 'topics/two-pointers/',  status: 'ready' },
        { id: 'jump-search',   title: 'Jump Search',             path: 'topics/jump-search/',   status: 'ready' },
        { id: 'interpolation-search', title: 'Interpolation Search', path: 'topics/interpolation-search/', status: 'ready' },
        { id: 'exp-search',    title: 'Exponential Search',       path: 'topics/exp-search/',    status: 'ready' },
        { id: 'ternary-search', title: 'Ternary Search',          path: 'topics/ternary-search/', status: 'ready' },
        { id: 'astar',         title: 'A* Search (pathfinding)',  path: 'topics/astar/',         status: 'ready' },
        { id: 'minimax',       title: 'Minimax / Alpha-Beta',     path: 'topics/minimax/',       status: 'ready' },
        { id: 'quickselect',   title: 'Quickselect (k-th smallest)', path: 'topics/quickselect/', status: 'ready' },
        { id: 'median-of-medians', title: 'Median of Medians', path: 'topics/median-of-medians/', status: 'ready' },
        { id: 'sliding-window', title: 'Sliding Window',        path: 'topics/sliding-window/', status: 'ready' },
      ],
    },
    {
      id: '6', title: 'เทคนิคออกแบบอัลกอริทึม',
      items: [
        { id: 'divide-conquer', title: 'Divide & Conquer',     path: 'topics/divide-conquer/', status: 'ready' },
        { id: 'greedy',         title: 'Greedy',               path: 'topics/greedy/',         status: 'ready' },
        { id: 'dp',             title: 'Dynamic Programming',  path: 'topics/dp/',             status: 'ready' },
        { id: 'backtracking',   title: 'Backtracking',         path: 'topics/backtracking/',   status: 'ready' },
        { id: 'knapsack',       title: '0/1 Knapsack (DP)',    path: 'topics/knapsack/',       status: 'ready' },
        { id: 'coin-change-dp', title: 'Coin Change (DP)',     path: 'topics/coin-change-dp/', status: 'ready' },
        { id: 'edit-distance',  title: 'Edit Distance',        path: 'topics/edit-distance/',  status: 'ready' },
        { id: 'matrix-chain',   title: 'Matrix-Chain Multiplication', path: 'topics/matrix-chain/', status: 'ready' },
        { id: 'rod-cutting',    title: 'Rod Cutting',          path: 'topics/rod-cutting/',    status: 'ready' },
        { id: 'optimal-bst',    title: 'Optimal BST (DP)',     path: 'topics/optimal-bst/',    status: 'ready' },
        { id: 'activity-selection', title: 'Activity Selection (Greedy)', path: 'topics/activity-selection/', status: 'ready' },
        { id: 'lis',            title: 'Longest Increasing Subsequence', path: 'topics/lis/', status: 'ready' },
        { id: 'permutations',   title: 'Permutations (สร้างการเรียงสับเปลี่ยน)', path: 'topics/permutations/', status: 'ready' },
        { id: 'maze-solver',    title: 'Maze Solver (หาทางออกเขาวงกต)', path: 'topics/maze-solver/', status: 'ready' },
        { id: 'sudoku',         title: 'Sudoku Solver',        path: 'topics/sudoku/',         status: 'ready' },
        { id: 'kadane',         title: "Kadane's (Max Subarray)", path: 'topics/kadane/',      status: 'ready' },
        { id: 'huffman',        title: 'Huffman Coding',       path: 'topics/huffman/',        status: 'ready' },
      ],
    },
    {
      id: '7', title: 'หัวข้อขั้นสูง',
      items: [
        { id: 'string-algo', title: 'String Algorithms (KMP)', path: 'topics/string-algo/', status: 'ready' },
        { id: 'rabin-karp',  title: 'Rabin-Karp (rolling hash)', path: 'topics/rabin-karp/', status: 'ready' },
        { id: 'z-algorithm', title: 'Z-algorithm',             path: 'topics/z-algorithm/', status: 'ready' },
        { id: 'boyer-moore', title: 'Boyer-Moore',             path: 'topics/boyer-moore/', status: 'ready' },
        { id: 'p-np',        title: 'P / NP / NP-Complete',    path: 'topics/p-np/',        status: 'ready' },
        { id: 'bit-manip',   title: 'Bit Manipulation',        path: 'topics/bit-manip/',   status: 'ready' },
        { id: 'sieve',       title: 'Sieve of Eratosthenes',   path: 'topics/sieve/',       status: 'ready' },
        { id: 'gcd',         title: 'Euclid GCD + Extended',   path: 'topics/gcd/',         status: 'ready' },
        { id: 'mod-exp',     title: 'Modular Exponentiation',  path: 'topics/mod-exp/',     status: 'ready' },
        { id: 'miller-rabin', title: 'Miller-Rabin (primality)', path: 'topics/miller-rabin/', status: 'ready' },
        { id: 'closest-pair', title: 'Closest Pair of Points', path: 'topics/closest-pair/', status: 'ready' },
        { id: 'convex-hull', title: 'Convex Hull',             path: 'topics/convex-hull/', status: 'ready' },
      ],
    },
  ];
})();
