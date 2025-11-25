function lengthOfLongestSubstring(s: string): number {
  let maximum = 0;
  const split = s.split("");

  for (let i = 0; i < split.length; i++) {
    const sum: string[] = [];
    console.log(`\n=== i=${i}, starting at '${split[i]}' ===`);

    for (let j = i; j < split.length; j++) {
      console.log(`  j=${j}, char='${split[j]}', sum=[${sum.join(',')}]`);

      if (sum.includes(split[j])) {
        console.log(`    DUPLICATE FOUND! '${split[j]}' already in sum`);
        console.log(`    Updating maximum: max(${maximum}, ${sum.length}) = ${Math.max(maximum, sum.length)}`);
        maximum = sum.length > maximum ? sum.length : maximum;
        console.log(`    NOT pushing '${split[j]}' to sum`);
        console.log(`    Continuing to next j...`);
      } else {
        sum.push(split[j]);
        console.log(`    Added '${split[j]}', sum=[${sum.join(',')}]`);
      }
    }

    console.log(`  Inner loop finished. sum=[${sum.join(',')}], length=${sum.length}`);
    console.log(`  Maximum: ${maximum} (DID WE UPDATE IT?)`);
  }

  return maximum;
}

console.log("Test 1: 'abcabc'");
console.log("Expected: 3");
let result1 = lengthOfLongestSubstring("abcabc");
console.log(`Result: ${result1}`);
console.log(`✓ or ✗: ${result1 === 3 ? '✓ CORRECT' : '✗ WRONG'}`);

console.log("\n" + "=".repeat(70));

console.log("\nTest 2: 'abcdefg' (all unique)");
console.log("Expected: 7");
let result2 = lengthOfLongestSubstring("abcdefg");
console.log(`Result: ${result2}`);
console.log(`✓ or ✗: ${result2 === 7 ? '✓ CORRECT' : '✗ WRONG'}`);

console.log("\n" + "=".repeat(70));

console.log("\nTest 3: 'pwwkew'");
console.log("Expected: 3");
let result3 = lengthOfLongestSubstring("pwwkew");
console.log(`Result: ${result3}`);
console.log(`✓ or ✗: ${result3 === 3 ? '✓ CORRECT' : '✗ WRONG'}`);
