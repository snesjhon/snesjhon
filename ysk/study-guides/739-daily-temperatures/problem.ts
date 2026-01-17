// Given an array of temperatures, for each day find how many days you have to wait
// until a warmer temperature. If no warmer day exists in the future, output 0.

// Input:
// temperatures: array of daily temperatures (30 <= temperatures[i] <= 100)

// Output: array where result[i] = number of days to wait for warmer temp (or 0 if none)

// Requirements:
// - Must handle arrays up to 10^5 elements
// - Must be performant: O(n) time
// - Answer for each day depends on FUTURE temperatures only

function dailyTemperatures(temperatures: number[]): number[] {
  // TODO: Implement this function
  return [];
}

// Test Cases

function testDailyTemperatures() {
  console.log("Running tests...\n");

  // Test 1: Basic example from LeetCode
  const result1 = dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]);
  console.log("Test 1 - Basic example:");
  console.log("Input: [73, 74, 75, 71, 69, 72, 76, 73]");
  console.log("Expected: [1, 1, 4, 2, 1, 1, 0, 0]");
  console.log("Got:", result1);
  const pass1 = JSON.stringify(result1) === JSON.stringify([1, 1, 4, 2, 1, 1, 0, 0]);
  console.log("Pass:", pass1, "\n");

  // Test 2: All increasing
  const result2 = dailyTemperatures([30, 40, 50, 60]);
  console.log("Test 2 - All increasing:");
  console.log("Input: [30, 40, 50, 60]");
  console.log("Expected: [1, 1, 1, 0]");
  console.log("Got:", result2);
  const pass2 = JSON.stringify(result2) === JSON.stringify([1, 1, 1, 0]);
  console.log("Pass:", pass2, "\n");

  // Test 3: All decreasing
  const result3 = dailyTemperatures([60, 50, 40, 30]);
  console.log("Test 3 - All decreasing:");
  console.log("Input: [60, 50, 40, 30]");
  console.log("Expected: [0, 0, 0, 0]");
  console.log("Got:", result3);
  const pass3 = JSON.stringify(result3) === JSON.stringify([0, 0, 0, 0]);
  console.log("Pass:", pass3, "\n");

  // Test 4: All same
  const result4 = dailyTemperatures([50, 50, 50, 50]);
  console.log("Test 4 - All same:");
  console.log("Input: [50, 50, 50, 50]");
  console.log("Expected: [0, 0, 0, 0]");
  console.log("Got:", result4);
  const pass4 = JSON.stringify(result4) === JSON.stringify([0, 0, 0, 0]);
  console.log("Pass:", pass4, "\n");

  // Test 5: Single element
  const result5 = dailyTemperatures([50]);
  console.log("Test 5 - Single element:");
  console.log("Input: [50]");
  console.log("Expected: [0]");
  console.log("Got:", result5);
  const pass5 = JSON.stringify(result5) === JSON.stringify([0]);
  console.log("Pass:", pass5, "\n");

  // Test 6: Two elements - increasing
  const result6 = dailyTemperatures([30, 40]);
  console.log("Test 6 - Two elements increasing:");
  console.log("Input: [30, 40]");
  console.log("Expected: [1, 0]");
  console.log("Got:", result6);
  const pass6 = JSON.stringify(result6) === JSON.stringify([1, 0]);
  console.log("Pass:", pass6, "\n");

  // Test 7: Two elements - decreasing
  const result7 = dailyTemperatures([40, 30]);
  console.log("Test 7 - Two elements decreasing:");
  console.log("Input: [40, 30]");
  console.log("Expected: [0, 0]");
  console.log("Got:", result7);
  const pass7 = JSON.stringify(result7) === JSON.stringify([0, 0]);
  console.log("Pass:", pass7, "\n");

  // Test 8: Warmer day at the end
  const result8 = dailyTemperatures([30, 30, 30, 40]);
  console.log("Test 8 - Warmer day at end:");
  console.log("Input: [30, 30, 30, 40]");
  console.log("Expected: [3, 2, 1, 0]");
  console.log("Got:", result8);
  const pass8 = JSON.stringify(result8) === JSON.stringify([3, 2, 1, 0]);
  console.log("Pass:", pass8, "\n");

  // Test 9: Valley pattern
  const result9 = dailyTemperatures([70, 60, 50, 60, 70]);
  console.log("Test 9 - Valley pattern:");
  console.log("Input: [70, 60, 50, 60, 70]");
  console.log("Expected: [0, 2, 1, 1, 0]");
  console.log("Got:", result9);
  const pass9 = JSON.stringify(result9) === JSON.stringify([0, 2, 1, 1, 0]);
  console.log("Pass:", pass9, "\n");

  // Test 10: Peak pattern
  const result10 = dailyTemperatures([50, 60, 70, 60, 50]);
  console.log("Test 10 - Peak pattern:");
  console.log("Input: [50, 60, 70, 60, 50]");
  console.log("Expected: [1, 1, 0, 0, 0]");
  console.log("Got:", result10);
  const pass10 = JSON.stringify(result10) === JSON.stringify([1, 1, 0, 0, 0]);
  console.log("Pass:", pass10, "\n");

  // Test 11: Multiple warmer days resolve at once
  const result11 = dailyTemperatures([73, 72, 71, 70, 76]);
  console.log("Test 11 - Multiple resolve at once:");
  console.log("Input: [73, 72, 71, 70, 76]");
  console.log("Expected: [4, 3, 2, 1, 0]");
  console.log("Got:", result11);
  const pass11 = JSON.stringify(result11) === JSON.stringify([4, 3, 2, 1, 0]);
  console.log("Pass:", pass11, "\n");

  // Test 12: Alternating pattern
  const result12 = dailyTemperatures([70, 50, 70, 50, 70]);
  console.log("Test 12 - Alternating pattern:");
  console.log("Input: [70, 50, 70, 50, 70]");
  console.log("Expected: [0, 1, 0, 1, 0]");
  console.log("Got:", result12);
  const pass12 = JSON.stringify(result12) === JSON.stringify([0, 1, 0, 1, 0]);
  console.log("Pass:", pass12, "\n");
}

// Run tests
testDailyTemperatures();