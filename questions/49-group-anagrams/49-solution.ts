// @leet start
function groupAnagrams(strs: string[]): string[][] {
  // My initial thought is to build a hashmap.
  // This hashmap could keep a list of "known" items and their indexies
  // Based on that we could iterate through the list and then if there's a direct match of all
  // of the items within this hashmap, then we could add it to the index.
  //
  // Maybe that's not the way, instead let's see if the two loops could work?
  // This fails because of the space complexity and also fails when it's an empty ["", ""]

  // const output: string[][] = [];
  // for (let i = 0; i < strs.length; i++) {
  //   for (let j = 0; j < strs.length; j++) {
  //     const splitWord = strs[i] == "" ? strs[i].split(",") : strs[i].split("");
  //     const comparison = strs[j] == "" ? strs[j].split(",") : strs[j].split("");
  //     const previousIndex = strs[i - 1];
  //
  //     const previous =
  //       previousIndex && strs[i - 1] == ""
  //         ? strs[i - 1].split(",")
  //         : previousIndex
  //           ? strs[i - 1].split("")
  //           : [];
  //
  //     const hasAll = splitWord.every((word) => comparison.includes(word));
  //     const previousComparison = splitWord.every((word) =>
  //       previous.includes(word),
  //     );
  //     if (hasAll) {
  //       if (!output[i]) {
  //         output.push([strs[i]]);
  //       } else if (previousComparison) {
  //         output[i - 1].push(strs[j]);
  //
  //         strs.splice(i - 1, 1);
  //       } else {
  //         output[i].push(strs[j]);
  //         strs.splice(j, 1);
  //       }
  //     }
  //   }
  // }
  // return output;
  //

  // My initial thought was correct. Where we would build a hashmap.
  // What I failed to realize and the path I shouldn't have taken is the iterable with splicing route
  // That led me in a very weird direction where I was adding more than I needed
  const hashMap = new Map();
  strs.forEach((word) => {
    const sortedWord = word.split("").sort().join("");
    if (hashMap.has(sortedWord)) {
      const arrayValue = hashMap.get(sortedWord);
      arrayValue.push(word);
    } else {
      hashMap.set(sortedWord, [word]);
    }
  });
  return [...hashMap.values()];
}
// @leet end
//
console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
console.log(groupAnagrams(["a"]));
console.log(groupAnagrams(["", "b"]));
console.log(groupAnagrams(["", "", ""]));
