// Test Cases for Maximum Depth of Binary Tree (LeetCode 104)
// Companion to the mental model - practice the three approaches!

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
// APPROACH 1: RECURSIVE DFS (Post-Order)
// ============================================
// Mental model: "Ask your children, then compute your answer"
// Time: O(n), Space: O(h) where h = height

function maxDepthRecursive(root: TreeNode | null): number {
  // Base case: empty tree has depth 0
  if (root === null) return 0;

  // Recursive case: get depths from children (POST-ORDER)
  const leftDepth = maxDepthRecursive(root.left);
  const rightDepth = maxDepthRecursive(root.right);

  // Combine: 1 (current node) + max of children
  return 1 + Math.max(leftDepth, rightDepth);
}

// One-liner version (same logic, more compact)
function maxDepthRecursiveOneLiner(root: TreeNode | null): number {
  return root === null
    ? 0
    : 1 + Math.max(maxDepthRecursiveOneLiner(root.left), maxDepthRecursiveOneLiner(root.right));
}

// ============================================
// APPROACH 2: ITERATIVE BFS (Level Order)
// ============================================
// Mental model: "Process one level at a time, count the levels"
// Time: O(n), Space: O(w) where w = max width

function maxDepthBFS(root: TreeNode | null): number {
  if (root === null) return 0;

  let depth = 0;
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    // Critical: capture level size before processing
    const levelSize = queue.length;
    depth++;

    // Process all nodes at current level
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;

      // Add children for next level
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  return depth;
}

// ============================================
// APPROACH 3: ITERATIVE DFS (Explicit Stack)
// ============================================
// Mental model: "Explore paths, track the maximum depth reached"
// Time: O(n), Space: O(h)

function maxDepthDFS(root: TreeNode | null): number {
  if (root === null) return 0;

  let maxDepth = 0;
  const stack: [TreeNode, number][] = [[root, 1]]; // [node, depth at this node]

  while (stack.length > 0) {
    const [node, depth] = stack.pop()!;
    maxDepth = Math.max(maxDepth, depth);

    // Push children with incremented depth
    if (node.left) stack.push([node.left, depth + 1]);
    if (node.right) stack.push([node.right, depth + 1]);
  }

  return maxDepth;
}

// ============================================
// HELPER: Build Tree from Array
// ============================================
// Builds tree from level-order array (null = missing node)

function buildTree(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;

  const root = new TreeNode(arr[0]);
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;

    // Process left child
    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i]!);
      queue.push(node.left);
    }
    i++;

    // Process right child
    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i]!);
      queue.push(node.right);
    }
    i++;
  }

  return root;
}

// ============================================
// HELPER: Visualize Tree
// ============================================

function visualizeTree(root: TreeNode | null, prefix = "", isLeft = true): string {
  if (root === null) return "";

  let result = "";
  result += prefix;
  result += isLeft ? "├── " : "└── ";
  result += root.val + "\n";

  const children = [];
  if (root.left) children.push([root.left, true]);
  if (root.right) children.push([root.right, false]);

  children.forEach(([child, isLeft], index) => {
    const extension = isLeft ? "│   " : "    ";
    result += visualizeTree(
      child as TreeNode,
      prefix + extension,
      index < children.length - 1
    );
  });

  return result;
}

// ============================================
// TEST RUNNER
// ============================================

interface TestCase {
  name: string;
  input: (number | null)[];
  expected: number;
  description: string;
}

const testCases: TestCase[] = [
  {
    name: "Empty Tree",
    input: [],
    expected: 0,
    description: "Base case: null tree has depth 0",
  },
  {
    name: "Single Node",
    input: [1],
    expected: 1,
    description: "Leaf node has depth 1",
  },
  {
    name: "Two Nodes - Left",
    input: [1, 2],
    expected: 2,
    description: "Simple path down left",
  },
  {
    name: "Two Nodes - Right",
    input: [1, null, 2],
    expected: 2,
    description: "Simple path down right",
  },
  {
    name: "Balanced - Three Nodes",
    input: [1, 2, 3],
    expected: 2,
    description: "Perfect balance, two levels",
  },
  {
    name: "Classic Example",
    input: [3, 9, 20, null, null, 15, 7],
    expected: 3,
    description: "Standard LeetCode example",
  },
  {
    name: "Left Skewed",
    input: [1, 2, null, 3, null, 4],
    expected: 4,
    description: "Worst case for recursive space O(n)",
  },
  {
    name: "Right Skewed",
    input: [1, null, 2, null, 3, null, 4],
    expected: 4,
    description: "Like a linked list",
  },
  {
    name: "Complete Binary Tree",
    input: [1, 2, 3, 4, 5, 6, 7],
    expected: 3,
    description: "All levels filled, O(log n) height",
  },
  {
    name: "Unbalanced - Left Heavy",
    input: [1, 2, 3, 4, 5, null, null, 6],
    expected: 4,
    description: "Deeper on left side",
  },
  {
    name: "Unbalanced - Right Heavy",
    input: [1, 2, 3, null, null, 4, 5, null, null, null, null, 6],
    expected: 4,
    description: "Deeper on right side",
  },
  {
    name: "Large Balanced Tree",
    input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    expected: 5,
    description: "16 nodes, height = log(16) + 1 = 5",
  },
  {
    name: "Sparse Tree",
    input: [1, null, 2, null, 3, null, 4, null, 5],
    expected: 5,
    description: "Maximum sparsity, like linked list",
  },
  {
    name: "V-Shape",
    input: [1, 2, 3, 4, null, null, 5],
    expected: 3,
    description: "Paths of different lengths",
  },
  {
    name: "Single Long Path",
    input: [1, 2, null, 3, null, 4, null, 5],
    expected: 5,
    description: "One deep branch, tests stack depth",
  },
];

