# Subsets (Power Set) - Mental Model

## The Decision Tree Analogy

Imagine you're at a buffet line with three dishes: Pizza, Tacos, and Sushi. For each dish, you must make a binary decision: **take it** or **leave it**.

```
                        Start (empty plate)
                       /                    \
                Take Pizza              Leave Pizza
                /        \              /           \
         Take Tacos   Leave Tacos  Take Tacos   Leave Tacos
         /      \      /      \      /      \      /      \
       Take   Leave  Take   Leave  Take   Leave  Take   Leave
       Sushi  Sushi  Sushi  Sushi  Sushi  Sushi  Sushi  Sushi

Final plates:
[P,T,S] [P,T] [P,S] [P] [T,S] [T] [S] []
```

This is **exactly** how the subsets algorithm works:
- Each food item = an element in the input array
- Each decision point = a recursive call
- Each path from root to leaf = one subset
- All paths combined = the power set (all possible subsets)

**Critical insight:** For an array of size `n`, you make `n` binary decisions, giving you `2^n` total subsets!

---

## Building from the Ground Up

Let's watch the pattern emerge by working through concrete examples.

### Example 1: [1,2,3]

This is the classic case - generating all subsets of a 3-element array.

**The Decision Framework:**

At each index, we face two choices:
1. **Include** the current element in the subset
2. **Exclude** the current element from the subset

```
Index 0 (element 1):
  Choose to include 1: [1, ...]
  Choose to exclude 1: [...]

Index 1 (element 2):
  If we have [1], we can make: [1,2] or [1]
  If we have [], we can make: [2] or []

Index 2 (element 3):
  If we have [1,2], we can make: [1,2,3] or [1,2]
  If we have [1], we can make: [1,3] or [1]
  If we have [2], we can make: [2,3] or [2]
  If we have [], we can make: [3] or []
```

**Step-by-step execution:**

```
recurse(idx=0, current=[])
├─ Include 1 → recurse(idx=1, current=[1])
│  ├─ Include 2 → recurse(idx=2, current=[1,2])
│  │  ├─ Include 3 → recurse(idx=3, current=[1,2,3])
│  │  │  └─ idx >= length → save [1,2,3] ✓
│  │  └─ Exclude 3 → recurse(idx=3, current=[1,2])
│  │     └─ idx >= length → save [1,2] ✓
│  └─ Exclude 2 → recurse(idx=1, current=[1])
│     ├─ Include 3 → recurse(idx=3, current=[1,3])
│     │  └─ idx >= length → save [1,3] ✓
│     └─ Exclude 3 → recurse(idx=3, current=[1])
│        └─ idx >= length → save [1] ✓
└─ Exclude 1 → recurse(idx=0, current=[])
   ├─ Include 2 → recurse(idx=2, current=[2])
   │  ├─ Include 3 → recurse(idx=3, current=[2,3])
   │  │  └─ idx >= length → save [2,3] ✓
   │  └─ Exclude 3 → recurse(idx=3, current=[2])
   │     └─ idx >= length → save [2] ✓
   └─ Exclude 2 → recurse(idx=1, current=[])
      ├─ Include 3 → recurse(idx=3, current=[3])
      │  └─ idx >= length → save [3] ✓
      └─ Exclude 3 → recurse(idx=3, current=[])
         └─ idx >= length → save [] ✓
```

**Result:** `[[1,2,3], [1,2], [1,3], [1], [2,3], [2], [3], []]`

Count: 8 subsets = 2³ = 2^n where n=3 ✓

### Example 2: [1,2]

Let's see the pattern with a smaller example.

```
Input: [1,2]
Expected subsets: [[1,2], [1], [2], []]
Count: 4 = 2²

Decision tree:
                    []
                   /  \
          Include 1    Exclude 1
                [1]      []
               /  \      /  \
         Inc 2  Exc 2  Inc 2  Exc 2
        [1,2]   [1]    [2]     []
```

All four leaves give us our four subsets!

### Example 3: [1]

The simplest non-trivial case.

```
Input: [1]
Expected subsets: [[1], []]
Count: 2 = 2¹

Decision tree:
        []
       /  \
  Include  Exclude
    [1]      []
```

