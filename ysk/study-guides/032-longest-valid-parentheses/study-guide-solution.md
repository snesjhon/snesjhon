# Longest Valid Parentheses - Solution Guide

## Solution 1: Stack-Based Approach (Recommended)

```typescript
function longestValidParentheses(s: string): number {
  const stack: number[] = [-1]; // Initialize with -1 as base
  let max = 0;

  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") {
      // Push index of opening parenthesis
      stack.push(i);
    } else {
      // Pop the matching opening parenthesis (or base)
      stack.pop();

      if (stack.length === 0) {
        // Stack empty: this ')' becomes new base
        stack.push(i);
      } else {
        // Calculate length of valid substring
        const length = i - stack[stack.length - 1];
        max = Math.max(max, length);
      }
    }
  }

  return max;
}
```

## How This Solution Works

### Phase 1: Initialization (Line 2-3)

**Reference: Study Guide - "Why Start with -1?"**

```typescript
const stack: number[] = [-1];
let max = 0;
```

We initialize the stack with `-1`, not empty. This is critical:
- Acts as a "base" for length calculation
- Handles valid parentheses starting at index 0
- Eliminates edge case handling

**Why -1?**
```
Without -1:
  Input: "()"
  i=0 '(': push 0 → [0]
  i=1 ')': pop → [] (empty!)
  Can't calculate length!

With -1:
  Input: "()"
  i=0 '(': push 0 → [-1, 0]
  i=1 ')': pop → [-1]
  Length = 1 - (-1) = 2 ✓
```

### Phase 2: Process Opening Parenthesis (Lines 5-8)

**Reference: Study Guide - "Stack as Boundary Tracker"**

```typescript
if (s[i] === "(") {
  stack.push(i);
}
```

When we see `(`:
- Push its **index** (not the character)
- This marks a potential matching position
- If never matched, it serves as a boundary

**What the stack contains:**
```
Indices of:
1. Unmatched '(' characters
2. ')' that broke a sequence (new bases)
3. The initial -1 (original base)
```

### Phase 3: Process Closing Parenthesis (Lines 9-20)

```typescript
} else {
  stack.pop();

  if (stack.length === 0) {
    stack.push(i);
  } else {
    const length = i - stack[stack.length - 1];
    max = Math.max(max, length);
  }
}
```

When we see `)`:

**Step 1: Pop**
```typescript
stack.pop();
```
- Removes the matching `(` (or the base if no match)
- We always pop first, then check

**Step 2: Check if stack is empty**
```typescript
if (stack.length === 0) {
  stack.push(i);
}
```
- If empty: this `)` has no match
- Push current index as new base
- This `)` becomes a boundary marker

**Step 3: Calculate length (if stack not empty)**
```typescript
} else {
  const length = i - stack[stack.length - 1];
  max = Math.max(max, length);
}
```
- `stack[stack.length - 1]` = rightmost boundary
- Everything between boundary and `i` is valid
- Update max if this is longest so far

### Why `i - stack.top()` Works

**Reference: Study Guide - "Understanding the Length Formula"**

```
Stack stores boundaries - indices where validity breaks.

After processing ')' at index i:
  - We popped the matching '('
  - stack.top() is now the last unmatched position
  - Everything from (stack.top() + 1) to i is valid
  - Length = i - stack.top()

Example: ")()())"
         0 1 2 3 4 5

After processing i=4 ')':
  Stack: [0]  (the ')' at index 0)
  Length = 4 - 0 = 4
  Valid substring: indices 1-4 = "()()"
```

## Detailed Walkthrough: ")()())"

```typescript
Input: ")()())"
       0 1 2 3 4 5

Initialization:
  stack = [-1], max = 0

i=0, s[0]=')':
  stack.pop() → stack = []
  stack.length === 0 → push 0
  stack = [0], max = 0

i=1, s[1]='(':
  stack.push(1)
  stack = [0, 1], max = 0

i=2, s[2]=')':
  stack.pop() → stack = [0]
  stack.length !== 0 → calc length
  length = 2 - 0 = 2
  max = Math.max(0, 2) = 2
  stack = [0], max = 2

i=3, s[3]='(':
  stack.push(3)
  stack = [0, 3], max = 2

i=4, s[4]=')':
  stack.pop() → stack = [0]
  stack.length !== 0 → calc length
  length = 4 - 0 = 4
  max = Math.max(2, 4) = 4
  stack = [0], max = 4

i=5, s[5]=')':
  stack.pop() → stack = []
  stack.length === 0 → push 5
  stack = [5], max = 4

Return: 4
```

**Key insight at i=4**: After popping, `stack.top() = 0`. The valid substring spans from index 1 to 4, which is `()()` with length 4.

## Another Walkthrough: "(()"

