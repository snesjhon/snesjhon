# Remove K Digits - Mental Model

## The Skyline Lowering Analogy

Imagine you're looking at a city skyline made of buildings with different heights (representing digits 0-9). You're viewing from the left side, and you want to make the skyline as low as possible by demolishing up to k buildings.

```
Original skyline: 1 4 3 2 2 1 9
                  █           █
                  █ █         █
                  █ █ █       █
                  █ █ █ █ █   █
                  █ █ █ █ █ █ █
                  1 4 3 2 2 1 9
```

The strategy is simple but powerful: **As you scan from left to right, whenever you see a tall building followed by a shorter one (a "drop"), demolish the taller building** (if you have demolitions left).

```
Scan → → →
      ↓ (found 4 > 3, remove 4!)

After removing 4, 3, 2:  1 2 1 9
                         █     █
                         █     █
                         █ █   █
                         █ █ █ █
                         1 2 1 9
```

This is **exactly** how the algorithm works:
- Scanning left to right = processing digits in order
- Tall before short = larger digit before smaller digit
- Demolish = remove from our answer
- Limited demolitions (k) = limited removals
- Goal: lowest skyline = smallest number

---

## Building from the Ground Up

Let's watch the pattern emerge by starting with simple examples.

### Example 1: "1432219", k = 3

Let's process this digit by digit and see what happens:

```
Start: ""
Removals left: 3

Step 1: Process '1'
  Stack: []
  Add '1': [1]

Step 2: Process '4'
  Stack: [1]
  Is 4 > previous (1)? Yes, but that's ok - we're building UP
  Add '4': [1, 4]

Step 3: Process '3'
  Stack: [1, 4]
  Is 3 < top of stack (4)? YES! 🎯
  This is the key moment!

  We found a "drop" - 4 followed by 3
  We should remove 4 to make the number smaller

  Remove 4: [1]
  Removals left: 2
  Add 3: [1, 3]
```

**This is the breakthrough:** When we find a smaller digit, we undo our previous decision by removing the larger digit.

Let's continue:

```
Step 4: Process '2'
  Stack: [1, 3]
  Is 2 < top (3)? YES!
  Remove 3: [1]
  Removals left: 1
  Add 2: [1, 2]

Step 5: Process '2'
  Stack: [1, 2]
  Is 2 < top (2)? NO (equal)
  Just add it: [1, 2, 2]

Step 6: Process '1'
  Stack: [1, 2, 2]
  Is 1 < top (2)? YES!
  Remove 2: [1, 2]
  Removals left: 0 ❌ (no more removals!)
  Add 1: [1, 2, 1]

Step 7: Process '9'
  Stack: [1, 2, 1]
  Is 9 < top (1)? NO
  Removals left: 0 (can't remove anyway)
  Add 9: [1, 2, 1, 9]

Result: "1219"
```

### Example 2: "10200", k = 1

This example reveals an important edge case:

```
Start: ""
Removals left: 1

Step 1: Process '1'
  Add '1': [1]

Step 2: Process '0'
  Stack: [1]
  Is 0 < top (1)? YES!
  Remove 1: []
  Removals left: 0
  Add 0: [0]

Step 3-5: Process '2', '0', '0'
  Stack: [0, 2, 0, 0]
  No more removals possible

Result: "0200"
```

Wait! "0200" is wrong. Leading zeros don't make sense in a number. We need to **strip leading zeros**.

Final result: "200" ✓

### Example 3: "10", k = 2

An even trickier case:

```
Step 1: Process '1'
  Add '1': [1]

Step 2: Process '0'
  Is 0 < 1? YES
  Remove 1: []
  Removals left: 1
  Add 0: [0]

We used only 1 removal, but have 1 left!
Stack: [0]

What if we need to remove more but we're out of digits?
We should remove from the end: []

Result: ""

But empty string isn't a valid number!
Edge case: Return "0" when result is empty.

Final result: "0"
```

### What Just Happened?

We discovered three key patterns:

1. **Greedy removal**: When we see a smaller digit, immediately remove previous larger digits
2. **Leading zeros**: Must be stripped after building the result
3. **Leftover removals**: If we still have k removals after processing all digits, remove from the end

---

