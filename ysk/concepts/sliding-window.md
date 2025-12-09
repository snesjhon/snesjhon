# Sliding Window

#concept/pattern #concept/algorithm

A technique for solving array/string problems by maintaining a dynamic window that slides through the data.

## Core Idea

Instead of recalculating everything for each subarray, maintain a "window" that slides through the array, adding/removing elements efficiently.

## Visual Example

```
Array: [1, 3, 2, 5, 8, 1]
Window size: 3

[1, 3, 2] 5, 8, 1    sum=6
 1,[3, 2, 5] 8, 1    sum=10
 1, 3,[2, 5, 8] 1    sum=15
 1, 3, 2,[5, 8, 1]   sum=14
```

Instead of recalculating sum each time, just:

- Remove leftmost element
- Add rightmost element

## Window Types

### 1. Fixed-Size Window

Window size stays constant, slides through array.

```typescript
// Example: Maximum sum of k consecutive elements
function maxSum(arr: number[], k: number): number {
  let windowSum = 0;
  let maxSum = 0;

  // Initial window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;

  // Slide window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i]; // Remove left, add right
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}
```

### 2. Variable-Size Window

Window expands and contracts based on conditions.

```typescript
// Example: Longest substring without repeating characters
function lengthOfLongestSubstring(s: string): number {
  const seen = new Set<string>();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    // Shrink window if duplicate found
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }

    seen.add(s[right]);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
```

## When to Use Sliding Window

Look for these keywords/patterns:

- "Longest substring..."
- "Maximum sum subarray..."
- "Minimum window..."
- "Contiguous elements"
- "k consecutive elements"
- Any problem asking about subarrays/substrings with specific properties

## Two-Pointer vs Sliding Window

**Sliding Window** is actually a specialized form of [[two-pointers]]:

- Both pointers usually move in same direction (left to right)
- Window represents range between pointers
- Focus on optimizing subarray/substring operations

## Common Patterns

### Pattern 1: Fixed Window Maximum/Minimum

Find max/min sum of k consecutive elements.

### Pattern 2: Variable Window with Constraint

Find longest/shortest subarray meeting a condition.

### Pattern 3: Window with Hash Map

Track frequency of elements in current window.

```typescript
const freq = new Map<string, number>();
// Expand window
freq.set(char, (freq.get(char) || 0) + 1);

// Shrink window
freq.set(char, freq.get(char) - 1);
if (freq.get(char) === 0) freq.delete(char);
```

## Optimization: From O(n²) to O(n)

```typescript
// Brute Force: O(n²)
for (let i = 0; i < n; i++) {
  for (let j = i; j < n; j++) {
    // Check subarray [i...j]
  }
}

// Sliding Window: O(n)
let left = 0;
for (let right = 0; right < n; right++) {
  // Expand window
  while (needToShrink) {
    left++; // Shrink window
  }
}
```

## Related Concepts

- [[two-pointers]] - Sliding window is a specialized form
- [[hash-maps]] - Often used together for tracking window contents
- arrays - Primary data structure

## Questions Using Sliding Window

- [[003-longest-substring]] ⭐ Classic variable window
- [[239-sliding-window-maximum]] 🔥 Advanced with deque
- Fixed window maximum sum problems
- Minimum window substring

## My Understanding

✅ Understand fixed vs variable window
✅ Know when to expand vs shrink
✅ Can combine with hash map for tracking
🎯 Need more practice with optimization problems

---

**Key Insight**: If you're checking all subarrays/substrings with nested loops, consider if sliding window can optimize to O(n)!
