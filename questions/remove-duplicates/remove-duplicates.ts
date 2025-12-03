function binarySearch(arr: number[], target: number) {
  // move when we found either
  let left = 0;

  // move when we found in right
  let right = arr.length - 1;
  let boundary = -1;

  while (left <= right) {
    const middleIndex = Math.floor((left + right) / 2);
    const middle = arr[middleIndex];

    if (middle === target) {
      boundary = middleIndex;
      right = middleIndex - 1;
    } else if (middle > target) {
      right = middleIndex - 1;
    } else {
      left = middleIndex + 1;
    }
  }
  return boundary;
}

// console.log(longestSubstring("abccabcabcdefghi"));
console.log(binarySearch([1, 3, 3, 3, 3, 6, 10, 10, 10, 100], 3));
