# Longest Substring Without Repeating Characters - Solutions Guide

## Solution Approaches

This guide contains the actual implementations. Make sure you've studied the concepts guide and attempted the problem before looking at these solutions!

---

## Approach 1: Brute Force

**Time Complexity:** O(n³)
**Space Complexity:** O(n)

```typescript
function lengthOfLongestSubstring(s: string): number {
  let maxLength = 0;

  // Check every possible substring
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const substring = s.slice(i, j + 1);

      // Check if substring has all unique characters
      if (hasUniqueChars(substring)) {
        maxLength = Math.max(maxLength, substring.length);
      } else {
        break; // No point checking longer substrings from this start
      }
    }
  }

  return maxLength;
}

function hasUniqueChars(str: string): boolean {
  const seen = new Set<string>();
  for (const char of str) {
    if (seen.has(char)) return false;
    seen.add(char);
  }
  return true;
}
```

**How it Works:**

1. Outer loop: Try each position as a starting point (i)
2. Inner loop: Try each position as an ending point (j)
3. Extract substring from i to j
4. Check if all characters in substring are unique
5. Update maximum if this substring is longer
6. Break early if duplicate found (no point checking longer substrings)

**Complexity Analysis:**

- Outer loop: n iterations
- Inner loop: n iterations (worst case)
- `hasUniqueChars`: n iterations (worst case)
- Total: O(n × n × n) = O(n³)

**When to Use:**
- Only for understanding the problem
- Never in production
- Shows baseline before optimization

---

## Approach 2: Sliding Window with Set

**Time Complexity:** O(n)
**Space Complexity:** O(min(n, m)) where m is the character set size

```typescript
function lengthOfLongestSubstring(s: string): number {
  const seen = new Set<string>();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    // Shrink window from left until no duplicate
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }

    // Add current character
    seen.add(s[right]);

    // Update max length
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
```

**How it Works:**

1. **Initialize:**
   - `seen`: Set to track characters in current window
   - `left`: Left boundary of window
   - `right`: Right boundary (from loop)
   - `maxLength`: Best result so far

2. **Expand Window:**
   - Move `right` pointer through each character

3. **Handle Duplicates:**
   - If `s[right]` already in Set, shrink from left
   - Remove `s[left]` from Set
   - Move `left` pointer right
   - Repeat until `s[right]` not in Set

4. **Update State:**
   - Add `s[right]` to Set
   - Calculate current window size: `right - left + 1`
   - Update maximum if current is larger

**Why It's O(n):**

Each character is visited at most twice:
- Once by the `right` pointer
- Once by the `left` pointer (when removed)

So the actual complexity is O(2n) = O(n)

**Example Trace: "abcabcbb"**

```
Step 1: right=0, char='a'
  seen={}, left=0
  'a' not in seen
  seen={'a'}, window="a", length=1, max=1

Step 2: right=1, char='b'
  seen={'a'}, left=0
  'b' not in seen
  seen={'a','b'}, window="ab", length=2, max=2

Step 3: right=2, char='c'
  seen={'a','b'}, left=0
  'c' not in seen
  seen={'a','b','c'}, window="abc", length=3, max=3

Step 4: right=3, char='a'
  seen={'a','b','c'}, left=0
  'a' IS in seen! Shrink:
    Remove 'a' (left=0), left=1
  'a' not in seen anymore
  seen={'b','c','a'}, window="bca", length=3, max=3

Step 5: right=4, char='b'
  seen={'b','c','a'}, left=1
  'b' IS in seen! Shrink:
    Remove 'b' (left=1), left=2
  'b' not in seen anymore
  seen={'c','a','b'}, window="cab", length=3, max=3

Step 6: right=5, char='c'
  seen={'c','a','b'}, left=2
  'c' IS in seen! Shrink:
    Remove 'c' (left=2), left=3
  'c' not in seen anymore
  seen={'a','b','c'}, window="abc", length=3, max=3

Step 7: right=6, char='b'
  seen={'a','b','c'}, left=3
  'b' IS in seen! Shrink:
    Remove 'a' (left=3), left=4
    'b' still in seen
    Remove 'b' (left=4), left=5
  'b' not in seen anymore
  seen={'c','b'}, window="cb", length=2, max=3

Step 8: right=7, char='b'
  seen={'c','b'}, left=5
  'b' IS in seen! Shrink:
    Remove 'c' (left=5), left=6
    'b' still in seen
    Remove 'b' (left=6), left=7
  'b' not in seen anymore
  seen={'b'}, window="b", length=1, max=3

Result: 3
```

