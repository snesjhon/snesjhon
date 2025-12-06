# Recursion

#concept/algorithm #concept/pattern

A function that calls itself to solve a problem by breaking it into smaller subproblems.

## Core Idea

If a problem can be broken down into smaller copies of itself, it's a recursive problem.

## Recursive Structure

Every recursive function needs:

1. **Base Case** - When to stop recursing
2. **Recursive Case** - How to break down the problem
3. **Progress** - Each call must move toward the base case

```typescript
function recursive(n) {
  // Base case - when to stop
  if (n === 0) return someValue;

  // Recursive case - break down problem
  return recursive(n - 1) + something;
}
```

## When to Use Recursion

- Problem can be broken into smaller identical problems
- Tree or graph traversal
- "Find all possible" problems
- Divide and conquer algorithms
- Backtracking scenarios

## Common Recursive Patterns

### Tree Problems
```typescript
function traverse(node) {
  if (!node) return; // Base case

  traverse(node.left);   // Recurse left
  traverse(node.right);  // Recurse right
}
```

### Array/String Problems
```typescript
function solve(arr, index) {
  if (index >= arr.length) return; // Base case

  // Process current element
  solve(arr, index + 1); // Recurse to next
}
```

### Backtracking
```typescript
function findPaths(current, target) {
  if (current === target) {
    // Found solution
    return;
  }

  // Try all possibilities
  for (let next of possibilities) {
    findPaths(next, target);
  }
}
```

## Recursion vs Iteration

### Use Recursion When:
- Tree/graph traversal
- Problem naturally recursive (factorial, fibonacci)
- Code clarity is more important than performance
- Backtracking needed

### Use Iteration When:
- Simple loops suffice
- Stack overflow is a concern
- Performance is critical
- Tail recursion not optimized

## Common Pitfalls

1. **Missing base case** - Infinite recursion
2. **Wrong base case** - Incorrect results
3. **Not progressing** - Stack overflow
4. **Deep recursion** - Stack overflow for large inputs

## Related Concepts

- [[dfs]] - DFS naturally uses recursion
- [[trees]] - Most tree algorithms are recursive
- [[backtracking]] - Uses recursion to explore possibilities

## Questions Using Recursion

- All tree traversal problems
- Path finding
- Subset generation
- Permutations and combinations
- Divide and conquer problems

## My Understanding

✅ Understand base case and recursive case
✅ Comfortable with tree recursion
✅ Can identify when to use recursion
🎯 Need more practice converting recursion to iteration

---

**Key Insight**: If the problem can be broken down into smaller copies of itself, think recursion!
