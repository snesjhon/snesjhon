// three sum problem
//

class Solution {
  threeSum(nums: number[]): number[][] {
    // we're going to sort this array
    nums.sort();
    const output: number[][] = [];

    // we're going to pick a "fixed" initial value;
    // it's till - 2, since we're looking for triplets
    for (let i = 0; i < nums.length - 2; i++) {
      // this is a duplicate so continue
      if (i > 0 && nums[i] === nums[i - 1]) {
        continue;
      }
      // since we have a fixed value at `i` then we start finding their 'complement' in +1
      let left = i + 1;
      let right = nums.length - 1;

      while (left < right) {
        const sum = nums[i] + nums[left] + nums[right];
        if (sum > 0) {
          right--;
        } else if (sum < 0) {
          left++;
        } else {
          output.push([nums[i], nums[left], nums[right]]);

          while (left < right && nums[left] === nums[left + 1]) {
            left++;
          }

          while (left < right && nums[right] === nums[right - 1]) {
            right--;
          }

          right--;
          left++;
        }
      }
    }
    return output;
  }
}

const sol = new Solution();
console.log(sol.threeSum([-1, 0, 1, 2, -1, -4, -1, 2, 1]));
// console.log(sol.threeSum([-1, -1, -1, -4, 0, 1,  1,  2,  2]));
