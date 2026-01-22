# Recursion: How to Think About It

#pattern/recursion

A guide focused on **mental models** for approaching recursive problems, not just code templates.

---

## The Core Mental Shift

Most people think **iteratively** by default:
> "Start at the beginning, do something, move forward, repeat"

Recursion requires a different mindset:
> "Assume the smaller version is already solved. How do I use that?"

```mermaid
graph LR
    subgraph "Iterative Thinking"
        I1["Start"] --> I2["Step 1"] --> I3["Step 2"] --> I4["..."] --> I5["Done"]
    end
```

```mermaid
graph TB
    subgraph "Recursive Thinking"
        R1["Big Problem"]
        R2["Smaller Problem<br/>(trust it's solved)"]
        R3["Combine"]

        R1 --> R2
        R2 --> R3
        R3 --> R1
    end

    style R2 fill:#90EE90
```

---

## The Three Questions Framework

Every recursive solution answers these three questions:

```mermaid
graph TD
    Q1["1.BASE CASE<br/>When do I stop?"]
    Q2["2.RECURSIVE CASE<br/>How do I make the problem smaller?"]
    Q3["3.COMBINATION<br/>How do I use the smaller result?"]

    Q1 --> Q2 --> Q3

    style Q1 fill:#FFB6C1
    style Q2 fill:#87CEEB
    style Q3 fill:#90EE90
```

### The Questions Applied

| Question | Purpose | Example (Sum Array) |
|----------|---------|---------------------|
| **Base case** | Prevent infinite recursion | Empty array → return 0 |
| **Recursive case** | Make problem smaller | Sum of rest of array |
| **Combination** | Build up the answer | First element + sum of rest |

---

## Mental Model 1: The Leap of Faith

**The hardest part of recursion**: Trust that the recursive call works **without tracing through it**.

```mermaid
graph TB
    subgraph "The Leap of Faith"
        Problem["reverseString('hello')"]
        Assume["ASSUME: reverseString('ello')<br/>correctly returns 'olle'"]
        Use["Now just figure out:<br/>How do I use 'olle' to get 'olleh'?"]
        Answer["Answer: 'olle' + 'h' = 'olleh'"]
    end

    Problem --> Assume
    Assume --> Use
    Use --> Answer

    style Assume fill:#FFD700,stroke:#333,stroke-width:2px
    style Answer fill:#90EE90
```

### Why This Works

You're not ignoring the recursive call—you're **defining what it should do**. If you define it correctly for `n`, and it works for the base case, mathematical induction guarantees it works for all cases.

```mermaid
graph LR
    Base["Base case works"] --> Trust["Trust n-1 works"]
    Trust --> Build["Build n from n-1"]
    Build --> Works["n works!"]

    style Base fill:#90EE90
    style Trust fill:#FFD700
    style Works fill:#90EE90
```

---

## Mental Model 2: The Decision Tree

Many recursive problems are about **exploring all possibilities**. Think of recursion as walking through a tree of choices.

```mermaid
graph TD
    Root["Start: Make first choice"]

    Root --> A["Choice A"]
    Root --> B["Choice B"]

    A --> A1["Sub-choice 1"]
    A --> A2["Sub-choice 2"]

    B --> B1["Sub-choice 1"]
    B --> B2["Sub-choice 2"]

    A1 --> L1["Leaf (base case)"]
    A2 --> L2["Leaf"]
    B1 --> L3["Leaf"]
    B2 --> L4["Leaf"]

    style Root fill:#FFB6C1
    style L1 fill:#90EE90
    style L2 fill:#90EE90
    style L3 fill:#90EE90
    style L4 fill:#90EE90
```

### Key Insight

At each node:
1. Make a choice
2. Recursively handle remaining choices
3. (For backtracking) Undo the choice and try another

---

## Mental Model 3: State at Each Level

Think about **what information each recursive call needs** and **what it returns**.

```mermaid
graph TD
    subgraph "Function Call Stack"
        F1["Call 1<br/>state: full problem"]
        F2["Call 2<br/>state: smaller problem"]
        F3["Call 3<br/>state: even smaller"]
        F4["Call 4<br/>state: base case"]
    end

    F1 -->|"calls"| F2
    F2 -->|"calls"| F3
    F3 -->|"calls"| F4

    F4 -->|"returns base result"| F3
    F3 -->|"returns combined"| F2
    F2 -->|"returns combined"| F1

    style F1 fill:#e6f3ff
    style F4 fill:#90EE90
```

