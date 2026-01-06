# Minimum Window Substring Solution

## The Complete Solution

```typescript
function minWindow(s: string, t: string): string {
  // Build requirement map from t
  const need = new Map<string, number>();
  for (const char of t) {
    need.set(char, (need.get(char) || 0) + 1);
  }

  // Window tracking
  const window = new Map<string, number>();
  let left = 0;
  let matched = 0; // How many unique chars have met requirement

  // Result tracking
  let minLen = Infinity;
  let start = 0;

  // Expand window with right pointer
  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // Add character to window
    if (need.has(char)) {
      window.set(char, (window.get(char) || 0) + 1);
      if (window.get(char) === need.get(char)) {
        matched++; // This requirement just became satisfied
      }
    }

    // Contract window while valid
    while (matched === need.size) {
      // Update result if this window is smaller
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        start = left;
      }

      // Remove leftmost character
      const leftChar = s[left];
      if (need.has(leftChar)) {
        if (window.get(leftChar) === need.get(leftChar)) {
          matched--; // About to lose this requirement
        }
        window.set(leftChar, window.get(leftChar)! - 1);
      }
      left++;
    }
  }

  return minLen === Infinity ? "" : s.substring(start, start + minLen);
}
```

## How This Solution Works

### Phase 1: Build Need Map (Lines 2-6)

**Reference: Study Guide - "The Two Maps Pattern"**

```typescript
const need = new Map<string, number>();
for (const char of t) {
  need.set(char, (need.get(char) || 0) + 1);
}
```

We build a frequency map from `t`:
- Key: character
- Value: how many times we need it

```
t = "AABC"
need = {A: 2, B: 1, C: 1}
need.size = 3 (three unique characters)
```

**Why Map instead of object?**
- `need.size` gives unique character count directly
- Clean API: `has()`, `get()`, `set()`
- Handles any characters (including special chars)

### Phase 2: Initialize Tracking (Lines 8-14)

**Reference: Study Guide - "The Matched Counter Insight"**

```typescript
const window = new Map<string, number>();
let left = 0;
let matched = 0;

let minLen = Infinity;
let start = 0;
```

Six pieces of state:
1. **window**: Character frequencies in current window
2. **left**: Left boundary of window
3. **matched**: Number of unique chars that meet requirement
4. **right**: Right boundary (loop variable)
5. **minLen**: Smallest valid window length found
6. **start**: Where that minimum window starts

**Why Infinity?**
- If no valid window exists, stays Infinity
- Easy to check at the end
- Any valid window length will be smaller

### Phase 3: Expand Window (Lines 16-26)

**Reference: Study Guide - "Expand Until Valid, Contract While Valid"**

```typescript
for (let right = 0; right < s.length; right++) {
  const char = s[right];

  if (need.has(char)) {
    window.set(char, (window.get(char) || 0) + 1);
    if (window.get(char) === need.get(char)) {
      matched++;
    }
  }
}
```

For each character at `right`:
1. **Check if needed**: Only track characters from `t`
2. **Add to window**: Increment count
3. **Check if satisfied**: If count now equals requirement, increment `matched`

**Critical detail**: `matched++` happens when `window[char]` BECOMES EQUAL to `need[char]`
- If `window[char] > need[char]`, we already counted this requirement
- Example: need A:2, window has A:3 → matched already includes A

### Phase 4: Contract Window (Lines 28-44)

**Reference: Study Guide - "The Increment/Decrement Timing Problem"**

```typescript
while (matched === need.size) {
  // Update result
  if (right - left + 1 < minLen) {
    minLen = right - left + 1;
    start = left;
  }

  // Remove from window
  const leftChar = s[left];
  if (need.has(leftChar)) {
    if (window.get(leftChar) === need.get(leftChar)) {
      matched--;
    }
    window.set(leftChar, window.get(leftChar)! - 1);
  }
  left++;
}
```

