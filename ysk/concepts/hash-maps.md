# Hash Maps

#concept/data-structure

A data structure that provides fast key-value lookups with O(1) average time complexity.

## Core Idea

Hash maps (also called hash tables, dictionaries, or maps) store key-value pairs and allow you to retrieve values by their keys in constant time.

## In JavaScript/TypeScript

```typescript
// Map object (preferred for most cases)
const map = new Map<string, number>();
map.set("key", 42);
map.get("key"); // 42
map.has("key"); // true
map.delete("key");

// Object (for simple string keys)
const obj: Record<string, number> = {};
obj["key"] = 42;

// Set (for unique values only, no key-value pairs)
const set = new Set<number>();
set.add(42);
set.has(42); // true
```

## Time Complexity

| Operation | Average | Worst Case |
| --------- | ------- | ---------- |
| Insert    | O(1)    | O(n)       |
| Lookup    | O(1)    | O(n)       |
| Delete    | O(1)    | O(n)       |

**Space Complexity:** O(n) where n is number of entries

## When to Use Hash Maps

### Perfect For:

- Counting occurrences/frequency
- Looking up values quickly
- Detecting duplicates
- Caching/memoization
- Grouping related items
- Finding complements (e.g., two sum)

### The Complement Pattern

One of the most powerful hash map patterns:

```typescript
// Instead of checking all pairs...
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    if (nums[i] + nums[j] === target) // O(n²)
  }
}

// Use complement pattern with hash map
const map = new Map();
for (let i = 0; i < n; i++) {
  const complement = target - nums[i];
  if (map.has(complement)) return [map.get(complement), i]; // O(n)
  map.set(nums[i], i);
}
```

## Common Patterns

### 1. Frequency Counter

```typescript
const freq = new Map<string, number>();
for (const char of str) {
  freq.set(char, (freq.get(char) || 0) + 1);
}
```

### 2. Grouping

```typescript
const groups = new Map<string, string[]>();
for (const word of words) {
  const key = sortedWord(word);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(word);
}
```

### 3. Seen/Visited Tracking

```typescript
const seen = new Set<string>();
for (const item of items) {
  if (seen.has(item)) return true; // Duplicate found
  seen.add(item);
}
```

### 4. Index Mapping

```typescript
const indexMap = new Map<number, number>();
nums.forEach((num, i) => indexMap.set(num, i));
```

## Space-Time Tradeoff

Hash maps often enable a space-time tradeoff:

- **Trade space** (storing extra data in hash map)
- **For time** (faster lookups)

Example: O(n²) → O(n) by using O(n) extra space

## Map vs Object vs Set

### Use Map when:

- Keys are not strings
- Need to preserve insertion order
- Frequently adding/removing entries
- Need size property

### Use Object when:

- Simple string keys
- Working with JSON
- Need to use object syntax

### Use Set when:

- Only need to track unique values
- Don't need key-value pairs
- Checking existence is main operation

## Related Concepts

- arrays - Often used together
- [[two-pointers]] - Alternative to some hash map solutions
- [[sliding-window]] - Sometimes combined with hash maps

## Questions Using Hash Maps

- [[001-two-sum]] - Classic complement pattern
- [[049-group-anagrams]] - Grouping pattern
- 347-top-k-frequent-elements - Frequency counter
- [[longest-substring-study-guide]] - Sliding window with hash map

## My Understanding

✅ Understand O(1) lookup property
✅ Know when to use Map vs Object vs Set
✅ Comfortable with complement pattern
✅ Can apply to frequency and grouping problems
🎯 Need practice recognizing when hash map optimizes solution

---

**Key Insight**: When you need fast lookups or are checking "have I seen this before?", think hash map!
