# Daily Temperatures Study Guide

## Understanding the Problem

Given an array of daily temperatures, for each day find how many days you need to wait until a warmer temperature. If no warmer day exists in the future, output 0. This is the classic introduction to the **monotonic stack** pattern.

## Core Mental Models

### 1. The "Looking for a Warmer Day" Challenge

Each day is waiting for a future warmer day. Some days find one quickly, others wait a long time, some never find one.

```
temperatures = [73, 74, 75, 71, 69, 72, 76, 73]

Day 0 (73): Day 1 is 74, warmer! Wait 1 day
Day 1 (74): Day 2 is 75, warmer! Wait 1 day
Day 2 (75): Days 3,4,5 are cooler, Day 6 is 76, warmer! Wait 4 days
Day 3 (71): Day 4 is 69 (cooler), Day 5 is 72, warmer! Wait 2 days
Day 4 (69): Day 5 is 72, warmer! Wait 1 day
Day 5 (72): Day 6 is 76, warmer! Wait 1 day
Day 6 (76): Day 7 is 73 (cooler), no more days. Wait 0
Day 7 (73): No more days. Wait 0

Answer: [1, 1, 4, 2, 1, 1, 0, 0]
```

### 2. Why Not Brute Force?

The naive approach: for each day, scan forward until you find a warmer day.

```
for i = 0 to n:
  for j = i+1 to n:
    if temps[j] > temps[i]:
      result[i] = j - i
      break
```

**Problem**: O(n²) time. For decreasing temperatures `[100, 99, 98, ..., 1]`, every day scans all remaining days.

### 3. The Key Insight: One Warm Day Can Answer Many Questions

When you encounter a warm day, it might be the answer for **multiple** previous cooler days at once.

```
temperatures = [73, 72, 71, 70, 76]
                ↑   ↑   ↑   ↑   ↑
                |   |   |   |   Day 4 (76) answers ALL previous days!
                |   |   |   Day 3 waited 1 day
                |   |   Day 2 waited 2 days
                |   Day 1 waited 3 days
                Day 0 waited 4 days
```

Instead of each day looking forward, have each warm day look backward and resolve waiting days.

### 4. The Stack as a "Waiting Room"

Think of the stack as a waiting room for days that haven't found their warmer day yet.

```
Mental model:
- Days enter the waiting room when processed
- When a warmer day arrives, it "calls out" all the cooler days waiting
- Those days leave with their answer (current day index - their index)
- The warmer day then enters the waiting room to wait for an even warmer day
```

### 5. Why the Stack Stays in Decreasing Order

This is crucial: the stack naturally maintains **decreasing** temperatures (from bottom to top).

```
Stack state at each step for [73, 74, 75, 71, 69, 72]:

i=0: Push 73     → Stack: [73]
i=1: 74 > 73, pop 73, push 74 → Stack: [74]
i=2: 75 > 74, pop 74, push 75 → Stack: [75]
i=3: 71 < 75, push 71 → Stack: [75, 71]
i=4: 69 < 71, push 69 → Stack: [75, 71, 69]
i=5: 72 > 69, pop 69
     72 > 71, pop 71
     72 < 75, push 72 → Stack: [75, 72]
```

**Why decreasing?** If you had an increasing sequence in the stack, the smaller one would have already been popped by the larger one!

### 6. Store Indices, Not Values

Critical detail: the stack holds **indices**, not temperatures.

```
Why indices matter:
- To calculate "days waited" you need: current_index - waiting_day_index
- You can always look up temperature[index] when needed
- Storing values loses position information

Stack holds: [0, 3, 4]  ← indices
Lookup temps: temps[0]=75, temps[3]=71, temps[4]=69 ← values
```

## Visualization of Complete Example

