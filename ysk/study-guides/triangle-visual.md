# Triangle Triplet Count - Visual Guide

## The Problem

Count the number of triplets in an array that could form valid triangle sides.

**Triangle inequality:** For sides a, b, c to form a triangle:

- a + b > c
- a + c > b
- b + c > a

## Key Insight: Fix the LARGEST Side!

### Why Sorting Helps

After sorting `[a, b, c]` where `a ≤ b ≤ c`:

- `c` is the **largest side**
- If `a + b > c` (smallest + middle > largest) ✅
- Then the other conditions are **automatically true**:
  - `a + c > b` ✅ (because `c ≥ b`, so `a + c ≥ a + b > c > b`)
  - `b + c > a` ✅ (because `b ≥ a` and `c > 0`)

**Mental Model:** Fix the **largest** side first, then find pairs of smaller sides that satisfy `left + right > largest`.

## The Algorithm

```mermaid
flowchart TD
    A[Sort array] --> B[i = length - 1]
    B --> C{i >= 2?}
    C -->|No| Z[Return count]
    C -->|Yes| D["Fix largest = nums[i]<br/>left = 0, right = i - 1"]
    D --> E{left < right?}
    E -->|No| M[i--]
    M --> C
    E -->|Yes| F{"nums[left] + nums[right] > nums[i]?"}
    F -->|Yes| G[count += right - left]
    G --> H[right--]
    H --> E
    F -->|No| I[left++]
    I --> E
```

## The Magic: `count += right - left`

This is the **key insight** that makes this problem efficient!

### Why This Works

When `nums[left] + nums[right] > nums[i]` (where `i` is the largest):

```
Array: [left, ..., middle, ..., right, ..., i(largest)]
         ↑                      ↑           ↑
       smallest              2nd largest  largest(fixed)
```

**All elements between `left` and `right` form valid triangles with `nums[right]` and `nums[i]`!**

Why? Because if `nums[left] + nums[right] > nums[i]` (smallest left value works), then:

- `nums[left+1] + nums[right] > nums[i]` ✅
- `nums[left+2] + nums[right] > nums[i]` ✅
- ...
- `nums[right-1] + nums[right] > nums[i]` ✅

All of these are **bigger** than `nums[left]`, so they all satisfy the triangle inequality!

## Step-by-Step Example

Array: `[4, 6, 9, 11, 15, 18]` (already sorted)

### Iteration 1: i=5, largest=18

```mermaid
sequenceDiagram
    participant Array as [4, 6, 9, 11, 15, 18]
    participant Algo as Algorithm
    participant Count as Count

    Note over Array: Fix largest=18 at i=5<br/>left=0, right=4

    Algo->>Array: Check: nums[0] + nums[4] > 18?<br/>4 + 15 = 19 > 18? YES ✅
    Note over Algo: All elements from 0 to 4<br/>form triangles with 15 and 18
    Algo->>Count: count += 4 - 0 = 4
    Note over Count: Triangles: [4,15,18], [6,15,18], [9,15,18], [11,15,18]

    Algo->>Array: Move right to 3
    Algo->>Array: Check: nums[0] + nums[3] > 18?<br/>4 + 11 = 15 > 18? NO ❌
    Algo->>Array: Move left to 1

    Algo->>Array: Check: nums[1] + nums[3] > 18?<br/>6 + 11 = 17 > 18? NO ❌
    Algo->>Array: Move left to 2

    Algo->>Array: Check: nums[2] + nums[3] > 18?<br/>9 + 11 = 20 > 18? YES ✅
    Algo->>Count: count += 3 - 2 = 1
    Note over Count: Triangle: [9,11,18]

    Algo->>Array: Move right to 2
    Note over Algo: left >= right, stop<br/>Total count: 5
```

### Iteration 2: i=4, largest=15

```mermaid
sequenceDiagram
    participant Array as [4, 6, 9, 11, 15, 18]
    participant Algo as Algorithm
    participant Count as Count

    Note over Array: Fix largest=15 at i=4<br/>left=0, right=3

    Algo->>Array: Check: nums[0] + nums[3] > 15?<br/>4 + 11 > 15? NO ❌
    Algo->>Array: Move left to 1

    Algo->>Array: Check: nums[1] + nums[3] > 15?<br/>6 + 11 > 15? YES ✅
    Algo->>Count: count += 3 - 1 = 2
    Note over Count: Triangles: [6,11,15], [9,11,15]

    Algo->>Array: Move right to 2
    Algo->>Array: Check: nums[1] + nums[2] > 15?<br/>6 + 9 > 15? NO ❌
    Algo->>Array: Move left to 2

    Note over Algo: left >= right, stop<br/>Total count: 7
```

### Detailed Visualization: How `count += right - left` Works

```mermaid
flowchart TD
    A["Check: nums[0] + nums[4] > 18?<br/>4 + 15 = 19 > 18 ✅"] --> B[All indices between left and right<br/>form triangles with right and i]

    B --> C["Triangle 1: [4, 15, 18]<br/>indices: [0, 4, 5]"]
    B --> D["Triangle 2: [6, 15, 18]<br/>indices: [1, 4, 5]"]
    B --> E["Triangle 3: [9, 15, 18]<br/>indices: [2, 4, 5]"]
    B --> F["Triangle 4: [11, 15, 18]<br/>indices: [3, 4, 5]"]

    C --> G["Count = right - left<br/>= 4 - 0 = 4 triangles"]
    D --> G
    E --> G
    F --> G

    style G fill:#ccffcc
```

