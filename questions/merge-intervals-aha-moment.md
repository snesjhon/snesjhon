# Merge Intervals - The "Aha!" Moment

## Your Current Wrong Comparison

```typescript
const comparison = intervals[i + 1];  // ← You're comparing with NEXT in original array
```

This is your problem. You're asking: "Does intervals[i] overlap with intervals[i+1]?"

## The Right Comparison

You should be asking: **"Does intervals[i] overlap with the LAST interval I put in my output?"**

## Why This Matters - Concrete Example

```
Sorted: [[0,2], [1,4], [3,5]]

Your logic:
  i=0: Does [0,2] overlap with [1,4]? YES
       → Merge to [0,4]
       → Push [0,4] to output

  i=2: Does [3,5] overlap with... nothing?
       → Push [3,5] to output

  Output: [[0,4], [3,5]] ✗

The missed question:
  i=2: Does [3,5] overlap with [0,4] (the last thing in output)?
       → YES! 3 <= 4
       → Should extend [0,4] to [0,5]
```

## The Conceptual Fix (No While Loop Needed)

Instead of this logic:
```
Compare intervals[i] with intervals[i+1]
If overlap → merge and push
```

Use this logic:
```
For each interval:
  If output is empty OR interval doesn't overlap with output's LAST interval:
    → Push this interval to output
  Else:
    → Extend output's LAST interval
```

## Visual Difference

### Your approach (wrong):
```
Look ahead: intervals[i] vs intervals[i+1]
[0,2] vs [1,4] → merge to [0,4], push
[3,5] vs nothing → push
```

### Correct approach:
```
Look back: intervals[i] vs output[last]
[0,2] vs (empty) → push [0,2]
[1,4] vs [0,2] → overlaps! extend [0,2] to [0,4]
[3,5] vs [0,4] → overlaps! extend [0,4] to [0,5]
```

## The Key Difference

**You**: "Let me look at the next interval in the original array"
**Correct**: "Let me look at the last interval I added to my result"

## Why Your Way Breaks

When you merge [0,2] and [1,4]:
- You create [0,4]
- You push it to output
- You skip [1,4] with `i++`
- You move to [3,5]
- But you NEVER check if [0,4] (the merged result) overlaps with [3,5]!

You compared [0,2] with [1,4], but you never compared [0,4] (the merge) with [3,5].

## What You Should Compare With

Not this:
```typescript
const comparison = intervals[i + 1];  // Next in original
```

But this concept:
```typescript
// Compare with the LAST interval in your output array
// If output is empty, just add the current interval
// If current overlaps with output's last, extend the last one
// If current doesn't overlap, add it as a new interval
```

## How to Think About It

Imagine you're building a timeline:

```
Output array is your RESULT timeline
Original intervals array is your INPUT

Process each input interval:
  1. Look at the last thing on your result timeline
  2. Does this new interval touch/overlap with it?
     YES → Extend the last one on the result timeline
     NO  → Add a new separate interval to result timeline
```

## Pseudocode (Concept Only)

```
output = []

for each interval in sorted intervals:

  if (output is empty):
    add interval to output

  else if (interval overlaps with output's LAST interval):
    extend output's LAST interval

  else:
    add interval to output
```

## The "Extend" Operation

When you extend, you're not creating a new interval. You're **modifying** the last interval in output:

```
output = [[0,4]]
next interval = [3,5]

They overlap (4 >= 3)

Don't do: output.push([0,5])
Do this: Change output's last interval from [0,4] to [0,5]

How? output[output.length - 1][1] = max(4, 5) = 5
```

## No While Loop Needed

You can still use a for loop! The difference is:
- **Your current code**: Compares adjacent pairs from original array
- **Correct code**: Compares each interval with the last result interval

Same for loop, different comparison target.

## Two Ways to Implement (Choose One)

### Option 1: Modify last interval in output
```
for each interval:
  if (output empty OR doesn't overlap with output[last]):
    output.push(interval)
  else:
    output[last][1] = max(output[last][1], interval[1])
```

### Option 2: Track current merged interval
```
current = first interval
for each remaining interval:
  if (overlaps with current):
    extend current
  else:
    push current to output
    current = interval
push final current to output
```

## Your Specific Code Change Needed

Instead of:
```typescript
const comparison = intervals[i + 1];  // DON'T look ahead in input
```

You need to look at:
```typescript
// The LAST interval in your output array
// output[output.length - 1]
```

## Mental Model Shift

**Before**: "I'm comparing pairs of original intervals"
**After**: "I'm building up merged intervals and extending the last one when needed"

## The Question You Should Ask

Not: "Does this interval overlap with the next input interval?"
But: "Does this interval overlap with the merged interval I'm currently building?"

## Test It In Your Head

```
[[0,2], [1,4], [3,5]]

Step 1: output = [], process [0,2]
  output empty? YES → push [0,2]
  output = [[0,2]]

Step 2: process [1,4]
  Does [1,4] overlap with output's last [0,2]?
  1 <= 2? YES
  Extend [0,2] to [0,4]
  output = [[0,4]]

Step 3: process [3,5]
  Does [3,5] overlap with output's last [0,4]?
  3 <= 4? YES
  Extend [0,4] to [0,5]
  output = [[0,5]]

Done! output = [[0,5]] ✓
```

See? Each step compares with **output's last**, not **intervals[i+1]**.

## Why This Works for Chaining

```
[[1,4], [2,5], [3,6]]

Your way:
  [1,4] + [2,5] = [1,5] (push and done)
  [3,6] (push and done)
  Result: [[1,5], [3,6]] ✗

Correct way:
  output = [[1,4]]
  [2,5] overlaps with output[last] = [1,4] → extend to [1,5]
  output = [[1,5]]
  [3,6] overlaps with output[last] = [1,5] → extend to [1,6]
  output = [[1,6]] ✓
```

Each interval checks against the **growing merged interval**, not just its immediate predecessor in the input.

## The Fix is About WHAT You Compare

- Not about while vs for
- Not about the loop structure
- It's about **comparing with output[last] instead of intervals[i+1]**

## Now Try

With this understanding:
1. Keep your for loop
2. Change what you're comparing with
3. Instead of pushing merged intervals immediately, extend the last one in output
4. Handle the empty output case

That's it. Same loop, different comparison target.
