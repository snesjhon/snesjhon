// Find the length of the longest substring of a given string without repeating characters.
//
// Input: abccabcabcc
//
// Output: 3
//
// Explanation: The longest substrings are abc and cab, both of length 3.
//
// Input: aaaabaaa
//
// Output: 2
//
// Explanation: ab is the longest substring, with a length of 2.

function longestSubString(s: string) {
  let hash = new Map();
  let i = 0;
  let output = 0;

  for (let j = 0; j < s.length; j++) {
    const currentStr = s.charAt(j);
    const hashValue = hash.get(currentStr) ?? 0;

    hash.set(currentStr, hashValue + 1);

    while (hash.get(currentStr) > 1) {
      // our invariant is no longer true so decrement
      const hashItem = hash.get(s.charAt(i));
      if (hashItem - 1 === 0) {
        hash.delete(s.charAt(i));
      } else {
        hash.set(currentStr, hashItem - 1);
      }
      i++;
    }
    console.log({ output, hash });
    output = Math.max(output, hash.size);
  }

  return output;
}

console.log(longestSubString("pwwkew"));
