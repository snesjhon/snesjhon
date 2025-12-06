# Sliding Window Problems

#pattern-guide #learning-path #pattern/sliding-window

All problems I've practiced using the sliding window pattern.

**Core Concept:** [[sliding-window]]

---

## Pattern Overview

Sliding window maintains a range `[left, right]` that:
- Expands: Move `right` pointer forward
- Contracts: Move `left` pointer forward
- Tracks: Properties of elements within window

### When to Use
- "Longest substring..."
- "Maximum/minimum in subarray..."
- "k consecutive elements..."
- Optimizing nested loops over subarrays

---

## Mastery Levels

### ✅ Understood & Confident
- [[003-longest-substring]] - Variable window with Set/Map
  - **Pattern**: Expand right, contract when invalid (duplicate found)
  - **Key skill**: Knowing when to shrink window
  - Can implement from scratch ✓

### 🔥 Advanced / Still Practicing
- [[239-sliding-window-maximum]] - Monotonic deque
  - **Pattern**: Fixed window, maintain max efficiently
  - **Key skill**: Monotonic deque invariant
  - 🎯 Need more practice without hints

### 📝 To Practice
- Minimum Window Substring
- Longest Repeating Character Replacement
- Permutation in String
- Fruit Into Baskets
- Max Consecutive Ones III

---

## Problem Types

### Type 1: Fixed Window Size
**Find max/min/sum in all windows of size k**

Template:
```typescript
let windowSum = 0;
for (let i = 0; i < k; i++) {
  windowSum += arr[i];
}

for (let i = k; i < arr.length; i++) {
  windowSum = windowSum - arr[i - k] + arr[i];
  // Process window
}
```

**Example:** [[239-sliding-window-maximum]]

### Type 2: Variable Window Size
**Find longest/shortest window meeting condition**

Template:
```typescript
let left = 0;
for (let right = 0; right < arr.length; right++) {
  // Add arr[right] to window

  while (windowInvalid) {
    // Remove arr[left] from window
    left++;
  }

  // Update result
}
```

**Example:** [[003-longest-substring]]

---

## Common Patterns

### Pattern 1: Two Pointers + Set/Map
```typescript
const seen = new Set();
let left = 0;

for (let right = 0; right < arr.length; right++) {
  while (seen.has(arr[right])) {
    seen.delete(arr[left++]);
  }
  seen.add(arr[right]);
  maxLen = Math.max(maxLen, right - left + 1);
}
```

**Used in:** [[003-longest-substring]]

### Pattern 2: Window with Monotonic Deque
```typescript
const deque = [];

for (let i = 0; i < arr.length; i++) {
  // Remove out of window
  while (deque.length && deque[0] < i - k + 1) {
    deque.shift();
  }

  // Maintain monotonic property
  while (deque.length && arr[deque[deque.length-1]] < arr[i]) {
    deque.pop();
  }

  deque.push(i);
}
```

**Used in:** [[239-sliding-window-maximum]]

---

## My Progress Tracker

**Total Practiced:** 2
**Confident:** 1
**Need Review:** 1
**To Learn:** 5+

### Skills Checklist
- ✅ Understand fixed vs variable window
- ✅ Know when to expand vs shrink
- ✅ Can calculate window size: `right - left + 1`
- ✅ Combine with hash map for tracking
- 🔄 Monotonic deque technique
- 🎯 Recognize pattern in new problems quickly

---

## Common Mistakes I've Made

### 1. Wrong Window Size Calculation
```typescript
// ❌ Wrong
size = right - left;

// ✅ Correct
size = right - left + 1;
```

### 2. Forgetting to Update Maximum
```typescript
// ❌ Only update when window invalid
if (seen.has(char)) {
  maxLen = Math.max(maxLen, size);
}

// ✅ Update every iteration
maxLen = Math.max(maxLen, right - left + 1);
```

### 3. Infinite While Loop
```typescript
// ❌ Forgetting to increment left
while (windowInvalid) {
  // Remove from window but forgot: left++
}

// ✅ Always move left forward
while (windowInvalid) {
  // Remove...
  left++;
}
```

---

## Pattern Recognition

**I should think "sliding window" when I see:**
- Keywords: "longest", "shortest", "maximum", "minimum"
- Context: "substring", "subarray", "consecutive elements"
- Optimization: Can replace O(n²) nested loops

**Quick test:**
- Is it about a contiguous range? ✓
- Am I checking all subarrays? ✓
- Can I maintain state as I slide? ✓
→ Probably sliding window!

---

## Next Steps

### To Master This Pattern:
1. ✅ Solve 3-5 easy problems
2. 🔄 Solve 3-5 medium problems
3. 🎯 Solve 1-2 hard problems
4. 🎯 Can recognize pattern in < 30 seconds
5. 🎯 Can code template from memory

### Immediate Goals:
- [ ] Solve Minimum Window Substring
- [ ] Practice monotonic deque without hints
- [ ] Time myself on easy problems (aim < 15 min)

---

## Resources

- **NeetCode:** Sliding Window playlist
- **LeetCode:** Tag "Sliding Window"
- **My Notes:** [[sliding-window]] concept page

---

**Remember:** Right pointer expands, left pointer contracts. Window tracks what's between them!
