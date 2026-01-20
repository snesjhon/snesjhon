# Generate Parentheses - Study Guide

#leetcode/22 #pattern/backtracking #pattern/recursion

**LeetCode**: [22. Generate Parentheses](https://leetcode.com/problems/generate-parentheses/)
**Difficulty**: Medium
**Pattern**: Backtracking, Tree Recursion with Constraints

---

## The Problem

Generate all valid combinations of `n` pairs of parentheses.

```
Input: n = 2
Output: ["(())", "()()"]

Input: n = 3
Output: ["((()))", "(()())", "(())()", "()(())", "()()()"]
```

---

## Understanding "Valid"

Before solving, we need to understand what makes parentheses valid:

```mermaid
graph LR
    subgraph "Valid Parentheses"
        V1["'()'"]
        V2["'(())'"]
        V3["'()()'"]
    end

    subgraph "Invalid Parentheses"
        I1["')(' - closes before opens"]
        I2["'(((' - not balanced"]
        I3["'())' - too many closes"]
    end

    style V1 fill:#90EE90
    style V2 fill:#90EE90
    style V3 fill:#90EE90
    style I1 fill:#ff6b6b,color:#fff
    style I2 fill:#ff6b6b,color:#fff
    style I3 fill:#ff6b6b,color:#fff
```

**Key insight**: A string is valid if:
1. Every `)` has a matching `(` before it
2. Total `(` count equals total `)` count

---

## The Brute Force Approach (Why It's Wasteful)

Your first thought might be: "Generate all possible strings of length 2n using `(` and `)`, then filter valid ones."

### Where Does 2^(2n) Come From?

Think of it position by position. For `n=2`, we need strings of length 4:

```
Position:    1    2    3    4
Choices:    ( )  ( )  ( )  ( )
            ↓    ↓    ↓    ↓
            2  × 2  × 2  × 2  = 2^4 = 16 possible strings
```

```mermaid
graph TD
    subgraph "Building ALL strings for n=2 (length 4)"
        P1["Position 1<br/>2 choices: ( or )"]
        P2["Position 2<br/>2 choices: ( or )"]
        P3["Position 3<br/>2 choices: ( or )"]
        P4["Position 4<br/>2 choices: ( or )"]
        Total["Total: 2×2×2×2 = 16 strings"]
    end

    P1 --> P2 --> P3 --> P4 --> Total

    style Total fill:#FFD700
```

### Brute Force Code

```typescript
// BRUTE FORCE: Generate ALL possible strings, then filter
function bruteForceParentheses(n: number): string[] {
  const length = 2 * n;  // For n=2, length=4
  const allStrings: string[] = [];

  // Generate every possible combination
  function generate(current: string) {
    // Base case: string is complete
    if (current.length === length) {
      allStrings.push(current);
      return;
    }

    // NO constraints - try BOTH choices at every position
    generate(current + '(');  // add open
    generate(current + ')');  // add close
  }

  generate('');

  // NOW filter for valid ones
  return allStrings.filter(isValid);
}

function isValid(s: string): boolean {
  let balance = 0;
  for (const char of s) {
    if (char === '(') balance++;
    else balance--;
    if (balance < 0) return false;  // too many closes
  }
  return balance === 0;  // must be balanced
}
```

### All 16 Strings Generated for n=2

Here's every string the brute force generates:

```
String      Valid?   Why Invalid?
──────────────────────────────────
((((        ✗        Not balanced (4 opens, 0 closes)
((()        ✗        Not balanced (3 opens, 1 close)
(()(        ✗        Not balanced
(())        ✓        VALID!
()((        ✗        Not balanced
()()        ✓        VALID!
())(        ✗        Close before open at position 3
()))        ✗        Too many closes
)(((        ✗        Starts with close (no open to match)
)(()        ✗        Starts with close
)()(        ✗        Starts with close
)())        ✗        Starts with close
))((        ✗        Starts with close
))()        ✗        Starts with close
)))(        ✗        Starts with close
))))        ✗        All closes, no opens
──────────────────────────────────
Total: 16 strings, only 2 valid!
```

### Visualizing the Brute Force Tree

```mermaid
graph TD
    Root["''"]

    Root -->|"("| L1["("]
    Root -->|")"| R1[")"]

    L1 -->|"("| L2["(("]
    L1 -->|")"| R2["()"]

    R1 -->|"("| L3[")("]
    R1 -->|")"| R3["))"]

    L2 -->|"("| A["((("]
    L2 -->|")"| B["(()"]

    R2 -->|"("| C["()("]
    R2 -->|")"| D["())"]

    L3 -->|"("| E[")(("]
    L3 -->|")"| F[")()"]

    R3 -->|"("| G["))("]
    R3 -->|")"| H[")))"]

    style R1 fill:#ff6b6b,color:#fff
    style L3 fill:#ff6b6b,color:#fff
    style R3 fill:#ff6b6b,color:#fff
    style E fill:#ff6b6b,color:#fff
    style F fill:#ff6b6b,color:#fff
    style G fill:#ff6b6b,color:#fff
    style H fill:#ff6b6b,color:#fff
    style D fill:#ff6b6b,color:#fff
```

**Notice**: The entire right side of the tree (starting with `)`) is invalid! We're wasting time exploring paths that can **never** lead to valid results.

### The Problem with Brute Force

```mermaid
graph TD
    subgraph "Brute Force Waste"
        Gen["Generate 2^(2n) strings"]
        Check["Check each one"]
        Keep["Keep valid ones"]

        N2["n=2: Generate 16, keep 2"]
        N3["n=3: Generate 64, keep 5"]
        N5["n=5: Generate 1024, keep 42"]
        N10["n=10: Generate 1,048,576, keep 16,796"]
    end

    Gen --> Check --> Keep
    Keep --> N2
    Keep --> N3
    Keep --> N5
    Keep --> N10

    style N10 fill:#ff6b6b,color:#fff
```

**The ratio of valid to total gets worse as n grows!**

---

## The Key Insight: Build Validity As You Go

Instead of generating everything and filtering, **stop invalid paths before they start**:

```mermaid
graph TD
    subgraph "Smart Approach"
        A["Start with empty string"]
        B["At each step, only add<br/>characters that KEEP it valid"]
        C["When done, it's guaranteed valid"]
    end

    A --> B --> C

    style B fill:#FFD700
    style C fill:#90EE90
```

Compare the two trees:

```mermaid
graph LR
    subgraph "Brute Force Tree"
        BF["Full binary tree<br/>All 2^(2n) nodes explored"]
    end

    subgraph "Smart Tree"
        SM["Pruned tree<br/>Only valid paths explored"]
    end

    BF -->|"Much bigger"| Compare["16 vs 6 nodes for n=2"]
    SM -->|"Much smaller"| Compare

    style BF fill:#ff6b6b,color:#fff
    style SM fill:#90EE90
```

**This is the mental shift**: Don't generate everything and filter. **Prune invalid branches before exploring them.**

---

## Applying the Three Questions Framework

Let's use our recursion framework to think through this problem:

```mermaid
graph TD
    Q1["1. BASE CASE<br/>When is the string complete?"]
    Q2["2. RECURSIVE CASE<br/>What can I add next?"]
    Q3["3. COMBINATION<br/>How do I collect all results?"]

    Q1 --> Q2 --> Q3

    style Q1 fill:#FFB6C1
    style Q2 fill:#87CEEB
    style Q3 fill:#90EE90
```

**Question 1: Base Case**
- When is a parentheses string "complete"?
- Answer: When we've placed exactly `n` opens and `n` closes
- That means: `current.length === 2 * n`

**Question 2: Recursive Case (The Hard Part)**
- At each step, what are my choices?
- Can I always add `(`? Can I always add `)`?
- This requires deeper analysis...

**Question 3: Combination**
- We're collecting ALL valid strings
- Use an accumulator array to gather results

---

## Breaking Down the Recursive Case

This is where the problem gets interesting. At each position, you might think you have 2 choices:

```mermaid
graph TD
    Current["Current string: '('"]

    Current -->|"add '('"| Choice1["'(('"]
    Current -->|"add ')'"| Choice2["'()'"]

    style Choice1 fill:#87CEEB
    style Choice2 fill:#87CEEB
```

But the choices are **constrained**. Let's figure out the rules.

### Rule 1: When Can I Add `(`?

Think about it: when would adding `(` make the string invalid?

```mermaid
graph TD
    subgraph "Adding '(' - When is it OK?"
        Q["Have I used all my '(' already?"]
        Q -->|"No, still have some"| OK["✓ Can add '('"]
        Q -->|"Yes, used all n"| NO["✗ Cannot add '('"]
    end

    style OK fill:#90EE90
    style NO fill:#ff6b6b,color:#fff
```

**Rule**: Can add `(` if `openCount < n`

### Rule 2: When Can I Add `)`?

This is trickier. When would adding `)` make the string invalid?

```mermaid
graph TD
    subgraph "Adding ')' - When is it OK?"
        Start["Current: '('"]

        Start -->|"add ')'"| R1["'()' - Valid!<br/>Had 1 open, now 1 close"]

        Start2["Current: ''"]
        Start2 -->|"add ')'"| R2["')' - INVALID!<br/>Had 0 opens, can't close"]

        Start3["Current: '()'"]
        Start3 -->|"add ')'"| R3["'())' - INVALID!<br/>More closes than opens"]
    end

    style R1 fill:#90EE90
    style R2 fill:#ff6b6b,color:#fff
    style R3 fill:#ff6b6b,color:#fff
```

**The pattern**: Adding `)` is only valid if there's an unmatched `(` to close.

**Rule**: Can add `)` if `closeCount < openCount`

---

## Visualizing the Rules Together

```mermaid
graph TD
    subgraph "Decision at Each Step (n=2)"
        State["Current State"]

        Check1{"openCount < n?"}
        Check2{"closeCount < openCount?"}

        AddOpen["Add '('<br/>openCount++"]
        AddClose["Add ')'<br/>closeCount++"]

        State --> Check1
        State --> Check2

        Check1 -->|"Yes"| AddOpen
        Check1 -->|"No"| Skip1["Can't add '('"]

        Check2 -->|"Yes"| AddClose
        Check2 -->|"No"| Skip2["Can't add ')'"]
    end

    style AddOpen fill:#87CEEB
    style AddClose fill:#FFD700
    style Skip1 fill:#ff6b6b,color:#fff
    style Skip2 fill:#ff6b6b,color:#fff
```

### Why Track `openCount` and `closeCount`?

We need to know:
- How many `(` we've used → `openCount`
- How many `)` we've used → `closeCount`

These two numbers tell us **everything** about validity:

| State | openCount | closeCount | Can add `(`? | Can add `)`? |
|-------|-----------|------------|--------------|--------------|
| `''` | 0 | 0 | Yes (0 < 2) | No (0 < 0 is false) |
| `'('` | 1 | 0 | Yes (1 < 2) | Yes (0 < 1) |
| `'(('` | 2 | 0 | No (2 < 2 is false) | Yes (0 < 2) |
| `'()'` | 1 | 1 | Yes (1 < 2) | No (1 < 1 is false) |
| `'(()'` | 2 | 1 | No | Yes (1 < 2) |
| `'(())'` | 2 | 2 | No | No → DONE! |

---

## The Complete Decision Tree for n=2

Now let's trace through every possible path:

```mermaid
graph TD
    A["''<br/>open=0, close=0<br/>Can: ( only"]

    A -->|"add ("| B["'('<br/>open=1, close=0<br/>Can: ( or )"]

    B -->|"add ("| C["'(('<br/>open=2, close=0<br/>Can: ) only"]
    B -->|"add )"| D["'()'<br/>open=1, close=1<br/>Can: ( only"]

    C -->|"add )"| E["'(()'<br/>open=2, close=1<br/>Can: ) only"]

    E -->|"add )"| F["'(())'<br/>open=2, close=2<br/>COMPLETE ✓"]

    D -->|"add ("| G["'()('<br/>open=2, close=1<br/>Can: ) only"]

    G -->|"add )"| H["'()()'<br/>open=2, close=2<br/>COMPLETE ✓"]

    style A fill:#e6f3ff
    style F fill:#90EE90,stroke:#333,stroke-width:3px
    style H fill:#90EE90,stroke:#333,stroke-width:3px
```

**Notice**: Every path leads to a valid result! That's because we **only took valid steps**.

---

## Tracing Through: What Happens at Each Node

Let's walk through one path in detail:

```mermaid
sequenceDiagram
    participant S as State
    participant R as Rules

    Note over S: current='', open=0, close=0

    S->>R: Can I add '('?
    R-->>S: Yes! open(0) < n(2)

    S->>R: Can I add ')'?
    R-->>S: No! close(0) < open(0) is FALSE

    Note over S: Only choice: add '('
    Note over S: current='(', open=1, close=0

    S->>R: Can I add '('?
    R-->>S: Yes! open(1) < n(2)

    S->>R: Can I add ')'?
    R-->>S: Yes! close(0) < open(1)

    Note over S: TWO choices! Branch here.
    Note over S: Path A: add '(' → '(('
    Note over S: Path B: add ')' → '()'
```

### The Branching Visualized

```mermaid
graph TD
    subgraph "The Key Branching Point"
        Before["'('<br/>open=1, close=0"]

        Before -->|"CHOICE A: add '('"| PathA["'(('<br/>Leads to '(())'"]
        Before -->|"CHOICE B: add ')'"| PathB["'()'<br/>Leads to '()()'"]
    end

    style Before fill:#FFD700,stroke:#333,stroke-width:2px
    style PathA fill:#87CEEB
    style PathB fill:#87CEEB
```

This branching is where recursion shines—we explore BOTH paths, and each eventually reaches a valid result.

---

## Connecting to Recursion Patterns

This problem uses multiple patterns from [[recursion-thinking]]:

```mermaid
graph TD
    subgraph "This is Tree Recursion + Backtracking"
        T1["Multiple choices at each step<br/>→ Tree Recursion"]
        T2["Choices are constrained<br/>→ Pruning (skip invalid)"]
        T3["Collect all valid results<br/>→ Accumulator pattern"]
    end

    T1 --> T2 --> T3

    style T1 fill:#87CEEB
    style T2 fill:#FFD700
    style T3 fill:#90EE90
```

### The Leap of Faith Applied

Remember the leap of faith? Here's how it applies:

> "Assume that `backtrack(current + '(', open + 1, close)` correctly generates all valid completions starting with `current + '('`. I don't need to trace through it—I trust it works."

```mermaid
graph TD
    subgraph "Leap of Faith in Generate Parentheses"
        Current["I'm at '('<br/>open=1, close=0"]

        Trust1["TRUST: backtrack('((', 2, 0)<br/>will find all valid strings<br/>starting with '(('"]

        Trust2["TRUST: backtrack('()', 1, 1)<br/>will find all valid strings<br/>starting with '()'"]

        Current --> Trust1
        Current --> Trust2

        Result["Together, they find<br/>ALL valid strings starting with '('"]
    end

    Trust1 --> Result
    Trust2 --> Result

    style Trust1 fill:#FFD700
    style Trust2 fill:#FFD700
    style Result fill:#90EE90
```

---

## The Complete Mental Process

Here's how to think through this problem from scratch:

```mermaid
flowchart TD
    Start["See: Generate all valid parentheses"]

    Start --> Q1["Q: What makes parentheses valid?"]
    Q1 --> A1["A: Every ) has a matching ( before it"]

    A1 --> Q2["Q: How do I ensure this while building?"]
    Q2 --> A2["A: Track opens and closes used so far"]

    A2 --> Q3["Q: When can I add '('?"]
    Q3 --> A3["A: When I haven't used all n of them"]

    A3 --> Q4["Q: When can I add ')'?"]
    Q4 --> A4["A: When there's an unmatched '(' to close<br/>(closeCount < openCount)"]

    A4 --> Q5["Q: When am I done?"]
    Q5 --> A5["A: When string length = 2n"]

    A5 --> Code["Now I can write the code!"]

    style Start fill:#e6f3ff
    style Code fill:#90EE90
```

---

## The Solution: Line by Line

```typescript
function generateParenthesis(n: number): string[] {
  const result: string[] = [];  // Accumulator for all valid strings

  // The recursive function
  // Parameters = the STATE at each step
  function backtrack(
    current: string,   // What we've built so far
    open: number,      // How many '(' we've used
    close: number      // How many ')' we've used
  ) {
    // BASE CASE: Is the string complete?
    // We need n opens and n closes, so length = 2n
    if (current.length === 2 * n) {
      result.push(current);  // Save this valid string!
      return;                // Stop this branch
    }

    // RECURSIVE CASE: What can we add next?

    // Choice 1: Try adding '('
    // Allowed if we haven't used all n opens
    if (open < n) {
      // Make the choice and recurse
      // Notice: we pass current + '(' (new string)
      // and open + 1 (one more open used)
      backtrack(current + '(', open + 1, close);
    }

    // Choice 2: Try adding ')'
    // Allowed if there's an unmatched '(' to close
    if (close < open) {
      backtrack(current + ')', open, close + 1);
    }

    // If neither condition is true, this branch is stuck
    // But that can't happen with our rules—we always
    // reach the base case!
  }

  // Start with empty string, 0 opens, 0 closes
  backtrack('', 0, 0);

  return result;
}
```

---

## Why No Explicit Backtracking/Undo?

You might notice we don't have a `current.pop()` or undo step. Why?

```mermaid
graph TD
    subgraph "String Immutability = Automatic Backtracking"
        A["current = '('"]

        A -->|"Pass current + '('"| B["Recursive call gets '(('<br/>original current unchanged!"]
        A -->|"Pass current + ')'"| C["Recursive call gets '()'<br/>original current unchanged!"]

        Note["Each branch gets a NEW string<br/>No mutation = no undo needed"]
    end

    style Note fill:#90EE90
```

With arrays (like in subsets), you mutate and undo:
```typescript
current.push(item);    // mutate
backtrack(current);
current.pop();         // undo
```

With strings (immutable), each call gets a fresh copy:
```typescript
backtrack(current + '(', ...);  // new string created
backtrack(current + ')', ...);  // another new string
```

---

## Complete Trace for n=2

Here's every recursive call that happens:

```
backtrack('', 0, 0)
├── backtrack('(', 1, 0)
│   ├── backtrack('((', 2, 0)
│   │   └── backtrack('(()', 2, 1)
│   │       └── backtrack('(())', 2, 2) → SAVE '(())'
│   └── backtrack('()', 1, 1)
│       └── backtrack('()(', 2, 1)
│           └── backtrack('()()', 2, 2) → SAVE '()()'
```

```mermaid
graph TD
    subgraph "Call Tree for n=2"
        C1["backtrack('', 0, 0)"]
        C2["backtrack('(', 1, 0)"]
        C3["backtrack('((', 2, 0)"]
        C4["backtrack('(()', 2, 1)"]
        C5["backtrack('(())', 2, 2)<br/>→ SAVE"]
        C6["backtrack('()', 1, 1)"]
        C7["backtrack('()(', 2, 1)"]
        C8["backtrack('()()', 2, 2)<br/>→ SAVE"]
    end

    C1 --> C2
    C2 --> C3
    C2 --> C6
    C3 --> C4
    C4 --> C5
    C6 --> C7
    C7 --> C8

    style C5 fill:#90EE90
    style C8 fill:#90EE90
```

---

## Common Confusions

### "Why `close < open` and not `close < n`?"

```mermaid
graph TD
    subgraph "Why close < open?"
        Wrong["close < n would allow:<br/>'(' → ')' → ')'<br/>= '())' INVALID!"]
        Right["close < open ensures:<br/>Every ) has a matching ( before it"]
    end

    style Wrong fill:#ff6b6b,color:#fff
    style Right fill:#90EE90
```

`close < n` only limits total closes. `close < open` ensures **balance**.

### "Why not check validity at the end?"

We could, but it's wasteful:

```mermaid
graph LR
    subgraph "Check at End"
        A1["Generate '((('"]
        A2["Generate '(()'"]
        A3["... all 2^6 = 64 strings"]
        A4["Check each one"]
    end

    subgraph "Check While Building"
        B1["Only valid paths explored"]
        B2["For n=3: only 5 results"]
        B3["Much less work!"]
    end

    style A4 fill:#ff6b6b,color:#fff
    style B3 fill:#90EE90
```

### "What if I forget a constraint?"

Let's see what happens if we forget `close < open`:

```mermaid
graph TD
    A["'' (start)"]
    A -->|"add )"| B["')' INVALID<br/>but we'd continue..."]
    B -->|"add )"| C["'))' INVALID"]
    B -->|"add ("| D["')(' INVALID"]

    style B fill:#ff6b6b,color:#fff
    style C fill:#ff6b6b,color:#fff
    style D fill:#ff6b6b,color:#fff
```

The constraint `close < open` **prevents us from ever entering invalid states**.

---

## Summary: The Mental Model

```mermaid
graph TD
    subgraph "Generate Parentheses Mental Model"
        M1["Start with empty string"]
        M2["At each step, ask:<br/>Can I add '('? Can I add ')'?"]
        M3["Add '(' if: open < n"]
        M4["Add ')' if: close < open"]
        M5["When length = 2n, save result"]
        M6["Recursion explores ALL valid paths"]
    end

    M1 --> M2
    M2 --> M3
    M2 --> M4
    M3 --> M5
    M4 --> M5
    M5 --> M6

    style M3 fill:#87CEEB
    style M4 fill:#FFD700
    style M6 fill:#90EE90
```

**Key Takeaways**:
1. **Build validity in**, don't filter it out
2. **Track state** (open count, close count) to know what's allowed
3. **Trust the recursion**—each branch explores its own path
4. **Constraints prune the tree**—we never explore invalid states

---

## Complexity Analysis

**Time Complexity**: O(4^n / √n) — This is the nth Catalan number
- Much better than brute force O(2^(2n))

**Space Complexity**: O(n)
- Recursion depth is at most 2n
- Each level stores constant space

---

## Related Problems

After mastering this, try:
- [[078-subsets]] - Similar tree recursion, simpler constraints
- [[046-permutations]] - Backtracking with different constraint type
- [[017-letter-combinations]] - Multiple choices at each position
- [[051-n-queens]] - Backtracking with complex validity checks
