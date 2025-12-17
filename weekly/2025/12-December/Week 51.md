## Wed, Dec 17

### Moving faster

As I'm moving through these algorithms I feel like I'm moving faster

Yesterday I learned about [longest substring](https://algo.monster/problems/longest_substring_without_repeating_characters) , well again I suppose, but the idea stuck a bit more since I haven't thought about deeply about the two pointers. 

So now, with that in mind I can think not only about the [flexible size sliding window](https://algo.monster/problems/subarray_sum_longest) I think what tripped me up is the idea that we were "moving" the window WITHIN a for loop, which then became clearer once I realized it was part of the [[sliding-window-patterns#Flexible Size - for loop (Right auto-increments, left manual)]]  patterns

###  Flexible Sliding Window - Mental Model

#concept/sliding-window 

The flexible sliding window pattern always follows: **expand → shrink → track**. For each iteration, add `nums[right]` to the window first (expand), then use a `while` loop to adjust `left` (shrink), then update your result. The right pointer always moves forward greedily via the for-loop, while the left pointer only moves when needed via the while-loop.

The key decision is: when do you shrink, and where do you track?

For **LONGEST** valid windows, shrink while **INVALID** (`while (sum > target)`), which means the window is guaranteed valid after exiting the while loop - so track your maximum **outside** the while (`maxLength = Math.max(maxLength, right - left + 1)`).

For **SHORTEST** valid windows, shrink while **VALID** (`while (sum >= target)`), which means you need to track your minimum **inside** the while loop before shrinking too much (`minLength = Math.min(minLength, right - left + 1)`). The pattern is identical (expand first, then shrink), but the shrink condition flips (invalid vs valid) and the tracking position flips (outside vs inside).

>[!Note]
>ALWAYS EXPAND FIRST AND THEN SHRINK



---
## Tuesday, Dev 16

### Sliding Windows


```mermaid
flowchart TD
      Start([Start]) --> BuildTarget[Build targetMap from 'check'<br/>Count frequency of each char]
      BuildTarget --> InitVars[Initialize matchingChars = 0<br/>windowMap = empty]
      InitVars --> BuildWindow[Build initial window<br/>For first k characters]
      BuildWindow --> UpdateInitial[For each char: updateCharCount+1<br/>Track matchingChars]
      UpdateInitial --> CheckFirst{matchingChars ==<br/>targetMap.size?}
      CheckFirst -->|Yes| AddFirst[Add index 0 to output]
      CheckFirst -->|No| SkipFirst[Skip]
      AddFirst --> StartSlide[Start sliding from index k]
      SkipFirst --> StartSlide
      StartSlide --> MoreChars{More characters<br/>to process?}
      MoreChars -->|Yes| GetChars[Get newChar at i<br/>Get oldChar at i-k]
      GetChars --> AddNew[updateCharCount newChar, +1<br/>matchingChars += result]
      AddNew --> RemoveOld[updateCharCount oldChar, -1<br/>matchingChars += result]
      RemoveOld --> CheckMatch{matchingChars ==<br/>targetMap.size?}
      CheckMatch -->|Yes| AddIndex[Add i-k+1 to output]
      CheckMatch -->|No| SkipIndex[Skip]
      AddIndex --> NextChar[Move to next character]
      SkipIndex --> NextChar
      NextChar --> MoreChars
      MoreChars -->|No| Return([Return output array])

	
```
