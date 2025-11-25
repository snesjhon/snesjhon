# Sliding Window Maximum - Concepts Guide

## Problem Overview

Given an array of integers and a window size k, find the maximum value in each sliding window as it moves from left to right across the array.

**Examples:**
```
Input: nums = [1,3,-1,-3,5,3,6,7], k = 3
Output: [3,3,5,5,6,7]

Explanation:
Window [1  3  -1] -3  5  3  6  7  → max = 3
Window  1 [3  -1  -3] 5  3  6  7  → max = 3
Window  1  3 [-1  -3  5] 3  6  7  → max = 5
Window  1  3  -1 [-3  5  3] 6  7  → max = 5
Window  1  3  -1  -3 [5  3  6] 7  → max = 6
Window  1  3  -1  -3  5 [3  6  7] → max = 7

Input: nums = [1], k = 1
Output: [1]

Input: nums = [1,-1], k = 1
Output: [1,-1]

Input: nums = [9,11], k = 2
Output: [11]
```

---

## Initial Problem Analysis

### Questions to Ask Yourself:

1. What makes this problem challenging?
2. What is a "sliding window" in this context?
3. How many windows do we need to check?
4. Do we need to recalculate the maximum each time, or can we optimize?
5. What's the brute force approach, and why is it inefficient?

### Constraints to Clarify:

- Can the array be empty?
- What if k is larger than the array length?
- What if k is 1?
- Can the array contain negative numbers?
- What if all numbers are the same?
- What's the range of values?

---

## Pattern Recognition

### Key Observations:

1. **Fixed Window Size**
   - The window always contains exactly k elements
   - The window moves one position at a time
   - This is a FIXED sliding window (unlike variable sliding window)

2. **Overlapping Information**
   - Window 1: [1, 3, -1]
   - Window 2: [3, -1, -3]
   - These share elements! Do we need to recalculate everything?

3. **Need to Track Maximum Efficiently**
   - Each window needs its maximum
   - As we slide, one element leaves, one enters
   - Can we update the maximum without checking all k elements?

4. **Order Matters**
   - Later elements can "shadow" earlier ones
   - If we see [1, 3, -1], the 1 is irrelevant as long as 3 is in the window
   - If an element is larger and comes later, earlier smaller ones don't matter

### What Pattern Does This Suggest?

Think about techniques that:
- Maintain a window of elements
- Track maximum/minimum efficiently
- Can add and remove elements from both ends
- Preserve some notion of order or priority

**Does this sound like:**
- Sliding window? (Yes, but what data structure?)
- Stack?
- Queue?
- Heap/Priority queue?
- Monotonic deque?

---

## Core Concepts to Understand

### 1. The Sliding Window Pattern

**Conceptual Framework:**

The window "slides" across the array:
- Each position generates one maximum value
- The window maintains exactly k elements
- One element exits from the left, one enters from the right

**Key Questions:**
- How many windows are there?
- When do we record a maximum?
- What information must we track?

### 2. The Inefficiency Problem

**Naive Approach:**
```
For each window position:
  Find max of k elements
  Add to result
```

**Consider:**
- Finding max of k elements: O(k)
- Number of windows: n - k + 1
- Total: O((n - k) × k) ≈ O(nk)

**Can we do better?**

### 3. What Makes an Element Relevant?

**Critical Insight:**

In window [1, 3, -1, -3, 5]:
- Is 1 relevant? NO - it's smaller than 3, and 3 comes after
- Is 3 relevant? MAYBE - it's large, but 5 is larger
- Is -1 relevant? NO - it's small and has larger elements after it
- Is -3 relevant? NO - same reason
- Is 5 relevant? YES - it's the maximum

