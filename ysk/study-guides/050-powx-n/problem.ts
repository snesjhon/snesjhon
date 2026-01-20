// Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).

// Input: x - base (float), n - exponent (integer)
// Output: x^n

// Constraints:
// - -100.0 < x < 100.0
// - -2^31 <= n <= 2^31 - 1
// - n is an integer
// - Either x is not zero, or n > 0
// - -10^4 <= x^n <= 10^4

function myPow(x: number, n: number): number {
  // Handle edge case: n is minimum 32-bit integer
  // -n would overflow, so handle specially
  if (n === -2147483648) {
    x = x * x;
    n = -1073741824;
  }

  // Handle negative exponent: x^(-n) = (1/x)^n
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }

  let result = 1;

  // Binary exponentiation
  while (n > 0) {
    // If current bit is 1, multiply result by current power
    if (n % 2 === 1) {
      result *= x;
    }
    // Square x for next bit position
    x *= x;
    // Move to next bit (integer division)
    n = Math.floor(n / 2);
  }

  return result;
}

// Test Cases

function testMyPow() {
  console.log("Running tests...\n");

  // Helper for comparing floating point
  const isClose = (a: number, b: number, tolerance = 1e-5) =>
    Math.abs(a - b) < tolerance;

  // Test 1: Basic positive exponent
  const result1 = myPow(2, 10);
  console.log("Test 1 - 2^10:");
  console.log("Input: x = 2, n = 10");
  console.log("Expected: 1024");
  console.log("Got:", result1);
  console.log("Pass:", result1 === 1024, "\n");

  // Test 2: Positive base, negative exponent
  const result2 = myPow(2, -2);
  console.log("Test 2 - 2^(-2):");
  console.log("Input: x = 2, n = -2");
  console.log("Expected: 0.25");
  console.log("Got:", result2);
  console.log("Pass:", isClose(result2, 0.25), "\n");

  // Test 3: Fractional base
  const result3 = myPow(2.1, 3);
  console.log("Test 3 - 2.1^3:");
  console.log("Input: x = 2.1, n = 3");
  console.log("Expected: 9.261");
  console.log("Got:", result3);
  console.log("Pass:", isClose(result3, 9.261), "\n");

  // Test 4: Exponent is 0
  const result4 = myPow(5, 0);
  console.log("Test 4 - 5^0:");
  console.log("Input: x = 5, n = 0");
  console.log("Expected: 1");
  console.log("Got:", result4);
  console.log("Pass:", result4 === 1, "\n");

  // Test 5: Base is 0
  const result5 = myPow(0, 5);
  console.log("Test 5 - 0^5:");
  console.log("Input: x = 0, n = 5");
  console.log("Expected: 0");
  console.log("Got:", result5);
  console.log("Pass:", result5 === 0, "\n");

  // Test 6: Negative base, odd exponent
  const result6 = myPow(-2, 3);
  console.log("Test 6 - (-2)^3:");
  console.log("Input: x = -2, n = 3");
  console.log("Expected: -8");
  console.log("Got:", result6);
  console.log("Pass:", result6 === -8, "\n");

  // Test 7: Negative base, even exponent
  const result7 = myPow(-2, 4);
  console.log("Test 7 - (-2)^4:");
  console.log("Input: x = -2, n = 4");
  console.log("Expected: 16");
  console.log("Got:", result7);
  console.log("Pass:", result7 === 16, "\n");

  // Test 8: Base is 1 (large exponent)
  const result8 = myPow(1, 2147483647);
  console.log("Test 8 - 1^(2^31-1):");
  console.log("Input: x = 1, n = 2147483647");
  console.log("Expected: 1");
  console.log("Got:", result8);
  console.log("Pass:", result8 === 1, "\n");

  // Test 9: Base is -1, odd exponent
  const result9 = myPow(-1, 2147483647);
  console.log("Test 9 - (-1)^(2^31-1):");
  console.log("Input: x = -1, n = 2147483647");
  console.log("Expected: -1 (odd exponent)");
  console.log("Got:", result9);
  console.log("Pass:", result9 === -1, "\n");

  // Test 10: Base is -1, even exponent
  const result10 = myPow(-1, 2147483646);
  console.log("Test 10 - (-1)^(2^31-2):");
  console.log("Input: x = -1, n = 2147483646");
  console.log("Expected: 1 (even exponent)");
  console.log("Got:", result10);
  console.log("Pass:", result10 === 1, "\n");

  // Test 11: Exponent is 1
  const result11 = myPow(7.5, 1);
  console.log("Test 11 - 7.5^1:");
  console.log("Input: x = 7.5, n = 1");
  console.log("Expected: 7.5");
  console.log("Got:", result11);
  console.log("Pass:", isClose(result11, 7.5), "\n");

  // Test 12: Small negative exponent
  const result12 = myPow(2, -3);
  console.log("Test 12 - 2^(-3):");
  console.log("Input: x = 2, n = -3");
  console.log("Expected: 0.125");
  console.log("Got:", result12);
  console.log("Pass:", isClose(result12, 0.125), "\n");

  // Test 13: Edge case - minimum integer exponent
  const result13 = myPow(2, -2147483648);
  console.log("Test 13 - 2^(-2^31):");
  console.log("Input: x = 2, n = -2147483648");
  console.log("Expected: 0 (extremely small)");
  console.log("Got:", result13);
  console.log("Pass:", result13 === 0, "\n");

  // Test 14: Verify with 3^13
  const result14 = myPow(3, 13);
  console.log("Test 14 - 3^13:");
  console.log("Input: x = 3, n = 13");
  console.log("Expected: 1594323");
  console.log("Got:", result14);
  console.log("Pass:", result14 === 1594323, "\n");
}

// Run tests
testMyPow();