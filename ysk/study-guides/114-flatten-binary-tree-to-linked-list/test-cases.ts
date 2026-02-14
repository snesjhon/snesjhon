// ============================================
// 114. Flatten Binary Tree to Linked List (Medium)
// https://leetcode.com/problems/flatten-binary-tree-to-linked-list/
// ============================================
//
// Given the root of a binary tree, flatten the tree into a "linked list":
// - The "linked list" should use the same TreeNode class where the right
//   child pointer points to the next node and the left child pointer is
//   always null.
// - The "linked list" should be in the same order as a PREORDER traversal
//   of the binary tree.
//
// Preorder connection: The flattened result IS the preorder traversal,
// rewired as a right-only chain.
//
// File system analogy: Take a nested folder structure and flatten it
// into a single-level list in the order you'd encounter folders
// during a depth-first copy (preorder).
//
// Example 1: Input: [1,2,5,3,4,null,6] -> Output: [1,null,2,null,3,null,4,null,5,null,6]
// Example 2: Input: [] -> Output: []
// Example 3: Input: [0] -> Output: [0]
//
// Constraints:
// - Number of nodes: [0, 2000]
// - -100 <= Node.val <= 100
//
// Follow-up: Can you flatten the tree in-place (O(1) extra space)?

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
// APPROACH 1: Preorder collect + rewire
// ============================================
// Collect nodes in preorder, then rewire them into a right-only chain.
// Time: O(n), Space: O(n)

function flatten(root: TreeNode | null): void {
  // TODO: Implement (modifies tree in-place, returns void)
  function dfs(node: TreeNode | null): TreeNode | null {
    if (!node) return null;

    // we go all the way to the left, we then return when we find null
    const leftTail = dfs(node.left);

    // we go all the way to the right, until we find null
    const rightTail = dfs(node.right);

    //    1
    //   / \
    //  2   3
    //
    //  lefttail.right = null
    //  leftTail.left = null
    //
    //  we only care about connecting 2 -> 3
    //  leftTail.right = node.right

    // if we have a left tail && a value on the left
    // that means we need to do some kind of operation to save this value
    if (leftTail) {
      console.log({ leftTail, rightTail, node });
      // CLAUDE, this piece I don't really get, why are we saving the tail.right of the leftTail
      // why wouldn't we also do anything with the rightTail? and why assign it to the node.right?
      // ....
      // Is it because we _know_ that our list needs to link to our 'top' value on the right.
      // and the way to do that is to link the 'tail' on the left right our 'top' value, which is the
      // node on the right
      leftTail.right = node.right;

      // CLAUDE: this kinda makes sense. we have to save the value somewhere since we know it's not null
      // save it to the node.right, and then move on
      node.right = node.left;

      // this makes sense, we're snipping whatever value was there and assigning it to null
      node.left = null;
    }

    // not sure if I understand each case here
    return rightTail || leftTail || node;
  }

  dfs(root);
}

// ============================================
// APPROACH 2: Reverse postorder (O(1) space follow-up)
// ============================================
// Process right -> left -> root, linking each node to the previously
// processed node. This builds the list from tail to head.
// Time: O(n), Space: O(h) call stack

function flattenOptimized(root: TreeNode | null): void {}

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

// Read the flattened right-only chain as an array
function flattenedToArray(root: TreeNode | null): number[] {
  const result: number[] = [];
  let current = root;

  while (current !== null) {
    result.push(current.val);

    // Verify left is null (invariant of flattened tree)
    if (current.left !== null) {
      console.error(`  ERROR: node ${current.val} still has a left child!`);
    }

    current = current.right;
  }

  return result;
}

// ============================================
// TEST CASES
// ============================================

interface TestCase {
  name: string;
  input: (number | null)[];
  expected: number[]; // The flattened right-chain values in order
}

const testCases: TestCase[] = [
  // {
  //   name: "Empty tree",
  //   input: [],
  //   expected: [],
  // },
  // {
  //   name: "Single node",
  //   input: [0],
  //   expected: [0],
  // },
  // {
  //   name: "Two nodes - left child",
  //   input: [1, 2],
  //   expected: [1, 2],
  // },
  // {
  //   name: "Two nodes - right child",
  //   input: [1, null, 2],
  //   expected: [1, 2],
  // },
  {
    name: "Three nodes - complete",
    input: [1, 2, 3],
    expected: [1, 2, 3],
  },
  // {
  //   name: "LeetCode Example 1",
  //   input: [1, 2, 5, 3, 4, null, 6],
  //   expected: [1, 2, 3, 4, 5, 6],
  // },
  // {
  //   name: "Left-skewed (already preorder chain on left)",
  //   input: [1, 2, null, 3, null, 4],
  //   expected: [1, 2, 3, 4],
  // },
  // {
  //   name: "Right-skewed (already flat)",
  //   input: [1, null, 2, null, 3, null, 4],
  //   expected: [1, 2, 3, 4],
  // },
  // {
  //   name: "Complete tree - 7 nodes",
  //   input: [1, 2, 3, 4, 5, 6, 7],
  //   expected: [1, 2, 4, 5, 3, 6, 7],
  // },
  // {
  //   name: "Unbalanced with gaps",
  //   input: [1, 2, 3, null, 4, 5],
  //   expected: [1, 2, 4, 3, 5],
  // },
  // {
  //   name: "Deep left subtree",
  //   input: [1, 2, 5, 3, null, null, 6, 4],
  //   expected: [1, 2, 3, 4, 5, 6],
  // },
];

// ============================================
// TEST RUNNER
// ============================================

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function runTests() {
  console.log("=".repeat(60));
  console.log("114. FLATTEN BINARY TREE TO LINKED LIST");
  console.log("=".repeat(60));

  let passed = 0;

  testCases.forEach((test, i) => {
    // Test approach 1
    const tree1 = buildTree(test.input);
    flatten(tree1);
    const result1 = flattenedToArray(tree1);

    // Test approach 2
    const tree2 = buildTree(test.input);
    flattenOptimized(tree2);
    const result2 = flattenedToArray(tree2);

    const pass1 = arraysEqual(result1, test.expected);
    const pass2 = arraysEqual(result2, test.expected);
    if (pass1 && pass2) passed++;

    console.log(`\nTest ${i + 1}: ${test.name}`);
    console.log(`  Input:     [${test.input.join(", ")}]`);
    console.log(`  Expected:  [${test.expected.join(", ")}]`);
    console.log(
      `  Approach1: [${result1.join(", ")}] ${pass1 ? "PASS" : "FAIL"}`,
    );
    console.log(
      `  Approach2: [${result2.join(", ")}] ${pass2 ? "PASS" : "FAIL"}`,
    );
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Results: ${passed}/${testCases.length} passed`);
  console.log("=".repeat(60));
}

runTests();
