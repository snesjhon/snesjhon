# Merge Intervals - Debugging Your Code

## Your Current Code Issue

Let's trace through your code with the test case you have:

```typescript
Input: [[1,4], [0,2], [3,5]]
After sorting: [[0,2], [1,4], [3,5]]
```

### Step-by-Step Execution

```
i=0:
  intervals[i] = [0,2]
  comparison = intervals[i+1] = [1,4]

  b=2, c=1
  b >= c? → YES (2 >= 1)

  Merge: [min(0,1), max(2,4)] = [0,4]
  output.push([0,4])
  i++ → i becomes 1
  Loop continues, i++ again → i becomes 2

i=2:
  intervals[i] = [3,5]
  comparison = intervals[i+1] = undefined

  !comparison → TRUE
  output.push([3,5])

Result: [[0,4], [3,5]]
```

### The Problem

**Your output**: `[[0,4], [3,5]]`
**Correct output**: `[[0,5]]`

**Why?** Because `[0,4]` and `[3,5]` overlap! (4 >= 3)

## The Root Cause: Comparing Wrong Intervals

Your code compares `intervals[i]` with `intervals[i+1]` (adjacent in the **original array**).

But when you merge `[0,2]` and `[1,4]` into `[0,4]`, you never check if `[0,4]` overlaps with `[3,5]`.

### The Issue in Your Code

```typescript
if (b >= c) {
  const minLeft = Math.min(a, c);
  const maxRight = Math.max(b, d);
  output.push([minLeft, maxRight]);  // ← You push immediately!
  i++;
  continue;
}
```

**The problem**: You push the merged interval to output and move on. You never check if this newly merged interval overlaps with the next one!

## Visual Example of the Bug

```
Original (sorted): [0,2], [1,4], [3,5]

Your algorithm:
  Step 1: Compare [0,2] with [1,4]
          → Overlap! Merge to [0,4]
          → Push [0,4] to output ✓
          → Skip to next (i++)

  Step 2: Compare [3,5] with nothing
          → Push [3,5] to output ✓

  Result: [[0,4], [3,5]] ✗ WRONG!

The missed check:
  [0,4] overlaps with [3,5]!
  Should merge to [0,5]
```

## Another Example That Breaks Your Code

```typescript
Input: [[1,4], [2,5], [3,6]]
After sorting: [[1,4], [2,5], [3,6]]

Your algorithm:
  i=0: [1,4] overlaps with [2,5]
       → Merge to [1,5], push to output
       → Skip [2,5] (i++)

  i=2: [3,6] has no comparison
       → Push [3,6] to output

Your result: [[1,5], [3,6]]
Correct result: [[1,6]]

You missed that [1,5] overlaps with [3,6]!
```

## The Fix: Two Approaches

### Approach 1: Compare with Last Interval in Output

Instead of comparing with `intervals[i+1]`, compare with the **last interval you added to output**.

**Key insight**: The last interval in your output array is the one that might need extending!

```typescript
// Pseudocode
if (output is empty OR current doesn't overlap with output[last]) {
  output.push(current)
} else {
  // Extend the last interval in output
  output[last][1] = max(output[last][1], current[1])
}
```

### Approach 2: Track "Current Merged Interval"

Don't push to output immediately. Keep a "current interval" and keep extending it.

```typescript
// Pseudocode
current = first interval

for each remaining interval:
  if (current overlaps with interval):
    extend current
  else:
    push current to output
    current = interval

// Don't forget to push the last current interval!
push current to output
```

## Why Your `i++` Causes Problems

```typescript
if (b >= c) {
  // ... merge logic ...
  i++;        // ← Manual increment
  continue;
}

// Loop also increments i
for (let i = 0; i < intervals.length; i++) {
```

You're doing **double increment**:
1. Manual `i++` inside the if
2. Loop's automatic `i++`

This makes you skip the interval you just merged, which is correct for skipping the **original** interval, but wrong because you never check if the **merged result** overlaps with what comes next.

## The Key Difference

