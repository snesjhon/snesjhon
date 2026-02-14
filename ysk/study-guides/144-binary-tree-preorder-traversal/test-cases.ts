// ============================================
// 144. Binary Tree Preorder Traversal (Easy)
// https://leetcode.com/problems/binary-tree-preorder-traversal/
// ============================================
//
// Given the root of a binary tree, return the preorder traversal
// of its nodes' values.
//
// Preorder: Root -> Left -> Right
// File system analogy: List the folder name BEFORE diving into subfolders
//
// Example 1: Input: root = [1,null,2,3] -> Output: [1,2,3]
// Example 2: Input: root = [1,2,3,4,5,null,8,null,null,6,7,null,9] -> Output: [1,2,4,5,6,7,3,8,9]
// Example 3: Input: root = [] -> Output: []
// Example 4: Input: root = [1] -> Output: [1]
//
// Constraints:
// - Number of nodes: [0, 100]
// - -100 <= Node.val <= 100
//
// Follow-up: Can you do it both recursively and iteratively?

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

// ============================================
// APPROACH 1: Recursive
// ============================================
// Process current node, then recurse left, then recurse right
// Time: O(n), Space: O(h) call stack

function preorderTraversalRecursive(root: TreeNode | null): number[] {
  const output: number[] = [];

  function recurse(node: TreeNode | null) {
    if (!node) return node;

    output.push(node.val);
    recurse(node.left);
    recurse(node.right);
  }

  recurse(root);

  return output;
}

// ============================================
// APPROACH 2: Iterative with explicit stack
// ============================================
// Use stack (LIFO). Push right first, then left, so left is processed first.
// Time: O(n), Space: O(h)

function preorderTraversalIterative(root: TreeNode | null): number[] {
  const stack = [root];
  const output = [];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current) {
      output.push(current.val);

      stack.push(current.right);
      stack.push(current.left);
    }
  }

  return output;
}

// ============================================
// HELPER: Build Tree from Array
// ============================================

function buildTree(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;

  const root = new TreeNode(arr[0]);
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;

    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i]!);
      queue.push(node.left);
    }
    i++;

    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i]!);
      queue.push(node.right);
    }
    i++;
  }

  return root;
}

// ============================================
// TEST CASES
// ============================================

interface TestCase {
  name: string;
  input: (number | null)[];
  expected: number[];
}

const testCases: TestCase[] = [
  {
    name: "Empty tree",
    input: [],
    expected: [],
  },
  {
    name: "Single node",
    input: [1],
    expected: [1],
  },
  {
    name: "Right-only chain (LeetCode Example 1)",
    input: [1, null, 2, 3],
    expected: [1, 2, 3],
  },
  {
    name: "Left-only chain",
    input: [1, 2, null, 3],
    expected: [1, 2, 3],
  },
  {
    name: "Complete tree - 3 nodes",
    input: [1, 2, 3],
    expected: [1, 2, 3],
  },
  {
    name: "Complete tree - 7 nodes",
    input: [1, 2, 3, 4, 5, 6, 7],
    expected: [1, 2, 4, 5, 3, 6, 7],
  },
  {
    name: "Left-skewed tree",
    input: [1, 2, null, 3, null, 4],
    expected: [1, 2, 3, 4],
  },
  {
    name: "Right-skewed tree",
    input: [1, null, 2, null, 3, null, 4],
    expected: [1, 2, 3, 4],
  },
  {
    name: "Unbalanced tree",
    input: [1, 2, 3, 4, 5],
    expected: [1, 2, 4, 5, 3],
  },
  {
    name: "LeetCode Example 2",
    input: [1, 2, 3, 4, 5, null, 8, null, null, 6, 7, null, 9],
    expected: [1, 2, 4, 5, 6, 7, 3, 8, 9],
  },
  {
    name: "Only right children on left subtree",
    input: [1, 2, 3, null, 4, null, 5],
    expected: [1, 2, 4, 3, 5],
  },
];

// ============================================
// TEST RUNNER
// ============================================

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function runTests() {
  console.log("=".repeat(60));
  console.log("144. BINARY TREE PREORDER TRAVERSAL");
  console.log("=".repeat(60));

  let passed = 0;

  testCases.forEach((test, i) => {
    const tree = buildTree(test.input);

    const recursive = preorderTraversalRecursive(tree);
    const iterative = preorderTraversalIterative(tree);

    const rPass = arraysEqual(recursive, test.expected);
    const iPass = arraysEqual(iterative, test.expected);

    if (rPass && iPass) passed++;

    console.log(`\nTest ${i + 1}: ${test.name}`);
    console.log(`  Input:     [${test.input.join(", ")}]`);
    console.log(`  Expected:  [${test.expected.join(", ")}]`);
    console.log(
      `  Recursive: [${recursive.join(", ")}] ${rPass ? "PASS" : "FAIL"}`,
    );
    console.log(
      `  Iterative: [${iterative.join(", ")}] ${iPass ? "PASS" : "FAIL"}`,
    );
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Results: ${passed}/${testCases.length} passed`);
  console.log("=".repeat(60));
}

runTests();
