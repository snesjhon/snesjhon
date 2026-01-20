# Reverse Linked List - Step by Step

Starting list: `1 → 2 → 3 → null`

## Initial State

```mermaid
graph LR
    dummy["dummy"] --> NULL1["null"]
    current["current"] --> N1["1"]
    N1 --> N2["2"]
    N2 --> N3["3"]
    N3 --> NULL2["null"]
```

---

## Iteration 1

### Step 1: `let following = current.next`

```mermaid
graph LR
    dummy["dummy"] --> NULL1["null"]
    current["current"] --> N1["1"]
    N1 --> N2["2"]
    N2 --> N3["3"]
    N3 --> NULL2["null"]
    following["following"] --> N2
```

### Step 2: `current.next = dummy`

Node 1's next now points to what dummy points to (null).

```mermaid
graph LR
    dummy["dummy"] --> NULL1["null"]
    current["current"] --> N1["1"]
    N1 --> NULL1
    following["following"] --> N2["2"]
    N2 --> N3["3"]
    N3 --> NULL2["null"]
```

### Step 3: `dummy = current`

The variable `dummy` now points to the same node as `current`. The node itself doesn't change.

```mermaid
graph LR
    current["current"] --> N1["1"]
    dummy["dummy"] --> N1
    N1 --> NULL1["null"]
    following["following"] --> N2["2"]
    N2 --> N3["3"]
    N3 --> NULL2["null"]
```

### Step 4: `current = following`

```mermaid
graph LR
    dummy["dummy"] --> N1["1"]
    N1 --> NULL1["null"]
    current["current"] --> N2["2"]
    N2 --> N3["3"]
    N3 --> NULL2["null"]
```

**End of iteration 1:** We now have `1 → null` reversed, and `current` is at `2`.

---

## Iteration 2

### Step 1: `let following = current.next`

```mermaid
graph LR
    dummy["dummy"] --> N1["1"]
    N1 --> NULL1["null"]
    current["current"] --> N2["2"]
    N2 --> N3["3"]
    N3 --> NULL2["null"]
    following["following"] --> N3
```

### Step 2: `current.next = dummy`

Node 2's next now points to what dummy points to (node 1).

```mermaid
graph LR
    dummy["dummy"] --> N1["1"]
    N1 --> NULL1["null"]
    current["current"] --> N2["2"]
    N2 --> N1
    following["following"] --> N3["3"]
    N3 --> NULL2["null"]
```

### Step 3: `dummy = current`

```mermaid
graph LR
    dummy["dummy"] --> N2["2"]
    current["current"] --> N2
    N2 --> N1["1"]
    N1 --> NULL1["null"]
    following["following"] --> N3["3"]
    N3 --> NULL2["null"]
```

### Step 4: `current = following`

```mermaid
graph LR
    dummy["dummy"] --> N2["2"]
    N2 --> N1["1"]
    N1 --> NULL1["null"]
    current["current"] --> N3["3"]
    N3 --> NULL2["null"]
```

**End of iteration 2:** We now have `2 → 1 → null` reversed, and `current` is at `3`.

---

## Iteration 3

### Step 1: `let following = current.next`

```mermaid
graph LR
    dummy["dummy"] --> N2["2"]
    N2 --> N1["1"]
    N1 --> NULL1["null"]
    current["current"] --> N3["3"]
    N3 --> NULL2["null"]
    following["following"] --> NULL2
```

### Step 2: `current.next = dummy`

Node 3's next now points to what dummy points to (node 2).

```mermaid
graph LR
    dummy["dummy"] --> N2["2"]
    N2 --> N1["1"]
    N1 --> NULL1["null"]
    current["current"] --> N3["3"]
    N3 --> N2
```

### Step 3: `dummy = current`

```mermaid
graph LR
    dummy["dummy"] --> N3["3"]
    current["current"] --> N3
    N3 --> N2["2"]
    N2 --> N1["1"]
    N1 --> NULL1["null"]
```

### Step 4: `current = following`

```mermaid
graph LR
    dummy["dummy"] --> N3["3"]
    N3 --> N2["2"]
    N2 --> N1["1"]
    N1 --> NULL1["null"]
    current["current"] --> NULL2["null"]
```

**End of iteration 3:** `current` is null, loop exits.

---

## Final Result

```mermaid
graph LR
    dummy["dummy (return this)"] --> N3["3"]
    N3 --> N2["2"]
    N2 --> N1["1"]
    N1 --> NULL1["null"]
```

Reversed: `3 → 2 → 1 → null`

---

## The Key Point

Look at **Step 3** in any iteration. When we do `dummy = current`:

- Both variables point to the **same node**
- But that node's `.next` already points **backward** (to the previously reversed portion)
- There is no circle because `.next` points to an older node, not to itself or forward

The "circle" confusion comes from thinking `dummy = current` affects the node. It doesn't. It only changes which node the variable `dummy` refers to.