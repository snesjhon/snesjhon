# Sliding Window Maximum - Solutions Guide

## Solution Approaches

This guide contains the actual implementations. Make sure you've studied the concepts guide and attempted the problem before looking at these solutions!

---

## Approach 1: Brute Force

**Time Complexity:** O((n - k + 1) × k) = O(nk)
**Space Complexity:** O(1) excluding output array

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];

  // For each possible window starting position
  for (let i = 0; i <= nums.length - k; i++) {
    // Find max in window [i, i+k-1]
    let max = nums[i];
    for (let j = i; j < i + k; j++) {
      max = Math.max(max, nums[j]);
    }
    result.push(max);
  }

  return result;
}
```

**How it Works:**

1. For each starting position i from 0 to n-k
2. Find the maximum in the window [i, i+k-1]
3. Add that maximum to the result array

**Complexity Analysis:**

- Outer loop: (n - k + 1) iterations
- Inner loop: k iterations per window
- Total: O((n - k + 1) × k) ≈ O(nk)

**When to Use:**
- Only for understanding the problem
- Very small k values (k ≤ 3)
- Never in production for large inputs

**Example Trace: nums = [1,3,-1,-3,5], k = 3**

```
i=0: Window [1, 3, -1]
  j=0: max = 1
  j=1: max = max(1, 3) = 3
  j=2: max = max(3, -1) = 3
  result = [3]

i=1: Window [3, -1, -3]
  j=1: max = 3
  j=2: max = max(3, -1) = 3
  j=3: max = max(3, -3) = 3
  result = [3, 3]

i=2: Window [-1, -3, 5]
  j=2: max = -1
  j=3: max = max(-1, -3) = -1
  j=4: max = max(-1, 5) = 5
  result = [3, 3, 5]

Result: [3, 3, 5] ✓
```

---

## Approach 2: Monotonic Deque (Optimal)

**Time Complexity:** O(n)
**Space Complexity:** O(k)

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // Stores indices, not values

  for (let i = 0; i < nums.length; i++) {
    // Remove indices that are out of the current window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }

    // Remove indices whose values are smaller than current element
    // (they will never be the maximum)
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    // Add current index to the deque
    deque.push(i);

    // Once we've processed at least k elements, start adding to result
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}
```

**How it Works:**

1. **Initialize:**
   - `result`: Array to store maximum of each window
   - `deque`: Array used as deque to store indices

2. **For Each Element:**
   - Remove old indices (outside current window) from front
   - Remove indices with smaller values from back
   - Add current index to back
   - If window is full (i >= k-1), add max to result

3. **Why This Works:**
   - Deque maintains indices in decreasing order of VALUES
   - Front of deque always has index of maximum element
   - Each element added once, removed at most once → O(n)

**Key Operations:**

```typescript
// Remove from front (old elements)
deque.shift()

// Remove from back (smaller elements)
deque.pop()

// Add to back (new element)
deque.push(i)

// Peek front (get maximum)
nums[deque[0]]
```

**Example Trace: nums = [1,3,-1,-3,5,3,6,7], k = 3**

```
Initial:
nums:   [1, 3, -1, -3, 5, 3, 6, 7]
index:   0  1   2   3  4  5  6  7
deque: []
result: []

i=0, value=1:
  Remove old: none
  Remove smaller: none (deque empty)
  Add: push 0
  deque: [0]  (values: [1])
  Window not full (i < 2)

i=1, value=3:
  Remove old: none
  Remove smaller: nums[0]=1 < 3, pop 0
  Add: push 1
  deque: [1]  (values: [3])
  Window not full

i=2, value=-1:
  Remove old: none
  Remove smaller: nums[1]=3 > -1, keep it
  Add: push 2
  deque: [1, 2]  (values: [3, -1])
  Window FULL! Add nums[deque[0]] = nums[1] = 3
  result: [3]

i=3, value=-3:
  Remove old: deque[0]=1, is 1 < 3-3+1=1? NO, keep it
  Remove smaller: nums[2]=-1 > -3, keep it
  Add: push 3
  deque: [1, 2, 3]  (values: [3, -1, -3])
  Add nums[deque[0]] = nums[1] = 3
  result: [3, 3]

i=4, value=5:
  Remove old: deque[0]=1, is 1 < 4-3+1=2? YES, shift
  deque: [2, 3]
  Remove old: deque[0]=2, is 2 < 2? NO, keep
  Remove smaller: nums[3]=-3 < 5, pop 3
  Remove smaller: nums[2]=-1 < 5, pop 2
  deque: []
  Add: push 4
  deque: [4]  (values: [5])
  Add nums[deque[0]] = nums[4] = 5
  result: [3, 3, 5]

i=5, value=3:
  Remove old: deque[0]=4, is 4 < 5-3+1=3? NO, keep
  Remove smaller: nums[4]=5 > 3, keep
  Add: push 5
  deque: [4, 5]  (values: [5, 3])
  Add nums[deque[0]] = nums[4] = 5
  result: [3, 3, 5, 5]

i=6, value=6:
  Remove old: deque[0]=4, is 4 < 6-3+1=4? NO, keep
  Remove smaller: nums[5]=3 < 6, pop 5
  Remove smaller: nums[4]=5 < 6, pop 4
  deque: []
  Add: push 6
  deque: [6]  (values: [6])
  Add nums[deque[0]] = nums[6] = 6
  result: [3, 3, 5, 5, 6]

i=7, value=7:
  Remove old: deque[0]=6, is 6 < 7-3+1=5? NO, keep
  Remove smaller: nums[6]=6 < 7, pop 6
  deque: []
  Add: push 7
  deque: [7]  (values: [7])
  Add nums[deque[0]] = nums[7] = 7
  result: [3, 3, 5, 5, 6, 7]

Final Result: [3, 3, 5, 5, 6, 7] ✓
```

