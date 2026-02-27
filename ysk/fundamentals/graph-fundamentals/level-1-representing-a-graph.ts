// =============================================================================
// Level 1: Representing a Graph
// =============================================================================
// Before running: npx ts-node level-1-representing-a-graph.ts
// Goal: build an adjacency list and answer basic questions about the graph.

// -----------------------------------------------------------------------------
// Exercise 1
// Build a DIRECTED adjacency list from a list of edges.
// n = number of nodes (labeled 0 to n-1)
// edges = [[from, to], ...] — each edge goes one way only
//
// Example:
//   buildDirected(4, [[0,1],[1,2],[0,3]])
//   → Map { 0→[1,3], 1→[2], 2→[], 3→[] }
// -----------------------------------------------------------------------------
function buildDirected(n: number, edges: number[][]): Map<number, number[]> {
  const map = new Map();

  for (let i = 0; i < n; i++) {
    map.set(i, []);
  }

  for (const [from, to] of edges) {
    map.get(from).push(to);
  }

  return map;
  // throw new Error("TODO");
}

const directed = buildDirected(4, [
  [0, 1],
  [1, 2],
  [0, 3],
]);

test('directed: all 4 nodes exist', directed.size, 4);
test('directed: node 0 neighbors', directed.get(0), [1, 3]);
test('directed: node 1 neighbors', directed.get(1), [2]);
test('directed: node 2 has no neighbors', directed.get(2), []);
test('directed: node 3 has no neighbors', directed.get(3), []);

// -----------------------------------------------------------------------------
// Exercise 2
// Build an UNDIRECTED adjacency list from the same input.
// Every edge [a, b] means a can reach b AND b can reach a.
//
// Example:
//   buildUndirected(4, [[0,1],[1,2],[0,3]])
//   → Map { 0→[1,3], 1→[0,2], 2→[1], 3→[0] }
// -----------------------------------------------------------------------------

function buildUndirected(n: number, edges: number[][]): Map<number, number[]> {
  const map = new Map();
  for (let i = 0; i < n; i++) {
    map.set(i, []);
  }

  for (const [from, to] of edges) {
    map.get(from).push(to);
    map.get(to).push(from);
  }
  return map;
}

const undirected = buildUndirected(4, [
  [0, 1],
  [1, 2],
  [0, 3],
]);

// test('undirected: all 4 nodes exist', undirected.size, 4);
// test('undirected: node 0 neighbors', undirected.get(0), [1, 3]);
// test('undirected: node 1 neighbors', undirected.get(1), [0, 2]);
// test('undirected: node 2 neighbors', undirected.get(2), [1]);
// test('undirected: node 3 neighbors', undirected.get(3), [0]);

// -----------------------------------------------------------------------------
// Exercise 3
// Return true if there is a direct edge from → to in the graph.
// A direct edge means `to` appears in `from`'s neighbor list.
//
// Example:
//   hasEdge(directed, 0, 1) → true
//   hasEdge(directed, 1, 0) → false  (directed — one way only)
//   hasEdge(directed, 0, 2) → false  (no direct edge, only indirect)
// -----------------------------------------------------------------------------
function hasEdge(
  graph: Map<number, number[]>,
  from: number,
  to: number,
): boolean {
  const fromArr = graph.get(from);
  if (!fromArr) return false;

  return fromArr.includes(to);
}

test('hasEdge: 0→1 exists', hasEdge(directed, 0, 1), true);
test('hasEdge: 1→0 does not exist', hasEdge(directed, 1, 0), false);
test('hasEdge: 0→2 does not exist', hasEdge(directed, 0, 2), false);
test('hasEdge: 2→anything is false', hasEdge(directed, 2, 0), false);

// Edge case: isolated node — no edges touch node 5
// const sparse = buildDirected(6, [[0, 1]]);
// test('isolated node still exists', sparse.has(5), true);

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
