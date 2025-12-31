// Maximum Depth of Binary Tree

// Definition for a binary tree node
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

function maxDepth(): number {}

// Test Cases
console.log("Test Case 1 - Balanced tree [3,9,20,null,null,15,7]");
const test1 = new TreeNode(
  3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7)),
);
console.log("Expected: 3");
console.log("Result:", maxDepth(test1));
console.log();

console.log("Test Case 2 - Right-skewed tree [1,null,2]");
const test2 = new TreeNode(1, null, new TreeNode(2));
console.log("Expected: 2");
console.log("Result:", maxDepth(test2));
console.log();

console.log("Test Case 3 - Single node [0]");
const test3 = new TreeNode(0);
console.log("Expected: 1");
console.log("Result:", maxDepth(test3));
console.log();

console.log("Test Case 4 - Empty tree");
const test4 = null;
console.log("Expected: 0");
console.log("Result:", maxDepth(test4));
console.log();

console.log("Test Case 5 - Left-skewed tree");
const test5 = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(3, new TreeNode(4))),
  null,
);
console.log("Expected: 4");
console.log("Result:", maxDepth(test5));
console.log();

console.log("Test Case 6 - Larger balanced tree");
const test6 = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3, new TreeNode(6), new TreeNode(7)),
);
console.log("Expected: 3");
console.log("Result:", maxDepth(test6));
console.log();

console.log("Test Case 7 - Unbalanced tree with deeper left side");
const test7 = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4, new TreeNode(8), null), new TreeNode(5)),
  new TreeNode(3),
);
console.log("Expected: 4");
console.log("Result:", maxDepth(test7));
