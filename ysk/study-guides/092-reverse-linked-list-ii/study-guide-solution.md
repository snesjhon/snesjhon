# Reverse Linked List II Solution

## The Complete Solution

```typescript
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

function reverseBetween(
  head: ListNode | null,
  left: number,
  right: number
): ListNode | null {
  // Edge case: empty list or no reversal needed
  if (!head || left === right) {
    return head;
  }

  // Create dummy node to handle edge case where left = 1
  const dummy = new ListNode(0, head);
  let beforeLeft = dummy;

  // Move to the node just before position left
  for (let i = 0; i < left - 1; i++) {
    beforeLeft = beforeLeft.next!;
  }

  // left is the first node to be reversed
  const leftNode = beforeLeft.next!;

  // Reverse by moving nodes one by one to the front
  for (let i = 0; i < right - left; i++) {
    const curr = leftNode.next!;
    const next = curr.next;

    // Remove curr from its position
    leftNode.next = next;

    // Insert curr at the front of reversed section
    curr.next = beforeLeft.next;
    beforeLeft.next = curr;
  }

  return dummy.next;
}
```

## How This Solution Works

### Phase 1: Handle Edge Cases (Lines 13-16)

**Reference: Study Guide - "Edge Cases to Consider"**

```typescript
if (!head || left === right) {
  return head;
}
```

Two quick checks:
1. **Empty list**: If `head` is null, nothing to reverse
2. **Single node reversal**: If `left === right`, we're "reversing" one node (no-op)

Both cases can immediately return the head unchanged.

### Phase 2: Setup Dummy Node (Lines 18-20)

**Reference: Study Guide - "The Dummy Node Insight"**

```typescript
const dummy = new ListNode(0, head);
let beforeLeft = dummy;
```

**Why dummy node?**
- Handles the case where `left = 1` (reversing from head)
- Without dummy, we'd need special logic when there's no node before `left`
- With dummy, we always have a node before the reversal zone

The dummy's value (0) doesn't matter - it's just a placeholder.

### Phase 3: Find Position Before Left (Lines 22-25)

**Reference: Study Guide - "1-Indexed vs 0-Indexed"**

```typescript
for (let i = 0; i < left - 1; i++) {
  beforeLeft = beforeLeft.next!;
}
```

Move `beforeLeft` to the node just before position `left`:

```
Example: left = 3

dummy -> 1 -> 2 -> 3 -> 4 -> 5
         ↑    ↑    ↑
       i=0  i=1  i=2 (stop)

Final: beforeLeft = node with value 2 (position 2)
```

**Loop iterations**: `left - 1`
- If `left = 1`: loop runs 0 times, `beforeLeft = dummy` ✓
- If `left = 2`: loop runs 1 time, `beforeLeft = node 1` ✓
- If `left = 3`: loop runs 2 times, `beforeLeft = node 2` ✓

**Why `!` (non-null assertion)?**
We know the list has at least `right` nodes (problem constraint), so `.next` won't be null.

### Phase 4: Save Left Node Reference (Line 27)

```typescript
const leftNode = beforeLeft.next!;
```

This is the first node in the reversal zone. **Critical insight**: This node will become the tail of the reversed section, and we keep it stationary during reversal.

```
Before: beforeLeft -> leftNode -> ...
After:  beforeLeft -> [reversed] -> leftNode -> afterRight
```

### Phase 5: Perform Reversal (Lines 29-41)

**Reference: Study Guide - "One-by-One Insertion Visualization"**

```typescript
for (let i = 0; i < right - left; i++) {
  const curr = leftNode.next!;
  const next = curr.next;

  leftNode.next = next;

  curr.next = beforeLeft.next;
  beforeLeft.next = curr;
}
```

This is the heart of the algorithm. Let's break it down:

**Loop count**: `right - left`
- We need to move `right - left` nodes to the front
- `leftNode` stays put (that's why it's `right - left`, not `right - left + 1`)

**Each iteration**:
1. `curr = leftNode.next!` - The node we're moving to the front
2. `next = curr.next` - Save the rest of the list
3. `leftNode.next = next` - Remove curr from its current position
4. `curr.next = beforeLeft.next` - Curr points to current front of reversed section
5. `beforeLeft.next = curr` - Insert curr at the front

**Critical**: The order of operations (steps 3-5) matters!

### Detailed Iteration Breakdown

Let's trace through: `1 -> 2 -> 3 -> 4 -> 5`, `left=2`, `right=4`

**Setup**:
```
dummy -> 1 -> 2 -> 3 -> 4 -> 5
         ↑    ↑
    beforeLeft leftNode
```

**Iteration 1** (`i=0`):
```typescript
curr = leftNode.next = node 3
next = curr.next = node 4

leftNode.next = next
// 2 -> 4 (bypass 3)

curr.next = beforeLeft.next
// 3 -> 2 (3 points to old front)

beforeLeft.next = curr
// 1 -> 3 (3 is new front)
```

