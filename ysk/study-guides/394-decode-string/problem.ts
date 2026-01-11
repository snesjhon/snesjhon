// Given an encoded string, return its decoded string.
// The encoding rule is: k[encoded_string], where the encoded_string inside the
// square brackets is being repeated exactly k times.

// Input: s - an encoded string (always valid)
// Output: decoded string

// Rules:
// - k is always a positive integer
// - encoded_string consists of lowercase English letters only
// - Input string is always valid (well-formed brackets)
// - You can assume the input contains only digits, lowercase letters, and brackets

function decodeString(s: string): string {
  const stack: string[] = [];

  for (let i = 0; i < s.length; i++) {
    const current = s.at(i);

    if (current === "]") {
      let add = "";
      while (stack[stack.length - 1] !== "[") {
        add = stack[stack.length - 1] + add;
        stack.pop();
      }

      stack.pop();
      let num = "";
      while (!isNaN(Number(stack[stack.length - 1]))) {
        num = `${stack[stack.length - 1]}` + num;
        stack.pop();
      }

      const addnum = add.repeat(Number(num));
      stack.push(addnum);
    } else if (current) {
      stack.push(current);
    }
  }

  return stack.join("");
}

// Test Cases

function testDecodeString() {
  console.log("Running tests...\n");

  // Test 1: Simple encoding
  const result1 = decodeString("3[a]");
  console.log("Test 1 - Simple encoding:");
  console.log('Input: s = "3[a]"');
  console.log('Expected: "aaa"');
  console.log("Got:", result1);
  console.log("Pass:", result1 === "aaa", "\n");

  // Test 2: Nested encoding
  const result2 = decodeString("3[a2[c]]");
  console.log("Test 2 - Nested encoding:");
  console.log('Input: s = "3[a2[c]]"');
  console.log('Expected: "accaccacc"');
  console.log("Got:", result2);
  console.log("Pass:", result2 === "accaccacc", "\n");

  // Test 3: Multiple segments
  const result3 = decodeString("2[abc]3[cd]ef");
  console.log("Test 3 - Multiple segments:");
  console.log('Input: s = "2[abc]3[cd]ef"');
  console.log('Expected: "abcabccdcdcdef"');
  console.log("Got:", result3);
  console.log("Pass:", result3 === "abcabccdcdcdef", "\n");

  // Test 4: No brackets
  const result4 = decodeString("abc");
  console.log("Test 4 - No brackets:");
  console.log('Input: s = "abc"');
  console.log('Expected: "abc"');
  console.log("Got:", result4);
  console.log("Pass:", result4 === "abc", "\n");

  // Test 5: Mixed content
  const result5 = decodeString("a2[b]c");
  console.log("Test 5 - Mixed content:");
  console.log('Input: s = "a2[b]c"');
  console.log('Expected: "abbc"');
  console.log("Got:", result5);
  console.log("Pass:", result5 === "abbc", "\n");

  // Test 6: Single character
  const result6 = decodeString("a");
  console.log("Test 6 - Single character:");
  console.log('Input: s = "a"');
  console.log('Expected: "a"');
  console.log("Got:", result6);
  console.log("Pass:", result6 === "a", "\n");

  // Test 7: Deeply nested
  const result7 = decodeString("2[2[2[a]]]");
  console.log("Test 7 - Deeply nested:");
  console.log('Input: s = "2[2[2[a]]]"');
  console.log('Expected: "aaaaaaaa" (8 a\'s)');
  console.log("Got:", result7);
  console.log("Pass:", result7 === "aaaaaaaa", "\n");

  // Test 8: Multiple different encodings
  const result8 = decodeString("2[a]3[b]");
  console.log("Test 8 - Multiple encodings:");
  console.log('Input: s = "2[a]3[b]"');
  console.log('Expected: "aabbbb"');
  console.log("Got:", result8);
  console.log("Pass:", result8 === "aabbbb", "\n");

  // Test 9: Large number
  const result9 = decodeString("10[a]");
  console.log("Test 9 - Large number:");
  console.log('Input: s = "10[a]"');
  console.log('Expected: "aaaaaaaaaa" (10 a\'s)');
  console.log("Got:", result9);
  console.log("Pass:", result9 === "aaaaaaaaaa", "\n");

  // Test 10: Complex nested with multiple chars
  const result10 = decodeString("2[abc3[cd]ef]");
  console.log("Test 10 - Complex nested:");
  console.log('Input: s = "2[abc3[cd]ef]"');
  console.log('Expected: "abccdcdcdefabccdcdcdef"');
  console.log("Got:", result10);
  console.log("Pass:", result10 === "abccdcdcdefabccdcdcdef", "\n");

  // Test 11: Single digit count
  const result11 = decodeString("1[a]");
  console.log("Test 11 - Single digit count:");
  console.log('Input: s = "1[a]"');
  console.log('Expected: "a"');
  console.log("Got:", result11);
  console.log("Pass:", result11 === "a", "\n");

  // Test 12: Very complex
  const result12 = decodeString("3[z]2[2[y]pq4[2[jk]e1[f]]]ef");
  console.log("Test 12 - Very complex:");
  console.log('Input: s = "3[z]2[2[y]pq4[2[jk]e1[f]]]ef"');
  console.log(
    'Expected: "zzzyypqjkjkefjkjkefjkjkefjkjkefyypqjkjkefjkjkefjkjkefjkjkefef"',
  );
  console.log("Got:", result12);
  console.log(
    "Pass:",
    result12 ===
      "zzzyypqjkjkefjkjkefjkjkefjkjkefyypqjkjkefjkjkefjkjkefjkjkefef",
    "\n",
  );
}

// Run tests
testDecodeString();
