// =============================================================================
// Level 3: Cycle Detection in Directed Graphs
// =============================================================================
// Before running: npx ts-node level-3-cycle-detection.ts
// Goal: use the 3-color algorithm (white/gray/black) to detect cycles
//       in directed graphs and build topological orderings.
//
// Unlike Level 1 and 2, these graphs are directed and MAY have cycles.
// A simple visited set is not enough — you need to know if a node is
// "currently on the DFS stack" (gray) vs "already fully explored" (black).

// -----------------------------------------------------------------------------
// Exercise 1
// Return true if the directed graph has a cycle, false if it is acyclic.
// n = number of nodes (labeled 0 to n-1)
// edges = [[from, to], ...] — directed edges
//
// Example:
//   hasCycle(3, [[0,1],[1,2],[2,0]]) → true   (0→1→2→0 is a cycle)
//   hasCycle(3, [[0,1],[1,2]])       → false  (linear chain, no cycle)
//   hasCycle(4, [[0,1],[2,3]])       → false  (two separate chains)
// -----------------------------------------------------------------------------
function hasCycle(n: number, edges: number[][]): boolean {
  throw new Error("TODO");
}

test('hasCycle: triangle cycle', hasCycle(3, [[0,1],[1,2],[2,0]]), true);
test('hasCycle: linear chain', hasCycle(3, [[0,1],[1,2]]), false);
test('hasCycle: self-loop', hasCycle(2, [[0,0]]), true);
test('hasCycle: two separate chains', hasCycle(4, [[0,1],[2,3]]), false);
test('hasCycle: disconnected with one cycle', hasCycle(4, [[0,1],[1,0],[2,3]]), true);
test('hasCycle: no edges', hasCycle(3, []), false);

// -----------------------------------------------------------------------------
// Exercise 2
// You have numCourses courses labeled 0 to numCourses-1.
// prerequisites[i] = [a, b] means you must take course b before course a.
// Return true if it is possible to finish all courses, false if not.
// (False means there is a circular prerequisite — a cycle.)
//
// Example:
//   canFinish(2, [[1,0]])       → true   (take 0 first, then 1)
//   canFinish(2, [[1,0],[0,1]]) → false  (0 requires 1 and 1 requires 0)
//   canFinish(3, [[1,0],[2,1]]) → true   (take 0 → 1 → 2)
// -----------------------------------------------------------------------------
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  throw new Error("TODO");
}

test('canFinish: simple prerequisite', canFinish(2, [[1,0]]), true);
test('canFinish: circular dependency', canFinish(2, [[1,0],[0,1]]), false);
test('canFinish: three-course chain', canFinish(3, [[1,0],[2,1]]), true);
test('canFinish: no prerequisites', canFinish(4, []), true);
test('canFinish: longer cycle', canFinish(4, [[1,0],[2,1],[3,2],[0,3]]), false);

// -----------------------------------------------------------------------------
// Exercise 3
// Return a valid order in which to take all courses, or an empty array
// if no valid order exists (i.e., there is a cycle).
// prerequisites[i] = [a, b] means b must come before a.
//
// Any valid topological order is acceptable — there may be more than one.
// Use DFS post-order: add a node to the result AFTER all its dependents are done.
//
// Example:
//   findOrder(2, [[1,0]])       → [0,1]  (take 0 first, then 1)
//   findOrder(4, [[1,0],[2,0],[3,1],[3,2]]) → valid order e.g. [0,1,2,3] or [0,2,1,3]
//   findOrder(2, [[1,0],[0,1]]) → []     (cycle — no valid order)
// -----------------------------------------------------------------------------
function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  throw new Error("TODO");
}

// For findOrder, we test structural properties since multiple valid answers exist.
const order2 = findOrder(2, [[1,0]]);
test('findOrder: 0 comes before 1', order2.indexOf(0) < order2.indexOf(1), true);
test('findOrder: returns both courses', order2.length, 2);

const order4 = findOrder(4, [[1,0],[2,0],[3,1],[3,2]]);
test('findOrder: 0 comes before 1 and 2', order4.indexOf(0) < order4.indexOf(1) && order4.indexOf(0) < order4.indexOf(2), true);
test('findOrder: 3 comes last', order4.indexOf(3), 3);
test('findOrder: returns all 4 courses', order4.length, 4);

const cycle = findOrder(2, [[1,0],[0,1]]);
test('findOrder: cycle returns empty', cycle, []);

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