Ask yourself:
- What **changes** between calls? (This becomes a parameter)
- What **stays the same**? (This can be shared or constant)
- What does each level **return**?

---

## Pattern 1: Linear Recursion

**Structure**: Each call makes exactly ONE recursive call.

```mermaid
graph LR
    A["f(n)"] --> B["f(n-1)"] --> C["f(n-2)"] --> D["..."] --> E["f(base)"]

    style A fill:#e6f3ff
    style E fill:#90EE90
```

### Examples
- Factorial: `n! = n * (n-1)!`
- Sum array: `sum([1,2,3]) = 1 + sum([2,3])`
- Reverse string: `reverse("abc") = reverse("bc") + "a"`

### Template

```typescript
function linearRecursion(input) {
  // 1. Base case
  if (isBaseCase(input)) {
    return baseCaseResult;
  }

  // 2. Make problem smaller
  const smallerInput = makeSmallerProblem(input);

  // 3. Recursive call + combine
  return combine(
    currentPiece(input),
    linearRecursion(smallerInput)
  );
}
```

### Thinking Through: Reverse String

```mermaid
graph TD
    subgraph "reverseString('hello')"
        A["Input: 'hello'"]
        B["Base case? No (length > 0)"]
        C["Smaller problem: reverse('ello')"]
        D["Trust: reverse('ello') = 'olle'"]
        E["Current piece: 'h'"]
        F["Combine: 'olle' + 'h' = 'olleh'"]
    end

    A --> B --> C --> D --> E --> F

    style D fill:#FFD700
    style F fill:#90EE90
```

---

## Pattern 2: Tree Recursion

**Structure**: Each call makes MULTIPLE recursive calls.

```mermaid
graph TD
    A["f(n)"]
    B["f(n-1)"]
    C["f(n-1)"]
    D["f(n-2)"]
    E["f(n-2)"]
    F["f(n-2)"]
    G["f(n-2)"]

    A --> B
    A --> C
    B --> D
    B --> E
    C --> F
    C --> G

    style A fill:#e6f3ff
```

### Examples
- Fibonacci: `fib(n) = fib(n-1) + fib(n-2)`
- Binary tree traversal: recurse on left AND right
- Generate all subsets: include element OR exclude element

### Key Insight

Tree recursion often explores **all combinations** or **all paths**:

```mermaid
graph TD
    subgraph "Subsets of [1,2]"
        Root["Start: []"]

        Root -->|"include 1"| A["[1]"]
        Root -->|"exclude 1"| B["[]"]

        A -->|"include 2"| C["[1,2]"]
        A -->|"exclude 2"| D["[1]"]

        B -->|"include 2"| E["[2]"]
        B -->|"exclude 2"| F["[]"]
    end

    style C fill:#90EE90
    style D fill:#90EE90
    style E fill:#90EE90
    style F fill:#90EE90
```

---

## Pattern 3: Accumulator Pattern

**Problem with basic recursion**: Results build up on the **return path**.

**Accumulator solution**: Build results on the **way down** by passing state.

```mermaid
graph LR
    subgraph "Basic Recursion"
        A1["sum([1,2,3])"]
        A2["sum([2,3])"]
        A3["sum([3])"]
        A4["sum([])"]
    end

    A1 -->|"calls"| A2 -->|"calls"| A3 -->|"calls"| A4
    A4 -->|"0"| A3
    A3 -->|"3+0=3"| A2
    A2 -->|"2+3=5"| A1
    A1 -->|"1+5=6"| R1["Result: 6"]
```

```mermaid
graph LR
    subgraph "Accumulator Pattern"
        B1["sum([1,2,3], acc=0)"]
        B2["sum([2,3], acc=1)"]
        B3["sum([3], acc=3)"]
        B4["sum([], acc=6)"]
    end

    B1 -->|"acc+1=1"| B2 -->|"acc+2=3"| B3 -->|"acc+3=6"| B4
    B4 -->|"return 6"| R2["Result: 6"]

    style B4 fill:#90EE90
```

### When to Use Accumulators

- Building up a **collection** (string, array, path)
- Generating **all solutions** (pass current state to collect valid ones)
- **Backtracking** (accumulator is the current "path")