function runTests() {
  console.log("=".repeat(70));
  console.log("MAXIMUM DEPTH OF BINARY TREE - COMPREHENSIVE TEST SUITE");
  console.log("=".repeat(70));

  let totalTests = 0;
  let passedTests = 0;

  testCases.forEach((test, index) => {
    console.log(`\n${"─".repeat(70)}`);
    console.log(`TEST ${index + 1}: ${test.name}`);
    console.log(`Description: ${test.description}`);
    console.log(`Input: [${test.input.join(", ")}]`);

    const tree = buildTree(test.input);

    // Run all three approaches
    const resultRecursive = maxDepthRecursive(tree);
    const resultRecursiveOneLiner = maxDepthRecursiveOneLiner(tree);
    const resultBFS = maxDepthBFS(tree);
    const resultDFS = maxDepthDFS(tree);

    const allMatch =
      resultRecursive === test.expected &&
      resultRecursiveOneLiner === test.expected &&
      resultBFS === test.expected &&
      resultDFS === test.expected;

    totalTests++;
    if (allMatch) passedTests++;

    console.log(`\nExpected:             ${test.expected}`);
    console.log(
      `Recursive DFS:        ${resultRecursive} ${resultRecursive === test.expected ? "✓" : "✗"}`
    );
    console.log(
      `Recursive (1-liner):  ${resultRecursiveOneLiner} ${resultRecursiveOneLiner === test.expected ? "✓" : "✗"}`
    );
    console.log(
      `Iterative BFS:        ${resultBFS} ${resultBFS === test.expected ? "✓" : "✗"}`
    );
    console.log(
      `Iterative DFS:        ${resultDFS} ${resultDFS === test.expected ? "✓" : "✗"}`
    );

    console.log(`\nStatus: ${allMatch ? "✓ PASS" : "✗ FAIL"}`);

    // Show tree visualization for interesting cases
    if (test.input.length > 0 && test.input.length <= 7) {
      console.log("\nTree Structure:");
      console.log(visualizeTree(tree));
    }
  });

  console.log("\n" + "=".repeat(70));
  console.log(`RESULTS: ${passedTests}/${totalTests} tests passed`);
  console.log("=".repeat(70));

  return { total: totalTests, passed: passedTests };
}

// ============================================
// COMPLEXITY ANALYSIS DEMO
// ============================================

function analyzeComplexity() {
  console.log("\n\n" + "=".repeat(70));
  console.log("SPACE COMPLEXITY ANALYSIS");
  console.log("=".repeat(70));

  // Balanced tree
  const balanced = buildTree([1, 2, 3, 4, 5, 6, 7]);
  console.log("\n1. BALANCED TREE: [1,2,3,4,5,6,7]");
  console.log("   Recursive DFS: O(log n) = O(3) call stack depth");
  console.log("   BFS:           O(n/2) = O(4) queue holds bottom level");
  console.log("   Trade-off: DFS wins for balanced trees");

  // Skewed tree
  const skewed = buildTree([1, null, 2, null, 3, null, 4]);
  console.log("\n2. SKEWED TREE: [1,null,2,null,3,null,4]");
  console.log("   Recursive DFS: O(n) = O(4) call stack depth");
  console.log("   BFS:           O(1) queue holds one node at a time");
  console.log("   Trade-off: BFS wins for skewed trees");

  console.log("\n3. PRACTICAL RECOMMENDATION:");
  console.log("   - Use Recursive DFS (simplest, usually best)");
  console.log("   - Use BFS only if you need level-based logic");
  console.log("   - Iterative DFS rarely needed");
}

// ============================================
// PATTERN DEMONSTRATION
// ============================================

function demonstratePattern() {
  console.log("\n\n" + "=".repeat(70));
  console.log("PATTERN VARIATIONS - Same Structure, Different Operations");
  console.log("=".repeat(70));

  const tree = buildTree([1, 2, 3, 4, 5, 6, 7]);

  // Count nodes
  function countNodes(root: TreeNode | null): number {
    if (!root) return 0;
    return 1 + countNodes(root.left) + countNodes(root.right);
  }

  // Sum all nodes
  function sumNodes(root: TreeNode | null): number {
    if (!root) return 0;
    return root.val + sumNodes(root.left) + sumNodes(root.right);
  }

  // Min depth (to nearest leaf)
  function minDepth(root: TreeNode | null): number {
    if (!root) return 0;
    if (!root.left) return 1 + minDepth(root.right);
    if (!root.right) return 1 + minDepth(root.left);
    return 1 + Math.min(minDepth(root.left), minDepth(root.right));
  }

  console.log("\nTree: [1,2,3,4,5,6,7]");
  console.log(`Max Depth:   ${maxDepthRecursive(tree)}`);
  console.log(`Min Depth:   ${minDepth(tree)}`);
  console.log(`Count Nodes: ${countNodes(tree)}`);
  console.log(`Sum Nodes:   ${sumNodes(tree)}`);
  console.log("\n✓ Same pattern: base case + recursive calls + combine");
}

// ============================================
// RUN ALL
// ============================================

console.log("\n🌲 Starting Maximum Depth Test Suite...\n");

const results = runTests();
analyzeComplexity();
demonstratePattern();

console.log("\n\n" + "=".repeat(70));
console.log("✨ ALL TESTS COMPLETE!");
console.log("=".repeat(70));

if (results.passed === results.total) {
  console.log("🎉 Perfect score! All approaches work correctly.");
} else {
  console.log(
    `⚠️  Some tests failed. Review the output above.`
  );
}

console.log("\n📚 Review the mental-model.md for detailed explanations!");
console.log("🎯 Practice these patterns on similar problems!\n");