State: `dummy -> 1 -> 3 -> 2 -> 4 -> 5`
```
         ↑    ↑    ↑
    beforeLeft     leftNode
         |    ↑
         +--curr
```

**Iteration 2** (`i=1`):
```typescript
curr = leftNode.next = node 4
next = curr.next = node 5

leftNode.next = next
// 2 -> 5 (bypass 4)

curr.next = beforeLeft.next
// 4 -> 3 (4 points to old front)

beforeLeft.next = curr
// 1 -> 4 (4 is new front)
```

State: `dummy -> 1 -> 4 -> 3 -> 2 -> 5`

**Loop ends** (i=2, condition false)

### Phase 6: Return Result (Line 44)

```typescript
return dummy.next;
```

Return `dummy.next` instead of `head` because:
- If `left = 1`, the head has changed
- `dummy.next` always points to the correct head of the result

## Why This Solution is Correct

### Correctness Argument

**Claim**: This algorithm correctly reverses nodes from position `left` to `right`.

**Proof sketch**:

1. **Correct positioning**: The loop runs exactly `left - 1` times to position `beforeLeft`
2. **Correct reversal count**: The reversal loop runs exactly `right - left` times
3. **Invariant maintained**: After each iteration, all nodes moved so far are reversed relative to each other
4. **Pointer integrity**: Each node's `next` pointer is updated exactly once
5. **No loss of nodes**: We always save `next` before modifying pointers

### Loop Invariant

Before iteration `i`:
```
beforeLeft -> [reversed: i nodes] -> leftNode -> [unreversed: (right-left-i) nodes] -> afterRight
```

After iteration `i`:
```
beforeLeft -> [reversed: i+1 nodes] -> leftNode -> [unreversed: (right-left-i-1) nodes] -> afterRight
```

When loop ends (`i = right - left`):
```
beforeLeft -> [reversed: (right-left) nodes] -> leftNode -> afterRight
```

All nodes from `left+1` to `right` have been moved in front of `leftNode`, achieving complete reversal.

## Alternative Solution: Standard Reversal Approach

Here's another common approach that reverses the sublist in place:

```typescript
function reverseBetween(
  head: ListNode | null,
  left: number,
  right: number
): ListNode | null {
  if (!head || left === right) return head;

  const dummy = new ListNode(0, head);
  let beforeLeft = dummy;

  // Find node before left
  for (let i = 0; i < left - 1; i++) {
    beforeLeft = beforeLeft.next!;
  }

  // Reverse the sublist using standard reversal
  let prev: ListNode | null = null;
  let curr = beforeLeft.next;

  for (let i = 0; i < right - left + 1; i++) {
    const next = curr!.next;
    curr!.next = prev;
    prev = curr;
    curr = next;
  }

  // Reconnect the reversed sublist
  beforeLeft.next!.next = curr;  // leftNode points to afterRight
  beforeLeft.next = prev;        // beforeLeft points to new front (was right)

  return dummy.next;
}
```

**Comparison**:
- **Standard approach**: Reverse pointers in the sublist, then reconnect
- **Insertion approach**: Move nodes one by one to the front

Both are O(n) time, O(1) space. The insertion approach is often clearer because `leftNode` stays fixed.

## Performance Analysis

**Reference: Study Guide - "Performance Considerations"**

### Time Complexity: O(n)

Where n is the number of nodes in the list.

- Traverse to position `left - 1`: O(left)
- Reverse `right - left` nodes: O(right - left)
- Total: O(left) + O(right - left) = O(right) = O(n) in worst case

**Best case**: O(1) when `left = right` (early return)
**Worst case**: O(n) when `left = 1, right = n` (reverse entire list)

### Space Complexity: O(1)

- Constant number of pointers: `dummy`, `beforeLeft`, `leftNode`, `curr`, `next`
- No recursion stack
- No auxiliary data structures
- Pure in-place modification

## Common Mistakes Explained

**Reference: Study Guide - "Common Pitfalls"**

### Mistake 1: Wrong Pointer Order

```typescript
// ❌ Wrong - loses reference!
beforeLeft.next = curr;
curr.next = beforeLeft.next;  // Now points to itself!
```

**Why it fails**: After the first line, `beforeLeft.next` is `curr`, so the second line makes `curr.next = curr` (cycle).

**Fix**: Update in the right order:
```typescript
// ✅ Correct
curr.next = beforeLeft.next;
beforeLeft.next = curr;
```

### Mistake 2: Not Saving Next

```typescript
// ❌ Wrong - loses rest of list!
leftNode.next = leftNode.next!.next;  // If you don't save it first
const curr = leftNode.next;  // Wrong node!
```

**Why it fails**: You've already modified `leftNode.next`, so you can't access the original node.

**Fix**: Save before modifying:
```typescript
// ✅ Correct
const curr = leftNode.next!;
const next = curr.next;
leftNode.next = next;
```

### Mistake 3: Off-by-One in Loop Count

```typescript
// ❌ Wrong - reverses too many nodes
for (let i = 0; i <= right - left; i++) { ... }

// ❌ Wrong - reverses too few nodes
for (let i = 0; i < right - left - 1; i++) { ... }
```

