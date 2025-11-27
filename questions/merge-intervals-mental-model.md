# Merge Intervals - Mental Model Guide

## Problem Overview
Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals and return an array of the non-overlapping intervals.

**Example**:
```
Input: [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]

Why? [1,3] and [2,6] overlap → merge to [1,6]
```

## The Core Question

Before writing any code, ask yourself:

**"How do I know if two intervals overlap?"**

## Visualizing Overlaps

Think visually. Draw intervals on a number line:

```
Case 1: Overlapping
[1, 3]
    [2, 6]
Result: [1, 6]

Case 2: Overlapping (one contains another)
[1, 6]
  [2, 4]
Result: [1, 6]

Case 3: Not overlapping
[1, 3]
        [5, 7]
Result: [1, 3], [5, 7]

Case 4: Adjacent (touching)
[1, 3]
      [3, 5]
Result: [1, 5] (they merge!)
```

## Key Insight #1: The Overlap Condition

Two intervals `[a, b]` and `[c, d]` overlap if:

**Think about when they DON'T overlap first**:
- `[a, b]` is completely before `[c, d]`: `b < c`
- `[c, d]` is completely before `[a, b]`: `d < a`

So they **DO overlap** when: **neither of these is true**

Or more simply: `b >= c` (if you process them in order)

## Key Insight #2: Sorting Makes Life Easy

**Without sorting**:
```
[[8,10], [1,3], [2,6], [15,18]]
     ↓
Which ones overlap? You'd have to compare each with every other one!
```

**With sorting by start time**:
```
[[1,3], [2,6], [8,10], [15,18]]
   ↓
Now you only need to check if current overlaps with the previous one!
```

**Why sorting works**:
- After sorting, you know intervals are in start-time order
- You only need to check if the current interval overlaps with the most recent merged interval
- If current doesn't overlap with the most recent, it won't overlap with any earlier ones either

## The Algorithm Strategy (No Code Yet!)

Think through the process step by step:

1. **Sort** the intervals by start time
2. **Start with** the first interval as your "current merged interval"
3. **For each** subsequent interval:
   - **If it overlaps** with current merged interval → extend the merged interval
   - **If it doesn't overlap** → save the current merged interval, start a new one
4. **Don't forget** to add the last merged interval to your result

## Example Walkthrough: Build Your Intuition

```
Input: [[1,3], [2,6], [8,10], [15,18]]
(Already sorted)

Step 1: Start with [1,3]
  Current merged: [1,3]
  Result: []

Step 2: Look at [2,6]
  Does it overlap with [1,3]?
  → Yes! 2 <= 3
  → Merge them: What's the new interval?
  → Start: min(1,2) = 1
  → End: max(3,6) = 6
  Current merged: [1,6]
  Result: []

Step 3: Look at [8,10]
  Does it overlap with [1,6]?
  → No! 8 > 6
  → Save [1,6] to result, start new merged interval
  Current merged: [8,10]
  Result: [[1,6]]

Step 4: Look at [15,18]
  Does it overlap with [8,10]?
  → No! 15 > 10
  → Save [8,10] to result, start new merged interval
  Current merged: [15,18]
  Result: [[1,6], [8,10]]

Step 5: No more intervals
  → Save current merged interval
  Result: [[1,6], [8,10], [15,18]]
```

## The Merging Logic

When two intervals overlap, what's the merged interval?

```
Interval A: [a_start, a_end]
Interval B: [b_start, b_end]

If they overlap:
  Merged start: ? (think: which comes first?)
  Merged end: ? (think: which extends further?)
```

**Hint**: You want the earliest start and the latest end.

## Common Mistakes to Avoid

### Mistake 1: Not Sorting
```
[[8,10], [1,3], [2,6]]
```
If you don't sort, you'll miss that [1,3] and [2,6] should merge.

### Mistake 2: Only Checking Adjacent Intervals After Sorting
```
After sorting: [[1,4], [2,5], [3,6]]
```
[1,4] overlaps with [2,5] → merge to [1,5]
But then [1,5] also overlaps with [3,6] → merge to [1,6]

You need to keep extending the current merged interval!