```typescript
Input: "(()"
       0 1 2

Initialization:
  stack = [-1], max = 0

i=0, s[0]='(':
  stack.push(0)
  stack = [-1, 0], max = 0

i=1, s[1]='(':
  stack.push(1)
  stack = [-1, 0, 1], max = 0

i=2, s[2]=')':
  stack.pop() → stack = [-1, 0]
  stack.length !== 0 → calc length
  length = 2 - 0 = 2
  max = Math.max(0, 2) = 2
  stack = [-1, 0], max = 2

Return: 2
```

**Key insight**: The unmatched `(` at index 0 stays on stack, acting as boundary. Valid substring is `()` at indices 1-2.

---

## Solution 2: Dynamic Programming

```typescript
function longestValidParentheses(s: string): number {
  if (s.length === 0) return 0;

  const dp: number[] = new Array(s.length).fill(0);
  let max = 0;

  for (let i = 1; i < s.length; i++) {
    if (s[i] === ")") {
      if (s[i - 1] === "(") {
        // Case 1: "()" pattern
        dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;
      } else if (i - dp[i - 1] - 1 >= 0 && s[i - dp[i - 1] - 1] === "(") {
        // Case 2: "))" pattern with matching "("
        dp[i] =
          dp[i - 1] + 2 + (i - dp[i - 1] - 2 >= 0 ? dp[i - dp[i - 1] - 2] : 0);
      }
      max = Math.max(max, dp[i]);
    }
  }

  return max;
}
```

### How DP Works

**Reference: Study Guide - "DP Array Definition"**

`dp[i]` = length of longest valid parentheses **ending at index i**

**Key insight**: Valid strings always END with `)`. So we only update `dp[i]` when `s[i] = ')'`.

### Case 1: "()" Pattern

```typescript
if (s[i - 1] === "(") {
  dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;
}
```

**Visualization:**
```
...   X  (  )
      ↑  ↑  ↑
    i-2 i-1 i

dp[i] = dp[i-2] + 2
      = valid length before this pair + 2
```

**Example: "()()"**
```
i=1: s[1]=')' and s[0]='('
     dp[1] = dp[-1](=0) + 2 = 2

i=3: s[3]=')' and s[2]='('
     dp[3] = dp[1] + 2 = 2 + 2 = 4
```

### Case 2: "))" Pattern

```typescript
} else if (i - dp[i - 1] - 1 >= 0 && s[i - dp[i - 1] - 1] === "(") {
  dp[i] = dp[i - 1] + 2 + (i - dp[i - 1] - 2 >= 0 ? dp[i - dp[i - 1] - 2] : 0);
}
```

**Visualization:**
```
...   Y  (  ...valid...  )  )
      ↑  ↑       ↑       ↑  ↑
      j  j     dp[i-1]  i-1 i

j = i - dp[i-1] - 1

If s[j] = '(' → it matches s[i]!

dp[i] = dp[i-1] + 2 + dp[j-1]
      = inner valid + this pair + valid before matching '('
```

**Example: "(())"**
```
i=2: s[2]=')' and s[1]='('
     dp[2] = dp[0] + 2 = 0 + 2 = 2

i=3: s[3]=')' and s[2]=')'
     j = 3 - dp[2] - 1 = 3 - 2 - 1 = 0
     s[0] = '(' → match!
     dp[3] = dp[2] + 2 + dp[-1](=0) = 2 + 2 + 0 = 4
```

### DP Walkthrough: "()(())"

```typescript
Input: "()(())"
       0 1 2 3 4 5

Initialization:
  dp = [0, 0, 0, 0, 0, 0]

i=1, s[1]=')':
  s[0]='(' → Case 1
  dp[1] = dp[-1](=0) + 2 = 2
  dp = [0, 2, 0, 0, 0, 0], max = 2

i=2, s[2]='(':
  Skip (only process ')')

i=3, s[3]='(':
  Skip

i=4, s[4]=')':
  s[3]='(' → Case 1
  dp[4] = dp[2] + 2 = 0 + 2 = 2
  dp = [0, 2, 0, 0, 2, 0], max = 2

i=5, s[5]=')':
  s[4]=')' → Case 2
  j = 5 - dp[4] - 1 = 5 - 2 - 1 = 2
  s[2]='(' → match!
  dp[5] = dp[4] + 2 + dp[1] = 2 + 2 + 2 = 6
  dp = [0, 2, 0, 0, 2, 6], max = 6

Return: 6
```

---

## Solution 3: Two-Pass Counter (O(1) Space)

```typescript
function longestValidParentheses(s: string): number {
  let left = 0;
  let right = 0;
  let max = 0;

  // Left to right pass
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") {
      left++;
    } else {
      right++;
    }

    if (left === right) {
      max = Math.max(max, 2 * right);
    } else if (right > left) {
      left = right = 0;
    }
  }

  // Right to left pass
  left = right = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === "(") {
      left++;
    } else {
      right++;
    }

    if (left === right) {
      max = Math.max(max, 2 * left);
    } else if (left > right) {
      left = right = 0;
    }
  }

  return max;
}
```

