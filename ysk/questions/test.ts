// function to create from string aabbcccdddd into a2b2c3d4
//
function condenseString(str: string) {
  let i = 0;
  let j = 0;
  let counter = 0;
  let strreport = "";
  while (j <= str.length) {
    if (str.at(i) !== str.at(j)) {
      i++;
      strreport += `${str?.at(i) ?? ""}${counter}`;
      counter = 0;
      i = j;
    }
    counter++;
    j++;
  }
  return strreport;
  // brute force?
  // hashmap and increase counters then map and return condense string
  // const hash = new Map();
  //
  // for (const s of str) {
  //   if (hash.has(s)) {
  //     hash.set(s, hash.get(s) + 1);
  //   } else {
  //     hash.set(s, 1);
  //   }
  // }
  // return Array.from(hash.entries())
  //   .map(([key, val]) => `${key}${val}`)
  //   .join("");
}

console.log(condenseString("aabbcccdddd"));
