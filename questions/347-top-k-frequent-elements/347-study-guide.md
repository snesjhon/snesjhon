# Top K Frequent Elements - Study Guide & Solution Analysis

## Problem Overview

Given an array of integers and a number k, find the k most frequently occurring elements in the array. The solution should be better than O(n log n) time complexity.

---

## Solution Comparison

### Approach 1: Hash Map + Sorting

**Basic Algorithm:**

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  // Count frequencies
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  // Convert to array and sort by frequency
  const sorted = Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]);

  // Return top k elements
  return sorted.slice(0, k).map((entry) => entry[0]);
}
```

**How it Works:**

1. Build a frequency map counting occurrences of each number
2. Convert map entries to an array of [number, frequency] pairs
3. Sort the array by frequency in descending order
4. Take the first k elements and extract just the numbers

**Complexity Analysis:**

- Time: O(n log n) - sorting dominates (where n is number of unique elements)
- Space: O(n) - hash map and sorted array

**Pros:**

- Intuitive and straightforward
- Easy to implement and understand
- Works correctly for all cases

**Cons:**

- Doesn't meet the O(n) requirement in the follow-up
- Sorting is unnecessary overhead when we only need top k elements
- Not optimal for large datasets

---

### Approach 2: Hash Map + Min Heap

**Optimized Algorithm:**

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  // Count frequencies
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  // Min heap of size k
  const heap: [number, number][] = []; // [number, frequency]

  for (const [num, freq] of freqMap.entries()) {
    heap.push([num, freq]);
    heap.sort((a, b) => a[1] - b[1]); // Min heap by frequency

    if (heap.length > k) {
      heap.shift(); // Remove smallest frequency
    }
  }

  return heap.map((entry) => entry[0]);
}
```

**How it Works:**

1. Build frequency map (same as approach 1)
2. Maintain a min heap of size k
3. For each element, add to heap
4. If heap size exceeds k, remove the minimum frequency element
5. Heap contains the k most frequent elements

**Complexity Analysis:**

- Time: O(n log k) - n elements, each heap operation is O(log k)
- Space: O(n + k) - frequency map + heap

**Pros:**

- Better than O(n log n) when k << n (k much smaller than n)
- Memory efficient for small k
- Good for streaming data

**Cons:**

- Still not O(n) - doesn't fully satisfy the follow-up
- JavaScript lacks built-in heap, so implementation is manual
- More complex than sorting approach

---

### Approach 3: Bucket Sort (Optimal Solution)

**Optimal Algorithm:**

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  // Step 1: Count frequencies
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  // Step 2: Create buckets (index = frequency)
  const buckets: number[][] = Array(nums.length + 1)
    .fill(null)
    .map(() => []);

  for (const [num, freq] of freqMap.entries()) {
    buckets[freq].push(num);
  }

  // Step 3: Collect top k from highest frequency buckets
  const result: number[] = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    if (buckets[i].length > 0) {
      result.push(...buckets[i]);
    }
  }

  return result.slice(0, k);
}
```

**How it Works:**

1. Build frequency map (O(n))
2. Create an array of buckets where index represents frequency
3. Place each number in the bucket corresponding to its frequency
4. Iterate from highest frequency bucket to lowest, collecting k elements

**Why This Works:**

- Maximum frequency possible = array length (all same number)
- Bucket index represents frequency count
- Numbers with same frequency go in same bucket
- Iterate backwards to get highest frequencies first

**Complexity Analysis:**

- Time: O(n) - three linear passes through data
- Space: O(n) - frequency map + buckets

**Pros:**

- Meets the O(n) requirement perfectly
- Linear time complexity
- No sorting needed
- Elegant use of frequency as index

**Cons:**

- Less intuitive than sorting
- Uses more space (array of arrays)
- Might be overkill for small datasets

---

## Visual Example Walkthrough

**Input:** `nums = [1,1,1,2,2,3]`, `k = 2`

### Step 1: Build Frequency Map

```
1 → 3 occurrences
2 → 2 occurrences
3 → 1 occurrence
```

### Step 2: Create Buckets (Bucket Sort Approach)

```
buckets[0] = []
buckets[1] = [3]      ← frequency 1
buckets[2] = [2]      ← frequency 2
buckets[3] = [1]      ← frequency 3
buckets[4] = []
buckets[5] = []
buckets[6] = []
```

### Step 3: Collect Top K

```
Start from highest index:
buckets[3] = [1]  → result = [1]  (k=2, need 1 more)
buckets[2] = [2]  → result = [1,2] (k=2, done!)

