export const COLS = 5;
export const ROWS = 4;
export const WIN_THRESHOLD = 6; // symbols of one kind needed on the grid to pay

export const SYMBOLS = [
  { id: "star", emoji: "⭐", value: 5 },
  { id: "planet", emoji: "🪐", value: 4 },
  { id: "comet", emoji: "☄️", value: 6 },
  { id: "moon", emoji: "🌙", value: 3 },
  { id: "rocket", emoji: "🚀", value: 8 },
  { id: "alien", emoji: "👽", value: 10 }
];

function weightedSymbol() {
  // Higher-value symbols appear less often.
  const pool = [];
  for (const symbol of SYMBOLS) {
    const weight = Math.max(2, 12 - symbol.value);
    for (let i = 0; i < weight; i += 1) pool.push(symbol);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// Grid is an array of columns; each column is an array of symbols, top -> bottom.
export function randomGrid() {
  return Array.from({ length: COLS }, () =>
    Array.from({ length: ROWS }, weightedSymbol)
  );
}

// Returns the set of symbol ids that appear at least WIN_THRESHOLD times.
export function findWinningIds(grid) {
  const counts = {};
  for (const col of grid) {
    for (const symbol of col) {
      counts[symbol.id] = (counts[symbol.id] || 0) + 1;
    }
  }
  return Object.keys(counts).filter((id) => counts[id] >= WIN_THRESHOLD);
}

// Counts how many cells match the given ids.
export function countMatches(grid, ids) {
  const idSet = new Set(ids);
  let total = 0;
  for (const col of grid) {
    for (const symbol of col) {
      if (idSet.has(symbol.id)) total += 1;
    }
  }
  return total;
}

// Removes winning symbols, drops survivors down, refills the top with new symbols.
export function collapse(grid, winningIds) {
  const idSet = new Set(winningIds);
  return grid.map((col) => {
    const survivors = col.filter((symbol) => !idSet.has(symbol.id));
    const missing = ROWS - survivors.length;
    const fresh = Array.from({ length: missing }, weightedSymbol);
    return [...fresh, ...survivors];
  });
}

// Payout for one cascade step: sum of (value) for each matched cell, times bet unit and multiplier.
export function cascadePayout(grid, winningIds, betUnit, multiplier) {
  const idSet = new Set(winningIds);
  let points = 0;
  for (const col of grid) {
    for (const symbol of col) {
      if (idSet.has(symbol.id)) points += symbol.value;
    }
  }
  return Math.round(points * betUnit * multiplier);
}
