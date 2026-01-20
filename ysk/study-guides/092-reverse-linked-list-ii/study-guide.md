# Reverse Linked List II Study Guide

## Understanding the Problem

Given the head of a singly linked list and two positions `left` and `right` (1-indexed), reverse the nodes from position `left` to position `right`, and return the modified list.

**Key constraints:**
- 1 <= left <= right <= n (where n is the length of the list)
- Must be done in one pass
- Positions are 1-indexed (not 0-indexed!)

## Core Mental Models

### 1. The Three-Zone Perspective

Think of the linked list as having three distinct zones:

```
Before Zone | Reverse Zone | After Zone
1 -> 2 ->  |  3 -> 4 -> 5  |  -> 6 -> 7
           |               |
         left=3          right=5
```

**Critical insight**: You only reverse the middle zone. The before and after zones stay intact.

### 2. The Four Pointers Pattern

To reverse a sublist in place, you need to track four critical positions:

```
     beforeLeft     left           right      afterRight
         ↓            ↓               ↓            ↓
    ... 2    ->      3 -> 4 -> 5      ->          6 ...
```

1. **beforeLeft**: Node just before the reversal zone (position left-1)
2. **left**: First node to be reversed
3. **right**: Last node to be reversed
4. **afterRight**: Node just after the reversal zone

**Why four pointers?**
- `beforeLeft` needs to point to the new head of reversed section
- `left` will become the tail of reversed section
- `afterRight` is where `left` should point after reversal
- `right` becomes the new head of reversed section

### 3. The Dummy Node Insight

What if `left = 1`? There's no `beforeLeft` node!

```
3 -> 4 -> 5 -> 6
↑
left=1 (no node before it!)
```

**Solution**: Use a dummy node that always points to the head:

```
dummy -> 3 -> 4 -> 5 -> 6
  ↑      ↑
beforeLeft left
```

This handles the edge case elegantly without special conditions.

### 4. The Reversal Technique

There are two main approaches to reverse the sublist:

**Approach A: Standard Iterative Reversal**
Traverse the sublist and reverse pointers one by one.

**Approach B: One-by-One Insertion** (More elegant!)
Take each node from the sublist and insert it at the front of the reversed portion.

```
Initial: beforeLeft -> 3 -> 4 -> 5 -> afterRight

Step 1: Move 4 to front
beforeLeft -> 4 -> 3 -> 5 -> afterRight

Step 2: Move 5 to front
beforeLeft -> 5 -> 4 -> 3 -> afterRight
```

**Key insight**: In approach B, `left` (node 3) stays in place while we move other nodes in front of it!

### 5. One-by-One Insertion Visualization

Let's see the insertion approach in detail:

```
Input: 1 -> 2 -> 3 -> 4 -> 5 -> NULL, left=2, right=4

Step 0: Initial state (after finding positions)
dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> NULL
         ↑    ↑              ↑
    beforeLeft left
              curr (current to move)

Step 1: Move node 3 to front
- Save next: next = 3.next (4)
- 2.next = 4 (skip 3)
- 3.next = 1.next (2)
- 1.next = 3
Result: dummy -> 1 -> 3 -> 2 -> 4 -> 5

Step 2: Move node 4 to front
- Save next: next = 4.next (5)
- 2.next = 5 (skip 4)
- 4.next = 1.next (3)
- 1.next = 4
Result: dummy -> 1 -> 4 -> 3 -> 2 -> 5

Done! Reversed nodes 2-4.
```

**Pattern**:
1. `left.next` always points to the current node being moved
2. Move it in front of `beforeLeft.next`
3. Repeat (right - left) times

## Detailed Mental Model: The Insertion Approach

Think of it as repeatedly "pulling" nodes from their current position and inserting them right after `beforeLeft`:

```
Before iteration i:
beforeLeft -> [already reversed] -> left -> curr -> ... -> afterRight

After iteration i:
beforeLeft -> curr -> [already reversed] -> left -> ... -> afterRight
                ↑
         (inserted at front)
```

**Invariant maintained**:
- `left` never moves (it stays at the tail of reversed portion)
- `beforeLeft` always points to the front of the reversed portion
- Each iteration, one node moves from the unreversed part to the front

## Key Insights to Consider

### Insight 1: Left Node Becomes the Tail

After reversal, the node that was at position `left` becomes the tail of the reversed section:

```
Before: 1 -> 2 -> 3 -> 4 -> 5    (left=2, right=4)
                     ↑
                   head of section

After:  1 -> 4 -> 3 -> 2 -> 5
                      ↑
                   tail of section
```

This is why in the insertion approach, we keep `left` stationary and move everything else.

### Insight 2: The Math of Iterations

If you need to reverse from position `left` to `right`:
- Total nodes to reverse: `right - left + 1`
- Number of moves needed: `right - left`

**Why one less?**
The first node (at `left`) doesn't need to move - it stays as the tail.

### Insight 3: 1-Indexed vs 0-Indexed

The problem uses 1-indexed positions, but many programmers think in 0-indexed:

```
Position (1-indexed): 1  2  3  4  5
Value:                1->2->3->4->5
Position (0-indexed): 0  1  2  3  4
```

**Critical**: When traversing, use 1-indexed thinking or convert carefully!

### Insight 4: Why Dummy Node Simplifies Everything

Without dummy:
```typescript
// Need special case for left = 1
if (left === 1) {
  // Special logic for reversing from head
} else {
  // Normal logic
}
```

