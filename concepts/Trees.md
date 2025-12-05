
A tree is a type of graph data structure composed of nodes and edges.

- Doesn't contain any cycles
- There exists a path from the root to any node (This of a binary tree)
- `N - 1` edges (??) ^b748ab
  - Where `N` is the number of nodes in the tree
- Each node has exactly "one" parent node with the exception of the root node

---

[[#^b748ab | What is N - 1 Edges]]

- In a tree we will _always_ have a total of `N - 1` edges because without it we could have a cycle, which would no longer make it a tree

### Edge vs Leaf Node

- Edge = a connection (line) between two nodes
- Leaf = a node with no children (what you're describing)

## Perfect Binary Tree

A perfect binary tree is one where

- Every internal node has exactly 2 children
- all leaf nodes are the same level or depth

---

## In-Order vs PreOrder vs PostOrder tree

The order of those operations is actually different, and that's what makes each traversal unique.

Look closely at where the console.log(root.val) statement appears:

```js
In-order (line 13-19): Left → Current → Right

inOrderTraversal(root.left);   // 1. Visit left subtree first

console.log(root.val);          // 2. Process current node

inOrderTraversal(root.right);   // 3. Visit right subtree last
```

```js
 Pre-order (line 21-27): Current → Left → Right

 console.log(root.val);          // 1. Process current node first

 preOrderTraversal(root.left);   // 2. Visit left subtree

 preOrderTraversal(root.right);  // 3. Visit right subtree
```

```js
Post-order (line 29-35): Left → Right → Current

postOrderTraversal(root.left);  // 1. Visit left subtree first

postOrderTraversal(root.right); // 2. Visit right subtree

console.log(root.val);          // 3. Process current node last
```

For example, if you had a tree like:

```js
      A
     / \
    B   C
```

- In-order would print: B, A, C
- Pre-order would print: A, B, C
- Post-order would print: B, C, A

The position of the console.log relative to the recursive calls determines when each
node gets processed!
