# Remove K Digits Solution

## The Complete Solution

```typescript
function removeKdigits(num: string, k: number): string {
  const stack: string[] = [];

  for (const digit of num) {
    // While we can still remove and current digit is smaller than stack top
    while (k > 0 && stack.length > 0 && stack[stack.length - 1] > digit) {
      stack.pop();
      k--;
    }
    stack.push(digit);
  }

  // If k > 0, remove from the end (for increasing sequences)
  while (k > 0) {
    stack.pop();
    k--;
  }

  // Remove leading zeros
  let result = stack.join("");
  let i = 0;
  while (i < result.length - 1 && result[i] === "0") {
    i++;
  }
  result = result.slice(i);

  // Handle empty result
  return result.length === 0 ? "0" : result;
}
```

## How This Solution Works

### Phase 1: Setup (Lines 2)

**Reference: Study Guide - "The Monotonic Stack Pattern"**

```typescript
const stack: string[] = [];
```

We use a stack to build our result:
- Maintains digits in increasing order (as much as possible)
- Allows backtracking when we find a smaller digit
- Acts as our "best answer so far"

### Phase 2: Main Loop - Process Each Digit (Lines 4-10)

**Reference: Study Guide - "The Removal Decision"**

```typescript
for (const digit of num) {
  while (k > 0 && stack.length > 0 && stack[stack.length - 1] > digit) {
    stack.pop();
    k--;
  }
  stack.push(digit);
}
```

For each digit, we ask: "Should we remove previous digits?"

**The while loop condition has THREE parts:**
1. `k > 0` - We still have removals left
2. `stack.length > 0` - Stack isn't empty
3. `stack[stack.length - 1] > digit` - Top of stack is larger than current

**Why all three?**
- If `k = 0`, we can't remove anything
- If stack is empty, nothing to compare
- If top ≤ current, removing doesn't help (maintains/improves increasing order)

**Example:**
```
num = "1432219", k = 3

digit='1': stack=[], push → ['1']
digit='4': 1 < 4, push → ['1', '4']
digit='3': 4 > 3, pop, k=2 → ['1'], push → ['1', '3']
digit='2': 3 > 2, pop, k=1 → ['1'], 1 < 2, push → ['1', '2']
digit='2': 2 = 2, push → ['1', '2', '2']
digit='1': 2 > 1, pop, k=0 → ['1', '2'], can't remove more, push → ['1', '2', '1']
digit='9': k=0, just push → ['1', '2', '1', '9']
```

### Phase 3: Handle Remaining k (Lines 13-16)

**Reference: Study Guide - "Already Increasing Sequence"**

```typescript
while (k > 0) {
  stack.pop();
  k--;
}
```

**Why is this needed?**

If the number is already increasing (like "12345"), we never pop during the main loop. But we still need to remove k digits!

**Example:**
```
num = "12345", k = 2

Main loop: No pops (always increasing)
Stack: ['1', '2', '3', '4', '5']
k still = 2

Post-process: Pop twice
Stack: ['1', '2', '3']
Result: "123"
```

**Why remove from the end?**

For an increasing sequence, the largest digits are at the end. Removing them gives the smallest result.

### Phase 4: Remove Leading Zeros (Lines 19-23)

**Reference: Study Guide - "Leading Zeros"**

```typescript
let result = stack.join("");
let i = 0;
while (i < result.length - 1 && result[i] === "0") {
  i++;
}
result = result.slice(i);
```

**Why `i < result.length - 1`?**

We want to keep at least one character. If the result is "0", we don't want to slice it away entirely.

**Example:**
```
num = "10200", k = 1

After processing: stack = ['0', '2', '0', '0']
Joined: "0200"

Leading zero removal:
  i=0: '0' === '0' && i < 3, i++
  i=1: '2' !== '0', stop

result.slice(1) = "200"
```

### Phase 5: Handle Empty Result (Line 26)

```typescript
return result.length === 0 ? "0" : result;
```

**Why?**

If we removed all digits, we need to return "0", not an empty string.

**Example:**
```
num = "10", k = 2

After processing: stack = ['0']
After k removals: stack = [] (popped '0' too)
Joined: ""

Return "0" instead of ""
```

## Why This Solution is Correct

### Correctness Argument

**Claim**: The greedy monotonic stack approach produces the smallest possible number.

