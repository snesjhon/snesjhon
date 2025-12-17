// Let's continue on finding the sum of subarrays. This time given a positive integer array nums, we want to find the length of the shortest subarray such that the subarray sum is at least target. Recall the same example with input nums = [1, 4, 1, 7, 3, 0, 2, 5] and target = 10, then the smallest window with the sum >= 10 is [7, 3] with length 2. So the output is 2.

// We'll assume for this problem that it's guaranteed target will not exceed the sum of all elements in nums.

function shortest(nums: number[], target: number) {
  let output = nums.length;
  let i = 0;
  let sum = 0;

  for (let j = 0; j < nums.length; j++) {
    sum += nums[j];
    while (sum >= target) {
      output = Math.min(output, j - i + 1);
      sum -= nums[i];
      i++;
    }
  }
  return output;
}

console.log(shortest([1, 6, 8], 8)); //1
console.log(shortest([1, 4, 1, 7, 3, 0, 2, 5], 10)); // 2
console.log(shortest([6, 6, 6, 6, 6, 6, 6], 19)); // 4
