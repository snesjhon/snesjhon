function lengthOfLongestSubstring(s: string): number {
  let maximum = 0;
  const split = s.split("");

  for (let i = 0; i < split.length; i++) {
    let sub: string[] = [split[i]];
    console.log(`\n=== Starting at i=${i}, char='${split[i]}' ===`);

    for (let j = 1; j < split.length; j++) {
      console.log(`  j=${j}, checking '${split[j]}', sub=[${sub.join(',')}]`);

      if (sub.includes(split[j])) {
        console.log(`    '${split[j]}' IS in sub! Shifting...`);
        sub.shift();
        console.log(`    sub is now: [${sub.join(',')}]`);
      } else {
        console.log(`    '${split[j]}' not in sub, adding...`);
        sub.push(split[j]);
        console.log(`    sub is now: [${sub.join(',')}]`);
      }
    }

    console.log(`  Final sub length: ${sub.length}`);
    maximum = sub.length >= maximum ? sub.length : maximum;
    console.log(`  Maximum so far: ${maximum}`);
  }

  return maximum;
}

// Test with a simple case
console.log("\n\nTesting 'abcabc':");
console.log("Expected: 3");
console.log("Result:", lengthOfLongestSubstring("abcabc"));

console.log("\n\n" + "=".repeat(50));
console.log("\nTesting 'pwwkew':");
console.log("Expected: 3");
console.log("Result:", lengthOfLongestSubstring("pwwkew"));
