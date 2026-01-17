# Unique Paths in a Grid - Visual Guide

## Understanding the Problem

### The Core Idea

Given an `n x m` grid, count all unique paths from top-left `(0,0)` to bottom-right `(n-1, m-1)`. You can only move **right** or **down**.

```mermaid
graph LR
    A["Start (0,0)"] --> B["Move Right OR"]
    A --> C["Move Down"]
    B --> D["Continue until..."]
    C --> D
    D --> E["End (n-1, m-1)"]

    style A fill:#e6f3ff
    style E fill:#90EE90
```

### Grid Visualization

```
     0   1   2   3
   +---+---+---+---+
 0 | S | → | → | → |
   +---+---+---+---+
 1 | ↓ |   |   | ↓ |
   +---+---+---+---+
 2 | ↓ | → | → | E |
   +---+---+---+---+

S = Start (0,0)
E = End (2,3)
```

---

## Key Insight: The Recurrence

At any cell `(i, j)`, you can only arrive from:
- **Above**: cell `(i-1, j)`
- **Left**: cell `(i, j-1)`

```mermaid
graph TB
    subgraph "Paths to (i,j)"
        Above["(i-1, j)<br/>paths from above"]
        Left["(i, j-1)<br/>paths from left"]
        Current["(i, j)<br/>total paths"]
    end

    Above -->|"+ "| Current
    Left -->|"= "| Current

    style Above fill:#87CEEB
    style Left fill:#FFD700
    style Current fill:#90EE90
```

**Formula**: `dp[i][j] = dp[i-1][j] + dp[i][j-1]`

---

## Base Cases

### First Row: Only One Way

Can only come from the left (no cells above).

```mermaid
graph LR
    subgraph "First Row"
        R0["(0,0)<br/>1"]
        R1["(0,1)<br/>1"]
        R2["(0,2)<br/>1"]
        R3["(0,3)<br/>1"]
    end

    R0 --> |"→"| R1 --> |"→"| R2 --> |"→"| R3

    style R0 fill:#e6f3ff
    style R1 fill:#e6f3ff
    style R2 fill:#e6f3ff
    style R3 fill:#e6f3ff
```

### First Column: Only One Way

Can only come from above (no cells to the left).

```mermaid
graph TB
    subgraph "First Column"
        C0["(0,0)<br/>1"]
        C1["(1,0)<br/>1"]
        C2["(2,0)<br/>1"]
    end

    C0 --> |"↓"| C1 --> |"↓"| C2

    style C0 fill:#e6f3ff
    style C1 fill:#e6f3ff
    style C2 fill:#e6f3ff
```

---

## Step-by-Step Example: 3x4 Grid

### Initial State

```mermaid
graph TB
    subgraph "Grid 3x4"
        direction LR
        subgraph "Row 0"
            A0["1"]
            A1["1"]
            A2["1"]
            A3["1"]
        end
        subgraph "Row 1"
            B0["1"]
            B1["?"]
            B2["?"]
            B3["?"]
        end
        subgraph "Row 2"
            C0["1"]
            C1["?"]
            C2["?"]
            C3["?"]
        end
    end

    style A0 fill:#e6f3ff
    style A1 fill:#e6f3ff
    style A2 fill:#e6f3ff
    style A3 fill:#e6f3ff
    style B0 fill:#e6f3ff
    style C0 fill:#e6f3ff
```

Base cases filled: first row = 1, first column = 1.

---

### Step 1: Fill (1,1)

```mermaid
graph TB
    subgraph "Calculate dp[1][1]"
        Above["dp[0][1] = 1<br/>(from above)"]
        Left["dp[1][0] = 1<br/>(from left)"]
        Result["dp[1][1] = 1 + 1 = 2"]
    end

    Above --> Result
    Left --> Result

    style Above fill:#87CEEB
    style Left fill:#FFD700
    style Result fill:#90EE90
```

**Grid state:**
```
  1   1   1   1
  1  [2]  ?   ?
  1   ?   ?   ?
```

---

### Step 2: Fill (1,2)

```mermaid
graph TB
    subgraph "Calculate dp[1][2]"
        Above["dp[0][2] = 1<br/>(from above)"]
        Left["dp[1][1] = 2<br/>(from left)"]
        Result["dp[1][2] = 1 + 2 = 3"]
    end

    Above --> Result
    Left --> Result

    style Above fill:#87CEEB
    style Left fill:#FFD700
    style Result fill:#90EE90
```

