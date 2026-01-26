# Merge Sorted Array - Mental Model

## The Bookshelf Analogy

Imagine you have two stacks of books, both already sorted by size (smallest to largest). You need to merge them onto a single bookshelf, keeping them sorted.

```
Shelf (nums1): [1, 3, 5, _, _, _]  ← Has 3 empty slots at the end
Stack (nums2): [2, 4, 6]           ← Needs to merge in

Goal: [1, 2, 3, 4, 5, 6]
(All books sorted on one shelf)
```

**The Rules:**
1. The shelf already has some books and exactly enough empty slots for the remaining books
2. Both stacks are already sorted (smallest to largest)
3. You need to keep everything sorted after merging
4. You can only use the shelf space (no extra shelves)

**The key insight:** Start from the back of the shelf, not the front!

---

## Building from the Ground Up

Let's see why working backwards is the natural solution.

### The Simplest Case: One Book in Each

```
Shelf: [5, _]
Stack: [8]

Compare: 8 > 5
Place 8 at the back: [5, 8] ✓
```

Simple! The larger book goes in the back slot.

### Adding Complexity: Two Books Each

```
Shelf: [3, 7, _, _]
Stack: [5, 9]

Looking from the end:
- Last shelf book: 7
- Last stack book: 9
```

**Step 1: Compare the largest books**
```
Shelf: [3, 7, _, _]
           ↑ 
Stack: [5, 9]
           ↑ 

Compare: 7 vs 9
9 is bigger, place it in the last slot
Result: [3, 7, _, 9]
```

**Step 2: Move to next largest**
```
Shelf: [3, 7, _, 9]
           ↑ 
Stack: [5]
        ↑

Compare: 7 vs 5
7 is bigger, place it
Result: [3, _, 7, 9]
```

**Step 3: Only stack books left**
```
Shelf: [3, _, 7, 9]
Stack: [5]
       ↑
     stack

Just place 5
Result: [3, 5, 7, 9] ✓
```

---

## What Just Happened?

We discovered that by working **backwards** (from largest to smallest):
1. We always have empty space to place books (no shifting needed)
2. We compare the largest remaining books from each source
3. We place the winner in the rightmost empty slot
4. We naturally handle the merge without extra space

**This is the key pattern:** Fill from the back, compare the largest, place the winner.

---

## Why Not Start From The Front?

Let's see what happens if we try the "obvious" approach:

```
Shelf: [3, 7, _, _]
Stack: [5, 9]
```

**Starting from the front:**
```
Compare: 3 vs 5
3 is smaller, it should stay first
But wait... where do we put 5?

Option A: Shift everything right
[3, _, 7, _] → insert 5 → [3, 5, 7, _]
Then shift again for 9...
❌ Lots of shifting! O(n²) operations
```

**Starting from the back:**
```
Compare: 7 vs 9
Place 9 at position 3: [3, 7, _, 9]
No shifting needed! ✓
```

**The insight:** Empty space is at the end. If you work backwards into that space, you never overwrite books you still need!

---

## The Three Bookmarks

To track where we are, we use three bookmarks:

```
Shelf: [3, 7, _, _]
        ↑  ↑     ↑
        |  i     k
        |  (last real book)  (last slot)
        |
Stack: [5, 9]
             ↑
             j
        (last stack book)
```

- **i**: Points to the last actual shelf book (before empty slots)
- **j**: Points to the last stack book
- **k**: Points to the slot we're filling next (working backwards)

**The process:**
1. Compare shelf[i] vs stack[j]
2. Place the larger one at slot[k]
3. Move the winning bookmark (and k) backward
4. Repeat

---

## Tracing a Full Example

`shelf = [1, 3, 5, _, _, _]`, `m = 3`
`stack = [2, 4, 6]`, `n = 3`

**Setup:**
```
i = 2 (pointing at 5)
j = 2 (pointing at 6)
k = 5 (last slot)
```

**Step 1:**
```
Compare: shelf[2]=5 vs stack[2]=6
Winner: 6 (bigger)
Place at k=5: [1, 3, 5, _, _, 6]
Move: j--, k--
```

**Step 2:**
```
i=2, j=1, k=4
Compare: shelf[2]=5 vs stack[1]=4
Winner: 5
Place at k=4: [1, 3, 5, _, 5, 6]
Move: i--, k--
```

**Step 3:**
```
i=1, j=1, k=3
Compare: shelf[1]=3 vs stack[1]=4
Winner: 4
Place at k=3: [1, 3, 5, 4, 5, 6]
Move: j--, k--
```

