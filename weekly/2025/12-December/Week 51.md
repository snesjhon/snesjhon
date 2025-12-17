# 2025-12-17

## Moving faster

As I'm moving through these algorithms I feel like I'm moving faster

Yesterday I learned about [longest substring](https://algo.monster/problems/longest_substring_without_repeating_characters) 

---
# 2025-12-15

## Sliding Windows


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
