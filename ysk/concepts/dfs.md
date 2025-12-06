# Depth-First Search (DFS)

#concept/algorithm #concept/trees #concept/graphs

> DFS === "Going Deep First"

## Core Idea

Depth-First Search explores as far as possible along each branch before backtracking. It goes DEEP before going WIDE.

## Key Characteristics

- Uses **STACK** (or recursion which uses the call stack)
- Explores one path completely before trying others
- All tree traversals (pre-order, in-order, post-order) are types of DFS

## DFS vs BFS

```typescript
// DFS (any order) - uses STACK/recursion
         1
        / \
       2   3
      / \
     4   5

DFS (pre-order):  1, 2, 4, 5, 3  ← Go DEEP first
BFS (level-order): 1, 2, 3, 4, 5  ← Go WIDE first (uses QUEUE)
```

**BFS uses level-by-level traversal with a `queue`**

## Pre-order vs In-order vs Post-order

All are DFS - they just differ in **when** they process the current node:

### Pre-order: Current → Left → Right
```typescript
console.log(root.val);     // 1. Process current node first
preOrder(root.left);       // 2. Visit left subtree
preOrder(root.right);      // 3. Visit right subtree
```

### In-order: Left → Current → Right
```typescript
inOrder(root.left);        // 1. Visit left subtree first
console.log(root.val);     // 2. Process current node
inOrder(root.right);       // 3. Visit right subtree last
```

### Post-order: Left → Right → Current
```typescript
postOrder(root.left);      // 1. Visit left subtree first
postOrder(root.right);     // 2. Visit right subtree
console.log(root.val);     // 3. Process current node last
```

**Example Output:**
```
Tree:    A
        / \
       B   C

Pre-order:  A, B, C
In-order:   B, A, C
Post-order: B, C, A
```

## When to Use DFS

- Finding paths in a tree/graph
- Exploring all possibilities (backtracking problems)
- When you need to go deep before exploring alternatives
- Tree traversals
- Detecting cycles in graphs

## Related Concepts

- [[recursion]] - DFS naturally uses recursion
- [[trees]] - Tree traversals are DFS applications
- [[backtracking]] - Uses DFS to explore possibilities

## Questions Using DFS

- Path sum problems
- Tree traversal variations
- Graph exploration problems
- Backtracking problems

## My Understanding

✅ Understand the difference between DFS and BFS
✅ Know all three traversal types
✅ Can implement recursively
🎯 Need practice with iterative DFS using explicit stack

---

**Key Insight**: If the problem can be broken down into smaller copies of itself, it's likely a recursive/DFS problem.