**Visual Window Movement:**

```
i=0: [1] 3  -1  -3  5  3  6  7     deque=[0]
i=1: [1  3] -1  -3  5  3  6  7     deque=[1]
i=2: [1  3  -1]-3  5  3  6  7     deque=[1,2]    → result=[3]
i=3:  1 [3  -1  -3] 5  3  6  7     deque=[1,2,3]  → result=[3,3]
i=4:  1  3 [-1  -3  5] 3  6  7     deque=[4]      → result=[3,3,5]
i=5:  1  3  -1 [-3  5  3] 6  7     deque=[4,5]    → result=[3,3,5,5]
i=6:  1  3  -1  -3 [5  3  6] 7     deque=[6]      → result=[3,3,5,5,6]
i=7:  1  3  -1  -3  5 [3  6  7]    deque=[7]      → result=[3,3,5,5,6,7]
```

---

## Alternative: Using Array as Deque with Pointers

More efficient than using shift() which is O(k):

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = [];
  let front = 0; // Front pointer

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside current window from front
    while (front < deque.length && deque[front] < i - k + 1) {
      front++;
    }

    // Remove indices with smaller values from back
    while (front < deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    // Add current index
    deque.push(i);

    // Add to result if window is full
    if (i >= k - 1) {
      result.push(nums[deque[front]]);
    }
  }

  return result;
}
```

**Optimization:** Using a front pointer instead of `shift()` makes this truly O(n) instead of O(nk) worst case with shift.

---

## Bug Analysis: Original Code

Your original implementation:

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const window: number[] = [];
  for (let right = 0; right < nums.length; right++) {
    const temp: number[] = [];
    let max;
    let leftBoundary = right;
    let rightBoundary = 0;

    while (rightBoundary < k) {
      const boundary = nums[leftBoundary + rightBoundary];
      if (typeof boundary === "undefined") break;
      temp.push(boundary);
      rightBoundary++;
    }

    if (rightBoundary < k) break;

    if (temp.length >= k) {
      temp.forEach((item) => {
        if (!max) {           // BUG: treats 0 as falsy
          max = item;
        } else {
          max = Math.max(item, max);
        }
      });
    }
    if (max !== 0) {          // BUG: skips when max is 0
      window.push(max);
    }
  }
  return window;
}
```

### Problems:

**1. Incorrect Window Logic**

```typescript
let leftBoundary = right;
let rightBoundary = 0;
while (rightBoundary < k) {
  const boundary = nums[leftBoundary + rightBoundary];
  ...
}
```

This creates a window starting at `right` and going forward k positions. But a sliding window should go BACKWARD from current position!

**Correct window at position right:**
```typescript
// Window should be [right-k+1, right]
const windowStart = right - k + 1;
```

**Your window:**
```typescript
// Window is [right, right+k-1]
// This is looking AHEAD, not at current position!
```

**2. The `!max` Bug**

```typescript
if (!max) {
  max = item;
}
```

When `max = 0`, the condition `!max` is `true`, so it overwrites `max` with the next item!

**Example:**
```
temp = [0, -1, -2]

Iteration 1: max undefined, max = 0
Iteration 2: !max is true (0 is falsy!), max = -1  ✗ WRONG!
Iteration 3: !max is false, max = Math.max(-1, -2) = -1
Result: -1 (should be 0!)
```

