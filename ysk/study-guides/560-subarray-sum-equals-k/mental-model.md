# Subarray Sum Equals K - Mental Model

## The Checkpoint Journey Analogy

Imagine you're on a road trip keeping track of your odometer (total miles driven).

```
Start ----[10mi]---- City A ----[5mi]---- City B ----[15mi]---- City C
Odometer:   10          15                   30
```

At each city, you write down your **total miles from the start** in a logbook:
- Before start: 0 miles
- City A: 10 miles total
- City B: 15 miles total
- City C: 30 miles total

**Question:** How do you find the distance **between** City A and City C?

**Answer:** `30 - 10 = 20 miles`

You subtract the earlier checkpoint from the later checkpoint!

**This is exactly what we're doing with subarrays:**
- Array elements = road segments
- Running sum = odometer (total sum so far)
- HashMap = logbook (remembers what odometer readings we've seen)
- Finding subarrays = finding which segments between checkpoints equal k

---

## Building from the Ground Up

Let's start small and watch the pattern emerge.

### The Simplest Case: `nums = [3]`, `k = 3`

We have one number. Does it equal k? Let's trace it:

```
Before start: odometer = 0  (logbook: {0: once})

Position 0: Drive 3 miles
  Odometer: 0 + 3 = 3

  Question: "To find a 3-mile segment ending here, what earlier reading do I need?"
  Answer: 3 - 3 = 0

  Check logbook: "Did I see odometer=0 before?"
  YES! At the start.

  This means: From start to here is exactly 3 miles! ✓
```

**Found:** `[3]`

**Key insight:** We're asking "what earlier checkpoint would make this segment equal k?"

---

### Adding Complexity: `nums = [1, 2, 3]`, `k = 3`

Now we have multiple segments. Let's drive and keep our logbook:

```
Start (odometer: 0)
  │
  ├─ Drive 1 mile → Position 0 (odometer: 1)
  │
  ├─ Drive 2 miles → Position 1 (odometer: 3)
  │
  └─ Drive 3 miles → Position 2 (odometer: 6)
```

**Position 0: Just drove 1 mile**
```
Odometer: 1
Looking for: 1 - 3 = -2 (impossible - you can't have negative miles)
Logbook has -2? NO

Update logbook: {0: once, 1: once}
Segments found: 0
```

**Position 1: Just drove 2 more miles**
```
Odometer: 1 + 2 = 3
Looking for: 3 - 3 = 0
Logbook has 0? YES (at the start!)

This means: From start to here is exactly 3 miles!
Segment: [1, 2] ✓

Update logbook: {0: once, 1: once, 3: once}
Segments found: 1
```

**Position 2: Just drove 3 more miles**
```
Odometer: 3 + 3 = 6
Looking for: 6 - 3 = 3
Logbook has 3? YES (at Position 1!)

This means: From Position 1 to here is exactly 3 miles!
Segment: [3] ✓

Update logbook: {0: once, 1: once, 3: once, 6: once}
Segments found: 2
```

**Result:** Found 2 segments: `[1,2]` and `[3]`

---

## What Just Happened?

We discovered that by tracking:
1. **Current odometer** (running sum)
2. **Past odometer readings** (hashmap)

We can instantly find segments (subarrays) without rechecking every possible start/end combination!

**The pattern:**
```
If current odometer = 6 and we want a 3-mile segment:
  → Look for odometer reading 3 in our logbook
  → If found, the segment between them is 3 miles
```

---

## Why the HashMap Stores Counts

### The Duplicate Checkpoint Problem

What if your odometer reading repeats? Let's see:

`nums = [1, -1, 1]`, `k = 1`

```
Start: odometer = 0

Position 0: Drive 1 mile
  Odometer: 1
  Looking for: 0
  Logbook has 0? YES (at start)
  Found segment: [1] ✓

  Logbook: {0: once, 1: once}

Position 1: Drive -1 mile (go backwards!)
  Odometer: 0  ← We're back at 0!
  Looking for: -1
  Logbook has -1? NO

  Logbook: {0: TWICE, 1: once}  ← Notice: 0 appears twice now!

Position 2: Drive 1 mile
  Odometer: 1
  Looking for: 0
  Logbook has 0? YES (TWICE!)
```

**Why twice?**

Odometer reading 0 appeared at **two different checkpoints**:
1. At the start (before position 0)
2. At position 1 (after `[1, -1]`)

**This creates TWO different segments ending at position 2:**

| Checkpoint with 0 | Segment | Math |
|-------------------|---------|------|
| Start | `[1, -1, 1]` (positions 0-2) | All 3 elements |
| Position 1 | `[1]` (position 2 only) | Just the last element |

**So we add 2 to our count!**

```
Segments found: 1 (from earlier) + 2 (just found) = 3 total
```

**The key:** Same odometer at different checkpoints = different segments!

---

## Why Not Just Check Everything?

You might think: "Why not just check every possible subarray?"

```typescript
// Brute force
for (let start = 0; start < nums.length; start++) {
  for (let end = start; end < nums.length; end++) {
    // Check if sum from start to end equals k
  }
}
```

**For an array of 5 elements:**
- Need to check: 15 different subarrays
- Time: O(n²)

**For an array of 1000 elements:**
- Need to check: ~500,000 different subarrays
- Time: Too slow!

**With the logbook (hashmap) approach:**
- Check each position once
- Quick lookup: "Have I seen this reading before?"
- Time: O(n) - Much faster!

**It's like:**
- ❌ **Brute force:** Manually measuring every possible road segment with a ruler
- ✅ **HashMap:** Subtracting checkpoint readings from your logbook

---

## The Logbook Structure

```
Logbook (HashMap) = {odometer_reading: how_many_times_seen}
```

**NOT the number of segments found!** Just how many checkpoints had that reading.

**Example:**
```
{0: 2, 3: 1, 6: 1}
```

Means:
- Saw odometer reading 0 at **2 checkpoints** (start and position 1)
- Saw odometer reading 3 at **1 checkpoint** (position 1)
- Saw odometer reading 6 at **1 checkpoint** (position 2)

**When we find a match:**
```
Looking for reading 0, found it TWICE
→ Add 2 to segment count (2 different starting checkpoints)
```

---

## Why We Start With `{0: 1}`

**Question:** Why does the logbook start with `{0: 1}` before we've driven anywhere?

**Answer:** The "checkpoint before you start" has an odometer reading of 0.

This handles segments that start at the very beginning of the array!

**Example:** `nums = [3]`, `k = 3`
```
Position 0: odometer = 3, looking for 0
Logbook has 0? YES (the starting checkpoint)
→ Found segment [3] starting from the beginning!
```

Without `{0: 1}`, we'd miss all segments that start at index 0.

**Think of it as:** Before you start driving, your odometer reads 0 miles.

---

## Why We Check BEFORE Adding

```typescript
// CORRECT order
const target = runningSum - k;
count += hashMap.get(target) || 0;  // Check old readings
hashMap.set(runningSum, ...);       // Record current reading
```

**Why this order?**

We're looking for **past checkpoints** that create valid segments ending at the **current** position.

The current checkpoint isn't "past" yet - it becomes available for **future** positions to reference.

**Analogy:**
- You're at City C
- You check your logbook for past checkpoints
- Then you write "City C: odometer 30" in your logbook
- Future cities will check and find your City C entry

---

## Common Misconceptions

### ❌ "The hashmap counts the number of subarrays"

No! The hashmap counts **how many checkpoints had each odometer reading**.

These numbers are different:
- `hashMap = {0: 2, 3: 1}` → Saw reading 0 twice, reading 3 once
- `count = 3` → Found 3 total segments

### ❌ "I need to store the actual positions/indices"

No! You only need the **count** of how many times each reading appeared.

Each occurrence creates one valid segment when we subtract from current position.

### ❌ "This only works with positive numbers"

No! Negative numbers are like "driving backwards." Your odometer can go down!

That's actually why this problem needs a hashmap instead of simpler approaches.

### ❌ "I need to check if current_sum equals k directly"

No! We check if `(current_sum - k)` exists in the hashmap.

This finds segments **ending** at the current position that sum to k.

---

## The Pattern: Running Sum + HashMap

This problem belongs to a family where you:

1. **Keep a running total** as you process elements
2. **Want to find ranges** that have some property
3. **Use a hashmap to remember** what you've seen

Other problems with this pattern:
- Find subarray with sum divisible by k
- Find longest subarray with equal 0s and 1s
- Count subarrays with a specific property

**The natural solution:** Track running sums, use hashmap to check past sums.

---

## Try It Yourself

Before looking at code, trace `nums = [1, 1, 1]`, `k = 2` by hand:

1. Start with odometer = 0, logbook = {0: 1}
2. At each position:
   - Update odometer
   - Calculate what reading you need
   - Check logbook
   - Update logbook
3. Track how many segments you find

You should find 2 segments: `[1,1]` at positions 0-1, and `[1,1]` at positions 1-2.

---

## The Algorithm in Plain English

```
Start with:
- Odometer at 0
- Logbook with {0: once}
- Segment counter at 0

For each element:
  1. Add element to odometer (running sum)
  2. Calculate target: "what past reading would create a k-mile segment?"
  3. Check logbook: "how many times have I seen that target?"
  4. Add that count to segment counter
  5. Record current odometer reading in logbook
```

That's it! The hashmap does all the heavy lifting of remembering past states.

---

## Ready for the Code?

Now that you have the mental model:
- You understand the **checkpoint/odometer analogy**
- You see **why we track running sums**
- You know **what the hashmap stores** (counts of odometer readings)
- You recognize **when counts matter** (duplicate readings)
- You understand **the base case** (starting checkpoint at 0)

The actual code is just translating this mental model into loops and hashmap operations.

---

## Complete Solution

```typescript
function subarraySum(nums: number[], k: number): number {
  let count = 0;
  let runningSum = 0;
  const hashMap = new Map<number, number>();

  // Starting checkpoint: odometer at 0, seen once
  hashMap.set(0, 1);

  for (let num of nums) {
    // Drive to next checkpoint
    runningSum += num;

    // What past checkpoint would create a k-mile segment?
    const target = runningSum - k;

    // How many times have we seen that checkpoint?
    count += hashMap.get(target) || 0;

    // Record current checkpoint in logbook
    hashMap.set(runningSum, (hashMap.get(runningSum) || 0) + 1);
  }

  return count;
}
```

**Time:** O(n) - Visit each checkpoint once
**Space:** O(n) - Logbook can have up to n entries