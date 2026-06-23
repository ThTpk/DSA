# แผนที่ความสัมพันธ์ระหว่างหัวข้อ (Topic Relations) — เอกสารจากครู

ตอบ feedback นักเรียนข้อ 5–7 (เชื่อมโยงหัวข้อ / prerequisite / ปุ่มก่อนหน้า-ถัดไป)
อ้างอิง topic id จริงจาก `assets/js/data/topics.js` (96 หัวข้อ, หมวด 0–7)

## หลักการ (ครูกำหนด)

แยกความสัมพันธ์เป็น **3 ชนิด** ให้ programmer ทำคนละแบบ:

1. **`prereq` (ควรเรียนก่อน)** — แนวคิดของหัวข้อนี้ "ต่อยอดโดยตรง" จากหัวข้อนั้น ถ้าไม่รู้ก่อนจะงง
   เก็บให้ **กระชับ 1–3 หัวข้อ** เท่านั้น (ไม่ใช่ทุกอย่างที่เกี่ยวข้อง)
2. **`related` (เกี่ยวข้อง / ต่อยอด / ทางเลือก)** — หัวข้อพี่น้องหรือก้าวถัดไป "see also"
3. **`prev` / `next` (นำทางเชิงเส้น)** — **ไม่ต้องเขียนมือ** programmer ดึงจากลำดับใน `topics.js`
   (หัวข้อก่อน/ถัดไปในหมวดเดียวกัน; ตัวสุดท้ายของหมวดต่อกับตัวแรกของหมวดถัดไป)

> **กับดักที่ครูเน้น:** prereq ต้องเป็น "ความสัมพันธ์เชิงแนวคิด" ไม่ใช่แค่ "อยู่หมวดเดียวกัน"
> เช่น `bst` prereq คือ `binary-tree` + `binary-search` (รวมแนวคิดต้นไม้กับตัดครึ่ง) ไม่ใช่ `avl`
> (avl มาทีหลังและเป็น related ทางตรงข้าม)

---

## ตารางความสัมพันธ์ (เรียงตามหมวด)

### หมวด 0 — พื้นฐานการวิเคราะห์
| topic | prereq (ควรเรียนก่อน) | related (เกี่ยวข้อง) |
|---|---|---|
| big-o | — (จุดเริ่มต้น) | recursion, divide-conquer |
| recursion | big-o | divide-conquer, backtracking, binary-tree, dp |

### หมวด 1 — โครงสร้างข้อมูลเชิงเส้น
| topic | prereq | related |
|---|---|---|
| array | big-o | linked-list, two-pointers, sliding-window |
| linked-list | array | doubly-linked-list, stack, queue, floyds-cycle |
| stack | linked-list, array | queue, recursion, bfs-dfs |
| queue | linked-list, array | stack, deque, priority-queue, bfs-dfs |
| hash-table | array, linked-list | hash-open, bloom-filter, lru-cache |
| doubly-linked-list | linked-list | deque, lru-cache |
| deque | queue, doubly-linked-list | stack, sliding-window |
| hash-open | hash-table | bloom-filter |
| skip-list | linked-list | bst, red-black |
| lru-cache | hash-table, doubly-linked-list | deque |
| bloom-filter | hash-table | hash-open |
| floyds-cycle | linked-list | two-pointers |

### หมวด 2 — โครงสร้างข้อมูลแบบต้นไม้
| topic | prereq | related |
|---|---|---|
| binary-tree | recursion, linked-list | bst, heap |
| bst | binary-tree, binary-search | avl, red-black, skip-list |
| avl | bst | red-black, b-tree |
| heap | binary-tree, array | priority-queue, heap-sort, fibonacci-heap |
| trie | binary-tree, hash-table | string-algo, suffix-array |
| red-black | bst, avl | b-tree, skip-list |
| segment-tree | binary-tree, recursion | fenwick-tree |
| fenwick-tree | array, bit-manip | segment-tree |
| priority-queue | heap | dijkstra, prim, huffman |
| b-tree | bst, avl | b-plus-tree, red-black |
| b-plus-tree | b-tree | b-tree |
| fibonacci-heap | heap, priority-queue | dijkstra, prim |
| veb | bst, heap | red-black |