**Fix:** Use `max === undefined`

**3. The `max !== 0` Bug**

```typescript
if (max !== 0) {
  window.push(max);
}
```

This skips pushing when `max` is exactly 0!

**Example:**
```
Input: [0, 0, 0], k = 2
Expected: [0, 0]
Your code: [] (nothing pushed!)
```

**Fix:** Use `max !== undefined`

**4. Inefficient Approach**

Even fixing the bugs, your approach is O(nk):
- For each position: O(n)
- Calculate max of k elements: O(k)
- Total: O(nk)

The monotonic deque approach is O(n).

---

## Complete Fixed Version of Original Approach

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];

  for (let i = 0; i <= nums.length - k; i++) {
    let max: number | undefined = undefined;

    for (let j = i; j < i + k; j++) {
      if (max === undefined) {
        max = nums[j];
      } else {
        max = Math.max(max, nums[j]);
      }
    }

    if (max !== undefined) {
      result.push(max);
    }
  }

  return result;
}
```

This fixes all the bugs but is still O(nk).

---

## Comparison of Approaches

| Aspect                  | Brute Force | Monotonic Deque |
| ----------------------- | ----------- | --------------- |
| Time Complexity         | O(nk)       | O(n)            |
| Space Complexity        | O(1)        | O(k)            |
| Each Element Processed  | k times     | At most twice   |
| Implementation Difficulty| Easy       | Medium          |
| Edge Case Handling      | Simple      | Careful         |
| Interview Recommended   | No          | Yes (optimal)   |

**Operation Counts for n=10,000, k=1,000:**

- Brute Force: ~10,000,000 operations
- Monotonic Deque: ~20,000 operations

---

## Advanced Optimizations

### 1. Using Deque Class (if available)

```typescript
class Deque<T> {
  private items: T[] = [];
  private front = 0;

  pushBack(item: T): void {
    this.items.push(item);
  }

  popBack(): T | undefined {
    return this.items.pop();
  }

  popFront(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[this.front++];
  }

  peekFront(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[this.front];
  }

  peekBack(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.front >= this.items.length;
  }
}

function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque = new Deque<number>();

  for (let i = 0; i < nums.length; i++) {
    // Remove old indices
    while (!deque.isEmpty() && deque.peekFront()! < i - k + 1) {
      deque.popFront();
    }

    // Remove smaller values
    while (!deque.isEmpty() && nums[deque.peekBack()!] < nums[i]) {
      deque.popBack();
    }

    deque.pushBack(i);

    if (i >= k - 1) {
      result.push(nums[deque.peekFront()!]);
    }
  }

  return result;
}
```

### 2. Early Termination for Sorted Arrays

```typescript
// If array is sorted descending, answer is simple
function maxSlidingWindow(nums: number[], k: number): number[] {
  // Check if descending
  let isDescending = true;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i-1]) {
      isDescending = false;
      break;
    }
  }

  if (isDescending) {
    // Maximum is always the leftmost element in window
    return nums.slice(0, nums.length - k + 1);
  }

  // Otherwise, use monotonic deque approach
  // ... (implementation above)
}
```

This optimization rarely helps in practice but shows understanding.

---

## Complete Solution with Edge Case Handling

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  // Edge cases
  if (nums.length === 0) return [];
  if (k === 0) return [];
  if (k === 1) return nums;
  if (k >= nums.length) return [Math.max(...nums)];

  const result: number[] = [];
  const deque: number[] = [];
  let front = 0;

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside current window
    while (front < deque.length && deque[front] < i - k + 1) {
      front++;
    }

    // Remove indices with smaller values
    while (front < deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    // Add current index
    deque.push(i);

    // Add maximum to result when window is complete
    if (i >= k - 1) {
      result.push(nums[deque[front]]);
    }
  }

  return result;
}
```

---

## Variant: Sliding Window Minimum

Same approach, just reverse the comparison:

```typescript
function minSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = [];
  let front = 0;

  for (let i = 0; i < nums.length; i++) {
    while (front < deque.length && deque[front] < i - k + 1) {
      front++;
    }

    // Change: remove indices with LARGER values (not smaller)
    while (front < deque.length && nums[deque[deque.length - 1]] > nums[i]) {
      deque.pop();
    }

    deque.push(i);

    if (i >= k - 1) {
      result.push(nums[deque[front]]);
    }
  }

  return result;
}
```

The deque is now monotonic INCREASING instead of decreasing!