Return: [1, 2]
```

---

## Comparison Summary

| Aspect              | Hash Map + Sort | Hash Map + Heap | Bucket Sort (Optimal) |
| ------------------- | --------------- | --------------- | --------------------- |
| Time Complexity     | O(n log n)      | O(n log k)      | O(n)                  |
| Space Complexity    | O(n)            | O(n + k)        | O(n)                  |
| Meets Follow-up?    | ❌ No           | ⚠️ Partial      | ✅ Yes                |
| Implementation      | Easy            | Medium          | Medium                |
| Intuitive?          | High            | Medium          | Low                   |
| Production Ready?   | Yes             | Yes             | Yes                   |
| Best for            | Small datasets  | Small k         | Large datasets, k > 1 |

**Performance Comparison:**

Array of 100,000 elements, k = 10:

- Sorting: ~100,000 × log(100,000) ≈ 1,660,000 operations
- Heap: ~100,000 × log(10) ≈ 332,000 operations
- Bucket Sort: ~100,000 operations

---

## Core Concepts to Master

### 1. Frequency Counting with Hash Maps

**What:** Count occurrences of elements efficiently

```typescript
const freqMap = new Map();
for (const num of nums) {
  freqMap.set(num, (freqMap.get(num) || 0) + 1);
}
```

**Why:** O(1) insert and lookup, perfect for counting

### 2. Bucket Sort Pattern

**What:** Use frequency/value as array index for sorting

**Key Insight:**

- When values have a limited range, use them as indices
- No comparisons needed = O(n) time
- Trade space for time

**Applicable when:**

- Values are integers in known range
- Frequency has natural upper bound
- Need linear time sorting

### 3. Top K Elements Pattern

**Common Approaches:**

1. **Sort everything** - O(n log n)
2. **Partial sort with heap** - O(n log k)
3. **Bucket/counting approach** - O(n)

**When to use each:**

- Heap: When k is very small compared to n
- Bucket: When possible (limited range)
- Sort: When simplicity matters more than optimization

### 4. Time-Space Tradeoffs

**This problem demonstrates:**

- Bucket sort: O(n) time but O(n) space
- Could optimize space with in-place sorting, but time increases
- Often worth trading space for time in interviews

---

## Common Mistakes & Edge Cases

### Mistakes to Avoid:

1. **Forgetting to Handle Duplicates**

   ```typescript
   // Wrong - doesn't count duplicates
   const unique = [...new Set(nums)];
   ```

2. **Off-by-One in Bucket Size**

   ```typescript
   // Wrong - array index out of bounds
   const buckets = Array(nums.length); // Should be length + 1

   // Correct
   const buckets = Array(nums.length + 1);
   ```

3. **Not Handling k = all unique elements**

   ```typescript
   // Edge case: k equals number of unique elements
   nums = [1, 2, 3, 4, 5];
   k = 5; // Return all elements
   ```

4. **Inefficient Map Initialization**
   ```typescript
   // Verbose
   if (map.has(num)) {
     map.set(num, map.get(num) + 1);
   } else {
     map.set(num, 1);
   }
   // Better
   map.set(num, (map.get(num) || 0) + 1);
   ```

### Edge Cases to Consider:

**Single Element:**

```typescript
Input: nums = [1], k = 1
Output: [1]
```

**All Same Elements:**

```typescript
Input: nums = [1,1,1,1], k = 1
Output: [1]
```

**All Unique Elements:**

```typescript
Input: nums = [1,2,3,4,5], k = 3
Output: [1,2,3] (or any 3 elements - order doesn't matter)
```

**k Equals Unique Count:**

```typescript
Input: nums = [1,1,2,2,3,3], k = 3
Output: [1,2,3]
```

**Negative Numbers:**

```typescript
Input: nums = [-1,-1,2,2,3], k = 2
Output: [-1,2]
```

---

## Pattern Recognition

### When to Use Bucket Sort:

✅ **Good fit:**

- Counting frequencies
- Values in limited/known range
- Need O(n) time complexity
- "Top K" problems with frequencies

❌ **Not ideal:**

- Unbounded value ranges
- Need stable sorting
- Values are not integers
- Space is critically limited

### Related "Top K" Problems:

1. **Kth Largest Element** - Use heap or quickselect
2. **Top K Frequent Words** - Similar but with strings (needs sorting for ties)
3. **K Closest Points** - Use heap with distance metric
4. **Find K Pairs with Smallest Sums** - Heap-based merge

### Frequency Counting Pattern:

Appears in:

- **Group Anagrams** - Count character frequencies
- **Valid Anagram** - Compare frequency maps
- **Sort Characters by Frequency** - Frequency + sorting
- **Majority Element** - Find element with frequency > n/2

---

## Advanced Optimizations

### 1. Early Termination

If k equals unique element count, skip sorting:

```typescript
if (freqMap.size === k) {
  return Array.from(freqMap.keys());
}
```

### 2. Quick Select Algorithm

For very large datasets, Quick Select can find kth element in O(n) average:

```typescript
// Partition-based approach similar to QuickSort
// Average O(n), worst case O(n²)
```

### 3. Streaming Data Variation

For continuous data streams, maintain a Min Heap of size k:

- More space efficient than bucket sort
- Works with unbounded streams
- O(log k) per element

---

## Learning Path

### Phase 1: Foundation (Start Here)

✓ Understand the problem and constraints
✓ Implement Hash Map + Sort solution
→ Analyze why it's O(n log n)
→ Understand the "better than O(n log n)" requirement

**Practice:**

1. Implement the sorting solution from scratch
2. Test with all edge cases
3. Explain time complexity analysis

### Phase 2: Optimization

→ Learn about bucket sort and counting sort
→ Implement bucket sort solution
→ Compare performance with sorting approach
→ Understand when O(n) is achievable

**Practice:**

1. Draw the bucket sort process for examples
2. Implement without looking at solution
3. Explain why it's O(n)

### Phase 3: Alternative Approaches

→ Learn about heaps/priority queues
→ Implement min heap solution
→ Understand tradeoffs (n log k vs n)
→ Learn Quick Select for kth element problems

**Practice:**

1. Implement all three approaches
2. Benchmark with different input sizes
3. Identify best approach for different constraints

### Phase 4: Pattern Application

**Related Problems to Practice:**

1. **Top K Frequent Words** (LeetCode 692) - Similar with strings
2. **Kth Largest Element** (LeetCode 215) - Quick Select / Heap
3. **Sort Characters by Frequency** (LeetCode 451) - Frequency + sorting
4. **K Closest Points to Origin** (LeetCode 973) - Heap with distance

---

## Interview Tips

### How to Approach in Interview:

1. **Clarify Constraints:**

   - Can numbers be negative? Yes
   - Is k always valid? Yes (1 ≤ k ≤ unique elements)
   - Does order of output matter? No

2. **Discuss Solutions Progressively:**

   - Start with "Hash map + sorting" (shows you can solve it)
   - Mention it's O(n log n)
   - Explain the problem asks for better
   - Propose bucket sort or heap

3. **Explain Trade-offs:**

   - Bucket sort: O(n) time, O(n) space
   - Heap: O(n log k) time, O(k) extra space
   - Choose based on constraints (k size, space limits)

4. **Code Cleanly:**
   - Use clear variable names
   - Add comments for key steps
   - Test with example during coding

### Common Follow-up Questions:

**Q: What if k can be larger than number of unique elements?**
A: Constraint guarantees this won't happen, but could return all unique elements.

**Q: What if we need to handle streaming data?**
A: Use min heap of size k, more memory efficient than bucket sort for streams.

**Q: Can you optimize space?**
A: Bucket sort uses O(n) space; for better space, use heap with O(k) space but O(n log k) time.

**Q: What if we need elements sorted by frequency?**
A: Bucket sort naturally gives this; for sorting approach, don't shuffle result.

---

## Real-World Applications

### 1. Analytics and Monitoring

- **Website analytics:** Top K visited pages
- **Error tracking:** Most frequent error codes
- **User behavior:** Most common user actions

### 2. Data Processing

- **Log analysis:** Most frequent log messages
- **Network traffic:** Top K IP addresses
- **Database queries:** Most expensive queries

### 3. Recommendation Systems

- **E-commerce:** Trending products
- **Social media:** Trending hashtags/topics
- **Music/Video:** Most played songs/videos

### 4. System Optimization

- **Cache design:** Keep most frequently accessed items
- **Load balancing:** Identify hot servers
- **Query optimization:** Index most queried fields

---

## Practice Exercises

### Exercise 1: Implement All Three Solutions

Write and test all three approaches:

1. Hash Map + Sorting
2. Hash Map + Min Heap
3. Bucket Sort

Compare their performance with different inputs.

### Exercise 2: Benchmark Performance

Create test cases:

```typescript
// Small k, large n
nums = [1...100000], k = 5

// Large k, large n
nums = [1...100000], k = 1000

// k = unique count
nums = [1,1,2,2,3,3,...], k = unique
```

Measure execution time for each approach.

### Exercise 3: Modify for Different Requirements

1. Return elements sorted by frequency (descending)
2. Return [element, frequency] pairs instead of just elements
3. Handle empty array edge case
4. Solve "Bottom K Frequent Elements"

### Exercise 4: Streaming Variation

Implement a class that maintains top K frequent elements as new elements arrive:

```typescript
class TopKFrequent {
  constructor(k: number) {}
  add(num: number): void {}
  getTopK(): number[] {}
}
```

---

## Key Takeaways

1. **Multiple valid solutions exist** - O(n log n), O(n log k), and O(n) all work

2. **Bucket sort achieves O(n)** - Using frequency as index eliminates sorting

3. **Understanding constraints matters** - "Better than O(n log n)" guides solution choice

4. **Frequency counting is a fundamental pattern** - Hash map for O(1) counting

5. **Top K problems have common patterns:**

   - Sorting: Simple but O(n log n)
   - Heap: Good for small k
   - Bucket: Best when range is limited

6. **Trade-offs are everywhere:**

   - Time vs Space
   - Simplicity vs Optimization
   - General vs Specific solutions

7. **Real-world relevance:**
   - Analytics dashboards
   - Monitoring systems
   - Cache eviction policies
   - Recommendation engines

---

## Resources to Learn More

### Algorithms and Data Structures:

- **Book:** "Cracking the Coding Interview" - Chapter 10 (Sorting)
- **Book:** "Introduction to Algorithms" (CLRS) - Chapter 8 (Linear-time Sorting)
- **Video:** Abdul Bari - Bucket Sort Explanation
- **Course:** Stanford CS106B - Heaps and Priority Queues

### Interactive Learning:

- **VisuAlgo.net** - Sorting visualizations (including bucket sort)
- **AlgoExpert** - Top K problems category
- **NeetCode** - Video explanation of this specific problem

### Similar Problems:

**Easy:**

- Majority Element (LeetCode 169)
- Sort Array by Increasing Frequency (LeetCode 1636)

**Medium:**

- Top K Frequent Words (LeetCode 692) - Direct variation
- Sort Characters by Frequency (LeetCode 451)
- K Closest Points to Origin (LeetCode 973)
- Kth Largest Element (LeetCode 215)

**Hard:**

- Find K Pairs with Smallest Sums (LeetCode 373)
- Reorganize String (LeetCode 767)

---

## Next Steps

1. **Implement all three solutions** and test with edge cases
2. **Understand why bucket sort is O(n)** - draw it out on paper
3. **Practice explaining the trade-offs** between approaches
4. **Move to "Top K Frequent Words"** - applies same pattern with sorting for ties
5. **Learn about heaps/priority queues** - essential for many Top K problems
6. **Explore Quick Select algorithm** - alternative O(n) approach for kth element

**Remember:** The bucket sort solution demonstrates a powerful principle: when you can use values/frequencies as array indices, you can achieve linear-time sorting. This pattern appears in many counting and frequency-based problems.

**Key Pattern to Remember:**

```
Frequency Counting + Bucket Sort = O(n) Top K Solution
```

This is one of the most elegant examples of trading space for time complexity!
