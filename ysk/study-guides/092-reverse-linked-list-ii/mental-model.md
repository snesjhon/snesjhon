# Reverse Linked List II - Mental Model

## The Train Car Reversal Analogy

Imagine a train with numbered cars connected by couplings. You need to reverse a specific section of cars (from position `left` to `right`) while keeping the rest of the train intact.

```
Original train:  🚂 [1] → [2] → [3] → [4] → [5]
                    ↑              ↑         ↑
                position 1    position 3  position 5

Task: Reverse cars from position 2 to 4

Step 1: Disconnect before position 2
🚂 [1] ╳ [2] → [3] → [4] ╳ [5]

Step 2: Reverse the middle section
🚂 [1] ╳ [4] → [3] → [2] ╳ [5]

Step 3: Reconnect everything
🚂 [1] → [4] → [3] → [2] → [5]
```

This is **exactly** how the algorithm works:
- Each train car = a linked list node
- Couplings = the `next` pointers
- Disconnect = temporarily break the chain
- Reverse = flip the pointers in the middle section
- Reconnect = attach the reversed section back

**Critical insight:** You need to know the car BEFORE position `left` to reconnect properly!

---

## Building from the Ground Up

Let's watch the pattern emerge by working through concrete examples.

### Example 1: [1,2,3,4,5], left=2, right=4

This is the classic case - reversing a middle section.

**Step 1: Find the node BEFORE the reversal starts**

```
Position:  1   2   3   4   5
Nodes:   [1]→[2]→[3]→[4]→[5]→null
          ↑   ↑
       prevNode  leftNode (position 2)
```

We need to walk to position `left - 1` (position 1). This gives us:
- `prevNode`: node at position 1
- `leftNode`: node at position 2 (where reversal starts)

**Why do we need prevNode?**
Because after reversing, we need to reconnect: `prevNode → (reversed section)`

**Step 2: Reverse the section from position 2 to 4**

Let's use the standard reversal technique on nodes 2, 3, 4:

```
Before reversal:
[2] → [3] → [4] → [5]

During reversal (flipping pointers):
[2] ← [3] ← [4]   [5]
 ↓
null

After reversal:
[2] ← [3] ← [4]   [5]
null           ↑
             (this is now our "head" of reversed section)
```

**Step 3: Reconnect the pieces**

We have three pieces to connect:
1. The "before" part: `[1]`
2. The reversed section: `[4] → [3] → [2]`
3. The "after" part: `[5]`

```
[1] → [4] → [3] → [2] → [5]
 ↑    ↑              ↑    ↑
prev  newStart       leftNode  after
```

Two connections needed:
- `prevNode.next = newStart` (connect [1] to [4])
- `leftNode.next = after` (connect [2] to [5])

Final result: `[1,4,3,2,5]` ✓

### Example 2: [1,2,3,4,5], left=1, right=3

This example reveals a critical edge case: **reversing from the head**.

**The Problem:**
```
Position:  1   2   3   4   5
Nodes:   [1]→[2]→[3]→[4]→[5]
          ↑
       leftNode (position 1)

Where's prevNode? There is none! 🚨
```

When `left = 1`, there's no node before the reversal starts.

**The Solution: Dummy Node**

We create a dummy node BEFORE the head:

```
Position: 0   1   2   3   4   5
Nodes:  [D]→[1]→[2]→[3]→[4]→[5]
         ↑   ↑
      dummy  head
```

Now `prevNode` can be the dummy node!

After reversal:
```
[D] → [3] → [2] → [1] → [4] → [5]
 ↑    ↑
dummy newHead
```

We return `dummy.next` as the new head: `[3,2,1,4,5]` ✓

**Key insight:** The dummy node acts as a "virtual car before the train" so our algorithm works uniformly regardless of where the reversal starts.

### Example 3: [1,2,3,4,5], left=2, right=2

When `left == right`, we're "reversing" a single node.

```
Position:  1   2   3   4   5
Nodes:   [1]→[2]→[3]→[4]→[5]
             ↑
          single node
```

Reversing a single node changes nothing: `[1,2,3,4,5]` ✓

**Important:** This is NOT a special case in the code! The reversal loop simply runs zero iterations, leaving everything unchanged.

### What Just Happened?

We discovered three key patterns:

1. **The prevNode is critical**: It's the anchor point for reconnection
2. **Dummy node handles edge cases**: Especially when reversing from position 1
3. **The reversal is localized**: Only the middle section changes, rest stays intact

