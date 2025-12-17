# Three Different Patterns

This is a continuation of [[sliding-window-problems]]

## Fixed Size Window (Both pointers move together)

```js
  // Find All Anagrams - window size is ALWAYS check.length
function findAnagrams(s: string, p: string): number[] {
  const windowSize = p.length;

  // Right pointer drives, left pointer follows at fixed distance
  for (let right = windowSize; right < s.length; right++) {
	  const left = right - windowSize;  // Left is DERIVED from right

	  // Add new char at right
	  // Remove old char at left
	  // Check if window is valid
  }
}
```

  Why both move together? 
  
> [!NOTE] 
> The window size never changes, so `left = right - windowSize` always.
  

## Flexible Size - for loop (Right auto-increments, left manual)

### Mental Model: 

The window is **always valid** at the end of each iteration - this is the **"invariant."** 

We start valid (empty window), expand by adding `nums[right]` (which might break validity), then shrink by incrementing `left` only until valid again. 

Since the while loop only runs when invalid, exiting it guarantees validity. Because the window is always valid at iteration's end, we can safely track the maximum there. 

To find the **longest** window, we move `left` as little as possible (only when forced to restore validity), which maximizes window size. Right always moves forward greedily, left catches up minimally - this guarantees we don't miss any longer valid windows.


```ts
// Longest Subarray - window size changes
function longestSubarray(nums: number[], target: number): number {
  let left = 0;

  // Right pointer always moves forward
  for (let right = 0; right < nums.length; right++) {
	  sum += nums[right];

	  // Left pointer moves ONLY when needed
	  while (sum > target) {
		  sum -= nums[left];
		  left++;
	  }

	  maxLength = Math.max(maxLength, right - left + 1);
  }
}
```

> [!NOTE]
>  Why for-loop for right? Right always advances each iteration (greedy expansion).

## Manual Control of Both (Both while loops)

```ts
// Same problem, but manually controlling right
function longestSubarrayManual(nums: number[], target: number): number {
  let left = 0;
  let right = 0;
  let sum = 0;
  let maxLength = 0;

  // Manually control right pointer
  while (right < nums.length) {
	  sum += nums[right];

	  // Manually control left pointer
	  while (sum > target) {
		  sum -= nums[left];
		  left++;
	  }

	  maxLength = Math.max(maxLength, right - left + 1);
	  right++;  // ← YOU manually increment
  }

  return maxLength;
}
  ```


## When Would You Control Both Manually?

### When right doesn't always increment:

```ts
  // Example: Skip elements under certain conditions
function smartWindow(nums: number[]): number {
  let left = 0;
  let right = 0;

  while (right < nums.length) {
	  if (nums[right] < 0) {
		  right++;  // Skip negative numbers
		  continue;
	  }

	  // Process window
	  // ...

	  right++;
  }
}
  ```

### Two Pointers (not sliding window):

```ts
// Two Sum on sorted array - pointers move toward each other
function twoSum(nums: number[], target: number): number[] {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
	  const sum = nums[left] + nums[right];

	  if (sum === target) return [left, right];
	  else if (sum < target) left++;      // Move left up
	  else right--;                        // Move right down
  }
}
```


### Complex conditions:

```ts
  // When you need fine-grained control
  function complexWindow(s: string): number {
      let left = 0;
      let right = 0;

      while (right < s.length) {
          // Maybe sometimes you want to move left multiple times
          // before moving right, or vice versa

          if (someComplexCondition) {
              left += 2;  // Jump left by 2
          } else if (anotherCondition) {
              right += 3;  // Jump right by 3
          } else {
              right++;
          }
      }
  }
```
