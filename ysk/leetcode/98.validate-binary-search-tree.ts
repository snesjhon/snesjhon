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
function isValidBST(root: TreeNode | null): boolean {
  // BST is guided by the basic logic that everything on the left is smaller and everything right
  // is bigger of the *root*
  //
  // Knowing this allows us to assume that we need to return a validation function that
  // creates a boolean recursive return, that allows us to check *every root* and then
  // pass a 'min' and 'max' and validate whether this *root* is breaking our logic

  function validate(node: TreeNode | null, min: number, max: number): boolean {
    if (node === null) return true;
    // CLAUDE: critique my thought process
    // This is returning false and the conditionals are this way because
    // if we're going right, we NEED to be bigger than our min,
    // if we're going left, we NEED to be smaller than our max, so
    // in this conditional if we do either one, then we're breaking our rules
    // This condition says that `min` is bigger and `max` is smaller, which breaks out BST rules
    if (node.val <= min || node.val >= max) return false;

    const left = validate(node.left, min, node.val);
    const right = validate(node.right, node.val, max);

    return left && right;
  }

  return validate(root, -Infinity, Infinity);
}
// @leet end

// --- Test Cases ---

// Test 1: [2,1,3] → true
//     2
//    / \
//   1   3
const t1 = new TreeNode(2, new TreeNode(1), new TreeNode(3));
console.log(isValidBST(t1)); // true

// Test 2: [5,1,4,null,null,3,6] → false
// Right child 4 < root 5 (violates BST)
//     5
//    / \
//   1   4
//      / \
//     3   6
const t2 = new TreeNode(
  5,
  new TreeNode(1),
  new TreeNode(4, new TreeNode(3), new TreeNode(6)),
);
console.log(isValidBST(t2)); // false

// Test 3: [5,4,6,null,null,3,7] → false
// Tricky: 3 is in right subtree of 5 but 3 < 5 (violates global constraint)
//     5
//    / \
//   4   6
//      / \
//     3   7
const t3 = new TreeNode(
  5,
  new TreeNode(4),
  new TreeNode(6, new TreeNode(3), new TreeNode(7)),
);
console.log(isValidBST(t3)); // false

// Test 4: null → true (empty tree)
console.log(isValidBST(null)); // true

// Test 5: [1] → true (single node)
console.log(isValidBST(new TreeNode(1))); // true

// Test 6: [1,1] → false (duplicates not allowed in strict BST)
//   1
//  /
// 1
const t6 = new TreeNode(1, new TreeNode(1), null);
console.log(isValidBST(t6)); // false

// Test 7: [2147483647] → true (INT_MAX edge case)
console.log(isValidBST(new TreeNode(2147483647))); // true