---

## The Reversal Technique: Flipping Pointers

The core of this algorithm is the standard linked list reversal. Let's break down how pointer flipping works.

### The One-by-One Reversal Pattern

Given: `A → B → C → D → null`
Goal: `A ← B ← C ← D`

We need to change each `→` to `←`, which means changing each node's `next` pointer.

**The iteration:**
```
Step 1: Save next, flip pointer, move forward

prev = null
curr = A

Iteration 1:
  next = B (save before losing reference)
  A.next = null (flip: A → null)
  prev = A
  curr = B

Iteration 2:
  next = C
  B.next = A (flip: B → A)
  prev = B
  curr = C

Iteration 3:
  next = D
  C.next = B (flip: C → B)
  prev = C
  curr = D

Iteration 4:
  next = null
  D.next = C (flip: D → C)
  prev = D
  curr = null (done!)
```

Final state:
```
null ← A ← B ← C ← D
                  ↑
                 prev (new head)
```

**The three-pointer dance:**
1. `prev`: The node we just processed
2. `curr`: The node we're currently processing
3. `next`: The node we'll process next (saved before breaking the link)

---

## The Four-Pointer Technique for Partial Reversal

For reversing a subsection, we need to track FOUR pointers:

```typescript
prevNode   // Node BEFORE the reversal section
leftNode   // First node in the reversal section
curr       // Current node during reversal
next       // Next node to process
```

### Walking to the Start Position

```typescript
// Walk to position left-1
for (let i = 1; i < left; i++) {
  prevNode = prevNode.next;
}
leftNode = prevNode.next; // This is position 'left'
```

**Why left-1?**
Because we need the node BEFORE the reversal starts, not the first node being reversed.

### The Reversal Loop

```typescript
prev = null;
curr = leftNode;

// Reverse (right - left + 1) nodes
for (let i = 0; i < right - left + 1; i++) {
  next = curr.next;
  curr.next = prev;
  prev = curr;
  curr = next;
}
```

**How many iterations?**
- From position 2 to 4: `4 - 2 + 1 = 3` nodes
- From position 1 to 5: `5 - 1 + 1 = 5` nodes

### Understanding the Stop Condition: `right - left + 1`

This formula is **critical** and deserves deep understanding. Let's break down why we need exactly this many iterations.

#### The Counting Intuition

When you want to count how many numbers are between two positions (inclusive), you can't just subtract!

```
Count from 2 to 4:
Positions: 2, 3, 4
Count: 3 numbers

But 4 - 2 = 2 ❌ (wrong!)
We need: 4 - 2 + 1 = 3 ✓
```

**Why the +1?**
Because both endpoints are INCLUDED. If you have positions [2, 3, 4], there are 3 items, not 2.

#### Visual Counting with Nodes

Let's visualize this with [1,2,3,4,5], left=2, right=4:

```
Position:    1     2     3     4     5
            [1] → [2] → [3] → [4] → [5]
                  ↑           ↑
                 left       right

Nodes to reverse: [2], [3], [4]
Count them: 1, 2, 3 nodes

Formula: right - left + 1 = 4 - 2 + 1 = 3 ✓
```

#### More Examples to Build Intuition

**Example 1: left=1, right=1 (single node)**
```
Position:    1
            [1]
             ↑
          left & right

Nodes to reverse: [1]
Count: 1 node

Formula: 1 - 1 + 1 = 1 ✓
```

**Example 2: left=3, right=7**
```
Position:    3     4     5     6     7
            [3] → [4] → [5] → [6] → [7]
             ↑                       ↑
            left                   right

Nodes to reverse: [3], [4], [5], [6], [7]
Count: 5 nodes

Formula: 7 - 3 + 1 = 5 ✓
```

**Example 3: left=1, right=5 (entire list)**
```
Position:    1     2     3     4     5
            [1] → [2] → [3] → [4] → [5]
             ↑                       ↑
            left                   right

Nodes to reverse: all 5 nodes

Formula: 5 - 1 + 1 = 5 ✓
```

#### What Happens with Off-By-One Errors?

Let's see what breaks if we get the count wrong.

**If we use `right - left` (forgot the +1):**
```
Input: [1,2,3,4,5], left=2, right=4
Count: 4 - 2 = 2 (should be 3!)

We'd reverse only 2 nodes: [2] and [3]
Result: [1, 3, 2, 4, 5] ❌

Expected: [1, 4, 3, 2, 5] ✓
```

