
> DFS === "Going Deep First"

## ??

### Is `pre-order` traversal the same as Depth First Search?

- Not really, `pre-order` is a type of DFS, but DFS is broader
- All traversal types `preorder, in-order, post-order` are DFS, they all explore as deep as possible
- They all just differ when they process the `current` node

## What is the distinction between [[DFS]] and [[1764827243-HFMW|BFS]]

```js
// DFS (any order) - uses STACK/recursion
         1
        / \
       2   3
      / \
     4   5

DFS (pre-order):  1, 2, 4, 5, 3  ← Go DEEP first
BFS (level-order): 1, 2, 3, 4, 5  ← Go WIDE first (uses QUEUE)
```

BFS uses `level-by-level` in that it uses a `queue`

# Related

## [[Recursion]]

- If the problem can be broken down into smaller copies of itself. Then it's a recursive problem.
- `Find all possible paths`

## [[Trees]]

> A tree is a type of graph data structure composed of node and edges
