// Test cases for Letter Combinations of a Phone Number

function letterCombinations(digits: string): string[] {
  // Edge case: empty input
  if (digits.length === 0) return [];

  const phoneMap: Record<string, string[]> = {
    '2': ['a', 'b', 'c'],
    '3': ['d', 'e', 'f'],
    '4': ['g', 'h', 'i'],
    '5': ['j', 'k', 'l'],
    '6': ['m', 'n', 'o'],
    '7': ['p', 'q', 'r', 's'],
    '8': ['t', 'u', 'v'],
    '9': ['w', 'x', 'y', 'z']
  };

  const result: string[] = [];

  function backtrack(index: number, current: string) {
    // Base case: we've processed all digits
    if (index === digits.length) {
      result.push(current);
      return;
    }

    // Get the letters for the current digit
    const digit = digits[index];
    const letters = phoneMap[digit];

    // If digit is not in map (like '0' or '1'), skip it
    if (!letters) {
      backtrack(index + 1, current);
      return;
    }

    // Try each letter choice
    for (const letter of letters) {
      backtrack(index + 1, current + letter);
    }
  }

  backtrack(0, '');
  return result;
}

// Helper to check if arrays are equal (order matters)
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Helper to print test results
function runTest(testNum: number, input: string, expected: string[]) {
  const result = letterCombinations(input);
  const passed = arraysEqual(result, expected);
  console.log(`\nTest ${testNum}: ${passed ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Input: "${input}"`);
  console.log(`Expected (${expected.length}):`, expected);
  console.log(`Got (${result.length}):`, result);
}

// Test Case 1: Classic example "23"
// Expected: 9 combinations (3 × 3)
runTest(1, "23", [
  "ad", "ae", "af",
  "bd", "be", "bf",
  "cd", "ce", "cf"
]);

// Test Case 2: Empty string
// Expected: empty array
runTest(2, "", []);

// Test Case 3: Single digit "2"
// Expected: 3 combinations
runTest(3, "2", ["a", "b", "c"]);

// Test Case 4: Three digits "234"
// Expected: 27 combinations (3 × 3 × 3)
runTest(4, "234", [
  "adg", "adh", "adi",
  "aeg", "aeh", "aei",
  "afg", "afh", "afi",
  "bdg", "bdh", "bdi",
  "beg", "beh", "bei",
  "bfg", "bfh", "bfi",
  "cdg", "cdh", "cdi",
  "ceg", "ceh", "cei",
  "cfg", "cfh", "cfi"
]);

// Test Case 5: Digit with 4 letters "7"
// Expected: 4 combinations
runTest(5, "7", ["p", "q", "r", "s"]);

// Test Case 6: Mix of 3 and 4 letter digits "79"
// Expected: 16 combinations (4 × 4)
runTest(6, "79", [
  "pw", "px", "py", "pz",
  "qw", "qx", "qy", "qz",
  "rw", "rx", "ry", "rz",
  "sw", "sx", "sy", "sz"
]);

// Test Case 7: Two 4-letter digits "77"
// Expected: 16 combinations (4 × 4)
runTest(7, "77", [
  "pp", "pq", "pr", "ps",
  "qp", "qq", "qr", "qs",
  "rp", "rq", "rr", "rs",
  "sp", "sq", "sr", "ss"
]);

// Test Case 8: Longer input "2345"
// Expected: 81 combinations (3 × 3 × 3 × 3)
const test8Expected: string[] = [];
for (const c1 of ['a', 'b', 'c']) {
  for (const c2 of ['d', 'e', 'f']) {
    for (const c3 of ['g', 'h', 'i']) {
      for (const c4 of ['j', 'k', 'l']) {
        test8Expected.push(c1 + c2 + c3 + c4);
      }
    }
  }
}
console.log(`\nTest 8: Input "2345"`);
console.log(`Expected: ${test8Expected.length} combinations`);
const test8Result = letterCombinations("2345");
console.log(`Got: ${test8Result.length} combinations`);
console.log(`Match: ${arraysEqual(test8Result, test8Expected) ? '✓' : '✗'}`);
console.log(`First few:`, test8Result.slice(0, 5));
console.log(`Last few:`, test8Result.slice(-5));

// Test Case 9: Only 4-letter digits "99"
// Expected: 16 combinations (4 × 4)
runTest(9, "99", [
  "ww", "wx", "wy", "wz",
  "xw", "xx", "xy", "xz",
  "yw", "yx", "yy", "yz",
  "zw", "zx", "zy", "zz"
]);

// Summary
console.log("\n" + "=".repeat(50));
console.log("PATTERN INSIGHTS:");
console.log("=".repeat(50));
console.log("• Single digit '2': 3 combinations");
console.log("• Two digits '23': 3² = 9 combinations");
console.log("• Three digits '234': 3³ = 27 combinations");
console.log("• Four digits '2345': 3⁴ = 81 combinations");
console.log("• Digit '7' or '9': 4 letters each");
console.log("• '79': 4 × 4 = 16 combinations");
console.log("\nTime Complexity: O(4^n × n) where n = digits.length");
console.log("Space Complexity: O(n) for recursion stack");