---

## Testing Your Solution

### Test Cases:

```typescript
// Basic cases
console.log(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3));
// [3,3,5,5,6,7]

console.log(maxSlidingWindow([1], 1));
// [1]

console.log(maxSlidingWindow([1,-1], 1));
// [1,-1]

console.log(maxSlidingWindow([9,11], 2));
// [11]

// Edge cases
console.log(maxSlidingWindow([1,3,1,2,0,5], 3));
// [3,3,2,5]

console.log(maxSlidingWindow([7,2,4], 2));
// [7,4]

// All same
console.log(maxSlidingWindow([4,4,4,4], 2));
// [4,4,4]

// Negative numbers
console.log(maxSlidingWindow([-7,-8,7,5,7,1,6,0], 4));
// [7,7,7,7,7]

// With zeros (this was your bug!)
console.log(maxSlidingWindow([0,0,0], 2));
// [0,0]

console.log(maxSlidingWindow([-1,0,-1], 1));
// [-1,0,-1]

// Sorted ascending
console.log(maxSlidingWindow([1,2,3,4,5], 3));
// [3,4,5]

// Sorted descending
console.log(maxSlidingWindow([5,4,3,2,1], 3));
// [5,4,3]

// k equals array length
console.log(maxSlidingWindow([1,3,5,2,4], 5));
// [5]

// Large k
console.log(maxSlidingWindow([1,2,3], 4));
// [] (window larger than array)
```

### Expected Outputs:

All test cases above show expected outputs in comments.

---

## Debugging Checklist

When your solution doesn't work, check:

- [ ] Are you storing indices or values in the deque?
- [ ] Are you removing old indices from the front correctly?
- [ ] Is your window boundary calculation correct? (i - k + 1)
- [ ] Are you maintaining decreasing order (removing smaller from back)?
- [ ] Are you handling the case when max is 0 or negative?
- [ ] Are you starting to add to result at the right time? (i >= k - 1)
- [ ] Are you using shift() causing O(nk) performance?
- [ ] Did you test all edge cases?

---

## Common Mistakes and Fixes

### Mistake 1: Using shift()

```typescript
// Slow: O(k) per shift
deque.shift();

// Fast: O(1) with front pointer
let front = 0;
while (front < deque.length && ...) {
  front++;
}
```

### Mistake 2: Storing Values

```typescript
// Wrong
deque.push(nums[i]);

// Correct
deque.push(i);
```

### Mistake 3: Wrong Window Check

```typescript
// Wrong: off by one
while (deque[0] < i - k) { ... }

// Correct
while (deque[0] < i - k + 1) { ... }
```

### Mistake 4: Wrong Comparison

```typescript
// Wrong: removes equal values
while (nums[deque[back]] <= nums[i]) { ... }

// Correct: keeps equal values
while (nums[deque[back]] < nums[i]) { ... }
```

### Mistake 5: Starting Result Too Early

```typescript
// Wrong: adds when window not full
if (i >= k) { result.push(...) }

// Correct
if (i >= k - 1) { result.push(...) }
```

---

## Complexity Proof

**Why is this O(n)?**

**Claim:** Each element is added to and removed from the deque at most once.

**Proof:**
1. Each element nums[i] is added to deque exactly once (at iteration i)
2. Each element can be removed at most once:
   - Either removed from back (when larger element arrives)
   - Or removed from front (when it exits window)
   - But not both (once removed, it's gone)
3. Total operations: n additions + n removals = 2n = O(n)

**Why the while loops don't make it O(n²):**

The while loops remove elements from the deque. Key insight: **the total number of removals across ALL iterations is bounded by n**, because each element can only be removed once.

---

## Key Takeaways

1. **Pattern Recognition:** Fixed-size sliding window + need for efficient max/min = monotonic deque
2. **Store Indices:** Not values, because you need to check window boundaries
3. **Monotonic Decreasing:** Maintain this property by removing smaller elements
4. **Two-End Operations:** Remove old from front, remove useless from back
5. **Amortized O(1):** Each element processed at most twice total
6. **Edge Cases:** Handle k=1, k=n, zeros, negatives, empty arrays
7. **Window Boundary:** Element at index j is in window ending at i if `j >= i - k + 1`

---

## Next Steps

After mastering this solution:

1. Implement from scratch without looking
2. Solve the min window variant
3. Practice explaining the monotonic property
4. Try related problems (see concepts guide)
5. Teach someone else - solidifies understanding

Remember: The monotonic deque pattern is reusable! Once you understand it here, you can apply it to many other problems.
