export const COLS = 5;
export const ROWS = 4;
export const WIN_THRESHOLD = 6; // symbols of one kind needed on the grid to pay

export const SYMBOLS = [
  {
    id: "star", value: 5,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cc-st" cx="40%" cy="30%"><stop offset="0%" stop-color="#ffe680"/><stop offset="55%" stop-color="#f7bd4a"/><stop offset="100%" stop-color="#8a5e00"/></radialGradient></defs><path d="M50 8l10 28 30 2-23 20 8 30-25-16-25 16 8-30L8 38l30-2z" fill="url(#cc-st)" stroke="#c09000" stroke-width="1"/><ellipse cx="43" cy="30" rx="7" ry="3" fill="#fff" opacity="0.35" transform="rotate(-30,43,30)"/></svg>'
  },
  {
    id: "planet", value: 4,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cc-pl" cx="38%" cy="35%"><stop offset="0%" stop-color="#f0a060"/><stop offset="55%" stop-color="#c06020"/><stop offset="100%" stop-color="#5a2000"/></radialGradient><linearGradient id="cc-ri" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#d08040" stop-opacity="0.9"/><stop offset="50%" stop-color="#f0c080"/><stop offset="100%" stop-color="#d08040" stop-opacity="0.9"/></linearGradient></defs><ellipse cx="50" cy="55" rx="44" ry="12" fill="url(#cc-ri)" opacity="0.7"/><circle cx="50" cy="50" r="30" fill="url(#cc-pl)"/><ellipse cx="50" cy="43" rx="30" ry="5" fill="#d07030" opacity="0.4"/><ellipse cx="50" cy="57" rx="30" ry="5" fill="#a04010" opacity="0.4"/><ellipse cx="38" cy="36" rx="10" ry="6" fill="#ffcc88" opacity="0.4" transform="rotate(-20,38,36)"/></svg>'
  },
  {
    id: "comet", value: 6,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cc-co" cx="35%" cy="35%"><stop offset="0%" stop-color="#fff8d0"/><stop offset="40%" stop-color="#f7d94a"/><stop offset="100%" stop-color="#c04000"/></radialGradient><linearGradient id="cc-ta" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#f35f76" stop-opacity="0"/><stop offset="100%" stop-color="#f35f76" stop-opacity="0.7"/></linearGradient><linearGradient id="cc-tb" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#f7d94a" stop-opacity="0"/><stop offset="100%" stop-color="#f7d94a" stop-opacity="0.5"/></linearGradient></defs><path d="M60 40 Q28 52 8 90" stroke="url(#cc-ta)" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M60 40 Q32 54 14 92" stroke="url(#cc-tb)" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="66" cy="36" r="22" fill="url(#cc-co)"/><ellipse cx="58" cy="26" rx="8" ry="5" fill="#fff" opacity="0.4" transform="rotate(-30,58,26)"/></svg>'
  },
  {
    id: "moon", value: 3,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cc-mo" cx="60%" cy="35%"><stop offset="0%" stop-color="#f0f0d0"/><stop offset="55%" stop-color="#c8c870"/><stop offset="100%" stop-color="#6a6820"/></radialGradient></defs><path d="M62 18 A34 34 0 1 0 62 82 A22 22 0 1 1 62 18Z" fill="url(#cc-mo)"/><circle cx="38" cy="42" r="6" fill="#8a8a30" opacity="0.45"/><circle cx="52" cy="64" r="4" fill="#8a8a30" opacity="0.35"/><circle cx="28" cy="62" r="5" fill="#8a8a30" opacity="0.3"/><ellipse cx="44" cy="28" rx="7" ry="3" fill="#fff" opacity="0.35" transform="rotate(-10,44,28)"/></svg>'
  },
  {
    id: "rocket", value: 8,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cc-rk" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#2ab0b8"/><stop offset="45%" stop-color="#49d7df"/><stop offset="100%" stop-color="#0e6070"/></linearGradient><linearGradient id="cc-fn" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ffd060"/><stop offset="100%" stop-color="#c07a00"/></linearGradient></defs><polygon points="50,8 62,48 62,76 50,86 38,76 38,48" fill="url(#cc-rk)"/><polygon points="38,68 26,90 50,80" fill="url(#cc-fn)"/><polygon points="62,68 74,90 50,80" fill="url(#cc-fn)"/><circle cx="50" cy="52" r="11" fill="#0b1a20" stroke="#49d7df" stroke-width="1.5"/><circle cx="50" cy="52" r="7" fill="#1a3a4a"/><rect x="46" y="10" width="8" height="26" rx="4" fill="#fff" opacity="0.15"/></svg>'
  },
  {
    id: "alien", value: 10,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cc-al" cx="40%" cy="35%"><stop offset="0%" stop-color="#a0e860"/><stop offset="55%" stop-color="#50b030"/><stop offset="100%" stop-color="#1a5000"/></radialGradient></defs><ellipse cx="50" cy="42" rx="32" ry="36" fill="url(#cc-al)" stroke="#70d67a" stroke-width="1.5"/><ellipse cx="35" cy="38" rx="11" ry="8" fill="#060a06"/><ellipse cx="65" cy="38" rx="11" ry="8" fill="#060a06"/><ellipse cx="31" cy="34" rx="4" ry="3" fill="#30c030" opacity="0.6"/><ellipse cx="61" cy="34" rx="4" ry="3" fill="#30c030" opacity="0.6"/><path d="M38 60 Q50 66 62 60" fill="none" stroke="#1a6010" stroke-width="2" stroke-linecap="round"/><circle cx="46" cy="54" r="2" fill="#2a7020" opacity="0.6"/><circle cx="54" cy="54" r="2" fill="#2a7020" opacity="0.6"/><ellipse cx="38" cy="26" rx="10" ry="5" fill="#c0ff88" opacity="0.35" transform="rotate(-15,38,26)"/></svg>'
  }
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
