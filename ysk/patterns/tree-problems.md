---
description: Tree-based algorithm problems and traversal patterns.
---
# Tree Problems

#pattern-guide #learning-path #concept/trees

Tree-based algorithm problems and traversal patterns.

**Core Concepts:** [[trees]], [[dfs]], [[recursion]]

---

## Common Tree Patterns

### Pattern 1: DFS Traversals
- Pre-order: Root → Left → Right
- In-order: Left → Root → Right
- Post-order: Left → Right → Root

All are forms of [[dfs]].

### Pattern 2: Recursive Tree Problems

**Template:**
```typescript
function solve(root: TreeNode | null): ReturnType {
  // Base case
  if (!root) return baseValue;

  // Recursive case
  const left = solve(root.left);
  const right = solve(root.right);

  // Combine results
  return combineResults(root.val, left, right);
}
```

### Pattern 3: Level-Order Traversal (BFS)
Use queue for breadth-first traversal.

### Pattern 4: Path Finding
- Root to leaf paths
- Path sum problems
- Lowest common ancestor

---

## Problems Practiced

### From YSK Files
- Path sum variations
- Visible tree nodes
- Tree traversals

### To Practice
- Maximum depth
- Symmetric tree
- Invert tree
- Lowest common ancestor
- Binary tree paths

---

## My Progress

**Understanding:** ✅ Core concepts solid
**Implementation:** 🔄 Need more practice
**Pattern Recognition:** 🎯 Working on it

---

**Related:** [[dfs]], [[recursion]]
