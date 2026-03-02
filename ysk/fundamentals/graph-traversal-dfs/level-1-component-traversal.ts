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
 1. I'm thinking about this in a grid way where it's rows and columns, right? At the end of the day, rows and columns that we can still DFS through regardless of what we do. It already gives us this adjacency list, which is what this grid list is. And we would still just keep a map of what we've seen, then iterate through each of the grid columns. Columns and rows. And then mark if we've seen them four. 
 2. What's really tripping me up is that normally we've gone through and done two nested loops where one would be rows and one would be columns. And then we would get either the row or the column for each. But in this scenario, this is a adjacency matrix, quote unquote. So therefore, we just have a square, which means it's put somewhere. It's like I and J equals one, mean city and city are directly connected. I and I are equals one, always. A city connects itself, ignore it. But none of that really tells me that this, we wouldn't want to go through row and column. So maybe I'll try that first and then see if that comes up with my idea and then try something else. 
  */

  const seen = Array.from({ length: isConnected.length }, () =>
    Array.from({ length: isConnected[0].length }).fill(false),
  );
  let provinces = 0;

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  function dfs(row: number, col: number) {
    // constraints
    // 1. within our bounds
    // 2. not marked as seen
    // 3. if not 0

    if (row < 0 || row >= isConnected.length) return;
    if (col < 0 || col >= isConnected[0].length) return;
    if (isConnected[row][col] === 0) return;
    if (seen[row][col]) return;

    seen[row][col] = true;

    for (const [r, c] of directions) {
      dfs(row + r, col + c);
    }
  }

  for (let rIdx = 0; rIdx < isConnected.length; rIdx++) {
    for (let cIdx = 0; cIdx < isConnected[0].length; cIdx++) {
      const current = isConnected[rIdx][cIdx];
      if (current === 1 && !seen[rIdx][cIdx]) {
        dfs(rIdx, cIdx);
        provinces++;
      }
    }
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
  throw new Error('TODO');
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
  throw new Error('TODO');
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
