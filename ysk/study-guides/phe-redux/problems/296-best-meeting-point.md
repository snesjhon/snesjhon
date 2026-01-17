# 296. Best Meeting Point

## Problem Link
[LeetCode 296](https://leetcode.com/problems/best-meeting-point/) (Premium)

## Difficulty
Hard

## Interview Relevance
**Task 3 Optimization**: This problem provides an elegant O(n) solution for 1D meeting points using the median. Understanding this helps optimize the "fairness" aspect of the interview's multi-user problem.

---

## Problem Statement

Given a 2D grid where `1` represents a person's home, find the meeting point that minimizes total travel distance (Manhattan distance). People can only walk in cardinal directions.

```
Input: grid = [[1,0,0,0,1],[0,0,0,0,0],[0,0,1,0,0]]
Output: 6
Explanation: Point (0,2) gives distance 2+2+2=6
```

---

## Prerequisites

| Concept | Resource | Status |
|---------|----------|--------|
| Median concept | Math | [x] |
| Sorting | Basic | [x] |
| Manhattan distance | Math | [x] |

---

## Core Insight: The Median

For 1D meeting points, the **median** minimizes total distance.

```
People at positions: [1, 3, 7]
Median = 3

Meeting at 3: |1-3| + |3-3| + |7-3| = 2 + 0 + 4 = 6
Meeting at 2: |1-2| + |3-2| + |7-2| = 1 + 1 + 5 = 7  (worse!)
Meeting at 4: |1-4| + |3-4| + |7-4| = 3 + 1 + 3 = 7  (worse!)
```

**Why median works**: Moving away from median increases distance to more than half the people.

---

## 2D = Two Independent 1D Problems

Manhattan distance is separable:
```
distance((x1,y1), (x2,y2)) = |x1-x2| + |y1-y2|
```

This means we can solve X and Y independently!

```
People at: (0,0), (0,4), (2,2)
X coordinates: [0, 0, 2] → median = 0
Y coordinates: [0, 4, 2] → median = 2

Optimal meeting point: (0, 2)
```

---

## Algorithm

```typescript
function minTotalDistance(grid: number[][]): number {
  const rows: number[] = [];
  const cols: number[] = [];

  // Step 1: Collect all person coordinates
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === 1) {
        rows.push(r);
        cols.push(c);
      }
    }
  }

  // Step 2: Sort columns (rows already sorted by traversal order)
  cols.sort((a, b) => a - b);

  // Step 3: Find median and compute distance
  const medianRow = rows[Math.floor(rows.length / 2)];
  const medianCol = cols[Math.floor(cols.length / 2)];

  // Step 4: Sum distances
  let totalDistance = 0;
  for (const r of rows) totalDistance += Math.abs(r - medianRow);
  for (const c of cols) totalDistance += Math.abs(c - medianCol);

  return totalDistance;
}
```

---

## Interview Mapping

| Interview Concept | This Problem |
|-------------------|--------------|
| User locations | Person homes |
| Optimal activity location | Meeting point |
| "Total commute time" | Sum of Manhattan distances |
| "Fairness" | Median naturally balances! |

### Why Median = Fairness

The median minimizes the **maximum** individual distance in many cases:

```
People at: [0, 10, 11]
Mean = 7    → distances: 7, 3, 4 → max = 7
Median = 10 → distances: 10, 0, 1 → max = 10

Hmm, mean is better here for max distance!
```

**Important**: Median minimizes **total** distance, not max. For strict fairness, you might need to combine both metrics.

---

## Interview Application

For the Byteboard interview's Task 3:

```typescript
function findFairMidpoint(userLocations: [number, number][]): [number, number] {
  // Extract x and y coordinates
  const xCoords = userLocations.map(([x, _]) => x).sort((a, b) => a - b);
  const yCoords = userLocations.map(([_, y]) => y).sort((a, b) => a - b);

  // Median gives good starting point
  const medianX = xCoords[Math.floor(xCoords.length / 2)];
  const medianY = yCoords[Math.floor(yCoords.length / 2)];

  return [medianX, medianY];
}

// Then filter activities near this point before calling expensive calculateEta
const midpoint = findFairMidpoint(userLocations);
const nearbyActivities = activities.filter(a =>
  haversine(midpoint, a.coordinates) < THRESHOLD
);
```

---

## Key Insights

1. **Median, not mean**: Mean minimizes squared distance, median minimizes absolute
2. **2D is two 1D problems**: Manhattan distance is separable
3. **No need to check every point**: Just compute the median
4. **Odd vs even count**: For even count, any point between two medians works

---

## Complexity

| Aspect | Complexity |
|--------|------------|
| Time | O(mn) to collect + O(n log n) to sort |
| Space | O(n) for coordinate lists |

Much better than O(mn × n) brute force!

---

## Common Pitfalls

- Using mean instead of median
- Forgetting to sort columns (rows are naturally sorted)
- Not handling the 2D → 1D decomposition
- Computing median incorrectly for even-length arrays

---

## Related Problems

- [[phe-redux/problems/317-shortest-distance-buildings\|317. Shortest Distance from All Buildings]] - When obstacles exist
- 462. Minimum Moves to Equal Array Elements II - 1D median problem

---

## Connection to Byteboard Interview

This problem teaches the elegant median optimization for meeting points. While the interview's graph-based `calculateEta` is more complex than Manhattan distance, the median heuristic provides an excellent starting point for filtering activities before expensive API calls.
