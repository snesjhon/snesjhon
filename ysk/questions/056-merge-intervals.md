# 056 - Merge Intervals

#leetcode/medium #pattern/intervals #concept/arrays #concept/sorting
#progress/understood

**Problem:** Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals.

**Related Concepts:**
- [[arrays]] - Working with 2D arrays
- Sorting - Key to simplifying the problem
- Greedy algorithms - Local decisions lead to global solution

**Related Problems:**
- Insert Interval
- Meeting Rooms
- Meeting Rooms II
- Non-overlapping Intervals

---

## Problem Statement

```
Input: [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: [1,3] and [2,6] overlap → merge to [1,6]

Input: [[1,4],[4,5]]
Output: [[1,5]]
Explanation: [1,4] and [4,5] touch → merge to [1,5]

Input: [[1,4],[0,4]]
Output: [[0,4]]
Explanation: [0,4] contains [1,4]
```

---

## Mental Model

### The Core Question

Before writing any code: **"How do I know if two intervals overlap?"**

### Visualizing Overlaps

Draw intervals on a timeline:

```
Case 1: Overlapping
[1, 3]
    [2, 6]
Result: [1, 6]

Case 2: One contains another
[1, 6]
  [2, 4]
Result: [1, 6]

Case 3: Not overlapping
[1, 3]
        [5, 7]
Result: [1, 3], [5, 7]

Case 4: Adjacent (touching)
[1, 3]
      [3, 5]
Result: [1, 5] ← They merge!
```

### Key Insight #1: When Do Intervals Overlap?

Think about when they **DON'T** overlap first:
- `[a, b]` completely before `[c, d]`: `b < c`
- `[c, d]` completely before `[a, b]`: `d < a`

So they **DO overlap** when neither is true!

Or more simply (if sorted): **`b >= c`**

### Key Insight #2: Sorting Makes It Easy

**Without sorting:**
```
[[8,10], [1,3], [2,6], [15,18]]
     ↓
You'd have to compare each with every other one! O(n²)
```

**With sorting by start time:**
```
[[1,3], [2,6], [8,10], [15,18]]
   ↓
Only check if current overlaps with the most recent merged interval!
```

**Why sorting works:**
- After sorting, intervals are in start-time order
- Only need to check if current overlaps with most recent
- If current doesn't overlap with most recent, it won't overlap with earlier ones

---

## The Algorithm Strategy (No Code Yet!)

1. **Sort intervals** by start time
2. **Initialize result** with first interval
3. **For each remaining interval:**
   - Does it overlap with last interval in result?
   - **Yes:** Merge them (extend the end time)
   - **No:** Add as new interval to result
4. **Return result**

---

## Solution

**Time:** O(n log n) | **Space:** O(n)

```typescript
function merge(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;

  // Sort by start time
  intervals.sort((a, b) => a[0] - b[0]);

  const result: number[][] = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const lastMerged = result[result.length - 1];

    // Check if current overlaps with last merged interval
    if (current[0] <= lastMerged[1]) {
      // Overlapping: merge by extending end time
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      // Not overlapping: add as new interval
      result.push(current);
    }
  }

  return result;
}
```

### Walkthrough: `[[1,3],[2,6],[8,10],[15,18]]`

```
After sorting: [[1,3],[2,6],[8,10],[15,18]]

Step 1: result = [[1,3]]

Step 2: current=[2,6], lastMerged=[1,3]
  2 <= 3? YES → overlapping
  Merge: [1, max(3,6)] = [1,6]
  result = [[1,6]]

Step 3: current=[8,10], lastMerged=[1,6]
  8 <= 6? NO → not overlapping
  Add new: result = [[1,6],[8,10]]

Step 4: current=[15,18], lastMerged=[8,10]
  15 <= 10? NO → not overlapping
  Add new: result = [[1,6],[8,10],[15,18]]

Return: [[1,6],[8,10],[15,18]] ✓
```

---

## Understanding the Overlap Check

### Why `current[0] <= lastMerged[1]`?

```
lastMerged:    [---]
                 1  3

Case 1: current=[2,6]
           [-----]
           2    6
  2 <= 3? YES → Overlap!

Case 2: current=[4,7]
               [---]
               4   7
  4 <= 3? NO → No overlap

Case 3: current=[3,5]  (touching)
              [---]
              3   5
  3 <= 3? YES → Overlap! (touching counts)
```

### Why `Math.max(lastMerged[1], current[1])`?

```
lastMerged: [1, 6]
current:      [2, 4]  ← contained within

Should merge to: [1, 6] (not [1, 4]!)

current[1]=4 < lastMerged[1]=6
So use max(6, 4) = 6 ✓
```

---

## Common Mistakes & Debugging

### Mistake 1: Forgetting to Sort

