# Flexible Sliding Window - Mental Model

The flexible sliding window pattern always follows: **expand → shrink → track**. For each iteration, add `nums[right]` to the window first (expand), then use a `while` loop to adjust `left` (shrink), then update your result. The right pointer always moves forward greedily via the for-loop, while the left pointer only moves when needed via the while-loop.

The key decision is: when do you shrink, and where do you track?

For **LONGEST** valid windows, shrink while **INVALID** (`while (sum > target)`), which means the window is guaranteed valid after exiting the while loop - so track your maximum **outside** the while (`maxLength = Math.max(maxLength, right - left + 1)`).

For **SHORTEST** valid windows, shrink while **VALID** (`while (sum >= target)`), which means you need to track your minimum **inside** the while loop before shrinking too much (`minLength = Math.min(minLength, right - left + 1)`). The pattern is identical (expand first, then shrink), but the shrink condition flips (invalid vs valid) and the tracking position flips (outside vs inside).
