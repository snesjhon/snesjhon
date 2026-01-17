# 973. K Closest Points to Origin

## Problem Link
[LeetCode 973](https://leetcode.com/problems/k-closest-points-to-origin/)

## Difficulty
Medium

## Interview Relevance
**Task 2 Optimization**: The interview used Haversine distance for coordinates. This problem teaches distance-based sorting and selection - a key heuristic for reducing `calculateEta` calls.

---

## Problem Statement

Given an array of points on a 2D plane, return the `k` closest points to the origin (0, 0).

```
Input: points = [[1,3],[-2,2]], k = 1
Output: [[-2,2]]
Explanation: Distance of (1,3) = sqrt(10), (-2,2) = sqrt(8). Closest is (-2,2).
```

---

## Prerequisites

| Concept | Resource | Status |
|---------|----------|--------|
| Distance formulas | Math knowledge | [x] |
| Heaps/Priority Queues | [[phe-redux/01-weekly-plan\|Week 3]] | [ ] |

---

## Core Concepts

### 1. Euclidean Distance
```typescript
// Full formula
const distance = Math.sqrt(x*x + y*y);

// Optimization: Compare squared distances (avoids sqrt)
const distSquared = x*x + y*y;
```

### 2. Haversine Distance (Interview Used This)
The interview's `ETACalculator.haversine` computes distance between lat/lon coordinates. Same concept - distance-based selection.

### 3. Max-Heap for K Smallest
Use a **max-heap** of size K to keep K smallest distances.

**Why max-heap for smallest?**
- We want to keep K smallest
- Max-heap lets us efficiently remove the largest
- When heap size > K, remove the maximum
- What remains are the K smallest

---

## Approaches

### Approach 1: Max-Heap (O(n log k))
1. For each point, compute distance
2. Push to max-heap
3. If heap size > k, pop the maximum
4. Heap contains k closest

### Approach 2: QuickSelect (O(n) average)
1. Partition around a pivot distance
2. Recurse into appropriate half
3. Average O(n), worst O(n²)

---

## Algorithm Skeleton

```typescript
function kClosest(points: number[][], k: number): number[][] {
  // Step 1: Create max-heap (by distance)
  // Use negative distance for min-heap as max-heap

  // Step 2: Process each point
  // Compute distance, push to heap
  // If size > k, pop the farthest

  // Step 3: Extract points from heap
  // Return the k closest points
}
```

---

## Key Insights

1. **Compare squared distances**: Avoid expensive sqrt
2. **Max-heap for min-k**: Pop the largest to keep smallest
3. **Distance is the key**: Not the points themselves
4. **Heuristic for interview**: Sort by straight-line distance before expensive `calculateEta`

---

## Interview Application

In the Byteboard interview, you could optimize `suggestMidpointActivity` by:

```typescript
// HEURISTIC: Sort activities by straight-line distance first
const sortedActivities = activities.sort((a, b) => {
  const distA = haversine(midpoint, a.coordinates);
  const distB = haversine(midpoint, b.coordinates);
  return distA - distB;
});

// Only call expensive calculateEta on closest candidates
for (const activity of sortedActivities.slice(0, 10)) {
  // Now call the expensive API
  const eta = etaCalculator.calculateEta(...);
}
```

This pattern reduces API calls from O(n) to O(k).

---

## Complexity

| Approach | Time | Space |
|----------|------|-------|
| Max-Heap | O(n log k) | O(k) |
| QuickSelect | O(n) avg | O(1) |
| Sort All | O(n log n) | O(n) |

---

## Related Problems

- [[phe-redux/problems/347-top-k-frequent\|347. Top K Frequent Elements]] - Same heap pattern
- 215. Kth Largest Element
- 658. Find K Closest Elements

---

## Connection to Byteboard Interview

The `calculateEta` function in the interview computed travel time. Before calling this expensive function, you could use cheap straight-line distance (like this problem) to pre-filter activities, only computing exact ETAs for the closest candidates.
