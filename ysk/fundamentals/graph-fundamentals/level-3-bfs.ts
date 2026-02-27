// =============================================================================
// Level 3: BFS — Exploring Layer by Layer
// =============================================================================
// Before running: npx ts-node level-3-bfs.ts
// Goal: use BFS for shortest-path problems on graphs and grids.

// -----------------------------------------------------------------------------
// Exercise 1
// Return a Map of { node → shortest distance from start }.
// Distance is measured in number of edges, not weights.
// Only include nodes reachable from start.
//
// Example:
//   graph = Map { 0→[1,2], 1→[3], 2→[3], 3→[] }
//   bfsDistances(graph, 0) → Map { 0→0, 1→1, 2→1, 3→2 }
//
// Note: both node 1 and node 2 are 1 edge away.
// Node 3 is 2 edges away (via either path — BFS finds the minimum).
// -----------------------------------------------------------------------------
function bfsDistances(
  graph: Map<number, number[]>,
  start: number,
): Map<number, number> {
  // Things we know:
  // - to get 'shortest' distances we can utilize BFS as we process graphs level by level
  // - since this is a graph, and NOT a DAG (directed acyclical graph) then we can't guarantee there aren't any cycles
  // - thus we have to keep track of the `visited` nodes as we process them

  // 1. we first build a queue with our starting position
  // - simple array, that we can FIFO as we start processing them
  const queue = [start];

  // 2. a visited set
  // - a set of 'nodes' that we've visited as we process through them
  const visited = new Set();
  visited.add(start);

  // 3. distances map
  // - a map of 'distances' based on each node that we've visited.
  // - each neighbor is exactly 1 edge further than the node we're currently processing
  // - as we move down further levels, we add `1` going through each level means we're crossing `one edge`
  const distances = new Map();
  distances.set(start, 0);

  // ----

  // 1. process all within queue
  while (queue.length > 0) {
    // 2. get node from queue
    const node = queue.shift()!;

    // 3. get all of the neighbors (adjacent nodes within the NEXT level of the current node, given the graph)
    const neighbors = graph.get(node);

    for (const neighbor of neighbors ?? []) {
      // 4. if we've processed this neighbor before, then don't process it again
      if (visited.has(neighbor)) continue;

      // 5. immediately add this to our visited set and push it to the back queue, as we should also process it
      // after this current neighbor
      visited.add(neighbor);
      queue.push(neighbor);

      // 6. get current distance from node.
      // - our current KNOWN distance from our node is whatever this number is, which we can then add `1` to account for this level
      const currentDistanceFromNode = distances.get(node);

      // 7. add to the distance
      distances.set(neighbor, currentDistanceFromNode + 1);
    }
  }

  return distances;
}

// Graph: 0 connects to 1 and 2, both connect to 3
const diamond = new Map([
  [0, [1, 2]],
  [1, [3]],
  [2, [3]],
  [3, []],
]);

const d = bfsDistances(diamond, 0);
test('bfsDistances: start is 0 hops away', d.get(0), 0);
test('bfsDistances: neighbors are 1 hop', d.get(1), 1);
test('bfsDistances: other neighbor 1 hop', d.get(2), 1);
test('bfsDistances: far node is 2 hops', d.get(3), 2);

// -----------------------------------------------------------------------------
// Exercise 2
// Return the minimum number of edges to get from start to end.
// Return -1 if no path exists.
//
// Example:
//   graph = Map { 0→[1], 1→[2], 2→[3], 3→[] }
//   shortestPath(graph, 0, 3) → 3
//   shortestPath(graph, 3, 0) → -1  (directed graph — can't go backwards)
//   shortestPath(graph, 0, 0) → 0   (already there)
// -----------------------------------------------------------------------------
function shortestPath(
  graph: Map<number, number[]>,
  start: number,
  end: number,
): number {
  const queue = [start];
  const visited = new Set();
  const distances = new Map();

  visited.add(start);
  distances.set(start, 0);

  while (queue.length > 0) {
    const node = queue.shift()!;

    for (const neighbor of graph.get(node) ?? []) {
      if (visited.has(neighbor)) continue;

      visited.add(neighbor);
      queue.push(neighbor);

      distances.set(neighbor, distances.get(node) + 1);
    }
  }

  return distances.get(end) ?? -1;
}

// Graph: 0→1→2→3 (linear chain)
const chain = new Map([
  [0, [1]],
  [1, [2]],
  [2, [3]],
  [3, []],
]);

test('shortestPath: 3 hops along chain', shortestPath(chain, 0, 3), 3);
test('shortestPath: 1 hop to neighbor', shortestPath(chain, 0, 1), 1);
test('shortestPath: start equals end', shortestPath(chain, 0, 0), 0);
test('shortestPath: no path (directed)', shortestPath(chain, 3, 0), -1);

// Disconnected — node 5 is unreachable from 0
const disconnected = new Map([
  [0, [1]],
  [1, []],
  [5, []],
]);
test('shortestPath: unreachable node', shortestPath(disconnected, 0, 5), -1);

// -----------------------------------------------------------------------------
// Exercise 3
// Given a grid of '1' (open) and '0' (wall), return the shortest number of
// steps to travel from (startRow, startCol) to (endRow, endCol).
// You can move up, down, left, right — but only through '1' cells.
// Return -1 if no path exists.
//
// Example:
//   grid = [
//     ['1','1','0'],
//     ['0','1','0'],
//     ['0','1','1'],
//   ]
//   shortestGridPath(grid, 0, 0, 2, 2) → 4
//   (0,0) → (0,1) → (1,1) → (2,1) → (2,2)
// -----------------------------------------------------------------------------
function shortestGridPath(
  grid: string[][],
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
): number {
  const queue = [[startRow, startCol]];
  const visited: Set<string> = new Set();
  const distance = new Map();

  const coordinates = `${startRow}_${startCol}`;
  visited.add(coordinates);
  distance.set(coordinates, 0);

  while (queue.length > 0) {
    const node = queue.shift()!;
    const [row, col] = node;

    const directions = [
      [row + 1, col],
      [row - 1, col],
      [row, col + 1],
      [row, col - 1],
    ];

    for (const [r, c] of directions) {
      const crd = `${r}_${c}`;

      if (visited.has(crd)) continue;
      if (r < 0 || c < 0 || c >= grid[0].length || r >= grid.length) continue;
      if (grid[r][c] === '0') continue;

      visited.add(crd);
      queue.push([r, c]);

      distance.set(crd, distance.get(`${row}_${col}`) + 1);
    }
  }

  return distance.get(`${endRow}_${endCol}`) ?? -1;
}

// Grid tests
const openGrid: string[][] = [
  ['1', '1', '0'],
  ['0', '1', '0'],
  ['0', '1', '1'],
];
test(
  'shortestGridPath: winding path',
  shortestGridPath(openGrid, 0, 0, 2, 2),
  4,
);
// test('shortestGridPath: same cell', shortestGridPath(openGrid, 1, 1, 1, 1), 0);

// const blockedGrid: string[][] = [
//   ['1', '0', '1'],
//   ['0', '0', '0'],
//   ['1', '0', '1'],
// ];
// test(
//   'shortestGridPath: no path (walls)',
//   shortestGridPath(blockedGrid, 0, 0, 2, 2),
//   -1,
// );
// test(
//   'shortestGridPath: start is a wall',
//   shortestGridPath(blockedGrid, 0, 1, 2, 2),
//   -1,
// );

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
