# Unique Paths - Solution Guide

## The Complete Solutions

### Solution 1: Recursive (Brute Force)

```typescript
function uniquePathsRecursive(n: number, m: number): number {
  function helper(i: number, j: number): number {
    // Base case: reached top-left
    if (i === 0 && j === 0) return 1;
    // Out of bounds
    if (i < 0 || j < 0) return 0;

    // Paths from above + paths from left
    return helper(i - 1, j) + helper(i, j - 1);
  }

  return helper(n - 1, m - 1);
}
```

### Solution 2: Memoization (Top-Down DP)

```typescript
function uniquePathsMemo(n: number, m: number): number {
  const memo: Map<string, number> = new Map();

  function helper(i: number, j: number): number {
    if (i === 0 && j === 0) return 1;
    if (i < 0 || j < 0) return 0;

    const key = `${i},${j}`;
    if (memo.has(key)) return memo.get(key)!;

    const result = helper(i - 1, j) + helper(i, j - 1);
    memo.set(key, result);
    return result;
  }

  return helper(n - 1, m - 1);
}
```

### Solution 3: Bottom-Up DP (2D Array)

```typescript
function uniquePathsDP(n: number, m: number): number {
  // Create n x m grid
  const dp: number[][] = Array.from({ length: n }, () => Array(m).fill(0));

  // Base cases: first row and column = 1
  for (let i = 0; i < n; i++) dp[i][0] = 1;
  for (let j = 0; j < m; j++) dp[0][j] = 1;

  // Fill the table
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < m; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }

  return dp[n - 1][m - 1];
}
```

### Solution 4: Space-Optimized DP (1D Array)

```typescript
function uniquePathsOptimized(n: number, m: number): number {
  const dp: number[] = Array(m).fill(1);

  for (let i = 1; i < n; i++) {
    for (let j = 1; j < m; j++) {
      dp[j] = dp[j] + dp[j - 1];
    }
  }

  return dp[m - 1];
}
```

### Solution 5: Mathematical (Combinatorics)

```typescript
function uniquePathsMath(n: number, m: number): number {
  const totalMoves = n + m - 2;
  const chooseMoves = Math.min(n - 1, m - 1);

  let result = 1;
  for (let i = 0; i < chooseMoves; i++) {
    result = (result * (totalMoves - i)) / (i + 1);
  }

  return Math.round(result);
}
```

---

## How Each Solution Works

### Recursive Solution Explained

**Reference: Study Guide - "Why Dynamic Programming Works"**

```typescript
function helper(i: number, j: number): number {
  // Base case: we've reached the starting point
  if (i === 0 && j === 0) return 1;

  // Out of bounds: no valid path
  if (i < 0 || j < 0) return 0;

  // Recurrence: paths from above + paths from left
  return helper(i - 1, j) + helper(i, j - 1);
}
```

**Why start from (n-1, m-1)?**
We work backwards, asking "how many ways can we reach this cell?"

**Base case logic:**
- `(0,0)` is the start - there's exactly 1 way to be here (we start here)
- Negative indices are invalid - 0 paths

**Problem:**
```
For a 3x3 grid, this makes 63 recursive calls!
For a 10x10 grid, this explodes to millions.
```

### Memoization Solution Explained

**Reference: Study Guide - "Overlapping Subproblems"**

```typescript
const memo: Map<string, number> = new Map();

function helper(i: number, j: number): number {
  // ... base cases ...

  const key = `${i},${j}`;

  // Already computed? Return cached result
  if (memo.has(key)) return memo.get(key)!;

  // Compute and cache
  const result = helper(i - 1, j) + helper(i, j - 1);
  memo.set(key, result);
  return result;
}
```

**Why use a string key?**
- JavaScript Maps don't support tuple keys natively
- `"2,3"` uniquely identifies cell (2,3)
- Alternative: use `i * m + j` as numeric key

**Performance improvement:**
```
3x3 grid: 63 calls → 9 unique computations
10x10 grid: millions → 100 unique computations
```

### Bottom-Up DP Explained

**Reference: Study Guide - "Step-by-Step Example"**

```typescript
// Create the table
const dp: number[][] = Array.from({ length: n }, () => Array(m).fill(0));
```

**Why `Array.from` instead of `Array(n).fill(Array(m))`?**
```typescript
// WRONG - all rows share same array reference!
const wrong = Array(3).fill(Array(3).fill(0));
wrong[0][0] = 1;
console.log(wrong[1][0]); // Also 1! Bug!

// CORRECT - each row is independent
const correct = Array.from({ length: 3 }, () => Array(3).fill(0));
correct[0][0] = 1;
console.log(correct[1][0]); // 0, as expected
```

**Filling base cases:**
```typescript
for (let i = 0; i < n; i++) dp[i][0] = 1; // First column
for (let j = 0; j < m; j++) dp[0][j] = 1; // First row
```

Only one way to reach any cell in the first row (all right) or first column (all down).

