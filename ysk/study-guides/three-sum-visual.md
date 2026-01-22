# Three Sum Problem - Visual Guide

## 1. Overall Algorithm Structure

```mermaid
graph TD
    A[Start: Sorted Array] --> B[Pick first number i]
    B --> C{Already used this number?}
    C -->|Yes| B
    C -->|No| D["Run Two Sum on array[i+1...end]"]
    D --> E{Found pair?}
    E -->|Yes| F[Add triplet to result]
    E -->|No| G{More numbers to pick?}
    F --> G
    G -->|Yes| B
    G -->|No| H[Return result]
```

## 2. Step-by-Step Execution

Let's trace through `[-4, -1, -1, 0, 1, 2]`:

```mermaid
sequenceDiagram
    participant Array
    participant i as i (fixed)
    participant TS as Two Sum
    participant Result

    Note over Array: [-4, -1, -1, 0, 1, 2]

    Array->>i: i=0, pick -4
    i->>TS: Find two numbers that sum to 4 in [-1,-1,0,1,2]
    TS->>i: No solution

    Array->>i: i=1, pick -1
    i->>TS: Find two numbers that sum to 1 in [-1,0,1,2]
    TS->>Result: Found! [-1, -1, 2]

    Array->>i: i=2, pick -1
    Note over i: Skip! Same as previous

    Array->>i: i=3, pick 0
    i->>TS: Find two numbers that sum to 0 in [1,2]
    TS->>i: No solution

    Note over Result: Final: [[-1, -1, 2]]
```

## 3. Two-Pointer Movement (i=1 example)

When `i=1`, we pick `-1` and need to find two numbers that sum to `1`:

```mermaid
sequenceDiagram
    participant Array as Array: [-4, -1, -1, 0, 1, 2]
    participant Left as Left Pointer
    participant Right as Right Pointer
    participant Algo as Algorithm

    Note over Array: i=1, fixed value: -1<br/>Looking for two numbers that sum to 1

    Algo->>Left: Start at index 2
    Algo->>Right: Start at index 5

    Note over Left: L=2<br/>nums[2]=-1
    Note over Right: R=5<br/>nums[5]=2

    Algo->>Array: Calculate: -1 + 2 = 1
    Array-->>Algo: Sum equals target! ✅

    Note over Algo: Found triplet: [-1, -1, 2]

    Algo->>Left: Check for duplicates
    Note over Left: nums[3]=-1 (same!)<br/>Skip index 3
    Algo->>Left: Move to index 4

    Algo->>Right: Check for duplicates
    Note over Right: nums[4]=2 (same!)<br/>Skip index 4
    Algo->>Right: Move to index 3

    Note over Left,Right: L=4, R=3<br/>L > R, pointers crossed!

    Algo->>Algo: Stop searching for i=1
```

## 4. Pointer Movement Details

Here's how pointers move when `i=1`:

```mermaid
graph LR
    subgraph "Initial State"
        A["[-4, -1, -1, 0, 1, 2]<br/>i=1 L=2 R=5"]
    end

    subgraph "Found Solution"
        B["Sum: -1+2=1 ✅<br/>Triplet: [-1,-1,2]"]
    end

    subgraph "Skip Duplicates"
        C["L: 2→3 (skip -1)<br/>R: 5→4 (skip 2)"]
    end

    subgraph "Move Pointers"
        D["L: 3→4<br/>R: 4→3<br/>L > R, STOP"]
    end

    A --> B --> C --> D
```

## 5. Why We Skip Duplicates (Visual)

```mermaid
graph TD
    A["Found: [-1, -1, 2]<br/>L=2, R=5"] --> B{Skip duplicates?}

    B -->|No| C["L=3, R=4<br/>-1 + 0 + 2 = 1<br/>DUPLICATE! ❌"]

    B -->|Yes| D["L skips 2→3<br/>R skips 5→4<br/>Then L++, R--<br/>L > R, done ✅"]

    style C fill:#ffcccc
    style D fill:#ccffcc
```

## Mental Model Summary

**Think of Three Sum as:**
```
For each number in the array:
  └─> Run Two Sum on everything after it
```

**Key Points:**
1. **Sort first** - enables two-pointer technique
2. **Pick a number** (i) - this is your "fixed" first element
3. **Two Sum** - find two more numbers in the rest that sum to `-nums[i]`
4. **Skip duplicates** - avoid processing same number multiple times

## Example Walkthrough

Starting array: `[-1, 0, 1, 2, -1, -4]`

After sorting: `[-4, -1, -1, 0, 1, 2]`

| i | nums[i] | Two Sum Target | Subarray | Result |
|---|---------|----------------|----------|---------|
| 0 | -4 | 4 | [-1,-1,0,1,2] | None found |
| 1 | -1 | 1 | [-1,0,1,2] | [-1,-1,2] ✅ |
| 2 | -1 | 1 | [0,1,2] | **SKIP** (duplicate) |
| 3 | 0 | 0 | [1,2] | None found |
| 4 | Stop (only 2 elements left) | | | |