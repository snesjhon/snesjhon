---
description: A tree is a type of graph data structure composed of nodes and edges.
---
# Trees

#concept/data-structure

A tree is a type of graph data structure composed of nodes and edges.

## Defining Properties

- **No cycles** - No circular paths
- **Connected** - Path exists from root to any node
- **N - 1 edges** - Where N is the number of nodes
- **One parent** - Each node has exactly one parent (except root)

### Why N - 1 Edges?

In a tree, we will always have exactly `N - 1` edges because:
- More edges would create a cycle (no longer a tree)
- Fewer edges would disconnect nodes (no longer connected)

## Important Terminology

### Edge vs Leaf Node
- **Edge** = A connection (line) between two nodes
- **Leaf** = A node with no children (end nodes)

## Binary Trees

A binary tree is a tree where each node has at most 2 children.

### Perfect Binary Tree

A perfect binary tree is one where:
- Every internal node has exactly 2 children
- All leaf nodes are at the same level/depth

```
Perfect Binary Tree:
       1
      / \
     2   3
    / \ / \
   4 5 6  7
```

## Tree Traversals

All traversal types are forms of [[dfs]] - they all explore as deep as possible. They differ only in **when** they process the current node.

### In-order: Left → Current → Right
```typescript
inOrderTraversal(root.left);   // 1. Visit left subtree first
console.log(root.val);         // 2. Process current node
inOrderTraversal(root.right);  // 3. Visit right subtree last
```

### Pre-order: Current → Left → Right
```typescript
console.log(root.val);          // 1. Process current node first
preOrderTraversal(root.left);   // 2. Visit left subtree
preOrderTraversal(root.right);  // 3. Visit right subtree
```

### Post-order: Left → Right → Current
```typescript
postOrderTraversal(root.left);  // 1. Visit left subtree first
postOrderTraversal(root.right); // 2. Visit right subtree
console.log(root.val);          // 3. Process current node last
```

**Example:**
```
Tree:    A
        / \
       B   C

In-order:   B, A, C
Pre-order:  A, B, C
Post-order: B, C, A
```

## Common Patterns

### Recursive Tree Problems
Most tree problems can be solved recursively:
1. Base case: null node or leaf node
2. Recursive case: process left and right subtrees
3. Combine results

### Tree Properties to Track
- Height/depth
- Node count
- Path sums
- Balance

## Related Concepts

- [[dfs]] - Tree traversals use DFS
- [[recursion]] - Natural fit for tree problems
- [[bfs]] - Level-order traversal uses BFS

## Questions Using Trees

- Path sum problems
- Tree traversal variations
- Lowest common ancestor
- Binary search tree operations
- Tree construction problems

## My Understanding

✅ Understand tree properties and terminology
✅ Know all three traversal types
✅ Comfortable with recursive tree problems
🎯 Need more practice with iterative traversals

---

**Key Insight**: The position of `console.log` relative to recursive calls determines the traversal type!