While window is valid:
1. **Update minimum**: Save this window if it's smaller
2. **Check before decrement**: If currently at exact requirement, about to lose it
3. **Decrement matched**: BEFORE removing the character
4. **Remove character**: Update window map
5. **Move left**: Shrink the window

**Why while instead of if?**
We want to find the MINIMUM window. Keep shrinking while valid to find smallest.

**Order matters:**
```typescript
// ✅ Correct
if (window.get(leftChar) === need.get(leftChar)) {
  matched--; // Check equality before changing count
}
window.set(leftChar, window.get(leftChar)! - 1); // Then decrement

// ❌ Wrong
window.set(leftChar, window.get(leftChar)! - 1);
if (window.get(leftChar) < need.get(leftChar)) {
  matched--; // Too late! Can't tell if we HAD exact requirement
}
```

### Phase 5: Return Result (Line 47)

```typescript
return minLen === Infinity ? "" : s.substring(start, start + minLen);
```

- If `minLen` still Infinity: no valid window found, return ""
- Otherwise: extract substring from saved `start` position with `minLen`

## Why This Solution is Correct

### Correctness Argument

**Claim**: This finds the minimum window containing all characters from `t`.

**Proof sketch:**

1. **Completeness**: Right pointer visits every position, so we consider every possible window start/end
2. **Correctness**: We only update result when `matched === need.size`, guaranteeing all requirements met
3. **Minimality**: While loop shrinks window as much as possible before expanding again
4. **No duplicates**: Each character position visited exactly once by each pointer

### Example Walkthrough

**Reference: Study Guide - "Visualization of Complete Example"**

```
s = "ADOBECODEBANC"
t = "ABC"
need = {A:1, B:1, C:1}, need.size = 3
```

**Detailed trace:**

```
right=0, char='A':
  need.has('A') = true
  window.set('A', 1)
  window.get('A')=1 === need.get('A')=1 → matched=1
  matched < 3, skip while

right=1, char='D':
  need.has('D') = false, skip
  matched=1 < 3

right=2, char='O':
  need.has('O') = false, skip
  matched=1 < 3

right=3, char='B':
  window.set('B', 1)
  window.get('B')=1 === need.get('B')=1 → matched=2
  matched=2 < 3

right=4, char='E':
  need.has('E') = false, skip
  matched=2 < 3

right=5, char='C':
  window.set('C', 1)
  window.get('C')=1 === need.get('C')=1 → matched=3

  While loop (matched === 3):
    len = 5-0+1 = 6 < Infinity → minLen=6, start=0

    Remove left=0, char='A':
      window.get('A')=1 === need.get('A')=1 → matched=2
      window.set('A', 0)
      left=1

    Exit while (matched=2 < 3)

right=6, char='O':
  need.has('O') = false
  matched=2

...continue to right=9...

right=9, char='B':
  window.set('B', 2) [already had 1]
  window.get('B')=2 > need.get('B')=1 → matched unchanged
  matched=2

right=10, char='A':
  window.set('A', 1) [was 0]
  window.get('A')=1 === need.get('A')=1 → matched=3

  While loop:
    len = 10-5+1 = 6, not < minLen=6, skip update

    Remove left=5, char='C':
      window.get('C')=1 === need.get('C')=1 → matched=2
      window.set('C', 0)
      left=6

    Exit while (matched=2)

...continue to right=12...

right=12, char='C':
  window.set('C', 1)
  window.get('C')=1 === need.get('C')=1 → matched=3

  While loop:
    len = 12-6+1 = 7 > minLen=6, skip

    Remove left=6, char='O': not needed, left=7
    matched still 3

    len = 12-7+1 = 6, not < minLen, skip
    Remove left=7, char='D': not needed, left=8
    matched still 3

    len = 12-8+1 = 5 < minLen=6 → minLen=5, start=8
    Remove left=8, char='E': not needed, left=9
    matched still 3

    len = 12-9+1 = 4 < minLen=5 → minLen=4, start=9
    Remove left=9, char='B':
      window.get('B')=2 > need.get('B')=1, no change to matched
      window.set('B', 1)
      left=10
    matched still 3

    len = 12-10+1 = 3 < minLen=4 → minLen=3, start=10
    Remove left=10, char='A':
      window.get('A')=1 === need.get('A')=1 → matched=2
      window.set('A', 0)
      left=11

    Exit while (matched=2)

Done iterating.

Return: s.substring(10, 10+3) = "ANC"
```

