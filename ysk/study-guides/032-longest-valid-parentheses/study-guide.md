# Longest Valid Parentheses - Visual Guide

## Problem Statement

Given a string containing just `(` and `)`, find the length of the **longest valid (well-formed) parentheses substring**.

```
Input: "(()"     → Output: 2   (the valid substring is "()")
Input: ")()())" → Output: 4   (the valid substring is "()()")
Input: "()(("   → Output: 2   (the valid substring is "()")
```

**Key Insight**: We need the longest **contiguous** valid substring, not the total count of matched pairs.

---

## Understanding Validity

### What Makes Parentheses Valid?

```mermaid
graph TB
    subgraph "Valid Examples"
        V1["()"]
        V2["(())"]
        V3["()()"]
        V4["(()())"]
    end

    subgraph "Invalid Examples"
        I1[")("]
        I2["(()"]
        I3["())"]
        I4["(()("]
    end

    style V1 fill:#90EE90
    style V2 fill:#90EE90
    style V3 fill:#90EE90
    style V4 fill:#90EE90
    style I1 fill:#ff9999
    style I2 fill:#ff9999
    style I3 fill:#ff9999
    style I4 fill:#ff9999
```

**Rules:**
- Every `)` must have a matching `(` before it
- Every `(` must have a matching `)` after it
- Parentheses must be properly nested

---

## The Stack Approach (Index-Based)

### Core Idea

Instead of storing characters, we store **indices**. This lets us calculate lengths!

```mermaid
graph LR
    A[Push -1 as base] --> B["See '('?"]
    B --> C[Push index]
    C --> D["See ')'?"]
    D --> E[Pop stack]
    E --> F{Stack empty?}
    F -->|Yes| G[Push current index]
    F -->|No| H[Length = i - stack.top]
    G --> B
    H --> I[Update max]
    I --> B

    style A fill:#e6f3ff
    style H fill:#90EE90
    style I fill:#ffeb99
```

### Why Start with -1?

```mermaid
graph TB
    subgraph "Without -1"
        W1["Stack: []"]
        W2["Input: '()'"]
        W3["Push 0, stack: [0]"]
        W4["Pop, stack: [] (empty!)"]
        W5["Can't calculate length"]
    end

    subgraph "With -1"
        C1["Stack: [-1]"]
        C2["Input: '()'"]
        C3["Push 0, stack: [-1, 0]"]
        C4["Pop, stack: [-1]"]
        C5["Length = 1 - (-1) = 2 ✓"]
    end

    style W5 fill:#ff9999
    style C5 fill:#90EE90
```

**The -1 serves as the "base" for length calculation.**

---

## Step-by-Step Visual Example

Let's trace: `"()(()"`

### Initial State

```mermaid
graph LR
    subgraph Input
        I["( ) ( ( )"]
        P["0 1 2 3 4"]
    end

    subgraph Stack
        S["[-1]"]
    end

    subgraph Variables
        V["max = 0"]
    end

    style S fill:#e6f3ff
```

---

### Step 0: i=0, char='('

**Action**: Push index 0

```mermaid
graph TB
    subgraph "Before"
        B["Stack: [-1]"]
    end

    subgraph "After"
        A["Stack: [-1, 0]"]
    end

    Before --> |"Push 0"| After

    subgraph "Scanning"
        C["( ) ( ( )<br/>↑<br/>i=0"]
    end

    style B fill:#e6f3ff
    style A fill:#FFD700
```

**Stack**: `[-1, 0]` | **max**: `0`

---

### Step 1: i=1, char=')'

**Action**: Pop, then calculate length

```mermaid
graph TB
    subgraph "Step 1: Pop"
        P1["Stack: [-1, 0]"]
        P2["Pop → Stack: [-1]"]
    end

    subgraph "Step 2: Calculate"
        C1["Stack not empty!"]
        C2["Length = i - stack.top()"]
        C3["Length = 1 - (-1) = 2"]
    end

    subgraph "Step 3: Update"
        U["max = Math.max(0, 2) = 2"]
    end

    P1 --> P2 --> C1 --> C2 --> C3 --> U

    style P2 fill:#ffeb99
    style C3 fill:#90EE90
    style U fill:#99ff99
```

**Stack**: `[-1]` | **max**: `2`

