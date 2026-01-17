# Daily Temperatures Solution

## The Complete Solution

```typescript
function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const result: number[] = new Array(n).fill(0);
  const stack: number[] = []; // stores indices, not temperatures

  for (let i = 0; i < n; i++) {
    // While current temp is warmer than the day at stack top
    while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevIndex = stack.pop()!;
      result[prevIndex] = i - prevIndex;
    }
    // Current day now waits for its warmer day
    stack.push(i);
  }

  return result;
}
```

## How This Solution Works

### Phase 1: Initialize (Lines 2-4)

**Reference: Study Guide - "Store Indices, Not Values"**

```typescript
const n = temperatures.length;
const result: number[] = new Array(n).fill(0);
const stack: number[] = [];
```

Three pieces of state:

1. **n**: Convenience variable for array length
2. **result**: Answer array, initialized to all zeros
3. **stack**: Holds indices of days waiting for warmer temperatures

**Why initialize with zeros?**
- Days that never find a warmer day should return 0
- By initializing to 0, we only need to update days that DO find warmer days
- Days left in the stack at the end automatically have the right answer

### Phase 2: Process Each Day (Lines 6-13)

**Reference: Study Guide - "The Stack as a Waiting Room"**

```typescript
for (let i = 0; i < n; i++) {
  while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
    const prevIndex = stack.pop()!;
    result[prevIndex] = i - prevIndex;
  }
  stack.push(i);
}
```

For each day `i`:

**Step 1: Check if current day resolves any waiting days**
```typescript
while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]])
```

Two conditions must be true:
- Stack is not empty (there are days waiting)
- Current temperature is warmer than the day on top of stack

**Step 2: Pop and record answer**
```typescript
const prevIndex = stack.pop()!;
result[prevIndex] = i - prevIndex;
```

- Remove the waiting day from stack
- Calculate days waited: `current index - waiting day's index`
- Store in result at the waiting day's position

**Step 3: Push current day**
```typescript
stack.push(i);
```

Every day must be pushed to wait for its own warmer day.

### Phase 3: Return Result (Line 15)

```typescript
return result;
```

Days remaining in the stack never found warmer days—they keep their initialized value of 0.

## Why This Solution is Correct

### Correctness Argument

**Claim**: This finds, for each day, the number of days until a warmer temperature.

**Proof sketch:**

1. **Every day gets considered**: The for loop visits every index
2. **Correct answer when found**: When `temperatures[i] > temperatures[stack.top]`:
   - Day at `stack.top` has found its warmer day (day `i`)
   - Distance is correctly calculated as `i - prevIndex`
3. **Correct answer when not found**: Days never popped stay 0 (the correct answer)
4. **Order is correct**: Stack is LIFO, so most recent waiting day is checked first
   - This ensures each day finds its FIRST warmer day, not just any warmer day

### Example Walkthrough

**Reference: Study Guide - "Visualization of Complete Example"**

```
temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
```

**Detailed trace:**

```
Initial:
  result = [0, 0, 0, 0, 0, 0, 0, 0]
  stack = []

i=0, temp=73:
  While condition: stack.length=0, skip while
  Push 0
  stack = [0]

i=1, temp=74:
  While condition: stack.length=1, temps[1]=74 > temps[0]=73? YES
    Pop 0, result[0] = 1-0 = 1
  While condition: stack.length=0, skip
  Push 1
  stack = [1]
  result = [1, 0, 0, 0, 0, 0, 0, 0]

i=2, temp=75:
  While condition: temps[2]=75 > temps[1]=74? YES
    Pop 1, result[1] = 2-1 = 1
  While condition: stack empty, skip
  Push 2
  stack = [2]
  result = [1, 1, 0, 0, 0, 0, 0, 0]

i=3, temp=71:
  While condition: temps[3]=71 > temps[2]=75? NO (71 < 75)
  Push 3
  stack = [2, 3]

i=4, temp=69:
  While condition: temps[4]=69 > temps[3]=71? NO (69 < 71)
  Push 4
  stack = [2, 3, 4]

i=5, temp=72:
  While condition: temps[5]=72 > temps[4]=69? YES
    Pop 4, result[4] = 5-4 = 1
  While condition: temps[5]=72 > temps[3]=71? YES
    Pop 3, result[3] = 5-3 = 2
  While condition: temps[5]=72 > temps[2]=75? NO (72 < 75)
  Push 5
  stack = [2, 5]
  result = [1, 1, 0, 2, 1, 0, 0, 0]

i=6, temp=76:
  While condition: temps[6]=76 > temps[5]=72? YES
    Pop 5, result[5] = 6-5 = 1
  While condition: temps[6]=76 > temps[2]=75? YES
    Pop 2, result[2] = 6-2 = 4
  While condition: stack empty, skip
  Push 6
  stack = [6]
  result = [1, 1, 4, 2, 1, 1, 0, 0]

i=7, temp=73:
  While condition: temps[7]=73 > temps[6]=76? NO (73 < 76)
  Push 7
  stack = [6, 7]

Done iterating.

Final result = [1, 1, 4, 2, 1, 1, 0, 0]
Stack = [6, 7] (these days never found warmer, keep 0)
```