```typescript
// ❌ Without sorting
[[8,10], [1,3], [2,6]]
  ↓
[8,10] doesn't overlap with [1,3]
Result: [[8,10], [1,3], ...] ❌ Wrong!
```

**Fix:** Always sort first!

### Mistake 2: Wrong Overlap Condition

```typescript
// ❌ Wrong: using < instead of <=
if (current[0] < lastMerged[1])

// Problem: [1,3] and [3,5] won't merge
// 3 < 3 is false!

// ✅ Correct: use <=
if (current[0] <= lastMerged[1])
```

### Mistake 3: Not Using max() When Merging

```typescript
// ❌ Wrong
lastMerged[1] = current[1];

// Problem: [1,6] + [2,4] → [1,4] ❌
// Lost the larger end time!

// ✅ Correct
lastMerged[1] = Math.max(lastMerged[1], current[1]);
```

### Mistake 4: Mutating Original Array

```typescript
// ❌ Mutating in place
const lastMerged = result[result.length - 1];
lastMerged[1] = ...  // ← This mutates result array ✓ Actually OK!

// This is actually fine since we want to update result
// Just be aware you're modifying the array
```

---

## Debugging Thought Process

When your solution fails:

### 1. Check Sorting
```typescript
console.log("After sort:", intervals);
// Should be in ascending order by start time
```

### 2. Check Overlap Logic
```typescript
console.log(`current=[${current}], last=[${lastMerged}]`);
console.log(`${current[0]} <= ${lastMerged[1]}?`, current[0] <= lastMerged[1]);
```

### 3. Check Merge Logic
```typescript
console.log(`Merging to: [${lastMerged[0]}, ${Math.max(lastMerged[1], current[1])}]`);
```

### 4. Test Edge Cases
- Empty array: `[]`
- Single interval: `[[1,3]]`
- All overlapping: `[[1,3],[2,4],[3,5]]` → `[[1,5]]`
- None overlapping: `[[1,2],[3,4],[5,6]]` → same
- Contained: `[[1,5],[2,3]]` → `[[1,5]]`
- Touching: `[[1,3],[3,5]]` → `[[1,5]]`

---

## Aha Moments

### Aha #1: Sorting Unlocks Greedy Solution

Unsorted = must compare all pairs = O(n²)
Sorted = only compare with last merged = O(n)

### Aha #2: In-Place Update is OK

We can modify `result[result.length - 1]` directly:
```typescript
const lastMerged = result[result.length - 1]; // reference!
lastMerged[1] = ...  // modifies result array
```

This is intentional and efficient!

### Aha #3: Touching Intervals Merge

`[1,3]` and `[3,5]` should merge to `[1,5]`:
- That's why we use `<=` not `<`
- Adjacent intervals with no gap should merge

---

## Pattern Recognition

This pattern appears in:
- **Calendar/scheduling problems** - meetings, events
- **Range merging** - IP ranges, time slots
- **Interval queries** - databases, caching

**Keywords to watch for:**
- "Merge overlapping..."
- "Combine intervals..."
- "Schedule/meetings..."
- "Non-overlapping..."

---

## Related Interval Problems

### Meeting Rooms
- **Question:** Can you attend all meetings?
- **Approach:** Sort, check if any overlap
- **Easier than merge** - just detection

### Insert Interval
- **Question:** Insert new interval and merge
- **Approach:** Similar logic, but insert first
- **Same pattern** - sorting + merging

### Meeting Rooms II
- **Question:** Minimum rooms needed
- **Approach:** Sort, use heap/priority queue
- **Harder** - needs different data structure

---

## Complexity Analysis

**Time Complexity:** O(n log n)
- Sorting: O(n log n)
- Merging: O(n) - single pass
- Total: O(n log n) ← dominated by sort

**Space Complexity:** O(n)
- Result array: O(n) worst case (no merges)
- Sorting space: O(log n) to O(n) depending on algorithm
- Total: O(n)

---

## My Learning Journey

**Understanding** ✅
- ✅ Grasp overlap condition
- ✅ Know why sorting helps
- ✅ Understand greedy approach
- ✅ Can identify edge cases

**Implementation** ✅
- ✅ Can code from scratch
- ✅ Handle all edge cases
- ✅ Debug when tests fail

**Pattern Recognition** 🎯
- Apply to meeting rooms problems
- Recognize interval patterns
- Optimize related problems

---

## Key Takeaways

1. **Sorting transforms O(n²) to O(n log n)**
2. **Overlap check: `start <= lastEnd`**
3. **Merge: extend end to `max(end1, end2)`**
4. **Touching intervals merge** (use `<=` not `<`)
5. **Greedy works** - only compare with last merged
6. **Draw it out** - visual timeline helps!

---

**Remember:** Sort first, then merge is simple! Always visualize intervals on a timeline to understand overlap.