**Key Insight**: We found a valid pair `()` of length 2!

---

### Step 2: i=2, char='('

**Action**: Push index 2

```mermaid
graph LR
    subgraph Stack
        S["[-1, 2]"]
    end

    subgraph "Scanning"
        C["( ) ( ( )<br/>    ↑<br/>    i=2"]
    end

    style S fill:#FFD700
```

**Stack**: `[-1, 2]` | **max**: `2`

---

### Step 3: i=3, char='('

**Action**: Push index 3

```mermaid
graph LR
    subgraph Stack
        S["[-1, 2, 3]"]
    end

    subgraph "Scanning"
        C["( ) ( ( )<br/>      ↑<br/>      i=3"]
    end

    style S fill:#FFD700
```

**Stack**: `[-1, 2, 3]` | **max**: `2`

---

### Step 4: i=4, char=')'

**Action**: Pop, then calculate length

```mermaid
graph TB
    subgraph "Step 1: Pop"
        P1["Stack: [-1, 2, 3]"]
        P2["Pop → Stack: [-1, 2]"]
    end

    subgraph "Step 2: Calculate"
        C1["Stack not empty!"]
        C2["Length = i - stack.top()"]
        C3["Length = 4 - 2 = 2"]
    end

    subgraph "Step 3: Update"
        U["max = Math.max(2, 2) = 2"]
    end

    P1 --> P2 --> C1 --> C2 --> C3 --> U

    style C3 fill:#90EE90
```

**Stack**: `[-1, 2]` | **max**: `2`

---

### Final Result

```mermaid
graph LR
    subgraph "Final Stack"
        S["[-1, 2]"]
    end

    subgraph "Result"
        R["max = 2"]
    end

    subgraph "Valid Substrings Found"
        V1["'()' at index 0-1, length 2"]
        V2["'()' at index 3-4, length 2"]
    end

    style R fill:#99ff99,stroke:#333,stroke-width:3px
```

**Answer**: `2`

---

## Why Does the Length Formula Work?

### Understanding `i - stack.top()`

```mermaid
graph TB
    subgraph "After matching ')' at index i"
        A["stack.top() = last unmatched index"]
        B["i = current position"]
        C["Everything between them is valid!"]
    end

    subgraph "Example: ')()())'  at i=4"
        E1["Stack after pop: [0]"]
        E2["stack.top() = 0 (the ')' at start)"]
        E3["Length = 4 - 0 = 4"]
        E4["Valid substring: '()()'"]
    end

    A --> B --> C
    E1 --> E2 --> E3 --> E4

    style C fill:#90EE90
    style E4 fill:#99ff99
```

**The stack always contains indices of "boundaries" - unmatched characters that break validity.**

---

## Detailed Example: ")()())"

```mermaid
graph TB
    subgraph "Input"
        I[") ( ) ( ) )<br/>0 1 2 3 4 5"]
    end
```

### Trace Table

| i | char | Action | Stack After | Length Calc | max |
|---|------|--------|-------------|-------------|-----|
| - | init | push -1 | [-1] | - | 0 |
| 0 | ) | pop, empty→push 0 | [0] | - | 0 |
| 1 | ( | push 1 | [0, 1] | - | 0 |
| 2 | ) | pop, calc | [0] | 2-0=2 | 2 |
| 3 | ( | push 3 | [0, 3] | - | 2 |
| 4 | ) | pop, calc | [0] | 4-0=4 | **4** |
| 5 | ) | pop, empty→push 5 | [5] | - | 4 |

```mermaid
graph LR
    subgraph "Valid Substring"
        V[") (  )  (  )  )<br/>  ←——4——→<br/>  '()()'"]
    end

    style V fill:#90EE90
```

**Answer**: `4`

---

## The Key Insight: Stack as Boundary Tracker

```mermaid
graph TB
    subgraph "What the Stack Represents"
        S1["Stack stores indices of:"]
        S2["1.Unmatched '(' characters"]
        S3["2.')' that broke a valid sequence"]
        S4["3.The base (-1) for the start"]
    end

    subgraph "Why This Matters"
        W1["stack.top() = rightmost boundary"]
        W2["Everything after boundary<br/>to current position is valid"]
        W3["Length = i - stack.top()"]
    end

    S1 --> S2 --> S3 --> S4
    S4 --> W1 --> W2 --> W3

    style W3 fill:#90EE90
```

