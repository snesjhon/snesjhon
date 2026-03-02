// @leet start
/**
 * Definition for _Node.
 * class _Node {
 *     val: number
 *     neighbors: _Node[]
 *
 *     constructor(val?: number, neighbors?: _Node[]) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.neighbors = (neighbors===undefined ? [] : neighbors)
 *     }
 * }
 *
 */

function cloneGraph(node: _Node | null): _Node | null {
  // This is DFS because we have to dive all the way through each of the neighbors
  // proclaiming which neighbors we've visited, and then 'cloning' the ones we haven't reached
  //
  // 1. If node is null, return null
  //
  // 2. call dfs fn with 'original' node, which will return back our 'cloned' node
  //
  // 3. we guard against 'revisiting' each node with a 'clonedMap' AND keeps our 'cloned' reference so we're able to return if we
  //
  // 4. dfs fn: which creates a 'clone' _Node, which we instantiate with 'original' value, we push to 'clonedMap' so we don't revisit again
  // 5. dfs fn: we iterate through each neighbor and 'push' these neighbors to 'clone'

  // O(n): at most we're visiting each node once

  if (!node) return null;

  const cloneMap = new Map<_Node, _Node>();

  function dfs(original: _Node): _Node {
    // Q: what are we returning here
    if (cloneMap.has(original)) return cloneMap.get(original)!;

    const clone = new _Node(original.val);
    cloneMap.set(original, clone);

    for (const neighbor of original.neighbors) {
      const neighborNodes = dfs(neighbor);
      clone.neighbors.push(neighborNodes);
    }

    return clone;
  }

  return dfs(node);
}
// @leet end

class _Node {
  val: number;
  neighbors: _Node[];
  constructor(val?: number, neighbors?: _Node[]) {
    this.val = val === undefined ? 0 : val;
    this.neighbors = neighbors === undefined ? [] : neighbors;
  }
}

// Build graph from adjacency list (1-indexed vals)
function buildGraph(adjList: number[][]): _Node | null {
  if (adjList.length === 0) return null;
  const nodes = adjList.map((_, i) => new _Node(i + 1));
  for (let i = 0; i < adjList.length; i++) {
    nodes[i].neighbors = adjList[i].map((n) => nodes[n - 1]);
  }
  return nodes[0];
}

// Serialize graph back to adjacency list for comparison
function toAdjList(node: _Node | null): number[][] {
  if (!node) return [];
  const result: number[][] = [];
  const visited = new Map<number, _Node>();
  const queue = [node];
  visited.set(node.val, node);
  while (queue.length) {
    const cur = queue.shift()!;
    result[cur.val - 1] = cur.neighbors.map((n) => n.val);
    for (const neighbor of cur.neighbors) {
      if (!visited.has(neighbor.val)) {
        visited.set(neighbor.val, neighbor);
        queue.push(neighbor);
      }
    }
  }
  return result;
}

// Verify clone has no shared references with original
function isDeepClone(original: _Node | null, clone: _Node | null): boolean {
  if (!original && !clone) return true;
  if (!original || !clone) return false;
  const visitedOrig = new Set<_Node>();
  const visitedClone = new Set<_Node>();
  const queue: [_Node, _Node][] = [[original, clone]];
  while (queue.length) {
    const [o, c] = queue.shift()!;
    if (o === c) return false; // same reference
    if (o.val !== c.val) return false;
    if (o.neighbors.length !== c.neighbors.length) return false;
    visitedOrig.add(o);
    visitedClone.add(c);
    for (let i = 0; i < o.neighbors.length; i++) {
      const on = o.neighbors[i];
      const cn = c.neighbors[i];
      if (!visitedOrig.has(on)) queue.push([on, cn]);
    }
  }
  return true;
}

function runTest(label: string, adjList: number[][], expected: number[][]) {
  const graph = buildGraph(adjList);
  const clone = cloneGraph(graph);
  const got = toAdjList(clone);
  const structMatch = JSON.stringify(got) === JSON.stringify(expected);
  const deepCloned = isDeepClone(graph, clone);
  const pass = structMatch && deepCloned;
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`);
  if (!pass) {
    console.log('  expected:', JSON.stringify(expected));
    console.log('  got:     ', JSON.stringify(got));
    console.log('  deep clone:', deepCloned);
  }
}

// Test 1: standard 4-node cycle [[2,4],[1,3],[2,4],[1,3]]
runTest(
  '4-node cycle',
  [
    [2, 4],
    [1, 3],
    [2, 4],
    [1, 3],
  ],
  [
    [2, 4],
    [1, 3],
    [2, 4],
    [1, 3],
  ],
);

// Test 2: single node no neighbors [[]]
runTest('single node no neighbors', [[]], [[]]);

// Test 3: null input
const nullResult = cloneGraph(null);
console.log(`${nullResult === null ? 'PASS' : 'FAIL'} null input`);

// Test 4: two nodes pointing to each other [[2],[1]]
runTest('two-node bidirectional', [[2], [1]], [[2], [1]]);

// Test 5: single node self-loop [[1]]
runTest('single node self-loop', [[1]], [[1]]);
