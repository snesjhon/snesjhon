// =============================================================================
// Level 3 (Grid): Grid DFS
// =============================================================================
// Before running: npx ts-node level-grid-dfs.ts
// Goal: treat a 2D grid as an implicit graph and traverse it with DFS.
//
// The shift from the previous levels: there is no adjacency list to build.
// Each cell IS the node. Its neighbors are the cells directly above, below,
// left, and right — as long as they're in bounds and not a wall.
// The visited check becomes a 2D boolean array instead of a Set.

// -----------------------------------------------------------------------------
// Exercise 1
// Given a grid and a starting cell, mark every connected '1' cell as visited.
// Two cells are connected if they are directly adjacent (up/down/left/right)
// and both contain '1'.
// Mutate the visited array in place — do not return anything.
//
// Example:
//   grid = [
//     ['1','1','0'],
//     ['0','1','0'],
//     ['0','0','0'],
//   ]
//   visited starts as all false
//   markRegion(grid, 0, 0, visited)
//   → visited[0][0], visited[0][1], visited[1][1] are now true
//   → visited[0][2] and all '0' cells remain false
// -----------------------------------------------------------------------------
function markRegion(
  grid: string[][],
  row: number,
  col: number,
  visited: boolean[][],
): void {
  // marking a region in DFS is recursing through the depth of each 'neighbor'
  // in a grid this would be all of the 'directions'
  //

  // constraints
  // - it's within the bounds
  // - it's `1` since `0` are 'walls'
  // - set of 'direction' `u/d/l/r`

  // dfs -> node = grid[row][col] -> directions = [[r,c],...] -> if constraints met then recurse
  //     -> mark as `true` if `1` since theoretically we are only interested in '1'
  //

  // const seen = new Set();
  function dfs(rIdx: number, cIdx: number) {
    const node = grid[rIdx][cIdx];
    // const nodeString = `${rIdx}_${cIdx}`;
    if (visited[rIdx][cIdx]) return;

    // seen.add(nodeString);
    if (node === '1') {
      visited[rIdx][cIdx] = true;
    }

    const directions = [
      [rIdx + 1, cIdx],
      [rIdx - 1, cIdx],
      [rIdx, cIdx + 1],
      [rIdx, cIdx - 1],
    ];

    for (const [r, c] of directions) {
      if (r < 0 || r >= grid.length) continue;
      if (c < 0 || c >= grid[0].length) continue;
      const neighbor = grid[r][c];
      if (neighbor === '1') {
        dfs(r, c);
      }
    }
  }

  dfs(row, col);
}

// ---- markRegion ----

// const g1: string[][] = [
//   ['1', '1', '0'],
//   ['0', '1', '0'],
//   ['0', '0', '0'],
// ];
// const v1 = Array.from({ length: 3 }, () => new Array(3).fill(false));
// markRegion(g1, 0, 0, v1);
//
// test('markRegion: top-left cell marked', v1[0][0], true);
// test('markRegion: connected right marked', v1[0][1], true);
// test('markRegion: connected below marked', v1[1][1], true);
// test('markRegion: wall cell not marked', v1[0][2], false);
// test('markRegion: water cell not marked', v1[2][0], false);
//
// // Starting on a '0' cell — nothing should be marked
// const v1b = Array.from({ length: 3 }, () => new Array(3).fill(false));
// markRegion(g1, 0, 2, v1b);
// test('markRegion: starting on wall marks nothing', v1b[0][2], false);

// -----------------------------------------------------------------------------
// Exercise 2
// Count the number of islands in the grid.
// An island is a group of '1' cells all connected horizontally or vertically.
// '0' cells are water — they don't connect anything.
//
// Example:
//   grid = [
//     ['1','1','0','0'],
//     ['1','0','0','1'],
//     ['0','0','0','1'],
//   ]
//   → 2 islands: top-left cluster and right-side cluster
//
// Hint: use markRegion from Exercise 1 and an outer loop — same structure
// as countComponents from level-2-dfs.ts.
// -----------------------------------------------------------------------------