---

## Edge Cases

### Case 1: All Opening - "(((("

```mermaid
graph TB
    S1["i=0: push 0 → [-1,0]"]
    S2["i=1: push 1 → [-1,0,1]"]
    S3["i=2: push 2 → [-1,0,1,2]"]
    S4["i=3: push 3 → [-1,0,1,2,3]"]
    S5["Never calculate length"]
    S6["max = 0"]

    S1 --> S2 --> S3 --> S4 --> S5 --> S6

    style S6 fill:#ff9999
```

### Case 2: All Closing - "))))"

```mermaid
graph TB
    S1["i=0: pop, empty → push 0 → [0]"]
    S2["i=1: pop, empty → push 1 → [1]"]
    S3["i=2: pop, empty → push 2 → [2]"]
    S4["i=3: pop, empty → push 3 → [3]"]
    S5["Never stack.top() available for calc"]
    S6["max = 0"]

    S1 --> S2 --> S3 --> S4 --> S5 --> S6

    style S6 fill:#ff9999
```

### Case 3: Perfect Match - "(())"

```mermaid
graph TB
    S1["i=0: push 0 → [-1,0]"]
    S2["i=1: push 1 → [-1,0,1]"]
    S3["i=2: pop, calc 2-0=2 → [-1,0], max=2"]
    S4["i=3: pop, calc 3-(-1)=4 → [-1], max=4"]
    S5["max = 4"]

    S1 --> S2 --> S3 --> S4 --> S5

    style S5 fill:#90EE90
```

### Case 4: Consecutive Valid - "()()"

```mermaid
graph TB
    S1["i=0: push 0 → [-1,0]"]
    S2["i=1: pop, calc 1-(-1)=2 → [-1], max=2"]
    S3["i=2: push 2 → [-1,2]"]
    S4["i=3: pop, calc 3-(-1)=4 → [-1], max=4"]
    S5["max = 4"]

    S1 --> S2 --> S3 --> S4 --> S5

    style S4 fill:#ffeb99
    style S5 fill:#90EE90
```

**Key**: After popping at i=3, we reach back to -1, capturing BOTH pairs!

---

## Algorithm Decision Tree

```mermaid
flowchart TD
    Start(["Start: stack = [-1]"]) --> Loop{i < s.length?}

    Loop -->|Yes| Check{"s[i] type?"}

    Check -->|"("| Push["stack.push(i)"]
    Check -->|")"| Pop["stack.pop()"]

    Pop --> Empty{stack empty?}

    Empty -->|Yes| Base["stack.push(i)<br/>(new base)"]
    Empty -->|No| Calc["length = i - stack.top()<br/>max = Math.max(max, length)"]

    Push --> Inc["i++"]
    Base --> Inc
    Calc --> Inc
    Inc --> Loop

    Loop -->|No| Return["return max"]

    style Start fill:#e6f3ff
    style Calc fill:#90EE90
    style Return fill:#99ff99
```

---

## Common Mistakes

```mermaid
graph TD
    M1["❌ Forgetting to initialize with -1"] --> E1["Can't calculate length for valid pairs at start"]
    M2["❌ Using stack.length for empty check"] --> E2["Should check after pop, not before"]
    M3["❌ Counting pairs instead of length"] --> E3["Problem asks for LENGTH, not count"]
    M4["❌ Not handling ')' making stack empty"] --> E4["Need to push current index as new base"]

    style M1 fill:#ff6b6b,color:#fff
    style M2 fill:#ff6b6b,color:#fff
    style M3 fill:#ff6b6b,color:#fff
    style M4 fill:#ff6b6b,color:#fff
```

---

## Alternative Approach: Dynamic Programming

### DP Array Definition

`dp[i]` = length of longest valid parentheses **ending at index i**

```mermaid
graph TB
    subgraph "Key Insight"
        K1["Valid strings END with ')'"]
        K2["So dp[i] > 0 only when s[i] = ')'"]
    end

    subgraph "Two Cases for ')'"
        C1["Case 1: s[i-1] = '('<br/>Pattern: '...()'<br/>dp[i] = dp[i-2] + 2"]
        C2["Case 2: s[i-1] = ')'<br/>Pattern: '...))' <br/>Check if matching '(' exists"]
    end

    K1 --> K2 --> C1
    K2 --> C2

    style C1 fill:#87CEEB
    style C2 fill:#FFD700
```

