# 049 - Group Anagrams

#pattern/hash-map #concept/hash-maps #concept/strings

**Problem:** Given an array of strings, group all anagrams together.

**Related Concepts:**

- [[hash-maps]] - Grouping pattern
- Sorting - Creating unique keys
- arrays - Working with string arrays

**Related Problems:**

- [[001-two-sum]] - Hash map usage
- Valid Anagram - Detecting single anagram pair
- Find All Anagrams in String

---

## Problem Statement

```
Input: ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

Input: [""]
Output: [[""]]

Input: ["a"]
Output: [["a"]]
```

**Note:** Order doesn't matter in output or within groups

---

## Mental Model

### The Core Insight

**Anagrams share the same characters in different orders**

```
"eat" → characters: e, a, t
"tea" → characters: t, e, a  ← Same characters!
"ate" → characters: a, t, e  ← Same characters!
```

### The Breakthrough

**Sorted characters create a unique signature:**

```
"eat" → sort → "aet"
"tea" → sort → "aet"  ← Same signature!
"ate" → sort → "aet"  ← Same signature!
"bat" → sort → "abt"  ← Different!
```

All anagrams map to the same sorted key!

---

## Solution: Hash Map Grouping

**Time:** O(n × k log k) | **Space:** O(n × k)

- n = number of strings
- k = maximum string length

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of strs) {
    // Create sorted key
    const key = word.split("").sort().join("");

    // Add to group
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(word);
  }

  return Array.from(groups.values());
}
```

### Cleaner Version

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();

  strs.forEach((word) => {
    const key = word.split("").sort().join("");
    const group = groups.get(key) || [];
    group.push(word);
    groups.set(key, group);
  });

  return [...groups.values()];
}
```

### Walkthrough

```
Input: ["eat","tea","tan","ate","nat","bat"]

Step 1: word="eat", key="aet"
  groups = { "aet": ["eat"] }

Step 2: word="tea", key="aet"
  groups = { "aet": ["eat", "tea"] }

Step 3: word="tan", key="ant"
  groups = { "aet": ["eat", "tea"],
             "ant": ["tan"] }

Step 4: word="ate", key="aet"
  groups = { "aet": ["eat", "tea", "ate"],
             "ant": ["tan"] }

Step 5: word="nat", key="ant"
  groups = { "aet": ["eat", "tea", "ate"],
             "ant": ["tan", "nat"] }

Step 6: word="bat", key="abt"
  groups = { "aet": ["eat", "tea", "ate"],
             "ant": ["tan", "nat"],
             "abt": ["bat"] }

Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]
```

---

## Alternative: Character Count as Key

**Time:** O(n × k) | **Space:** O(n × k)

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of strs) {
    // Create character count signature
    const count = new Array(26).fill(0);
    for (const char of word) {
      count[char.charCodeAt(0) - "a".charCodeAt(0)]++;
    }

    // Use count array as key
    const key = count.join("#");

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(word);
  }

  return [...groups.values()];
}
```

**Why this works:**

```
"eat" → [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0]
         ^a   ^e                                  ^t
"tea" → [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0]
         Same counts!
```

**Better time complexity** - O(n × k) vs O(n × k log k)

---

## Comparison

| Approach    | Time         | Space  | Pros              | Cons         |
| ----------- | ------------ | ------ | ----------------- | ------------ |
| Sorting     | O(n×k log k) | O(n×k) | Simple, intuitive | Slower       |
| Count Array | O(n×k)       | O(n×k) | Faster            | More complex |

For interviews: **Sorting is usually fine** and easier to explain!

---

## Common Mistakes

### Mistake 1: Nested Loop Comparison

```typescript
// ❌ Wrong - O(n² × k)
for (let i = 0; i < strs.length; i++) {
  for (let j = 0; j < strs.length; j++) {
    if (isAnagram(strs[i], strs[j])) {
      // Group them...
    }
  }
}
```

**Problem:** Comparing all pairs is inefficient!

### Mistake 2: Using Array as Map Key

```typescript
// ❌ Won't work in JavaScript
const groups = new Map();
groups.set([1, 0, 1], ["eat"]); // Array as key!
groups.get([1, 0, 1]); // undefined! Different array reference
```

**Fix:** Convert array to string: `key.join('#')`

### Mistake 3: Forgetting Empty String

```typescript
Input: [""];
// Key for "" is also ""
// Should return: [[""]]
```

---

## Core Concepts

### 1. Hash Map Grouping Pattern

```typescript
// General pattern:
const groups = new Map<KeyType, ValueType[]>();

for (const item of items) {
  const key = generateKey(item);
  if (!groups.has(key)) {
    groups.set(key, []);
  }
  groups.get(key).push(item);
}

return [...groups.values()];
```

This pattern works for many grouping problems!

### 2. Creating Unique Keys

Two approaches to create keys:

- **Canonical form**: Sort to create standard representation
- **Signature**: Create unique identifier (like character counts)

Both must ensure: same group → same key

### 3. Space-Time Tradeoff

- Hash map uses O(n×k) space
- But achieves O(n×k log k) or O(n×k) time
- Without hash map: would need O(n²×k) comparisons

---

## Pattern Recognition

This grouping pattern appears in:

- **Frequency analysis** - group by character counts
- **Classification** - group by properties
- **Deduplication** - group duplicates
- **Bucketing** - partition into categories

**Keywords:**

- "Group..."
- "Categorize..."
- "Partition by..."
- "Find all..."

---

## Practice Exercises

1. **Return groups as sorted arrays**
2. **Group by length first**, then anagrams
3. **Find largest anagram group**
4. **Count total anagram groups**

---

## My Learning Journey

**Understanding** ✅

- ✅ Grasp sorted key concept
- ✅ Know grouping pattern
- ✅ Understand time complexity
- ✅ Can optimize with character counts

**Implementation** ✅

- ✅ Can code from scratch
- ✅ Handle edge cases
- ✅ Explain both approaches

**Pattern Recognition** 🎯

- Apply grouping to other problems
- Recognize when to create keys
- Optimize key generation

---

## Key Takeaways

1. **Sorted characters = unique anagram signature**
2. **Hash map groups by common key**
3. **Character count is faster than sorting**
4. **Grouping pattern appears in many problems**
5. **Space for time - hash map worth it**

---

**Remember:** When you need to group items by shared properties, create a unique key and use a hash map!
