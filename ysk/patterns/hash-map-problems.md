# Hash Map Problems

#pattern-guide #learning-path #pattern/hash-map

All problems using hash maps for efficient lookups and grouping.

**Core Concept:** [[hash-maps]]

---

## Pattern Overview

Hash maps provide O(1) lookups enabling:
- Fast "have I seen this?" checks
- Frequency counting
- Grouping related items
- Finding complements
- Optimizing from O(n²) to O(n)

---

## Mastery Levels

### ✅ Understood & Confident
- [[001-two-sum]] - Complement pattern
  - **Pattern**: Store seen numbers, check for complement
  - **Key insight**: target - current = complement
  - Can implement from scratch ✓

- [[049-group-anagrams]] - Grouping pattern
  - **Pattern**: Create unique key, group by key
  - **Key insight**: Sorted chars = anagram signature
  - Can implement from scratch ✓

### 🔄 Practicing
- [[003-longest-substring]] - Tracking seen characters
  - **Pattern**: Set to track duplicates in window
  - Combined with sliding window ✓

### 📝 To Practice
- Two Sum II (sorted array - use two pointers instead)
- 3Sum
- 4Sum
- Valid Anagram
- Contains Duplicate
- Top K Frequent Elements

---

## Common Hash Map Patterns

### Pattern 1: Complement/Difference
**Find pairs that meet condition**

```typescript
const map = new Map<number, number>();

for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];

  if (map.has(complement)) {
    return [map.get(complement), i];
  }

  map.set(nums[i], i);
}
```

**Used in:** [[001-two-sum]]

### Pattern 2: Frequency Counter
**Count occurrences**

```typescript
const freq = new Map<T, number>();

for (const item of items) {
  freq.set(item, (freq.get(item) || 0) + 1);
}
```

**Used in:** Top K Frequent, most frequent element problems

### Pattern 3: Grouping
**Group items by common property**

```typescript
const groups = new Map<string, T[]>();

for (const item of items) {
  const key = generateKey(item);

  if (!groups.has(key)) {
    groups.set(key, []);
  }
  groups.get(key).push(item);
}

return [...groups.values()];
```

**Used in:** [[049-group-anagrams]]

### Pattern 4: Seen/Visited Tracking
**Detect duplicates or cycles**

```typescript
const seen = new Set<T>();

for (const item of items) {
  if (seen.has(item)) {
    return true; // Duplicate found
  }
  seen.add(item);
}

return false;
```

**Used in:** [[003-longest-substring]], Contains Duplicate

---

## Map vs Object vs Set

### Use Map When:
- Keys are not strings
- Need insertion order
- Frequently adding/removing
- Need `.size` property

### Use Object When:
- Simple string keys
- Working with JSON
- Fixed structure

### Use Set When:
- Only tracking existence
- No key-value pairs needed
- Duplicate detection

---

## My Progress Tracker

**Total Practiced:** 3
**Confident:** 2
**Need Review:** 1
**To Learn:** 6+

### Skills Checklist
- ✅ Understand O(1) lookup property
- ✅ Know Map vs Object vs Set
- ✅ Can apply complement pattern
- ✅ Can implement grouping pattern
- ✅ Can use for frequency counting
- 🎯 Recognize when to use hash map over two pointers

---

## Common Mistakes I've Made

### 1. Using Wrong Data Structure
```typescript
// ❌ Array as key won't work
const map = new Map();
map.set([1,0,1], value);
map.get([1,0,1]); // undefined! Different reference

// ✅ Convert to string
map.set([1,0,1].join('#'), value);
```

### 2. Forgetting to Initialize
```typescript
// ❌ Error if key doesn't exist
freq.set(char, freq.get(char) + 1);

// ✅ Handle undefined
freq.set(char, (freq.get(char) || 0) + 1);
```

### 3. Not Checking Existence First
```typescript
// ❌ Might access undefined
const value = map.get(key).property;

// ✅ Check first
if (map.has(key)) {
  const value = map.get(key).property;
}
```

---

## Space-Time Tradeoffs

**Hash map approach:**
- ✅ O(n) time
- ❌ O(n) space

**Two pointer approach** (if sorted):
- ✅ O(1) space
- ❌ O(n log n) time (sorting)

**When to choose which:**
- Array already sorted → two pointers
- Array unsorted + can't modify → hash map
- Need O(n) time → hash map
- Space constrained → consider two pointers + sort

---

## Pattern Recognition

**Think hash map when:**
- "Find pair that sums to..."
- "Group by..."
- "Count frequency..."
- "Have I seen this?"
- "Detect duplicate..."
- Can optimize from O(n²)

**Quick test:**
- Need fast lookup? ✓
- Checking "seen before"? ✓
- Counting occurrences? ✓
- Grouping items? ✓
→ Probably hash map!

---

## Related Patterns

Often combined with:
- [[sliding-window]] - Track window contents
- [[two-pointers]] - Alternative for some problems
- [[arrays]] - Primary data structure

---

## Next Steps

### To Master:
1. ✅ Understand all 4 patterns
2. ✅ Solve 3+ problems per pattern
3. 🔄 Know when to use vs two pointers
4. 🎯 Recognize pattern instantly
5. 🎯 Code from memory in < 10 min

### Immediate Goals:
- [ ] Solve Top K Frequent Elements
- [ ] Practice 3Sum (combines hash map + two pointers)
- [ ] Solve Contains Duplicate variations

---

**Remember:** Hash maps trade space for time - O(n) space for O(1) lookups!
