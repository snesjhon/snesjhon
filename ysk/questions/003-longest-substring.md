# 003 - Longest Substring Without Repeating Characters

#leetcode/medium #pattern/sliding-window #pattern/two-pointers
#concept/sliding-window #concept/hash-maps #concept/strings
#progress/understood

**Problem:** Given a string, find the length of the longest substring without repeating characters.

**Related Concepts:**
- [[sliding-window]] - Primary pattern (variable window)
- [[two-pointers]] - Left and right boundaries
- [[hash-maps]] - Tracking seen characters

**Related Problems:**
- [[001-two-sum]] - Similar hash map usage
- [[239-sliding-window-maximum]] - Same pattern, harder
- Minimum Window Substring - Similar window technique

---

## Problem Statement

```
Input: s = "abcabcbb"
Output: 3
Explanation: "abc" is the longest substring without repeating

Input: s = "bbbbb"
Output: 1
Explanation: "b" is the longest

Input: s = "pwwkew"
Output: 3
Explanation: "wke" is the longest
```

**Note:** Substring means contiguous characters, not subsequence!

---

## Mental Model

### Key Observations

1. **Contiguous elements required** - It's a substring, not subsequence
2. **Dynamic range** - Valid substring length changes as we process
3. **Need to track state** - Which characters we've seen and where
4. **Local vs global** - Each position has a best substring, we need global max

### The Window Metaphor

Think of a window sliding across the string:
- **Left boundary** - Start of valid substring
- **Right boundary** - End of valid substring (expands each iteration)
- **Valid window** - No repeating characters inside
- **Expand** - Move right boundary right (try to include more)
- **Contract** - Move left boundary right (remove duplicates)

**Visual Example:**
```
String: "abcabcbb"

Window at different stages:
[a]bcabcbb     → valid, len=1
[ab]cabcbb     → valid, len=2
[abc]abcbb     → valid, len=3, max=3
 abc[a]bcbb    → duplicate! shrink from left
  bc[ab]cbb    → valid again, len=3
   c[abc]bb    → duplicate! shrink
    ca[bc]bb   → valid, len=3
     cab[c]bb  → duplicate! shrink
      ...
```

---

## Solution 1: Brute Force (Learning)

**Time:** O(n³) | **Space:** O(n)

```typescript
function lengthOfLongestSubstring(s: string): number {
  let maxLength = 0;

  // Try every starting position
  for (let i = 0; i < s.length; i++) {
    const seen: string[] = [];

    // Extend substring from position i
    for (let j = i; j < s.length; j++) {
      if (seen.includes(s[j])) {
        // Found duplicate - stop here
        break;
      }
      seen.push(s[j]);
    }

    // Update maximum after checking from position i
    maxLength = Math.max(maxLength, seen.length);
  }

  return maxLength;
}
```

**How it works:**
- Outer loop: Try each position as start (i)
- Inner loop: Extend as far as possible without duplicates (j)
- Break when duplicate found (longer substrings will also have it)
- Update max after each starting position

**Why O(n³)?**
- Outer loop: n iterations
- Inner loop: n iterations (worst case)
- `includes()`: O(n) check
- Total: n × n × n = O(n³)

---

## Solution 2: Sliding Window with Set ⭐

**Time:** O(n) | **Space:** O(min(n, m)) where m is character set size

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

    // Add current character to window
    seen.add(s[right]);

    // Update max length
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
```

**How it works:**

1. **Expand window**: `right` pointer always moves right
2. **Check validity**: If `s[right]` is duplicate...
3. **Shrink window**: Remove from left until valid again
4. **Track maximum**: Window size is `right - left + 1`

**Example walkthrough: "abcabcbb"**
```
right=0, left=0: seen={a}, len=1, max=1
right=1, left=0: seen={a,b}, len=2, max=2
right=2, left=0: seen={a,b,c}, len=3, max=3
right=3, left=0: 'a' duplicate!
  → remove seen[0]='a', left=1
  → seen={b,c,a}, len=3, max=3
right=4, left=1: 'b' duplicate!
  → remove seen[1]='b', left=2
  → seen={c,a,b}, len=3, max=3
