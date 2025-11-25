// This demonstrates how 'left' persists across loop iterations

function demonstrateVariableScope() {
  console.log("=== DEMONSTRATION: How Left Pointer Persists ===\n");

  let left = 0;  // ← Declared HERE, outside the loop
                 //   This variable LIVES through all iterations

  console.log(`Before loop: left = ${left}\n`);

  // Only RIGHT is in the for loop
  for (let right = 0; right < 6; right++) {
    console.log(`Iteration ${right}:`);
    console.log(`  At start: left=${left}, right=${right}`);

    // Simulate: when right reaches 3, we move left
    if (right === 3) {
      console.log(`  → Found duplicate! Moving left...`);
      left = left + 1;  // Modify the OUTER variable
      console.log(`  → left is now ${left}`);
    }

    // Simulate: when right reaches 5, we move left again
    if (right === 5) {
      console.log(`  → Found another duplicate! Moving left...`);
      left = left + 2;  // Modify the OUTER variable
      console.log(`  → left is now ${left}`);
    }

    console.log(`  At end: left=${left}, right=${right}`);
    console.log();
  }

  console.log(`After loop: left = ${left}`);
  console.log("\n✓ See how 'left' REMEMBERS its value between iterations?");
}

demonstrateVariableScope();

console.log("\n" + "=".repeat(60) + "\n");

// Now let's show the actual sliding window pattern
function slidingWindowPattern(s: string) {
  console.log("=== SLIDING WINDOW WITH: '" + s + "' ===\n");

  let left = 0;  // ← Outside loop!

  for (let right = 0; right < s.length; right++) {
    console.log(`right=${right}, left=${left}, window="${s.slice(left, right + 1)}"`);

    // Simulate moving left based on some condition
    if (right >= 3) {
      left++;
      console.log(`  → Moved left to ${left}`);
    }
  }
}

slidingWindowPattern("abcdef");
