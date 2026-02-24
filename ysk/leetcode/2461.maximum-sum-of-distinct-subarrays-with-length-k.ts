// @leet start
function maximumSubarraySum(nums: number[], k: number): number {
  // f: {}
  // f -> s ->
  // f <- e ->
  //
  // max: Infinity
  //
  //       s
  // 1 5 4 2 9 9 9
  //           e
  //
  // window_len= e - s + 1 === k

  const frequency = new Map();
  let max = 0;
  let window_sum = 0;

  let start = 0;
  for (let end = 0; end < nums.length; end++) {
    const current = nums[end];
    window_sum += current;

    if (frequency.has(current)) {
      frequency.set(current, frequency.get(current) + 1);
    } else {
      frequency.set(current, 1);
    }

    const window_len = end - start + 1;

    if (window_len === k) {
      // update max if no repeats
      if (frequency.size === k) {
        max = Math.max(max, window_sum);
      }

      const previous = nums[start];

      if (frequency.has(previous)) {
        frequency.set(previous, frequency.get(previous) - 1);
      }

      if (frequency.get(previous) === 0) {
        frequency.delete(previous);
      }
      window_sum -= previous;
      start++;
    }
  }
  return max;
}
// @leet end

maximumSubarraySum([9, 9, 9, 1, 2, 3], 3); //12