**Grid state:**
```
  1   1   1   1
  1   2  [3]  ?
  1   ?   ?   ?
```

---

### Step 3: Fill (1,3)

```mermaid
graph TB
    subgraph "Calculate dp[1][3]"
        Above["dp[0][3] = 1<br/>(from above)"]
        Left["dp[1][2] = 3<br/>(from left)"]
        Result["dp[1][3] = 1 + 3 = 4"]
    end

    Above --> Result
    Left --> Result

    style Above fill:#87CEEB
    style Left fill:#FFD700
    style Result fill:#90EE90
```

**Grid state:**
```
  1   1   1   1
  1   2   3  [4]
  1   ?   ?   ?
```

---

### Step 4: Fill Row 2

```mermaid
graph LR
    subgraph "Row 2 Calculations"
        C1["dp[2][1]<br/>= dp[1][1] + dp[2][0]<br/>= 2 + 1 = 3"]
        C2["dp[2][2]<br/>= dp[1][2] + dp[2][1]<br/>= 3 + 3 = 6"]
        C3["dp[2][3]<br/>= dp[1][3] + dp[2][2]<br/>= 4 + 6 = 10"]
    end

    C1 --> C2 --> C3

    style C1 fill:#ffeb99
    style C2 fill:#ffeb99
    style C3 fill:#90EE90,stroke:#333,stroke-width:3px
```

---

### Final Grid

```mermaid
graph TB
    subgraph "Complete DP Table"
        subgraph "Row 0"
            A0["1"]
            A1["1"]
            A2["1"]
            A3["1"]
        end
        subgraph "Row 1"
            B0["1"]
            B1["2"]
            B2["3"]
            B3["4"]
        end
        subgraph "Row 2"
            C0["1"]
            C1["3"]
            C2["6"]
            C3["10"]
        end
    end

    style A0 fill:#e6f3ff
    style C3 fill:#90EE90,stroke:#333,stroke-width:3px
```

**Answer: 10 unique paths**

---

## Visualization of All 10 Paths

For a 3x3 grid (6 paths), the paths look like:

```mermaid
graph TD
    subgraph "Path Pattern"
        P1["RRDD"]
        P2["RDRD"]
        P3["RDDR"]
        P4["DRRD"]
        P5["DRDR"]
        P6["DDRR"]
    end

    style P1 fill:#FFB6C1
    style P2 fill:#FFD700
    style P3 fill:#98FB98
    style P4 fill:#87CEEB
    style P5 fill:#DDA0DD
    style P6 fill:#F0E68C
```

Each path is a sequence of R (right) and D (down) moves.

---

## Why Dynamic Programming Works

### Optimal Substructure

```mermaid
graph TD
    Main["Paths to (n-1, m-1)"]
    Sub1["Paths to (n-2, m-1)"]
    Sub2["Paths to (n-1, m-2)"]
    Sub3["Paths to (n-2, m-2)"]

    Main --> Sub1
    Main --> Sub2
    Sub1 --> Sub3
    Sub2 --> Sub3

    style Main fill:#90EE90
    style Sub1 fill:#87CEEB
    style Sub2 fill:#FFD700
    style Sub3 fill:#FFB6C1
```

The solution to the main problem depends on solutions to smaller subproblems.

### Overlapping Subproblems

```mermaid
graph TD
    subgraph "Without Memoization"
        A["(2,2)"]
        B1["(1,2)"]
        B2["(2,1)"]
        C1["(0,2)"]
        C2["(1,1)"]
        C3["(1,1)"]
        C4["(2,0)"]
    end

    A --> B1
    A --> B2
    B1 --> C1
    B1 --> C2
    B2 --> C3
    B2 --> C4

    style C2 fill:#ff6b6b,color:#fff
    style C3 fill:#ff6b6b,color:#fff
```

**Problem**: `(1,1)` computed twice! With larger grids, this explodes exponentially.

---

## The Mathematical Insight

### Combinatorics Approach

To reach `(n-1, m-1)` from `(0,0)`:
- Need exactly `(n-1)` down moves
- Need exactly `(m-1)` right moves
- Total moves: `(n-1) + (m-1) = n + m - 2`

**Question**: How many ways to arrange these moves?

```mermaid
graph LR
    subgraph "Choose Positions"
        Total["Total moves:<br/>n + m - 2"]
        Choose["Choose (n-1) for DOWN<br/>or (m-1) for RIGHT"]
        Result["C(n+m-2, n-1)"]
    end

    Total --> Choose --> Result

    style Result fill:#90EE90
```

