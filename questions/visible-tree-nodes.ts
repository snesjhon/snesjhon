/**
 * Practice Problem: Count Visible Nodes in Binary Tree
 *
 * A node is "visible" if every node on the path from the root to that node
 * (including the node itself) has a value less than or equal to the current node's value.
 *
 * In other words: A node is visible if it's the maximum value seen so far on its path from root.
 *
 * Example Tree:
 *                     3
 *                    / \
 *                   1   4
 *                  /   / \
 *                 3   1   5
 *
 * Visible Nodes:
 * - 3 (root) → always visible ✓
 * - 1 (left child of root) → 3 > 1, not visible ✗
 * - 3 (left-left) → path: 3→1→3, max=3, current=3 ✓
 * - 4 (right child of root) → path: 3→4, max=4, current=4 ✓
 * - 1 (left child of 4) → path: 3→4→1, max=4, current=1 ✗
 * - 5 (right child of 4) → path: 3→4→5, max=5, current=5 ✓
 *
 * Expected Answer: 4 (nodes with values 3, 3, 4, 5)
 */

class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(
    val: number,
    left: TreeNode | null = null,
    right: TreeNode | null = null,
  ) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * TODO: Implement this function
 *
 * @param node - The current node in the tree
 * @param maxSoFar - The maximum value seen on the path from root to current node
 * @returns The count of visible nodes in this subtree
 *
 * Hints:
 * 1. What information needs to flow DOWN from parent to child?
 * 2. What information needs to flow UP from child to parent?
 * 3. When is a node "visible"?
 * 4. How do you combine counts from left and right subtrees?
 * 5. Don't forget to check the current node itself!
 */
function countVisibleNodes(node: TreeNode | null, maxSoFar: number): number {
  //
  // QUESTION 1: What should we return when node is null?
  //
  if (!node) {
    return 0;
  }

  //
  // QUESTION 2: How do we determine if the current node is "visible"?
  //
  //

  const isVisible = node.val >= maxSoFar;
  if (isVisible) {
    maxSoFar = node.val;
  }

  const currentNodeCount = isVisible ? 1 : 0;

  const left = countVisibleNodes(node.left, maxSoFar);
  const right = countVisibleNodes(node.right, maxSoFar);

  return currentNodeCount + left + right;
}

// ============================================
// Test Cases
// ============================================

function buildTestTree1(): TreeNode {
  /**
   * Builds this tree:
   *                     3
   *                    / \
   *                   1   4
   *                  /   / \
   *                 3   1   5
   */
  const leftLeft = new TreeNode(3);
  const left = new TreeNode(1, leftLeft);

  const rightLeft = new TreeNode(1);
  const rightRight = new TreeNode(5);
  const right = new TreeNode(4, rightLeft, rightRight);

  const root = new TreeNode(3, left, right);
  return root;
}

function buildTestTree2(): TreeNode {
  /**
   * Builds this tree:
   *                     5
   *                    / \
   *                   4   8
   *                  /   / \
   *                 3   7   9
   */
  const leftLeft = new TreeNode(3);
  const left = new TreeNode(4, leftLeft);

  const rightLeft = new TreeNode(7);
  const rightRight = new TreeNode(9);
  const right = new TreeNode(8, rightLeft, rightRight);

  const root = new TreeNode(5, left, right);
  return root;
}

function runTests() {
  console.log("Running tests...\n");

  // Test 1: Example tree
  const tree1 = buildTestTree1();
  const result1 = countVisibleNodes(tree1, -Infinity);
  console.log(`Test 1: Example tree`);
  console.log(`  Expected: 4 (nodes: 3, 3, 4, 5)`);
  console.log(`  Got: ${result1}`);
  console.log(`  ${result1 === 4 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 2: Descending values on left
  const tree2 = buildTestTree2();
  const result2 = countVisibleNodes(tree2, -Infinity);
  console.log(`Test 2: Descending left path`);
  console.log(`  Expected: 3 (nodes: 5, 8, 9)`);
  console.log(`  Got: ${result2}`);
  console.log(`  ${result2 === 3 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 3: All ascending (every node visible)
  const allAscending = new TreeNode(
    1,
    new TreeNode(2, new TreeNode(3)),
    new TreeNode(4, null, new TreeNode(5)),
  );
  const result3 = countVisibleNodes(allAscending, -Infinity);
  console.log(`Test 3: All ascending values`);
  console.log(`  Expected: 5 (all nodes visible)`);
  console.log(`  Got: ${result3}`);
  console.log(`  ${result3 === 5 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 4: Single node
  const singleNode = new TreeNode(5);
  const result4 = countVisibleNodes(singleNode, -Infinity);
  console.log(`Test 4: Single node`);
  console.log(`  Expected: 1`);
  console.log(`  Got: ${result4}`);
  console.log(`  ${result4 === 1 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 5: Empty tree
  const result5 = countVisibleNodes(null, -Infinity);
  console.log(`Test 5: Empty tree`);
  console.log(`  Expected: 0`);
  console.log(`  Got: ${result5}`);
  console.log(`  ${result5 === 0 ? "✓ PASS" : "✗ FAIL"}\n`);
}

// Uncomment this line when you're ready to test your solution
runTests();