```typescript
// Without accumulator - builds result on return
function reverse(s: string): string {
  if (s.length === 0) return "";
  return reverse(s.slice(1)) + s[0];
}

// With accumulator - builds result going down
function reverse(s: string, acc = ""): string {
  if (s.length === 0) return acc;
  return reverse(s.slice(1), s[0] + acc);
}
```

---

## Example Problems

These patterns are best understood through practice. See:

- [[ysk/study-guides/022-generate-parentheses/study-guide]] — Tree recursion with constrained choices (backtracking)
- [[078-subsets]] — Tree recursion with include/exclude choices

---

## The Backtracking Pattern

Backtracking is recursion + **undo**. You explore a path, and if it doesn't work (or after collecting the result), you **undo your last choice** and try a different path.

```mermaid
graph TD
    subgraph "Backtracking Flow"
        A["Make a choice"]
        B["Recurse deeper"]
        C["Check: valid solution?"]
        D["Collect result"]
        E["Undo the choice"]
        F["Try next choice"]
    end

    A --> B --> C
    C -->|"yes"| D --> E
    C -->|"no/done"| E
    E --> F

    style A fill:#87CEEB
    style E fill:#FFD700
```

### The Template

```typescript
function backtrack(state, choices, results) {
  // Base case: found a valid solution
  if (isComplete(state)) {
    results.push(copy(state));
    return;
  }

  for (const choice of getValidChoices(choices)) {
    // Make choice
    applyChoice(state, choice);

    // Recurse
    backtrack(state, remainingChoices, results);

    // UNDO choice (this is the "backtrack")
    undoChoice(state, choice);
  }
}
```

### Visual: Backtracking in Action

```mermaid
sequenceDiagram
    participant S as State
    participant C as Choices

    Note over S: state = []
    S->>C: Choose 1
    Note over S: state = [1]
    S->>C: Choose 2
    Note over S: state = [1,2]
    S->>C: No more choices → save [1,2]
    Note over S: BACKTRACK: remove 2
    Note over S: state = [1]
    S->>C: Choose 3
    Note over S: state = [1,3]
    S->>C: No more choices → save [1,3]
    Note over S: BACKTRACK: remove 3
    Note over S: state = [1]
    Note over S: BACKTRACK: remove 1
    Note over S: state = []
    S->>C: Choose 2
    Note over S: state = [2]
```

---

## Common Recursion Patterns Summary

```mermaid
graph TD
    subgraph "Choose Your Pattern"
        Q["What kind of problem?"]

        Q --> Linear["Single path?<br/>→ Linear Recursion"]
        Q --> Tree["All combinations?<br/>→ Tree Recursion"]
        Q --> Back["Explore & undo?<br/>→ Backtracking"]
        Q --> Acc["Build collection?<br/>→ Accumulator"]
        Q --> Memo["Overlapping work?<br/>→ Memoization"]
    end

    style Linear fill:#e6f3ff
    style Tree fill:#87CEEB
    style Back fill:#FFD700
    style Acc fill:#FFB6C1
    style Memo fill:#90EE90
```

| Pattern | Use When | Examples |
|---------|----------|----------|
| **Linear** | One path through data | Factorial, list sum, string reverse |
| **Tree** | Multiple paths to explore | Fibonacci, subsets, permutations |
| **Backtracking** | Need to undo choices | N-Queens, sudoku, generate parentheses |
| **Accumulator** | Building up result | String building, path tracking |
| **Memoization** | Same subproblems repeat | Fibonacci, climbing stairs, coin change |

---

## How to Approach a New Recursive Problem

```mermaid
flowchart TD
    Start["See a new problem"] --> Q1

    Q1{"Can I express the<br/>solution in terms of<br/>a smaller version?"}
    Q1 -->|"No"| NotRec["Maybe not recursive"]
    Q1 -->|"Yes"| Q2

    Q2["Define: What's the<br/>SMALLEST input?<br/>(base case)"]
    Q2 --> Q3

    Q3["Define: How do I<br/>SHRINK the input?<br/>(recursive case)"]
    Q3 --> Q4

    Q4["Define: How do I<br/>COMBINE results?"]
    Q4 --> Q5

    Q5{"Multiple choices<br/>at each step?"}
    Q5 -->|"Yes"| Back["Use backtracking"]
    Q5 -->|"No"| Lin["Use linear recursion"]

    Q6{"Building a collection<br/>during traversal?"}
    Back --> Q6
    Lin --> Q6
    Q6 -->|"Yes"| Acc["Add accumulator parameter"]
    Q6 -->|"No"| Done["Write the code"]
    Acc --> Done

    style Q1 fill:#FFB6C1
    style Q2 fill:#87CEEB
    style Q3 fill:#87CEEB
    style Q4 fill:#87CEEB
    style Done fill:#90EE90
```

