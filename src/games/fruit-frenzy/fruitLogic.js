export const COLS = 6;
export const ROWS = 5;
export const MIN_CLUSTER = 5; // touching group size needed to pay

export const FRUITS = [
  {
    id: "cherry", value: 2,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ff-ca" cx="38%" cy="30%"><stop offset="0%" stop-color="#ffaabf"/><stop offset="55%" stop-color="#f35f76"/><stop offset="100%" stop-color="#8b1a2a"/></radialGradient><radialGradient id="ff-cb" cx="38%" cy="30%"><stop offset="0%" stop-color="#ff7090"/><stop offset="55%" stop-color="#c0392b"/><stop offset="100%" stop-color="#6a0f1a"/></radialGradient></defs><path d="M38 52 Q48 22 70 16" fill="none" stroke="#2a5c2a" stroke-width="4" stroke-linecap="round"/><path d="M44 48 Q56 28 70 16" fill="none" stroke="#70d67a" stroke-width="2.5" stroke-linecap="round"/><circle cx="31" cy="67" r="19" fill="url(#ff-ca)"/><circle cx="58" cy="71" r="17" fill="url(#ff-cb)"/><ellipse cx="25" cy="59" rx="5" ry="3" fill="#ffccd5" opacity="0.7" transform="rotate(-20,25,59)"/><ellipse cx="52" cy="63" rx="4" ry="3" fill="#ff9eb0" opacity="0.6" transform="rotate(-20,52,63)"/></svg>'
  },
  {
    id: "lemon", value: 3,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ff-le" cx="38%" cy="30%"><stop offset="0%" stop-color="#fff8a0"/><stop offset="55%" stop-color="#f7d94a"/><stop offset="100%" stop-color="#a07800"/></radialGradient></defs><ellipse cx="50" cy="52" rx="30" ry="24" fill="url(#ff-le)" transform="rotate(-15,50,52)"/><path d="M50 28 Q56 16 62 20" fill="none" stroke="#a0b020" stroke-width="3" stroke-linecap="round"/><ellipse cx="36" cy="40" rx="8" ry="4" fill="#fff9c4" opacity="0.6" transform="rotate(-20,36,40)"/></svg>'
  },
  {
    id: "grape", value: 4,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ff-gd" cx="35%" cy="30%"><stop offset="0%" stop-color="#c990e8"/><stop offset="55%" stop-color="#8e44ad"/><stop offset="100%" stop-color="#4a1060"/></radialGradient><radialGradient id="ff-gl" cx="35%" cy="30%"><stop offset="0%" stop-color="#d9a0f0"/><stop offset="55%" stop-color="#9b59b6"/><stop offset="100%" stop-color="#5a1a70"/></radialGradient></defs><path d="M50 18 Q56 12 62 14" fill="none" stroke="#5a8a2a" stroke-width="3" stroke-linecap="round"/><circle cx="38" cy="40" r="13" fill="url(#ff-gd)"/><circle cx="62" cy="40" r="13" fill="url(#ff-gl)"/><circle cx="26" cy="60" r="13" fill="url(#ff-gl)"/><circle cx="50" cy="60" r="13" fill="url(#ff-gd)"/><circle cx="74" cy="60" r="13" fill="url(#ff-gl)"/><circle cx="50" cy="80" r="11" fill="url(#ff-gd)"/><ellipse cx="33" cy="33" rx="4" ry="3" fill="#e8c0ff" opacity="0.6"/><ellipse cx="57" cy="33" rx="4" ry="3" fill="#e8c0ff" opacity="0.5"/><ellipse cx="45" cy="54" rx="4" ry="3" fill="#e8c0ff" opacity="0.5"/></svg>'
  },
  {
    id: "watermelon", value: 5,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ff-wr" cx="40%" cy="35%"><stop offset="0%" stop-color="#ff8a8a"/><stop offset="60%" stop-color="#e03030"/><stop offset="100%" stop-color="#7a0a0a"/></radialGradient><linearGradient id="ff-wg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#a8e06a"/><stop offset="100%" stop-color="#3a8a10"/></linearGradient></defs><path d="M10 62 A45 45 0 0 1 90 62 Z" fill="url(#ff-wg)" stroke="#2a7a08" stroke-width="1.5"/><path d="M16 62 A39 39 0 0 1 84 62 Z" fill="url(#ff-wr)"/><path d="M13 62 A42 42 0 0 1 87 62 Z" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.3"/><ellipse cx="30" cy="55" rx="3" ry="5" fill="#1a0a0a" opacity="0.7" transform="rotate(-15,30,55)"/><ellipse cx="50" cy="50" rx="3" ry="5" fill="#1a0a0a" opacity="0.7"/><ellipse cx="70" cy="55" rx="3" ry="5" fill="#1a0a0a" opacity="0.7" transform="rotate(15,70,55)"/><ellipse cx="34" cy="48" rx="8" ry="4" fill="#ffaaaa" opacity="0.35" transform="rotate(-10,34,48)"/></svg>'
  },
  {
    id: "strawberry", value: 6,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ff-st" cx="40%" cy="30%"><stop offset="0%" stop-color="#ff9090"/><stop offset="55%" stop-color="#e03030"/><stop offset="100%" stop-color="#7a0a10"/></radialGradient></defs><path d="M50 22 Q46 14 38 16 Q44 20 44 26Z" fill="#3a8a20"/><path d="M50 22 Q54 14 62 16 Q56 20 56 26Z" fill="#5aaa30"/><path d="M50 22 Q42 12 46 22Z" fill="#4a9a28"/><path d="M50 26 Q70 30 75 50 Q74 72 50 88 Q26 72 25 50 Q30 30 50 26Z" fill="url(#ff-st)"/><ellipse cx="38" cy="50" rx="2" ry="2.5" fill="#f7e060" opacity="0.85"/><ellipse cx="50" cy="44" rx="2" ry="2.5" fill="#f7e060" opacity="0.85"/><ellipse cx="62" cy="50" rx="2" ry="2.5" fill="#f7e060" opacity="0.85"/><ellipse cx="43" cy="64" rx="2" ry="2.5" fill="#f7e060" opacity="0.75"/><ellipse cx="57" cy="64" rx="2" ry="2.5" fill="#f7e060" opacity="0.75"/><ellipse cx="50" cy="75" rx="2" ry="2.5" fill="#f7e060" opacity="0.7"/><ellipse cx="40" cy="38" rx="7" ry="4" fill="#ffbbbb" opacity="0.45" transform="rotate(-10,40,38)"/></svg>'
  },
  {
    id: "banana", value: 8,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ff-ba" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#fff176"/><stop offset="50%" stop-color="#f7d94a"/><stop offset="100%" stop-color="#8a6000"/></linearGradient></defs><path d="M25 65 Q22 40 40 22 Q60 10 75 25 Q80 30 78 40 Q74 24 56 28 Q36 35 32 60Z" fill="url(#ff-ba)" stroke="#c09000" stroke-width="1"/><path d="M32 60 Q38 44 50 35 Q64 26 76 30" fill="none" stroke="#c09000" stroke-width="1.5" opacity="0.5"/><ellipse cx="24" cy="66" rx="5" ry="6" fill="#d0a800" transform="rotate(20,24,66)"/><ellipse cx="44" cy="32" rx="8" ry="3" fill="#fff9c4" opacity="0.55" transform="rotate(-30,44,32)"/></svg>'
  }
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
