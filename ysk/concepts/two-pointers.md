# Two Pointers

#concept/pattern #concept/algorithm

A technique using two pointers to solve array/string problems efficiently, often reducing O(n²) to O(n).

## Core Idea

Instead of nested loops checking all pairs, use two pointers that move based on conditions to find the solution in a single pass.

## Common Patterns

### Pattern 1: Opposite Ends (Converging)

Pointers start at both ends and move toward each other.

```typescript
// Example: Two Sum II (sorted array)
function twoSum(nums: number[], target: number): number[] {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) return [left, right];
    if (sum < target)
      left++; // Need larger sum
    else right--; // Need smaller sum
  }
}
```

**When to use:**

- Array is sorted (or can be sorted)
- Looking for pairs that meet criteria
- Problems involving "closest to target"

### Pattern 2: Same Direction (Fast & Slow)

Both pointers move in same direction at different speeds.

```typescript
// Example: Remove duplicates from sorted array
function removeDuplicates(nums: number[]): number {
  let slow = 0;

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }

  return slow + 1;
}
```

**When to use:**

- In-place array modifications
- Removing elements without extra space
- Partitioning arrays

### Pattern 3: Sliding Window

Both pointers move right, maintaining a window (see [[sliding-window]]).

```typescript
// Example: Longest substring without repeating
function lengthOfLongestSubstring(s: string): number {
  let left = 0;
  let maxLen = 0;
  const seen = new Set();

  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}
```

**When to use:**

- Subarrays/substrings with conditions
- "Longest" or "shortest" substring problems

## When to Use Two Pointers

### Key Indicators:

- Array/string is sorted (or can be sorted)
- Need to find pairs/triplets
- In-place modifications required
- Optimizing from O(n²) nested loops
- Problems with "two" or "pair" in description

### Problem Types:

- Pair sum problems
- Removing duplicates
- Palindrome checking
- Container with most water
- Trapping rain water

## Two Pointers vs Hash Map

Sometimes you can solve the same problem with either approach:

**Two Pointers:**

- ✅ O(1) space
- ✅ Works on sorted arrays
- ❌ Requires sorting if not sorted (O(n log n))

**Hash Map:**

- ✅ O(n) time on unsorted
- ✅ No sorting needed
- ❌ O(n) space

Example: Two Sum

- Unsorted array → Hash map is better
- Sorted array → Two pointers is better

## Visual Example: Converging Pointers

```
Finding pair that sums to 9 in sorted array:

[1, 2, 3, 4, 5, 6, 7, 8]
 ↑                    ↑
 L                    R    sum=9 ✓ Found!

[1, 2, 3, 4, 5, 6, 7, 8]
 ↑              ↑
 L              R          sum=8 < 9, move L→

[1, 2, 3, 4, 5, 6, 7, 8]
    ↑           ↑
    L           R          sum=9 ✓ Found!
```

## Common Mistakes

1. **Not checking boundaries** - `left < right` vs `left <= right`
2. **Wrong pointer movement** - Moving the wrong pointer
3. **Infinite loops** - Forgetting to move pointers
4. **Off-by-one errors** - Especially with indices

## Optimization Power

```typescript
// Brute Force: O(n²)
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    if (nums[i] + nums[j] === target) // Check all pairs
  }
}

// Two Pointers: O(n)
let left = 0, right = n - 1;
while (left < right) {
  const sum = nums[left] + nums[right];
  if (sum === target) return true;
  sum < target ? left++ : right--;
}
```

## Related Concepts

- [[sliding-window]] - Specialized two-pointer technique
- arrays - Primary data structure
- [[hash-maps]] - Alternative approach for some problems

## Questions Using Two Pointers

- Two Sum II (sorted array)
- [[longest-substring-study-guide]] - Sliding window variant
- remove-duplicates - Fast and slow pointers
- Container with most water
- Three sum problem

## My Understanding

✅ Understand converging pointers pattern
✅ Know fast & slow pointer technique
✅ Can identify when to use vs hash map
🎯 Need practice with three pointers (3Sum)
🎯 More practice with boundary conditions

---

**Key Insight**: If the array is sorted and you're checking pairs, think two pointers instead of nested loops!
