export const REELS = 5;
export const ROWS = 3;

export const GEMS = [
  { id: "ruby", emoji: "🔴", value: 6 },
  { id: "sapphire", emoji: "🔵", value: 5 },
  { id: "emerald", emoji: "🟢", value: 4 },
  { id: "topaz", emoji: "🟡", value: 3 },
  { id: "amethyst", emoji: "🟣", value: 4 },
  { id: "diamond", emoji: "⚪", value: 8 }
];

export const WILD = { id: "wild", emoji: "💎", value: 0, wild: true };

function weightedGem() {
  const pool = [];
  for (const gem of GEMS) {
    const weight = Math.max(2, 10 - gem.value);
    for (let i = 0; i < weight; i += 1) pool.push(gem);
  }
  // Wild appears occasionally.
  pool.push(WILD, WILD, WILD);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Grid is reels (columns); each column has ROWS symbols.
export function randomGrid() {
  return Array.from({ length: REELS }, () =>
    Array.from({ length: ROWS }, weightedGem)
  );
}

// Any column containing a wild becomes fully wild (expanding wild).
export function expandWilds(grid) {
  const expandedCols = new Set();
  const next = grid.map((col, c) => {
    if (col.some((s) => s.wild)) {
      expandedCols.add(c);
      return col.map(() => WILD);
    }
    return col;
  });
  return { grid: next, expandedCols };
}

// Win both ways: a symbol wins if it appears on consecutive reels from the left
// OR from the right, on any row. Wilds substitute for any gem.
// Returns { total, winningReels: Set of reel indices that contributed }.
export function evaluate(grid, betUnit) {
  let total = 0;
  const winningReels = new Set();

  for (let row = 0; row < ROWS; row += 1) {
    // Left to right
    total += scanLine(grid, row, betUnit, winningReels, false);
    // Right to left
    total += scanLine(grid, row, betUnit, winningReels, true);
  }

  return { total: Math.round(total), winningReels };
}

function symbolAt(grid, reel, row) {
  return grid[reel][row];
}

function scanLine(grid, row, betUnit, winningReels, reverse) {
  const order = reverse
    ? Array.from({ length: REELS }, (_, i) => REELS - 1 - i)
    : Array.from({ length: REELS }, (_, i) => i);

  // Determine the "anchor" gem id (first non-wild), allowing leading wilds.
  let anchorId = null;
  let run = 0;
  const reelsInRun = [];

  for (const reel of order) {
    const sym = symbolAt(grid, reel, row);
    if (sym.wild) {
      run += 1;
      reelsInRun.push(reel);
      continue;
    }
    if (anchorId === null) {
      anchorId = sym.id;
      run += 1;
      reelsInRun.push(reel);
    } else if (sym.id === anchorId) {
      run += 1;
      reelsInRun.push(reel);
    } else {
      break;
    }
  }

  if (anchorId === null) return 0; // all wild line; skip to avoid double count
  if (run < 3) return 0;

  const gem = GEMS.find((g) => g.id === anchorId);
  for (const reel of reelsInRun) winningReels.add(`${reel}-${row}`);
  // Pay scales with run length.
  return gem.value * run * betUnit;
}
