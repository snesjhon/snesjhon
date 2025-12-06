# 239 - Sliding Window Maximum

#pattern/sliding-window #concept/sliding-window #concept/deque

**Problem:** Find the maximum element in each sliding window of size k.

**Related Concepts:**
- [[sliding-window]] - Advanced variable window
- [[arrays]] - Window over array
- Deque - Monotonic decreasing deque

**Related Problems:**
- [[003-longest-substring]] - Basic sliding window
- Min Stack - Similar monotonic structure
- Sliding Window Median

---

## Problem Statement

```
Input: nums = [1,3,-1,-3,5,3,6,7], k = 3
Output: [3,3,5,5,6,7]

Explanation:
Window [1  3  -1] -3  5  3  6  7 → max = 3
Window  1 [3  -1  -3] 5  3  6  7 → max = 3
Window  1  3 [-1  -3  5] 3  6  7 → max = 5
Window  1  3  -1 [-3  5  3] 6  7 → max = 5
Window  1  3  -1  -3 [5  3  6] 7 → max = 6
Window  1  3  -1  -3  5 [3  6  7] → max = 7
```

---

## Mental Model

### The Challenge

For each window of size k, we need the maximum value.

**Naive approach:**
- For each window position: scan k elements
- Time: O(n × k) ← Too slow for large inputs

**Better approach:**
- Maintain maximum as window slides
- Time: O(n) ← Can we achieve this?

### Key Insight: Monotonic Deque

Keep a deque of indices where:
- Elements are in decreasing order of value
- Front of deque = index of current maximum
- Remove indices outside current window
- Remove smaller elements when adding new one

---

## Solution: Monotonic Deque

**Time:** O(n) | **Space:** O(k)

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // stores indices

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside window [i-k+1, i]
    while (deque.length && deque[0] < i - k + 1) {
      deque.shift();
    }

    // Remove indices of smaller elements
    // They'll never be maximum
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    // Add current index
    deque.push(i);

    // Add maximum to result (once window is full)
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}
```

### Walkthrough: `[1,3,-1,-3,5,3,6,7], k=3`

```
i=0, num=1:
  deque=[] → add 0 → deque=[0] (values: [1])
  i < k-1, skip result

i=1, num=3:
  nums[0]=1 < 3, remove 0 → deque=[]
  add 1 → deque=[1] (values: [3])
  i < k-1, skip result

i=2, num=-1:
  nums[1]=3 > -1, keep
  add 2 → deque=[1,2] (values: [3,-1])
  i >= k-1, result=[nums[1]=3]

i=3, num=-3:
  nums[2]=-1 > -3, keep
  add 3 → deque=[1,2,3] (values: [3,-1,-3])
  result=[3, nums[1]=3]

i=4, num=5:
  deque[0]=1 < 4-3+1=2, remove 1 → deque=[2,3]
  nums[3]=-3 < 5, remove 3 → deque=[2]
  nums[2]=-1 < 5, remove 2 → deque=[]
  add 4 → deque=[4] (values: [5])
  result=[3,3, nums[4]=5]

... continues ...
Final: [3,3,5,5,6,7]
```

---

## Why This Works

### Deque Invariant

**Deque maintains:**
1. Indices in increasing order (left to right)
2. Values in decreasing order (left to right)
3. All indices within current window

**Why decreasing values?**
```
If nums[j] < nums[i] and j < i:
  → nums[j] will NEVER be maximum while i is in window
  → Safe to remove j!
```

### Visual Example

```
nums = [3, 1, 5, 2]
k = 3

Building deque:
  Add 3: deque=[3]              (indices, values shown)
  Add 1: 3>1, keep → deque=[3,1]
  Add 5: 1<5 remove, 3<5 remove → deque=[5]
  Maximum window [3,1,5] = 5 ✓

Key: When we add 5, we know 3 and 1 can't be max anymore!
```

---

## Brute Force (For Comparison)

**Time:** O(n × k) | **Space:** O(1)

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];

  for (let i = 0; i <= nums.length - k; i++) {
    let max = nums[i];
    for (let j = i; j < i + k; j++) {
      max = Math.max(max, nums[j]);
    }
    result.push(max);
  }

  return result;
}
```

**Why slow?** Recalculates max for each window from scratch.

---

## Common Mistakes

### Mistake 1: Storing Values Instead of Indices

```typescript
// ❌ Wrong
deque.push(nums[i]); // Storing value

// Problem: Can't check if still in window!
// Need index to check: deque[0] < i - k + 1
```

### Mistake 2: Wrong Window Boundary

```typescript
// ❌ Wrong
while (deque[0] <= i - k) // should be <

// Window [i-k+1, i] has size k
// Remove if deque[0] < i - k + 1
```

### Mistake 3: Wrong Comparison Direction

```typescript
// ❌ Wrong
while (nums[deque[...]] > nums[i]) // should be <

// Want to remove SMALLER elements
// Keep larger ones!
```

---

## Core Concepts

### 1. Monotonic Deque

A deque maintaining elements in monotonic (increasing or decreasing) order.

**Applications:**
- Sliding window maximum/minimum
- Next greater element
- Stock span problem

### 2. Why O(n)?

Each element is:
- Added to deque once: O(n)
- Removed from deque at most once: O(n)
- Total: O(2n) = O(n)

### 3. Deque Operations

```typescript
// JavaScript array as deque:
deque.push(x);      // Add to back
deque.pop();        // Remove from back
deque.unshift(x);   // Add to front
deque.shift();      // Remove from front

// For this problem:
deque.push(i);      // Add new index
deque.pop();        // Remove smaller from back
deque.shift();      // Remove old from front
```

---

## Pattern Recognition

**Use monotonic deque when:**
- Sliding window min/max
- "Next greater/smaller element"
- Maintaining min/max over range
- Can eliminate elements that won't be answer

**Keywords:**
- "Sliding window..."
- "Maximum/minimum in range..."
- "Next greater..."

---

## Practice Exercises

1. **Sliding window minimum** - Same pattern
2. **Next greater element** - Simpler monotonic deque
3. **Largest rectangle in histogram** - Advanced application

---

## My Learning Journey

**Understanding** 🔄
- ✅ Grasp monotonic deque concept
- ✅ Know why O(n) works
- ✅ Understand why we remove smaller elements
- 🎯 Need more practice to internalize

**Implementation** 🔄
- ✅ Can code with reference
- 🎯 Need practice from scratch
- 🎯 Tricky boundary conditions

**Mastery** 🎯
- Practice without hints
- Apply to similar problems
- Recognize pattern quickly

---

## Key Takeaways

1. **Monotonic deque enables O(n) solution**
2. **Store indices, not values** (need to check window bounds)
3. **Remove smaller elements** - they won't be max
4. **Each element added/removed once** - that's why O(n)
5. **Deque front = current maximum** (or its index)

---

**Remember:** Monotonic deque removes elements that can never be the answer!
