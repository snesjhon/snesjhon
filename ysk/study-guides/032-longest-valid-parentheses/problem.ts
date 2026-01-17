/**
 * LeetCode 32: Longest Valid Parentheses
 *
 * Given a string containing just '(' and ')', find the length
 * of the longest valid (well-formed) parentheses substring.
 */

// ============================================================
// Solution 1: Stack-Based Approach (Recommended)
// Time: O(n), Space: O(n)
// ============================================================
function longestValidParentheses(s: string): number {
  // Initialize stack with -1 as base for length calculation
  const stack: number[] = [-1];
  let max = 0;

  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") {
      // Push index of opening parenthesis
      stack.push(i);
    } else {
      // Pop the matching '(' or the base
      stack.pop();

      if (stack.length === 0) {
        // Stack empty: this ')' becomes new base
        stack.push(i);
      } else {
        // Calculate length: i - stack.top() = valid region
        const length = i - stack[stack.length - 1];
        max = Math.max(max, length);
      }
    }
  }

  return max;
}

// ============================================================
// Solution 2: Dynamic Programming
// Time: O(n), Space: O(n)
// ============================================================
function longestValidParenthesesDP(s: string): number {
  if (s.length === 0) return 0;

  // dp[i] = length of longest valid parentheses ending at index i
  const dp: number[] = new Array(s.length).fill(0);
  let max = 0;

  for (let i = 1; i < s.length; i++) {
    // Valid strings always end with ')'
    if (s[i] === ")") {
      if (s[i - 1] === "(") {
        // Case 1: "()" pattern
        // dp[i] = whatever was valid before + 2
        dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;
      } else {
        // Case 2: "))" pattern
        // Find the position that would match this ')'
        const matchPos = i - dp[i - 1] - 1;

        if (matchPos >= 0 && s[matchPos] === "(") {
          // Found matching '('!
          // dp[i] = inner valid + 2 + valid before matching '('
          dp[i] =
            dp[i - 1] + 2 + (matchPos >= 1 ? dp[matchPos - 1] : 0);
        }
      }
      max = Math.max(max, dp[i]);
    }
  }

  return max;
}

// ============================================================
// Solution 3: Two-Pass Counter (O(1) Space)
// Time: O(n), Space: O(1)
// ============================================================
function longestValidParenthesesTwoPass(s: string): number {
  let left = 0;
  let right = 0;
  let max = 0;

  // Left to right pass
  // Catches cases where ')' terminates a valid sequence
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") {
      left++;
    } else {
      right++;
    }

    if (left === right) {
      // Equal counts = valid substring
      max = Math.max(max, 2 * right);
    } else if (right > left) {
      // Too many ')' = invalid, reset
      left = right = 0;
    }
    // left > right: keep going, might become valid
  }

  // Right to left pass
  // Catches cases like "(()" that left pass misses
  left = right = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === "(") {
      left++;
    } else {
      right++;
    }

    if (left === right) {
      max = Math.max(max, 2 * left);
    } else if (left > right) {
      // Too many '(' = invalid, reset
      left = right = 0;
    }
  }

  return max;
}

// ============================================================
// Test Cases
// ============================================================
const testCases = [
  { input: "(()", expected: 2 },
  { input: ")()())", expected: 4 },
  { input: "", expected: 0 },
  { input: "()()", expected: 4 },
  { input: "(())", expected: 4 },
  { input: "()(())", expected: 6 },
  { input: "()(()", expected: 2 },
  { input: "(()())", expected: 6 },
  { input: "(()()", expected: 4 },
];

console.log("Testing Stack Solution:");
testCases.forEach(({ input, expected }) => {
  const result = longestValidParentheses(input);
  const status = result === expected ? "✓" : "✗";
  console.log(`  ${status} "${input}" → ${result} (expected ${expected})`);
});

console.log("\nTesting DP Solution:");
testCases.forEach(({ input, expected }) => {
  const result = longestValidParenthesesDP(input);
  const status = result === expected ? "✓" : "✗";
  console.log(`  ${status} "${input}" → ${result} (expected ${expected})`);
});

console.log("\nTesting Two-Pass Solution:");
testCases.forEach(({ input, expected }) => {
  const result = longestValidParenthesesTwoPass(input);
  const status = result === expected ? "✓" : "✗";
  console.log(`  ${status} "${input}" → ${result} (expected ${expected})`);
});