---

## Approach 3: Sliding Window with Map (Optimal)

**Time Complexity:** O(n)
**Space Complexity:** O(min(n, m)) where m is the character set size

```typescript
function lengthOfLongestSubstring(s: string): number {
  const charIndex = new Map<string, number>();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // If character seen before and within current window
    if (charIndex.has(char) && charIndex.get(char)! >= left) {
      // Jump left pointer to position after last occurrence
      left = charIndex.get(char)! + 1;
    }

    // Update character's last seen position
    charIndex.set(char, right);

    // Update max length
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
```

**How it Works:**

1. **Initialize:**
   - `charIndex`: Map storing last seen index of each character
   - `left`: Left boundary of window
   - `right`: Right boundary (from loop)
   - `maxLength`: Best result so far

2. **For Each Character:**
   - Check if we've seen it before
   - Check if it's within current window (`index >= left`)
   - If yes: Jump `left` to position after last occurrence
   - Update the character's index in map
   - Calculate and update maximum

**Key Optimization:**

Instead of removing characters one by one (Set approach), we jump directly to the optimal position!

**Why the `>= left` check?**

We might have seen the character before, but it could be outside our current window:

```
"abba"
Index: 0123

When right=3 (char='a'):
- We saw 'a' at index 0
- Current window starts at left=2 (after first 'b')
- Index 0 is OUTSIDE the current window
- Don't jump backwards! Stay at left=2
```

**Example Trace: "pwwkew"**

```
Step 1: right=0, char='p'
  charIndex={}, left=0
  'p' not in map
  charIndex={p:0}, window="p", length=1, max=1

Step 2: right=1, char='w'
  charIndex={p:0}, left=0
  'w' not in map
  charIndex={p:0, w:1}, window="pw", length=2, max=2

Step 3: right=2, char='w'
  charIndex={p:0, w:1}, left=0
  'w' in map at index 1, and 1 >= 0 (in window!)
  Jump: left = 1 + 1 = 2
  charIndex={p:0, w:2}, window="w", length=1, max=2

Step 4: right=3, char='k'
  charIndex={p:0, w:2}, left=2
  'k' not in map
  charIndex={p:0, w:2, k:3}, window="wk", length=2, max=2

Step 5: right=4, char='e'
  charIndex={p:0, w:2, k:3}, left=2
  'e' not in map
  charIndex={p:0, w:2, k:3, e:4}, window="wke", length=3, max=3

Step 6: right=5, char='w'
  charIndex={p:0, w:2, k:3, e:4}, left=2
  'w' in map at index 2, and 2 >= 2 (in window!)
  Jump: left = 2 + 1 = 3
  charIndex={p:0, w:5, k:3, e:4}, window="kew", length=3, max=3

Result: 3
```

**Visual Window Movement:**

```
"pwwkew"
 ^        [p] left=0, right=0, len=1

"pwwkew"
 ^^       [pw] left=0, right=1, len=2

"pwwkew"
   ^      [w] left=2, right=2, len=1 (duplicate w!)

"pwwkew"
   ^^     [wk] left=2, right=3, len=2

"pwwkew"
   ^^^    [wke] left=2, right=4, len=3

"pwwkew"
    ^^^   [kew] left=3, right=5, len=3 (duplicate w!)
```

---

## Bug Analysis: Original Code

Your original implementation:

```typescript
function lengthOfLongestSubstring(s: string): number {
  const split = s.split("");
  let window: string[] = [];

  for (let i = 0; i < split.length; i++) {
    if (i === 0) {
      window.push(split[i]);
    } else {
      if (!window.includes(split[i])) {
        window.push(split[i]);
      }
    }
  }

  return window.length;
}
```