## Why Move Right (not Left)?

When we find a valid triangle:

```
[left, ..., middle, ..., right, ..., i(largest)]
  ✓                      ✓           ✓
```

**We already counted ALL triangles** between `left` and `right` with this `right` value and `nums[i]`.

To find more triangles, we need a **smaller `right`** value, so we move `right--`.

If we moved `left++`, we'd miss triangles!

## Complete Example Trace

Array: `[4, 6, 9, 11, 15, 18]`

| i   | largest | left | right | nums[left] + nums[right] | Valid? | Count Added | Total Count |
| --- | ------- | ---- | ----- | ------------------------ | ------ | ----------- | ----------- |
| 5   | 18      | 0    | 4     | 4 + 15 = 19 > 18         | ✅     | 4 - 0 = 4   | 4           |
| 5   | 18      | 0    | 3     | 4 + 11 = 15 > 18         | ❌     | -           | 4           |
| 5   | 18      | 1    | 3     | 6 + 11 = 17 > 18         | ❌     | -           | 4           |
| 5   | 18      | 2    | 3     | 9 + 11 = 20 > 18         | ✅     | 3 - 2 = 1   | 5           |
| 5   | 18      | 2    | 2     | left >= right, stop      | -      | -           | 5           |
| 4   | 15      | 0    | 3     | 4 + 11 = 15 > 15         | ❌     | -           | 5           |
| 4   | 15      | 1    | 3     | 6 + 11 = 17 > 15         | ✅     | 3 - 1 = 2   | 7           |
| 4   | 15      | 1    | 2     | 6 + 9 = 15 > 15          | ❌     | -           | 7           |
| 4   | 15      | 2    | 2     | left >= right, stop      | -      | -           | 7           |
| 3   | 11      | 0    | 2     | 4 + 9 = 13 > 11          | ✅     | 2 - 0 = 2   | 9           |
| 3   | 11      | 0    | 1     | 4 + 6 = 10 > 11          | ❌     | -           | 9           |
| 3   | 11      | 1    | 1     | left >= right, stop      | -      | -           | 9           |
| 2   | 9       | 0    | 1     | 4 + 6 = 10 > 9           | ✅     | 1 - 0 = 1   | 10          |
| 2   | 9       | 0    | 0     | left >= right, stop      | -      | -           | 10          |

**Final Count: 10 triangles**

Valid triangles:
```
1. [4, 6, 9]
2. [4, 9, 11]
3. [6, 9, 11]
4. [4, 15, 18]
5. [6, 15, 18]
6. [9, 15, 18]
7. [11, 15, 18]
8. [6, 11, 15]
9. [9, 11, 15]
10. [9, 11, 18]
```

## When Invalid: Move Left

```
[left, ..., right, ..., i(largest)]
  ✗ Too small
```

If `nums[left] + nums[right] ≤ nums[i]`, it means `nums[left]` is too small.

We need a **bigger left value**, so we move `left++`.

## Visual Summary

```mermaid
flowchart LR
    A[Fix largest<br/>i backwards] --> B[left = 0<br/>right = i - 1]
    B --> C{"nums[left] +<br/>nums[right] ><br/>nums[i]?"}
    C -->|YES| D["count += right - left<br/>(ALL triangles counted)"]
    C -->|NO| E[left++<br/>Need bigger left]
    D --> F[right--<br/>Try smaller right]
    F --> G{"left < right?"}
    E --> G
    G -->|YES| C
    G -->|NO| H[Next i--]
    H --> I{i >= 2?}
    I -->|YES| B
    I -->|NO| J[Done]
```

## Correct Code

```typescript
function triangleNumber(nums: number[]): number {
  nums.sort((a, b) => a - b);

  let count = 0;
  // Iterate backwards, fixing the LARGEST element
  for (let i = nums.length - 1; i >= 2; i--) {
    let left = 0;
    let right = i - 1;

    while (left < right) {
      if (nums[left] + nums[right] > nums[i]) {
        // All elements from left to right-1 work with right and i
        count += right - left;
        right--;
      } else {
        left++;
      }
    }
  }
  return count;
}
```

## Time Complexity

- **Sort:** O(n log n)
- **Main algorithm:** O(n²)
  - Outer loop: O(n)
  - Inner while loop: O(n)
- **Total:** O(n²)

This is optimal for this problem!

## Mental Model Summary

1. **Fix the LARGEST side** (iterate backwards from end)
2. **Use two pointers** for the other two sides (left=0, right=i-1)
3. **Key insight:** After sorting, only check `nums[left] + nums[right] > nums[i]`
4. **Magic counting:** When valid, `count += right - left` counts ALL triangles at once
5. **Move right when valid** (we've counted all for this right)
6. **Move left when invalid** (left is too small)
7. **Critical:** We iterate BACKWARDS because fixing the largest element allows the efficient counting trick
