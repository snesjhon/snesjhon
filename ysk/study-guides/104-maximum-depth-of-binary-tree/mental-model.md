# Maximum Depth of Binary Tree - Deep Mental Model

> **Why This Problem Matters**: This isn't just about finding tree depth. It's about learning to think recursively with trees - a fundamental skill for hundreds of problems. Master this pattern, and you unlock: diameter, balanced trees, path sums, lowest common ancestor, and more.

---

## Table of Contents
1. [The Fundamental Question](#the-fundamental-question)
2. [Three Ways to Think About It](#three-ways-to-think-about-it)
3. [The Recursive Epiphany](#the-recursive-epiphany)
4. [Information Flow: Bottom-Up vs Top-Down](#information-flow-bottom-up-vs-top-down)
5. [Building Intuition Through Examples](#building-intuition-through-examples)
6. [The Three Approaches Compared](#the-three-approaches-compared)
7. [Common Mental Blocks](#common-mental-blocks)
8. [Pattern Recognition](#pattern-recognition)

---

## The Fundamental Question

**Surface question:** "How deep is this tree?"

**Real question:** "How do I aggregate information from children nodes to compute a property about parent nodes?"

This shift in thinking is crucial. You're not just counting levels - you're learning how to:
- Let children solve subproblems
- Combine child results at the parent
- Trust that recursion handles the rest

```
       3              Depth 1 (root)
      / \
     9  20            Depth 2
       /  \
      15   7          Depth 3

Maximum Depth = 3
```

**The insight:** Every node asks its children "How deep are you?" and then reports "I'm 1 deeper than my deepest child."

---

## Three Ways to Think About It

Understanding multiple mental models helps you choose the right approach for different problems.

### 1. The "Ask Your Children" Model (Recursive DFS)

Think of it as a conversation cascading down the tree:

```
Root(3): "Children, what's your maximum depth?"

Left(9):  "I'm a leaf, so my depth is 1"
Right(20): "Let me ask MY children..."
  Right's Left(15):  "I'm a leaf, depth 1"
  Right's Right(7):  "I'm a leaf, depth 1"
Right(20): "My max child depth is 1, so I'm depth 2"

Root(3): "Left says 1, Right says 2, so I'm depth 3"
```

**When to use:** When you need to compute properties that depend on subtree results (diameter, balance, path sums).

---

### 2. The "Level by Level" Model (BFS)

Think of it as flooding the tree with water, counting how many levels get wet:

```
Level 1: [3]              ← Water reaches here (depth++)
Level 2: [9, 20]          ← Water spreads here (depth++)
Level 3: [15, 7]          ← Water spreads here (depth++)
No more nodes? Depth = 3
```

**When to use:** When you need level-by-level operations (zigzag traversal, level order, right side view).

---

### 3. The "Depth Tracker" Model (DFS with Explicit Depth)

Think of it as carrying a depth counter as you explore:

```
Start at root(3) with depth=1
  Go left to (9) with depth=2
    (9) has no children, record maxDepth=2
  Go right to (20) with depth=2
    Go left to (15) with depth=3, record maxDepth=3
    Go right to (7) with depth=3, record maxDepth=3
Final: maxDepth = 3
```

**When to use:** When you need to track state during traversal (path finding, serialization).

---

## The Recursive Epiphany

### Why Recursion "Just Works" Here

Let's demystify the magic. The recursive solution is:

```typescript
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

**Why is this correct?** Because it mirrors **mathematical induction**:

**Base case (null tree):**
- An empty tree has depth 0 ✓

**Inductive step (non-empty tree):**
- **Assume** `maxDepth` works correctly for any tree smaller than the current one
- The depth of current tree = 1 (current node) + max(left subtree depth, right subtree depth)
- Since left and right subtrees are smaller, our assumption says `maxDepth` will work on them
- Therefore, `maxDepth` works on the current tree ✓

This is why you can "trust" recursion - it's mathematically sound!

### The Two-Phase Process

Every recursive call has two phases:

```typescript
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;

  // PHASE 1: GOING DOWN (making recursive calls)
  const leftDepth = maxDepth(root.left);   // Dive into left
  const rightDepth = maxDepth(root.right); // Dive into right

  // PHASE 2: COMING BACK UP (processing results)
  return 1 + Math.max(leftDepth, rightDepth); // Combine and return
}
```

**Going down:** Breaking the problem into smaller pieces (divide)
**Coming up:** Combining the pieces into a solution (conquer)

This is **post-order traversal**: process children before parent.

---

## Information Flow: Bottom-Up vs Top-Down

This is crucial for understanding when to use which approach.

### Bottom-Up (Post-Order): Information Flows UP

**Pattern:** Children compute values → parent uses them

```
Leaves know:      "I'm depth 1"
                      ↑
                   Information
                    flows UP
                      ↑
Parents compute:  "I'm 1 + max(child depths)"
                      ↑
Root gets answer: "I'm depth 3"
```

**Use when:** Computing properties that depend on subtree results
- Maximum depth ✓
- Diameter (longest path)
- Tree balance
- Maximum path sum

**Code pattern:**
```typescript
function solve(root) {
  if (!root) return baseValue;
  const left = solve(root.left);   // Get child result
  const right = solve(root.right); // Get child result
  return combine(left, right);     // Combine at parent
}
```

### Top-Down (Pre-Order): Information Flows DOWN

**Pattern:** Parent passes values → children use them

```
Root provides:    "You're at depth 1"
                      ↓
                  Information
                   flows DOWN
                      ↓
Children learn:   "We're at depth 2"
                      ↓
Leaves track:     "We're at depth 3" (record max)
```

**Use when:** Propagating state from ancestors to descendants
- Path sum (check if path equals target)
- Validate BST (passing min/max constraints)
- Printing paths

**Code pattern:**
```typescript
function solve(root, stateFromParent) {
  if (!root) return;
  const newState = process(stateFromParent, root);
  solve(root.left, newState);  // Pass state down
  solve(root.right, newState); // Pass state down
}
```

### Why This Matters

**For max depth:** We need bottom-up because:
- Leaves don't know the tree depth
- Parents need child information to compute their own depth
- Information naturally flows from leaves → root

Understanding this flow helps you choose the right pattern for new problems!

---

## Building Intuition Through Examples

Let's build up complexity to develop intuition about how recursion unfolds.

### Level 0: The Null Case
```
Input: null

maxDepth(null) → 0
```

**Why 0, not -1 or 1?**
- 0 makes the math work: if a node has no children, `1 + max(0, 0) = 1` ✓
- Semantically: "no tree" has no depth
- This base case is the foundation of all recursive calls

---

### Level 1: Single Node
```
Input: [1]
       1

maxDepth(1)
├─ maxDepth(null) → 0  // left child
└─ maxDepth(null) → 0  // right child
return 1 + max(0, 0) = 1 ✓
```

**Key insight:** Even a leaf node makes recursive calls! The recursion doesn't "know" it's a leaf until it tries to access children and gets `null`.

---

### Level 2: Two Nodes (Unbalanced)
```
Input: [1,null,2]
       1
        \
         2

Execution trace:
maxDepth(1)
├─ maxDepth(null) → 0                    // left child
└─ maxDepth(2)                           // right child
   ├─ maxDepth(null) → 0                 // left child of 2
   └─ maxDepth(null) → 0                 // right child of 2
   return 1 + max(0, 0) = 1
return 1 + max(0, 1) = 2 ✓
```

**Key insight:** Null children don't cause issues - they just return 0. The recursion gracefully handles missing children.

---

### Level 3: Balanced Tree
```
Input: [1,2,3]
       1
      / \
     2   3

Execution order (post-order):

1. maxDepth(2)
   ├─ maxDepth(null) → 0
   └─ maxDepth(null) → 0
   return 1

2. maxDepth(3)
   ├─ maxDepth(null) → 0
   └─ maxDepth(null) → 0
   return 1

3. maxDepth(1)
   ├─ uses result from step 1: 1
   └─ uses result from step 2: 1
   return 1 + max(1, 1) = 2 ✓
```

**Key insight:** The recursion completes left subtree ENTIRELY before starting right subtree. This is DFS!

---

### Level 4: The Classic Unbalanced Case
```
Input: [3,9,20,null,null,15,7]
         3
        / \
       9  20
         /  \
        15   7

Let's trace the COMPLETE execution flow:

maxDepth(3)                                   [Call #1]
│
├─ maxDepth(9)                                [Call #2]
│  ├─ maxDepth(null) → 0                      [Call #3]
│  └─ maxDepth(null) → 0                      [Call #4]
│  return 1 + max(0,0) = 1                    [Return to #1]
│
└─ maxDepth(20)                               [Call #5]
   ├─ maxDepth(15)                            [Call #6]
   │  ├─ maxDepth(null) → 0                   [Call #7]
   │  └─ maxDepth(null) → 0                   [Call #8]
   │  return 1 + max(0,0) = 1                 [Return to #5]
   │
   └─ maxDepth(7)                             [Call #9]
      ├─ maxDepth(null) → 0                   [Call #10]
      └─ maxDepth(null) → 0                   [Call #11]
      return 1 + max(0,0) = 1                 [Return to #5]
   return 1 + max(1,1) = 2                    [Return to #1]

return 1 + max(1,2) = 3 ✓                     [Final answer]
```

**Key insights:**
1. **11 function calls** for a 5-node tree! We visit every node and every null child.
2. **Execution order:** 3 → 9 → 9's nulls → 20 → 15 → 15's nulls → 7 → 7's nulls → back to 20 → back to 3
3. **The stack grows and shrinks:** Max stack depth is 3 (path: 3 → 20 → 15)
4. **Results bubble up:** 15 & 7 return 1 → 20 returns 2 → 3 returns 3

---

### What Happens in the Call Stack?

For tree `[1,2,3]`, let's see the stack at each moment:

```
Time 1: maxDepth(1) calls maxDepth(2)
Stack: [maxDepth(1), maxDepth(2)]

Time 2: maxDepth(2) calls maxDepth(null)
Stack: [maxDepth(1), maxDepth(2), maxDepth(null)]

Time 3: maxDepth(null) returns 0
Stack: [maxDepth(1), maxDepth(2)]

Time 4: maxDepth(2) calls maxDepth(null) for right child
Stack: [maxDepth(1), maxDepth(2), maxDepth(null)]

Time 5: maxDepth(null) returns 0
Stack: [maxDepth(1), maxDepth(2)]

Time 6: maxDepth(2) computes 1 + max(0,0) = 1 and returns
Stack: [maxDepth(1)]

Time 7: maxDepth(1) calls maxDepth(3)
Stack: [maxDepth(1), maxDepth(3)]

... (similar for right subtree)

Final: maxDepth(1) computes 1 + max(1,1) = 2 and returns
Stack: []
```

**Key insight:** Stack depth = tree height. For skewed tree, stack depth = n (all nodes on stack). For balanced tree, stack depth = log(n).

---

## The Three Approaches Compared

Let's deeply understand when and why to choose each approach.

### Approach 1: Recursive DFS (Post-Order)

```typescript
function maxDepth(root: TreeNode | null): number {
  // Base case: empty tree contributes nothing
  if (root === null) return 0;

  // Recursive case: get depths from children
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);

  // Combine: current node + max of children
  return 1 + Math.max(leftDepth, rightDepth);
}
```

**Mental model:** "Ask your children, then compute your own answer"

**Pros:**
- Most intuitive for this problem
- Natural fit for bottom-up computation
- Easiest to reason about correctness
- Shortest code (can be one line!)
- Extends naturally to related problems (diameter, balance check)

**Cons:**
- Uses call stack (recursion overhead)
- Can overflow on very deep trees (rare in practice)
- Harder to debug if you're not comfortable with recursion

**Space analysis:**
- O(h) where h = height
- Best case (balanced): O(log n)
- Worst case (skewed): O(n)

**When to use:**
- Default choice for tree property calculations
- When the problem involves combining child results
- In interviews (shows understanding of recursion)

---

### Approach 2: Iterative BFS (Level Order Traversal)

```typescript
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;

  let depth = 0;
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length; // Critical: capture size before loop
    depth++;

    // Process all nodes at current level
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  return depth;
}
```

**Mental model:** "Process one level at a time, count the levels"

**How it works:**

```
Level 1: queue = [3]           → depth = 1, add children [9, 20]
Level 2: queue = [9, 20]       → depth = 2, add children [15, 7]
Level 3: queue = [15, 7]       → depth = 3, add children []
No more levels → return 3
```

**The clever trick:** `levelSize = queue.length` before the loop is crucial! It captures how many nodes are at the current level, so we process exactly that many before moving to the next level.

**Pros:**
- No recursion (no stack overflow risk)
- Easier to debug (can print state at each level)
- Natural fit for level-based problems
- More intuitive if you're not comfortable with recursion

**Cons:**
- More code than recursive version
- Uses queue (explicit memory)
- Overkill for simple depth calculation

**Space analysis:**
- O(w) where w = max width of tree
- Best case (skewed): O(1)
- Worst case (complete tree): O(n/2) = O(n) at bottom level

**When to use:**
- When you need level-by-level processing (level order traversal, zigzag)
- When you want to avoid recursion
- When tree might be very deep (unlikely stack overflow)
- Problems asking for "level", "row", or "layer" information

---

### Approach 3: Iterative DFS (Explicit Stack)

```typescript
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;

  let maxDepth = 0;
  const stack: [TreeNode, number][] = [[root, 1]]; // [node, depth at this node]

  while (stack.length > 0) {
    const [node, depth] = stack.pop()!;
    maxDepth = Math.max(maxDepth, depth); // Track maximum seen

    // Push children with incremented depth
    if (node.left) stack.push([node.left, depth + 1]);
    if (node.right) stack.push([node.right, depth + 1]);
  }

  return maxDepth;
}
```

**Mental model:** "Explore paths, track the maximum depth reached"

**How it works:**

```
Stack: [(3,1)]                    → pop (3,1), maxDepth=1, push [(9,2), (20,2)]
Stack: [(9,2), (20,2)]            → pop (20,2), maxDepth=2, push [(9,2), (15,3), (7,3)]
Stack: [(9,2), (15,3), (7,3)]     → pop (7,3), maxDepth=3
Stack: [(9,2), (15,3)]            → pop (15,3), maxDepth=3
Stack: [(9,2)]                    → pop (9,2), maxDepth=3
Stack: []                         → done, return 3
```

**Pros:**
- No recursion (explicit stack control)
- Same space complexity as recursive version
- Can simulate recursion behavior
- Good for when you need to avoid call stack

**Cons:**
- Most code of all three approaches
- Less intuitive than recursive version
- Manual depth tracking can be error-prone
- Doesn't provide advantages over BFS for this problem

**Space analysis:**
- O(h) like recursive, but using explicit stack

**When to use:**
- When you want DFS behavior but can't use recursion
- When you need more control over traversal order
- Educational purposes (to understand how recursion works internally)

---

### Decision Matrix: Which Approach to Choose?

| Scenario | Best Approach | Why |
|----------|---------------|-----|
| Default/Interview | Recursive DFS | Cleanest, most intuitive |
| Need level info | BFS | Natural fit |
| Very deep tree | BFS or Iterative DFS | Avoid stack overflow |
| Already using BFS pattern | BFS | Consistency |
| Learning recursion | Recursive DFS | Best teaching example |
| Production code | Recursive DFS | Simplest = fewer bugs |

**For max depth specifically:** Recursive DFS wins. It's the most elegant and readable.

---

## Time and Space Complexity

### Recursive Approach
- **Time:** O(n) - visit each node exactly once
- **Space:** O(h) - recursion stack depth, where h = height of tree
  - Best case (balanced): O(log n)
  - Worst case (skewed): O(n)

### BFS Iterative
- **Time:** O(n) - visit each node exactly once
- **Space:** O(w) - queue width, where w = max width of tree
  - Best case (skewed): O(1)
  - Worst case (complete tree): O(n/2) = O(n)

### DFS Iterative
- **Time:** O(n) - visit each node exactly once
- **Space:** O(h) - stack depth (same as recursive)

---

## Common Mental Blocks

Understanding what trips people up helps you avoid these pitfalls.

### Mental Block #1: "I need to track depth as I go"

**The trap:**
```typescript
// WRONG: Trying to pass depth down
function maxDepth(root: TreeNode | null, currentDepth: number): number {
  if (root === null) return currentDepth;
  return Math.max(
    maxDepth(root.left, currentDepth + 1),
    maxDepth(root.right, currentDepth + 1)
  );
}
```

**Why it fails:** You're mixing top-down and bottom-up thinking!

- When you pass `currentDepth` down, you're thinking top-down (parent tells children their depth)
- But then you're trying to return max depth up, which is bottom-up (children tell parent their depth)

**The fix:** Pick ONE direction:
```typescript
// CORRECT: Pure bottom-up
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0; // No depth parameter needed!
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

**Lesson:** For properties computed from children → use bottom-up (no depth parameter)

---

### Mental Block #2: "Null should return 1 because it's still a node"

**The trap:**
```typescript
// WRONG: Null returns 1
if (root === null) return 1;
```

**Why it fails:**
```
Tree: [1]
       1
      / \
    null null

maxDepth(1) = 1 + max(1, 1) = 3 ❌ (Should be 1!)
```

**The insight:** Null represents **absence** of a tree, not a node. Empty tree has depth 0.

**The math check:** For a leaf node to have depth 1:
```
1 + max(0, 0) = 1 ✓  (with null → 0)
1 + max(1, 1) = 3 ✗  (with null → 1)
```

**Lesson:** Base cases must make the recursive math work correctly.

---

### Mental Block #3: "I don't understand when recursion stops"

**The confusion:** "If every call makes two more calls, won't it recurse forever?"

**The clarity:**
```
Tree: [1,2,3]
       1
      / \
     2   3

Call tree:
maxDepth(1)                 ← Makes 2 calls
├─ maxDepth(2)              ← Makes 2 calls
│  ├─ maxDepth(null) → 0    ← BASE CASE! Returns immediately
│  └─ maxDepth(null) → 0    ← BASE CASE! Returns immediately
└─ maxDepth(3)              ← Makes 2 calls
   ├─ maxDepth(null) → 0    ← BASE CASE! Returns immediately
   └─ maxDepth(null) → 0    ← BASE CASE! Returns immediately
```

**The insight:** Every path eventually reaches `null` (base case). Trees are finite, so recursion must terminate.

**The mathematical proof:**
- Each recursive call moves to a child node
- Trees have finite nodes
- Every downward path eventually reaches a leaf
- Leaves have `null` children → base case reached
- Therefore, recursion terminates ✓

**Lesson:** Trust that base cases will be reached. Trees naturally terminate recursion.

---

### Mental Block #4: "Should I process the node before or after recursion?"

**The confusion:** Where does the `return 1 + max(...)` go?

```typescript
// Option A: Process before recursing?
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  const result = 1; // Process now?
  return result + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// Option B: Process after recursing?
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  const left = maxDepth(root.left);   // Recurse first
  const right = maxDepth(root.right); // Recurse first
  return 1 + Math.max(left, right);   // Then process
}
```

**The insight:** Both are equivalent! But Option B makes the flow clearer:
1. Get child results
2. Combine them
3. Add your contribution

This is the **post-order pattern**: left → right → process current

**Traversal order refresher:**
- **Pre-order:** Process current → left → right (top-down)
- **In-order:** Left → process current → right (for BST)
- **Post-order:** Left → right → process current (bottom-up)

**Lesson:** For bottom-up computation, use post-order (process after children).

---

### Mental Block #5: "Can't I just count as I traverse?"

**The attempt:**
```typescript
// WRONG: Global counter approach
let maxDepth = 0;

function traverse(root: TreeNode | null, depth: number): void {
  if (root === null) {
    maxDepth = Math.max(maxDepth, depth);
    return;
  }
  traverse(root.left, depth + 1);
  traverse(root.right, depth + 1);
}
```

**Why it works but is poor style:**
- Global state makes testing harder
- Not functional (side effects)
- Harder to reason about
- Doesn't compose well with other operations

**The lesson:** Prefer pure functions that return values over global state mutation.

---

### Mental Block #6: "What if I forget to return something?"

**The trap:**
```typescript
// WRONG: No return statement
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  const left = maxDepth(root.left);
  const right = maxDepth(root.right);
  1 + Math.max(left, right); // Missing return!
}
```

**The symptom:** Function returns `undefined`, tests fail mysteriously.

**The prevention:**
- Use TypeScript (catches missing returns)
- Write base case first (ensures you think about return values)
- Test immediately with simple cases

**Lesson:** Always explicitly return in recursive functions.

---

### Mental Block #7: "I can't visualize the recursion tree"

**The technique:** Trace by hand with a simple example.

Pick `[1,2]`:
```
       1
      /
     2

Step 1: Write the call
maxDepth(1)

Step 2: Expand the recursive calls
maxDepth(1)
├─ maxDepth(2)
└─ maxDepth(null)

Step 3: Expand further
maxDepth(1)
├─ maxDepth(2)
│  ├─ maxDepth(null)
│  └─ maxDepth(null)
└─ maxDepth(null)

Step 4: Evaluate from bottom up
maxDepth(1)
├─ maxDepth(2)
│  ├─ maxDepth(null) → 0
│  └─ maxDepth(null) → 0
│  return 1 + max(0,0) = 1
└─ maxDepth(null) → 0
return 1 + max(1,0) = 2 ✓
```

**Lesson:** Start with tiny examples (2-3 nodes). Build confidence before tackling complex cases.

---

## The Mental Model Checklist

- [ ] **Base case:** null → 0 depth
- [ ] **Recursive calls:** Get depth of left and right children
- [ ] **Combine results:** 1 + max(left, right)
- [ ] **Trust recursion:** Don't try to trace every call manually
- [ ] **Edge cases:** Empty tree, single node, unbalanced tree

---

## Pattern Recognition: The Foundation for Dozens of Problems

This simple problem teaches you the **"Post-Order DFS for Bottom-Up Aggregation"** pattern - one of the most important patterns in tree algorithms.

### The Core Pattern

```typescript
function computeProperty(root: TreeNode | null): ResultType {
  // 1. Base case: handle empty tree
  if (root === null) return baseValue;

  // 2. Recursively compute for children
  const leftResult = computeProperty(root.left);
  const rightResult = computeProperty(root.right);

  // 3. Combine results with current node
  return combine(leftResult, rightResult, root.val);
}
```

**When to use:** Whenever you need to compute a property where:
- The answer depends on results from child nodes
- You combine child results at the parent
- Information flows from leaves → root

---

### Problem Family 1: Single Value Aggregation

**Pattern:** Compute one value from the entire tree.

#### Max Depth (This Problem)
```typescript
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```
**Formula:** `1 + max(left, right)`

#### Min Depth
```typescript
function minDepth(root) {
  if (!root) return 0;
  if (!root.left) return 1 + minDepth(root.right);  // Only right exists
  if (!root.right) return 1 + minDepth(root.left);   // Only left exists
  return 1 + Math.min(minDepth(root.left), minDepth(root.right));
}
```
**Twist:** Must reach a **leaf** node! Can't just take min of children.
**Formula:** `1 + min(left, right)` (but handle missing children)

#### Count Nodes
```typescript
function countNodes(root) {
  if (!root) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}
```
**Formula:** `1 + left_count + right_count`

#### Sum of All Nodes
```typescript
function sumNodes(root) {
  if (!root) return 0;
  return root.val + sumNodes(root.left) + sumNodes(root.right);
}
```
**Formula:** `current_val + left_sum + right_sum`

**The pattern:** Same structure, different combining function!

---

### Problem Family 2: Diameter/Path Problems

**Pattern:** Find longest/best path in tree (may not go through root).

#### Diameter of Binary Tree (LeetCode 543)
```typescript
function diameterOfBinaryTree(root) {
  let maxDiameter = 0;

  function depth(node) {
    if (!node) return 0;

    const left = depth(node.left);
    const right = depth(node.right);

    // Diameter through this node = left depth + right depth
    maxDiameter = Math.max(maxDiameter, left + right);

    // Return depth of this subtree
    return 1 + Math.max(left, right);
  }

  depth(root);
  return maxDiameter;
}
```

**Key insight:** At each node, we:
1. Compute diameter through THIS node (`left + right`)
2. Return depth for parent's calculation (`1 + max(left, right)`)

This is the **"two birds, one stone" pattern**: compute two things in one traversal.

#### Maximum Path Sum (LeetCode 124)
```typescript
function maxPathSum(root) {
  let maxSum = -Infinity;

  function maxGain(node) {
    if (!node) return 0;

    // Only take positive gains
    const left = Math.max(0, maxGain(node.left));
    const right = Math.max(0, maxGain(node.right));

    // Path through this node
    maxSum = Math.max(maxSum, node.val + left + right);

    // Return max gain extending from this node
    return node.val + Math.max(left, right);
  }

  maxGain(root);
  return maxSum;
}
```

**Key insight:** Same pattern as diameter! But now:
- We consider node values (not just structure)
- We can choose to exclude negative paths

**The pattern:** Compute local optimum (path through this node) + return value for parent.

---

### Problem Family 3: Validation Problems

**Pattern:** Check if tree satisfies a property.

#### Balanced Binary Tree (LeetCode 110)
```typescript
function isBalanced(root) {
  function checkHeight(node) {
    if (!node) return 0;

    const left = checkHeight(node.left);
    if (left === -1) return -1;  // Left subtree not balanced

    const right = checkHeight(node.right);
    if (right === -1) return -1;  // Right subtree not balanced

    // Check if current node is balanced
    if (Math.abs(left - right) > 1) return -1;

    return 1 + Math.max(left, right);
  }

  return checkHeight(root) !== -1;
}
```

**Key insight:** Use return value to signal both:
- Height (normal return value)
- Invalid state (special return value like -1)

This is the **"return signal" pattern**.

#### Same Tree (LeetCode 100)
```typescript
function isSameTree(p, q) {
  // Both null → same
  if (!p && !q) return true;

  // One null, one not → different
  if (!p || !q) return false;

  // Values differ → different
  if (p.val !== q.val) return false;

  // Check both subtrees
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```

**Formula:** `current_match && left_match && right_match`

---

### Problem Family 4: Tree Property Computation

#### Count Good Nodes (LeetCode 1448)

**Problem:** Count nodes >= all ancestors.

```typescript
function goodNodes(root) {
  function dfs(node, maxSoFar) {
    if (!node) return 0;

    // Is this node good?
    const isGood = node.val >= maxSoFar ? 1 : 0;

    // Update max for children
    const newMax = Math.max(maxSoFar, node.val);

    return isGood + dfs(node.left, newMax) + dfs(node.right, newMax);
  }

  return dfs(root, -Infinity);
}
```

**Key insight:** Pass information down (maxSoFar) + aggregate information up (count).

This is **"hybrid: top-down + bottom-up"**.

---

### Problem Family 5: Tree Transformation

#### Invert Binary Tree (LeetCode 226)
```typescript
function invertTree(root) {
  if (!root) return null;

  // Recursive case: invert children, then swap
  const left = invertTree(root.left);
  const right = invertTree(root.right);

  root.left = right;
  root.right = left;

  return root;
}
```

**Formula:** Transform children → modify current → return current.

---

### The Meta-Pattern: How to Identify This Pattern

Ask yourself these questions:

1. **Does the answer depend on subtree results?**
   - Yes → Likely post-order DFS

2. **What's the base case?**
   - Empty tree → Usually return 0, null, true, or some identity value

3. **How do I combine child results?**
   - Sum? Max? Min? AND? OR? Custom function?

4. **Do I need one pass or two?**
   - One pass → Compute everything in one DFS
   - Two passes → First compute, then use results

5. **Information flow direction?**
   - Bottom-up → Post-order (children first)
   - Top-down → Pre-order (parent first)
   - Both → Hybrid approach

---

### The Checklist for New Problems

When you see a new tree problem:

1. [ ] Identify if it's bottom-up or top-down
2. [ ] Write the base case first (`if (!root) return ...`)
3. [ ] Make recursive calls to children
4. [ ] Decide how to combine results
5. [ ] Consider if you need to track external state (like `maxDiameter`)
6. [ ] Test with null, single node, two nodes before complex cases

---

### Why This Matters

**Max Depth** is simple, but it teaches you:
- How to think recursively about trees
- How to combine child results
- How to choose base cases
- How to trust recursion

Once you internalize this pattern, you can solve:
- Diameter of Binary Tree
- Balanced Binary Tree
- Maximum Path Sum
- Binary Tree Maximum Path Sum
- Lowest Common Ancestor
- Count Good Nodes
- House Robber III
- Binary Tree Cameras
- Distribute Coins in Binary Tree
- ... and dozens more!

**Master this one pattern, unlock 50+ problems.**

---

## Complexity Analysis Deep Dive

Understanding the complexity helps you appreciate trade-offs.

### Time Complexity: O(n) for all approaches

**Why?** We must visit every node at least once.

**Proof:** To know the maximum depth, we might need to explore every path. Consider:
```
       1
      / \
     2   3
    /     \
   4       5
```
We can't determine max depth without visiting all nodes. What if 4 had a long chain? We have to check.

**For each approach:**
- Recursive DFS: Visit each node once, O(1) work per node → O(n)
- BFS: Visit each node once, O(1) work per node → O(n)
- Iterative DFS: Visit each node once, O(1) work per node → O(n)

---

### Space Complexity: Different for each!

#### Recursive DFS: O(h) where h = height

**Best case (balanced tree):** O(log n)
```
         1
       /   \
      2     3       Height = log(n)
     / \   / \
    4   5 6   7
```
Max call stack depth = height = log₂(7) ≈ 3

**Worst case (skewed tree):** O(n)
```
    1
     \
      2              Height = n
       \
        3
```
Max call stack depth = height = 3 = n

**Average case:** O(log n) for random trees

---

#### BFS: O(w) where w = max width

**Best case (skewed tree):** O(1)
```
    1
     \
      2              Max width = 1
       \
        3
```
Queue only holds 1 node at a time.

**Worst case (complete tree):** O(n/2) = O(n)
```
         1
       /   \
      2     3       Bottom level has n/2 nodes
     / \   / \
    4   5 6   7
```
Queue holds entire bottom level at once.

**Average case:** O(n/2) = O(n) for balanced trees

---

#### The Space Trade-off

```
Skewed tree:
- Recursive DFS: O(n) - WORST
- BFS: O(1) - BEST
- Iterative DFS: O(n)

Balanced tree:
- Recursive DFS: O(log n) - BEST
- BFS: O(n) - WORST
- Iterative DFS: O(log n) - BEST
```

**In practice:** Trees are rarely perfectly balanced or completely skewed. For real-world data:
- Use recursive DFS (simplest, usually O(log n) space)
- Use BFS only if you have other reasons (level-based logic)

---

## Deeper Insights

### Why Recursion "Just Works"

Many people struggle to trust recursion. Here's why it's trustworthy:

**1. Mathematical Foundation (Induction)**

The recursive solution is a direct translation of mathematical induction:

**Base case:** maxDepth(null) = 0
**Inductive step:** If maxDepth works for trees of size < n, then for size n:
- maxDepth(tree of size n) = 1 + max(maxDepth(left), maxDepth(right))
- Left and right have size < n, so maxDepth works on them (by assumption)
- Therefore maxDepth works on tree of size n ✓

**2. Natural Problem Decomposition**

Tree problems naturally decompose:
- Big tree = root + left subtree + right subtree
- Left and right subtrees are smaller trees
- Solution for big tree = combine solutions for small trees

**3. The Call Stack Does the Work**

You don't manually track which nodes you've visited or how to backtrack. The call stack:
- Remembers where you came from
- Automatically backtracks when a call returns
- Maintains the correct context for each node

**Trust the process:** Write the base case, write the recursive case, let the magic happen.

---

### The One-Liner and Why It Works

```typescript
function maxDepth(root: TreeNode | null): number {
  return root === null ? 0 : 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

This is beautiful because it's **declarative, not imperative**:
- Imperative: "Do this, then this, then this..."
- Declarative: "The depth is 0 if empty, otherwise 1 + max of children"

You're stating **what** the depth is, not **how** to compute it step-by-step.

This is the power of recursion: expressing the solution in terms of the problem's structure.

---

### Visual Metaphors That Help

#### 1. Mountain Climbing
```
        🏔️ (peak at depth 3)
       /
      🏔️
     /
    🚶 (start at root)
```
"How tall is the tallest mountain in this range?"

#### 2. Organization Hierarchy
```
        CEO (depth 3)
         |
    Managers (each reports max depth below them)
         |
    Employees (depth 1)
```
"What's the deepest level in the organization?"

#### 3. Water Filling
```
Pour water from root:
Level 1: [3]      ← fills
Level 2: [9,20]   ← fills
Level 3: [15,7]   ← fills
Measure: 3 levels
```
"How many levels does the water fill?"

Pick the metaphor that resonates with you!

---

## Practice Exercise

Before looking at solutions, try these by hand:

### Exercise 1: Different tree shapes

What's the depth and space complexity?

```
Tree A (balanced):    Tree B (skewed):
       1                   1
      / \                   \
     2   3                   2
    / \                       \
   4   5                       3
```

<details>
<summary>Answers</summary>

Tree A:
- Depth: 3
- Recursive space: O(log n) = O(2)
- BFS space: O(n/2) = O(2)

Tree B:
- Depth: 3
- Recursive space: O(n) = O(3)
- BFS space: O(1)
</details>

### Exercise 2: Trace execution

Trace the recursive calls for:
```
   1
  / \
 2   3
```

<details>
<summary>Answer</summary>

```
maxDepth(1)
├─ maxDepth(2)
│  ├─ maxDepth(null) → return 0
│  └─ maxDepth(null) → return 0
│  compute: 1 + max(0,0) = 1
│  return 1
└─ maxDepth(3)
   ├─ maxDepth(null) → return 0
   └─ maxDepth(null) → return 0
   compute: 1 + max(0,0) = 1
   return 1
compute: 1 + max(1,1) = 2
return 2 ✓
```

Total function calls: 7
Max call stack depth: 2
</details>

### Exercise 3: Modify for min depth

Change the solution to find **minimum** depth to a leaf.

<details>
<summary>Solution</summary>

```typescript
function minDepth(root: TreeNode | null): number {
  if (!root) return 0;

  // If one child is missing, must go to the other
  if (!root.left) return 1 + minDepth(root.right);
  if (!root.right) return 1 + minDepth(root.left);

  // Both children exist, take min
  return 1 + Math.min(minDepth(root.left), minDepth(root.right));
}
```

**Key difference:** Can't stop at first null - must reach a leaf!
</details>

---

## Summary: The Key Takeaways

1. **Post-order DFS is the pattern:** Left → Right → Process Current
2. **Base case is critical:** Null returns 0 (makes the math work)
3. **Combine child results:** 1 + max(left, right)
4. **Three approaches exist:** Recursive (best), BFS (for levels), Iterative DFS (for control)
5. **Space complexity varies:** O(h) for DFS, O(w) for BFS
6. **This pattern unlocks 50+ problems:** Diameter, balance, path sum, etc.
7. **Trust recursion:** It's mathematically sound (induction)

---

## What Makes This Problem Foundational

This isn't just about finding depth. You're learning:

1. **How to think recursively** - Breaking problems into subproblems
2. **Bottom-up computation** - Gathering info from children
3. **Post-order traversal** - When and why to use it
4. **Base case design** - Making the math work correctly
5. **Pattern recognition** - Seeing the structure in new problems

**Once you "get" this problem, you unlock:**
- Diameter of Binary Tree
- Balanced Binary Tree
- Maximum Path Sum
- Lowest Common Ancestor
- Symmetric Tree
- Same Tree
- Subtree of Another Tree
- ... and many more!

---

## Final Wisdom

**When learning:** Start simple. Trace by hand. Build intuition with small examples.

**When coding:** Write base case first. Trust recursion. Test immediately.

**When stuck:** Draw the tree. Identify information flow (up or down). Ask: "What do I need from children?"

**When interviewing:** Explain the pattern. Mention alternatives. Analyze trade-offs.

This simple problem is your gateway to mastering tree algorithms. Take the time to truly understand it, and you'll thank yourself when facing harder problems!

---

*Happy coding! 🌲*