**Proof sketch:**

**Greedy choice property**: At each step, removing a larger digit when we see a smaller one is optimal.

Consider adjacent digits `a` and `b` where `a > b`:
- Keeping both: `...ab...`
- Removing `a`: `...b...`

The second is smaller because `b` in the position of `a` contributes less than `a` did.

**Optimal substructure**: After making the optimal local choice, the remaining problem is the same type (remove k-1 digits from remaining number).

**The stack maintains invariant**: At any point, the stack contains the smallest possible number using those digits in that relative order, given our removal budget.

### Example Walkthrough

**Reference: Study Guide - "Step-by-Step Visual Example"**

```
Input: "1432219", k = 3
```

**Step-by-step with reasoning:**

```typescript
// Initial: stack = [], k = 3

digit = '1':
  // Stack empty, just push
  stack = ['1']

digit = '4':
  // 4 > 1? NO (we check if we should remove '1')
  // Actually: stack.top()='1' > '4'? NO, 1 < 4
  // So we keep '1', push '4'
  stack = ['1', '4']

digit = '3':
  // stack.top()='4' > '3'? YES!
  // Pop '4', k = 2
  stack = ['1']
  // stack.top()='1' > '3'? NO, 1 < 3
  // Push '3'
  stack = ['1', '3']

digit = '2':
  // stack.top()='3' > '2'? YES!
  // Pop '3', k = 1
  stack = ['1']
  // stack.top()='1' > '2'? NO, 1 < 2
  // Push '2'
  stack = ['1', '2']

digit = '2':
  // stack.top()='2' > '2'? NO, equal
  // Push '2'
  stack = ['1', '2', '2']

digit = '1':
  // stack.top()='2' > '1'? YES!
  // Pop '2', k = 0
  stack = ['1', '2']
  // k = 0, can't remove more
  // Push '1'
  stack = ['1', '2', '1']

digit = '9':
  // k = 0, skip while loop
  // Push '9'
  stack = ['1', '2', '1', '9']

// k = 0, skip post-processing removal
// Join: "1219"
// No leading zeros
// Return "1219"
```

**Result**: `"1219"` ✓

### Another Example: Increasing Sequence

```typescript
Input: "112", k = 1

digit = '1':
  stack = ['1']

digit = '1':
  // stack.top()='1' > '1'? NO, equal
  stack = ['1', '1']

digit = '2':
  // stack.top()='1' > '2'? NO
  stack = ['1', '1', '2']

// k = 1, still have removal!
// Post-process: pop once
stack = ['1', '1']

// Result: "11"
```

**Result**: `"11"` ✓

### Another Example: With Leading Zeros

```typescript
Input: "10200", k = 1

digit = '1':
  stack = ['1']

digit = '0':
  // stack.top()='1' > '0'? YES!
  // Pop '1', k = 0
  stack = []
  // Push '0'
  stack = ['0']

digit = '2':
  // k = 0, skip while
  stack = ['0', '2']

digit = '0':
  stack = ['0', '2', '0']

digit = '0':
  stack = ['0', '2', '0', '0']

// k = 0, no post-processing
// Join: "0200"
// Remove leading zeros: "200"
// Return "200"
```

**Result**: `"200"` ✓

## Performance Analysis

**Reference: Study Guide - "Complexity"**

### Time Complexity: O(n)

Where n is the length of the input string.

- Main loop: O(n) iterations
- Each digit pushed exactly once: O(n) total pushes
- Each digit popped at most once: O(n) total pops
- Total operations: O(n)

**Key insight**: Even though we have a while loop inside a for loop, each digit can only be popped once. So total pops ≤ n.

### Space Complexity: O(n)

- Stack can hold at most n digits: O(n)
- Result string: O(n)
- Total: O(n)

## Alternative Approaches

### Approach 2: Using Index Instead of Stack

```typescript
function removeKdigits(num: string, k: number): string {
  const result: string[] = [];

  for (const digit of num) {
    while (k > 0 && result.length > 0 && result[result.length - 1] > digit) {
      result.pop();
      k--;
    }
    // Don't push leading zeros (when result is empty)
    if (result.length > 0 || digit !== "0") {
      result.push(digit);
    }
  }

  // Remove from end if k > 0
  while (k > 0 && result.length > 0) {
    result.pop();
    k--;
  }

  return result.length === 0 ? "0" : result.join("");
}
```