Node [4] gets left out!

**If we use `right - left + 2` (added too much):**
```
Input: [1,2,3,4,5], left=2, right=4
Count: 4 - 2 + 2 = 4 (should be 3!)

We'd try to reverse 4 nodes: [2], [3], [4], [5]
Result: [1, 5, 4, 3, 2] ❌

Expected: [1, 4, 3, 2, 5] ✓
```

We reversed too much—node [5] wasn't supposed to be included!

#### The Loop Iterations in Detail

Let's trace the loop for left=2, right=4:

```
Initial state:
curr = node 2 (at position left)
iterations = right - left + 1 = 3

Iteration 0 (i=0, i < 3 ✓):
  curr = node 2
  Reverse it
  Move curr to node 3

Iteration 1 (i=1, i < 3 ✓):
  curr = node 3
  Reverse it
  Move curr to node 4

Iteration 2 (i=2, i < 3 ✓):
  curr = node 4
  Reverse it
  Move curr to node 5

Iteration 3 (i=3, i < 3 ❌):
  STOP!

curr is now at node 5 (the node AFTER the reversal section)
We reversed exactly 3 nodes: 2, 3, 4 ✓
```

**Key insight:** The loop counter `i` goes from `0` to `(right - left)` inclusive, which is `(right - left + 1)` iterations total.

#### Alternative Way to Think About It

You can also think of it as:
- **Start position**: `left`
- **End position**: `right`
- **Distance**: `right - left`
- **Number of nodes**: distance + 1 (because we include both endpoints)

```
Analogy: Fence posts and sections

If you have fence posts at positions 2 and 4:
Position 2: |
Position 3: |
Position 4: |

Posts (nodes): 3
Sections (gaps): 2

Distance between first and last: 4 - 2 = 2 (sections)
Number of posts: 2 + 1 = 3 (nodes)
```

#### Why Not Use a While Loop with a Condition?

You might wonder: "Why not just check if we've reached `right` position?"

```typescript
// Alternative (but trickier):
while (curr is not at position right + 1) {
  // reverse
}
```

**Problems with this approach:**
1. You'd need to track the current position number (extra state)
2. More error-prone (easy to mess up the condition)
3. Less clear what's happening

**The counting approach is better:**
- Pre-calculate exactly how many nodes to process
- Simple loop counter
- Clear and explicit
- No position tracking needed during reversal

#### The Mathematical Proof

For positions in range [left, right] where positions are 1-indexed:

```
Number of integers from left to right (inclusive)
= (right - left + 1)

Proof by example:
Range [5, 8] contains: 5, 6, 7, 8
Count = 4
Formula: 8 - 5 + 1 = 4 ✓

General proof:
Range [a, b] contains: a, a+1, a+2, ..., b-1, b
Number of elements = (b - a + 1)
Because: (b - a) gives you the gaps, +1 includes the first element
```

This is the same formula used in mathematics for counting integers in a range!

#### Quick Reference Table

| left | right | Nodes | Formula | Result |
|------|-------|-------|---------|--------|
| 1    | 1     | [1]   | 1-1+1   | 1      |
| 1    | 5     | [1,2,3,4,5] | 5-1+1 | 5 |
| 2    | 4     | [2,3,4] | 4-2+1 | 3    |
| 3    | 3     | [3]   | 3-3+1   | 1      |
| 2    | 2     | [2]   | 2-2+1   | 1      |
| 1    | 2     | [1,2] | 2-1+1   | 2      |
| 4    | 5     | [4,5] | 5-4+1   | 2      |

**Pattern:** The formula `right - left + 1` always gives you the exact count of positions from left to right, inclusive.

---

### The Reconnection

After reversal:
- `prev`: Points to the new "head" of the reversed section (last node we reversed)
- `curr`: Points to the node AFTER the reversed section
- `leftNode`: Still points to what was the first node (now the last of reversed section)

```typescript
prevNode.next = prev;      // Connect before → reversed
leftNode.next = curr;      // Connect reversed → after
```

---

## Visualizing the Four Pointers

Let's trace [1,2,3,4,5], left=2, right=4 with all four pointers:

