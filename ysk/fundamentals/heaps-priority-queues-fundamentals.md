# Heaps / Priority Queues - Fundamentals

> 📚 **Part of**: [Complete DSA Learning Path](../dsa/00-complete-dsa-path.md)
>
> **Generated**: 2026-02-23
>
> **Duration**: 3-4 days (full-time)
>
> **Prerequisites**:
> - [Binary Trees](./binary-trees-fundamentals.md) — hierarchical structure thinking, tree shape
> - [Binary Search Trees](./bst-fundamentals.md) — ordered tree operations, tree property invariants

---

## 1. Overview

A **Heap** (also called a Priority Queue) is a specialized tree-based structure that guarantees one thing: the most "important" element is always at the top, instantly accessible. Think of it as a self-organizing list that automatically promotes the highest-priority item to the front — without keeping everything sorted.

Heaps appear in three interview archetypes: **top-K problems**, **streaming data with ordering**, and **graph algorithms (Dijkstra)**. Mastering the heap unlocks a whole class of "find the best K" problems that would otherwise require full O(n log n) sorting.

**By the end of this guide you'll be able to**:

- Implement a min-heap and max-heap from scratch in TypeScript
- Recognize and apply the three core heap patterns
- Solve Top-K, K-way merge, and two-heaps problems with confidence

---

## 2. Core Concept & Mental Model

### The Analogy: Emergency Room Triage

Imagine a hospital ER. Patients arrive constantly, each assigned a severity score. The nurse's station doesn't care about arrival order — it always sends the most critical patient to the doctor first.

- **Patient arrives** = `enqueue` O(log n) — they bubble up to their priority slot
- **Doctor calls next** = `dequeue` O(log n) — remove the root, reorganize
- **Who's next?** = `front()` O(1) — just look at the top

The heap *is* that triage nurse: always knows the most critical item in O(1), reorganizes in O(log n).

### The Key Property

A **min-heap** guarantees: every parent ≤ its children → minimum is at root
A **max-heap** guarantees: every parent ≥ its children → maximum is at root

This is **NOT** full sorted order — it's *partial* ordering. Only the parent-to-child relationship is guaranteed. Siblings have no ordering relationship.

```
Min-Heap example:
        1           ← always the minimum
      /   \
     3     2
    / \   / \
   7   4 5   6

Array:  [1, 3, 2, 7, 4, 5, 6]
Index:   0  1  2  3  4  5  6
```

### The Array Trick — No Tree Nodes Needed

Heaps are stored as flat arrays. The parent-child relationships are computed with index math:

```
For element at index i:
  Parent:      Math.floor((i - 1) / 2)
  Left child:  (2 * i) + 1
  Right child: (2 * i) + 2
```

No allocating nodes. No pointer chasing. Just array index arithmetic.

### Concept Map

```mermaid
graph TD
    H["Heap / Priority Queue"]
    H --> MIN["Min-Heap: smallest at root"]
    H --> MAX["Max-Heap: largest at root"]
    H --> OPS["Core Operations"]
    OPS --> INS["enqueue: O(log n) - heapify up"]
    OPS --> PEEK["front(): O(1) - read index 0"]
    OPS --> EXT["dequeue: O(log n) - heapify down"]
    H --> IMPL["Stored as Array - no pointers"]
    IMPL --> MATH["Parent: floor i-1 over 2 - Left: 2i+1 - Right: 2i+2"]
    H --> USES["Common Use Cases"]
    USES --> TOPK["Top K elements"]
    USES --> STREAM["Streaming with ordering"]
    USES --> DIJK["Dijkstra shortest path"]
```

---

## 3. Building Blocks — Progressive Learning

### Level 1: Simplest Form — The Heap is Just an Array with Rules

The most important insight before writing any code: a heap is just an array + two index formulas. No nodes, no pointers, no `new TreeNode()`.

```typescript
// A heap is an array with a structural guarantee.
// That's the whole idea.

class MinHeap {
  private heap: number[] = [];

  // The minimum is ALWAYS at index 0 — that's the whole point
  // This is O(1): just read the front of the array
  front(): number | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  // These three formulas define the entire heap structure
  // Memorize them — they're everything
  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private left(i: number): number {
    return 2 * i + 1;
  }

  private right(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
```

