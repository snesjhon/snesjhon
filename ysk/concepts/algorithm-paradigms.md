---
description: 
---

# Algorithm Paradigms

#patterns/algorithm-paradigms 

## The Main Algorithm Paradigms


| Paradigm            | Description                                |
| ------------------- | ------------------------------------------ |
| Brute Force         | Try all possibilities                      |
| Greedy              | Make best local choice at each step        |
| Divide & Conquer    | Split problem, solve parts, combine        |
| Dynamic Programming | Solve subproblems, cache results           |
| Backtracking        | Explore all paths, undo bad choices        |
| Recursion           | Solve problem in terms of smaller versions |

                      Algorithm Strategies
                             │
       ┌──────────┬──────────┼──────────┬──────────┐
       │          │          │          │          │
    Brute      Greedy      D&C        DP      Backtrack
    Force
       │          │          │          │          │
    O(n!)      O(n)      O(nlogn)   O(n²)      O(2ⁿ)
              usually    usually   usually    usually
  
## Key Distinction
  
- Greedy: Makes one choice, moves forward, never reconsiders
- Dynamic Programming: Considers multiple choices, stores all subproblem results
- Backtracking: Tries choices, undoes them if they don't work

Greedy is often the most efficient when it works, but it only works when the problem has optimal substructure and the greedy choice property (local optimum leads to global optimum)




