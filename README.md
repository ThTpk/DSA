# DSA Visualizer 🧠

เว็บไซต์ให้ความรู้และเครื่องมือจำลองแบบโต้ตอบ (interactive visualization) สำหรับวิชา
**Data Structure & Algorithm** — เนื้อหาภาษาไทย ครอบคลุม **82 หัวข้อ** ตั้งแต่พื้นฐานจนถึงระดับเตรียมสัมภาษณ์

## ✨ จุดเด่น

- **82 หัวข้อ** จำลองการทำงานทีละขั้นตอน (เล่น / หยุด / เดิน / ถอย / ปรับความเร็ว / ใส่ข้อมูลเอง)
- เห็น **Call Stack** ของอัลกอริทึมที่เป็น recursive
- วาดด้วย **D3.js** ทั้งหมด · เนื้อหา **ภาษาไทย**
- **เปิดได้ทันทีด้วยการดับเบิลคลิก** `index.html` — ไม่ต้องติดตั้ง ไม่ต้องรัน server ไม่ต้องใช้อินเทอร์เน็ต (D3 เก็บไว้ในเครื่อง)

## 🚀 วิธีใช้

ดับเบิลคลิกเปิดไฟล์ `index.html` ในเบราว์เซอร์ แล้วเลือกหัวข้อจากหน้าแรกได้เลย

## 📚 เนื้อหา (8 หมวด)

| หมวด | หัวข้อ |
|------|--------|
| 0 · พื้นฐาน | Big-O, Recursion |
| 1 · เชิงเส้น | Array, Linked List, Stack, Queue, Hash Table (chaining/open addressing), Doubly/Circular List, Deque, Skip List, LRU Cache, Bloom Filter, Floyd's Cycle |
| 2 · ต้นไม้ | Binary Tree, BST, AVL, Red-Black, Heap, Trie, Segment Tree, Fenwick (BIT), Priority Queue |
| 3 · กราฟ | การแทนกราฟ, BFS/DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, MST (Kruskal/Prim), Union-Find, Topological Sort, SCC (Kosaraju), Articulation/Bridges |
| 4 · เรียงลำดับ | Bubble, Selection, Insertion, Merge, Quick, Heap, Counting, Radix, Bucket |
| 5 · ค้นหา | Linear, Binary, Jump, Interpolation, Exponential, Ternary, A* (pathfinding), Minimax/Alpha-Beta, Quickselect, Two Pointers, Sliding Window |
| 6 · ออกแบบอัลกอริทึม | Divide & Conquer, Greedy, Activity Selection, DP (LCS/Knapsack/Coin Change/Edit Distance/LIS/Matrix-Chain/Rod Cutting/Optimal BST), Backtracking (N-Queens/Sudoku/Maze/Permutations), Kadane, Huffman |
| 7 · ขั้นสูง | KMP, Rabin-Karp, Z-algorithm, Boyer-Moore, P/NP, Bit Manipulation, Sieve, Euclid GCD, Modular Exponentiation, Miller-Rabin, Convex Hull |

## 🧱 สถาปัตยกรรม

- **Vanilla HTML/CSS/JS + D3.js** (ไม่มี build step)
- รูปแบบ **Stepper + VizPlayer** — อัลกอริทึมบันทึก "ขั้นตอน" แล้วเครื่องเล่นกลางเล่นซ้ำ ทำให้ปุ่มควบคุมเหมือนกันทุกหน้า
- มี core ใช้ซ้ำ 5 ตัว: `SortViz` · `SearchViz` · `TreeViz` · `NodeViz` · `GraphViz`
- เพิ่มหัวข้อใหม่ = สร้างโฟลเดอร์ใน `topics/` (1 หัวข้อ = `index.html` + `viz.js`)

```
index.html              หน้าแรก + แผนผังหลักสูตร
assets/
  css/                  ธีม · โครงหน้า · สไตล์ viz
  js/core/              VizPlayer, Stepper, SortViz, SearchViz, TreeViz, NodeViz, GraphViz
  js/data/topics.js     รายการหัวข้อทั้งหมด (สร้างเมนูอัตโนมัติ)
  js/lib/d3.v7.min.js   D3 (เก็บในเครื่อง)
topics/<หัวข้อ>/        index.html + viz.js
```
