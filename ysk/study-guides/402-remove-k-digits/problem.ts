// Given a string num representing a non-negative integer, and an integer k,
// return the smallest possible integer after removing k digits from num.

// Input: num - a string of digits, k - number of digits to remove
// Output: the smallest possible number as a string

// Rules:
// - num consists of only digits
// - num does not have any leading zeros (except num = "0")
// - 1 <= k <= num.length <= 10^5
// - The returned string should not have leading zeros (except "0")

function removeKdigits(num: string, k: number): string {
  const stack: string[] = [];

  for (const digit of num) {
    // While we can still remove and current digit is smaller than stack top
    while (k > 0 && stack.length > 0 && stack[stack.length - 1] > digit) {
      stack.pop();
      k--;
    }
    stack.push(digit);
  }

  // If k > 0, remove from the end (for increasing sequences)
  while (k > 0) {
    stack.pop();
    k--;
  }

  // Remove leading zeros
  let result = stack.join("");
  let i = 0;
  while (i < result.length - 1 && result[i] === "0") {
    i++;
  }
  result = result.slice(i);

  // Handle empty result
  return result.length === 0 ? "0" : result;
}

// Test Cases

function testRemoveKdigits() {
  console.log("Running tests...\n");

  // Test 1: Basic example
  const result1 = removeKdigits("1432219", 3);
  console.log("Test 1 - Basic example:");
  console.log('Input: num = "1432219", k = 3');
  console.log('Expected: "1219"');
  console.log("Got:", result1);
  console.log("Pass:", result1 === "1219", "\n");

  // Test 2: Leading zeros after removal
  const result2 = removeKdigits("10200", 1);
  console.log("Test 2 - Leading zeros:");
  console.log('Input: num = "10200", k = 1');
  console.log('Expected: "200"');
  console.log("Got:", result2);
  console.log("Pass:", result2 === "200", "\n");

  // Test 3: Remove all digits
  const result3 = removeKdigits("10", 2);
  console.log("Test 3 - Remove all:");
  console.log('Input: num = "10", k = 2');
  console.log('Expected: "0"');
  console.log("Got:", result3);
  console.log("Pass:", result3 === "0", "\n");

  // Test 4: Already increasing sequence
  const result4 = removeKdigits("12345", 2);
  console.log("Test 4 - Increasing sequence:");
  console.log('Input: num = "12345", k = 2');
  console.log('Expected: "123"');
  console.log("Got:", result4);
  console.log("Pass:", result4 === "123", "\n");

  // Test 5: All same digits
  const result5 = removeKdigits("1111", 2);
  console.log("Test 5 - All same digits:");
  console.log('Input: num = "1111", k = 2');
  console.log('Expected: "11"');
  console.log("Got:", result5);
  console.log("Pass:", result5 === "11", "\n");

  // Test 6: Single digit
  const result6 = removeKdigits("9", 1);
  console.log("Test 6 - Single digit:");
  console.log('Input: num = "9", k = 1');
  console.log('Expected: "0"');
  console.log("Got:", result6);
  console.log("Pass:", result6 === "0", "\n");

  // Test 7: k = 0 (no removal)
  const result7 = removeKdigits("123", 0);
  console.log("Test 7 - No removal:");
  console.log('Input: num = "123", k = 0');
  console.log('Expected: "123"');
  console.log("Got:", result7);
  console.log("Pass:", result7 === "123", "\n");

  // Test 8: Decreasing sequence
  const result8 = removeKdigits("54321", 2);
  console.log("Test 8 - Decreasing sequence:");
  console.log('Input: num = "54321", k = 2');
  console.log('Expected: "321"');
  console.log("Got:", result8);
  console.log("Pass:", result8 === "321", "\n");

  // Test 9: Mixed with multiple zeros
  const result9 = removeKdigits("10001", 1);
  console.log("Test 9 - Multiple zeros:");
  console.log('Input: num = "10001", k = 1');
  console.log('Expected: "1"');
  console.log("Got:", result9);
  console.log("Pass:", result9 === "1", "\n");

  // Test 10: Large k with all zeros result
  const result10 = removeKdigits("100", 1);
  console.log("Test 10 - Result with zeros:");
  console.log('Input: num = "100", k = 1');
  console.log('Expected: "0"');
  console.log("Got:", result10);
  console.log("Pass:", result10 === "0", "\n");

  // Test 11: Multi-digit number with pattern
  const result11 = removeKdigits("112", 1);
  console.log("Test 11 - Pattern 112:");
  console.log('Input: num = "112", k = 1');
  console.log('Expected: "11"');
  console.log("Got:", result11);
  console.log("Pass:", result11 === "11", "\n");

  // Test 12: Complex case
  const result12 = removeKdigits("1234567890", 9);
  console.log("Test 12 - Complex case:");
  console.log('Input: num = "1234567890", k = 9');
  console.log('Expected: "0"');
  console.log("Got:", result12);
  console.log("Pass:", result12 === "0", "\n");

  // Test 13: Another pattern
  const result13 = removeKdigits("5337", 2);
  console.log("Test 13 - Pattern 5337:");
  console.log('Input: num = "5337", k = 2');
  console.log('Expected: "33"');
  console.log("Got:", result13);
  console.log("Pass:", result13 === "33", "\n");

  // Test 14: Edge case with leading zeros
  const result14 = removeKdigits("10", 1);
  console.log("Test 14 - Two digits remove one:");
  console.log('Input: num = "10", k = 1');
  console.log('Expected: "0"');
  console.log("Got:", result14);
  console.log("Pass:", result14 === "0", "\n");

  // Test 15: Remove from middle
  const result15 = removeKdigits("1173", 2);
  console.log("Test 15 - Remove from middle:");
  console.log('Input: num = "1173", k = 2');
  console.log('Expected: "11"');
  console.log("Got:", result15);
  console.log("Pass:", result15 === "11", "\n");
}

// Run tests
testRemoveKdigits();