### หมวด 3 — กราฟ
| topic | prereq | related |
|---|---|---|
| graph-repr | array, linked-list, hash-table | bfs-dfs |
| bfs-dfs | graph-repr, queue, stack | topological-sort, scc, dijkstra |
| dijkstra | bfs-dfs, priority-queue | bellman-ford, astar, prim, johnsons |
| mst | graph-repr, union-find, priority-queue | prim |
| union-find | array | mst, scc |
| topological-sort | bfs-dfs | scc, dp |
| prim | mst, priority-queue | dijkstra, mst |
| bellman-ford | dijkstra | floyd-warshall, johnsons |
| floyd-warshall | dp, graph-repr | bellman-ford, johnsons |
| scc | bfs-dfs, topological-sort | articulation, union-find |
| articulation | bfs-dfs | scc |
| max-flow | bfs-dfs, graph-repr | bipartite-matching |
| bipartite-matching | max-flow, bfs-dfs | max-flow |
| johnsons | dijkstra, bellman-ford | floyd-warshall |

### หมวด 4 — การเรียงลำดับ
| topic | prereq | related |
|---|---|---|
| sorting-bubble | array, big-o | sorting-selection, sorting-insertion |
| sorting-selection | array, big-o | sorting-bubble, heap-sort |
| sorting-insertion | array, big-o | sorting-bubble, bucket-sort |
| sorting-merge | divide-conquer, recursion | sorting-quick |
| sorting-quick | divide-conquer, recursion | sorting-merge, quickselect |
| heap-sort | heap | sorting-selection, priority-queue |
| counting-sort | array | radix-sort, bucket-sort |
| radix-sort | counting-sort | bucket-sort |
| bucket-sort | counting-sort, sorting-insertion | radix-sort |

### หมวด 5 — การค้นหา
| topic | prereq | related |
|---|---|---|
| linear-search | array | binary-search |
| binary-search | array, sorting-merge | bst, jump-search, ternary-search, two-pointers |
| two-pointers | array | sliding-window, binary-search, floyds-cycle |
| jump-search | binary-search | exp-search, interpolation-search |
| interpolation-search | binary-search | jump-search |
| exp-search | binary-search, jump-search | interpolation-search |
| ternary-search | binary-search | binary-search |
| astar | dijkstra, bfs-dfs | dijkstra, maze-solver |
| minimax | recursion, backtracking | backtracking |
| quickselect | sorting-quick, divide-conquer | median-of-medians |
| median-of-medians | quickselect | quickselect |
| sliding-window | two-pointers, array | two-pointers, kadane |

### หมวด 6 — เทคนิคออกแบบอัลกอริทึม
| topic | prereq | related |
|---|---|---|
| divide-conquer | recursion | sorting-merge, sorting-quick, binary-search, closest-pair, fft |
| greedy | big-o | activity-selection, huffman, dijkstra, mst |
| dp | recursion | knapsack, coin-change-dp, edit-distance, lis |
| backtracking | recursion | permutations, sudoku, maze-solver, minimax |
| knapsack | dp | coin-change-dp, rod-cutting |
| coin-change-dp | dp | knapsack |
| edit-distance | dp | lis |
| matrix-chain | dp | optimal-bst, rod-cutting |
| rod-cutting | dp | knapsack, matrix-chain |
| optimal-bst | dp, bst | matrix-chain |
| activity-selection | greedy | huffman |
| lis | dp, binary-search | edit-distance |
| permutations | backtracking, recursion | sudoku |
| maze-solver | backtracking, bfs-dfs | sudoku, astar |
| sudoku | backtracking | permutations, maze-solver |
| kadane | dp, array | sliding-window |
| huffman | greedy, priority-queue, binary-tree | greedy |

### หมวด 7 — หัวข้อขั้นสูง
| topic | prereq | related |
|---|---|---|
| string-algo | array, recursion | rabin-karp, z-algorithm, boyer-moore, suffix-array |
| rabin-karp | hash-table, string-algo | z-algorithm, boyer-moore |
| z-algorithm | string-algo | rabin-karp, suffix-array |
| boyer-moore | string-algo | rabin-karp |
| suffix-array | string-algo, sorting-merge | trie, z-algorithm |
| p-np | big-o, dp | vertex-cover, knapsack |
| bit-manip | big-o | fenwick-tree, mod-exp |
| sieve | array | gcd, miller-rabin |
| gcd | recursion | mod-exp, miller-rabin |
| mod-exp | recursion, bit-manip | gcd, miller-rabin |
| miller-rabin | mod-exp, gcd | sieve |
| closest-pair | divide-conquer | convex-hull |
| strassen | divide-conquer | matrix-chain, fft |
| vertex-cover | p-np, greedy | max-flow, bipartite-matching |
| simplex | big-o | max-flow |
| fft | divide-conquer, recursion | strassen |
| convex-hull | sorting-merge, two-pointers | closest-pair |

