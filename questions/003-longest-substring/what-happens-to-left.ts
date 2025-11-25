// Demonstrating EXACTLY what happens when we move left

function visualSlidingWindow(s: string) {
  console.log(`=== SLIDING WINDOW FOR: "${s}" ===\n`);

  let left = 0;
  let maxLength = 0;
  const seen = new Set<string>();  // Track what's in our window

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    console.log(`\n--- Step ${right + 1}: right=${right}, char='${char}' ---`);
    console.log(`Window before: "${s.slice(left, right)}" [${left}, ${right - 1}]`);
    console.log(`Seen before: {${Array.from(seen).join(', ')}}`);
    console.log(`left=${left}`);

    // Check if this character creates a duplicate
    if (seen.has(char)) {
      console.log(`\n❌ DUPLICATE FOUND! '${char}' is already in window`);
      console.log(`Need to remove characters from left until '${char}' is gone\n`);

      // Keep removing from left until duplicate is gone
      while (seen.has(char)) {
        const removedChar = s[left];
        console.log(`  → Removing '${removedChar}' at index ${left}`);
        seen.delete(removedChar);
        console.log(`     seen is now: {${Array.from(seen).join(', ')}}`);
        left++;
        console.log(`     left moved to: ${left}`);

        if (seen.has(char)) {
          console.log(`     '${char}' still in window, continue...`);
        } else {
          console.log(`     '${char}' is gone! Window is valid again`);
        }
      }
    } else {
      console.log(`✓ No duplicate, '${char}' is new`);
    }

    // Add current character
    seen.add(char);
    console.log(`\nAdded '${char}' to window`);
    console.log(`Window after: "${s.slice(left, right + 1)}" [${left}, ${right}]`);
    console.log(`Seen after: {${Array.from(seen).join(', ')}}`);

    // Update maximum
    const currentLength = right - left + 1;
    if (currentLength > maxLength) {
      maxLength = currentLength;
      console.log(`New maximum length: ${maxLength}`);
    } else {
      console.log(`Current length: ${currentLength}, max still: ${maxLength}`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`FINAL ANSWER: ${maxLength}`);
  console.log(`${'='.repeat(50)}`);

  return maxLength;
}

// Test with "abcabc" - the classic example
visualSlidingWindow("abcabc");

console.log("\n\n" + "=".repeat(70) + "\n\n");

// Test with "pwwkew" - another good example
visualSlidingWindow("pwwkew");
