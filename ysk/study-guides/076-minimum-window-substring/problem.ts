// Find the minimum window in string s that contains all characters from string t
// (including duplicates with correct frequencies)

// Input:
// s: source string to search in
// t: target string with characters to find

// Output: minimum window substring, or empty string if no valid window exists

// Requirements:
// - Must contain ALL characters from t with correct frequencies
// - Return shortest valid window (any one if multiple exist)
// - Must be performant: O(n + m) time where n = s.length, m = t.length

function minWindow(s: string, t: string): string {
  // TODO: Implement this function
  return "";
}

// Test Cases

function testMinWindow() {
  console.log("Running tests...\n");

  // Test 1: Basic example
  const result1 = minWindow("ADOBECODEBANC", "ABC");
  console.log("Test 1 - Basic example:");
  console.log('Input: s = "ADOBECODEBANC", t = "ABC"');
  console.log('Expected: "BANC" (or any window of length 4)');
  console.log("Got:", result1);
  const pass1 = result1.length === 4 &&
    result1.includes("A") &&
    result1.includes("B") &&
    result1.includes("C");
  console.log("Pass:", pass1, "\n");

  // Test 2: Single character
  const result2 = minWindow("a", "a");
  console.log("Test 2 - Single character:");
  console.log('Input: s = "a", t = "a"');
  console.log('Expected: "a"');
  console.log("Got:", result2);
  console.log("Pass:", result2 === "a", "\n");

  // Test 3: No valid window
  const result3 = minWindow("a", "aa");
  console.log("Test 3 - No valid window:");
  console.log('Input: s = "a", t = "aa"');
  console.log('Expected: ""');
  console.log("Got:", result3);
  console.log("Pass:", result3 === "", "\n");

  // Test 4: Entire string is minimum
  const result4 = minWindow("abc", "abc");
  console.log("Test 4 - Entire string:");
  console.log('Input: s = "abc", t = "abc"');
  console.log('Expected: "abc"');
  console.log("Got:", result4);
  const pass4 = result4.length === 3 &&
    result4.includes("a") &&
    result4.includes("b") &&
    result4.includes("c");
  console.log("Pass:", pass4, "\n");

  // Test 5: Duplicate characters in t
  const result5 = minWindow("aaabbbccc", "abc");
  console.log("Test 5 - Duplicates in s:");
  console.log('Input: s = "aaabbbccc", t = "abc"');
  console.log('Expected: any valid 3-char window like "abc"');
  console.log("Got:", result5);
  const pass5 = result5.length === 3 &&
    result5.includes("a") &&
    result5.includes("b") &&
    result5.includes("c");
  console.log("Pass:", pass5, "\n");

  // Test 6: Multiple same characters needed
  const result6 = minWindow("ADOBECODEBANC", "AABC");
  console.log("Test 6 - Multiple same characters:");
  console.log('Input: s = "ADOBECODEBANC", t = "AABC"');
  console.log("Expected: a window containing at least 2 A's, 1 B, 1 C");
  console.log("Got:", result6);
  const countA = (result6.match(/A/g) || []).length;
  const pass6 = countA >= 2 &&
    result6.includes("B") &&
    result6.includes("C");
  console.log("Pass:", pass6, "\n");

  // Test 7: Target longer than source
  const result7 = minWindow("a", "aa");
  console.log("Test 7 - t longer than s:");
  console.log('Input: s = "a", t = "aa"');
  console.log('Expected: ""');
  console.log("Got:", result7);
  console.log("Pass:", result7 === "", "\n");

  // Test 8: Window at start
  const result8 = minWindow("ABCDEFG", "ABC");
  console.log("Test 8 - Window at start:");
  console.log('Input: s = "ABCDEFG", t = "ABC"');
  console.log('Expected: "ABC"');
  console.log("Got:", result8);
  const pass8 = result8.length === 3 &&
    result8.includes("A") &&
    result8.includes("B") &&
    result8.includes("C");
  console.log("Pass:", pass8, "\n");

  // Test 9: Window at end
  const result9 = minWindow("DEFGABC", "ABC");
  console.log("Test 9 - Window at end:");
  console.log('Input: s = "DEFGABC", t = "ABC"');
  console.log('Expected: "ABC"');
  console.log("Got:", result9);
  const pass9 = result9.length === 3 &&
    result9.includes("A") &&
    result9.includes("B") &&
    result9.includes("C");
  console.log("Pass:", pass9, "\n");

  // Test 10: Complex case with many duplicates
  const result10 = minWindow("aaaaaaaaaaaabbbbbcdd", "abcdd");
  console.log("Test 10 - Complex with duplicates:");
  console.log('Input: s = "aaaaaaaaaaaabbbbbcdd", t = "abcdd"');
  console.log('Expected: "bbcdd" or similar 5-char window');
  console.log("Got:", result10);
  const pass10 = result10.includes("a") &&
    result10.includes("b") &&
    result10.includes("c") &&
    (result10.match(/d/g) || []).length >= 2;
  console.log("Pass:", pass10, "\n");

  // Test 11: Empty t
  const result11 = minWindow("abc", "");
  console.log("Test 11 - Empty t:");
  console.log('Input: s = "abc", t = ""');
  console.log('Expected: ""');
  console.log("Got:", result11);
  console.log("Pass:", result11 === "", "\n");

  // Test 12: Different case sensitivity
  const result12 = minWindow("aAbBcC", "ABC");
  console.log("Test 12 - Case sensitive:");
  console.log('Input: s = "aAbBcC", t = "ABC"');
  console.log('Expected: "AbBcC" or "BcC" containing A,B,C (capitals)');
  console.log("Got:", result12);
  const pass12 = result12.includes("A") &&
    result12.includes("B") &&
    result12.includes("C");
  console.log("Pass:", pass12, "\n");
}

// Run tests
testMinWindow();
