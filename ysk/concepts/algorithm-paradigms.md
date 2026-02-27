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

## Directed Acyclic Graph (DAG)

A DAG is a graph with two constraints:

- **Directed** — every edge has a direction. If A → B, that does not mean B → A.
- **Acyclic** — no cycles. Following edges forward, I can never loop back to a node I've already visited.

DAGs come up whenever something has to happen *before* something else — course prerequisites, build steps, task scheduling. The structure enforces that order: because there are no cycles, there's always at least one node with nothing depending on it, which gives you a place to start.

Topological sort only works on DAGs. If a cycle exists, there's a circular dependency — A requires B, B requires A — and no valid ordering is possible.




