// Test cases for Diameter of Binary Tree

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

function diameterOfBinaryTree(root: TreeNode | null): number {
  let maxDiameter = 0;

  function height(node: TreeNode | null): number {
    if (node === null) return 0;

    const leftHeight = height(node.left);
    const rightHeight = height(node.right);

    // Calculate diameter through this node
    const diameterHere = leftHeight + rightHeight;
    maxDiameter = Math.max(maxDiameter, diameterHere);

    // Return height for parent's calculation
    return 1 + Math.max(leftHeight, rightHeight);
  }

  height(root);
  return maxDiameter;
}

// Test Case 1: Example tree [1,2,3,4,5]
//       1
//      / \
//     2   3
//    / \
//   4   5
// Expected diameter: 3 (path: 4->2->1->3 or 5->2->1->3)
const test1 = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3),
);
console.log("Test 1:", diameterOfBinaryTree(test1), "Expected: 3");

// Test Case 2: Single node
// Expected diameter: 0
const test2 = new TreeNode(1);
console.log("Test 2:", diameterOfBinaryTree(test2), "Expected: 0");

// Test Case 3: Empty tree
// Expected diameter: 0
const test3 = null;
console.log("Test 3:", diameterOfBinaryTree(test3), "Expected: 0");

// Test Case 4: Left-skewed tree [1,2,null,3]
//     1
//    /
//   2
//  /
// 3
// Expected diameter: 2
const test4 = new TreeNode(1, new TreeNode(2, new TreeNode(3), null), null);
console.log("Test 4:", diameterOfBinaryTree(test4), "Expected: 2");

// Test Case 5: Diameter doesn't pass through root
//       1
//      /
//     2
//    / \
//   3   4
//  /     \
// 5       6
// Expected diameter: 4 (path: 5->3->2->4->6)
const test5 = new TreeNode(
  1,
  new TreeNode(
    2,
    new TreeNode(3, new TreeNode(5), null),
    new TreeNode(4, null, new TreeNode(6)),
  ),
  null,
);
console.log("Test 5:", diameterOfBinaryTree(test5), "Expected: 4");

// Test Case 6: Two nodes
//   1
//  /
// 2
// Expected diameter: 1
const test6 = new TreeNode(1, new TreeNode(2), null);
console.log("Test 6:", diameterOfBinaryTree(test6), "Expected: 1");

// Test Case 7: Balanced but diameter at different node
//       1
//      / \
//     2   3
//    / \
//   4   5
//  / \
// 6   7
// Expected diameter: 4 (path: 6->4->2->5 or 7->4->2->5)
const test7 = new TreeNode(
  1,
  new TreeNode(
    2,
    new TreeNode(4, new TreeNode(6), new TreeNode(7)),
    new TreeNode(5),
  ),
  new TreeNode(3),
);
console.log("Test 7:", diameterOfBinaryTree(test7), "Expected: 4");