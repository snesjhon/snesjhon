---
description: Given an array of integers and a target value, find two numbers that add up to the target and return their indices.
---
# 001 - Two Sum

#pattern/hash-map #concept/hash-maps #concept/arrays 

**Problem:** Given an array of integers and a target value, find two numbers that add up to the target and return their indices.

**Related Concepts:**

- [[hash-maps]] - Primary solution technique
- [[two-pointers]] - Alternative for sorted arrays
- [[arrays]] - Data structure

**Related Problems:**

- Two Sum II (sorted array) - Use two pointers
- 3Sum - Extension to three numbers
- 4Sum - Further extension

---

## Problem Statement

```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9
```

**Constraints:**

- 2 <= nums.length <= 10⁴
- Exactly one solution exists
- Cannot use same element twice

---

## Mental Model

### The Key Insight: Think in Complements

Instead of checking all possible pairs, ask: **"Have I already seen the complement of this number?"**

```
If: a + b = target
Then: b = target - a
```

**Example Walkthrough:** `nums = [2, 7, 11, 15]`, `target = 9`

```
i=0: number=2, complement=7, map={}, not found → map={2:0}
i=1: number=7, complement=2, map={2:0}, FOUND! → return [0,1]
```

---

## Solution 1: Brute Force (Learning)

**Time:** O(n²) | **Space:** O(1)

```typescript
function twoSum(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}
```

**How it Works:**

- Check every possible pair
- Outer loop picks first number
- Inner loop picks second number

**Pros:** Simple and intuitive
**Cons:** Inefficient - 10,000 elements = 100M operations

---

## Solution 2: Hash Map (Optimal) ⭐

**Time:** O(n) | **Space:** O(n)

```typescript
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }

    map.set(nums[i], i);
  }

  return [];
}
```

**How it Works:**

1. Single pass through array
2. For each number, calculate needed complement
3. Check if complement exists in hash map
4. If found: return both indices
5. If not: store current number and index for future

**Why It's Fast:**

- Hash map lookup: O(1)
- Single pass: O(n)
- Total: O(n)

---

## Comparison

| Aspect           | Brute Force | Hash Map   |
| ---------------- | ----------- | ---------- |
| Time Complexity  | O(n²)       | O(n)       |
| Space Complexity | O(1)        | O(n)       |
| Passes           | 2 (nested)  | 1          |
| Best for         | Learning    | Production |

**Performance Difference:**

- 100 elements: 10,000 ops vs 100 ops
- 10,000 elements: 100M ops vs 10,000 ops

---

## Core Concepts Learned

### 1. The Complement Pattern

This pattern appears in many problems:

- Instead of searching for pairs, search for the "missing piece"
- Applicable to many sum-based problems
- Foundation for 3Sum, 4Sum, etc.

### 2. Hash Maps for Fast Lookup

- **What:** Data structure with O(1) lookups
- **Why:** Trade space (storing data) for time (fast access)
- **When:** Need to check "have I seen this before?"

### 3. Time-Space Tradeoff

- Brute force: Low space, high time
- Hash map: Higher space, low time
- Understanding when each is appropriate

### 4. Single-Pass Optimization

- Process data in one iteration
- More efficient than nested loops
- Common optimization technique

---

## Common Mistakes & Edge Cases

### Mistakes to Avoid:

1. **Using same element twice**

    ```typescript
    // Wrong: might return same index twice
    if (nums[i] + nums[i] === target)

    // Right: check different indices
    if (i !== j && nums[i] + nums[j] === target)
    ```

2. **Not handling duplicates correctly**
    ```typescript
    [3, 3], target = 6  // Should return [0, 1]
    ```

### Edge Cases:

- Duplicates: `[3, 3]` target `6` ✓
- Negative numbers: `[-1, -2, -3]` target `-5`
- Zero: `[0, 4, 3, 0]` target `0`
- Minimum size: 2 elements

---

## Practice Exercises

### Exercise 1: Variations

1. Return all pairs (not just one) that sum to target
2. Handle case where no solution exists
3. Use regular object `{}` instead of `Map`

### Exercise 2: Optimization

Improve brute force to have fewer iterations:

```typescript
// Hint: start j from i + 1, not 0
for (let j = i + 1; j < nums.length; j++)
```

### Exercise 3: Different Approach

Solve using:

1. Sorting + two pointers (O(n log n) time, O(1) space)
2. Set instead of Map

---

## My Learning Journey

**Phase 1: Foundation** ✅

- ✅ Understand the problem
- ✅ Implement brute force
- ✅ Implement hash map solution
- ✅ Analyze time/space complexity

**Phase 2: Mastery** 🎯

- Can implement from memory without hints
- Explain the complement pattern clearly
- Recognize when to apply this pattern
- Understand tradeoffs between approaches

**Next Steps:**

1. Implement both solutions from memory
2. Try Two Sum II (sorted array) - learn two pointers
3. Try 3Sum - extends this pattern

---

## Key Takeaways

1. **Multiple solutions exist** - Start simple, optimize later
2. **Hash maps enable O(n)** - O(1) lookups are powerful
3. **Think in complements** - Don't search pairs, search missing pieces
4. **Space-time tradeoff** - Sometimes using more space saves time

**Real-world applications:**

- Finding matching transactions in financial systems
- Detecting duplicate entries
- Caching and memoization
- Database indexing

---

**Remember:** Understanding _why_ the hash map solution works is more important than memorizing the code!
