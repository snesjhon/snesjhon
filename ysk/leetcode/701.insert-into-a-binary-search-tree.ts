// @leet start
/**
 * Definition for a binary tree node.
 */

function insertIntoBST(root: TreeNode | null, val: number): TreeNode | null {
  // here's what we know:
  // - invariant: left is always smaller than root
  // - invariant: right is always larger than root
  // - root and val are values that we always need to know at every level
  // - the `val` will be inserted at `null`

  if (root === null) return new TreeNode(val);

  if (val > root.val) {
    root.right = insertIntoBST(root.right, val);
  } else {
    root.left = insertIntoBST(root.left, val);
  }

  return root;
}
// @leet end

class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
}

// Helper: inorder traversal to verify BST structure
function inorder(node: TreeNode | null): number[] {
  if (!node) return [];
  return [...inorder(node.left), node.val, ...inorder(node.right)];
}

// Test 1: root = [4,2,7,1,3], val = 5 → inorder should be [1,2,3,4,5,7]
const root1 = new TreeNode(
  4,
  new TreeNode(2, new TreeNode(1), new TreeNode(3)),
  new TreeNode(7),
);
console.log(inorder(insertIntoBST(root1, 5))); // [1,2,3,4,5,7]

// Test 2: root = [40,20,60,10,30,50,70], val = 25 → inorder should include 25 between 20 and 30
const root2 = new TreeNode(
  40,
  new TreeNode(20, new TreeNode(10), new TreeNode(30)),
  new TreeNode(60, new TreeNode(50), new TreeNode(70)),
);
console.log(inorder(insertIntoBST(root2, 25))); // [10,20,25,30,40,50,60,70]
