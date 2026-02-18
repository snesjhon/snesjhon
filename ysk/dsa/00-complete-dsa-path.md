# Complete DSA Learning Path: Novice → Expert

> 📌 **Part of the [Master Interview Preparation Guide](../interview-prep/00-master-interview-guide.md)**
>
> This is the **DSA-focused** component of your interview prep. For the complete picture including System Design, Behavioral prep, and job search strategy, see the [Master Guide](../interview-prep/00-master-interview-guide.md).

---

## Philosophy

This curriculum is designed with **pedagogical progression** in mind:

- **Early topics** build problem-solving intuition with simpler structures
- **Middle topics** introduce algorithmic thinking and complexity
- **Late topics** combine everything into advanced problem-solving

Each phase has a purpose beyond just "learning a data structure."

---

## ⏱️ Timeline Assumptions

**Integrated Study Approach**: This DSA path is meant to be studied alongside [System Design](../system-design/00-complete-system-design-path.md).

**Time Allocation**:

- **Full-time**: 18-24 hours/week on DSA (60% of total study time)
- **Part-time**: 9-12 hours/week on DSA (60% of total study time)
- **Remaining time**: Dedicated to System Design study

The timelines below assume:

- ✅ You're following the integrated schedule in the [Master Interview Guide](../interview-prep/00-master-interview-guide.md)
- ✅ You're studying both DSA and System Design in parallel from Week 1
- ⚠️ Complex topics (recursion, DP, graphs) need processing time regardless of hours spent
- 💡 Quality practice > raw hours. Focus on understanding patterns deeply.

---

## 🌱 Phase 1: Novice (3-5 weeks)

**Goal**: Build foundational problem-solving intuition with linear structures.

**Timeline at full-time pace**:

- Simple topics (arrays, hash maps, two pointers): 2-4 days each
- Complex topics (recursion, backtracking): 1-2 weeks
- Total: 3-5 weeks (vs 8-12 weeks part-time)

### Why Start Here?

- Arrays/strings are intuitive (you can visualize them)
- Teaches loop thinking and index manipulation
- Low cognitive overhead - focus on _problem-solving_ not _data structure complexity_
- Builds confidence with early wins

---

### Days 1-4: Arrays & Strings

**Duration**: 3-5 days (full-time)

**What You Learn**:

- Index manipulation
- Iteration patterns (forward, backward, both)
- In-place modifications
- String immutability handling

**Key Problems**:

- [x] [125. Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- [x] [238. Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/)
- [ ] [36. Valid Sudoku](https://leetcode.com/problems/valid-sudoku/)
- [ ] [271. Encode and Decode Strings](https://leetcode.com/problems/encode-and-decode-strings/) *(Premium)*

*Additional Problems:*

- [x] Reverse array
- [x] [26. Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)
- [x] [88. Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/)

**Why First**: Most fundamental structure. You need comfort here before anything else.

---

### Days 5-7: Hash Maps & Hash Sets

**Duration**: 2-3 days (full-time)

**What You Learn**:

- O(1) lookup power
- Trading space for time
- Frequency counting patterns
- Fast duplicate detection

**Key Problems**:

- [x] [1. Two Sum](https://leetcode.com/problems/two-sum/)
- [x] [217. Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)
- [x] [242. Valid Anagram](https://leetcode.com/problems/valid-anagram/)
- [ ] [49. Group Anagrams](https://leetcode.com/problems/group-anagrams/)
- [ ] [128. Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/)

*Additional Problems:*

- [x] [387. First Unique Character in a String](https://leetcode.com/problems/first-unique-character-in-a-string/)

**Why Now**: Essential tool you'll use EVERYWHERE. Learn it early so it's second nature.

---

### Days 8-10: Two Pointers

**Duration**: 2-3 days (full-time)

**What You Learn**:

- Multiple iteration variables
- Converging/diverging patterns
- In-place array manipulation
- Optimization thinking

**Key Problems**:

- [x] [11. Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- [x] [15. 3Sum](https://leetcode.com/problems/3sum/)
- [ ] [167. Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
- [ ] [42. Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)

*Additional Problems:*

- [x] [27. Remove Element](https://leetcode.com/problems/remove-element/)
- [x] [75. Sort Colors](https://leetcode.com/problems/sort-colors/)
- This one still stumped me initially, I had to resort to visual guide, but I mostly go it, will come back

**Why Now**: First real "technique" - teaches you that problems have patterns beyond brute force.

---

### Days 11-14: Sliding Window

**Duration**: 3-4 days (full-time)

**What You Learn**:

- Window state management
- Expand/contract logic
- Optimization of brute force
- Substring/subarray patterns

**Key Problems**:

- [x] [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
- [x] [567. Permutation in String](https://leetcode.com/problems/permutation-in-string/)
- [x] [76. Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)
- [ ] [121. Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)
- [ ] [424. Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/)
- [ ] [239. Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/)

*Additional Problems:*

- [x] Max sum subarray of size K

**Why Now**: Natural extension of two pointers. Solidifies the idea that technique matters.

---

### Days 15-18: Linked Lists

**Duration**: 3-4 days (full-time)

**What You Learn**:

- Pointer manipulation
- Node-based thinking
- Reference vs value
- Edge case handling (null checks)

**Key Problems**:

- [x] [206. Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/)
- [x] [21. Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)
- [x] [141. Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)
- [x] [19. Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)
- [ ] [143. Reorder List](https://leetcode.com/problems/reorder-list/)
- [ ] [138. Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/)
- [ ] [2. Add Two Numbers](https://leetcode.com/problems/add-two-numbers/)
- [ ] [287. Find the Duplicate Number](https://leetcode.com/problems/find-the-duplicate-number/)
- [ ] [146. LRU Cache](https://leetcode.com/problems/lru-cache/)
- [ ] [25. Reverse Nodes in K-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/)

**Why Now**: First non-array structure. Teaches pointer thinking which is crucial for trees/graphs later.

---

### Days 19-21: Stack & Queue

**Duration**: 2-3 days (full-time)

**What You Learn**:

- LIFO vs FIFO thinking
- When order matters
- Auxiliary data structures
- Pairing/matching problems

**Key Problems**:

- [x] [20. Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)
- [x] [155. Min Stack](https://leetcode.com/problems/min-stack/)
- [x] [739. Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
- [ ] [150. Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/)
- [ ] [853. Car Fleet](https://leetcode.com/problems/car-fleet/)
- [ ] [84. Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/)

*Additional Problems:*

- [x] [232. Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/)

**Why Now**: These patterns appear everywhere. Also critical for understanding recursion call stack.

---

### Week 4-5: Recursion & Backtracking Intro

**Duration**: 1-2 weeks (full-time) - Don't rush this!

**What You Learn**:

- Breaking problems into subproblems
- Base case thinking
- Call stack mental model
- Trust the recursion

**Key Problems**:

- [x] [22. Generate Parentheses](https://leetcode.com/problems/generate-parentheses/)
- [x] [78. Subsets](https://leetcode.com/problems/subsets/)

*Additional Problems:*

- [x] [509. Fibonacci Number](https://leetcode.com/problems/fibonacci-number/)
- [x] Factorial
- [x] [344. Reverse String](https://leetcode.com/problems/reverse-string/)

**Why Now**: CRITICAL checkpoint. You cannot progress without recursion. Take your time here.

---

### Days 22-26: Binary Search

**Duration**: 4-5 days (full-time)

**What You Learn**:

- Divide and conquer thinking
- Search space reduction
- Template-based problem solving
- Log(n) complexity benefits

**Key Problems**:

- [x] [704. Binary Search](https://leetcode.com/problems/binary-search/) - Classic implementation
- [x] [74. Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix/) - Treat as flattened sorted array
- [x] [875. Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/) - Minimize eating speed
- [x] [153. Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) - No duplicates
- [ ] [33. Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) - Target search
- [ ] [981. Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store/)
- [ ] [4. Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/)

*Additional Problems:*

- [x] [35. Search Insert Position](https://leetcode.com/problems/search-insert-position/) - Understanding boundaries
- [ ] [278. First Bad Version](https://leetcode.com/problems/first-bad-version/) - Pattern variation
- [ ] [34. Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) - Finding range boundaries
- [ ] [69. Sqrt(x)](https://leetcode.com/problems/sqrtx/) - Search for square root
- [ ] [162. Find Peak Element](https://leetcode.com/problems/find-peak-element/) - Binary search on unsorted array
- [ ] [374. Guess Number Higher or Lower](https://leetcode.com/problems/guess-number-higher-or-lower/) - Interactive binary search

**Why Now**: First logarithmic algorithm. Introduces the idea that clever algorithms beat brute force.

---

## 🎓 Checkpoint: Novice → Studied

**You should now be able to**:
✅ Solve easy problems confidently (70%+ success rate)
✅ Recognize when to use hash map vs two pointers vs sliding window
✅ Write recursive solutions
✅ Understand time/space complexity
✅ Think about optimization

**Time invested**: 3-5 weeks of full-time study (42-49 hours/week)

---

## 📚 Phase 2: Studied (5-8 weeks)

**Goal**: Master hierarchical structures and graph algorithms. Develop pattern recognition.

**Timeline at full-time pace**:

- Trees/Heaps: 1-2 weeks total
- Graphs: 2-3 weeks (most important section)
- Backtracking: 1 week
- Dynamic Programming: 2-3 weeks (needs time to sink in)
- Total: 5-8 weeks (vs 12-16 weeks part-time)

### Why This Phase?

- Trees introduce hierarchical thinking (prerequisite for graphs)
- Graphs are the most complex structure - need strong foundation first
- Dynamic programming requires seeing overlapping subproblems
- You now have the tools (recursion, hash maps, etc.) to handle complexity

---

### Week 6: Binary Trees

**Duration**: 4-6 days (full-time)

**What You Learn**:

- Hierarchical data structures
- Tree traversals (pre/in/post-order)
- Recursive tree thinking
- Level-order traversal (BFS intro)

**Key Problems**:

- [x] [226. Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/)
- [x] [104. Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/)
- [x] [543. Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/)
- [x] [100. Same Tree](https://leetcode.com/problems/same-tree/)
- [ ] [110. Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/)
- [ ] [572. Subtree of Another Tree](https://leetcode.com/problems/subtree-of-another-tree/)
- [ ] [102. Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)
- [ ] [199. Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view/)
- [ ] [1448. Count Good Nodes in Binary Tree](https://leetcode.com/problems/count-good-nodes-in-binary-tree/)
- [ ] [105. Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)
- [ ] [124. Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/)
- [ ] [297. Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/)

*Additional Problems:*

- [ ] [236. Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/)

**Why Now**: Trees are "training wheels" for graphs. Easier to visualize, no cycles, simpler rules.

---

### Week 7: Binary Search Trees

**Duration**: 3-4 days (full-time)

**What You Learn**:

- Ordered structures
- BST property
- In-order traversal gives sorted order
- Validation patterns

**Key Problems**:

- [ ] [98. Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)
- [ ] [230. Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)
- [ ] [235. Lowest Common Ancestor of a Binary Search Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/)

*Additional Problems:*

- [ ] [701. Insert into a Binary Search Tree](https://leetcode.com/problems/insert-into-a-binary-search-tree/)

**Why Now**: Extends tree knowledge with ordering property. Common in interviews.

---

### Week 7-8: Heaps / Priority Queues

**Duration**: 3-4 days (full-time)

**What You Learn**:

- Maintaining order dynamically
- K-way problems
- Top K patterns
- O(log n) insertions

**Key Problems**:

- [ ] [703. Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)
- [ ] [1046. Last Stone Weight](https://leetcode.com/problems/last-stone-weight/)
- [ ] [973. K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)
- [ ] [215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [ ] [347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)
- [ ] [621. Task Scheduler](https://leetcode.com/problems/task-scheduler/)
- [ ] [355. Design Twitter](https://leetcode.com/problems/design-twitter/)
- [ ] [295. Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/)
- [ ] [23. Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)

**Why Now**: Powerful data structure. Often combined with graphs later (Dijkstra).

---

### Week 8-9: Graphs - Fundamentals

**Duration**: 4-6 days (full-time)

**What You Learn**:

- Graph representation (adjacency list/matrix)
- Directed vs undirected
- Weighted vs unweighted
- Identifying graph problems

**Key Problems**:

- [ ] [200. Number of Islands](https://leetcode.com/problems/number-of-islands/)
- [ ] [133. Clone Graph](https://leetcode.com/problems/clone-graph/)
- [ ] [695. Max Area of Island](https://leetcode.com/problems/max-area-of-island/)
- [ ] [323. Number of Connected Components in an Undirected Graph](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/) *(Premium)*
- [ ] [261. Graph Valid Tree](https://leetcode.com/problems/graph-valid-tree/) *(Premium)*

**Why Now**: You finally have recursion, trees, and hash maps mastered. Ready for the complexity.

---

### Week 9-10: Graph Traversal (DFS)

**Duration**: 4-6 days (full-time)

**What You Learn**:

- Depth-first exploration
- Backtracking in graphs
- Cycle detection
- Path finding

**Key Problems**:

- [ ] [207. Course Schedule](https://leetcode.com/problems/course-schedule/)
- [ ] [130. Surrounded Regions](https://leetcode.com/problems/surrounded-regions/)
- [ ] [417. Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/)
- [ ] [286. Walls and Gates](https://leetcode.com/problems/walls-and-gates/) *(Premium)*

*Additional Problems:*

- [ ] [797. All Paths From Source to Target](https://leetcode.com/problems/all-paths-from-source-to-target/)
- [ ] [547. Number of Provinces](https://leetcode.com/problems/number-of-provinces/)

**Why Now**: After trees, DFS on graphs is natural. You already know recursion deeply.

---

### Week 10-11: Graph Traversal (BFS)

**Duration**: 4-6 days (full-time)

**What You Learn**:

- Breadth-first exploration
- Shortest path in unweighted graphs
- Level-by-level processing
- Multi-source BFS

**Key Problems**:

- [ ] [994. Rotting Oranges](https://leetcode.com/problems/rotting-oranges/)
- [ ] [127. Word Ladder](https://leetcode.com/problems/word-ladder/)

*Additional Problems:*

- [ ] [1091. Shortest Path in Binary Matrix](https://leetcode.com/problems/shortest-path-in-binary-matrix/)

**Why Now**: After DFS, BFS is just "using a queue instead of recursion."

---

### Week 11: Advanced Graph Algorithms (Topological Sort!)

**Duration**: 4-6 days (full-time)

**What You Learn**:

- Topological sort (DFS + BFS approaches)
- Union Find / Disjoint Set
- Minimum spanning tree
- Shortest path (Dijkstra, Bellman-Ford)

**Key Problems**:

- [ ] [210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)
- [ ] [684. Redundant Connection](https://leetcode.com/problems/redundant-connection/)
- [ ] [743. Network Delay Time](https://leetcode.com/problems/network-delay-time/)
- [ ] [787. Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/)
- [ ] [332. Reconstruct Itinerary](https://leetcode.com/problems/reconstruct-itinerary/)
- [ ] [1584. Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points/)
- [ ] [778. Swim in Rising Water](https://leetcode.com/problems/swim-in-rising-water/)
- [ ] [269. Alien Dictionary](https://leetcode.com/problems/alien-dictionary/) *(Premium)*

**Why Now**: Combines everything. You're ready for these complex algorithms.

---

### Week 11-12: Backtracking Deep Dive

**Duration**: 5-7 days (full-time)

**What You Learn**:

- State space tree exploration
- Pruning strategies
- Constraint satisfaction
- Combinatorial generation

**Key Problems**:

- [ ] [39. Combination Sum](https://leetcode.com/problems/combination-sum/)
- [ ] [46. Permutations](https://leetcode.com/problems/permutations/)
- [ ] [90. Subsets II](https://leetcode.com/problems/subsets-ii/)
- [ ] [40. Combination Sum II](https://leetcode.com/problems/combination-sum-ii/)
- [ ] [79. Word Search](https://leetcode.com/problems/word-search/)
- [ ] [131. Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/)
- [ ] [17. Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)
- [ ] [51. N-Queens](https://leetcode.com/problems/n-queens/)

*Additional Problems:*

- [ ] [77. Combinations](https://leetcode.com/problems/combinations/)
- [ ] [37. Sudoku Solver](https://leetcode.com/problems/sudoku-solver/)

**Why Now**: Advanced recursion. Requires strong foundation + graph DFS understanding.

---

### Week 12-13: Dynamic Programming - 1D

**Duration**: 1-2 weeks (full-time) - This is hard, take your time!

**What You Learn**:

- Overlapping subproblems
- Memoization vs tabulation
- State definition
- Recurrence relations

**Key Problems**:

- [ ] [70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)
- [ ] [746. Min Cost Climbing Stairs](https://leetcode.com/problems/min-cost-climbing-stairs/)
- [ ] [198. House Robber](https://leetcode.com/problems/house-robber/)
- [ ] [213. House Robber II](https://leetcode.com/problems/house-robber-ii/)
- [ ] [5. Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/)
- [ ] [647. Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/)
- [ ] [91. Decode Ways](https://leetcode.com/problems/decode-ways/)
- [ ] [322. Coin Change](https://leetcode.com/problems/coin-change/)
- [ ] [152. Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/)
- [ ] [139. Word Break](https://leetcode.com/problems/word-break/)
- [ ] [300. Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/)
- [ ] [416. Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/)

**Why Now**: Hardest paradigm. Needs strong recursion + pattern recognition from earlier phases.

---

### Week 13-14: Dynamic Programming - 2D

**Duration**: 1-2 weeks (full-time) - Still hard!

**What You Learn**:

- Multi-dimensional state
- Grid DP
- String DP
- Optimization

**Key Problems**:

- [ ] [62. Unique Paths](https://leetcode.com/problems/unique-paths/)
- [ ] [1143. Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/)
- [ ] [309. Best Time to Buy and Sell Stock with Cooldown](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/)
- [ ] [518. Coin Change II](https://leetcode.com/problems/coin-change-ii/)
- [ ] [494. Target Sum](https://leetcode.com/problems/target-sum/)
- [ ] [97. Interleaving String](https://leetcode.com/problems/interleaving-string/)
- [ ] [329. Longest Increasing Path in a Matrix](https://leetcode.com/problems/longest-increasing-path-in-a-matrix/)
- [ ] [115. Distinct Subsequences](https://leetcode.com/problems/distinct-subsequences/)
- [ ] [72. Edit Distance](https://leetcode.com/problems/edit-distance/)
- [ ] [312. Burst Balloons](https://leetcode.com/problems/burst-balloons/)
- [ ] [10. Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/)

**Why Now**: After 1D DP, extending to 2D is conceptual, not fundamentally new.

---

## 🎓 Checkpoint: Studied → Expert

**You should now be able to**:
✅ Solve most medium problems (60-70% success rate)
✅ Recognize graph patterns immediately
✅ Choose between DFS/BFS appropriately
✅ Identify DP problems and define states
✅ Handle complex backtracking problems
✅ Understand advanced algorithms (topological sort, Dijkstra, etc.)

**Time invested**: Additional 5-8 weeks (total: 8-13 weeks / 2-3 months)

---

## 🎯 Phase 3: Expert (Ongoing)

**Goal**: Combine techniques, optimize solutions, tackle hard problems.

---

### Week 14-15: Greedy Algorithms

**Duration**: 5-7 days (full-time)

**What You Learn**:

- Local optimal choices leading to global optimal
- Sorting as a preprocessing step
- Interval-based thinking
- When greedy works vs when you need DP

**Key Problems**:

- [ ] [53. Maximum Subarray](https://leetcode.com/problems/maximum-subarray/)
- [ ] [55. Jump Game](https://leetcode.com/problems/jump-game/)
- [ ] [45. Jump Game II](https://leetcode.com/problems/jump-game-ii/)
- [ ] [134. Gas Station](https://leetcode.com/problems/gas-station/)
- [ ] [846. Hand of Straights](https://leetcode.com/problems/hand-of-straights/)
- [ ] [1899. Merge Triplets to Form Target Triplet](https://leetcode.com/problems/merge-triplets-to-form-target-triplet/)
- [ ] [763. Partition Labels](https://leetcode.com/problems/partition-labels/)
- [ ] [678. Valid Parenthesis String](https://leetcode.com/problems/valid-parenthesis-string/)

**Why Now**: Greedy requires strong intuition about when local choices are globally optimal - something you build through DP and backtracking.

---

### Week 15-16: Intervals

**Duration**: 3-5 days (full-time)

**What You Learn**:

- Interval sorting and merging patterns
- Sweep line technique
- Overlap detection
- Meeting room scheduling

**Key Problems**:

- [ ] [57. Insert Interval](https://leetcode.com/problems/insert-interval/)
- [ ] [56. Merge Intervals](https://leetcode.com/problems/merge-intervals/)
- [ ] [435. Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/)
- [ ] [252. Meeting Rooms](https://leetcode.com/problems/meeting-rooms/) *(Premium)*
- [ ] [253. Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii/) *(Premium)*
- [ ] [1851. Minimum Interval to Include Each Query](https://leetcode.com/problems/minimum-interval-to-include-each-query/)

**Why Now**: Interval problems combine sorting with greedy thinking - both skills you've built by now.

---

### Week 16-17: Tries

**Duration**: 3-4 days (full-time)

**What You Learn**:

- Prefix-based data structures
- Character-by-character traversal
- Efficient string search
- Autocomplete patterns

**Key Problems**:

- [ ] [208. Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/)
- [ ] [211. Design Add and Search Words Data Structure](https://leetcode.com/problems/design-add-and-search-words-data-structure/)
- [ ] [212. Word Search II](https://leetcode.com/problems/word-search-ii/)

**Why Now**: Combines tree structure knowledge with string processing.

---

### Week 17-18: Math & Geometry

**Duration**: 3-5 days (full-time)

**What You Learn**:

- Matrix manipulation patterns
- In-place transformations
- Mathematical reasoning in code
- Coordinate geometry

**Key Problems**:

- [ ] [48. Rotate Image](https://leetcode.com/problems/rotate-image/)
- [ ] [54. Spiral Matrix](https://leetcode.com/problems/spiral-matrix/)
- [ ] [73. Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/)
- [ ] [202. Happy Number](https://leetcode.com/problems/happy-number/)
- [ ] [66. Plus One](https://leetcode.com/problems/plus-one/)
- [ ] [50. Pow(x, n)](https://leetcode.com/problems/powx-n/)
- [ ] [43. Multiply Strings](https://leetcode.com/problems/multiply-strings/)
- [ ] [2013. Detect Squares](https://leetcode.com/problems/detect-squares/)

**Why Now**: These problems test implementation precision and mathematical thinking - good to practice after mastering algorithmic patterns.

---

### Week 18-19: Bit Manipulation

**Duration**: 3-4 days (full-time)

**What You Learn**:

- Binary representation
- XOR, AND, OR, shift operations
- Bit masking techniques
- Space-efficient solutions

**Key Problems**:

- [ ] [136. Single Number](https://leetcode.com/problems/single-number/)
- [ ] [191. Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/)
- [ ] [338. Counting Bits](https://leetcode.com/problems/counting-bits/)
- [ ] [190. Reverse Bits](https://leetcode.com/problems/reverse-bits/)
- [ ] [268. Missing Number](https://leetcode.com/problems/missing-number/)
- [ ] [371. Sum of Two Integers](https://leetcode.com/problems/sum-of-two-integers/)
- [ ] [7. Reverse Integer](https://leetcode.com/problems/reverse-integer/)

**Why Now**: Bit manipulation is a distinct skill set. Best tackled once you're comfortable with all other patterns.

---

### Week 19+: Advanced Topics

**Advanced DP**:

- Knapsack variations
- DP on trees
- Bitmask DP
- DP with optimization

**Advanced Graph**:

- Strongly connected components
- Bridges and articulation points
- Minimum cut
- Network flow

**System Design**:

- LFU Cache
- Design search autocomplete

---

## 💡 Key Principles

### 1. **Depth over Breadth**

Spend 3-7 days truly mastering simple topics, 1-2 weeks for complex ones (recursion, DP). Don't rush.

### 2. **Spaced Repetition**

Revisit earlier topics. After learning graphs, go back and solve tree problems - they'll seem trivial.

### 3. **Build, Don't Memorize**

Understand WHY each technique works. The pattern recognition comes naturally.

### 4. **Progressive Difficulty**

Each topic is slightly harder than the last, but builds on previous knowledge.

### 5. **Trust the Process** (Full-time pace)

- Weeks 1-3: "This seems manageable"
- Weeks 4-6: "This is getting hard" (Recursion + Trees)
- Weeks 7-10: "This is really challenging" (Graphs + DFS/BFS)
- Weeks 11-14+: "Wait, this is starting to click" (DP + Advanced topics)

Even at full-time pace, complex topics need time to sink in. Don't rush DP just because you have more hours!

---

## 📖 How to Use This Guide

1. **Don't skip around**: The order matters
2. **Spend recommended time**: Rushing leads to gaps
3. **Practice consistently**: 6 focused hours/day > 12 distracted hours
    - Take breaks every 90 minutes
    - Quality study time matters more than quantity
    - Some days will feel slower - that's the learning process
4. **Review regularly**: Revisit old topics every week
5. **Build projects**: Implement data structures from scratch
6. **Join communities**: Discuss problems, learn from others
7. **Track progress**: Use `/memory/dsa-progress.md` to track your journey

---

## 🎓 Final Thought

This path takes **2-3 months of full-time study** (or 5-7 months part-time) to reach "studied" level. That's normal! Companies like Google expect candidates to have spent months preparing. The key is:

✅ **Consistency** over intensity (6 focused hours > 10 distracted hours)
✅ **Understanding** over memorization (why it works, not just how)
✅ **Patience** with the process (slow days happen, keep going)
✅ **Confidence** that each week builds on the last (it compounds!)

You're not just learning algorithms - you're rewiring how you think about problems.

**Trust the process. You'll get there.**