**The main loop:**
```typescript
for (let i = 1; i < n; i++) {
  for (let j = 1; j < m; j++) {
    dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    //         ↑ from above   ↑ from left
  }
}
```

Process row by row, left to right. When we compute `dp[i][j]`:
- `dp[i-1][j]` was computed in the previous row
- `dp[i][j-1]` was computed earlier in this row

### Space-Optimized Solution Explained

**Reference: Study Guide - "Space Optimization Insight"**

```typescript
const dp: number[] = Array(m).fill(1);
```

**Key insight**: We only ever look at:
- Previous row's value at same column: `dp[i-1][j]`
- Current row's value at previous column: `dp[i][j-1]`

We can overwrite as we go!

```typescript
for (let i = 1; i < n; i++) {
  for (let j = 1; j < m; j++) {
    dp[j] = dp[j] + dp[j - 1];
    //      ↑ old value (from above)
    //              ↑ new value (from left, already updated)
  }
}
```

**Example walkthrough for 3x4:**
```
Initial:    dp = [1, 1, 1, 1]  (first row)

i=1, j=1:   dp[1] = dp[1] + dp[0] = 1 + 1 = 2
            dp = [1, 2, 1, 1]
i=1, j=2:   dp[2] = dp[2] + dp[1] = 1 + 2 = 3
            dp = [1, 2, 3, 1]
i=1, j=3:   dp[3] = dp[3] + dp[2] = 1 + 3 = 4
            dp = [1, 2, 3, 4]

i=2, j=1:   dp[1] = dp[1] + dp[0] = 2 + 1 = 3
            dp = [1, 3, 3, 4]
i=2, j=2:   dp[2] = dp[2] + dp[1] = 3 + 3 = 6
            dp = [1, 3, 6, 4]
i=2, j=3:   dp[3] = dp[3] + dp[2] = 4 + 6 = 10
            dp = [1, 3, 6, 10]

Answer: dp[3] = 10
```

**Why start j from 1?**
- `dp[0]` is always 1 (first column)
- We never update it

### Mathematical Solution Explained

**Reference: Study Guide - "The Mathematical Insight"**

The path problem is equivalent to a combinatorics problem:

**Given:**
- Need (n-1) down moves
- Need (m-1) right moves
- Total moves: (n-1) + (m-1) = n + m - 2

**Question:** How many ways to arrange these moves?

**Answer:** Choose which positions are "down" (or "right"):

$$C(n+m-2, n-1) = \frac{(n+m-2)!}{(n-1)!(m-1)!}$$

```typescript
function uniquePathsMath(n: number, m: number): number {
  const totalMoves = n + m - 2;
  const chooseMoves = Math.min(n - 1, m - 1); // Optimization

  let result = 1;
  for (let i = 0; i < chooseMoves; i++) {
    result = (result * (totalMoves - i)) / (i + 1);
  }

  return Math.round(result);
}
```

**Why `Math.min(n-1, m-1)`?**
- C(10, 2) = C(10, 8) by symmetry
- Computing C(10, 2) requires 2 iterations
- Computing C(10, 8) requires 8 iterations
- Always choose the smaller!

**Why divide at each step?**
```typescript
// This can overflow:
factorial(20) = 2,432,902,008,176,640,000

// This stays manageable:
result = result * (totalMoves - i) / (i + 1)
// Alternating multiply/divide keeps numbers smaller
```

**Why `Math.round`?**
Floating-point precision errors can accumulate:
```typescript
// Without rounding:
uniquePathsMath(23, 12) = 193536719.99999997

// With rounding:
Math.round(193536719.99999997) = 193536720 ✓
```

---

## Correctness Proofs

### Recursive Solution

**Claim:** `helper(i, j)` returns the number of unique paths to cell (i, j).

**Proof by strong induction on i + j:**

**Base case (i + j = 0):**
- Only cell (0, 0) has i + j = 0
- `helper(0, 0)` returns 1 ✓
- There is exactly 1 path to the start

**Inductive step:**
Assume `helper` is correct for all cells where i' + j' < i + j.

For cell (i, j):
- Paths must come from (i-1, j) or (i, j-1)
- By induction, `helper(i-1, j)` and `helper(i, j-1)` are correct
- Total paths = paths from above + paths from left ✓

### DP Solution

**Claim:** After the algorithm, `dp[n-1][m-1]` contains the correct count.

**Proof:**

1. **Base cases are correct:**
   - `dp[i][0] = 1` for all i (only path: all down)
   - `dp[0][j] = 1` for all j (only path: all right)

2. **Recurrence is correct:**
   - We process cells in order (row by row, left to right)
   - When computing `dp[i][j]`, both `dp[i-1][j]` and `dp[i][j-1]` are already computed
   - `dp[i][j] = dp[i-1][j] + dp[i][j-1]` correctly sums paths from above and left

3. **By induction:** All cells have correct values, including `dp[n-1][m-1]`

### Mathematical Solution

**Claim:** The number of paths equals C(n+m-2, n-1).

**Proof:**