**Your approach**: Compare adjacent intervals in the original array
**Correct approach**: Compare each interval with the current merged interval (which might already include several merged intervals)

## Example Where Your Logic Works

```typescript
Input: [[1,3], [8,10]]
After sorting: [[1,3], [8,10]]

Your algorithm:
  i=0: [1,3] doesn't overlap with [8,10] (3 < 8)
       → Push [1,3]

  i=1: [8,10] has no comparison
       → Push [8,10]

Result: [[1,3], [8,10]] ✓ CORRECT!
```

Your code works when **at most 2 consecutive intervals overlap**. It breaks when **3 or more consecutive intervals overlap** (chaining problem).

## The Chaining Problem

```
[1,4], [2,5], [3,6]
  ↓      ↓      ↓
 These all overlap with each other!

Your code merges:
  [1,4] + [2,5] = [1,5]
  Then pushes [1,5] and moves on

But misses:
  [1,5] + [3,6] = [1,6]
```

You need to keep checking if the **merged interval** overlaps with the next one, not just check pairs from the original array.

## What You Got Right

✓ Sorting by start time
✓ The overlap condition `b >= c`
✓ The merge formula `[min(a,c), max(b,d)]`
✓ Handling the last interval

## What Needs Fixing

✗ You compare with `intervals[i+1]` instead of the last merged interval
✗ You push the merged interval immediately without checking further overlaps
✗ You can't handle "chaining" (3+ consecutive overlapping intervals)

## The Mental Model You're Missing

Think of it like **continuously extending a paint stroke**:

```
Your approach (wrong):
  Paint [0,2]
  Paint [1,4]
  → Merge to [0,4], DONE ✓
  Paint [3,5]
  → New stroke ✓

Correct approach:
  Paint [0,2]
  Paint [1,4]
  → Extend to [0,4]
  Paint [3,5]
  → Still overlaps with [0,4]! Extend to [0,5] ✓
```

You stop extending too early. You should **keep extending the current interval as long as new intervals overlap with it**.

## Fix Direction (No Code!)

Instead of:
1. Look at intervals[i] and intervals[i+1]
2. If they overlap, merge and push
3. Move to next

Do:
1. Keep track of the "current merged interval"
2. For each new interval, check if it overlaps with current merged interval
3. If yes: extend the current merged interval (don't push yet!)
4. If no: push the current merged interval, start a new one
5. After the loop, push the last current merged interval

The key is **comparing with the merged result**, not the original interval.

## Test Cases That Break Your Code

```typescript
// Case 1: Three overlapping
[[1,4], [2,5], [3,6]]
Your output: [[1,5], [3,6]]
Correct: [[1,6]]

// Case 2: From your test
[[0,2], [1,4], [3,5]]
Your output: [[0,4], [3,5]]
Correct: [[0,5]]

// Case 3: Four overlapping
[[1,3], [2,4], [3,5], [4,6]]
Your output: [[1,4], [3,5], [4,6]] or similar
Correct: [[1,6]]
```

## Test Cases That Work With Your Code

```typescript
// No overlaps
[[1,2], [3,4], [5,6]]
Your output: [[1,2], [3,4], [5,6]] ✓

// Two overlapping, separated groups
[[1,3], [2,4], [8,10], [9,11]]
Your output: [[1,4], [8,11]] ✓

// One interval
[[1,5]]
Your output: [[1,5]] ✓
```

## Debugging Exercise

Before fixing your code, trace through this example manually:

```typescript
[[1,4], [2,5], [3,6], [7,9]]
```

With your current logic:
- What will happen at each step?
- What will be in the output array?
- Is it correct?

Then think: How would you need to change your comparison to get the right answer?

## The One-Line Summary of Your Bug

**You're comparing adjacent original intervals instead of comparing each interval with the growing merged interval.**

## Next Steps

1. Identify which approach you want (extend last in output OR track current merged)
2. Change your comparison from `intervals[i+1]` to the right target
3. Make sure you handle the last interval
4. Test with the cases that currently break

You're very close! The sorting and overlap logic are perfect. You just need to compare with the right interval.
