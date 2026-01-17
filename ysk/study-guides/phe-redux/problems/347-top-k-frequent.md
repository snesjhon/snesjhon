# 347. Top K Frequent Elements

## Problem Link
[LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/)

## Difficulty
Medium

## Interview Relevance
**Task 1 Enhancement**: While basic filtering doesn't need this, if you wanted to return the "top K best activities" based on some scoring, this pattern applies.

---

## Problem Statement

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.

```
Input: nums = [1,1,1,2,2,3], k = 2
Output: [1,2]
```

---

## Prerequisites

| Concept | Resource | Status |
|---------|----------|--------|
| Hash Maps | Completed in Novice phase | [x] |
| Heaps/Priority Queues | [[phe-redux/01-weekly-plan\|Week 3]] | [ ] |

---

## Core Concepts

### 1. Frequency Counting (Hash Map)
Count occurrences of each element in O(n).

```typescript
const freqMap = new Map<number, number>();
for (const num of nums) {
  freqMap.set(num, (freqMap.get(num) || 0) + 1);
}
```

### 2. Top K Selection (Heap)
Use a min-heap of size K to keep the K most frequent.

**Why min-heap?**
- We want to keep the K largest frequencies
- Min-heap lets us efficiently remove the smallest
- When heap size > K, remove the minimum
- What remains are the K largest

---

## Approaches

### Approach 1: Heap (O(n log k))
1. Build frequency map: O(n)
2. Use min-heap of size k: O(n log k)
3. Extract results: O(k)

### Approach 2: Bucket Sort (O(n))
1. Build frequency map: O(n)
2. Create buckets where index = frequency: O(n)
3. Collect from highest buckets: O(n)

---

## Algorithm Skeleton

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  // Step 1: Count frequencies
  // Use a Map to count occurrences

  // Step 2: Use a min-heap of size k
  // Push [frequency, element] pairs
  // If heap size > k, pop the minimum

  // Step 3: Extract elements from heap
  // Return the k elements remaining
}
```

---

## Key Insights

1. **Two-step process**: First count, then select
2. **Min-heap for max K**: Counterintuitive but efficient
3. **Heap stores pairs**: (frequency, element)
4. **Order doesn't matter**: Return in any order

---

## Common Pitfalls

- Using max-heap and extracting K times (less efficient)
- Forgetting to handle ties in frequency
- Not using a proper heap implementation in JS

---

## Complexity

| Approach | Time | Space |
|----------|------|-------|
| Heap | O(n log k) | O(n) |
| Bucket Sort | O(n) | O(n) |

---

## Related Problems

- [[phe-redux/problems/973-k-closest-points\|973. K Closest Points to Origin]] - Same heap pattern
- 692. Top K Frequent Words
- 215. Kth Largest Element

---

## Connection to Byteboard Interview

The interview's `suggestMidpointActivity` could be enhanced to return "top K suggestions" instead of just one. This problem teaches the pattern for efficiently selecting top K from a scored set.