```
Initial:
[D] → [1] → [2] → [3] → [4] → [5]
 ↑     ↑
dummy prevNode

After walking:
[D] → [1] → [2] → [3] → [4] → [5]
       ↑     ↑
   prevNode leftNode

Reversal iteration 1: (reversing node 2)
prev = null, curr = [2], next = [3]
[2].next = null
[2] ← null

Reversal iteration 2: (reversing node 3)
prev = [2], curr = [3], next = [4]
[3].next = [2]
[2] ← [3]

Reversal iteration 3: (reversing node 4)
prev = [3], curr = [4], next = [5]
[4].next = [3]
[2] ← [3] ← [4]

After reversal:
prev = [4] (new head of reversed section)
curr = [5] (node after)
leftNode = [2] (tail of reversed section)

Reconnection:
[D] → [1] → [4] → [3] → [2] → [5]
       ↑     ↑              ↑    ↑
   prevNode prev        leftNode curr

Return dummy.next = [1]
```

---

## The Critical Edge Cases

### Edge Case 1: Reversing from Head (left = 1)

```
Input: [1,2,3], left=1, right=2
Without dummy: No prevNode! ❌

With dummy:
[D] → [1] → [2] → [3]
 ↑     ↑
dummy  head

After reversal:
[D] → [2] → [1] → [3]
       ↑
    new head

Return dummy.next ✓
```

**Why dummy is crucial:**
- Provides a consistent prevNode even when left=1
- Simplifies the code (no special case needed)
- The new head might change, but dummy.next always points to it

### Edge Case 2: Reversing the Entire List

```
Input: [1,2,3,4,5], left=1, right=5

[D] → [1] → [2] → [3] → [4] → [5] → null

After reversal:
[D] → [5] → [4] → [3] → [2] → [1] → null

Return dummy.next = [5] ✓
```

This is just a full reversal with the dummy node technique.

### Edge Case 3: Single Node Reversal (left = right)

```
Input: [1,2,3], left=2, right=2

Reversal loop runs (2-2+1) = 1 iteration
Reverses node [2] onto null, then puts it back

Result: [1,2,3] (unchanged) ✓
```

The algorithm naturally handles this—no special code needed!

### Edge Case 4: Two Adjacent Nodes

```
Input: [1,2,3], left=2, right=3

[D] → [1] → [2] → [3] → null
       ↑     ↑
   prevNode leftNode

After reversal:
[D] → [1] → [3] → [2] → null

Simple swap! ✓
```

---

## Why Not Use Extra Space?

You might think: "Why not copy the nodes to an array, reverse the array section, then rebuild the list?"

**The array approach:**
```typescript
1. Traverse list → array: [1,2,3,4,5]
2. Reverse array[left-1...right-1]: [1,4,3,2,5]
3. Build new list from array
```

**Problems:**
- Space complexity: O(n) for the array
- Three full traversals (list→array, reverse, array→list)
- Allocating new nodes or copying values
- Not truly "in-place"

**The pointer manipulation approach:**
- Space complexity: O(1) (only a few pointers)
- Single traversal (one pass!)
- No new node allocation
- True in-place modification

**This problem specifically requires O(1) space and one pass.**

---

## The "One-Pass" Requirement

The problem states: "Must solve in one pass."

What does this mean?

**One pass means:**
- Single traversal from head to the relevant nodes
- Don't revisit nodes unnecessarily
- Process each node at most once during reversal

**Our algorithm achieves this:**
```
1. Walk to position (left-1): O(left) steps
2. Reverse (right-left+1) nodes: O(right-left+1) steps
3. Total: O(left + right - left + 1) = O(right) ≈ O(n) worst case
```

We never go back and revisit nodes!

**A two-pass approach would be:**
```
Pass 1: Find left and right nodes
Pass 2: Reverse the section
```

But we combine these into one continuous walk.

---

## The Pointer Manipulation Pattern

This problem belongs to a family of problems where you:

1. **Navigate to a specific position** in a linked list
2. **Perform local modifications** (pointer changes)
3. **Reconnect sections** to maintain list integrity
4. **Use dummy nodes** to handle edge cases uniformly

Other problems with this pattern:
- **Remove Nth Node From End**: Find position, remove, reconnect
- **Rotate List**: Find split point, reconnect tail to head
- **Swap Nodes in Pairs**: Swap adjacent nodes throughout
- **Reverse Nodes in k-Group**: Reverse in chunks of k

