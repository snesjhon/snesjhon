# Sort Colors - Visual Guide (Dutch National Flag)

## Understanding the Three-Pointer Approach

### The Core Idea

We maintain **four regions** in the array using three pointers (`left`, `i`, `right`):

```mermaid
graph LR
    A[0s] -->|left| B[1s]
    B -->|i| C[unsorted]
    C -->|right| D[2s]

    style A fill:#90EE90
    style B fill:#87CEEB
    style C fill:#FFD700
    style D fill:#FFB6C1
```

### The Invariants (Rules that are ALWAYS true)

```mermaid
graph TD
    subgraph "Array Regions"
        A["[0...left-1]<br/>All 0s ✓"]
        B["[left...i-1]<br/>All 1s ✓"]
        C["[i...right]<br/>Unsorted ?"]
        D["[right+1...end]<br/>All 2s ✓"]
    end

    style A fill:#90EE90,stroke:#333,stroke-width:2px
    style B fill:#87CEEB,stroke:#333,stroke-width:2px
    style C fill:#FFD700,stroke:#333,stroke-width:2px
    style D fill:#FFB6C1,stroke:#333,stroke-width:2px
```

### Why We Need Each Pointer

- **`left`**: Marks where the next 0 should go
- **`i`**: Current element we're examining
- **`right`**: Marks where the next 2 should go

---

## Decision Tree

```mermaid
flowchart TD
    Start(["Check nums[i]"]) --> Decision{"nums[i] == ?"}

    Decision -->|0| Zero["Swap nums[i] ↔ nums[left]"]
    Decision -->|1| One[Already in correct region]
    Decision -->|2| Two["Swap nums[i] ↔ nums[right]"]

    Zero --> Zero1[left++]
    Zero1 --> Zero2[i++]
    Zero2 --> Continue1(['Continue'])

    One --> One1[i++]
    One1 --> Continue2(['Continue'])

    Two --> Two1[right--]
    Two1 --> Two2[DON'T increment i!<br/>Need to check swapped element]
    Two2 --> Continue3([Continue])

    style Zero fill:#90EE90
    style One fill:#87CEEB
    style Two fill:#FFB6C1
    style Two2 fill:#FF6B6B,color:#fff
```

---

## Step-by-Step Visual Example

Let's sort: `[2, 0, 2, 1, 1, 0]`

### Initial State

```mermaid
%%{init: {'theme':'base'}}%%
graph LR
    subgraph Array
        A0["2"]
        A1["0"]
        A2["2"]
        A3["1"]
        A4["1"]
        A5["0"]
    end

    L["left=0, i=0"] -.-> A0
    R["right=5"] -.-> A5

    subgraph Regions
        R0["0s: []"]
        R1["1s: []"]
        R2["unsorted: [2,0,2,1,1,0]"]
        R3["2s: []"]
    end

    style A0 fill:#FFD700,stroke:#333,stroke-width:3px
    style A5 fill:#FFD700
    style R2 fill:#FFD700
```

---

### Step 1: i=0, nums[i]=2