**Why it fails**:
- First version runs `right - left + 1` times (moves leftNode too!)
- Second version runs `right - left - 1` times (doesn't move last node)

**Fix**: Exactly `right - left` iterations:
```typescript
// ✅ Correct
for (let i = 0; i < right - left; i++) { ... }
```

### Mistake 4: Forgetting Dummy for left=1 Case

```typescript
// ❌ Breaks when left = 1
let beforeLeft = head;
for (let i = 1; i < left; i++) {
  beforeLeft = beforeLeft!.next;
}
// When left=1, beforeLeft = head, but we need a node BEFORE head!
```

**Why it fails**: Can't access a node before the head without dummy.

**Fix**: Always use dummy:
```typescript
// ✅ Correct
const dummy = new ListNode(0, head);
let beforeLeft = dummy;
```

### Mistake 5: Returning head Instead of dummy.next

```typescript
// ❌ Wrong when left = 1
return head;
```

**Why it fails**: When `left = 1`, the original `head` is no longer the head of the result.

**Fix**: Return dummy's next:
```typescript
// ✅ Correct
return dummy.next;
```

## Edge Cases Walkthrough

**Reference: Study Guide - "Edge Cases to Consider"**

### Case 1: Reverse Entire List (left=1, right=n)

```
Input: 1 -> 2 -> 3 -> NULL, left=1, right=3

Setup: dummy -> 1 -> 2 -> 3
               ↑    ↑
          beforeLeft leftNode
           (dummy)   (1)

After iteration 1: dummy -> 2 -> 1 -> 3
After iteration 2: dummy -> 3 -> 2 -> 1

Result: 3 -> 2 -> 1
```

### Case 2: Reverse First Two (left=1, right=2)

```
Input: 1 -> 2 -> 3 -> 4, left=1, right=2

Setup: dummy -> 1 -> 2 -> 3 -> 4
               ↑    ↑
          beforeLeft leftNode

After iteration 1: dummy -> 2 -> 1 -> 3 -> 4

Result: 2 -> 1 -> 3 -> 4
```

### Case 3: No Reversal (left=right)

```
Input: 1 -> 2 -> 3, left=2, right=2

Early return: head unchanged
Result: 1 -> 2 -> 3
```

### Case 4: Reverse Last Two

```
Input: 1 -> 2 -> 3 -> 4, left=3, right=4

Setup: dummy -> 1 -> 2 -> 3 -> 4
                    ↑    ↑
               beforeLeft leftNode

After iteration 1: dummy -> 1 -> 2 -> 4 -> 3

Result: 1 -> 2 -> 4 -> 3
```

## Visualization: Step-by-Step Pointer Changes

For `1 -> 2 -> 3 -> 4 -> 5`, `left=2`, `right=4`:

**Initial**:
```
dummy -> 1 -> 2 -> 3 -> 4 -> 5
         ↑    ↑
    beforeLeft leftNode
```

**After finding position** (left - 1 = 1 iteration):
```
beforeLeft.next = leftNode = 2
leftNode.next = 3
```

**Iteration 1**:
```
curr = 3, next = 4

Step 1: leftNode.next = next
  2 -> 4 (bypass 3)

Step 2: curr.next = beforeLeft.next
  3 -> 2

Step 3: beforeLeft.next = curr
  1 -> 3

Result: dummy -> 1 -> 3 -> 2 -> 4 -> 5
```

**Iteration 2**:
```
curr = leftNode.next = 4 (note: leftNode is still 2!)
next = 5

Step 1: leftNode.next = next
  2 -> 5 (bypass 4)

Step 2: curr.next = beforeLeft.next
  4 -> 3

Step 3: beforeLeft.next = curr
  1 -> 4

Result: dummy -> 1 -> 4 -> 3 -> 2 -> 5
```

**Final**: `1 -> 4 -> 3 -> 2 -> 5` (nodes 2,3,4 reversed!)

## Key Takeaways

1. **Dummy node eliminates edge cases** - handles left=1 uniformly
2. **leftNode stays stationary** - becomes tail of reversed section
3. **Loop runs right - left times** - one less than the number of nodes
4. **Pointer order matters** - save before modify, update in correct sequence
5. **Return dummy.next** - handles head changes gracefully
6. **O(1) space, O(n) time** - efficient in-place reversal
7. **One pass solution** - no need to traverse twice

## Connection to Study Guide Concepts

- ✅ **Three-Zone Perspective**: Before, reverse, after zones
- ✅ **Four Pointers Pattern**: beforeLeft, left, right, afterRight
- ✅ **Dummy Node**: Handles left=1 edge case
- ✅ **Insertion Technique**: Move nodes to front one by one
- ✅ **Correct Loop Count**: right - left iterations
- ✅ **Performance**: O(n) time, O(1) space
- ✅ **Edge Cases**: All handled uniformly with dummy

This solution elegantly handles all cases and edge conditions discussed in the study guide with minimal code and maximum clarity.