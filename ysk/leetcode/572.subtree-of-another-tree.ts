// @leet start
/**
 * Definition for a binary tree node.
 */

// class TreeNode {
//   val: number;
//   left: TreeNode | null;
//   right: TreeNode | null;
//   constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
//     this.val = val === undefined ? 0 : val;
//     this.left = left === undefined ? null : left;
//     this.right = right === undefined ? null : right;
//   }
// }

function isSameTree(
  nodeLeft: TreeNode | null,
  nodeRight: TreeNode | null,
): boolean {
  if (!nodeLeft && !nodeRight) return true;
  if (!nodeLeft || !nodeRight) return false;
  if (nodeLeft.val !== nodeRight.val) return false;

  return (
    isSameTree(nodeLeft.left, nodeRight.left) &&
    isSameTree(nodeLeft.right, nodeRight.right)
  );
}

function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
  // given this 'current' root, are the roots the same, and if they are
  // return true, if not continue searching.

  if (!root) return false;
  if (isSameTree(root, subRoot)) return true;

  const left = isSubtree(root.left, subRoot);
  const right = isSubtree(root.right, subRoot);

  return left || right;
}
// @leet end

// Test cases
// Tree:        subRoot:
//     3            4
//    / \          / \
//   4   5        1   2
//  / \
// 1   2
// Expected: true
const root1 = new TreeNode(
  3,
  new TreeNode(4, new TreeNode(1), new TreeNode(2)),
  new TreeNode(5),
);
const subRoot1 = new TreeNode(4, new TreeNode(1), new TreeNode(2));
console.log(isSubtree(root1, subRoot1)); // true

// Tree:        subRoot:
//     3            4
//    / \          / \
//   4   5        1   2
//  / \
// 1   2
//    /
//   0
// Expected: false (extra node 0 breaks the match)
const root2 = new TreeNode(
  3,
  new TreeNode(4, new TreeNode(1), new TreeNode(2, new TreeNode(0), null)),
  new TreeNode(5),
);
const subRoot2 = new TreeNode(4, new TreeNode(1), new TreeNode(2));
console.log(isSubtree(root2, subRoot2)); // false

// root is null, subRoot is null
// Expected: true
console.log(isSubtree(null, null)); // true
//
// // root is a single node, subRoot matches it
// // Expected: true
console.log(isSubtree(new TreeNode(1), new TreeNode(1))); // true
