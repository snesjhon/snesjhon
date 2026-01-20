# Understanding Linked Lists: The Two Layers

The key to understanding pointer manipulation is recognizing there are **two separate layers**.

---

## The Two Layers

**Variable Layer:** Labels you can move freely. Moving a label doesn't affect the list.

**Node Layer:** The actual nodes connected together. This is where the linked list lives.

---

## Legend

```mermaid
graph LR
    subgraph "What the arrows mean"
        A((node)) -.->|"dashed = .next pointer"| B((node))
        C[variable] -->|"solid = variable reference"| D((node))
    end
```

| Symbol | Meaning |
|--------|---------|
| `(( ))` | A node in the linked list |
| `[ ]` | A variable (label) |
| `→` solid arrow | A variable referencing a node (direct code) |
| `⤑` dashed arrow | A node's `.next` property (indirect access) |

---

## Initial State

```mermaid
graph LR
    subgraph "Node Layer"
        N1((1))
        N2((2))
        N3((3))
        null[null]
    end

    N1 -.-> N2 -.-> N3 -.-> null

    dummy[dummy] --> null
    current[current] --> N1
```

---

## Iteration 1

### Start

```mermaid
graph LR
    subgraph "Node Layer"
        N1((1))
        N2((2))
        N3((3))
        null[null]
    end

    N1 -.-> N2 -.-> N3 -.-> null

    dummy[dummy] --> null
    current[current] --> N1
```

### Step 1: `following = current.next`

Save where we want to go.

```mermaid
graph LR
    subgraph "Node Layer"
        N1((1))
        N2((2))
        N3((3))
        null[null]
    end

    N1 -.-> N2 -.-> N3 -.-> null

    dummy[dummy] --> null
    current[current] --> N1
    following[following] --> N2
```

### Step 2: `current.next = dummy`

Detach node 1 from node 2. Point it to what dummy points to (null).

```mermaid
graph LR
    subgraph "Node Layer"
        N1((1))
        null1[null]
        N2((2))
        N3((3))
        null2[null]
    end

    N1 -.-> null1
    N2 -.-> N3 -.-> null2

    dummy[dummy] --> null1
    current[current] --> N1
    following[following] --> N2
```

Node 1 is now detached. It points to null. Notice dummy still points to the same null.

### Step 3: `dummy = current`

Move the dummy label to point at node 1.

```mermaid
graph LR
    subgraph "Node Layer"
        N1((1))
        null1[null]
        N2((2))
        N3((3))
        null2[null]
    end

    N1 -.-> null1
    N2 -.-> N3 -.-> null2

    dummy[dummy] --> N1
    current[current] --> N1
    following[following] --> N2
```

**Did the list change?** No. We just moved a label. Node 1 still points to null.

### Step 4: `current = following`

Move current label forward to node 2.

```mermaid
graph LR
    subgraph "Node Layer"
        N1((1))
        null1[null]
        N2((2))
        N3((3))
        null2[null]
    end

    N1 -.-> null1
    N2 -.-> N3 -.-> null2

    dummy[dummy] --> N1
    current[current] --> N2
    following[following] --> N2
```

---

## Iteration 2

### Step 1: `following = current.next`

```mermaid
graph LR
    subgraph "Node Layer"
        N1((1))
        null1[null]
        N2((2))
        N3((3))
        null2[null]
    end

    N1 -.-> null1
    N2 -.-> N3 -.-> null2

    dummy[dummy] --> N1
    current[current] --> N2
    following[following] --> N3
```

### Step 2: `current.next = dummy`

Detach node 2 from node 3. Point it to what dummy points to (node 1).

```mermaid
graph LR
    subgraph "Node Layer"
        N2((2))
        N1((1))
        null1[null]
        N3((3))
        null2[null]
    end

    N2 -.-> N1 -.-> null1
    N3 -.-> null2

    dummy[dummy] --> N1
    current[current] --> N2
    following[following] --> N3
```

### Step 3: `dummy = current`

Move the dummy label to node 2.

```mermaid
graph LR
    subgraph "Node Layer"
        N2((2))
        N1((1))
        null1[null]
        N3((3))
        null2[null]
    end

    N2 -.-> N1 -.-> null1
    N3 -.-> null2

    dummy[dummy] --> N2
    current[current] --> N2
    following[following] --> N3
```

**Did the list change?** No. Just moved a label.

### Step 4: `current = following`

```mermaid
graph LR
    subgraph "Node Layer"
        N2((2))
        N1((1))
        null1[null]
        N3((3))
        null2[null]
    end

    N2 -.-> N1 -.-> null1
    N3 -.-> null2

    dummy[dummy] --> N2
    current[current] --> N3
    following[following] --> N3
```

---

## Iteration 3

### Step 1: `following = current.next`

```mermaid
graph LR
    subgraph "Node Layer"
        N2((2))
        N1((1))
        null1[null]
        N3((3))
        null2[null]
    end

    N2 -.-> N1 -.-> null1
    N3 -.-> null2

    dummy[dummy] --> N2
    current[current] --> N3
    following[following] --> null2
```

### Step 2: `current.next = dummy`

Detach node 3. Point it to what dummy points to (node 2).

```mermaid
graph LR
    subgraph "Node Layer"
        N3((3))
        N2((2))
        N1((1))
        null[null]
    end

    N3 -.-> N2 -.-> N1 -.-> null

    dummy[dummy] --> N2
    current[current] --> N3
    following[following] --> null
```

### Step 3: `dummy = current`

Move the dummy label to node 3.

```mermaid
graph LR
    subgraph "Node Layer"
        N3((3))
        N2((2))
        N1((1))
        null[null]
    end

    N3 -.-> N2 -.-> N1 -.-> null

    dummy[dummy] --> N3
    current[current] --> N3
    following[following] --> null
```

### Step 4: `current = following`

```mermaid
graph LR
    subgraph "Node Layer"
        N3((3))
        N2((2))
        N1((1))
        null[null]
    end

    N3 -.-> N2 -.-> N1 -.-> null

    dummy[dummy] --> N3
    current[current] --> null
    following[following] --> null
```

`current` is null. Loop exits.

---

## Final Result

```mermaid
graph LR
    subgraph "Node Layer"
        N3((3))
        N2((2))
        N1((1))
        null[null]
    end

    N3 -.-> N2 -.-> N1 -.-> null

    dummy[dummy] --> N3
```

Return `dummy`. The list is reversed: `3 → 2 → 1 → null`

---

## Summary

| Code | What happens | List changes? |
|------|--------------|---------------|
| `x = y` | Move a label | No |
| `x.next = y` | Change where a node points | Yes |

Labels (solid lines) can point anywhere - moving them doesn't affect the list.

The list (dashed arrows) only changes when you modify a node's `.next` property.