---

## Practice Problems by Concept

### Level 1: Linear Recursion
- [ ] Factorial
- [ ] Sum of array
- [ ] Reverse string
- [ ] Check if palindrome
- [ ] Power of two

### Level 2: Tree Recursion (Accumulator)
- [ ] Fibonacci
- [ ] Subsets
- [ ] Climbing stairs
- [ ] Generate binary strings of length n

### Level 3: Backtracking
- [ ] Generate Parentheses
- [ ] Permutations
- [ ] Combinations
- [ ] Letter combinations of phone number
- [ ] N-Queens

---

## Common Mistakes and How to Avoid Them

### Mistake 1: Missing Base Case

```mermaid
graph LR
    A["Call"] --> B["Call"] --> C["Call"] --> D["..."] --> E["Stack Overflow!"]

    style E fill:#ff6b6b,color:#fff
```

**Fix**: Always ask "When should I stop?"

### Mistake 2: Not Making Problem Smaller

```typescript
// WRONG: n doesn't change
function bad(n) {
  if (n === 0) return 0;
  return bad(n); // infinite recursion!
}
```

**Fix**: Each recursive call MUST use a "smaller" input.

### Mistake 3: Tracing Through Recursion

Don't try to trace every call in your head. Instead:
1. Trust the recursive call works
2. Focus on: "If I have the answer to the smaller problem, how do I build my answer?"

### Mistake 4: Forgetting to Copy in Backtracking

```typescript
// WRONG: all results point to same array
result.push(current);

// RIGHT: push a copy
result.push([...current]);
```

### Mistake 5: Not Undoing State Changes

```typescript
// WRONG: state change persists
current.push(choice);
backtrack(current);
// forgot to pop!

// RIGHT: undo the change
current.push(choice);
backtrack(current);
current.pop(); // undo!
```

---

## Mental Exercises

### Exercise 1: Describe the Leap

For each problem, complete: "Assume `f(smaller)` correctly returns ___. Then `f(current)` = ___."

| Problem | Leap of Faith |
|---------|---------------|
| `sum([1,2,3])` | Assume `sum([2,3])` returns 5. Then `sum([1,2,3])` = 1 + 5 = 6 |
| `reverse("abc")` | Assume `reverse("bc")` returns "cb". Then `reverse("abc")` = "cb" + "a" = "cba" |
| `countNodes(tree)` | Assume `countNodes(left)` and `countNodes(right)` return correct counts. Then total = 1 + left + right |

### Exercise 2: Draw the Tree

Before coding, sketch the decision tree for small inputs. This reveals:
- What choices exist at each step
- Where to prune invalid paths
- What state to track

### Exercise 3: Identify the State

For each problem, identify:
- What changes between recursive calls? (parameters)
- What stays constant? (can be outside the recursion)
- What needs to be returned?

---

## Key Takeaways

```mermaid
graph TD
    subgraph "Recursion Mental Model"
        T1["Trust the recursive call<br/>(leap of faith)"]
        T2["Ask: base case, shrink, combine"]
        T3["Think in terms of choices<br/>(decision tree)"]
        T4["Use accumulator for collections"]
        T5["Backtrack = recurse + undo"]
    end

    T1 --> T2 --> T3 --> T4 --> T5

    style T1 fill:#FFD700
    style T5 fill:#90EE90
```

1. **Don't trace—trust**. Define what the function does, trust smaller calls work.
2. **Three questions**: Base case? Shrink? Combine?
3. **Decision trees** make the structure visible
4. **Accumulators** carry state down the recursion
5. **Backtracking** = make choice, recurse, undo choice

---

## Next Steps

After mastering these mental models:
1. Practice problems from each level above
2. Move to [[tree-problems]] (trees are recursive structures)
3. Then [[graph-problems]] (graphs use similar DFS patterns)
4. Finally [[dynamic-programming]] (recursion + memoization)

**Remember**: Recursion is a way of **thinking**, not just a technique. Once it clicks, you'll see it everywhere.
