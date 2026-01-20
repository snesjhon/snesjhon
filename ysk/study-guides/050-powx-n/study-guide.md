# Pow(x, n) - Visual Guide

## Understanding the Problem

### The Core Idea

Implement `pow(x, n)` which calculates `x` raised to the power `n` (i.e., `x^n`).

```mermaid
graph LR
    A["x = 2<br/>n = 10"] --> B["Calculate<br/>2^10"]
    B --> C["Result: 1024"]

    style A fill:#e6f3ff
    style C fill:#90EE90
```

### The Naive Approach

Multiply `x` by itself `n` times:

```
2^10 = 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2
       └─────────── 10 multiplications ───────────┘
```

**Problem:** For `n = 1,000,000,000`, this takes a billion operations!

---

## Key Insight: Binary Exponentiation

### The Big Idea

Instead of `n` multiplications, we can do it in `log(n)` multiplications by **squaring**.

```mermaid
graph TD
    subgraph "Key Observation"
        A["x^10 = x^5 × x^5"]
        B["x^5 = x^2 × x^2 × x"]
        C["x^2 = x × x"]
    end

    A --> B --> C

    style A fill:#90EE90
    style B fill:#87CEEB
    style C fill:#FFD700
```

**Why this works:**
- `x^10` needs only 1 multiplication (if we know `x^5`)
- `x^5` needs only 2 multiplications (if we know `x^2`)
- `x^2` needs only 1 multiplication

**Total: 4 multiplications instead of 10!**

---

## The Two Rules

```mermaid
graph TD
    subgraph "Exponentiation Rules"
        Even["If n is EVEN<br/>x^n = (x^(n/2))^2<br/>= x^(n/2) × x^(n/2)"]
        Odd["If n is ODD<br/>x^n = x × x^(n-1)"]
    end

    style Even fill:#87CEEB
    style Odd fill:#FFD700
```

### Why These Rules?

**Even exponent:** `x^10 = x^5 × x^5` — cut the problem in half!

**Odd exponent:** `x^5 = x × x^4` — extract one `x`, now `4` is even

---

## Step-by-Step Example: 2^10

```mermaid
graph TD
    A["2^10<br/>(10 is even)"]
    B["= (2^5)^2"]
    C["2^5<br/>(5 is odd)"]
    D["= 2 × 2^4"]
    E["2^4<br/>(4 is even)"]
    F["= (2^2)^2"]
    G["2^2<br/>(2 is even)"]
    H["= (2^1)^2"]
    I["2^1<br/>(1 is odd)"]
    J["= 2 × 2^0"]
    K["2^0 = 1<br/>(base case)"]

    A --> B --> C --> D --> E --> F --> G --> H --> I --> J --> K

    style A fill:#e6f3ff
    style K fill:#90EE90
```

### Unrolling the Computation

```
2^10
= (2^5)^2
= (2 × 2^4)^2
= (2 × (2^2)^2)^2
= (2 × (2 × 2)^2)^2
= (2 × 4^2)^2
= (2 × 16)^2
= 32^2
= 1024 ✓
```

**Only 4 multiplications!**

---

## Handling Edge Cases

### Case 1: n = 0

```mermaid
graph LR
    A["x^0 = 1"]
    B["Any number to<br/>the power 0 is 1"]

    A --- B

    style A fill:#90EE90
```

### Case 2: Negative Exponent

```mermaid
graph LR
    A["x^(-n)"] --> B["= 1 / x^n"]
    C["2^(-3)"] --> D["= 1 / 2^3 = 1/8 = 0.125"]

    style A fill:#FFD700
    style C fill:#FFD700
```

**Strategy:** Convert to positive exponent, then take reciprocal.

### Case 3: Integer Overflow (n = -2^31)

```mermaid
graph TD
    A["n = -2147483648<br/>(minimum 32-bit int)"]
    B["-n = 2147483648<br/>(OVERFLOW!)"]
    C["Solution: Use<br/>long/bigint OR<br/>handle specially"]

    A --> B --> C

    style A fill:#ff6b6b,color:#fff
    style B fill:#ff6b6b,color:#fff
    style C fill:#90EE90
```

---

## Visualizing the Recursion

### For x=2, n=10

```mermaid
graph TD
    subgraph "Recursive Calls"
        R1["pow(2, 10)"]
        R2["pow(2, 5)"]
        R3["pow(2, 4)"]
        R4["pow(2, 2)"]
        R5["pow(2, 1)"]
        R6["pow(2, 0) = 1"]
    end

    R1 -->|"10/2=5"| R2
    R2 -->|"5-1=4"| R3
    R3 -->|"4/2=2"| R4
    R4 -->|"2/2=1"| R5
    R5 -->|"1-1=0"| R6

    style R1 fill:#e6f3ff
    style R6 fill:#90EE90
```

**Depth: O(log n)** — We halve `n` at each even step!

---

## The Binary Connection

### Why "Binary" Exponentiation?

The exponent `n` can be expressed in binary, and each bit tells us whether to include that power of 2.

```
10 in binary = 1010

2^10 = 2^8 × 2^2
       ↑       ↑
      bit 3   bit 1
      (=1)    (=1)
```

```mermaid
graph LR
    subgraph "10 = 1010 in binary"
        B3["bit 3<br/>2^3=8<br/>✓"]
        B2["bit 2<br/>2^2=4<br/>✗"]
        B1["bit 1<br/>2^1=2<br/>✓"]
        B0["bit 0<br/>2^0=1<br/>✗"]
    end

    style B3 fill:#90EE90
    style B2 fill:#FFB6C1
    style B1 fill:#90EE90
    style B0 fill:#FFB6C1
```

`2^10 = 2^8 × 2^2 = 256 × 4 = 1024`

