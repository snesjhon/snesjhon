// Given a 2D n by m grid, design a method that would solve for the total number
// of combinations of unique paths from the top-left corner (0,0) to the
// bottom-right corner (n-1, m-1). A valid step on each path can only go right
// or down by 1 unit on the grid.

// Input: n - number of rows, m - number of columns
// Output: number of unique paths

// Constraints:
// - 1 <= n, m <= 100
// - Answer is guaranteed to fit in a 32-bit integer

function uniquePaths(n: number, m: number): number {
  // Create DP table
  const dp: number[][] = Array.from({ length: n }, () => Array(m).fill(0));

  // Base cases: first row and first column have only 1 path
  for (let i = 0; i < n; i++) dp[i][0] = 1;
  for (let j = 0; j < m; j++) dp[0][j] = 1;

  // Fill the table: dp[i][j] = paths from above + paths from left
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < m; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }

  return dp[n - 1][m - 1];
}

// Test Cases

function testUniquePaths() {
  console.log("Running tests...\n");

  // Test 1: 1x1 grid (start = end)
  const result1 = uniquePaths(1, 1);
  console.log("Test 1 - 1x1 grid:");
  console.log("Input: n = 1, m = 1");
  console.log("Expected: 1");
  console.log("Got:", result1);
  console.log("Pass:", result1 === 1, "\n");

  // Test 2: 2x2 grid
  const result2 = uniquePaths(2, 2);
  console.log("Test 2 - 2x2 grid:");
  console.log("Input: n = 2, m = 2");
  console.log("Expected: 2 (RD or DR)");
  console.log("Got:", result2);
  console.log("Pass:", result2 === 2, "\n");

  // Test 3: 3x3 grid
  const result3 = uniquePaths(3, 3);
  console.log("Test 3 - 3x3 grid:");
  console.log("Input: n = 3, m = 3");
  console.log("Expected: 6");
  console.log("Got:", result3);
  console.log("Pass:", result3 === 6, "\n");

  // Test 4: 3x4 grid (from study guide example)
  const result4 = uniquePaths(3, 4);
  console.log("Test 4 - 3x4 grid:");
  console.log("Input: n = 3, m = 4");
  console.log("Expected: 10");
  console.log("Got:", result4);
  console.log("Pass:", result4 === 10, "\n");

  // Test 5: 3x7 grid
  const result5 = uniquePaths(3, 7);
  console.log("Test 5 - 3x7 grid:");
  console.log("Input: n = 3, m = 7");
  console.log("Expected: 28");
  console.log("Got:", result5);
  console.log("Pass:", result5 === 28, "\n");

  // Test 6: Single row (1xm)
  const result6 = uniquePaths(1, 10);
  console.log("Test 6 - Single row (1x10):");
  console.log("Input: n = 1, m = 10");
  console.log("Expected: 1 (only right moves)");
  console.log("Got:", result6);
  console.log("Pass:", result6 === 1, "\n");

  // Test 7: Single column (nx1)
  const result7 = uniquePaths(10, 1);
  console.log("Test 7 - Single column (10x1):");
  console.log("Input: n = 10, m = 1");
  console.log("Expected: 1 (only down moves)");
  console.log("Got:", result7);
  console.log("Pass:", result7 === 1, "\n");

  // Test 8: Larger grid
  const result8 = uniquePaths(7, 3);
  console.log("Test 8 - 7x3 grid:");
  console.log("Input: n = 7, m = 3");
  console.log("Expected: 28");
  console.log("Got:", result8);
  console.log("Pass:", result8 === 28, "\n");

  // Test 9: Square grid
  const result9 = uniquePaths(5, 5);
  console.log("Test 9 - 5x5 grid:");
  console.log("Input: n = 5, m = 5");
  console.log("Expected: 70");
  console.log("Got:", result9);
  console.log("Pass:", result9 === 70, "\n");

  // Test 10: Verify with combinatorics formula C(n+m-2, n-1)
  // For 4x4: C(6, 3) = 6!/(3!*3!) = 720/36 = 20
  const result10 = uniquePaths(4, 4);
  console.log("Test 10 - 4x4 grid (verify with C(6,3) = 20):");
  console.log("Input: n = 4, m = 4");
  console.log("Expected: 20");
  console.log("Got:", result10);
  console.log("Pass:", result10 === 20, "\n");

  // Test 11: Asymmetric large grid
  const result11 = uniquePaths(10, 10);
  console.log("Test 11 - 10x10 grid:");
  console.log("Input: n = 10, m = 10");
  console.log("Expected: 48620 (C(18, 9))");
  console.log("Got:", result11);
  console.log("Pass:", result11 === 48620, "\n");

  // Test 12: Another asymmetric
  const result12 = uniquePaths(6, 4);
  console.log("Test 12 - 6x4 grid:");
  console.log("Input: n = 6, m = 4");
  console.log("Expected: 56 (C(8, 3))");
  console.log("Got:", result12);
  console.log("Pass:", result12 === 56, "\n");
}

// Run tests
testUniquePaths();