Two leaves = two subsets ✓

### Example 4: []

The edge case - empty input.

```
Input: []
Expected subsets: [[]]
Count: 1 = 2⁰

No elements to decide on, so only the empty set exists.
```

### What Just Happened?

We discovered three key patterns:

1. **Binary decisions at each step**: Include or exclude the current element
2. **Exponential growth**: `n` elements → `2^n` subsets
3. **Base case is critical**: When `idx >= nums.length`, we've made all decisions, save the result

---

## The Two Recursive Calls: The Heart of the Algorithm

The core of this algorithm is making TWO recursive calls at each step.

### Understanding the Two Branches

```typescript
function recurse(idx: number, current: number[]) {
  // Base case: made all decisions
  if (idx >= nums.length) {
    result.push([...current]);
    return;
  }

  // Branch 1: INCLUDE current element
  current.push(nums[idx]);
  recurse(idx + 1, current);
  current.pop(); // backtrack

  // Branch 2: EXCLUDE current element
  recurse(idx + 1, current);
}
```

**Why two calls?**

For each element, we explore BOTH universes:
- Universe A: "What if we include this element?"
- Universe B: "What if we exclude this element?"

Both universes need to be explored to generate all possible subsets.

### The Backtracking Pattern

Notice the critical sequence:

```typescript
current.push(nums[idx]);  // 1. Make a choice
recurse(idx + 1, current); // 2. Explore that choice
current.pop();             // 3. Undo the choice (backtrack)
```

**Why backtrack?**

Because we're reusing the same `current` array across multiple branches! After exploring the "include" branch, we need to restore the array to its original state before exploring the "exclude" branch.

```
Start with current = [1]

Include 2:
  current = [1,2]
  recurse...
  current.pop() → [1]  ← Back to original!

Exclude 2:
  current = [1]  ← Still [1], ready for this branch!
  recurse...
```

Without backtracking, the "exclude 2" branch would incorrectly start with `[1,2]` instead of `[1]`!

---

## The Index Progression: Moving Through the Array

### Why `idx` and not iteration?

```typescript
recurse(idx + 1, current)  // Always move to NEXT element
```

**The key insight:** We never go backwards. Once we've made a decision about `nums[idx]`, we move forward to `nums[idx+1]`.

```
Index progression for [1,2,3]:

recurse(0, [])    → deciding about nums[0] = 1
  recurse(1, [1]) → deciding about nums[1] = 2
    recurse(2, [1,2]) → deciding about nums[2] = 3
      recurse(3, [1,2,3]) → idx >= 3, DONE!
```