### Mistake 3: Forgetting the Last Interval
After processing all intervals, don't forget to add the final merged interval to your result!

### Mistake 4: Off-by-One on Overlap Check
```
[1,3] and [3,5]
```
Do these overlap? **Yes!** They touch at point 3. Use `>=` not `>`.

## Edge Cases to Consider

```typescript
// Single interval
[[1,5]] → [[1,5]]

// No overlaps
[[1,2], [3,4], [5,6]] → [[1,2], [3,4], [5,6]]

// All overlap
[[1,4], [2,5], [3,6]] → [[1,6]]

// One interval contains all others
[[1,10], [2,3], [4,5]] → [[1,10]]

// Empty array
[] → []

// Adjacent intervals (touching)
[[1,3], [3,5]] → [[1,5]]
```

## Questions to Ask Yourself

Before coding, make sure you can answer:

1. ✓ What happens if I don't sort the intervals first?
2. ✓ How do I check if two intervals overlap?
3. ✓ When I merge two intervals, what should the start and end be?
4. ✓ Do I need to compare every interval with every other one?
5. ✓ What data structure should I use to build the result?
6. ✓ What happens to the last interval I'm processing?

## The Mental Model

Think of this problem like **painting over overlapping paint strokes**:

```
Timeline: ----0----5----10----15----20---->

Paint [1,3]:   ████
Paint [2,6]:     ████████
Result:        ██████████  (merged to [1,6])

Paint [8,10]:                ████
Paint [15,18]:                     ████████

Final:         ██████████    ████    ████████
               [1,6]         [8,10]  [15,18]
```

You're walking through time (left to right after sorting), and whenever a new paint stroke overlaps with your current one, you extend the current stroke. When there's a gap, you finish the current stroke and start a new one.

## Data Structure Choice

Ask yourself: **What should I use to build the result?**

Think about the operations you need:
- Add merged intervals as you go
- Possibly update the last interval if the next one overlaps with it

Options:
- Array (push new intervals, modify the last one)
- Stack (push/pop operations)

Either works! Think about which feels more natural to you.

## Approach Comparison

### Approach 1: Build as you go
Track the "current merged interval" and add to result when you hit a non-overlapping interval.

### Approach 2: Use result array directly
Add first interval to result, then for each new interval, check if it overlaps with the last interval in result.

Both work! Pick the one that makes more sense to you.

## Time & Space Complexity Goals

Before implementing, think about:
- **Sorting**: O(n log n)
- **Merging**: O(n) - single pass through sorted intervals
- **Overall**: O(n log n)
- **Space**: O(n) for the result (or O(log n) if you don't count output space, just sorting space)

## Step-by-Step Plan (Before You Code)

1. Handle edge cases (empty array, single interval)
2. Sort intervals by start time
3. Initialize result (or current merged interval)
4. Loop through sorted intervals:
   - Check overlap condition
   - If overlap: merge (update end)
   - If no overlap: save current, start new
5. Don't forget the last interval!
6. Return result

## Now Try It Yourself!

With this mental model, try implementing the solution:

1. Start with sorting
2. Think about your overlap condition
3. Think about your merging logic
4. Test with the edge cases above

Remember: **The key insight is that sorting makes this problem easy**. Without sorting, you'd need nested loops. With sorting, you just need one pass!

## Debugging Tips

If your solution doesn't work:

1. **Print** the sorted intervals first - is the sorting working?
2. **Print** each overlap check - are you detecting overlaps correctly?
3. **Print** each merge - are you computing the merged interval correctly?
4. **Check** the last interval - did you add it to the result?
5. **Test** the edge cases - empty, single, all overlapping, none overlapping

## What This Problem Teaches You

- **Sorting as preprocessing** - Sometimes sorting makes an O(n²) problem into O(n log n)
- **Greedy algorithms** - Process in order, make local decisions that lead to global solution
- **Interval manipulation** - Common pattern in scheduling, calendar, timeline problems
- **Edge case thinking** - Empty, single, all, none, adjacent

## Related Problems

Once you solve this, you'll be ready for:
- Insert Interval
- Meeting Rooms
- Meeting Rooms II (how many rooms needed?)
- Non-overlapping Intervals

All use similar interval reasoning!
