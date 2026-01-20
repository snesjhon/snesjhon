# Climbing Stairs - Visual Guide

## Understanding the Problem

### The Core Idea

You are climbing a staircase with `n` steps. Each time you can climb **1 or 2 steps**. Count the number of distinct ways to reach the top.

```mermaid
graph LR
    A["Step 0<br/>(Ground)"] --> B["Take 1 step"]
    A --> C["Take 2 steps"]
    B --> D["Continue..."]
    C --> D
    D --> E["Step n<br/>(Top)"]

    style A fill:#e6f3ff
    style E fill:#90EE90
```

### Staircase Visualization

```
    ┌───┐
    │ 5 │  ← Goal (n=5)
  ┌─┴───┤
  │  4  │
┌─┴─────┤
│   3   │
├───────┤
│   2   │
├───────┤
│   1   │
├───────┤
│   0   │  ← Start (ground)
└───────┘
```

---

## Key Insight: Think Backwards

**The Critical Question:** If I'm standing on step `n`, where could I have come from?

```mermaid
graph TB
    subgraph "To reach step n"
        StepN1["Step n-1<br/>(took 1 step)"]
        StepN2["Step n-2<br/>(took 2 steps)"]
        StepN["Step n<br/>total ways"]
    end

    StepN1 -->|"+1 step"| StepN
    StepN2 -->|"+2 steps"| StepN

    style StepN1 fill:#87CEEB
    style StepN2 fill:#FFD700
    style StepN fill:#90EE90
```

**Formula**: `ways(n) = ways(n-1) + ways(n-2)`

---

## Building the Sequence

### Count Distinct Ways

| n | All possible combinations | Count |
|---|---------------------------|-------|
| 1 | `(1)` | **1** |
| 2 | `(1+1)`, `(2)` | **2** |
| 3 | `(1+1+1)`, `(1+2)`, `(2+1)` | **3** |
| 4 | `(1+1+1+1)`, `(1+1+2)`, `(1+2+1)`, `(2+1+1)`, `(2+2)` | **5** |
| 5 | ... | **8** |

### The Pattern

```
1, 2, 3, 5, 8, 13, 21, ...
```

```mermaid
graph LR
    subgraph "The Fibonacci Pattern"
        N1["n=1<br/>1"]
        N2["n=2<br/>2"]
        N3["n=3<br/>3"]
        N4["n=4<br/>5"]
        N5["n=5<br/>8"]
    end

    N1 --> |"1+2=3"| N3
    N2 --> |"1+2=3"| N3
    N2 --> |"2+3=5"| N4
    N3 --> |"2+3=5"| N4
    N3 --> |"3+5=8"| N5
    N4 --> |"3+5=8"| N5

    style N1 fill:#e6f3ff
    style N2 fill:#e6f3ff
    style N3 fill:#87CEEB
    style N4 fill:#FFD700
    style N5 fill:#90EE90
```

Each count = **sum of the previous two counts**

---

## Why This Works

### The Logic

To reach step 5, I must have come from:
- **Step 4** (then took 1 step) — there are `ways(4)` ways to get to step 4
- **Step 3** (then took 2 steps) — there are `ways(3)` ways to get to step 3

Total ways to step 5 = `ways(4) + ways(3)` = 5 + 3 = **8**

```mermaid
graph TD
    subgraph "Reaching Step 5"
        S3["Step 3<br/>3 ways to get here"]
        S4["Step 4<br/>5 ways to get here"]
        S5["Step 5<br/>3 + 5 = 8 ways"]
    end

    S3 -->|"+2 steps<br/>(3 paths)"| S5
    S4 -->|"+1 step<br/>(5 paths)"| S5

    style S3 fill:#FFD700
    style S4 fill:#87CEEB
    style S5 fill:#90EE90,stroke:#333,stroke-width:3px
```

---

## Step-by-Step Example: n = 5

### Enumerate All 8 Paths

```mermaid
graph TD
    subgraph "All Paths to Step 5"
        P1["1+1+1+1+1"]
        P2["1+1+1+2"]
        P3["1+1+2+1"]
        P4["1+2+1+1"]
        P5["2+1+1+1"]
        P6["1+2+2"]
        P7["2+1+2"]
        P8["2+2+1"]
    end

    style P1 fill:#FFB6C1
    style P2 fill:#FFD700
    style P3 fill:#98FB98
    style P4 fill:#87CEEB
    style P5 fill:#DDA0DD
    style P6 fill:#F0E68C
    style P7 fill:#ADD8E6
    style P8 fill:#FFE4B5
```

### Build Up From Base Cases

```
ways(1) = 1
ways(2) = 2
ways(3) = ways(2) + ways(1) = 2 + 1 = 3
ways(4) = ways(3) + ways(2) = 3 + 2 = 5
ways(5) = ways(4) + ways(3) = 5 + 3 = 8 ✓
```

---

## Base Cases

### Why Stop at n ≤ 2?

```mermaid
graph TB
    subgraph "Base Cases"
        B1["n = 1<br/>Only way: (1)<br/>Return 1"]
        B2["n = 2<br/>Ways: (1+1), (2)<br/>Return 2"]
    end

    style B1 fill:#e6f3ff
    style B2 fill:#e6f3ff
```

These are **known answers**. You don't need to break them down further.

**Convenient shortcut:** For n ≤ 2, the answer equals n itself!
- `ways(1) = 1`
- `ways(2) = 2`

---

## The Recursion Tree Problem

### Without Memoization