### Problems:

**1. Never Resets Window**

When a duplicate is found, the code just stops adding to the window but never removes old characters.

```typescript
Input: "abcabc"

i=0: window=['a']
i=1: window=['a','b']
i=2: window=['a','b','c']
i=3: 'a' in window, skip (window still has 'a'!)
i=4: 'b' in window, skip
i=5: 'c' in window, skip

Result: 3 ✓ (correct by accident!)
Window contains: ['a','b','c'] (which IS "abc")
```

**2. Doesn't Track Maximum**

Only returns the final window size, not the maximum seen during the entire process.

```typescript
Input: "abcdefga"

i=0-6: window=['a','b','c','d','e','f','g']
i=7: 'a' in window, skip

Result: 7 ✓ (correct by accident!)
```

**3. Produces Invalid Windows**

The window can contain characters that aren't actually contiguous in the original string!

```typescript
Input: "dvdf"

i=0: window=['d']
i=1: window=['d','v']
i=2: 'd' in window, skip
i=3: window=['d','v','f']

Result: 3
Window: ['d','v','f']
But "dvf" is NOT a substring of "dvdf"!

The actual longest is "vdf" (3)
Result is correct length, but window is wrong!
```

**4. Fails on Specific Cases**

```typescript
Input: "abba"

i=0: window=['a']
i=1: window=['a','b']
i=2: 'b' in window, skip
i=3: 'a' in window, skip

Result: 2
Expected: 2 ("ab" or "ba")
✓ Correct by luck!

Input: "tmmzuxt"

i=0: window=['t']
i=1: window=['t','m']
i=2: 'm' in window, skip
i=3: window=['t','m','z']
i=4: window=['t','m','z','u']
i=5: window=['t','m','z','u','x']
i=6: 't' in window, skip

Result: 5
Expected: 5 ("mzuxt")
Window: ['t','m','z','u','x'] ✗ Invalid!

The code returns correct LENGTH but for wrong reasons!
```

### Why It Sometimes Works:

The code accidentally gets the right answer when:
- The longest substring is at the beginning
- No characters after duplicates could form a longer substring
- Luck!

### The Fix:

You need to:
1. Reset/adjust the window when duplicates are found
2. Track the maximum length throughout, not just at the end
3. Ensure the window always represents a valid substring

---

## Comparison of All Approaches

| Aspect                  | Brute Force | Set (Sliding) | Map (Optimal) |
| ----------------------- | ----------- | ------------- | ------------- |
| Time Complexity         | O(n³)       | O(2n) = O(n)  | O(n)          |
| Space Complexity        | O(n)        | O(m)          | O(m)          |
| Passes Through String   | Multiple    | One           | One           |
| Character Visited Twice | Yes (many)  | Yes (left/right)| No          |
| Window Shrink Method    | N/A         | One by one    | Direct jump   |
| Extra Logic Needed      | Minimal     | While loop    | Index check   |
| Readability             | High        | Medium        | Medium        |
| Interview Recommended   | No          | Yes           | Yes (optimal) |

**Operation Counts for n=10,000:**

- Brute Force: ~1,000,000,000 operations
- Sliding Window (Set): ~20,000 operations
- Sliding Window (Map): ~10,000 operations

---

## Advanced Optimizations

### 1. Array Instead of Map (ASCII only)

If you know the character set is limited (e.g., ASCII = 128 chars):

```typescript
function lengthOfLongestSubstring(s: string): number {
  const lastIndex = new Array(128).fill(-1);
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    const charCode = s.charCodeAt(right);

    // Update left pointer
    left = Math.max(left, lastIndex[charCode] + 1);

    // Update last seen index
    lastIndex[charCode] = right;

    // Update max length
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
```

**Benefits:**
- Array access is faster than Map
- No `.has()` check needed (just check if index is >= left)
- More predictable performance

**Trade-offs:**
- Only works for known character sets
- Uses fixed space (128 or 256 elements)

### 2. Lowercase Letters Only (26 chars)