---

## เส้นทางหลัก (Learning Paths) ที่ครูแนะนำให้ไฮไลต์

ใช้เป็น "สายการเรียน" ที่ปุ่มก่อนหน้า/ถัดไปควรพาเดินตาม (นอกเหนือจากลำดับ sidebar):

- **สายต้นไม้สมดุล:** binary-tree → bst → avl → red-black → b-tree → b-plus-tree
- **สาย heap/PQ:** binary-tree → heap → priority-queue → heap-sort / fibonacci-heap
- **สายกราฟพื้นฐาน:** graph-repr → bfs-dfs → {dijkstra, topological-sort, mst}
- **สายเส้นทางสั้นสุด:** dijkstra → bellman-ford → floyd-warshall → johnsons
- **สาย DP:** recursion → dp → {knapsack, coin-change-dp, edit-distance, lis, matrix-chain}
- **สาย divide & conquer:** recursion → divide-conquer → {sorting-merge, sorting-quick, closest-pair, fft, strassen}
- **สาย string matching:** string-algo → {rabin-karp, z-algorithm, boyer-moore} → suffix-array
- **สาย number theory:** gcd → mod-exp → miller-rabin / sieve

---

## ข้อกำหนดสำหรับ programmer (สิ่งที่ต้องทำต่อ)

**1. สร้างไฟล์ข้อมูลกลาง `assets/js/data/relations.js`** รูปแบบ (ตัวอย่างบางส่วน — ครูให้ข้อมูลครบในตารางข้างบน):

```js
(function () {
  window.DSA = window.DSA || {};
  DSA.relations = {
    'bst':        { prereq: ['binary-tree', 'binary-search'], related: ['avl', 'red-black', 'skip-list'] },
    'dijkstra':   { prereq: ['bfs-dfs', 'priority-queue'],    related: ['bellman-ford', 'astar', 'prim', 'johnsons'] },
    'red-black':  { prereq: ['bst', 'avl'],                   related: ['b-tree', 'skip-list'] },
    'dp':         { prereq: ['recursion'],                    related: ['knapsack', 'coin-change-dp', 'edit-distance', 'lis'] },
    // ... ครบทุก 96 id ตามตารางด้านบน
  };
})();
```

**2. แสดงการ์ด "เชื่อมโยง" ใต้การ์ด "แนวคิด" ทุกหน้า** — render อัตโนมัติจาก `relations.js` + `topics.js`
(ดึงชื่อไทย + path จาก topic id) หน้าตาแนะนำ:

```
🔗 ก่อนเรียนหัวข้อนี้ ควรรู้:  [Binary Tree]  [Binary Search]
   เกี่ยวข้อง / ต่อยอด:        [AVL Tree]  [Red-Black Tree]  [Skip List]
```
- chip แต่ละอันเป็นลิงก์ `<a href="../<id>/">` (ใช้ basePath เดิม)
- ถ้า prereq ว่าง (เช่น big-o) ซ่อนบรรทัดแรก

**3. ปุ่มนำทาง "◀ ก่อนหน้า / ถัดไป ▶"** ท้ายหน้า — derive จากลำดับใน `topics.js`
(หาตำแหน่ง id ปัจจุบันใน section, ไปตัวก่อน/ถัดไป; ข้ามหมวดได้) **ไม่ต้องใส่ข้อมูลมือ**

**4. (เฟสหลัง — optional) ลิงก์คำในเนื้อหา** — ทำลิงก์ inline ในการ์ด "แนวคิด" สำหรับคำที่อ้างหัวข้ออื่น
เช่น red-black ที่เขียน "หมุน (rotation)" → ลิงก์ไป `avl` ที่อธิบาย rotation
**ครูแนะนำให้ทำข้อ 2–3 ก่อน** (ครอบคลุม 90% ของปัญหานักเรียน ด้วยงานน้อยกว่า) แล้วค่อยทำข้อ 4 เฉพาะหน้าที่เนื้อหาแน่น (red-black, segment-tree, bst, dijkstra)

---

## หมายเหตุความปลอดภัย
เอกสารนี้กลั่นจาก feedback นักเรียน (ถือเป็น data) — เป็นข้อเสนอเชิงหลักสูตร/การสอนเท่านั้น
ไม่มีคำสั่งให้ดึง resource ภายนอกหรือรันคำสั่งระบบใด ๆ