**The natural solution:** Track key positions with pointers, modify locally, reconnect carefully.

---

## The Key Insight: The Four Connection Points

The entire algorithm boils down to managing four connection points:

```
Before:  [prevNode] → [leftNode] → ... → [rightNode] → [afterNode]
                      └─── section to reverse ────┘

After:   [prevNode] → [rightNode] → ... → [leftNode] → [afterNode]
                      └─── reversed section ──────┘
```

The algorithm must:
1. **Find** these four points
2. **Reverse** the middle section
3. **Reconnect** at the boundaries

```typescript
// The two critical reconnections:
prevNode.next = rightNode;  // Before → new start
leftNode.next = afterNode;  // New end → after
```

Everything else is bookkeeping!

---

## Common Misconceptions

### ❌ "I need to find the rightNode before reversing"
Not really! During reversal, the `curr` pointer naturally arrives at `rightNode.next`. We don't need to pre-find it.

### ❌ "I should reverse by creating new nodes"
No! We're modifying pointers in-place. No new nodes are created.

### ❌ "The dummy node is only for when left=1"
While it's critical for left=1, using it uniformly simplifies the code. It's easier to always use it than to special-case.

### ❌ "I need to handle left=right as a special case"
No! The reversal loop naturally handles single-node "reversals" by doing one iteration that changes nothing.

### ❌ "I need to track both leftNode and rightNode from the start"
No! We find leftNode before reversing, and rightNode emerges naturally during the reversal process.

### ❌ "This is like reversing the whole list"
It's related, but with extra bookkeeping: finding positions, tracking boundaries, and reconnecting sections.

---

## The Mental Model Checklist

Before coding, make sure you understand:

- [ ] **The dummy node technique**: Handles left=1 uniformly
- [ ] **The four pointers**: prevNode, leftNode, curr, next
- [ ] **The walking phase**: Get to position (left-1)
- [ ] **The reversal phase**: Standard pointer flipping for (right-left+1) nodes
- [ ] **The reconnection**: prevNode→reversed, leftNode→after
- [ ] **The return value**: dummy.next (the new or same head)
- [ ] **Why it's one pass**: Walk + reverse + reconnect = single traversal

---

## The Algorithm Flow

```
1. Create dummy node pointing to head
2. Walk (left-1) steps to find prevNode
3. Set leftNode = prevNode.next
4. Reverse (right-left+1) nodes using standard technique
5. After reversal, prev points to new head of reversed section
6. After reversal, curr points to node after the reversed section
7. Reconnect: prevNode.next = prev
8. Reconnect: leftNode.next = curr
9. Return dummy.next
```

Each step follows naturally from the previous one.

---

## Visualizing the Complete Flow

Let's trace [1,2,3,4,5], left=2, right=4 from start to finish:

```
Step 1: Setup
[D] → [1] → [2] → [3] → [4] → [5] → null
 ↑
dummy

Step 2: Walk to left-1 (position 1)
[D] → [1] → [2] → [3] → [4] → [5] → null
       ↑
   prevNode

Step 3: Set leftNode
[D] → [1] → [2] → [3] → [4] → [5] → null
       ↑     ↑
   prevNode leftNode

Step 4-6: Reverse nodes 2→3→4
[D] → [1]   [2] ← [3] ← [4]   [5] → null
       ↑     ↑              ↑   ↑
   prevNode leftNode      prev curr

Step 7-8: Reconnect
[D] → [1] → [4] → [3] → [2] → [5] → null
 ↑
dummy

Step 9: Return dummy.next
Result: [1,4,3,2,5] ✓
```

---

## Try It Yourself

Before looking at code, trace [1,2,3,4,5], left=1, right=3 by hand:

1. Draw the dummy node and original list
2. Walk to position (left-1) = 0 (stay at dummy)
3. Identify leftNode
4. Reverse 3 nodes: how many iterations?
5. What does prev point to after reversal?
6. What does curr point to after reversal?
7. Draw the reconnections
8. What is dummy.next?

You should get: `[3,2,1,4,5]`

---

## Ready for the Solution?

Now that you have the mental model:
- You understand **why** the dummy node is essential
- You see **how** the four pointers track positions and changes
- You know **what** the reversal and reconnection steps do
- You recognize **the pattern** (pointer manipulation with careful reconnection)

The actual code is just translating this mental model into the pointer operations we've visualized.

When you're ready, check out the implementation!