```
temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
result       = [0,  0,  0,  0,  0,  0,  0,  0]  (initialized)

i=0, temp=73:
  Stack empty, push index 0
  Stack: [0]  → temps at indices: [73]

i=1, temp=74:
  74 > temps[stack.top]=73
  Pop 0, result[0] = 1-0 = 1
  Stack empty, push 1
  Stack: [1]  → [74]
  result: [1, 0, 0, 0, 0, 0, 0, 0]

i=2, temp=75:
  75 > temps[1]=74
  Pop 1, result[1] = 2-1 = 1
  Stack empty, push 2
  Stack: [2]  → [75]
  result: [1, 1, 0, 0, 0, 0, 0, 0]

i=3, temp=71:
  71 < temps[2]=75, don't pop
  Push 3
  Stack: [2, 3]  → [75, 71]

i=4, temp=69:
  69 < temps[3]=71, don't pop
  Push 4
  Stack: [2, 3, 4]  → [75, 71, 69]

i=5, temp=72:
  72 > temps[4]=69
  Pop 4, result[4] = 5-4 = 1
  72 > temps[3]=71
  Pop 3, result[3] = 5-3 = 2
  72 < temps[2]=75, stop popping
  Push 5
  Stack: [2, 5]  → [75, 72]
  result: [1, 1, 0, 2, 1, 0, 0, 0]

i=6, temp=76:
  76 > temps[5]=72
  Pop 5, result[5] = 6-5 = 1
  76 > temps[2]=75
  Pop 2, result[2] = 6-2 = 4
  Stack empty, push 6
  Stack: [6]  → [76]
  result: [1, 1, 4, 2, 1, 1, 0, 0]

i=7, temp=73:
  73 < temps[6]=76, don't pop
  Push 7
  Stack: [6, 7]  → [76, 73]

Done. Days 6 and 7 never found warmer days → remain 0

Final: [1, 1, 4, 2, 1, 1, 0, 0]
```

## Key Insights to Consider

### Insight 1: The Answer is Known When You're Popped, Not When You're Pushed

**Common mistake**: Trying to calculate the answer when adding a day to the stack.

```
// ❌ Wrong thinking
for each day:
  push to stack
  somehow calculate answer now?  // Can't! Don't know future yet
```

**Correct thinking**: The answer for day X is only known when a warmer day Y arrives.

```
// ✅ Correct
when day Y pops day X from stack:
  result[X] = Y - X  // NOW we know the answer
```

### Insight 2: Multiple Days Resolved in One Iteration

A single warm day can pop multiple days from the stack. Each gets its own answer.

```
temperatures = [50, 40, 30, 80]

When i=3 (temp=80):
  Pop index 2 (temp 30): result[2] = 3-2 = 1
  Pop index 1 (temp 40): result[1] = 3-1 = 2
  Pop index 0 (temp 50): result[0] = 3-0 = 3
```

This is why the while loop is inside the for loop, but it's still O(n) overall!

### Insight 3: Days Left in Stack Get 0

Any days remaining in the stack at the end never found a warmer day.

```
temperatures = [80, 70, 60]

After processing:
  Stack: [0, 1, 2]  ← all waiting, none found warmer
  result: [0, 0, 0]  ← initialized to 0, never updated
```

This is why we initialize the result array with zeros—no special handling needed.

### Insight 4: Compare Current to Stack Top, Not Stack Top to Current

Subtle but important for the condition:

```
// ✅ Correct: "Is current temp warmer than the day waiting on stack?"
while (stack.length && temps[i] > temps[stack[stack.length-1]])

// ❌ Wrong direction: "Is stack day warmer than current?"
while (stack.length && temps[stack[stack.length-1]] > temps[i])
```

The second one pops when the stack day is WARMER, which is backwards!

### Insight 5: Why This is Called "Monotonic Decreasing Stack"

The stack maintains a decreasing order (bottom to top):

```
Valid stack states:
[75]           ← decreasing (single element)
[75, 71]       ← 75 > 71, decreasing
[75, 71, 69]   ← 75 > 71 > 69, decreasing

Invalid (would be corrected):
[71, 75]       ← 71 < 75, the 71 should have been popped!
```

If an element smaller than the top arrives, it just pushes (preserving decrease).
If an element larger than the top arrives, it pops until the property holds.

## Common Pitfalls to Avoid

### Pitfall 1: Storing Temperatures Instead of Indices

```
// ❌ Wrong
stack.push(temperatures[i])  // Can't calculate distance!

// ✅ Correct
stack.push(i)  // Store index, lookup temp when needed
```

### Pitfall 2: Using a Queue Instead of a Stack

The "most recent" waiting day should be checked first (LIFO), not the oldest (FIFO).

