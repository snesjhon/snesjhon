function movezeros(nums: number[]) {
  let i = 0;
  for (let j = 0; j < nums.length; j++) {
    /**

     i: 0, 0, 1, 1, 2
    ni: 2, 2, 0, 0, 0
     j: 0, 1, 2, 3, 4
    nj: 2, 0, 4, 0, 9
    // if we see a 0, increment i++
    // if we see non-zero, then swap
     */
    if (nums[j] !== 0) {
      [nums[i], nums[j]] = [nums[j], nums[i]];

      i++;
    }
  }
  return nums;
}

console.log(movezeros([2, 0, 4, 0, 9]));