function countIslands(grid: string[][]): number {
  // constraints
  // - out of bounds, we have to stay within grid
  // - only flag land aka `1` and don't 'flag' water aka `0`
  // - don't re-flag a visited 'cell' twice...aka keep a 'seen' array (or sink the island aka convert to 0)
  //
  // algorithm
  // - outerloop: two loops to get our (row, col) and we only recurse when we've hit land and we haven't 'seen'
  //   - if we see land `1` then mark as 'seen' and recurse through its neighbors (u,d,l,r)
  //   - the moment we see a 'land' we can increment our `islandCount` because we theoretically are marking only 'NEW' island per dfs (outer loop) call
  //
  // - recursive dfs: marks our neighbors given our (row,col), and return based on our constraints
  //   - if its neighbors are land, mark them as 'seen' and continue;

  const marked = Array.from({ length: grid.length }, () =>
    Array.from({ length: grid[0].length }).fill(false),
  );

  let islands = 0;

  function dfs(rIdx: number, cIdx: number) {
    if (rIdx < 0 || rIdx >= grid.length) return;
    if (cIdx < 0 || cIdx >= grid[0].length) return;
    if (grid[rIdx][cIdx] === '0') return;
    if (marked[rIdx][cIdx]) return;

    marked[rIdx][cIdx] = true;

    const directions = [
      [rIdx + 1, cIdx],
      [rIdx - 1, cIdx],
      [rIdx, cIdx + 1],
      [rIdx, cIdx - 1],
    ];

    for (const [r, c] of directions) {
      dfs(r, c);
    }
  }

  // we're going to have to go through the grid in two loops
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const current = grid[row][col];
      if (current === '1' && !marked[row][col]) {
        islands++;
        dfs(row, col);
      }
    }
  }

  return islands;
}

// ---- countIslands ----

test(
  'countIslands: two separate islands',
  countIslands([
    ['1', '1', '0', '0'],
    ['1', '0', '0', '1'],
    ['0', '0', '0', '1'],
  ]),
  2,
);

test(
  'countIslands: one big island',
  countIslands([
    ['1', '1'],
    ['1', '1'],
  ]),
  1,
);
//
test(
  'countIslands: all water',
  countIslands([
    ['0', '0'],
    ['0', '0'],
  ]),
  0,
);
//
test(
  'countIslands: all isolated cells',
  countIslands([
    ['1', '0', '1'],
    ['0', '1', '0'],
    ['1', '0', '1'],
  ]),
  5,
);

test('countIslands: single cell', countIslands([['1']]), 1);
test('countIslands: single water cell', countIslands([['0']]), 0);

// -----------------------------------------------------------------------------
// Exercise 3
// Return the area (cell count) of the largest island.
// If the grid has no land at all, return 0.
//
// Example:
//   grid = [
//     ['0','1','0'],
//     ['1','1','0'],
//     ['0','1','1'],
//   ]
//   → The connected '1' cells form one island of area 5 → return 5
//
// Hint: modify markRegion (or write a new helper) to return the area
// of the region it marks instead of void.
// -----------------------------------------------------------------------------

function maxIslandArea(grid: string[][]): number {}
//
//
// // ---- maxIslandArea ----
//
test(
  'maxIslandArea: one island of 5',
  maxIslandArea([
    ['0', '1', '0'],
    ['1', '1', '0'],
    ['0', '1', '1'],
  ]),
  5,
);

test(
  'maxIslandArea: pick the larger island',
  maxIslandArea([
    ['1', '0', '1', '1'],
    ['1', '0', '1', '0'],
    ['0', '0', '0', '0'],
  ]),
  3,
);

test(
  'maxIslandArea: no land returns 0',
  maxIslandArea([
    ['0', '0'],
    ['0', '0'],
  ]),
  0,
);

test('maxIslandArea: single land cell', maxIslandArea([['1']]), 1);

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