**Difference**: This handles leading zeros during the build process instead of at the end.

**Trade-off**:
- Slightly cleaner (no post-processing for zeros)
- Same time/space complexity
- Might be harder to understand at first

### Approach 3: String Building (Less Efficient)

```typescript
function removeKdigits(num: string, k: number): string {
  let result = "";

  for (const digit of num) {
    while (k > 0 && result.length > 0 && result[result.length - 1] > digit) {
      result = result.slice(0, -1); // Remove last char
      k--;
    }
    result += digit;
  }

  // Remove from end
  result = result.slice(0, result.length - k);

  // Remove leading zeros
  result = result.replace(/^0+/, "") || "0";

  return result;
}
```

**Trade-off**:
- More readable for some
- O(n²) time due to string slicing
- Not recommended for large inputs

## Common Mistakes Explained

**Reference: Study Guide - "Common Mistakes"**

### Mistake 1: Forgetting Post-Processing

```typescript
// ❌ Wrong
function removeKdigits(num: string, k: number): string {
  const stack: string[] = [];
  for (const digit of num) {
    while (k > 0 && stack.length > 0 && stack[stack.length - 1] > digit) {
      stack.pop();
      k--;
    }
    stack.push(digit);
  }
  return stack.join(""); // Missing k handling!
}

// ✅ Correct
// Add: while (k > 0) { stack.pop(); k--; }
```

### Mistake 2: Wrong Comparison Direction

```typescript
// ❌ Wrong - removes when current is LARGER
while (k > 0 && stack.length > 0 && stack[stack.length - 1] < digit) {
  // This removes smaller digits, making number LARGER!
}

// ✅ Correct - removes when stack top is LARGER
while (k > 0 && stack.length > 0 && stack[stack.length - 1] > digit) {
  // This removes larger digits, making number smaller
}
```

### Mistake 3: Not Handling Leading Zeros

```typescript
// ❌ Wrong
return stack.join(""); // "0200" instead of "200"

// ✅ Correct
let result = stack.join("");
return result.replace(/^0+/, "") || "0";
```

### Mistake 4: Using >= Instead of >

```typescript
// ❌ Wrong - removes equal digits unnecessarily
while (k > 0 && stack.length > 0 && stack[stack.length - 1] >= digit) {
  // Removes '2' when seeing another '2'
  // Wastes a removal!
}

// ✅ Correct - only removes strictly larger
while (k > 0 && stack.length > 0 && stack[stack.length - 1] > digit) {
  // '2' >= '2' is false, keeps both
}
```

### Mistake 5: Empty String vs "0"

```typescript
// ❌ Wrong
return result.length === 0 ? "" : result;

// ✅ Correct
return result.length === 0 ? "0" : result;
```

## Key Takeaways

1. **Monotonic stack** maintains increasing order by removing larger elements when smaller ones appear
2. **Greedy works** because removing a larger digit on the left always reduces the number
3. **Post-processing** handles already-increasing sequences (remove from end)
4. **Leading zeros** must be stripped (but keep at least one digit)
5. **Each element pushed/popped once** → O(n) despite nested loops
6. **Comparison is `>` not `>=`** → don't waste removals on equal digits

## Edge Cases Handled

1. **All same digits**: `"1111"`, k=2 → `"11"` (remove from end)
2. **Already increasing**: `"12345"`, k=2 → `"123"` (remove from end)
3. **Leading zeros**: `"10200"`, k=1 → `"200"` (strip zeros)
4. **Remove all**: `"10"`, k=2 → `"0"` (not empty string)
5. **k = 0**: `"123"`, k=0 → `"123"` (no change)
6. **Single digit**: `"5"`, k=1 → `"0"`
7. **Large k**: Never remove more than n digits

## Connection to Study Guide Concepts

- ✅ **Monotonic Stack Pattern**: Pop larger elements when smaller arrives
- ✅ **Greedy Choice**: Always optimal to remove larger left digit
- ✅ **Post-Processing**: Handle remaining k after main loop
- ✅ **Edge Cases**: Leading zeros, empty result, increasing sequences
- ✅ **Complexity**: O(n) time and space, each element processed once

This solution elegantly handles all cases using the monotonic stack pattern.
