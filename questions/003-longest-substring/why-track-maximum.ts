// Demonstrating WHY we need to track maximum

function withoutTrackingMaximum(s: string): number {
  console.log(`=== WITHOUT TRACKING MAXIMUM: "${s}" ===\n`);

  let left = 0;
  const seen = new Set<string>();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    while (seen.has(char)) {
      seen.delete(s[left]);
      left++;
    }

    seen.add(char);

    const currentLength = right - left + 1;
    console.log(`Step ${right + 1}: window="${s.slice(left, right + 1)}", length=${currentLength}`);
  }

  // WRONG! Just returning the final window size
  const finalLength = s.length - left;
  console.log(`\nFinal window size: ${finalLength}`);
  console.log(`❌ This is WRONG!\n`);

  return finalLength;
}

function withTrackingMaximum(s: string): number {
  console.log(`=== WITH TRACKING MAXIMUM: "${s}" ===\n`);

  let left = 0;
  let maxLength = 0;  // ← Track the maximum!
  const seen = new Set<string>();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    while (seen.has(char)) {
      seen.delete(s[left]);
      left++;
    }

    seen.add(char);

    const currentLength = right - left + 1;

    // Update maximum if current is larger
    if (currentLength > maxLength) {
      maxLength = currentLength;
      console.log(`Step ${right + 1}: window="${s.slice(left, right + 1)}", length=${currentLength} ⭐ NEW MAX!`);
    } else {
      console.log(`Step ${right + 1}: window="${s.slice(left, right + 1)}", length=${currentLength}`);
    }
  }

  console.log(`\nMaximum length ever seen: ${maxLength}`);
  console.log(`✓ This is CORRECT!\n`);

  return maxLength;
}

// Example 1: "abcabcbb" - maximum is at the BEGINNING
console.log("EXAMPLE 1: Maximum at the beginning");
console.log("String: 'abcabcbb'");
console.log("Expected answer: 3 (substring 'abc')\n");

withoutTrackingMaximum("abcabcbb");
console.log();
withTrackingMaximum("abcabcbb");

console.log("\n" + "=".repeat(70) + "\n");

// Example 2: "bbbbb" - window gets smaller and smaller
console.log("EXAMPLE 2: Window shrinks as we go");
console.log("String: 'bbbbb'");
console.log("Expected answer: 1 (any single 'b')\n");

withoutTrackingMaximum("bbbbb");
console.log();
withTrackingMaximum("bbbbb");

console.log("\n" + "=".repeat(70) + "\n");

// Example 3: Visual explanation
console.log("VISUAL EXPLANATION:\n");
console.log("For 'abcabcbb', the window size changes like this:");
console.log("");
console.log("  right=0: 'a'         length=1");
console.log("  right=1: 'ab'        length=2");
console.log("  right=2: 'abc'       length=3  ← MAXIMUM!");
console.log("  right=3: 'bca'       length=3");
console.log("  right=4: 'cab'       length=3");
console.log("  right=5: 'abc'       length=3");
console.log("  right=6: 'cb'        length=2  ← shrunk!");
console.log("  right=7: 'b'         length=1  ← shrunk more!");
console.log("");
console.log("If we only looked at the FINAL window size (1),");
console.log("we'd miss that the maximum was 3!");
console.log("");
console.log("That's why we need: maxLength = Math.max(maxLength, currentLength)");