```mermaid
graph TD
    subgraph "Calculating ways(5)"
        A["ways(5)"]
        B1["ways(4)"]
        B2["ways(3)"]
        C1["ways(3)"]
        C2["ways(2)"]
        C3["ways(2)"]
        C4["ways(1)"]
        D1["ways(2)"]
        D2["ways(1)"]
    end

    A --> B1
    A --> B2
    B1 --> C1
    B1 --> C2
    B2 --> C3
    B2 --> C4
    C1 --> D1
    C1 --> D2

    style C1 fill:#ff6b6b,color:#fff
    style B2 fill:#ff6b6b,color:#fff
```

**Problem**: `ways(3)` computed **twice**! For `ways(44)`, this explodes exponentially.

### The Fix: Memoization

Store results you've already computed. Before recursing, check if you already know the answer.

```mermaid
graph LR
    subgraph "With Memoization"
        Check["Check cache"]
        Hit["Cache hit?<br/>Return stored value"]
        Miss["Cache miss?<br/>Compute & store"]
    end

    Check --> Hit
    Check --> Miss

    style Hit fill:#90EE90
    style Miss fill:#FFD700
```

---

## Why Dynamic Programming Works

### Optimal Substructure

The solution to `ways(n)` depends entirely on solutions to smaller problems.

```mermaid
graph TD
    Main["ways(n)"]
    Sub1["ways(n-1)"]
    Sub2["ways(n-2)"]
    Sub3["ways(n-3)"]

    Main --> Sub1
    Main --> Sub2
    Sub1 --> Sub2
    Sub1 --> Sub3
    Sub2 --> Sub3

    style Main fill:#90EE90
    style Sub1 fill:#87CEEB
    style Sub2 fill:#FFD700
    style Sub3 fill:#FFB6C1
```

### Overlapping Subproblems

The same subproblems (`ways(3)`, `ways(2)`, etc.) are needed multiple times.

---

## Approach Comparison

```mermaid
graph TD
    subgraph "Solution Approaches"
        A["Naive Recursion<br/>O(2^n)<br/>Exponential"]
        B["Memoization<br/>O(n) time<br/>O(n) space"]
        C["Bottom-Up DP<br/>O(n) time<br/>O(n) space"]
        D["Space-Optimized<br/>O(n) time<br/>O(1) space"]
    end

    A --> |"Add cache"| B
    B --> |"Flip direction"| C
    C --> |"Only keep last 2"| D

    style A fill:#ff6b6b,color:#fff
    style B fill:#FFD700
    style C fill:#87CEEB
    style D fill:#90EE90,stroke:#333,stroke-width:3px
```

---

## Space Optimization Insight

### Why You Only Need Two Variables

To compute `ways(n)`, you only need:
- `ways(n-1)` — the previous value
- `ways(n-2)` — the value before that

```mermaid
graph LR
    subgraph "Rolling Variables"
        Prev2["prev2<br/>(n-2)"]
        Prev1["prev1<br/>(n-1)"]
        Curr["current<br/>(n)"]
    end

    Prev2 -->|"+"| Curr
    Prev1 -->|"+"| Curr

    style Prev2 fill:#FFD700
    style Prev1 fill:#87CEEB
    style Curr fill:#90EE90
```

After computing `current`:
- Shift: `prev2 = prev1`, `prev1 = current`
- Repeat

---

## Decision Tree

```mermaid
flowchart TD
    Start(["Problem Size?"]) --> Check{Large n?}

    Check -->|"No (small)"| Recursive["Naive Recursion<br/>Simple to understand"]
    Check -->|"Yes"| DP["Use DP"]

    DP --> Space{Memory constraint?}

    Space -->|"No"| Memo["Memoization<br/>Easy to write"]
    Space -->|"Yes"| Optimized["Two Variables<br/>O(1) space"]

    style Recursive fill:#FFB6C1
    style Memo fill:#87CEEB
    style Optimized fill:#90EE90,stroke:#333,stroke-width:3px
```

---

## Common Patterns to Remember

```mermaid
graph TB
    subgraph "Climbing Stairs Pattern"
        P1["Base cases: ways(1)=1, ways(2)=2"]
        P2["Recurrence: ways(n) = ways(n-1) + ways(n-2)"]
        P3["It's the Fibonacci sequence!"]
        P4["Optimize: only track last 2 values"]
    end

    P1 --> P2 --> P3 --> P4

    style P1 fill:#e6f3ff
    style P2 fill:#87CEEB
    style P3 fill:#FFD700
    style P4 fill:#90EE90
```

---

## Edge Cases

### n = 1

```mermaid
graph LR
    subgraph "Single Step"
        A["Ground"] --> B["Step 1<br/>1 way"]
    end

    style B fill:#90EE90
```

Only one way: take 1 step.

### n = 0 (if allowed)

One way to stay at ground: do nothing. Return 1.

---

## Try It Yourself

Calculate ways for n = 6.

<details>
<summary>Click to see solution</summary>

```
Build up from base cases:

ways(1) = 1
ways(2) = 2
ways(3) = 2 + 1 = 3
ways(4) = 3 + 2 = 5
ways(5) = 5 + 3 = 8
ways(6) = 8 + 5 = 13

Answer: 13 distinct ways
```

</details>

---

## Connection to Fibonacci

The Climbing Stairs problem **is** the Fibonacci sequence, just with different base cases:

| Fibonacci | Climbing Stairs |
|-----------|-----------------|
| F(0) = 0  | ways(1) = 1     |
| F(1) = 1  | ways(2) = 2     |
| F(2) = 1  | ways(3) = 3     |
| F(n) = F(n-1) + F(n-2) | ways(n) = ways(n-1) + ways(n-2) |

`ways(n)` = `F(n+1)` in standard Fibonacci numbering.