```typescript
function lengthOfLongestSubstring(s: string): number {
  const lastIndex = new Array(26).fill(-1);
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    const charCode = s.charCodeAt(right) - 97; // 'a' = 97

    left = Math.max(left, lastIndex[charCode] + 1);
    lastIndex[charCode] = right;
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
```

### 3. Early Termination

```typescript
// If remaining string can't beat current max, stop
if (maxLength >= s.length - right) {
  break;
}
```

**When useful:** Very long strings where maximum is found early.

---

## Complete Solution with Comments

```typescript
function lengthOfLongestSubstring(s: string): number {
  // Edge case: empty string
  if (s.length === 0) return 0;

  // Map to store last seen index of each character
  const charIndex = new Map<string, number>();

  // Window boundaries
  let left = 0;

  // Result tracker
  let maxLength = 0;

  // Expand window with right pointer
  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // Check if character creates a duplicate in current window
    if (charIndex.has(char) && charIndex.get(char)! >= left) {
      // Move left pointer to position after the duplicate
      left = charIndex.get(char)! + 1;
    }

    // Update the character's last seen position
    charIndex.set(char, right);

    // Calculate current window size and update maximum
    const currentLength = right - left + 1;
    maxLength = Math.max(maxLength, currentLength);
  }

  return maxLength;
}
```

---

## Variant: Return the Actual Substring

```typescript
function longestSubstring(s: string): string {
  const charIndex = new Map<string, number>();
  let left = 0;
  let maxLength = 0;
  let maxStart = 0; // Track where the longest substring starts

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    if (charIndex.has(char) && charIndex.get(char)! >= left) {
      left = charIndex.get(char)! + 1;
    }

    charIndex.set(char, right);

    const currentLength = right - left + 1;

    // Only update if we found a longer substring
    if (currentLength > maxLength) {
      maxLength = currentLength;
      maxStart = left; // Remember where it starts
    }
  }

  // Extract and return the substring
  return s.substring(maxStart, maxStart + maxLength);
}
```

---

## Testing Your Solution

### Test Cases:

```typescript
// Basic cases
console.log(lengthOfLongestSubstring("abcabcbb")); // 3 ("abc")
console.log(lengthOfLongestSubstring("bbbbb"));    // 1 ("b")
console.log(lengthOfLongestSubstring("pwwkew"));   // 3 ("wke")

// Edge cases
console.log(lengthOfLongestSubstring(""));         // 0
console.log(lengthOfLongestSubstring("a"));        // 1
console.log(lengthOfLongestSubstring(" "));        // 1

// All unique
console.log(lengthOfLongestSubstring("abcdef"));   // 6

// All same
console.log(lengthOfLongestSubstring("aaaaa"));    // 1

// Complex cases
console.log(lengthOfLongestSubstring("dvdf"));     // 3 ("vdf")
console.log(lengthOfLongestSubstring("abba"));     // 2 ("ab")
console.log(lengthOfLongestSubstring("tmmzuxt"));  // 5 ("mzuxt")

// Special characters
console.log(lengthOfLongestSubstring("!@#$%"));    // 5
console.log(lengthOfLongestSubstring("a b c"));    // 3 (space counts)
```

### Expected Outputs:

All test cases above show expected outputs in comments.

---

## Key Takeaways

1. **Pattern Recognition:** This is a classic sliding window problem
2. **Two Valid Solutions:** Set (simple) vs Map (optimal with jumps)
3. **Critical Check:** Verify duplicate is within current window before jumping
4. **Common Bug:** Not resetting/adjusting window when duplicate found
5. **Window Size:** Always `right - left + 1`, not `right - left`
6. **Track Maximum:** Update max throughout, not just at the end
7. **One Pass:** Both optimal solutions process string in single pass

---

## Next Steps

After mastering this solution:

1. Implement all three approaches from scratch
2. Practice explaining the sliding window technique
3. Try the variant problems mentioned in the concepts guide
4. Teach someone else - best way to solidify understanding

Remember: Understanding WHY the solution works is more important than memorizing the code!