## The Core Constraint: Monotonic Stack

The algorithm naturally creates what's called a **monotonic non-decreasing stack**.

### What Does Monotonic Mean?

```
Non-decreasing stack: [1, 2, 2, 3, 5]
(Each element ≥ previous)

Decreasing at some point: [1, 2, 5, 3, 4]
                                   ↑ (3 < 5, breaks the pattern)
```

Our algorithm maintains this property:
- When adding a digit that's ≥ top of stack → just add it
- When adding a digit that's < top of stack → remove the top first (if k > 0)

**Why does this create the smallest number?**

Imagine you have "52" and need to remove 1 digit:
- Remove '5': "2" (smaller)
- Remove '2': "5" (larger)

Since we read left to right, having smaller digits on the left makes the entire number smaller. By removing larger digits when we encounter smaller ones, we ensure the smallest possible digits stay on the left.

---

## The Three Critical Edge Cases

### Edge Case 1: Leading Zeros

```
Input: "10200", k = 1
After removals: "0200"
Final answer: "200" (strip leading zeros)
```

**Why this happens:**
When we remove '1', we're left with leading '0'. In mathematics, "0200" = "200", so we strip the zeros.

### Edge Case 2: All Digits Removed

```
Input: "9", k = 1
After removals: ""
Final answer: "0"
```

**Why this happens:**
We removed the only digit. An empty string isn't a valid number, so we return "0".

### Edge Case 3: Leftover Removals

```
Input: "12345", k = 3
After processing all: [1, 2, 3, 4, 5]
No drops found! All digits are increasing.
Removals left: 3
```

**What do we do?**
Remove from the end: [1, 2]
Final answer: "12"

**Why the end?**
Numbers on the right affect the value less. "123" < "124" < "125", so we remove the rightmost digits.

---

## Why Not Try All Combinations?

You might think: "Why not just try removing all possible combinations of k digits and pick the smallest?"

Let's see why that's terrible:

For "1432219" with k=3, we need to choose which 3 digits to remove from 7 digits.

That's C(7,3) = 35 combinations.

```
Remove positions [0,1,2]: "2219"
Remove positions [0,1,3]: "3219"
Remove positions [0,1,4]: "2219"
... (35 total combinations)
```

**For a string of length n:**
- Combinations: C(n, k) = n! / (k! * (n-k)!)
- For n=20, k=10: C(20,10) = 184,756 combinations
- Each combination needs validation and comparison

**With the greedy approach:**
- Single pass: O(n)
- Each digit processed once
- Immediate decisions, no backtracking needed

This is the power of **greedy algorithms** - making the locally optimal choice at each step leads to the global optimum.

---

## Visualizing the Stack for "1432219", k=3

Here's what the stack looks like at each step:

```
Process '1':  [1]
Process '4':  [1, 4]
Process '3':  [1, 4] → [1] → [1, 3]  (removed 4)
Process '2':  [1, 3] → [1] → [1, 2]  (removed 3)
Process '2':  [1, 2, 2]
Process '1':  [1, 2, 2] → [1, 2] → [1, 2, 1]  (removed 2, but k=0 now)
Process '9':  [1, 2, 1, 9]

Final: "1219"
```

Notice how the stack "self-organizes" by rejecting larger digits when smaller ones arrive.

---

## The "Greedy with Stack" Pattern

This problem belongs to a family of problems where you:

1. **Process elements left to right** (one at a time)
2. **Make immediate decisions** based on current vs previous elements
3. **Use a stack to track candidates** for the final answer
4. **Can "undo" previous choices** by popping from the stack
5. **Maintain an invariant** (like monotonic ordering)

Other problems with this pattern:
- **Next Greater Element**: Find the next larger number for each element
- **Largest Rectangle in Histogram**: Find the largest rectangular area
- **Trapping Rain Water**: Calculate trapped water between bars
- **Daily Temperatures**: Find how many days until warmer temperature

**The natural solution:** Use a stack to maintain candidates, and pop elements that become "obsolete" when better options arrive.

---

## The Key Insight: Greedy + Stack = Optimal

The beautiful part about this algorithm is that it's both **greedy** (makes local decisions) and **optimal** (produces the best global result).

