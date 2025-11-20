function twoSum(nums: number[], target: number): number[] {
  // brute force -- sliding window
  //
  //const output: Set<number> = new Set();
  // for (let i = 0; i < nums.length; i++) {
  //   for (let j = 0; j < nums.length; j++) {
  //     if (i === j) continue;
  //     if (nums[i] + nums[j] === target) {
  //       output.add(i);
  //       output.add(j);
  //     }
  //   }
  // }
  // return [...output]
  //

  // Since we only have a single solution, we should theoretically only have a single
  // Map that we could keep. Where the "{number: index}" could be kept. And as we're
  // iterating through the array, if this "difference" exists, then return that [existing_key, index]
  // along with the _current_ index.
  const numberMap = new Map();

  for (let i = 0; i < nums.length; i++) {
    const number = nums[i];

    const difference = target - number;

    if (numberMap.has(difference)) return [numberMap.get(difference), i];

    numberMap.set(number, i);
  }
  return [];
}

console.log(twoSum([3, 2, 4], 6));
console.log(twoSum([2, 7, 11, 15], 9));
console.log(twoSum([3, 3], 6));