1. Any path from (0,0) to (n-1, m-1) requires:
   - Exactly (n-1) down moves
   - Exactly (m-1) right moves
   - Total: (n+m-2) moves

2. A path is uniquely determined by which moves are "down" (the rest are "right")

3. Choosing (n-1) positions for "down" from (n+m-2) total positions:
   - This is the definition of C(n+m-2, n-1)

---

## Performance Analysis

### Time Complexity

| Solution | Time | Explanation |
|----------|------|-------------|
| Recursive | O(2^(n+m)) | Binary tree of depth n+m |
| Memoization | O(n×m) | Each cell computed once |
| Bottom-Up DP | O(n×m) | Two nested loops |
| Space-Optimized | O(n×m) | Same loops, less space |
| Mathematical | O(min(n,m)) | Single loop |

### Space Complexity

| Solution | Space | Explanation |
|----------|-------|-------------|
| Recursive | O(n+m) | Call stack depth |
| Memoization | O(n×m) | Cache + stack |
| Bottom-Up DP | O(n×m) | 2D array |
| Space-Optimized | O(m) | 1D array |
| Mathematical | O(1) | Just variables |

### When to Use Each

**Recursive:** Never in production (educational only)

**Memoization:** When you need:
- Easy-to-understand code
- Natural recursive thinking
- Sparse subproblem access

**Bottom-Up DP:** When you need:
- Predictable performance
- Easy debugging (can inspect table)
- Teaching DP concepts

**Space-Optimized:** When you need:
- Memory efficiency
- Same time performance as 2D DP

**Mathematical:** When you need:
- Optimal performance
- No overflow concerns (or handle them)
- Simple implementation

---

## Common Mistakes

### Mistake 1: Wrong Array Initialization

```typescript
// WRONG - all rows share same reference
const dp = Array(n).fill(Array(m).fill(0));
dp[0][0] = 5;
console.log(dp[1][0]); // 5! Bug!

// CORRECT
const dp = Array.from({ length: n }, () => Array(m).fill(0));
```

### Mistake 2: Off-by-One in Loops

```typescript
// WRONG - misses last row/column
for (let i = 1; i < n - 1; i++) { ... }

// CORRECT
for (let i = 1; i < n; i++) { ... }
```

### Mistake 3: Wrong Base Case

```typescript
// WRONG - first cell should be 1, not 0
dp[0][0] = 0;

// CORRECT
dp[0][0] = 1; // or initialize first row/col to 1
```

### Mistake 4: Integer Overflow in Math Solution

```typescript
// WRONG - can overflow
let result = factorial(n + m - 2) / (factorial(n - 1) * factorial(m - 1));

// CORRECT - alternate multiply and divide
let result = 1;
for (let i = 0; i < chooseMoves; i++) {
  result = result * (totalMoves - i) / (i + 1);
}
```

### Mistake 5: Forgetting Edge Cases

```typescript
// WRONG - crashes on 1x1 grid
if (n === 1 || m === 1) return 1; // Add this check

// Or ensure loops handle it (they do if i=1 and j=1 conditions work)
```

---

## Extension: Grid with Obstacles

What if some cells are blocked?

```typescript
function uniquePathsWithObstacles(grid: number[][]): number {
  const n = grid.length;
  const m = grid[0].length;

  // Start or end blocked
  if (grid[0][0] === 1 || grid[n - 1][m - 1] === 1) return 0;

  const dp: number[][] = Array.from({ length: n }, () => Array(m).fill(0));

  // First cell
  dp[0][0] = 1;

  // First column (stop if obstacle)
  for (let i = 1; i < n; i++) {
    dp[i][0] = grid[i][0] === 1 ? 0 : dp[i - 1][0];
  }

  // First row (stop if obstacle)
  for (let j = 1; j < m; j++) {
    dp[0][j] = grid[0][j] === 1 ? 0 : dp[0][j - 1];
  }

  // Fill table
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < m; j++) {
      if (grid[i][j] === 1) {
        dp[i][j] = 0; // Blocked
      } else {
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      }
    }
  }

  return dp[n - 1][m - 1];
}
```

**Key change:** If a cell is blocked, set `dp[i][j] = 0`.

---

## Key Takeaways

1. **Grid paths → DP:** Classic problem with optimal substructure
2. **Recurrence:** `dp[i][j] = dp[i-1][j] + dp[i][j-1]`
3. **Base cases:** First row and column are all 1s
4. **Space optimization:** Only need previous row
5. **Math insight:** It's a combinatorics problem: C(n+m-2, n-1)
6. **Avoid overflow:** Alternate multiply/divide in math solution
7. **Array initialization:** Use `Array.from` for 2D arrays

---

## Connection to Study Guide Concepts

- **Optimal Substructure:** Paths to (i,j) depend on paths to (i-1,j) and (i,j-1)
- **Overlapping Subproblems:** Same cells computed multiple times without memoization
- **Base Cases:** First row/column have exactly 1 path each
- **Space Optimization:** Row-by-row processing enables 1D array
- **Combinatorics:** Path = sequence of R and D moves