**An element is "relevant" if:**
- No element to its RIGHT (that's still in the window) is larger
- It could potentially be the maximum in current or future windows

**Question:** How do we efficiently track only relevant elements?

### 4. The Order Insight

**Think About This:**

```
Window: [3, 2, 1, 4]
```

Which elements matter?
- 3? NO - 4 is larger and comes later
- 2? NO - 4 is larger and comes later
- 1? NO - 4 is larger and comes later
- 4? YES - it's the largest

**Now what if the window slides and 4 exits?**
```
Window: [3, 2, 1] (4 is gone)
```

Now which elements matter?
- 3 matters! It's the maximum now.

**Key Realization:** We need to remember elements in a specific order, because when the current maximum leaves, we need to know what the next maximum is.

### 5. The Monotonic Property

**What if we maintained elements in DECREASING order?**

```
Window: [3, 2, 1, 4]
Tracking: [4]  (only keep 4, discard others)

Window: [2, 1, 4, 5]
Before adding 5, tracking: [4]
After adding 5, tracking: [5]  (discard 4, keep only 5)

Window: [5, 3, 1]
Before 5 exits, tracking: [5, 3, 1] (all in decreasing order)
After 5 exits, tracking: [3, 1]
Maximum is 3!
```

**The Insight:**
- Keep elements in decreasing order
- When a larger element arrives, remove all smaller ones before it
- The front of this structure is always the maximum
- When an element exits the window, remove it from our structure

**Question:** What data structure allows efficient add/remove from BOTH ends?

---

## Approaching the Problem

### Step 1: Brute Force Understanding

**Before optimizing, understand the simple solution:**

```
For each starting position i from 0 to n-k:
  Find max in window [i, i+k-1]
  Add to result array
```

**Questions:**
1. How many windows are there? **n - k + 1**
2. How do we find max of each window? **Check all k elements**
3. What's the time complexity? **O(n × k)**
4. Can we do better? **Yes!**

### Step 2: Identifying Redundancy

**The brute force approach has redundant work:**

Example: nums = [1, 3, -1, -3, 5], k = 3
- Window 1: [1, 3, -1] → find max of 3 elements
- Window 2: [3, -1, -3] → find max of 3 elements

**Key Insight:** Windows 1 and 2 share elements [3, -1]!

We're rechecking these elements. Can we avoid this?

### Step 3: The Deque Insight

**What if we maintained a special queue that:**
- Stores indices of elements (not values, indices!)
- Keeps elements in decreasing order of their VALUES
- Can remove from both front and back
- Front always contains index of current maximum

**This is a DEQUE (Double-Ended Queue)!**

**Operations:**
1. **Remove from front**: When an element exits the window
2. **Remove from back**: When a new larger element arrives
3. **Add to back**: Add new elements
4. **Peek front**: Get current maximum

### Step 4: The Monotonic Deque Pattern

**Monotonic = Always in one direction**

We maintain a **decreasing monotonic deque**:
- Elements are in decreasing order of VALUES
- We store INDICES, not values
- Front of deque has index of maximum element

**Why store indices instead of values?**
- Need to know when an element exits the window
- Need to compare positions, not just values

---

## Mental Model: The Deque Journey

Let's trace through nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3

### **Visualization Key:**
```
deque: [indices in decreasing order by value]
Front of deque = current maximum
```

### **Initial State:**
```
nums:  [1, 3, -1, -3, 5, 3, 6, 7]
index:  0  1   2   3  4  5  6  7
k = 3
deque: []
result: []
```

---

### **i = 0, value = 1**
```
Processing index 0 (value = 1)
deque is empty, just add it
deque: [0]  (value at index 0 is 1)
Window not full yet (need 3 elements)
```

### **i = 1, value = 3**
```
Processing index 1 (value = 3)
Check back of deque: index 0 has value 1
3 > 1, so remove index 0 (it's useless now)
deque: [1]  (value at index 1 is 3)
Window not full yet
```

### **i = 2, value = -1**
```
Processing index 2 (value = -1)
Check back of deque: index 1 has value 3
-1 < 3, so keep index 1, add index 2
deque: [1, 2]  (values: 3, -1 - decreasing!)
Window is NOW full! (indices 0-2)
Maximum: index 1 (value 3)
result: [3]
```

---

### **i = 3, value = -3**
```
Processing index 3 (value = -3)
Window: indices [1, 2, 3] (values: 3, -1, -3)

Remove old elements outside window:
  Front of deque is index 1
  Is 1 < (3-3+1) = 1? NO, so 1 is still in window
  Keep it

Add new element:
  Check back: index 2 has value -1
  -3 < -1, so keep it, add index 3
  deque: [1, 2, 3]  (values: 3, -1, -3)

Maximum: front of deque = index 1 (value 3)
result: [3, 3]
```

---

### **i = 4, value = 5**
```
Processing index 4 (value = 5)
Window: indices [2, 3, 4] (values: -1, -3, 5)

Remove old elements:
  Front is index 1
  Is 1 < (4-3+1) = 2? YES, so 1 is outside window
  Remove index 1
  deque: [2, 3]

Add new element:
  Check back: index 3 has value -3
  5 > -3, remove index 3
  Check back: index 2 has value -1
  5 > -1, remove index 2
  deque is now empty
  Add index 4
  deque: [4]  (value: 5)

Maximum: index 4 (value 5)
result: [3, 3, 5]
```

---

### **i = 5, value = 3**
```
Processing index 5 (value = 3)
Window: indices [3, 4, 5] (values: -3, 5, 3)

Remove old elements:
  Front is index 4
  Is 4 < (5-3+1) = 3? NO, still in window

Add new element:
  Check back: index 4 has value 5
  3 < 5, so keep index 4, add index 5
  deque: [4, 5]  (values: 5, 3 - decreasing!)

Maximum: index 4 (value 5)
result: [3, 3, 5, 5]
```

---

### **i = 6, value = 6**
```
Processing index 6 (value = 6)
Window: indices [4, 5, 6] (values: 5, 3, 6)

Remove old elements:
  Front is index 4
  Is 4 < (6-3+1) = 4? NO, still in window

Add new element:
  Check back: index 5 has value 3
  6 > 3, remove index 5
  Check back: index 4 has value 5
  6 > 5, remove index 4
  deque is empty
  Add index 6
  deque: [6]  (value: 6)

Maximum: index 6 (value 6)
result: [3, 3, 5, 5, 6]
```

---

### **i = 7, value = 7**
```
Processing index 7 (value = 7)
Window: indices [5, 6, 7] (values: 3, 6, 7)

Remove old elements:
  Front is index 6
  Is 6 < (7-3+1) = 5? NO, still in window

Add new element:
  Check back: index 6 has value 6
  7 > 6, remove index 6
  deque is empty
  Add index 7
  deque: [7]  (value: 7)

Maximum: index 7 (value 7)
result: [3, 3, 5, 5, 6, 7]
```

---

**Final Result: [3, 3, 5, 5, 6, 7] ✓**

---

## Three Critical Questions

### **Q1: Why store indices instead of values?**

**Answer:** We need to know WHEN an element exits the window.

```
If we stored values: deque = [5, 3]
Question: Is 5 still in the current window?
Can't tell! We don't know where 5 is.

If we store indices: deque = [4, 5] (values: 5, 3)
Question: Is index 4 in window [5, 6, 7]?
Yes! We can check: 4 >= (7-3+1) = 5? No, so 4 is out, remove it!
```

### **Q2: When do we remove from the front?**

**Answer:** When the front element is OUTSIDE the current window.

```
Window size k = 3, currently at index i = 5
Window contains: [i-k+1, i] = [3, 4, 5]

Front of deque is index 2
Is 2 >= 3? NO
So index 2 is outside the window, remove it!
```

### **Q3: When do we remove from the back?**

**Answer:** When adding a NEW element that's LARGER than elements at the back.

```
deque: [4, 5] (values: 5, 3)
New element: index 6, value 6

Is 6 > value at index 5 (which is 3)? YES
Remove index 5
Is 6 > value at index 4 (which is 5)? YES
Remove index 4
deque: []
Add index 6
deque: [6]
```

**Why?** Because if the new element is larger and comes later, the older smaller elements will NEVER be the maximum while the new element is in the window!

---

## The Monotonic Deque Property

**Invariant:** The deque always maintains indices in DECREASING order of their VALUES.

**Why this works:**
1. The front is always the maximum (largest value)
2. When maximum exits, the next element is the new maximum
3. Smaller elements that come before larger ones are useless
4. We only keep elements that could potentially be maximum

**Example:**
```
deque: [4, 5] means values are [5, 3]
5 > 3? YES - decreasing order maintained ✓

If we try to add index 6 with value 6:
6 > 3? YES - remove index 5
6 > 5? YES - remove index 4
deque: [6] - still decreasing (trivially) ✓
```

---

## Common Pitfalls to Avoid

### 1. Using Values Instead of Indices

**Mistake:** Storing values in the deque.

**Why it's wrong:** Can't determine if an element is still in the window.

**Example:**
```
deque = [5, 3]
Which 5 is this? At what index?
Can't tell if it's inside the window!
```

### 2. Not Removing Old Elements from Front

**Mistake:** Forgetting to remove elements that exit the window.

**Why it's wrong:** The deque will contain elements outside the current window, giving wrong maximums.

**Example:**
```
Window moved but deque still has old indices
Maximum reported is from an element not in current window!
```

### 3. Not Maintaining Decreasing Order

**Mistake:** Not removing smaller elements when a larger one arrives.

**Why it's wrong:** The deque won't have the maximum at the front.

**Example:**
```
deque: [4, 5] (values: 3, 5) - WRONG! Not decreasing
Front is 3, but actual max in window is 5!
```

### 4. Off-by-One in Window Boundaries

**Mistake:** Wrong calculation of when window is full or what's inside.

**Think about:**
```
Array length n = 8, k = 3
Window at i = 2 contains: [0, 1, 2] (indices)
Window at i = 5 contains: [3, 4, 5] (indices)

Element at front of deque is index j
Is j inside window ending at i?
j should be >= (i - k + 1)
```

### 5. Not Handling Edge Cases

**Mistake:** Not testing edge cases.

**Cases to consider:**
- k = 1 (every element is a window)
- k = n (only one window)
- All elements are the same
- Array is sorted ascending/descending
- Negative numbers

---

## Edge Cases to Consider

### Test Your Understanding:

For each case, think about what the deque would look like:

1. **k = 1:** nums = [1, -1], k = 1
   - How many windows? 2
   - Expected output: [1, -1]

2. **k = n:** nums = [1, 3, 5], k = 3
   - How many windows? 1
   - Expected output: [5]

3. **All same:** nums = [7, 7, 7, 7], k = 2
   - What's in the deque?
   - Expected output: [7, 7, 7]

4. **Sorted ascending:** nums = [1, 2, 3, 4, 5], k = 3
   - Deque behavior?
   - Expected output: [3, 4, 5]

5. **Sorted descending:** nums = [5, 4, 3, 2, 1], k = 3
   - Deque behavior?
   - Expected output: [5, 4, 3]

6. **With zeros:** nums = [-1, 0, -1], k = 1
   - This was your bug! What's the answer?
   - Expected output: [-1, 0, -1]

7. **Negative numbers:** nums = [-7, -8, 7, 5, 7, 1, 6, 0], k = 4
   - How does the deque handle negatives?

---

## Optimization Thinking

### From O(nk) to O(n)

**Question:** What operations are we repeating unnecessarily?

**Brute Force:**
- For each window: find max of k elements
- Finding max: O(k) each time
- Total: O(nk)

**Optimized with Deque:**
- Each element enters deque once
- Each element exits deque at most once
- Total operations: O(2n) = O(n)

### Why Deque Instead of Stack or Heap?

**Stack:**
- Can only remove from one end
- Can't remove old elements from front ✗

**Heap/Priority Queue:**
- Can find max efficiently
- Can't remove arbitrary elements efficiently ✗
- Would need lazy deletion (complexity)

**Deque:**
- Remove from both ends ✓
- Maintain order ✓
- O(1) operations ✓

---

## Solution Strategy Framework

### Approach Template:

```
1. Initialize:
   - Result array
   - Deque to store indices

2. For each element in array:
   a. Remove indices outside current window (from front)
   b. Remove indices with smaller values (from back)
   c. Add current index (to back)
   d. If window is full, add max to result (front of deque)

3. Return result array
```

### Key Operations:

**Add element (always to back):**
- Remove smaller elements from back first
- Then add the new element

**Remove old elements (from front):**
- Check if front is outside window
- Remove if necessary

**Get maximum (from front):**
- Front of deque is always the maximum

---

## Complexity Analysis

### Time Complexity: O(n)

**Why?**
- Each element is added to deque once: O(n)
- Each element is removed from deque at most once: O(n)
- Total operations: O(2n) = O(n)

**Amortized Analysis:**
Even though we have a while loop inside the for loop, each element can only be removed from the deque once (after being added once).

### Space Complexity: O(k)

**Why?**
- Deque can contain at most k elements
- In the worst case (decreasing array), deque has all k elements
- Result array is O(n-k+1) which we need to return anyway

---

## Real-World Applications

### Where This Pattern Applies:

1. **Stock Price Analysis**
   - Maximum price in sliding time windows
   - Trading strategies based on recent peaks

2. **Network Monitoring**
   - Maximum bandwidth usage in time intervals
   - Peak load detection

3. **Data Stream Processing**
   - Running maximum in fixed-size windows
   - Anomaly detection

4. **Image Processing**
   - Maximum filter (morphological operation)
   - Edge detection preprocessing

---

## Learning Progression

### Level 1: Understanding
- [ ] Can explain the problem in your own words
- [ ] Understand what a sliding window is
- [ ] Know how many windows there are (n - k + 1)
- [ ] Can calculate brute force complexity

### Level 2: Pattern Recognition
- [ ] Recognize this as a sliding window problem
- [ ] Understand why brute force is O(nk)
- [ ] See the redundancy in recalculating max
- [ ] Know we need to track max efficiently

### Level 3: Deque Understanding
- [ ] Understand what a deque is
- [ ] Know why we need both-end operations
- [ ] Understand monotonic property
- [ ] Can explain why we store indices not values

### Level 4: Implementation
- [ ] Can implement the solution
- [ ] Handle all edge cases correctly
- [ ] Can trace through an example on paper
- [ ] Understand the O(n) complexity proof

### Level 5: Pattern Mastery
- [ ] Can apply monotonic deque to other problems
- [ ] Recognize when to use this pattern
- [ ] Can teach the concept to others
- [ ] Understand variations (min window, etc.)

---

## Practice Strategy

### Before Looking at Solutions:

1. **Understand the problem deeply**
   - Draw out several examples
   - Count the number of windows
   - Calculate expected outputs manually

2. **Try brute force first**
   - Implement the O(nk) solution
   - Verify it works on examples

3. **Identify the bottleneck**
   - What operation is expensive?
   - What information is being recalculated?

4. **Think about the deque approach**
   - Draw the deque state at each step
   - Trace through "nums = [1,3,-1,-3,5,3,6,7], k=3"
   - Track what's in the deque at each iteration

5. **Consider these questions**
   - What makes an element "useful"?
   - When can we discard an element?
   - How do we know the current maximum?

6. **Implement without looking**
   - Start with the skeleton
   - Add operations one at a time
   - Test on examples as you go

### After Studying Solutions:

1. **Implement from scratch**
   - Don't copy - understand and recreate
   - Use different variable names

2. **Test thoroughly**
   - All edge cases from this guide
   - Your own custom examples
   - Random test cases

3. **Explain it out loud**
   - Pretend you're teaching someone
   - Draw diagrams

---

## Key Questions to Test Understanding

### Conceptual Questions:

1. Why is a deque better than a simple queue for this problem?
2. Why do we store indices instead of values?
3. What does "monotonic decreasing" mean for the deque?
4. When do we remove from the front vs the back?
5. Why is the time complexity O(n) despite nested loops?

### Implementation Questions:

1. How do you check if an index is outside the window?
2. When do you start adding to the result array?
3. How do you maintain the decreasing order property?
4. What should you return for an empty array?
5. How do you handle k = 1 or k = n?

### Debugging Questions:

1. What if the deque is empty when you try to get max?
2. What if you forget to remove old elements from front?
3. What if you add elements without removing smaller ones?
4. What if you use values instead of indices?
5. What if your window boundary check is off by one?

---

## Next Problems to Practice

Once you've mastered this problem, try these related ones:

**Same Pattern (Monotonic Deque):**
1. Sliding Window Minimum
2. Shortest Subarray with Sum at Least K
3. Jump Game VI
4. Constrained Subsequence Sum

**Related Patterns:**
1. Maximum of all subarrays of size k (simpler version)
2. First Negative Integer in Every Window of Size k
3. Count of Subarrays with all distinct elements

---

## Remember

The monotonic deque pattern is powerful but not intuitive at first. The key insights are:

1. **Store indices, not values** - to track window membership
2. **Maintain decreasing order** - to have max at front
3. **Remove from both ends** - old elements and useless elements
4. **Each element processed once** - that's why it's O(n)

Take your time understanding WHY the deque stays in decreasing order and WHY we can remove elements. Once these click, the implementation becomes straightforward.

Only move to the solutions guide when you:
- Understand the deque concept
- Can trace through an example manually
- Have attempted an implementation
- Want to verify your approach or get unstuck

The journey of understanding is more valuable than memorizing the code. Good luck!