**Action**: Found a 2 → Swap with `right`, decrement `right` (DON'T increment i)

```mermaid
%%{init: {'theme':'base'}}%%
graph TB
    subgraph Before
        B0["2"]
        B1["0"]
        B2["2"]
        B3["1"]
        B4["1"]
        B5["0"]
    end

    subgraph After
        A0["0"]
        A1["0"]
        A2["2"]
        A3["1"]
        A4["1"]
        A5["2"]
    end

    Before --> |"Swap index 0 ↔ 5"|After

    L["left=0, i=0"] -.-> A0
    R["right=4"] -.-> A4

    subgraph "Why no i++?"
        Explanation["The element from right (0) is UNSORTED!<br/>We must check it next iteration"]
    end

    style B0 fill:#FFB6C1,stroke:#333,stroke-width:3px
    style B5 fill:#FFD700,stroke:#333,stroke-width:3px
    style A0 fill:#FFD700,stroke:#333,stroke-width:3px
    style A5 fill:#FFB6C1
    style Explanation fill:#FF6B6B,color:#fff
```

**Regions**: 0s: `[]` | 1s: `[]` | unsorted: `[0,0,2,1,1]` | 2s: `[2]`

---

### Step 2: i=0, nums[i]=0

**Action**: Found a 0 → Swap with `left`, increment BOTH

```mermaid
%%{init: {'theme':'base'}}%%
graph TB
    subgraph State
        A0["0"]
        A1["0"]
        A2["2"]
        A3["1"]
        A4["1"]
        A5["2"]
    end

    L1["Before: left=0, i=0"] -.-> A0
    L2["After: left=1, i=1"] -.-> A1
    R["right=4"] -.-> A4

    subgraph "Why i++ is safe?"
        Explanation["Left region only contains 0s<br/>The swapped element is guaranteed to be 0"]
    end

    style A0 fill:#90EE90,stroke:#333,stroke-width:3px
    style Explanation fill:#90EE90
```

**Regions**: 0s: `[0]` | 1s: `[]` | unsorted: `[0,2,1,1]` | 2s: `[2]`

---

### Step 3: i=1, nums[i]=0

**Action**: Found a 0 → Swap with `left`, increment BOTH

```mermaid
%%{init: {'theme':'base'}}%%
graph LR
    subgraph Array
        A0["0"]
        A1["0"]
        A2["2"]
        A3["1"]
        A4["1"]
        A5["2"]
    end

    L["left=2, i=2"] -.-> A2
    R["right=4"] -.-> A4

    subgraph Regions
        R0["0s: [0, 0]"]
        R1["1s: []"]
        R2["unsorted: [2,1,1]"]
        R3["2s: [2]"]
    end

    style A0 fill:#90EE90
    style A1 fill:#90EE90
    style A2 fill:#FFD700,stroke:#333,stroke-width:3px
    style A5 fill:#FFB6C1
    style R0 fill:#90EE90
    style R3 fill:#FFB6C1
```

---

### Step 4: i=2, nums[i]=2

**Action**: Found a 2 → Swap with `right`, decrement `right` (DON'T increment i)

```mermaid
%%{init: {'theme':'base'}}%%
graph TB
    subgraph Before
        B0["0"]
        B1["0"]
        B2["2"]
        B3["1"]
        B4["1"]
        B5["2"]
    end

    subgraph After
        A0["0"]
        A1["0"]
        A2["1"]
        A3["1"]
        A4["2"]
        A5["2"]
    end

    Before --> |"Swap index 2 ↔ 4"|After

    L["left=2, i=2"] -.-> A2
    R["right=3"] -.-> A3

    subgraph "Critical!"
        Explanation["Swapped element (1) came from unsorted region<br/>Must check it in next iteration!"]
    end

    style B2 fill:#FFB6C1,stroke:#333,stroke-width:3px
    style B4 fill:#FFD700,stroke:#333,stroke-width:3px
    style A2 fill:#FFD700,stroke:#333,stroke-width:3px
    style A4 fill:#FFB6C1
    style A5 fill:#FFB6C1
    style Explanation fill:#FF6B6B,color:#fff
```

**Regions**: 0s: `[0,0]` | 1s: `[]` | unsorted: `[1,1]` | 2s: `[2,2]`

---

### Step 5: i=2, nums[i]=1

**Action**: Found a 1 → Just increment `i` (already in correct region)

```mermaid
%%{init: {'theme':'base'}}%%
graph LR
    subgraph Array
        A0["0"]
        A1["0"]
        A2["1"]
        A3["1"]
        A4["2"]
        A5["2"]
    end

    L["left=2, i=3"] -.-> A2
    R["right=3"] -.-> A3

    subgraph Regions
        R0["0s: [0, 0]"]
        R1["1s: [1]"]
        R2["unsorted: [1]"]
        R3["2s: [2, 2]"]
    end

    style A0 fill:#90EE90
    style A1 fill:#90EE90
    style A2 fill:#87CEEB
    style A3 fill:#FFD700,stroke:#333,stroke-width:3px
    style A4 fill:#FFB6C1
    style A5 fill:#FFB6C1
    style R0 fill:#90EE90
    style R1 fill:#87CEEB
    style R3 fill:#FFB6C1
```

---

### Step 6: i=3, nums[i]=1 (Final)

**Action**: Found a 1 → Increment `i`, now `i > right` → DONE!

```mermaid
%%{init: {'theme':'base'}}%%
graph LR
    subgraph "Final Sorted Array"
        A0["0"]
        A1["0"]
        A2["1"]
        A3["1"]
        A4["2"]
        A5["2"]
    end

    L["left=2"] -.-> A2
    I["i=4 (STOP: i > right)"] -.-> A4
    R["right=3"] -.-> A3

    subgraph "Final Regions"
        R0["0s: [0, 0] ✓"]
        R1["1s: [1, 1] ✓"]
        R2["unsorted: []"]
        R3["2s: [2, 2] ✓"]
    end

    style A0 fill:#90EE90
    style A1 fill:#90EE90
    style A2 fill:#87CEEB
    style A3 fill:#87CEEB
    style A4 fill:#FFB6C1
    style A5 fill:#FFB6C1
    style R0 fill:#90EE90
    style R1 fill:#87CEEB
    style R3 fill:#FFB6C1
    style I fill:#FFD700,stroke:#333,stroke-width:3px
```

---

## The Key Insight: Why We Don't Increment `i` for 2s

```mermaid
flowchart TD
    subgraph "When we find a 2"
        A["nums[i] = 2"] --> B["Swap with nums[right]"]
        B --> C{What did we get<br/>from right?}
        C -->|Unknown!| D["Could be 0, 1, or 2"]
        D --> E["MUST check it<br/>DON'T increment i"]
    end

    subgraph "When we find a 0"
        F["nums[i] = 0"] --> G["Swap with nums[left]"]
        G --> H{What did we get<br/>from left?}
        H -->|Known!| I["Must be 0 or 1<br/>(left region is sorted)"]
        I --> J["Safe to increment i"]
    end

    style E fill:#FF6B6B,color:#fff
    style J fill:#90EE90
```

---

## Algorithm Flow

```mermaid
flowchart TD
    Start([Start: left=0, i=0, right=n-1]) --> Loop{i <= right?}

    Loop -->|No| Done([Done! Array sorted])
    Loop -->|Yes| Check{"nums[i]?"}

    Check -->|0| Swap0["swap(nums[left], nums[i])"]
    Swap0 --> Inc0["left++<br/>i++"]
    Inc0 --> Loop

    Check -->|1| Inc1["i++"]
    Inc1 --> Loop

    Check -->|2| Swap2["swap(nums[right], nums[i])"]
    Swap2 --> Dec2["right--<br/>(i stays same!)"]
    Dec2 --> Loop

    style Swap0 fill:#90EE90
    style Inc1 fill:#87CEEB
    style Swap2 fill:#FFB6C1
    style Dec2 fill:#FF6B6B,color:#fff
```

---

## Complexity

- **Time**: O(n) - Single pass through array
- **Space**: O(1) - Only three pointers

---

## Common Mistakes

```mermaid
graph TD
    M1["❌ Incrementing i after swapping with right"] --> Why1["Element from right is unsorted!"]
    M2["❌ Using i < right instead of i <= right"] --> Why2["Will miss middle element!"]
    M3["❌ Thinking we need multiple passes"] --> Why3["Single pass is sufficient!"]
    M4["❌ Not understanding the invariants"] --> Why4["Each region has a specific guarantee"]

    style M1 fill:#FF6B6B,color:#fff
    style M2 fill:#FF6B6B,color:#fff
    style M3 fill:#FF6B6B,color:#fff
    style M4 fill:#FF6B6B,color:#fff
```

---

## Try It Yourself

Practice with: `[1, 2, 0]`

<details>
<summary>Click to see solution</summary>

```mermaid
flowchart TD
    S0["Initial: [1, 2, 0]<br/>L=0, i=0, R=2"]
    S1["Step 1: [1, 2, 0]<br/>L=0, i=1, R=2<br/>(saw 1, i++)"]
    S2["Step 2: [1, 0, 2]<br/>L=0, i=1, R=1<br/>(saw 2, swap with R, R--)"]
    S3["Step 3: [0, 1, 2]<br/>L=1, i=2, R=1<br/>(saw 0, swap with L, L++, i++)"]
    S4["Done: i > R, STOP<br/>Result: [0, 1, 2]"]

    S0 --> S1 --> S2 --> S3 --> S4

    style S4 fill:#90EE90
```

</details>
