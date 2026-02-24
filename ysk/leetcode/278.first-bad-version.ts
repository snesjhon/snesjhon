// @leet start
/**
 * The knows API is defined in the parent class Relation.
 * isBadVersion(version: number): boolean {
 *     ...
 * };
 */

var solution = function (isBadVersion: any) {
  return function (n: number): number {
    let left = 0;
    let right = n;
    let lastBadVersion = 0;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const isBad = isBadVersion(mid);

      if (isBad) {
        lastBadVersion = mid;
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return lastBadVersion;
  };
};
// @leet end

// Test cases
const bad = 4;
const isBadVersion = (version: number): boolean => version >= bad;
const fn = solution(isBadVersion);

console.log(fn(5)); // 4
console.log(fn(1)); // 1
