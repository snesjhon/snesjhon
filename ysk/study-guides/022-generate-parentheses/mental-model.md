# Generate Parentheses - Mental Model

## The Mountain Climber Analogy

Imagine you're a mountain climber planning routes. You start at ground level and want to explore every possible path:

```
     /\        Peak
    /  \
   /    \      Going up: (
  /      \     Going down: )
 /        \
-----------    Ground level
```

**The Rules:**
1. You can climb up (`(`) whenever you want (until you reach max height `n`)
2. You can only descend (`)`) if you've climbed up first
3. Every complete journey goes up `n` times and down `n` times, ending at ground level

This is **exactly** how parentheses work:
- `(` = going up
- `)` = going down
- You can't go below ground (can't have more `)` than `(`)
- Every valid route ends at ground level (balanced)

---

## Building from the Ground Up

Let's watch the pattern emerge by starting tiny.

### n = 1: One Pair

With 1 pair, there's literally only one way:

```
()
```

You go up once, then down once. Done.

### n = 2: Two Pairs

Now it gets interesting. Let's build these step by step and see what happens:

```
Start: ""

Step 1: Add the first character
  Can we add ')'? No! We're at ground level, can't go down
  Must add '(': "("

Step 2: Now we have "("
  Can we add '('? Yes! We're at height 1, can go higher
  Can we add ')'? Yes! We're at height 1, can descend

  So we split into TWO possibilities:
    Branch A: "(("
    Branch B: "()"
```

**This is the key moment:** We just discovered that paths BRANCH based on what's valid.

Let's follow Branch A:

```
Branch A: "(("
  Height: 2
  Can add '('? No! We've used both up-moves (n=2)
  Must add ')': "(()"

  From "(()"
    Height: 1
    Can add '('? No! Used all up-moves
    Must add ')': "(())"

  Done! First valid combination: "(())"
```

Now Branch B:

```
Branch B: "()"
  Height: 0 (we went back to ground)
  Can add '('? Yes! Haven't used all up-moves
  Can add ')'? No! Already at ground level
  Must add '(': "()("

  From "()("
    Height: 1
    Must add ')': "()()"

  Done! Second valid combination: "()()"
```

**Result for n=2:** `["(())", "()()"]`

### What Just Happened?

We discovered the **decision tree**. Each time we have a choice (can add either `(` or `)`), the path splits. When we have no choice, the path continues straight.

```
                    ""
                    ↓
                   "("
                  /   \
              "(("     "()"
               ↓        ↓
             "(()"     "()("
               ↓        ↓
            "(())" ✓  "()()" ✓
```

---

## The Two Constraints (and Why They Exist)

### Constraint 1: The Budget - `opened < n`

You only have `n` opening parentheses to use. Once you've placed all `n`, you can't add more `(`.

**Why this works:**
```
n = 2, currently "(("
opened_count = 2
Can we add more '('?
  → opened_count (2) < n (2)?
  → NO!
```

This prevents paths like `"((("` when n=2.

### Constraint 2: The Balance - `closed < opened`

You can only add `)` if you have **more** `(` than `)` so far. This ensures every `)` has a matching `(` before it.

**Why this works:**
```
Example: "()"
opened = 1, closed = 1
Can we add ')'?
  → closed (1) < opened (1)?
  → NO! (not less than, equal)

We'd create "))" which goes "below ground"
```

This prevents invalid sequences like `)()` or `())`.

**These constraints act as guardrails** - they only allow valid paths.

---

## Why Not Just Generate Everything and Filter?

You might think: "Why not just generate all possible combinations and filter out the bad ones?"

Let's see why that's terrible:

For n=2, you need 4 characters. If we place `(` or `)` randomly:
- Position 1: 2 choices
- Position 2: 2 choices
- Position 3: 2 choices
- Position 4: 2 choices

Total: 2^4 = 16 possible strings

```
All 16 possibilities:
(((( )((( ()(( ))(( ((()  )(()  ()()  ))()
((() )(()  ()(}  ))(}  (()] )()] ()])) ))))
```

Only 2 are valid! That's a 12.5% hit rate.

**For n=10:**
- Generate-and-filter: 2^20 = 1,048,576 strings
- Valid combinations: only 16,796
- Hit rate: 1.6%

This is why we use **constrained exploration** instead - only walk paths that could be valid.

---

## Visualizing the Full Tree for n=3

Here's the complete decision tree for n=3 (5 valid combinations):

```
                                ""
                                ↓
                               "("
                        _______|_______
                       /               \
                    "(("               "()"
                _____|_____         ___|___
               /           \       /       \
            "((("         "(()"  "()("     "()](can't go down)"
              ↓          __|__     ↓
            "((())"    /      \  "()(()"
              ↓     "((())"  "(()()" ↓
            "((()))"   ↓        ↓    "()()()"
               ✓    "((())" "(())()   ✓
                       ↓        ✓
                    "(()())"
                       ✓
```