```
Why stack (LIFO) works:
[75, 71, 69] then 72 arrives:
- Check 69 first (most recent), 72 > 69, pop
- Check 71 next, 72 > 71, pop
- Check 75 next, 72 < 75, stop

If we used queue (FIFO):
[75, 71, 69] then 72 arrives:
- Check 75 first (oldest), 72 < 75... now what?
  Can't pop, but 71 and 69 ARE resolved by 72!
```

### Pitfall 3: Forgetting the Stack Can Be Empty

Always check `stack.length > 0` before accessing `stack[stack.length - 1]`.

```
// ❌ Crashes when stack is empty
while (temps[i] > temps[stack[stack.length - 1]])

// ✅ Safe
while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]])
```

### Pitfall 4: Not Pushing After Popping

Every day must eventually be pushed to the stack (to wait for its warmer day).

```
// ❌ Wrong - forgets to push current day
while (stack.length && temps[i] > temps[stack.top]) {
  // pop and record...
}
// Oops! Never pushed i

// ✅ Correct
while (stack.length && temps[i] > temps[stack.top]) {
  // pop and record...
}
stack.push(i)  // Don't forget!
```

### Pitfall 5: Using >= Instead of >

The problem asks for **warmer** (strictly greater), not "warmer or equal".

```
temperatures = [73, 73]

// ❌ Wrong: >= treats equal as "warmer"
if (temps[1] >= temps[stack.top])  // 73 >= 73 = true, wrong!

// ✅ Correct: > requires strictly warmer
if (temps[1] > temps[stack.top])  // 73 > 73 = false, correct!

Answer should be [0, 0], not [1, 0]
```

## Performance Considerations

### Time Complexity: O(n)

Even though there's a while loop inside a for loop, each element is:
- Pushed to the stack exactly once
- Popped from the stack at most once

Total operations: 2n = O(n)

```
For [73, 72, 71, 70, 76]:
- 73 pushed (1), popped by 76 (1)
- 72 pushed (1), popped by 76 (1)
- 71 pushed (1), popped by 76 (1)
- 70 pushed (1), popped by 76 (1)
- 76 pushed (1), never popped
Total: 9 operations for 5 elements = O(n)
```

### Space Complexity: O(n)

- Result array: O(n)
- Stack: O(n) in worst case (all decreasing temperatures)

```
Worst case for stack: [100, 99, 98, 97, ...]
Stack holds all indices: [0, 1, 2, 3, ...]
```

## Questions to Guide Your Thinking

1. What does each day need to know about the future?
2. Can multiple days "wait" for an answer at the same time?
3. When a warm day arrives, which waiting days does it answer?
4. In what order should waiting days be checked?
5. What data structure supports "most recent first" checking?
6. What should you store in the stack to calculate "days waited"?
7. What happens to days that never find a warmer day?
8. Why does the stack stay in decreasing temperature order?

## Algorithm Approach

### Phase 1: Setup

1. Initialize result array with zeros (default: no warmer day found)
2. Initialize empty stack (will hold indices of waiting days)

### Phase 2: Process Each Day

For each day index `i`:

1. **Pop and record**: While stack not empty AND current temp > temp at stack top:
   - Pop the top index
   - Record answer: `result[popped] = i - popped`

2. **Push current**: Add current index to stack (it now waits for its warmer day)

### Phase 3: Return Result

Days still in stack never found warmer days—they stay 0 (already initialized).

## Edge Cases to Consider

1. **Single element**: Returns `[0]`
2. **All increasing**: Each day waits just 1 day, except last
3. **All decreasing**: No warmer days exist, all zeros
4. **All same temperature**: No strictly warmer days, all zeros
5. **Warmer day at the very end**: First day might wait n-1 days
6. **Alternating pattern**: `[50, 70, 50, 70]` → `[1, 0, 1, 0]`

## Related Problems

Once you understand this pattern, try:
- **Next Greater Element I/II**: Same stack pattern, different context
- **Stock Span Problem**: Monotonic stack looking backward
- **Largest Rectangle in Histogram**: Monotonic stack for area calculation
- **Trapping Rain Water**: Can use monotonic stack approach

## Next Steps

1. Initialize the result array and stack
2. Think about what condition triggers a pop
3. Think about what gets recorded when popping
4. Don't forget to push after the while loop
5. Remember: indices in stack, not values

The key insight is that the stack holds "unsatisfied" days, and when a warmer day arrives, it resolves (pops) all the cooler days waiting.