...
```

**Why O(n)?**
- Right pointer: visits each char once (n)
- Left pointer: visits each char at most once (n total)
- Total: 2n = O(n)

---

## Solution 3: Optimized with Map

**Time:** O(n) | **Space:** O(min(n, m))

```typescript
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // If char seen and within current window
    if (lastSeen.has(char) && lastSeen.get(char)! >= left) {
      // Jump left pointer past the duplicate
      left = lastSeen.get(char)! + 1;
    }

    // Update last seen position
    lastSeen.set(char, right);

    // Update max length
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
```

**Optimization:** Instead of shrinking left one-by-one, jump it directly past the duplicate!

---

## Comparison

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force | O(n³) | O(n) | Easy to understand |
| Sliding Window (Set) | O(n) | O(min(n,m)) | Optimal, clear logic |
| Optimized (Map) | O(n) | O(min(n,m)) | Fewer operations |

---

## Common Mistakes & Debugging

### Mistake 1: Only updating max when finding duplicate

```typescript
// ❌ Wrong
if (seen.has(s[right])) {
  maxLength = Math.max(maxLength, seen.size);
  // Only updates here!
}
```

**Problem:** If string has all unique chars ("abcdefg"), you never find duplicate, so max stays 0!

**Fix:** Update max on every iteration:
```typescript
// ✅ Correct
maxLength = Math.max(maxLength, right - left + 1);
```

### Mistake 2: Continuing after finding duplicate

```typescript
// ❌ Wrong - creates non-contiguous substring
if (seen.includes(s[j])) {
  // Don't add it, but keep going!
} else {
  seen.push(s[j]);
}
```

**Problem:** "pwwkew" → you skip duplicate 'w' but add 'k', creating "pwke" which isn't a substring!

**Fix:** Break immediately when duplicate found:
```typescript
// ✅ Correct
if (seen.includes(s[j])) {
  break; // All longer substrings will also have duplicate
}
```

### Mistake 3: Wrong window size calculation

```typescript
// ❌ Wrong
length = seen.size;  // Might be wrong after deletions

// ✅ Correct
length = right - left + 1;  // Always accurate
```

---

## Why Your Thinking Breaks Down

### Error #1: "I only update maximum when something goes wrong"
- **Wrong:** Only updating when finding a duplicate
- **Correct:** Update after every iteration/inner loop

### Error #2: "After finding a problem, I can keep going"
- **Wrong:** Continuing after finding duplicate
- **Correct:** Break immediately - longer substrings will also fail

### Error #3: "My array represents something valid"
- **Wrong:** After skipping duplicate, array is no longer contiguous
- **Correct:** Array should always represent valid substring from start position

---

## Core Concepts Learned

### 1. Sliding Window Pattern

Two pointers creating a "window":
- Expand right to include more elements
- Shrink left to maintain validity
- Track window properties (size, contents)

### 2. When to Expand vs Shrink

- **Expand**: Always (right pointer moves every iteration)
- **Shrink**: When window becomes invalid (has duplicate)

### 3. Tracking Window State

Use Set/Map to track:
- What's in the window
- Where we last saw each character
- Window validity

### 4. Variable vs Fixed Window

This problem uses **variable window**:
- Window size changes based on validity
- Expand when valid, shrink when invalid
- Track maximum size seen

---

## Pattern Recognition

When you see these keywords, think sliding window:
- "Longest substring..."
- "Without repeating..."
- "Contiguous elements"
- "Maximum/minimum length"
- Can optimize nested loops checking subarrays

---

## Practice Exercises

1. **Modify to return the substring itself**, not just length
2. **Handle case-sensitive**: "Aa" should be length 2
3. **K distinct characters**: Longest substring with at most K distinct chars
4. **All unique?**: Boolean - does string have all unique characters?

---

## My Learning Journey

**Understanding** ✅
- ✅ Grasp sliding window concept
- ✅ Know when to expand vs shrink
- ✅ Understand Set vs Map approaches
- ✅ Can debug common mistakes

**Implementation** ✅
- ✅ Can implement from scratch
- ✅ Understand time/space tradeoffs
- ✅ Know why O(n) works

**Next Level** 🎯
- Practice similar problems without hints
- Recognize pattern in new problems
- Optimize further (Map vs Set choice)

---

## Key Takeaways

1. **Sliding window optimizes from O(n³) to O(n)**
2. **Two pointers create dynamic window**
3. **Set/Map tracks window state**
4. **Both pointers only move forward** - that's why it's O(n)
5. **Break immediately when duplicate found** (for brute force)
6. **Always update maximum** - not just on duplicates

---

**Remember:** The window slides one direction. Right expands, left contracts. Track what's inside, measure the size!