**What makes this the simplest form**: `heap[0]` is always the answer to "what's the minimum?" — before you've even written heapify. Understanding that the root is always the answer is 90% of the mental model.

---

### Level 2: Adding the Heap Property — Two Directions of Fixing

To maintain the heap property through inserts and extracts, we need two operations:

- **heapify-up** (bubble up): after insert, compare upward toward root
- **heapify-down** (bubble down): after extract, compare downward toward leaves

```typescript
class MinHeap {
  private heap: number[] = [];

  private parent(i: number) { return Math.floor((i - 1) / 2); }
  private left(i: number)   { return 2 * i + 1; }
  private right(i: number)  { return 2 * i + 2; }
  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  front(): number | undefined { return this.heap[0]; }
  size(): number { return this.heap.length; }

  // ENQUEUE: append to end, then bubble UP
  // Why end? Preserves the "complete binary tree" shape efficiently
  // Why bubble up? The new element might be smaller than its ancestors
  enqueue(val: number): void {
    this.heap.push(val);                           // Step 1: add to end
    this.heapifyUp(this.heap.length - 1);          // Step 2: fix upward
  }

  // heapify-up: while current < parent, swap them and continue upward
  // Stops when: (a) we reach root (i === 0), OR (b) parent <= current (heap OK)
  private heapifyUp(i: number): void {
    while (i > 0) {
      const p = this.parent(i);
      if (this.heap[p] <= this.heap[i]) break;     // Heap property satisfied
      this.swap(i, p);
      i = p;                                        // Move up to parent's index
    }
  }
}

// Walkthrough: enqueue [5, 2, 8, 1] one by one
// After enqueue 5:  [5]
// After enqueue 2:  [5,2] → heapifyUp(1): parent(1)=0, heap[0]=5 > heap[1]=2 → swap
//                   [2,5]
// After enqueue 8:  [2,5,8] → heapifyUp(2): parent(2)=0, heap[0]=2 <= heap[2]=8 → stop
//                   [2,5,8]
// After enqueue 1:  [2,5,8,1] → heapifyUp(3): parent(3)=1, heap[1]=5 > heap[3]=1 → swap
//                   [2,1,8,5] → heapifyUp(1): parent(1)=0, heap[0]=2 > heap[1]=1 → swap
//                   [1,2,8,5] ✓
```

**Mental model for heapify-up**: *"I just joined the company. Am I more important than my manager? If yes, we swap roles and I check with my new manager."*

---

### Level 3: Full Pattern — Complete Heap with Extract

```typescript
// Production-ready MinHeap for LeetCode problems
// All operations with correct complexity

class MinHeap {
  private heap: number[] = [];

  // Index formulas — the structural foundation
  private parent(i: number): number { return Math.floor((i - 1) / 2); }
  private left(i: number): number   { return 2 * i + 1; }
  private right(i: number): number  { return 2 * i + 2; }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  front(): number | undefined  { return this.heap[0]; }
  size(): number               { return this.heap.length; }
  isEmpty(): boolean           { return this.heap.length === 0; }

  // O(log n) — append + heapify up
  enqueue(val: number): void {
    this.heap.push(val);
    this.heapifyUp(this.heap.length - 1);
  }

  // O(log n) — remove root, restore heap
  // Critical trick: move the LAST element to the root, then heapify down
  // Why last element? It's the easiest to remove (no gaps), maintains shape
  dequeue(): number | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];          // Save answer
    this.heap[0] = this.heap.pop()!;   // Overwrite root with last element
    this.heapifyDown(0);               // Fix the heap downward from root
    return min;
  }

  // Bubble UP: swap with parent while smaller than parent
  private heapifyUp(i: number): void {
    while (i > 0) {
      const p = this.parent(i);
      if (this.heap[p] <= this.heap[i]) break;
      this.swap(i, p);
      i = p;
    }
  }

  // Bubble DOWN: swap with smaller child while larger than a child
  // Always swap with the SMALLER child — this maintains both subtrees
  private heapifyDown(i: number): void 
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = this.left(i);
      const r = this.right(i);

      // Find smallest among: current node, left child, right child
      if (l < n && this.heap[l] < this.heap[smallest]) smallest = l;
      if (r < n && this.heap[r] < this.heap[smallest]) smallest = r;

      if (smallest === i) break;   // Current is already smallest — done

      this.swap(i, smallest);
      i = smallest;                // Continue downward from new position
    }
  }

  // Debugging helper: verify heap property holds for every node
  isValid(): boolean {
    for (let i = 1; i < this.heap.length; i++) {
      const p = this.parent(i);
      if (this.heap[p] > this.heap[i]) return false;
    }
    return true;
  }
}

// MaxHeap is identical with two sign flips:
// heapifyUp:   heap[p] >= heap[i]  (stop if parent >= current)
// heapifyDown: find LARGEST child instead of smallest

// Time Complexity Summary:
// insert:     O(log n) — at most log n swaps traveling up
// extractMin: O(log n) — at most log n swaps traveling down
// peek:       O(1)     — always just read index 0
// Space:      O(n)     — one slot per element

// Quick usage:
const heap = new MinHeap();
heap.enqueue(5); heap.enqueue(2); heap.enqueue(8); heap.enqueue(1);
heap.front();    // 1
heap.dequeue();  // 1
heap.front();    // 2
```