Wait, let me redo this more carefully:

```
Level 0:                    ""
                            ↓
Level 1:                   "("
                      _____|_____
                     /           \
Level 2:          "(("           "()"
                 /    \           /  \
Level 3:      "((("  "(()"    "()("  [invalid]
                ↓     /  \       ↓
Level 4:     "((())" "(()(" "(()()"  "()(()"
               ↓       ↓      ↓        ↓
Level 5:   "((()))" "(()())" "(())()" "()(()"
              ✓       ↓         ✓       ↓
Level 6:          "(()())"          "()(())"
                     ✓                 ✓
```

Actually, let me just show the 5 valid combinations and how they form:

1. `"((()))"` - Go up 3 times, then down 3 times
2. `"(()())"` - Up 2, down 1, up 1, down 2
3. `"(())()"` - Up 2, down 2, up 1, down 1
4. `"()(())"` - Up 1, down 1, up 2, down 2
5. `"()()()"` - Up-down-up-down-up-down

Each represents a different way to climb to height 3 and return to ground.

---

## The "Building Under Constraints" Pattern

This problem belongs to a family of problems where you:

1. **Build something incrementally** (one character at a time)
2. **Have multiple choices at each step** (add `(` or add `)`)
3. **Choices are constrained** (the two rules)
4. **Want ALL valid solutions** (not just one)

Other problems with this pattern:
- Generating all permutations with constraints
- Solving a sudoku (try numbers 1-9, constraints from rows/cols)
- The N-Queens problem (place queens, can't attack each other)

**The natural solution:** Explore like a tree, trying each valid choice, and "undo" (backtrack) when you hit a dead end or complete a solution.

---

## The Key Insight: Pruning

The beautiful part about using constraints is **pruning** - we never even explore invalid branches.

```
                    ""
                    ↓
                   "("
                [can't start with ')']
```

At the very first step, we could theoretically add `)`, but our constraint prevents it. That entire branch of the tree (which would all be invalid) is **pruned** - never explored.

**This is the difference between:**
- **Brute force:** Generate all 2^(2n) possibilities, filter later (slow)
- **Backtracking:** Only explore valid paths using constraints (fast)

---

## Counting the Combinations: Catalan Numbers

The number of valid parentheses combinations for `n` pairs follows a famous sequence called **Catalan numbers**.

```
C(0) = 1   → ""
C(1) = 1   → "()"
C(2) = 2   → "(())", "()()"
C(3) = 5   → the 5 combinations we showed
C(4) = 14
C(5) = 42
C(10) = 16,796
```

Formula: `C(n) = (2n)! / ((n+1)! × n!)`

**Why does this matter?**
- It tells you how many solutions to expect
- It grows fast, but not as fast as 2^(2n)
- Many problems have Catalan number solutions (binary trees, mountain ranges, etc.)

---

## From Mental Model to Algorithm

Now that you understand the structure, here's what you need to solve it:

### State to Track
```
- current_string: what we've built so far
- opened: how many '(' we've used
- closed: how many ')' we've used
```

### Decisions at Each Step
```
If opened < n:
  → Can add '('
  → Explore that path

If closed < opened:
  → Can add ')'
  → Explore that path
```

### Base Case
```
If current_string.length == 2*n:
  → We have a complete valid combination
  → Save it to results
  → Stop this path
```

### The Exploration Pattern
This is called **backtracking**:
1. Make a choice (add `(` or `)`)
2. Explore that path (recursive call)
3. When the path completes, automatically "undo" and try other choices

The function call stack handles the "undo" part automatically - when a recursive call returns, you're back to the previous state.

---

## Common Misconceptions

### ❌ "I need to track which positions are opened/closed"
No! You only need **counts**. The string itself remembers the positions.

### ❌ "I need to validate the string at the end"
No! The constraints ensure you only build valid strings. If you follow the rules, every complete string is automatically valid.

### ❌ "I need to avoid duplicates somehow"
No! The tree structure ensures each path is unique. You can't reach the same state via different paths because you're building character-by-character.

### ❌ "This is like permutations"
Not quite. Permutations rearrange existing elements. Here, we're building new strings with constraints on what comes next.

---

## Try It Yourself

Before looking at the code, try tracing n=2 by hand:

1. Start with `""`, `opened=0`, `closed=0`
2. What are your valid choices?
3. Pick one, update your state
4. Repeat until you have a complete string
5. Backtrack and try other choices

You should end up with the same tree structure we showed earlier.

---

## Ready for the Solution?

Now that you have the mental model:
- You understand **why** we need two constraints
- You see **how** the decision tree naturally emerges
- You know **what** makes a path valid vs invalid
- You recognize **the pattern** (backtracking with constraints)

The actual code is just translating this mental model into functions and recursive calls.

When you're ready, check out [study-guide.md](./study-guide.md) for the implementation.