This ensures:
- We visit each element exactly once per path
- No duplicates (we don't revisit earlier elements)
- Clear termination condition (`idx >= nums.length`)

### The Base Case: When Do We Save?

```typescript
if (idx >= nums.length) {
  result.push([...current]);
  return;
}
```

**Why `idx >= nums.length`?**

This means we've made a decision about EVERY element in the array:
- Elements 0 through n-1: all decided (included or excluded)
- No more decisions to make
- The `current` array represents one complete subset

**Why `[...current]` instead of `current`?**

We must save a COPY! If we just push `current`, we're pushing a reference to the same array that keeps changing. All our saved subsets would end up identical (pointing to the same mutating array).

```typescript
// WRONG:
result.push(current); // All entries in result point to same array!

// CORRECT:
result.push([...current]); // Each entry is an independent copy
```

---

## Visualizing the Complete Recursion Tree

For input `[1,2]`, here's every single call:

```
                    recurse(0, [])
                   /              \
          Include 1                Exclude 1
              |                        |
      recurse(1, [1])          recurse(1, [])
         /          \             /          \
   Include 2    Exclude 2    Include 2    Exclude 2
       |            |            |            |
recurse(2,[1,2]) recurse(2,[1]) recurse(2,[2]) recurse(2,[])
       |            |            |            |
    Save [1,2]   Save [1]     Save [2]     Save []
```

**Total calls:** 7 (for n=2)
- Internal nodes: 3 (decisions being made)
- Leaf nodes: 4 (base cases, subsets saved)

**For n=3:** 15 total calls (7 internal, 8 leaves = 2³ subsets)
**For n=4:** 31 total calls (15 internal, 16 leaves = 2⁴ subsets)

**Pattern:** Total calls = `2^(n+1) - 1`

---

## Time and Space Complexity

### Time Complexity: O(n × 2^n)

**Why not just O(2^n)?**

We make `2^n` subsets, but each subset takes time to create:
- Creating a copy: `[...current]` → O(n) in the worst case
- `2^n` subsets × O(n) copy time = O(n × 2^n)

### Space Complexity: O(n)

For the recursion stack (not counting the output):
- Maximum recursion depth: `n` (one call per element)
- The `current` array: maximum size `n`
- Total: O(n)

**The output itself:** O(n × 2^n) space (but that's not counted in space complexity since it's required output)

---

## The Backtracking Template

This problem follows the classic backtracking template:

```typescript
function backtrack(position, currentState) {
  // Base case: found a valid solution
  if (isComplete(position)) {
    result.push(copySolution(currentState));
    return;
  }

  // Try each choice at this position
  for (let choice of getChoices(position)) {
    makeChoice(currentState, choice);     // 1. Choose
    backtrack(position + 1, currentState); // 2. Explore
    undoChoice(currentState, choice);      // 3. Backtrack
  }
}
```

For subsets, our "choices" are binary (include/exclude), so instead of a loop, we make two explicit recursive calls.

---

## Alternative Approach: Iterative (Building Up)

Instead of recursion, we can build subsets iteratively:

```typescript
function subsets(nums: number[]): number[][] {
  const result: number[][] = [[]]; // Start with empty set

  for (const num of nums) {
    const newSubsets = [];
    // For each existing subset, create a new one with 'num' added
    for (const subset of result) {
      newSubsets.push([...subset, num]);
    }
    result.push(...newSubsets);
  }

  return result;
}
```

**How it works:**

```
Start: [[]]

Add 1:
  Existing: [[]]
  New: [[1]]
  Result: [[], [1]]

Add 2:
  Existing: [[], [1]]
  New: [[2], [1,2]]
  Result: [[], [1], [2], [1,2]]

Add 3:
  Existing: [[], [1], [2], [1,2]]
  New: [[3], [1,3], [2,3], [1,2,3]]
  Result: [[], [1], [2], [1,2], [3], [1,3], [2,3], [1,2,3]]
```

**Pattern:** At each step, we double the number of subsets (each existing subset spawns a new one with the current element added).

**Comparison with recursive approach:**
- Iterative: More intuitive for some, avoids recursion overhead
- Recursive: More elegant, follows the decision tree model naturally

Both have the same time/space complexity!

---

## The Bug in Your Current Code

Your current implementation:

```typescript
function recurse(idx: number, acc: Set<number>) {
  if (idx >= nums.length) {
    stack.push(acc);
    return;
  }

  const current = nums[idx];
  acc.add(current);  // Always adds!

  recurse(idx + 1, acc); // Only one recursive call
}
```

**Problems:**

1. **Only one recursive call**: You're only exploring the "include" branch, never the "exclude" branch
   - Result: Only subsets that include ALL elements
   - For [1,2,3]: Would only generate [1,2,3]

2. **No backtracking**: You add to the set but never remove
   - Even if you added the second call, different branches would interfere with each other

3. **Passing reference, not copy**: When you push `acc`, you're pushing the same Set object
   - All entries in `stack` would point to the same Set

**The fix:**

```typescript
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];

  function recurse(idx: number, current: number[]) {
    if (idx >= nums.length) {
      result.push([...current]); // Save a copy
      return;
    }

    // Include current element
    current.push(nums[idx]);
    recurse(idx + 1, current);
    current.pop(); // Backtrack

    // Exclude current element
    recurse(idx + 1, current);
  }

  recurse(0, []);
  return result;
}
```

Changes:
- Two recursive calls (include and exclude)
- Backtracking with `current.pop()`
- Save a copy with `[...current]`
- Use array instead of Set for clarity

---

## Common Misconceptions

### ❌ "I need to use a Set to avoid duplicates"

For the basic subsets problem with unique elements, you don't get duplicates if you use the decision tree approach correctly. Sets are needed for "Subsets II" (with duplicate elements in input).

### ❌ "I can pass the index and build the subset inside the base case"

This approach is harder because you need to know which elements were "chosen" along the path. The backtracking approach tracks this naturally.

### ❌ "I only need one recursive call"

One call explores only one possibility (always include OR always exclude). You need TWO calls to explore both possibilities.

### ❌ "I can avoid copying by using different arrays"

You could, but you'd need to create new arrays at each level, which is more complex and doesn't save any space asymptotically.

### ❌ "Backtracking is optional"

Without backtracking, the shared `current` array will be in the wrong state for the second branch. Backtracking is essential!

---

## The Mental Model Checklist

Before coding, make sure you understand:

- [ ] **The binary decision tree**: At each index, include OR exclude
- [ ] **Two recursive calls**: One for each choice
- [ ] **Backtracking pattern**: Choose, explore, undo
- [ ] **Base case**: When `idx >= nums.length`, save the current subset
- [ ] **Copy the result**: `[...current]` not `current`
- [ ] **Index progression**: Always `idx + 1`, never go backwards
- [ ] **Why 2^n subsets**: n binary decisions → 2^n outcomes

---

## The Algorithm Flow

```
1. Start with empty current subset and index 0
2. Base case: if index >= array length, save copy of current subset and return
3. Recursive case:
   a. Add current element to subset
   b. Recurse with index + 1
   c. Remove current element (backtrack)
   d. Recurse with index + 1 (without current element)
4. Initial call: recurse(0, [])
5. Return collected results
```

Each step follows the natural decision tree model.

---

## Comparison: Iterative vs Recursive

| Aspect | Recursive (Backtracking) | Iterative (Building) |
|--------|-------------------------|---------------------|
| Mental Model | Decision tree | Growing subset collection |
| Code Complexity | Moderate (backtracking pattern) | Simple (nested loops) |
| Space (call stack) | O(n) | O(1) |
| Space (other) | O(n) for current array | O(n × 2^n) for intermediate results |
| Debugging | Harder (recursion trace) | Easier (step through iterations) |
| Extensibility | Natural for variations (pruning, constraints) | Less flexible |

**Both are valid!** Choose based on:
- Recursive: If you're comfortable with backtracking, want to add constraints later
- Iterative: If you prefer loops, want simpler debugging

---

## Try It Yourself

Before looking at the full solution, trace `[1,2]` by hand with the recursive approach:

1. Draw the complete recursion tree
2. Mark each decision (include/exclude)
3. Show the state of `current` at each node
4. Identify when backtracking happens
5. List all saved subsets in order

You should get: `[[1,2], [1], [2], []]` (order may vary depending on implementation)

---

## Key Insight: Subsets as Binary Numbers

There's a beautiful connection to binary numbers!

For `[1,2,3]`, think of each subset as a 3-bit binary number:
- Bit 1: include/exclude 1
- Bit 2: include/exclude 2
- Bit 3: include/exclude 3

```
Binary  Decimal  Subset
000     0        []
001     1        [3]
010     2        [2]
011     3        [2,3]
100     4        [1]
101     5        [1,3]
110     6        [1,2]
111     7        [1,2,3]
```

This leads to another approach: iterate from 0 to 2^n - 1, and use each bit pattern to determine which elements to include!

```typescript
function subsets(nums: number[]): number[][] {
  const n = nums.length;
  const result: number[][] = [];

  // Iterate through all possible bit patterns
  for (let mask = 0; mask < (1 << n); mask++) {
    const subset: number[] = [];
    for (let i = 0; i < n; i++) {
      // Check if i-th bit is set
      if (mask & (1 << i)) {
        subset.push(nums[i]);
      }
    }
    result.push(subset);
  }

  return result;
}
```

**All three approaches (recursive, iterative building, bit manipulation) generate the same 2^n subsets!**

---

## Ready for the Solution?

Now that you have the mental model:
- You understand **why** we need two recursive calls (binary decisions)
- You see **how** backtracking maintains the correct state
- You know **what** the base case captures (complete decision path)
- You recognize **the pattern** (explore all possibilities systematically)

The actual code is just translating this mental model into the recursive structure we've visualized.

When you're ready, implement the solution using the backtracking template!