### How Two-Pass Works

**Reference: Study Guide - "Two-Pass Counter"**

**Core idea**: Count opening and closing parentheses. When counts are equal, we have a valid substring!

### Left-to-Right Pass

```typescript
if (left === right) {
  max = Math.max(max, 2 * right);
} else if (right > left) {
  left = right = 0;
}
```

- When `left === right`: Valid substring of length `2 * right`
- When `right > left`: Too many `)`, reset counters (invalid)
- When `left > right`: Keep going (might become valid)

**Problem**: Misses cases like `"(()"` where `left > right` at the end.

### Right-to-Left Pass

```typescript
if (left === right) {
  max = Math.max(max, 2 * left);
} else if (left > right) {
  left = right = 0;
}
```

- Same logic, but counting from right
- Catches cases the left pass missed

**Why this works**: Left pass fails on excess `(`, right pass fails on excess `)`. Together, they cover all valid substrings!

### Two-Pass Walkthrough: "(()"

**Left-to-right:**
```
i=0 '(': left=1, right=0
i=1 '(': left=2, right=0
i=2 ')': left=2, right=1
End: left(2) > right(1), never recorded max
```

**Right-to-left:**
```
i=2 ')': right=1, left=0
i=1 '(': right=1, left=1 → equal! max = 2
i=0 '(': right=1, left=2 → left > right, reset
```

**Result**: `2`

---

## Complexity Analysis

### Stack Approach
- **Time**: O(n) - single pass through string
- **Space**: O(n) - stack can hold all indices in worst case `"((((..."`

### DP Approach
- **Time**: O(n) - single pass through string
- **Space**: O(n) - dp array of length n

### Two-Pass Approach
- **Time**: O(n) - two passes through string
- **Space**: O(1) - only counters, no array/stack

---

## Common Mistakes

### Mistake 1: Forgetting -1 Initialization

```typescript
// ❌ Wrong
const stack: number[] = [];

// ✅ Correct
const stack: number[] = [-1];
```

Without -1, you can't calculate length for valid pairs starting at index 0.

### Mistake 2: Checking Empty Before Pop

```typescript
// ❌ Wrong
if (stack.length === 0) {
  stack.push(i);
} else {
  stack.pop();
  // ...
}

// ✅ Correct
stack.pop();
if (stack.length === 0) {
  stack.push(i);
} else {
  // calculate length
}
```

Always pop first, then check if empty.

### Mistake 3: Counting Pairs Instead of Length

```typescript
// ❌ Wrong - counting pairs
if (s[i] === ')' && stack.length > 0) {
  stack.pop();
  pairs++;
}
return pairs * 2; // This is total pairs, not longest contiguous!

// ✅ Correct - tracking longest substring length
```

### Mistake 4: Not Understanding Two-Pass Necessity

```typescript
// ❌ Wrong - only left-to-right
// Misses "(()" → should be 2, but never triggers left===right

// ✅ Correct - both directions
// Left pass + Right pass covers all cases
```

---

## Edge Cases Handled

| Input | Expected | Why |
|-------|----------|-----|
| `""` | 0 | Empty string |
| `"("` | 0 | Single unmatched |
| `")"` | 0 | Single unmatched |
| `"()"` | 2 | Simple pair |
| `"(()"` | 2 | Left unmatched |
| `"())"` | 2 | Right unmatched |
| `"()()"` | 4 | Consecutive pairs |
| `"(())"` | 4 | Nested pairs |
| `")()())"` | 4 | Boundaries on both sides |
| `"()(())"` | 6 | Mixed patterns |

---

## Which Approach to Use?

| Situation | Recommendation |
|-----------|----------------|
| Interview (easy to explain) | Stack approach |
| Interview (impress with space) | Two-pass approach |
| Learning DP concepts | DP approach |
| Production code | Stack (clearest logic) |

**Stack approach** is recommended for most cases:
- Intuitive to explain
- Single pass
- Easy to trace through examples

---

## Key Takeaways

1. **Store indices, not characters** - enables length calculation
2. **-1 as base** - handles edge cases elegantly
3. **Stack top = rightmost boundary** - everything after is valid
4. **Two-pass catches all cases** - left miss → right catches, and vice versa
5. **DP requires two cases** - `()` pattern vs `))` pattern
6. **Valid strings end with `)`** - only process `)` in DP

## Connection to Study Guide Concepts

- ✅ **Index-based stack**: Track positions, not characters
- ✅ **Boundary tracking**: Stack contains validity breakpoints
- ✅ **Length formula**: `i - stack.top()` spans valid region
- ✅ **DP states**: `dp[i]` = valid length ending at i
- ✅ **Two-pass symmetry**: Left/right passes complement each other