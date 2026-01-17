# 743. Network Delay Time

## Problem Link
[LeetCode 743](https://leetcode.com/problems/network-delay-time/)

## Difficulty
Medium

## Interview Relevance
**Task 2 Core Algorithm**: This problem IS the `shortestPath` function from `metroGraph.ts`. The interview literally used Dijkstra's algorithm for computing ETAs between metro stations.

---

## Problem Statement

You have a network of `n` nodes. Given `times`, a list of travel times as directed edges `[source, target, time]`, and a starting node `k`, return the minimum time for all nodes to receive a signal. Return -1 if impossible.

```
Input: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2
Output: 2
```

---

## Prerequisites

| Concept | Resource | Status |
|---------|----------|--------|
| Graph Representation | [[dsa/02-graph-representation\|Graph Representation]] | [ ] |
| BFS | [[dsa/05-graph-traversal-bfs\|Graph BFS]] | [ ] |
| Heaps/Priority Queues | [[phe-redux/01-weekly-plan\|Week 3]] | [ ] |

---

## Core Concepts

### 1. Why BFS Doesn't Work
BFS finds shortest path in **unweighted** graphs (fewest edges).
For **weighted** graphs, fewer edges ≠ shorter distance.

```
A --1--> B --1--> C  (total: 2)
A --------5-------> C  (total: 5)

BFS would say A→C is "shorter" (1 edge vs 2 edges)
But A→B→C is actually faster (2 vs 5)
```

### 2. Dijkstra's Algorithm
"Always process the closest unvisited node first."

Key insight: If we always pick the node with smallest known distance, we're guaranteed that distance is optimal (can't find a shorter path later).

### 3. Priority Queue Role
Instead of a regular queue (FIFO), use a priority queue that always gives us the node with minimum distance.

---

## Algorithm: Dijkstra's

```typescript
function networkDelayTime(times: number[][], n: number, k: number): number {
  // Step 1: Build adjacency list
  // graph[node] = [[neighbor, time], ...]

  // Step 2: Initialize distances
  // distances[node] = Infinity (except start = 0)

  // Step 3: Priority queue with (distance, node)
  // Start with (0, k)

  // Step 4: Process nodes
  // While queue not empty:
  //   Pop node with minimum distance
  //   If already visited with better distance, skip
  //   For each neighbor:
  //     If new distance < known distance, update and push

  // Step 5: Return max distance (or -1 if any unreachable)
}
```

---

## Interview Code Comparison

The interview's `metroGraph.ts` used the same algorithm:

```typescript
// FROM THE INTERVIEW
shortestPath(startStation: string, endStation: string): [number, string[] | null] {
  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string | null } = {};

  // Initialize all distances to Infinity
  for (const station in this.graph) {
    distances[station] = Infinity;
    previous[station] = null;
  }
  distances[startStation] = 0;

  const priorityQueue: Array<[number, string]> = [];
  priorityQueue.push([0, startStation]);

  while (priorityQueue.length > 0) {
    // Sort to simulate priority queue (inefficient but works)
    priorityQueue.sort((a, b) => a[0] - b[0]);
    const [currentDistance, currentStation] = priorityQueue.shift()!;

    // Early termination if we reached target
    if (currentStation === endStation) {
      return [distances[endStation], reconstructPath(previous)];
    }

    // Relax neighbors
    for (const neighbor in this.graph[currentStation]) {
      const newDistance = currentDistance + this.graph[currentStation][neighbor];
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = currentStation;
        priorityQueue.push([newDistance, neighbor]);
      }
    }
  }

  return [Infinity, null];
}
```

---

## Key Insights

1. **Priority queue is essential**: Without it, you might process nodes in wrong order
2. **Relaxation**: Update distance if you find a shorter path
3. **Early termination**: Can stop when target is dequeued (not just seen)
4. **Non-negative weights required**: Dijkstra fails with negative edges

---

## Optimization for Interview

The interview asked to minimize `calculateEta` calls. Strategies:

1. **Memoization**: Cache results of `calculateEta(A, B)`
2. **Pre-filter**: Use cheap heuristics (straight-line distance) before expensive ETA
3. **Early termination**: Stop once you have "good enough" suggestions
4. **Batch processing**: If API supports it, batch multiple queries

---

## Complexity

| Aspect | Complexity |
|--------|------------|
| Time | O((V + E) log V) with proper heap |
| Space | O(V + E) |

The interview's implementation used O(E log E) due to array sorting instead of a proper heap.

---

## Common Pitfalls

- Using BFS instead of Dijkstra for weighted graphs
- Not handling disconnected nodes (return -1)
- Processing a node multiple times with worse distances
- Forgetting that this requires non-negative weights

---

## Related Problems

- 787. Cheapest Flights Within K Stops (Dijkstra variant)
- 1334. Find the City With the Smallest Number of Neighbors
- 1514. Path with Maximum Probability

---

## Connection to Byteboard Interview

This problem is **exactly** what `metroGraph.shortestPath` does. Understanding Dijkstra means understanding the core algorithm of the interview. The optimization challenge (minimize API calls) maps to efficiently using this algorithm.