**Visualizing extractMin on `[1, 2, 8, 5]`**:

```
Before: [1, 2, 8, 5]   → tree root = 1 (minimum)

Step 1: Move last element (5) to root, remove last slot
        [5, 2, 8]

Step 2: heapifyDown(0)
        Node 5 vs children: left=2, right=8 → smallest is 2 (index 1)
        Swap: [2, 5, 8]

Step 3: heapifyDown(1)
        Node 5 vs children: left=index 3 (out of bounds) → no children
        Stop.

Result: [2, 5, 8] ✓  —  heap property restored, extracted 1
```

---

## 4. Key Patterns

### Pattern 1: Top-K Elements (Min-Heap of Size K)

**When to Use**:

- "Find K largest elements" / "Find Kth largest"
- "Top K most frequent elements"
- Any "best K" from a stream or large array where K << n

**The counterintuitive insight**: Use a **min-heap** to find K **largest** elements.

A min-heap helps here because I'm trying to maintain a running "top K" window as I scan through the array. I don't know the final K largest upfront — I'm discovering them one element at a time. What I need is a way to, at any point, instantly answer: "of everything I've seen so far, which K elements are the largest, and if I need to drop one, which one goes?" The min-heap answers both: the root is always the weakest of my current K candidates, so I can drop it in O(log k) without scanning everything.

The reason it's a *min*-heap and not a max-heap: I want to evict the *smallest* of my current candidates whenever I see a better one. A min-heap puts the smallest at the root — right where I can grab it cheaply.

Tracing `findKLargest([3, 2, 1, 5, 6, 4], k=2)`:

- See 3. I have 1 candidate, still under K=2. Just keep it. Heap: `[3]`
- See 2. Now I have 2 candidates — I'm at capacity. Heap: `[2, 3]`. Root is 2 (the weaker of my two).
- See 1. I now have 3 but only want 2. Who do I drop? The weakest — that's 1 (it just became the root). Drop it. Heap stays `[2, 3]`.
- See 5. I now have 3 again. Weakest is 2. Drop it — 5 is a better candidate. Heap: `[3, 5]`.
- See 6. I now have 3 again. Weakest is 3. Drop it. Heap: `[5, 6]`.
- See 4. I now have 3 again. Weakest is 4. Drop it — 4 doesn't beat either 5 or 6. Heap stays `[5, 6]`.

Done. Heap holds `[5, 6]` — the 2 largest. The root (5) is the Kth largest.

---

```typescript
import { MinPriorityQueue } from "@datastructures-js/priority-queue";

// LeetCode 215 — Kth Largest Element in an Array
// Time: O(n log k)  Space: O(k)
function findKthLargest(nums: number[], k: number): number {
  const pq = new MinPriorityQueue<number>();

  for (const num of nums) {
    pq.enqueue(num);

    // size > k means we have K+1 elements — one too many.
    // Evict the smallest. The K survivors are always the K largest seen so far.
    // While size <= k: just accumulate, no eviction happens at all.
    if (pq.size() > k) {
      pq.dequeue(); // removes the minimum (weakest candidate)
    }
  }

  // front() is the minimum of our top K — the Kth largest overall
  return pq.front().element;
}

// For K smallest: use MaxPriorityQueue of size K, dequeue the largest when size > K
```

**Complexity**:

- Time: O(n log k) — n inserts, each O(log k) since heap size is capped at k
- Space: O(k) — only k elements in the heap at any time

