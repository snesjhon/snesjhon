// =============================================================================
// Level 1: Component Traversal
// =============================================================================
// Before running: npx ts-node level-1-component-traversal.ts
// Goal: use the outer loop + DFS pattern to count and explore connected groups.

// -----------------------------------------------------------------------------
// Exercise 1
// Count the number of provinces.
// A province is a group of directly or indirectly connected cities.
// isConnected[i][j] === 1 means city i and city j are directly connected.
// isConnected[i][i] === 1 always (a city connects to itself — ignore it).
//
// Example:
//   isConnected = [[1,1,0],[1,1,0],[0,0,1]]
//   → cities 0 and 1 are connected; city 2 is isolated → 2 provinces
//
//   isConnected = [[1,0,0],[0,1,0],[0,0,1]]
//   → no cities connected to each other → 3 provinces
// -----------------------------------------------------------------------------
function countProvinces(isConnected: number[][]): number {
  /**
   1. So we know that for each row counts as a city. And within each of those rows, there is an identifier that tells us that certain cities are connected. The only way to know which cities are connected is to iterate through each of the rows. And then from those rows, we iterate from, we DFS through each of those columns to see which ones are connected.Because we know that first iterate through the rows within the outer loop. And then DFS through the inner loop, which gives us J. That allows us to iterate through both the rows and columns. 
   2. Knowing that we have a rows and columns adjacency list, adjacency matrix, that means that we can assume that both the rows and columns are of the same length. So we don't have to do row and column connected, but I guess we could also do that as well. 
   */

  const cities = isConnected.length;
  const visited = new Set();
  let provinces = 0;

  function dfs(city: number) {
    visited.add(city);

    for (let j = 0; j < cities; j++) {
      //constraints
      if (isConnected[city][j] === 1 && !visited.has(j)) {
        dfs(j);
      }
    }
  }

  for (let city = 0; city < cities; city++) {
    // constraints
    if (visited.has(city)) continue;

    dfs(city);
    provinces++;
  }

  return provinces;
}

test(
  'countProvinces: two groups',
  countProvinces([
    [1, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
  ]),
  2,
);
test(
  'countProvinces: all separate',
  countProvinces([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]),
  3,
);
test(
  'countProvinces: all connected',
  countProvinces([
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ]),
  1,
);
test('countProvinces: single city', countProvinces([[1]]), 1);

// -----------------------------------------------------------------------------
// Exercise 2
// Return true if city `a` can reach city `b` through direct or indirect connections.
// Use the same isConnected matrix — do not use countProvinces.
//
// Example:
//   isConnected = [[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,0,1,1]]
//   canReach(isConnected, 0, 1) → true   (directly connected)
//   canReach(isConnected, 0, 3) → false  (different province)
//   canReach(isConnected, 2, 3) → true   (directly connected)
// -----------------------------------------------------------------------------
function canReach(isConnected: number[][], a: number, b: number): boolean {
  const cities = isConnected.length;
  const visited = new Set();

  function dfs(city: number) {
    visited.add(city);

    for (let j = 0; j < cities; j++) {
      if (isConnected[city][j] === 1 && !visited.has(j)) {
        dfs(j);
      }
    }
  }
  dfs(a);

  return visited.has(b);
}

const twoGroups = [
  [1, 1, 0, 0],
  [1, 1, 0, 0],
  [0, 0, 1, 1],
  [0, 0, 1, 1],
];
test('canReach: direct connection', canReach(twoGroups, 0, 1), true);
test('canReach: across groups', canReach(twoGroups, 0, 3), false);
test('canReach: same node', canReach(twoGroups, 2, 2), true);
test('canReach: other group direct', canReach(twoGroups, 2, 3), true);

// -----------------------------------------------------------------------------
// Exercise 3
// Return the size (number of cities) of the largest province.
// Size = how many cities belong to the same connected group.
//
// Example:
//   isConnected = [[1,1,1,0],[1,1,1,0],[1,1,1,0],[0,0,0,1]]
//   → cities 0,1,2 form one province of size 3; city 3 is alone (size 1)
//   → return 3
//
//   isConnected = [[1,0],[0,1]]
//   → two provinces each of size 1 → return 1
// -----------------------------------------------------------------------------
function largestProvinceSize(isConnected: number[][]): number {
  const seen = new Set();
  const cities = isConnected.length;
  let size = 1;

  function dfs(city: number) {
    seen.add(city);

    for (let j = 0; j < cities; j++) {
      if (isConnected[city][j] === 1 && !seen.has(j)) {
        size++;
        dfs(j);
      }
    }
  }

  for (let city = 0; city < cities; city++) {
    if (seen.has(city)) continue;

    dfs(city);
  }
  return size;
}

const bigGroup = [
  [1, 1, 1, 0],
  [1, 1, 1, 0],
  [1, 1, 1, 0],
  [0, 0, 0, 1],
];
test('largestProvinceSize: group of 3', largestProvinceSize(bigGroup), 3);
test(
  'largestProvinceSize: all equal size 1',
  largestProvinceSize([
    [1, 0],
    [0, 1],
  ]),
  1,
);
test(
  'largestProvinceSize: all connected',
  largestProvinceSize([
    [1, 1],
    [1, 1],
  ]),
  2,
);
test('largestProvinceSize: single city', largestProvinceSize([[1]]), 1);

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
