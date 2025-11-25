// Why do we calculate window size with: right - left + 1?

console.log("=== UNDERSTANDING: right - left + 1 ===\n");

// Let's use a simple string
const s = "abcdef";
console.log(`String: "${s}"\n`);

// Show the indices
console.log("Indices:");
console.log("  0   1   2   3   4   5");
console.log("  a   b   c   d   e   f");
console.log("");

// Example 1: Window from index 0 to 2
console.log("EXAMPLE 1: Window from left=0 to right=2");
console.log("  0   1   2");
console.log("  a   b   c");
console.log("  ^-------^");
console.log("");
console.log("How many characters? Let's count: a, b, c = 3 characters");
console.log("Using formula: right - left + 1 = 2 - 0 + 1 = 3 ✓");
console.log("Without +1:    right - left     = 2 - 0     = 2 ✗");
console.log("");

// Example 2: Window from index 2 to 4
console.log("EXAMPLE 2: Window from left=2 to right=4");
console.log("          2   3   4");
console.log("          c   d   e");
console.log("          ^-------^");
console.log("");
console.log("How many characters? Let's count: c, d, e = 3 characters");
console.log("Using formula: right - left + 1 = 4 - 2 + 1 = 3 ✓");
console.log("Without +1:    right - left     = 4 - 2     = 2 ✗");
console.log("");

// Example 3: Window with just one character
console.log("EXAMPLE 3: Window from left=3 to right=3");
console.log("              3");
console.log("              d");
console.log("              ^");
console.log("");
console.log("How many characters? Let's count: d = 1 character");
console.log("Using formula: right - left + 1 = 3 - 3 + 1 = 1 ✓");
console.log("Without +1:    right - left     = 3 - 3     = 0 ✗");
console.log("");

console.log("=".repeat(70));
console.log("");

// Now let's show why we can't just use the Set size
console.log("WHY NOT JUST USE set.size?");
console.log("");

function demonstrateWithSet(s: string) {
  console.log(`String: "${s}"`);
  let left = 0;
  const seen = new Set<string>();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // Remove duplicates from left
    while (seen.has(char)) {
      seen.delete(s[left]);
      left++;
    }

    seen.add(char);

    const windowByIndices = right - left + 1;
    const windowBySet = seen.size;
    const actualWindow = s.slice(left, right + 1);

    console.log(`  right=${right}, left=${left}, window="${actualWindow}"`);
    console.log(`    right - left + 1 = ${windowByIndices}`);
    console.log(`    set.size = ${windowBySet}`);
    console.log(`    Actual length = ${actualWindow.length}`);

    if (windowByIndices === windowBySet) {
      console.log(`    ✓ Both match!`);
    } else {
      console.log(`    ✗ They differ!`);
    }
    console.log("");
  }
}

demonstrateWithSet("abc");

console.log("=".repeat(70));
console.log("");
console.log("KEY INSIGHT:");
console.log("");
console.log("The window is defined by TWO POINTERS (left and right).");
console.log("These pointers tell us: 'The window goes from index left to index right'");
console.log("");
console.log("To find how many elements are between two indices:");
console.log("  - If left=2 and right=5");
console.log("  - Elements at indices: 2, 3, 4, 5");
console.log("  - Count: 4 elements");
console.log("  - Formula: 5 - 2 + 1 = 4");
console.log("");
console.log("Why +1? Because indices are INCLUSIVE on both ends!");
console.log("We count both the left index AND the right index.");
console.log("");

// Visual number line
console.log("=".repeat(70));
console.log("");
console.log("THINK OF IT LIKE A NUMBER LINE:");
console.log("");
console.log("How many numbers from 2 to 5 (inclusive)?");
console.log("");
console.log("  0   1   2   3   4   5   6   7");
console.log("          ^-----------^");
console.log("          left=2      right=5");
console.log("");
console.log("Count them: 2, 3, 4, 5 = 4 numbers");
console.log("Formula: 5 - 2 + 1 = 4");
console.log("");
console.log("If we did 5 - 2 = 3, we'd be counting the GAPS between numbers,");
console.log("not the numbers themselves!");
console.log("");
console.log("  2 to 3 = gap 1");
console.log("  3 to 4 = gap 2");
console.log("  4 to 5 = gap 3");
console.log("");
console.log("But we want to count the NUMBERS (2, 3, 4, 5), not the gaps!");
