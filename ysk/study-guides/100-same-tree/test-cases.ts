// ============================================
// 100. Same Tree (Easy)
// https://leetcode.com/problems/same-tree/
// ============================================
//
// Given the roots of two binary trees p and q, write a function to check
// if they are the same or not.
//
// Two binary trees are considered the same if they are structurally identical,
// and the nodes have the same value.
//
// Preorder connection: Compare current nodes FIRST, then recurse left, then right.
// File system analogy: Check if two directory structures are identical -
// compare the current folder name, then compare subfolders.
//
// Example 1: p = [1,2,3], q = [1,2,3] -> true
// Example 2: p = [1,2], q = [1,null,2] -> false
// Example 3: p = [1,2,1], q = [1,1,2] -> false
//
// Constraints:
// - Number of nodes: [0, 100]
// - -10^4 <= Node.val <= 10^4

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
// APPROACH: Recursive Preorder Comparison
// ============================================
// Compare current nodes first (preorder), then recurse left and right.
// Both null = same. One null = different. Values differ = different.
// Time: O(n), Space: O(h)

function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  if (p === null && q === null) return true;
  if (!p || !q) return false;
  if (p.val !== q.val) return false;

  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
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
  p: (number | null)[];
  q: (number | null)[];
  expected: boolean;
}

const testCases: TestCase[] = [
  {
    name: "Both empty",
    p: [],
    q: [],
    expected: true,
  },
  {
    name: "One empty, one not",
    p: [1],
    q: [],
    expected: false,
  },
  {
    name: "Single node - same",
    p: [1],
    q: [1],
    expected: true,
  },
  {
    name: "Single node - different value",
    p: [1],
    q: [2],
    expected: false,
  },
  {
    name: "LeetCode Example 1 - identical trees",
    p: [1, 2, 3],
    q: [1, 2, 3],
    expected: true,
  },
  {
    name: "LeetCode Example 2 - different structure",
    p: [1, 2],
    q: [1, null, 2],
    expected: false,
  },
  {
    name: "LeetCode Example 3 - same structure, different values",
    p: [1, 2, 1],
    q: [1, 1, 2],
    expected: false,
  },
  {
    name: "Larger identical trees",
    p: [1, 2, 3, 4, 5, 6, 7],
    q: [1, 2, 3, 4, 5, 6, 7],
    expected: true,
  },
  {
    name: "Differ only at leaf",
    p: [1, 2, 3, 4, 5],
    q: [1, 2, 3, 4, 99],
    expected: false,
  },
  {
    name: "Same values, different shape (left vs right skewed)",
    p: [1, 2, null, 3],
    q: [1, null, 2, null, 3],
    expected: false,
  },
  {
    name: "Both left-skewed, identical",
    p: [1, 2, null, 3],
    q: [1, 2, null, 3],
    expected: true,
  },
  {
    name: "One tree has extra node",
    p: [1, 2, 3],
    q: [1, 2, 3, 4],
    expected: false,
  },
];

// ============================================
// TEST RUNNER
// ============================================

function runTests() {
  console.log("=".repeat(60));
  console.log("100. SAME TREE");
  console.log("=".repeat(60));

  let passed = 0;

  testCases.forEach((test, i) => {
    const treeP = buildTree(test.p);
    const treeQ = buildTree(test.q);

    const result = isSameTree(treeP, treeQ);
    const pass = result === test.expected;
    if (pass) passed++;

    console.log(`\nTest ${i + 1}: ${test.name}`);
    console.log(`  p: [${test.p.join(", ")}]`);
    console.log(`  q: [${test.q.join(", ")}]`);
    console.log(
      `  Expected: ${test.expected} | Got: ${result} ${pass ? "PASS" : "FAIL"}`,
    );
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Results: ${passed}/${testCases.length} passed`);
  console.log("=".repeat(60));
}

runTests();