---

## Iterative Approach

### The Algorithm

```mermaid
flowchart TD
    Start(["Start with result=1"])
    Loop{"n > 0?"}
    Odd{"n is odd?"}
    Multiply["result = result × x"]
    Square["x = x × x"]
    Halve["n = n / 2<br/>(integer division)"]
    End(["Return result"])

    Start --> Loop
    Loop -->|Yes| Odd
    Loop -->|No| End
    Odd -->|Yes| Multiply --> Square
    Odd -->|No| Square
    Square --> Halve --> Loop

    style Start fill:#e6f3ff
    style End fill:#90EE90
```

### Trace Through: 2^10

| Step | n | n binary | n odd? | result | x |
|------|---|----------|--------|--------|---|
| 0 | 10 | 1010 | No | 1 | 2 |
| 1 | 5 | 101 | Yes | 1×4=4 | 4 |
| 2 | 2 | 10 | No | 4 | 16 |
| 3 | 1 | 1 | Yes | 4×256=1024 | 256 |
| 4 | 0 | 0 | - | **1024** | - |

Wait, let me recalculate:

| Step | n | n odd? | Action | result | x (after square) |
|------|---|--------|--------|--------|------------------|
| init | 10 | - | - | 1 | 2 |
| 1 | 10 | No | square only | 1 | 4 |
| 2 | 5 | Yes | multiply, square | 4 | 16 |
| 3 | 2 | No | square only | 4 | 256 |
| 4 | 1 | Yes | multiply, square | 1024 | 65536 |
| 5 | 0 | done | return | **1024** | - |

---

## Why This Works: Bit-by-Bit

Each iteration:
1. If current bit of `n` is 1 → multiply result by current power of x
2. Square x (prepare next power)
3. Shift n right by 1 (move to next bit)

```mermaid
graph TB
    subgraph "Processing n=10 (binary 1010)"
        I1["Bit 0 = 0<br/>Skip<br/>x: 2→4"]
        I2["Bit 1 = 1<br/>result × 4 = 4<br/>x: 4→16"]
        I3["Bit 2 = 0<br/>Skip<br/>x: 16→256"]
        I4["Bit 3 = 1<br/>result × 256 = 1024<br/>Done!"]
    end

    I1 --> I2 --> I3 --> I4

    style I2 fill:#90EE90
    style I4 fill:#90EE90
```

---

## Approach Comparison

```mermaid
graph TD
    subgraph "Solution Approaches"
        A["Naive Loop<br/>O(n) time<br/>O(1) space"]
        B["Recursive<br/>O(log n) time<br/>O(log n) space"]
        C["Iterative<br/>O(log n) time<br/>O(1) space"]
    end

    A --> |"Use squaring"| B
    B --> |"Eliminate stack"| C

    style A fill:#ff6b6b,color:#fff
    style B fill:#87CEEB
    style C fill:#90EE90,stroke:#333,stroke-width:3px
```

---

## Common Pitfalls

### Pitfall 1: Integer Overflow with -n

```mermaid
graph LR
    A["n = -2147483648"]
    B["-n overflows!"]
    C["Fix: handle before<br/>negating, or use<br/>larger type"]

    A --> B --> C

    style B fill:#ff6b6b,color:#fff
```

### Pitfall 2: Forgetting x^0 = 1

```mermaid
graph LR
    A["pow(2, 0)"]
    B["Must return 1<br/>not 0 or x"]

    A --> B

    style B fill:#FFD700
```

### Pitfall 3: Infinite Loop

```mermaid
graph LR
    A["Using n = n - 1<br/>for even n"]
    B["n=10 → 9 → 8 → 7...<br/>O(n) again!"]
    C["Must use n/2<br/>for even cases"]

    A --> B --> C

    style B fill:#ff6b6b,color:#fff
    style C fill:#90EE90
```

---

## Edge Cases Summary

| Input | Expected Output | Why |
|-------|-----------------|-----|
| `pow(2, 0)` | 1 | x^0 = 1 |
| `pow(0, 5)` | 0 | 0^n = 0 (n > 0) |
| `pow(2, -2)` | 0.25 | 2^-2 = 1/4 |
| `pow(-2, 3)` | -8 | Odd power preserves sign |
| `pow(-2, 4)` | 16 | Even power → positive |
| `pow(1, huge)` | 1 | 1^anything = 1 |
| `pow(-1, huge)` | ±1 | Depends on odd/even |

---

## Mental Model Summary

```mermaid
graph TB
    subgraph "Key Concepts"
        K1["Squaring halves the problem"]
        K2["Even: x^n = (x^(n/2))^2"]
        K3["Odd: x^n = x × x^(n-1)"]
        K4["Negative: x^(-n) = 1/x^n"]
        K5["O(log n) multiplications"]
    end

    K1 --> K2
    K1 --> K3
    K3 --> K4
    K2 --> K5
    K3 --> K5

    style K1 fill:#e6f3ff
    style K5 fill:#90EE90
```

---

## Try It Yourself

Calculate `3^13` using binary exponentiation.

<details>
<summary>Click to see solution</summary>

```
13 in binary = 1101

Breaking down:
- 13 is odd: 3^13 = 3 × 3^12
- 12 is even: 3^12 = (3^6)^2
- 6 is even: 3^6 = (3^3)^2
- 3 is odd: 3^3 = 3 × 3^2
- 2 is even: 3^2 = (3^1)^2
- 1 is odd: 3^1 = 3 × 3^0
- 0 base: 3^0 = 1

Building up:
3^1 = 3
3^2 = 9
3^3 = 27
3^6 = 729
3^12 = 531441
3^13 = 1594323

Answer: 1594323

Multiplications: only 5 instead of 13!
```

</details>