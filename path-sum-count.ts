/**
 * Practice Problem: Count Root-to-Leaf Paths with Target Sum
 *
 * Given a binary tree and a target sum, count how many root-to-leaf paths
 * have a sum equal to the target.
 *
 * Example Tree:
 *                     3
 *                    / \
 *                   2   4
 *                  / \
 *                 1   1
 *
 * Target: 7
 *
 * Expected Paths:
 * - 3 → 2 → 1 = 6 ✗
 * - 3 → 2 → 1 = 6 ✗ (right child of 2)
 * - 3 → 4 = 7 ✓
 *
 * Expected Answer: 1
 */

class TreeNodeList {
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
 * @param currentSum - The running sum from root to current node
 * @param target - The target sum we're looking for
 * @returns The count of root-to-leaf paths that sum to target
 *
 * Hints:
 * 1. Think about what information needs to flow DOWN (parent → child)
 * 2. Think about what information needs to flow UP (child → parent)
 * 3. Only count paths that reach a LEAF node
 * 4. Base case: What happens when node is null?
 * 5. Leaf check: A node is a leaf when it has no left AND no right children
 */
function countPathSum(
  node: TreeNode | null,
  currentSum: number,
  target: number,
): number {
  // TODO: Implement your solution here
  //
  //

  // Base case where we have no
  // QUESTION: In this scenario, why would we want to return `0` vs `null` or `currentSum`
  // If theoretically we have no more leaf nodes then we no longer have a "count" to sum up?
  if (!node) {
    return 0;
  }

  // what needs to flow up is the `currentSum` AND if we have a match

  currentSum += node.val;

  // console.log({ node, currentSum });
  //
  const isLeaf = !node.left && !node.right;

  if (isLeaf && currentSum === target) {
    // we have a match of everything that was added up until now
    // QUESTION: if we've found a match, what exactly do we send "Up". I guess if we're interested in
    // "How many" matches we've found, then wouldn't it just be 1?
    return 1;
  }

  const left = countPathSum(node.left, currentSum, target);
  const right = countPathSum(node.right, currentSum, target);

  // QUESTION: I'm unsure why it would be left+right. In a sense. If we're counting them together. Are we just counting the `return 1` together?
  return left + right;
}

// ============================================
// Test Cases
// ============================================

function buildTestTree(): TreeNode {
  /**
   * Builds this tree:
   *                     3
   *                    / \
   *                   2   4
   *                  / \
   *                 1   1
   */
  const leftLeft = new TreeNode(1);
  const leftRight = new TreeNode(1);
  const left = new TreeNode(2, leftLeft, leftRight);
  const right = new TreeNode(4);
  const root = new TreeNode(3, left, right);

  return root;
}

const tree = buildTestTree();
const result1 = countPathSum(tree, 0, 7);

// console.log({ result1 });

function runTests() {
  console.log("Running tests...\n");

  const tree = buildTestTree();

  // Test 1: Target = 7
  const result1 = countPathSum(tree, 0, 7);
  console.log(`Test 1: Target = 7`);
  console.log(`  Expected: 1`);
  console.log(`  Got: ${result1}`);
  console.log(`  ${result1 === 1 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 2: Target = 6
  const result2 = countPathSum(tree, 0, 6);
  console.log(`Test 2: Target = 6`);
  console.log(`  Expected: 2 (both 3→2→1 paths)`);
  console.log(`  Got: ${result2}`);
  console.log(`  ${result2 === 2 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 3: Target = 10 (no paths)
  const result3 = countPathSum(tree, 0, 10);
  console.log(`Test 3: Target = 10`);
  console.log(`  Expected: 0 (no paths sum to 10)`);
  console.log(`  Got: ${result3}`);
  console.log(`  ${result3 === 0 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 4: Single node tree
  const singleNode = new TreeNode(5);
  const result4 = countPathSum(singleNode, 0, 5);
  console.log(`Test 4: Single node (value=5), Target = 5`);
  console.log(`  Expected: 1`);
  console.log(`  Got: ${result4}`);
  console.log(`  ${result4 === 1 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 5: Empty tree
  const result5 = countPathSum(null, 0, 5);
  console.log(`Test 5: Empty tree, Target = 5`);
  console.log(`  Expected: 0`);
  console.log(`  Got: ${result5}`);
  console.log(`  ${result5 === 0 ? "✓ PASS" : "✗ FAIL"}\n`);
}

// Uncomment this line when you're ready to test your solution
runTests();
