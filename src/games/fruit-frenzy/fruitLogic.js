export const COLS = 6;
export const ROWS = 5;
export const MIN_CLUSTER = 5; // touching group size needed to pay

export const FRUITS = [
  { id: "cherry", emoji: "🍒", value: 2 },
  { id: "lemon", emoji: "🍋", value: 3 },
  { id: "grape", emoji: "🍇", value: 4 },
  { id: "watermelon", emoji: "🍉", value: 5 },
  { id: "strawberry", emoji: "🍓", value: 6 },
  { id: "banana", emoji: "🍌", value: 8 }
];

function weightedFruit() {
  const pool = [];
  for (const fruit of FRUITS) {
    const weight = Math.max(2, 10 - fruit.value);
    for (let i = 0; i < weight; i += 1) pool.push(fruit);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// Grid is rows x cols (row-major) for easy neighbour math.
export function randomGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, weightedFruit)
  );
}

// Flood-fill from a starting cell to find all connected same-id cells.
function floodCluster(grid, startR, startC, seen) {
  const id = grid[startR][startC].id;
  const stack = [[startR, startC]];
  const cells = [];
  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r}-${c}`;
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) continue;
    if (seen.has(key)) continue;
    if (grid[r][c].id !== id) continue;
    seen.add(key);
    cells.push([r, c]);
    stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
  }
  return cells;
}

// Returns array of winning clusters: { id, cells: [[r,c]...], value }
export function findClusters(grid) {
  const seen = new Set();
  const clusters = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (seen.has(`${r}-${c}`)) continue;
      const cells = floodCluster(grid, r, c, seen);
      if (cells.length >= MIN_CLUSTER) {
        clusters.push({ id: grid[r][c].id, cells, value: grid[r][c].value });
      }
    }
  }
  return clusters;
}

export function clusterPayout(clusters, betUnit) {
  let total = 0;
  for (const cluster of clusters) {
    // Bigger clusters pay progressively more.
    total += cluster.value * cluster.cells.length * betUnit;
  }
  return Math.round(total);
}

// Removes clustered cells, drops survivors down each column, refills the top.
export function collapse(grid, clusters) {
  const remove = new Set();
  for (const cluster of clusters) {
    for (const [r, c] of cluster.cells) remove.add(`${r}-${c}`);
  }

  const next = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  for (let c = 0; c < COLS; c += 1) {
    const survivors = [];
    for (let r = ROWS - 1; r >= 0; r -= 1) {
      if (!remove.has(`${r}-${c}`)) survivors.push(grid[r][c]);
    }
    // survivors are bottom-up; fill column from bottom.
    for (let r = ROWS - 1, i = 0; r >= 0; r -= 1, i += 1) {
      next[r][c] = i < survivors.length ? survivors[i] : weightedFruit();
    }
  }
  return next;
}