**Formula**:
$$\binom{n+m-2}{n-1} = \frac{(n+m-2)!}{(n-1)!(m-1)!}$$

---

## Approach Comparison

```mermaid
graph TD
    subgraph "Approaches"
        A["Recursion<br/>O(2^(n+m))<br/>Exponential"]
        B["Memoization<br/>O(n*m)<br/>Top-Down"]
        C["Bottom-Up DP<br/>O(n*m)<br/>Iterative"]
        D["Space-Optimized<br/>O(n*m) time<br/>O(m) space"]
        E["Math<br/>O(min(n,m))<br/>Optimal"]
    end

    A --> |"Add cache"| B
    B --> |"Flip direction"| C
    C --> |"Reduce space"| D
    D --> |"Use formula"| E

    style A fill:#ff6b6b,color:#fff
    style B fill:#FFD700
    style C fill:#87CEEB
    style D fill:#98FB98
    style E fill:#90EE90,stroke:#333,stroke-width:3px
```

---

## Space Optimization Insight

### Why One Row is Enough

```mermaid
graph TB
    subgraph "Row-by-Row Processing"
        R1["Previous Row:<br/>[1, 1, 1, 1]"]
        R2["Current Row:<br/>[1, 2, 3, 4]"]
    end

    subgraph "Single Array Trick"
        S["dp = [1, 1, 1, 1]"]
        S1["dp[1] = dp[1] + dp[0]<br/>= 1 + 1 = 2"]
        S2["dp[2] = dp[2] + dp[1]<br/>= 1 + 2 = 3"]
        S3["dp[3] = dp[3] + dp[2]<br/>= 1 + 3 = 4"]
    end

    R1 --> S
    S --> S1 --> S2 --> S3

    style S fill:#e6f3ff
    style S3 fill:#90EE90
```

**Key**: When updating `dp[j]`:
- `dp[j]` still has value from previous row (from above)
- `dp[j-1]` already updated for current row (from left)

---

## Decision Tree

```mermaid
flowchart TD
    Start(["Grid Size?"]) --> Check{Large grid?}

    Check -->|"No (small)"| Recursive["Recursion<br/>Simple to understand"]
    Check -->|"Yes"| DP["Use DP"]

    DP --> Space{Memory constraint?}

    Space -->|"No"| Full["2D DP Array<br/>Easy to debug"]
    Space -->|"Yes"| Optimized["1D Array<br/>O(m) space"]

    Optimized --> Math{Overflow concern?}
    Math -->|"No"| Formula["Math Formula<br/>O(min(n,m))"]
    Math -->|"Yes"| Optimized

    style Recursive fill:#FFB6C1
    style Full fill:#87CEEB
    style Optimized fill:#98FB98
    style Formula fill:#90EE90,stroke:#333,stroke-width:3px
```

---

## Common Patterns to Remember

```mermaid
graph TB
    subgraph "Grid DP Patterns"
        P1["First row/col = base cases"]
        P2["Each cell = sum of neighbors"]
        P3["Process row by row"]
        P4["Only need previous row"]
    end

    P1 --> P2 --> P3 --> P4

    style P1 fill:#e6f3ff
    style P2 fill:#87CEEB
    style P3 fill:#FFD700
    style P4 fill:#90EE90
```

---

## Edge Cases

### 1x1 Grid

```mermaid
graph LR
    subgraph "1x1 Grid"
        A["Start = End<br/>1 path"]
    end

    style A fill:#90EE90
```

### 1xN or Nx1 Grid

```mermaid
graph LR
    subgraph "1x4 Grid"
        A["1"] --> B["1"] --> C["1"] --> D["1"]
    end

    style D fill:#90EE90
```

Only one path: all right (or all down).

---

## Try It Yourself

Calculate paths for a 4x3 grid.

<details>
<summary>Click to see solution</summary>

```
Fill row by row:

Row 0: [1, 1, 1]
Row 1: [1, 2, 3]
Row 2: [1, 3, 6]
Row 3: [1, 4, 10]

Answer: 10 unique paths
```

**Verification with math:**
- n=4, m=3
- Total moves = 4-1 + 3-1 = 5
- Choose 3 down moves from 5 total
- C(5,3) = 5!/(3!*2!) = 10

</details>
