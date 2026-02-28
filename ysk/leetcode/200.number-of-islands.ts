// @leet start
function numIslands(grid: string[][]): number {
  function dfs(row: number, col: number) {
    // constraints
    if (row < 0 || row >= grid.length) return;
    if (col < 0 || col >= grid[0].length) return;
    if (grid[row][col] === '0') return;

    grid[row][col] = '0';

    const directions = [
      [row + 1, col],
      [row - 1, col],
      [row, col + 1],
      [row, col - 1],
    ];
    for (const [r, c] of directions) {
      dfs(r, c);
    }
  }

  let islands = 0;
  for (let rIdx = 0; rIdx < grid.length; rIdx++) {
    for (let cIdx = 0; cIdx < grid[0].length; cIdx++) {
      if (grid[rIdx][cIdx] === '1') {
        islands++;
        dfs(rIdx, cIdx);
      }
    }
  }

  return islands;
}
// @leet end
//

numIslands([
  ['1', '1', '1', '1', '0'],
  ['1', '1', '0', '1', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '0', '0', '0'],
]);
