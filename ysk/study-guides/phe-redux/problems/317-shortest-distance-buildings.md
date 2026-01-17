# 317. Shortest Distance from All Buildings

## Problem Link
[LeetCode 317](https://leetcode.com/problems/shortest-distance-from-all-buildings/) (Premium)

## Difficulty
Hard

## Interview Relevance
**Task 3 Core Pattern**: This problem directly maps to finding a midpoint activity for multiple users. Each "building" is a user, and you need to find the location that minimizes total travel distance for everyone.

---

## Problem Statement

Given a 2D grid where:
- `0` = empty land (can walk through, can build here)
- `1` = building (must reach all of them)
- `2` = obstacle (cannot pass)

Find an empty land position that minimizes the sum of distances to all buildings. Return the minimum distance, or -1 if impossible.

```
Input: grid = [[1,0,2,0,1],[0,0,0,0,0],[0,0,1,0,0]]
Output: 7
Explanation: Point (1,2) has total distance 3+3+1=7 to all buildings.
```

---

## Prerequisites

| Concept | Resource | Status |
|---------|----------|--------|
| BFS | [[dsa/05-graph-traversal-bfs\|Graph BFS]] | [ ] |
| Multi-source BFS | [[phe-redux/01-weekly-plan\|Week 4]] | [ ] |
| Graph Traversal | [[dsa/04-graph-traversal-dfs\|Graph DFS]] | [ ] |

---

## Core Concepts

### 1. Multi-Source BFS
Run BFS from **each** building to compute distances to all empty cells.

```
Building 1 BFS:     Building 2 BFS:     Combined:
. 1 . . .          . . . . 1          . 1+∞ . . 1+∞
. 2 . . .    +     . . . 1 .     =    . 2+∞ . 1 ∞
. 3 . . .          . . . 2 .          . 3+∞ . 2 ∞
```

### 2. Aggregating Distances
For each empty cell, sum the distances from all buildings.

```typescript
// For each building, run BFS and add distances to totalDistance grid
for (const building of buildings) {
  bfs(building, distances, reachCount);
}

// Find minimum total distance among cells that reach ALL buildings
```

### 3. Reachability Check
Not all cells can reach all buildings (obstacles block paths). Track how many buildings each cell can reach.

---

## Algorithm

```typescript
function shortestDistance(grid: number[][]): number {
  // Step 1: Find all buildings
  const buildings: [number, number][] = [];

  // Step 2: Initialize distance and reach-count grids
  const totalDistance: number[][] = /* zeros */;
  const reachCount: number[][] = /* zeros */;

  // Step 3: BFS from each building
  for (const [r, c] of buildings) {
    bfs(r, c, grid, totalDistance, reachCount);
  }

  // Step 4: Find minimum distance among cells that reach ALL buildings
  let minDistance = Infinity;
  for (each empty cell (r, c)) {
    if (reachCount[r][c] === buildings.length) {
      minDistance = Math.min(minDistance, totalDistance[r][c]);
    }
  }

  return minDistance === Infinity ? -1 : minDistance;
}

function bfs(startR, startC, grid, totalDistance, reachCount) {
  // Standard BFS, but:
  // - Add distance to totalDistance[r][c] for each reached cell
  // - Increment reachCount[r][c] for each reached cell
}
```

---

## Interview Mapping

| Interview Concept | This Problem |
|-------------------|--------------|
| User locations | Building positions |
| Activity locations | Empty cells |
| `calculateEta(user, activity)` | BFS distance |
| "Total commute time" | Sum of distances |
| "Fairness" | (Not directly, but variance of distances) |

---

## Key Insights

1. **BFS from buildings, not cells**: More efficient since there are fewer buildings
2. **Track reachability**: Cells blocked by obstacles can't be solutions
3. **Sum distances incrementally**: Each BFS adds to the total
4. **Obstacles matter**: They can make some locations unreachable

---

## Handling Fairness (Interview Extension)

The interview also wanted "fairness" - no user travels too much more than others.

```typescript
// Beyond total distance, track individual distances
for (const building of buildings) {
  distances[building] = bfsFrom(building);
}

// For each candidate cell, check:
// 1. Total distance (sum)
// 2. Max deviation (fairness)
const deviation = Math.max(...distances) - Math.min(...distances);
if (deviation > FAIRNESS_THRESHOLD) {
  // Skip this location
}
```

---

## Complexity

| Aspect | Complexity |
|--------|------------|
| Time | O(B × M × N) where B = buildings |
| Space | O(M × N) |

---

## Common Pitfalls

- Forgetting to check if a cell can reach ALL buildings
- Running BFS from empty cells instead of buildings (less efficient)
- Not handling obstacles properly
- Integer overflow with large grids (sum distances carefully)

---

## Related Problems

- [[phe-redux/problems/296-best-meeting-point\|296. Best Meeting Point]] - Similar but 1D optimization
- 286. Walls and Gates - Simpler multi-source BFS
- 994. Rotting Oranges - Multi-source BFS intro

---

## Connection to Byteboard Interview

**Task 3** asked you to find a midpoint activity for a group of N users. This problem teaches:
- Running BFS from multiple sources
- Aggregating distances to find optimal location
- Handling reachability constraints

The only addition for the interview is the "fairness" constraint (max deviation between users).