### DP Transition Diagram

```mermaid
graph TB
    subgraph "Case 1: '()' pattern"
        A1["s = '...()'"]
        A2["    i-1 i"]
        A3["dp[i] = dp[i-2] + 2"]
        A4["Add 2 for this pair"]
        A5["Plus any valid before it"]
    end

    subgraph "Case 2: '))' pattern"
        B1["s = '...X...))' "]
        B2["       j    i"]
        B3["j = i - dp[i-1] - 1"]
        B4["If s[j] = '(' → match!"]
        B5["dp[i] = dp[i-1] + 2 + dp[j-1]"]
    end

    A1 --> A2 --> A3 --> A4 --> A5
    B1 --> B2 --> B3 --> B4 --> B5

    style A3 fill:#90EE90
    style B5 fill:#90EE90
```

---

## Alternative Approach: Two-Pass Counter

### The Elegant O(1) Space Solution

```mermaid
graph TB
    subgraph "Left-to-Right Pass"
        L1["Count '(' in left"]
        L2["Count ')' in right"]
        L3["If left == right → valid, update max"]
        L4["If right > left → reset both to 0"]
    end

    subgraph "Right-to-Left Pass"
        R1["Count ')' in right"]
        R2["Count '(' in left"]
        R3["If left == right → valid, update max"]
        R4["If left > right → reset both to 0"]
    end

    subgraph "Why Two Passes?"
        W1["Left pass misses: '(()'"]
        W2["Right pass catches it!"]
    end

    L1 --> L2 --> L3 --> L4
    R1 --> R2 --> R3 --> R4
    L4 --> W1 --> W2

    style L3 fill:#90EE90
    style R3 fill:#90EE90
```

### Example: "(())"

**Left-to-Right:**
```
i=0 '(': left=1, right=0
i=1 '(': left=2, right=0
i=2 ')': left=2, right=1
i=3 ')': left=2, right=2 → max = 4!
```

### Example: "(()" (Left pass misses!)

**Left-to-Right:**
```
i=0 '(': left=1, right=0
i=1 '(': left=2, right=0
i=2 ')': left=2, right=1
End: left ≠ right, never recorded
```

**Right-to-Left:**
```
i=2 ')': right=1, left=0
i=1 '(': right=1, left=1 → max = 2!
i=0 '(': right=1, left=2 → reset
```

---

## Complexity Comparison

| Approach | Time | Space | Difficulty |
|----------|------|-------|------------|
| Stack | O(n) | O(n) | Medium |
| DP | O(n) | O(n) | Hard |
| Two-Pass | O(n) | O(1) | Medium |

```mermaid
graph LR
    subgraph "Recommendation"
        R["Stack approach is most intuitive<br/>Two-pass for interviews (O(1) space)<br/>DP for learning purposes"]
    end

    style R fill:#e6f3ff
```

---

## Summary

```mermaid
flowchart TD
    P["Problem: Longest Valid Parentheses"]

    P --> S1["Stack Approach"]
    P --> S2["DP Approach"]
    P --> S3["Two-Pass Approach"]

    S1 --> K1["Track indices<br/>-1 as base<br/>Length = i - stack.top()"]
    S2 --> K2["dp[i] = valid length ending at i<br/>Two cases for ')'"]
    S3 --> K3["Count left/right<br/>Two directions<br/>O(1) space"]

    style K1 fill:#87CEEB
    style K2 fill:#FFD700
    style K3 fill:#90EE90
```

---

## Try It Yourself

Practice with: `"(()()"`

<details>
<summary>Click to see solution</summary>

**Using Stack:**
```
init: stack = [-1], max = 0
i=0 '(': push 0 → [-1, 0]
i=1 '(': push 1 → [-1, 0, 1]
i=2 ')': pop → [-1, 0], len = 2-0 = 2, max = 2
i=3 '(': push 3 → [-1, 0, 3]
i=4 ')': pop → [-1, 0], len = 4-0 = 4, max = 4

Answer: 4
```

```mermaid
graph LR
    V["( ( ) ( )<br/>  ←—4—→<br/>'()()'"]

    style V fill:#90EE90
```

</details>