**Step 4:**
```
i=1, j=0, k=2
Compare: shelf[1]=3 vs stack[0]=2
Winner: 3
Place at k=2: [1, 3, 3, 4, 5, 6]
Move: i--, k--
```

**Step 5:**
```
i=0, j=0, k=1
Compare: shelf[0]=1 vs stack[0]=2
Winner: 2
Place at k=1: [1, 2, 3, 4, 5, 6]
Move: j--, k--
```

**Step 6:**
```
i=0, j=-1, k=0
Stack is empty!
Remaining shelf books are already in place.
Done! ✓
```

---

## The Two Edge Cases

### Case 1: Stack Runs Out First (j < 0)

```
Shelf: [1, 3, 5, _, _]
Stack: [4]

After placing 4:
[1, 3, 5, 4, _]

Stack empty, but shelf still has books (1, 3, 5).
```

**What to do?** Nothing! The remaining shelf books are already sorted and in the correct positions.

Think about it: if the shelf had `[1, 2, 3]` and the stack runs out, those books are already where they belong.

### Case 2: Shelf Runs Out First (i < 0)

```
Shelf: [5, _, _]
Stack: [2, 4]

After placing 5:
[_, _, 5]

Shelf empty, but stack still has books (2, 4).
```

**What to do?** Copy the remaining stack books into the remaining slots.

These are the smaller books that go at the front. Just place them:
```
[2, 4, 5] ✓
```

---

## Why This Works: The Space Insight

**The problem gives us a gift:** `nums1` has length `m + n` with the last `n` slots empty.

```
[actual books...] [empty slots...]
      m books          n slots
```

This is perfect for working backwards because:
1. We have exactly `n` empty slots
2. We need to merge `n` stack books
3. By starting from the back, we fill those empty slots first
4. We never overwrite shelf books we haven't processed yet

**It's like:** The problem pre-allocated the workspace at the end, so we use it!

---

## Common Misconceptions

### ❌ "I need a temporary array"

No! The empty slots at the end of `nums1` ARE your temporary space. You're filling them backwards as you merge.

### ❌ "Working backwards is slower"

No! It's the same O(m+n) time. You visit each book exactly once, just in reverse order.

### ❌ "I need to handle when nums2 is longer than nums1"

No! The problem guarantees `nums1` has length `m + n`. There's always enough space.

### ❌ "I need to copy remaining nums1 elements at the end"

No! If `nums1` books are left over, they're already in the right place. Only copy leftover `nums2` books.

---

## The Algorithm in Plain English

```
Start with three bookmarks:
- i: last shelf book (m - 1)
- j: last stack book (n - 1)
- k: last slot (m + n - 1)

While both bookmarks are valid:
  Compare shelf[i] vs stack[j]
  Place the larger one at slot[k]
  Move the winning bookmark backward
  Move k backward

If stack books remain (j >= 0):
  Copy them to the remaining slots
  (They're the smallest books, go at the front)

If shelf books remain (i >= 0):
  Do nothing!
  (They're already in the correct positions)
```

---

## Try It Yourself

Trace this example by hand:

```
nums1 = [2, 4, _, _], m = 2
nums2 = [1, 3], n = 2
```

1. Start with i=1, j=1, k=3
2. Compare nums1[1]=4 vs nums2[1]=3
3. Continue until merged

Expected result: `[1, 2, 3, 4]`

---

## Ready for the Code?

Now that you have the mental model:
- You understand the **bookshelf/empty slots analogy**
- You see **why working backwards avoids shifting**
- You know **what the three bookmarks track**
- You recognize **when to copy remaining elements**
- You understand **why no extra space is needed**

The actual code is just moving bookmarks and comparing books!

---

## Complete Solution

```typescript
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  // Three bookmarks
  let i = m - 1;      // Last shelf book
  let j = n - 1;      // Last stack book
  let k = m + n - 1;  // Last slot to fill

  // While we have books in both places
  while (i >= 0 && j >= 0) {
    if (nums1[i] > nums2[j]) {
      // Shelf book is bigger, place it
      nums1[k] = nums1[i];
      i--;
    } else {
      // Stack book is bigger (or equal), place it
      nums1[k] = nums2[j];
      j--;
    }
    k--;
  }

  // If stack books remain, copy them
  // (They're the smallest, go at the front)
  while (j >= 0) {
    nums1[k] = nums2[j];
    j--;
    k--;
  }

  // If shelf books remain, do nothing!
  // (They're already in the right place)
}
```

**Time:** O(m + n) - Visit each book once
**Space:** O(1) - Use the shelf's empty slots