---

### Pattern 2: K-Way Merge

**When to Use**:

- Merging K sorted arrays or linked lists
- "Smallest range covering elements from K lists"
- Streaming from K sorted sources

**Key idea**: A min-heap holds the "current front" of each sorted source. Always extract the global minimum, then advance that source's pointer.

```typescript
import { MinPriorityQueue } from "@datastructures-js/priority-queue";

// Merge K sorted arrays into one sorted array
// Time: O(n log k) where n = total elements, k = number of arrays
// Space: O(k) for the heap (one representative per array)

interface HeapEntry {
  val: number;
  arrayIdx: number;   // Which of the K source arrays
  elemIdx: number;    // Position within that source array
}

function mergeKSortedArrays(arrays: number[][]): number[] {
  // priority option tells the heap which field to order by
  const pq = new MinPriorityQueue<HeapEntry>({ priority: (x) => x.val });
  const result: number[] = [];

  // Seed one element from each array
  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length > 0) {
      pq.enqueue({ val: arrays[i][0], arrayIdx: i, elemIdx: 0 });
    }
  }

  // Each iteration: dequeue the global minimum, advance that source's pointer
  while (!pq.isEmpty()) {
    const { val, arrayIdx, elemIdx } = pq.dequeue().element;
    result.push(val);

    const nextIdx = elemIdx + 1;
    if (nextIdx < arrays[arrayIdx].length) {
      pq.enqueue({ val: arrays[arrayIdx][nextIdx], arrayIdx, elemIdx: nextIdx });
    }
  }

  return result;
}

// Example: arrays = [[1,4,7], [2,5,8], [3,6,9]]
// Initial heap: [{1,0,0}, {2,1,0}, {3,2,0}]
// Round 1: dequeue 1, enqueue {4,0,1} → result=[1]
// Round 2: dequeue 2, enqueue {5,1,1} → result=[1,2]
// Round 3: dequeue 3, enqueue {6,2,1} → result=[1,2,3]
// ... continues until all elements dequeued in sorted order

// NOTE: For LeetCode 23 (Merge K Sorted Lists), same pattern but
// heap entries hold ListNode pointers instead of array indices
```

**Complexity**:

- Time: O(n log k) — n total extractions, each O(log k) since heap has k entries
- Space: O(k) — heap holds exactly one element per source at a time

---

### Pattern 3: Two Heaps (Dynamic Median)

**When to Use**:

- Median from a data stream
- Problems requiring the "middle value" with O(log n) updates
- Anything where you need to split data into balanced lower/upper halves

**Key insight**: Keep two heaps — a max-heap for the lower half and a min-heap for the upper half. The median lives at one (or both) of their roots.

```typescript
import { MinPriorityQueue, MaxPriorityQueue } from "@datastructures-js/priority-queue";

// LeetCode 295 — Find Median from Data Stream
// addNum: O(log n)   findMedian: O(1)

class MedianFinder {
  // Lower half: max-heap (front = largest of smaller numbers)
  private lower = new MaxPriorityQueue<number>();

  // Upper half: min-heap (front = smallest of larger numbers)
  private upper = new MinPriorityQueue<number>();

  // Invariants we ALWAYS maintain:
  // 1. lower.front() <= upper.front()  (every lower value ≤ every upper value)
  // 2. |lower.size - upper.size| <= 1  (sizes differ by at most 1)

  addNum(num: number): void {
    // Step 1: Default — add to lower (max-heap)
    this.lower.enqueue(num);

    // Step 2: Enforce ordering invariant
    // If max of lower > min of upper, move it over
    if (
      !this.upper.isEmpty() &&
      this.lower.front().element > this.upper.front().element
    ) {
      this.upper.enqueue(this.lower.dequeue().element);
    }

    // Step 3: Rebalance sizes (lower can have at most 1 extra)
    if (this.lower.size() > this.upper.size() + 1) {
      this.upper.enqueue(this.lower.dequeue().element);
    } else if (this.upper.size() > this.lower.size()) {
      this.lower.enqueue(this.upper.dequeue().element);
    }
  }

  findMedian(): number {
    if (this.lower.size() > this.upper.size()) {
      // Odd total: lower has the middle element
      return this.lower.front().element;
    }
    // Even total: median is average of the two middle elements
    return (this.lower.front().element + this.upper.front().element) / 2;
  }
}

// Example walkthrough: addNum 5, 2, 8
// After 5: lower=[5]    upper=[]    → median = 5
// After 2: lower=[5,2]  → max(lower)=5, upper empty, sizes ok
//          → rebalance: lower has 2, upper has 0, diff=2 > 1
//          → move max of lower (5) to upper
//          → lower=[2]  upper=[5]   → median = (2+5)/2 = 3.5
// After 8: lower=[2,8]? → lower.front()=8 > upper.front()=5 → move 8 to upper
//          lower=[2]    upper=[5,8] → upper.size > lower.size
//          → move min of upper (5) to lower
//          lower=[2,5]  upper=[8]   → median = lower.front() = 5

// Invariant check: lower.front()=5, upper.front()=8
// 5 <= 8 ✓  |sizes: 2 vs 1| = 1 ≤ 1 ✓
```