With dummy:
```typescript
// Same logic for all cases!
let dummy = new ListNode(0, head);
let beforeLeft = dummy;
```

### Insight 5: The Pointer Reassignment Order Matters

When inserting a node, the order of operations is crucial:

```typescript
// ❌ Wrong order - loses references!
beforeLeft.next = curr;              // Lost reference to reversed section!
curr.next = beforeLeft.next;         // Now points to itself!

// ✅ Correct order
let next = curr.next;                // Save next node
left.next = next;                    // Bypass curr
curr.next = beforeLeft.next;         // Link curr to front
beforeLeft.next = curr;              // Insert curr at front
```

## Visualization of Complete Example

```
Input: 1 -> 2 -> 3 -> 4 -> 5 -> NULL, left=2, right=4

Setup phase:
dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> NULL
         ↑    ↑
    beforeLeft left

Need to reverse positions 2,3,4 (nodes with values 2,3,4)
Iterations needed: right - left = 4 - 2 = 2

Iteration 1: Move node 3
  curr = left.next = 3
  next = curr.next = 4

  left.next = next           // 2 -> 4
  curr.next = beforeLeft.next // 3 -> 2
  beforeLeft.next = curr     // 1 -> 3

  Result: dummy -> 1 -> 3 -> 2 -> 4 -> 5

Iteration 2: Move node 4
  curr = left.next = 4 (note: left still points to 2)
  next = curr.next = 5

  left.next = next           // 2 -> 5
  curr.next = beforeLeft.next // 4 -> 3
  beforeLeft.next = curr     // 1 -> 4

  Result: dummy -> 1 -> 4 -> 3 -> 2 -> 5

Final: Return dummy.next = 1 -> 4 -> 3 -> 2 -> 5
```

## Common Pitfalls to Avoid

### Pitfall 1: Off-by-One Errors in Position Counting

Remember: positions are 1-indexed!

```typescript
// ❌ Wrong - treats positions as 0-indexed
for (let i = 0; i < left; i++) {
  beforeLeft = beforeLeft.next;
}

// ✅ Correct - accounts for 1-indexing
for (let i = 0; i < left - 1; i++) {
  beforeLeft = beforeLeft.next;
}
```

### Pitfall 2: Losing the Reference to the Rest of the List

```typescript
// ❌ Dangerous - might lose afterRight
curr.next = beforeLeft.next;  // If not careful!
```

Always save `next` before modifying pointers!

### Pitfall 3: Forgetting the Dummy Node Edge Case

```typescript
// ❌ Breaks when left = 1
let beforeLeft = head;
for (let i = 1; i < left - 1; i++) {
  beforeLeft = beforeLeft.next;
}
// When left=1, this never runs, beforeLeft = head (wrong!)

// ✅ Works for all cases
let dummy = new ListNode(0, head);
let beforeLeft = dummy;
for (let i = 0; i < left - 1; i++) {
  beforeLeft = beforeLeft.next;
}
```

### Pitfall 4: Incorrect Loop Count

```typescript
// ❌ Wrong - reverses too many/few nodes
for (let i = 0; i <= right - left; i++) { ... }

// ✅ Correct - exactly right-left moves
for (let i = 0; i < right - left; i++) { ... }
```

### Pitfall 5: Modifying the Wrong Pointers

The insertion requires exactly 3 pointer updates in the right order. Missing or misordering any breaks the list.

## Performance Considerations

**Time Complexity**: O(n)
- Traverse to find `beforeLeft`: O(left)
- Perform reversal: O(right - left)
- Total: O(n) in worst case (when right = n)

**Space Complexity**: O(1)
- Only using a constant number of pointers
- No recursion, no extra data structures
- Pure in-place modification

**One Pass Requirement**:
The problem often requires solving in one pass. The insertion approach naturally does this - we traverse once to position, then reverse.

## Questions to Guide Your Thinking

1. Why do we need a dummy node?
2. What happens to the node at position `left` after reversal?
3. How many pointer reassignments happen in each iteration?
4. Why is the loop counter `right - left` and not `right - left + 1`?
5. What's the state of `left.next` during each iteration?
6. How would the solution change if positions were 0-indexed?
7. What if `left === right`? Should we handle it specially?

## Algorithm Approach

### Phase 1: Setup
1. Create dummy node pointing to head
2. Initialize `beforeLeft` pointer at dummy
3. Traverse to position `left - 1` (beforeLeft)
4. Save reference to `left` node

### Phase 2: Reversal (Insertion Method)
1. For each node from `left+1` to `right`:
   - Save the next node
   - Remove current node from its position
   - Insert it right after `beforeLeft`
   - Update pointers in correct order

### Phase 3: Return Result
Return `dummy.next` (handles the case where head changed)

## Edge Cases to Consider

1. **Single node list** (`n = 1`): left=1, right=1 → no change
2. **Reverse entire list**: left=1, right=n
3. **Reverse first two nodes**: left=1, right=2
4. **Reverse last two nodes**: left=n-1, right=n
5. **No reversal needed**: left=right (single node "reversal")
6. **Two node list**: left=1, right=2
7. **Reverse from head**: left=1 (tests dummy node logic)

## Next Steps

Once you understand these concepts:
1. Draw out the dummy node setup
2. Practice the three-step pointer update for insertion
3. Trace through an example with positions left=2, right=4
4. Verify the loop runs exactly `right - left` times
5. Confirm the final result with `dummy.next`

The key breakthrough is understanding the insertion approach: keep `left` fixed as the tail, and repeatedly move nodes from the unreversed section to the front of the reversed section.