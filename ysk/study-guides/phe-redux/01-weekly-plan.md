# PHE Redux: 6-Week Sprint Plan

## Overview

This is an accelerated path to master the 5 target problems that would have prepared you for the Byteboard interview.

**Timeline**: 6 weeks (full-time study pace)
**Goal**: Solve all 5 target problems confidently

---

## Week 1: Recursion (The Critical Gate)

> **Why first**: Every graph algorithm (DFS, BFS, Dijkstra) relies on recursive thinking. You cannot skip this.

### Daily Breakdown

| Day | Focus | Problems |
|-----|-------|----------|
| 1-2 | Base cases, recursive cases | Fibonacci, Factorial |
| 3-4 | Call stack visualization | Reverse string, Power function |
| 5-6 | Backtracking intro | Generate parentheses |
| 7 | Review + Subsets problem | Subsets |

### Key Resources
- [[dsa/03-recursion-basics\|Recursion Basics Guide]]

### Concepts to Master
- [ ] Base case identification
- [ ] Recursive case construction
- [ ] Call stack mental model
- [ ] Trust the recursion (don't trace every call)
- [ ] Backtracking = recursion + undo

### Practice Problems (LeetCode)
1. **509. Fibonacci Number** - Classic recursion
2. **206. Reverse Linked List** - Recursive approach
3. **22. Generate Parentheses** - Backtracking intro
4. **78. Subsets** - Subset generation

### Success Criteria
Can you write a recursive solution without tracing through every call? Can you identify base cases immediately?

---

## Week 2: Binary Trees

> **Why now**: Trees are "graphs with training wheels". Master tree recursion before tackling general graphs.

### Daily Breakdown

| Day | Focus | Problems |
|-----|-------|----------|
| 1-2 | Tree structure, traversals | Max depth, invert tree |
| 3-4 | Recursive tree patterns | Same tree, symmetric tree |
| 5-6 | Level-order traversal (BFS preview) | Binary tree level order |
| 7 | Review + diameter problem | Diameter of binary tree |

### Concepts to Master
- [ ] Tree node structure
- [ ] Pre-order, in-order, post-order traversal
- [ ] Level-order traversal (queue-based)
- [ ] Recursive tree height/depth
- [ ] Subtree problems

### Practice Problems (LeetCode)
1. **104. Maximum Depth of Binary Tree**
2. **226. Invert Binary Tree**
3. **100. Same Tree**
4. **102. Binary Tree Level Order Traversal** - BFS preview!
5. **543. Diameter of Binary Tree**

### Success Criteria
Can you write tree traversals recursively? Can you think about subtrees as subproblems?

---

## Week 3: Heaps/Priority Queues (Unlocks 2 Problems)

> **Why now**: Heaps are essential for Dijkstra and Top K problems. This week unlocks problems 347 and 973.

### Daily Breakdown

| Day | Focus | Problems |
|-----|-------|----------|
| 1-2 | Heap concept, heap property | Implement min-heap |
| 3 | JavaScript heap usage | Kth largest element |
| 4-5 | **TARGET PROBLEM** | 347. Top K Frequent Elements |
| 6 | **TARGET PROBLEM** | 973. K Closest Points to Origin |
| 7 | Review + merge K lists | Merge K Sorted Lists |

### Concepts to Master
- [ ] Min-heap vs max-heap
- [ ] Heap operations: insert, extract, heapify
- [ ] O(log n) insert, O(log n) extract
- [ ] Top K pattern: keep heap of size K
- [ ] Distance calculations (Euclidean, Haversine)

### Practice Problems (LeetCode)
1. **215. Kth Largest Element in an Array**
2. **347. Top K Frequent Elements** - TARGET
3. **973. K Closest Points to Origin** - TARGET
4. **23. Merge K Sorted Lists**

### Target Problems Unlocked
- [x] [[phe-redux/problems/347-top-k-frequent\|347. Top K Frequent Elements]]
- [x] [[phe-redux/problems/973-k-closest-points\|973. K Closest Points to Origin]]

### Success Criteria
Can you identify when a problem needs a heap? Can you implement Top K pattern?

---

## Week 4: Graph BFS

> **Why now**: BFS gives shortest paths in unweighted graphs. Foundation for meeting point problems.

### Daily Breakdown

| Day | Focus | Problems |
|-----|-------|----------|
| 1-2 | Graph representation, BFS basics | Number of islands |
| 3-4 | Shortest path in unweighted graph | Shortest path binary matrix |
| 5-6 | Multi-source BFS | Rotting oranges |
| 7 | Review + word ladder | Word ladder |

### Key Resources
- [[dsa/01-graph-fundamentals\|Graph Fundamentals]]
- [[dsa/02-graph-representation\|Graph Representation]]
- [[dsa/05-graph-traversal-bfs\|Graph Traversal - BFS]]

### Concepts to Master
- [ ] Adjacency list representation
- [ ] BFS with queue
- [ ] Visited set to avoid cycles
- [ ] Level-by-level processing
- [ ] Multi-source BFS (start from multiple nodes)

### Practice Problems (LeetCode)
1. **200. Number of Islands**
2. **1091. Shortest Path in Binary Matrix**
3. **994. Rotting Oranges** - Multi-source BFS!
4. **127. Word Ladder**

### Success Criteria
Can you write BFS from memory? Do you understand multi-source BFS?

---

## Week 5: Meeting Point Problems (Unlocks 2 Problems)

> **Why now**: These problems combine BFS with optimization. Directly relevant to the interview.

### Daily Breakdown

| Day | Focus | Problems |
|-----|-------|----------|
| 1-2 | Review multi-source BFS | Practice rotting oranges variants |
| 3-4 | **TARGET PROBLEM** | 317. Shortest Distance from All Buildings |
| 5-6 | **TARGET PROBLEM** | 296. Best Meeting Point |
| 7 | Review fairness concepts | Think about interview Task 3 |

### Concepts to Master
- [ ] Running BFS from every source
- [ ] Aggregating distances from multiple sources
- [ ] Median optimization for 1D meeting point
- [ ] "Fairness" = minimizing max distance deviation
- [ ] Pruning unreachable cells

### Practice Problems (LeetCode)
1. **286. Walls and Gates** - Warm up
2. **317. Shortest Distance from All Buildings** - TARGET (Premium)
3. **296. Best Meeting Point** - TARGET (Premium)

### Target Problems Unlocked
- [x] [[phe-redux/problems/317-shortest-distance-buildings\|317. Shortest Distance from All Buildings]]
- [x] [[phe-redux/problems/296-best-meeting-point\|296. Best Meeting Point]]

### Interview Connection
These problems directly map to **Task 3** of the Byteboard interview:
- Finding a midpoint for multiple users
- Balancing total distance vs fairness
- Handling arbitrary group sizes

### Success Criteria
Can you run BFS from multiple sources and aggregate results? Do you understand the median trick for 1D meeting points?

---

## Week 6: Dijkstra's Algorithm (Unlocks Final Problem)

> **Why now**: Dijkstra = BFS + Priority Queue. You now have both prerequisites.

### Daily Breakdown

| Day | Focus | Problems |
|-----|-------|----------|
| 1-2 | Dijkstra concept, implementation | Study algorithm |
| 3-4 | **TARGET PROBLEM** | 743. Network Delay Time |
| 5 | Dijkstra variant | Cheapest flights within K stops |
| 6-7 | Review all 5 problems | Full practice |

### Key Resources
- [[dsa/00-complete-dsa-path\|Complete DSA Path]] - Week 11 section

### Concepts to Master
- [ ] Why BFS doesn't work for weighted graphs
- [ ] Priority queue for "closest unvisited node"
- [ ] Relaxation: updating shorter paths
- [ ] Early termination when target reached
- [ ] Minimizing expensive operations (interview optimization)

### Practice Problems (LeetCode)
1. **743. Network Delay Time** - TARGET (This IS Dijkstra)
2. **787. Cheapest Flights Within K Stops**
3. **1334. Find the City With the Smallest Number of Neighbors**

### Target Problem Unlocked
- [x] [[phe-redux/problems/743-network-delay-time\|743. Network Delay Time]]

### Interview Connection
This problem directly maps to **Task 2** of the Byteboard interview:
- The `calculateEta` function uses shortest path (like `metroGraph.shortestPath`)
- Minimizing API calls = minimizing Dijkstra calls
- Heuristics: sort by straight-line distance first, prune far activities

### Success Criteria
Can you implement Dijkstra from memory? Can you explain why a priority queue is needed?

---

## Summary: What You'll Have After 6 Weeks

### Problems Solved
1. [x] 347. Top K Frequent Elements
2. [x] 973. K Closest Points to Origin
3. [x] 743. Network Delay Time
4. [x] 317. Shortest Distance from All Buildings
5. [x] 296. Best Meeting Point

### Concepts Mastered
- Recursion & Backtracking
- Binary Trees & Traversals
- Heaps & Priority Queues
- Graph Representation
- BFS (single and multi-source)
- Dijkstra's Algorithm

### Interview Readiness
- **Task 1**: Already ready (filtering)
- **Task 2**: Ready (Dijkstra + optimization)
- **Task 3**: Ready (multi-source BFS + fairness)

---

## Tracking Your Progress

Use this checklist in [[phe-redux/00-roadmap\|the main roadmap]] to track weekly completion.

### Quick Links
- [[dsa/00-complete-dsa-path\|Full DSA Curriculum]]
- [[dsa/00-index\|DSA Index]]