**Complexity**:

- Time: O(log n) per `addNum`, O(1) for `findMedian`
- Space: O(n) total

---

## 5. Decision Framework

```mermaid
graph TD
    START["Problem needs ordering or priority?"]
    START -->|Yes| Q1["Need K best elements?"]
    START -->|No| OTHER["Use sort or hash map instead"]
    Q1 -->|Yes| Q2["Static array or streaming?"]
    Q1 -->|No| Q3["Need median dynamically?"]
    Q2 -->|Static| SORT["Sort and slice - O(n log n)"]
    Q2 -->|Streaming| TOPK["Min-Heap of size K - O(n log k)"]
    Q3 -->|Yes| TWO["Two Heaps pattern"]
    Q3 -->|No| Q4["Merging K sorted sources?"]
    Q4 -->|Yes| KMERGE["K-way merge with Min-Heap"]
    Q4 -->|No| Q5["Schedule tasks by priority or frequency?"]
    Q5 -->|Yes| MAXH["Max-Heap by frequency or cooldown"]
    Q5 -->|No| Q6["Shortest path in weighted graph?"]
    Q6 -->|Yes| DIJK["Dijkstra with Min-Heap by distance"]
    Q6 -->|No| RECONSIDER["Heap may not be needed here"]
```

**Recognition Signals — this is a heap problem**:

- "Kth largest/smallest" → min-heap of size K
- "Top K most frequent" → heap with frequency comparator
- "Median from data stream" → two heaps
- "Merge K sorted lists" → K-way merge
- "Task scheduler with cooldown" → max-heap by frequency
- Anywhere you'd sort but need to process elements one-by-one in priority order

**When NOT to Use**:

- **K is large or n is small**: just sort — O(n log n) is fine and simpler
- **Static median**: sort and index — O(n log n) once beats O(n log n) setup
- **Simple min or max**: `Math.min(...arr)` is O(n) and far simpler
- **Need ALL elements sorted**: sort is cleaner than extract-all-from-heap

---

## 6. Common Gotchas & Edge Cases

### Typical Mistakes

**1. Max-heap when you need min-heap for Top-K Largest**

```typescript
// WRONG: "Find K largest" with a max-heap
// You'd fill the heap with all n elements first = O(n log n) and O(n) space
// Then extract K times = fine, but defeats the point

// RIGHT: "Find K largest" with a MIN-heap of size K
// Heap acts as bouncer keeping only the best K candidates
// O(n log k) time, O(k) space — much better when k << n
```

**2. JavaScript has no built-in heap — use the library**

```typescript
// Array.sort() is NOT a heap. Re-sorting after each insert is O(n log n)
// per operation, not O(log n). This kills performance in stream problems.
//
// Use: import { MinPriorityQueue, MaxPriorityQueue } from "@datastructures-js/priority-queue"
// dequeue().element — removes and returns the min (or max) value
// front().element   — peeks without removing
// enqueue(val)      — inserts
```

**3. Swapping with wrong child in heapifyDown**

```typescript
// WRONG: always swap with left child
if (left < n && heap[left] < heap[i]) swap(i, left); // misses right child

// RIGHT: find the smallest among current, left, right — then swap once
let smallest = i;
if (left < n && heap[left] < heap[smallest]) smallest = left;
if (right < n && heap[right] < heap[smallest]) smallest = right;
if (smallest !== i) { swap(i, smallest); i = smallest; }
// Swapping with the SMALLER child preserves the heap property in both subtrees
```

