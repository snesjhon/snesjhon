# Peak of mountain array

A mountain array is defined as an array that

- has at least 3 elements
- has an element with the largest value called "peak", with index `k`. The array elements strictly increase from the first element to `A[k]`, and then strictly decrease from `A[k + 1]` to the last element of the array. Thus creating a "mountain" of numbers.

That is, given `A[0]<...<A[k-1]<A[k]>A[k+1]>...>A[n-1]`, we need to find the index `k`. Note that the peak element is neither the first nor the lastIndex of the array.

Find the index of the peak element. Assume there is only one peak element.

Input: `0 1 2 3 2 1 0`

Output: `3`

Explanation: The largest element is 3, and its index is 3.

---
## Observations
- This is a [[monotonic]] problem because either the mountain increasing towards its peak or it's decreasing after its peak
- Thus we can look at this problem from a [[binary-search]] perspective, since it can be looked at and divided by a `T vs F` scenario

## Mental Model




---
> [!tip]- Solution
> ```typescript
> function peakIndexInMountainArray(arr: number[]): number {
>   let left = 0;
>   let right = arr.length - 1;
> 
>   // the comparison we want to make is
>   //
>   //  first iteration
>   // [0,1,2,2,3,4,2,1,0]
>   //  0,1,2,3,4,5,6,7,8
>   //
>   //  iteration 1:
>   //
>   //  left idx = 0, right idx = 8, mid idx = 4
>   //  arr[4] = 3, arr[5] = 4
>   //  3 > 4 ? false => still ascending, so bring left to (mid idx + 1)
>   //
>   // [_,_,_,_,_,4,2,1,0]
>   //  0,1,2,3,4,5,6,7,8
>   //
>   //  iteration 2:
>   //  left idx = 5, right idx = 8, mid idx = 6
>   //  arr[6] = 2, arr[7] = 1
>   //  2 > 1 ? true => we're descending now, so bring right to (mid) // we bring it to mid as we don't know if it's the peak or not
>   //
>   // [_,_,_,_,_,4,2,_,_]
>   //  0,1,2,3,4,5,6,7,8
>   //
>   //  iteration 3:
>   //  left idx = 5, right idx = 6, mid idx = 5
>   //  arr[5] = 4, arr[6] = 2
>   //  4 > 2 ? true => we're descending now, so bring right to (mid) // we bring it to mid as we don't know if it's the peak or not
>   //
>   //  -- bringing the right to mid aka 5 would take us out of our loop
>   //
>   while (left < right) {
>     const midIndex = Math.floor((left + right) / 2);
>     const midpoint = arr[midIndex];
>     const midpointRight = arr[midIndex + 1];
> 
>     if (midpointRight > midpoint) {
>       left = midIndex + 1;
>     } else {
>       right = midIndex;
>     }
>   }
> 
>   // we can return left or right, because the key is that
>   // `left AND right` converge to the peak's index
>   return left;
> }
> 
> ```