**Greedy decision:**
```
Current digit < Top of stack?
  → YES: Remove top (it's making our number bigger)
  → NO: Keep top (it's contributing to a smaller number)
```

**Why this is optimal:**
Since we read numbers left to right, digits on the left have more "power":
- In "532", the '5' represents 500
- If we can replace '5' with '2', we get "232" (much smaller!)
- Removing digits on the left has maximum impact

By greedily removing larger digits when we find smaller ones, we ensure the smallest possible digits stay on the left, creating the smallest number.

**This is the difference between:**
- **Brute force:** Try all C(n,k) combinations (exponential)
- **Greedy with stack:** Single pass with smart removals (linear)

---

## The Proof Sketch: Why Greedy Works

**Claim:** If we have a digit D₁ followed by a smaller digit D₂, and we need to remove digits, removing D₁ is always optimal.

**Proof intuition:**
```
Case 1: "52..." (need to remove 1 digit)
  - Remove '5': "2..." (smaller)
  - Remove '2': "5..." (larger)

Case 2: "521..." (need to remove 1 digit)
  - Remove '5': "21..." (smallest)
  - Remove '2': "51..." (middle)
  - Remove '1': "52..." (largest)
```

Since '5' is to the left of '2', and '5' > '2', removing '5' will always produce a smaller number than removing '2' or anything after '2'.

**Generalization:**
When we find a "peak" (larger digit followed by smaller), removing the peak is the optimal local choice. Making optimal local choices at each step produces the optimal global result.

This is why greedy works for this problem!

---

## The Algorithm State Tracking

At any point during processing, we track:

```typescript
stack: number[]        // Candidates for the final answer
                       // Maintains monotonic non-decreasing property

removalsLeft: number   // How many more digits we can remove
                       // Starts at k, decreases with each removal

currentDigit: string   // The digit we're currently processing
```

### The Decision Tree at Each Step

```
For each digit d:
  ┌─────────────────────────────────┐
  │ Can we remove from stack?       │
  │ (stack not empty &&             │
  │  top > d &&                     │
  │  removalsLeft > 0)              │
  └─────────────────────────────────┘
           ↙                    ↘
        YES                     NO
         │                       │
    Remove top                Just add d
    removalsLeft--             to stack
    (repeat check)
```

---

## Common Misconceptions

### ❌ "I need to try different removal positions"
No! The greedy approach finds the optimal removal positions automatically. Each time you see a drop, that's the optimal place to remove.

### ❌ "I should always remove the largest digits"
No! Position matters more than magnitude. "91" → removing '9' gives "1" (best), even though '9' is the largest.

### ❌ "I need dynamic programming to find the optimal solution"
No! This problem has the greedy choice property. Local optimal choices lead to global optimum.

### ❌ "The stack can contain all digits"
Not quite. After processing, you might still have k removals left. You need to remove from the end.

### ❌ "Leading zeros are automatically handled"
No! You need to explicitly strip them after building the result.

---

## The Mental Model Checklist

Before coding, make sure you understand:

- [ ] **The greedy insight**: Remove larger digits when you encounter smaller ones
- [ ] **The stack property**: Maintains monotonic non-decreasing order
- [ ] **The three edge cases**: Leading zeros, empty result, leftover removals
- [ ] **The single-pass nature**: Process each digit exactly once
- [ ] **The removal condition**: `top > current && removalsLeft > 0`
- [ ] **The cleanup steps**: Remove extras from end, strip leading zeros, handle empty string

---

## Try It Yourself

Before looking at code, trace "54321" with k=2 by hand:

1. Start with empty stack, k=2
2. Process each digit:
   - What's on the stack?
   - Is current digit smaller than top?
   - Should you remove? Can you remove?
   - What does the stack look like after?
3. After all digits, do you have leftover removals?
4. Any leading zeros to strip?

You should get: "321"

---

## Ready for the Solution?

Now that you have the mental model:
- You understand **why** greedy works (position matters in numbers)
- You see **how** the stack maintains the monotonic property
- You know **what** the three critical edge cases are
- You recognize **the pattern** (greedy with stack for optimization)

The actual code is just translating this mental model into a stack-based algorithm with careful edge case handling.

When you're ready, check out the implementation!
