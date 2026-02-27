// =============================================================================
// Level 2: DFS — Following One Path Until It Ends
// =============================================================================
// Before running: npx ts-node level-2-dfs.ts
// Goal: traverse graphs with DFS and solve problems that only need reachability.

// -----------------------------------------------------------------------------
// Exercise 1
// Return every node reachable from `start`, in the order they are first visited.
// Only nodes reachable from `start` — no outer loop needed here.
//
// Example:
//   graph = Map { 0→[1,3], 1→[2], 2→[], 3→[] }
//   dfsOrder(graph, 0) → [0, 1, 2, 3]
//
// Note: the exact order depends on neighbor order in the adjacency list.
// The tests below assume you visit neighbors left-to-right.
// -----------------------------------------------------------------------------
function dfsOrder(graph: Map<number, number[]>, start: number): number[] {
  const visited: Set<number> = new Set();

  function dfs(node: number) {
    if (visited.has(node)) return;
    visited.add(node);

    for (const neighbor of graph.get(node) ?? []) {
      dfs(neighbor);
    }
  }

  dfs(start);

  return [...visited];
}

// Graph: 0→1→2, 0→3  (all reachable from 0)
const connected = new Map([
  [0, [1, 3]],
  [1, [2]],
  [2, []],
  [3, []],
]);

test('dfsOrder: visits all nodes from 0', dfsOrder(connected, 0), [0, 1, 2, 3]);
test('dfsOrder: starting from a leaf', dfsOrder(connected, 2), [2]);
test('dfsOrder: 3 has no neighbors', dfsOrder(connected, 3), [3]);

// -----------------------------------------------------------------------------
// Exercise 2
// Return true if there is any path (direct or indirect) from start to target.
// The path can go through any number of intermediate nodes.
//
// Example:
//   graph = Map { 0→[1], 1→[2], 2→[], 3→[4], 4→[] }
//   hasPath(graph, 0, 2) → true   (0 → 1 → 2)
//   hasPath(graph, 0, 3) → false  (no edge connects 0's group to 3's group)
//   hasPath(graph, 0, 0) → true   (start = target)
// -----------------------------------------------------------------------------
function hasPath(
  graph: Map<number, number[]>,
  start: number,
  target: number,
): boolean {
  const visited: Set<number> = new Set();

  function dfs(node: number) {
    if (node === target) return true;
    if (visited.has(node)) return false;
    visited.add(node);

    for (const edge of graph.get(node) ?? []) {
      if (dfs(edge)) return true;
    }
    return false;
  }

  return dfs(start);
}

// Graph: two separate groups — 0→1, and 3→4 (no connection between them)
const split = new Map([
  [0, [1]],
  [1, []],
  [2, []],
  [3, [4]],
  [4, []],
]);

test('hasPath: direct neighbor', hasPath(split, 0, 1), true);
test('hasPath: no route across groups', hasPath(split, 0, 3), false);
test('hasPath: start equals target', hasPath(split, 0, 0), true);
test('hasPath: isolated node to itself', hasPath(split, 2, 2), true);
test('hasPath: isolated node to other', hasPath(split, 2, 0), false);

// -----------------------------------------------------------------------------
// Exercise 3
// Count the number of disconnected groups in the graph.
// Every node belongs to exactly one group.
//
// Example:
//   n=5, edges=[[0,1],[1,2]]
//   → nodes 0,1,2 are one group; nodes 3,4 are isolated → 3 components
//
// Hint: you need the outer loop from visitAllNodes here.
// -----------------------------------------------------------------------------
function countComponents(n: number, edges: number[][]): number {
  const adj: Map<number, number[]> = new Map();
  for (let i = 0; i < n; i++) {
    adj.set(i, []);
  }

  for (const [from, to] of edges) {
    adj.get(from)?.push(to);
    adj.get(to)?.push(from);
  }

  const visited = new Set();
  let group = 0;

  function dfs(node: number) {
    if (visited.has(node)) return;
    visited.add(node);

    for (const neighbor of adj.get(node) ?? []) {
      dfs(neighbor);
    }
  }

  for (let i = 0; i < n; i++) {
    if (visited.has(i)) continue;

    group++;
    dfs(i);
  }

  return group;
}

// Graph: 0-1-2 connected, 3-4 connected, 5 isolated
test(
  'countComponents: five groups',
  countComponents(5, [
    [0, 1],
    [1, 2],
  ]),
  3,
);
test(
  'countComponents: three groups',
  countComponents(6, [
    [0, 1],
    [1, 2],
    [3, 4],
  ]),
  3,
);
test(
  'countComponents: fully connected',
  countComponents(4, [
    [0, 1],
    [1, 2],
    [2, 3],
  ]),
  1,
);
test('countComponents: all isolated', countComponents(4, []), 4);
test('countComponents: single node', countComponents(1, []), 1);

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
