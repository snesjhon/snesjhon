function lengthOfLongestSubstring(s: string): number {
  let maximum = 0;
  const split = s.split("");

  for (let i = 0; i < split.length; i++) {
    const sum: string[] = [];

    for (let j = i; j < split.length; j++) {
      if (sum.includes(split[j])) {
        // Found duplicate - stop checking from this start position
        break;  // ✅ FIX #2: Stop the inner loop
      }
      sum.push(split[j]);
    }

    // Update maximum after inner loop completes
    maximum = sum.length > maximum ? sum.length : maximum;  // ✅ FIX #1: Always update
  }

  return maximum;
}

// Test cases
console.log("Test 1: 'abcabc'");
console.log("Expected: 3");
console.log("Result:", lengthOfLongestSubstring("abcabc"));
console.log(lengthOfLongestSubstring("abcabc") === 3 ? "✓ PASS" : "✗ FAIL");

console.log("\nTest 2: 'abcdefg'");
console.log("Expected: 7");
console.log("Result:", lengthOfLongestSubstring("abcdefg"));
console.log(lengthOfLongestSubstring("abcdefg") === 7 ? "✓ PASS" : "✗ FAIL");

console.log("\nTest 3: 'pwwkew'");
console.log("Expected: 3");
console.log("Result:", lengthOfLongestSubstring("pwwkew"));
console.log(lengthOfLongestSubstring("pwwkew") === 3 ? "✓ PASS" : "✗ FAIL");

console.log("\nTest 4: 'bbbbb'");
console.log("Expected: 1");
console.log("Result:", lengthOfLongestSubstring("bbbbb"));
console.log(lengthOfLongestSubstring("bbbbb") === 1 ? "✓ PASS" : "✗ FAIL");

console.log("\nTest 5: '' (empty)");
console.log("Expected: 0");
console.log("Result:", lengthOfLongestSubstring(""));
console.log(lengthOfLongestSubstring("") === 0 ? "✓ PASS" : "✗ FAIL");

console.log("\nTest 6: 'dvdf'");
console.log("Expected: 3");
console.log("Result:", lengthOfLongestSubstring("dvdf"));
console.log(lengthOfLongestSubstring("dvdf") === 3 ? "✓ PASS" : "✗ FAIL");
