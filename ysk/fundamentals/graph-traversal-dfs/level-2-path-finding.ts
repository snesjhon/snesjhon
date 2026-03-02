// =============================================================================
// Level 2: Path Finding with Backtracking
// =============================================================================
// Before running: npx ts-node level-2-path-finding.ts
// Goal: carry a path array through DFS, push on entry, pop on return.
//
// These graphs are DAGs (directed acyclic graphs) — no cycles, so you do not
// need a visited set. The path array itself tracks where you currently are.

// -----------------------------------------------------------------------------
// Exercise 1
// Return all paths from node 0 to the last node (graph.length - 1).
// graph[i] is the list of nodes you can go to from node i.
// Each path is an array of node indices from start to end.
//
// Example:
//   graph = [[1,2],[3],[3],[]]
//   → node 0 connects to 1 and 2; both 1 and 2 connect to 3 (the target)
//   → allPaths(graph) = [[0,1,3],[0,2,3]]
//
//   graph = [[1],[]]
//   → only one path: [0,1]
//   → allPaths(graph) = [[0,1]]
// -----------------------------------------------------------------------------
function allPaths(graph: number[][]): number[][] {
  throw new Error("TODO");
}

test('allPaths: two routes to target', allPaths([[1,2],[3],[3],[]]), [[0,1,3],[0,2,3]]);
test('allPaths: one direct path', allPaths([[1],[]]), [[0,1]]);
test('allPaths: single node (start = target)', allPaths([[]]), [[0]]);
test('allPaths: three branching paths', allPaths([[1,2,3],[4],[4],[4],[]]), [[0,1,4],[0,2,4],[0,3,4]]);

// -----------------------------------------------------------------------------
// Exercise 2
// Return true if any path from node 0 to the last node passes through
// the given `waypoint` node.
// A path "passes through" a waypoint if the waypoint appears somewhere
// between the start and end (inclusive of endpoints).
//
// Example:
//   graph = [[1,2],[3],[3],[]]
//   passesThroughWaypoint(graph, 1) → true   (path [0,1,3] goes through 1)
//   passesThroughWaypoint(graph, 2) → true   (path [0,2,3] goes through 2)
//   passesThroughWaypoint(graph, 0) → true   (all paths start at 0)
// -----------------------------------------------------------------------------
function passesThroughWaypoint(graph: number[][], waypoint: number): boolean {
  throw new Error("TODO");
}

const forked = [[1,2],[3],[3],[]];
test('passesThroughWaypoint: node 1 is on one path', passesThroughWaypoint(forked, 1), true);
test('passesThroughWaypoint: node 2 is on one path', passesThroughWaypoint(forked, 2), true);
test('passesThroughWaypoint: start node always counts', passesThroughWaypoint(forked, 0), true);
test('passesThroughWaypoint: no path visits node 5', passesThroughWaypoint(forked, 5), false);

// -----------------------------------------------------------------------------
// Exercise 3
// Return the length (number of edges) of the longest path from node 0
// to the last node. If only one path exists, return its edge count.
// A path of [0,1,3] has 2 edges.
//
// Example:
//   graph = [[1,2],[3],[4,3],[4],[]]
//   Paths:
//     [0,1,3,4] → 3 edges
//     [0,2,3,4] → 3 edges
//     [0,2,4]   → 2 edges
//   → longestPath(graph) = 3
//
//   graph = [[1],[]]
//   → only path [0,1] → 1 edge → return 1
// -----------------------------------------------------------------------------
function longestPath(graph: number[][]): number {
  throw new Error("TODO");
}

test('longestPath: multiple paths, longest is 3', longestPath([[1,2],[3],[4,3],[4],[]]), 3);
test('longestPath: single step', longestPath([[1],[]]), 1);
test('longestPath: two steps in a chain', longestPath([[1],[2],[]]), 2);
test('longestPath: start equals target', longestPath([[]]), 0);

// =============================================================================
// Tests — all should print PASS
// =============================================================================

function test(desc: string, actual: unknown, expected: unknown): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