## Performance Analysis

**Reference: Study Guide - "Performance Considerations"**

### Time Complexity: O(n)

Each element is:
- Pushed exactly once: n pushes total
- Popped at most once: at most n pops total

Total operations: 2n = O(n)

**Common confusion**: "But there's a while loop inside a for loop!"

The key insight: the while loop doesn't reset. Each element can only be popped once, ever. So across ALL iterations of the for loop, the while loop executes at most n times total.

```
Amortized analysis:
- For loop: n iterations
- Total pushes across all iterations: n
- Total pops across all iterations: ≤ n
- Total: O(n)
```

### Space Complexity: O(n)

- Result array: O(n) - required for output
- Stack: O(n) worst case

**Worst case for stack**: All decreasing temperatures

```
temperatures = [100, 99, 98, 97, 96, ...]

Stack grows to hold all indices:
[0, 1, 2, 3, 4, ...]
```

**Best case for stack**: All increasing temperatures

```
temperatures = [1, 2, 3, 4, 5, ...]

Stack only ever holds one element:
i=0: stack=[0]
i=1: pop 0, push 1, stack=[1]
i=2: pop 1, push 2, stack=[2]
...
```

## Common Mistakes Explained

**Reference: Study Guide - "Common Pitfalls"**

### Mistake 1: Storing Values Instead of Indices

```typescript
// ❌ Wrong
stack.push(temperatures[i]);
// Later: result[???] = i - ???  // Can't calculate position!

// ✅ Correct
stack.push(i);
// Later: result[prevIndex] = i - prevIndex;  // Works!
```

### Mistake 2: Wrong Comparison Direction

```typescript
// ❌ Wrong - pops when stack is WARMER (backwards!)
while (stack.length && temperatures[stack[stack.length - 1]] > temperatures[i])

// ✅ Correct - pops when current is WARMER
while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]])
```

### Mistake 3: Using >= Instead of >

```typescript
// ❌ Wrong - treats equal temperatures as "warmer"
while (stack.length && temperatures[i] >= temperatures[stack[stack.length - 1]])

// ✅ Correct - requires strictly warmer
while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]])
```

For `[73, 73]`, wrong version gives `[1, 0]`, correct version gives `[0, 0]`.

### Mistake 4: Forgetting to Push

```typescript
// ❌ Wrong - never pushes current day
for (let i = 0; i < n; i++) {
  while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
    const prevIndex = stack.pop()!;
    result[prevIndex] = i - prevIndex;
  }
  // Oops! Forgot stack.push(i)
}

// ✅ Correct
for (let i = 0; i < n; i++) {
  while (...) {
    // pop and record
  }
  stack.push(i);  // Don't forget!
}
```

### Mistake 5: Off-by-One in Stack Access

```typescript
// ❌ Wrong - stack[0] is bottom, not top
temperatures[stack[0]]

// ✅ Correct - top of stack is last element
temperatures[stack[stack.length - 1]]
```

## Alternative Approaches

### Approach 2: Iterate Backwards

```typescript
function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const result: number[] = new Array(n).fill(0);
  const stack: number[] = [];

  // Process from right to left
  for (let i = n - 1; i >= 0; i--) {
    // Pop days that are NOT warmer than current
    while (stack.length && temperatures[i] >= temperatures[stack[stack.length - 1]]) {
      stack.pop();
    }
    // If stack not empty, top is the next warmer day
    if (stack.length) {
      result[i] = stack[stack.length - 1] - i;
    }
    stack.push(i);
  }

  return result;
}
```

**How it works:**
- Process from right to left
- Stack holds indices of potential "warmer days" to the right
- Pop elements that are NOT warmer (≤ current)
- If stack not empty, top is the next warmer day

**Comparison:**
- Same O(n) time and space
- Some find backwards iteration more intuitive
- Stack now represents "candidates to the right" rather than "waiting days"

## Key Takeaways

1. **Stack holds indices**, not values
2. **Monotonic decreasing stack** maintains temperatures in decreasing order
3. **Pop when current > stack top** — current day answers waiting days
4. **Push every day** — every day must wait for its answer
5. **Initialize to 0** — days never popped automatically have correct answer
6. **O(n) despite nested loops** — each element pushed/popped at most once

## Connection to Study Guide Concepts

- ✅ **Waiting Room Model**: Stack holds unsatisfied days
- ✅ **Indices Not Values**: Stack stores positions for distance calculation
- ✅ **Decreasing Order**: Stack naturally maintains this property
- ✅ **Answer on Pop**: Result recorded when warmer day is found
- ✅ **Default Zero**: Days left in stack never found warmer day
- ✅ **O(n) Amortized**: Despite while loop, each element processed twice max

This solution elegantly handles all cases by treating the stack as a "waiting room" for days seeking warmer temperatures.