**Wait, that's wrong!** Let me retrace...

Actually at right=12 with left=9, the window is s[9:13] = "BANC" which has length 4. That's correct!

When we contract from left=9:
- s[9]='B', window has {B:2}, need {B:1}, so B:2→B:1, matched stays 3
- Continue contracting would remove 'A' which would break it

So minimum is indeed "BANC" with length 4 starting at position 9.

## Performance Analysis

**Reference: Study Guide - "Performance Considerations"**

### Time Complexity: O(n + m)

Where n = length of `s`, m = length of `t`

- Build need map: O(m)
- Each character in `s` visited by `right`: O(n)
- Each character visited by `left` at most once: O(n)
- Map operations (get/set/has): O(1)
- Total: O(m + n + n) = O(m + n)

**Why not O(n²)?**
The while loop doesn't reset `left`, so it only moves forward through the string once.

### Space Complexity: O(m)

- `need` map: O(m) for unique characters in `t`
- `window` map: O(m) in worst case (only tracks chars from `t`)
- Other variables: O(1)
- Total: O(m)

## Common Mistakes Explained

**Reference: Study Guide - "Common Pitfalls"**

### Mistake 1: Comparing Total Character Count

```typescript
// ❌ Wrong
let count = 0;
for (const char of window.keys()) {
  if (need.has(char)) {
    count += window.get(char);
  }
}
if (count === t.length) { ... }
```

**Why it fails:**
```
t = "AAB" (length 3)
window = {A:1, B:1, C:5}
count = 1+1 = 2 ≠ 3, but we're missing an A!
```

### Mistake 2: Wrong Matched Increment Logic

```typescript
// ❌ Wrong
if (need.has(char)) {
  window.set(char, (window.get(char) || 0) + 1);
  if (window.get(char) <= need.get(char)) {
    matched++; // Increments every time!
  }
}
```

**Why it fails:**
```
need = {A:2}
Adding first 'A': window={A:1}, matched=1 ✓
Adding second 'A': window={A:2}, matched=2 ✗
  matched should still be 0 until A requirement fully satisfied!
```

**Fix:** Use `===` not `<=`

### Mistake 3: Updating Result on Expansion

```typescript
// ❌ Wrong
for (let right = 0; right < s.length; right++) {
  // expand...
  if (matched === need.size && right - left + 1 < minLen) {
    minLen = right - left + 1;
    start = left;
  }
}
```

**Why suboptimal:**
Only finds first valid window at each position, doesn't minimize.

**Fix:** Update inside while loop during contraction.

## Key Takeaways

1. **matched tracks requirements satisfied**, not character count
2. **need.size is count of unique characters**, not total length of `t`
3. **Check equality BEFORE decrementing** when removing characters
4. **Update result during contraction**, not expansion
5. **Window can have extra characters** - doesn't need to be exact
6. **Both pointers move forward only** - that's why O(n)
7. **Use Infinity for initial minLen** - clean sentinel value

## Connection to Study Guide Concepts

- ✅ **Two Maps Pattern**: `need` and `window` maps
- ✅ **Matched Counter**: Tracks satisfied requirements, not totals
- ✅ **Expand/Contract Pattern**: Expand until valid, contract while valid
- ✅ **Timing**: Check before modify when decrementing
- ✅ **Performance**: O(n + m) time, O(m) space
- ✅ **Simplicity**: No lexicographic comparison needed

This solution elegantly handles all the edge cases and optimizations discussed in the study guide.