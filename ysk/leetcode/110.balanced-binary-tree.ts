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

function isBalanced(root: TreeNode | null): boolean {
  function dfs(node: TreeNode | null): number | false {
    if (!node) return 0;

    const left = dfs(node.left);
    const right = dfs(node.right);

    if (left === false || right === false) return false;
    if (Math.abs(left - right) > 1) return false;

    return Math.max(left, right) + 1;
  }

  return dfs(root) !== false;
}
// @leet end

// --- Test Cases ---

// Test 1: [3,9,20,null,null,15,7] → true
//       3
//      / \
//     9  20
//        / \
//       15   7
const t1 = new TreeNode(
  3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7)),
);
console.log(isBalanced(t1)); // true

// Test 2: [1,2,2,3,3,null,null,4,4] → false
//         1
//        / \
//       2   2
//      / \
//     3   3
//    / \
//   4   4
const t2 = new TreeNode(
  1,
  new TreeNode(
    2,
    new TreeNode(3, new TreeNode(4), new TreeNode(4)),
    new TreeNode(3),
  ),
  new TreeNode(2),
);
console.log(isBalanced(t2)); // false

// Test 3: null → true (empty tree)
console.log(isBalanced(null)); // true

// Test 4: single node → true
console.log(isBalanced(new TreeNode(1))); // true

// Test 5: left-skewed (height diff > 1) → false
//   1
//  /
// 2
//  \
//   3
const t5 = new TreeNode(1, new TreeNode(2, null, new TreeNode(3)), null);
console.log(isBalanced(t5)); // false