**4. Two Heaps: forgetting the ordering invariant**

```typescript
// After any insert, you MUST check:
// maxHeap.peek() <= minHeap.peek()
// If a number goes to the wrong half, the median calculation breaks silently
// The fix: after routing, check tops and move if necessary
```

**5. Not checking bounds before accessing children**

```typescript
// heapifyDown must check left < n and right < n before comparing
// heap[left] when left >= n returns undefined — comparisons then fail silently
```

### Edge Cases to Always Test

- **Empty heap**: `dequeue()` on an empty heap throws — always guard with `isEmpty()` first
- **Single element**: insert then extract should work cleanly
- **All identical values**: no infinite loops — comparisons use `<` not `<=`
- **K ≥ n in Top-K**: return all elements (heap never evicts anything)
- **Negative numbers**: heap comparisons work on negatives without changes
- **Two Heaps with one element**: median = that one element (lower has it)

### Debugging Tips

```typescript
// Add inspection helpers to your heap while debugging:
toString(): string {
  return `[${this.heap.join(', ')}]`;
}

// Verify heap invariant holds (golden for catching subtle bugs):
isValid(): boolean {
  for (let i = 1; i < this.heap.length; i++) {
    if (this.heap[this.parent(i)] > this.heap[i]) return false;
  }
  return true;
}

// Common debugging approach for heapifyDown:
// Trace through [6, 3, 5] manually:
// i=0: left=1(3), right=2(5), smallest=1 → swap(0,1) → [3, 6, 5]
// i=1: left=3(OOB), right=4(OOB) → stop
// Result [3, 6, 5] ✓ — if your output differs, the bug is in child selection
```

---

## 7. Practice Path

**Problems from Your DSA Guide**

**Starter Problems** (Build Intuition):

- [ ] [1046. Last Stone Weight](https://leetcode.com/problems/last-stone-weight/) — pure max-heap; just simulate extracting two max stones, colliding, reinserting. No tricks. The clearest possible heap problem.
- [ ] [703. Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/) — min-heap of size K for streaming. This one introduces the core "K largest via min-heap" insight.

**Core Problems** (Master the Patterns):

- [ ] [215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) — same Top-K pattern on a static array; nail this cold
- [ ] [973. K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) — Top-K with a custom comparator (distance); generalizes the pattern
- [ ] [347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) — hash map + heap; classic two-step combination
- [ ] [621. Task Scheduler](https://leetcode.com/problems/task-scheduler/) — max-heap for greedy frequency-based scheduling
- [ ] [355. Design Twitter](https://leetcode.com/problems/design-twitter/) — K-way merge on user feeds

**Challenge Problems** (Test Mastery):

- [ ] [295. Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/) — two heaps; requires maintaining both invariants simultaneously
- [ ] [23. Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) *(★ challenge)* — K-way merge where heap entries are linked list nodes

**Suggested Order**:

1. **Start with #1046 Last Stone Weight** — it's the purest heap problem: extract two maximums, compute result, reinsert. Pure max-heap, no tricks. Builds muscle memory.
2. **Then #703 Kth Largest in a Stream** — introduces the min-heap-for-K-largest insight. This mental model unlocks the next three problems.
3. **Then #215 Kth Largest in Array** — same insight, static version. Make sure you can code it in under 10 minutes.
4. **Then #973 K Closest Points** — same pattern, custom comparator. Shows that heaps generalize to any ordering key.
5. **Then #347 Top K Frequent** — combines hash map + heap in a classic two-step. Very common interview pattern.
6. **Then #295 Find Median** — the two-heaps pattern. Save this for last among the first-pass problems; it requires maintaining two invariants at once.
7. **Return to #621, #355, #23** after you've seen some graphs — they share scheduling and merge patterns that become more natural then.

---

> **JavaScript/TypeScript Note**: JavaScript has no built-in heap. In LeetCode TypeScript solutions, use `import { MinPriorityQueue, MaxPriorityQueue } from "@datastructures-js/priority-queue"`. The three methods you need are `enqueue(val)`, `dequeue().element`, and `front().element`. For custom ordering (e.g. by distance or frequency), pass a `priority` function: `new MinPriorityQueue({ priority: (x) => x.dist })`. When mentioning complexity in interviews, always state "assuming O(log n) heap operations" to show you understand the underlying structure.
