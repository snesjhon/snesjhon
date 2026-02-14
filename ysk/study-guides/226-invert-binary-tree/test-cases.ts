// ============================================
// 226. Invert Binary Tree (Easy)
// https://leetcode.com/problems/invert-binary-tree/
// ============================================
//
// Given the root of a binary tree, invert the tree, and return its root.
//
// "Invert" means swap left and right children at every node.
//
// Preorder connection: Swap children at current node FIRST, then recurse.
// File system analogy: Mirror the entire directory structure -
// swap left/right subfolders at every folder, starting from root.
//
// Example 1: Input: [4,2,7,1,3,6,9] -> Output: [4,7,2,9,6,3,1]
// Example 2: Input: [2,1,3] -> Output: [2,3,1]
// Example 3: Input: [] -> Output: []
//
// Constraints:
// - Number of nodes: [0, 100]
// - -100 <= Node.val <= 100

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
// APPROACH: Recursive Preorder Swap
// ============================================
// Swap left and right at current node, then recurse into both.
// Time: O(n), Space: O(h)

function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;

  const left = root.left;
  root.left = root.right;
  root.right = left;

  invertTree(root.right);
  invertTree(root.left);

  return root;
}

// ============================================
// HELPERS
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

// Convert tree to level-order array for comparison
function treeToArray(root: TreeNode | null): (number | null)[] {
  if (root === null) return [];

  const result: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;

    if (node === null) {
      result.push(null);
    } else {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    }
  }

  // Trim trailing nulls
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }

  return result;
}

// ============================================
// TEST CASES
// ============================================

interface TestCase {
  name: string;
  input: (number | null)[];
  expected: (number | null)[];
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
    name: "Two nodes - left child",
    input: [1, 2],
    expected: [1, null, 2],
  },
  {
    name: "Two nodes - right child",
    input: [1, null, 2],
    expected: [1, 2],
  },
  {
    name: "LeetCode Example 2 - simple swap",
    input: [2, 1, 3],
    expected: [2, 3, 1],
  },
  {
    name: "LeetCode Example 1 - full tree",
    input: [4, 2, 7, 1, 3, 6, 9],
    expected: [4, 7, 2, 9, 6, 3, 1],
  },
  {
    name: "Left-skewed becomes right-skewed",
    input: [1, 2, null, 3],
    expected: [1, null, 2, null, 3],
  },
  {
    name: "Right-skewed becomes left-skewed",
    input: [1, null, 2, null, 3],
    expected: [1, 2, null, 3],
  },
  {
    name: "Symmetric tree stays symmetric",
    input: [1, 2, 2, 3, 4, 4, 3],
    expected: [1, 2, 2, 3, 4, 4, 3],
  },
  {
    name: "Unbalanced tree",
    input: [1, 2, 3, 4, 5],
    expected: [1, 3, 2, null, null, 5, 4],
  },
];

// ============================================
// TEST RUNNER
// ============================================

function arraysEqual(a: (number | null)[], b: (number | null)[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function runTests() {
  console.log("=".repeat(60));
  console.log("226. INVERT BINARY TREE");
  console.log("=".repeat(60));

  let passed = 0;

  testCases.forEach((test, i) => {
    const tree = buildTree(test.input);
    const inverted = invertTree(tree);
    const result = treeToArray(inverted);

    const pass = arraysEqual(result, test.expected);
    if (pass) passed++;

    console.log(`\nTest ${i + 1}: ${test.name}`);
    console.log(`  Input:    [${test.input.join(", ")}]`);
    console.log(`  Expected: [${test.expected.join(", ")}]`);
    console.log(`  Got:      [${result.join(", ")}] ${pass ? "PASS" : "FAIL"}`);
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Results: ${passed}/${testCases.length} passed`);
  console.log("=".repeat(60));
}

runTests();
