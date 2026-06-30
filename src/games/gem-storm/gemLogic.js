export const REELS = 5;
export const ROWS = 3;

export const GEMS = [
  {
    id: "ruby", value: 6,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gs-ru" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#ff6060"/><stop offset="45%" stop-color="#c0392b"/><stop offset="100%" stop-color="#6a0f10"/></linearGradient><linearGradient id="gs-ru2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff8888" stop-opacity="0.7"/><stop offset="100%" stop-color="#c0392b" stop-opacity="0"/></linearGradient></defs><polygon points="50,10 82,36 82,64 50,90 18,64 18,36" fill="url(#gs-ru)" stroke="#ff4444" stroke-width="1.5"/><polygon points="50,10 82,36 50,90 18,64 18,36" fill="url(#gs-ru2)"/><line x1="18" y1="36" x2="82" y2="36" stroke="#ff8080" stroke-width="1" opacity="0.6"/><ellipse cx="38" cy="28" rx="9" ry="4" fill="#fff" opacity="0.25" transform="rotate(-20,38,28)"/></svg>'
  },
  {
    id: "sapphire", value: 5,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gs-sa" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#60a0ff"/><stop offset="45%" stop-color="#1a5fc0"/><stop offset="100%" stop-color="#0a1a6a"/></linearGradient><linearGradient id="gs-sa2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#88bbff" stop-opacity="0.7"/><stop offset="100%" stop-color="#1a5fc0" stop-opacity="0"/></linearGradient></defs><polygon points="50,10 82,36 82,64 50,90 18,64 18,36" fill="url(#gs-sa)" stroke="#4488ff" stroke-width="1.5"/><polygon points="50,10 82,36 50,90 18,64 18,36" fill="url(#gs-sa2)"/><line x1="18" y1="36" x2="82" y2="36" stroke="#80b0ff" stroke-width="1" opacity="0.6"/><ellipse cx="38" cy="28" rx="9" ry="4" fill="#fff" opacity="0.25" transform="rotate(-20,38,28)"/></svg>'
  },
  {
    id: "emerald", value: 4,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gs-em" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#60e060"/><stop offset="45%" stop-color="#1a9030"/><stop offset="100%" stop-color="#0a3a10"/></linearGradient><linearGradient id="gs-em2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#88ff88" stop-opacity="0.7"/><stop offset="100%" stop-color="#1a9030" stop-opacity="0"/></linearGradient></defs><polygon points="35,10 65,10 80,25 80,75 65,90 35,90 20,75 20,25" fill="url(#gs-em)" stroke="#44cc44" stroke-width="1.5"/><polygon points="35,10 65,10 80,25 80,75 65,90 35,90 20,75 20,25" fill="url(#gs-em2)"/><line x1="20" y1="25" x2="80" y2="25" stroke="#88ff88" stroke-width="1" opacity="0.6"/><line x1="35" y1="10" x2="35" y2="90" stroke="#88ff88" stroke-width="0.8" opacity="0.3"/><line x1="65" y1="10" x2="65" y2="90" stroke="#88ff88" stroke-width="0.8" opacity="0.3"/><ellipse cx="38" cy="20" rx="10" ry="4" fill="#fff" opacity="0.25" transform="rotate(-5,38,20)"/></svg>'
  },
  {
    id: "topaz", value: 3,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gs-to" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#ffe060"/><stop offset="45%" stop-color="#c09010"/><stop offset="100%" stop-color="#6a4800"/></linearGradient><linearGradient id="gs-to2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff0a0" stop-opacity="0.7"/><stop offset="100%" stop-color="#c09010" stop-opacity="0"/></linearGradient></defs><polygon points="50,10 75,28 82,58 64,90 36,90 18,58 25,28" fill="url(#gs-to)" stroke="#f0c040" stroke-width="1.5"/><polygon points="50,10 75,28 82,58 64,90 36,90 18,58 25,28" fill="url(#gs-to2)"/><line x1="25" y1="28" x2="75" y2="28" stroke="#ffe080" stroke-width="1" opacity="0.6"/><ellipse cx="38" cy="22" rx="9" ry="4" fill="#fff" opacity="0.25" transform="rotate(-15,38,22)"/></svg>'
  },
  {
    id: "amethyst", value: 4,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gs-am" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#c060e0"/><stop offset="45%" stop-color="#7030a0"/><stop offset="100%" stop-color="#300a50"/></linearGradient><linearGradient id="gs-am2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e090ff" stop-opacity="0.7"/><stop offset="100%" stop-color="#7030a0" stop-opacity="0"/></linearGradient></defs><polygon points="50,10 82,36 82,64 50,90 18,64 18,36" fill="url(#gs-am)" stroke="#c060ff" stroke-width="1.5"/><polygon points="50,10 82,36 50,90 18,64 18,36" fill="url(#gs-am2)"/><line x1="18" y1="36" x2="82" y2="36" stroke="#d090ff" stroke-width="1" opacity="0.6"/><ellipse cx="38" cy="28" rx="9" ry="4" fill="#fff" opacity="0.25" transform="rotate(-20,38,28)"/></svg>'
  },
  {
    id: "diamond", value: 8,
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gs-di" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#e8f8ff"/><stop offset="45%" stop-color="#a0d8ef"/><stop offset="100%" stop-color="#204060"/></linearGradient><linearGradient id="gs-di2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff" stop-opacity="0.8"/><stop offset="100%" stop-color="#a0d8ef" stop-opacity="0"/></linearGradient></defs><polygon points="50,10 82,36 82,64 50,90 18,64 18,36" fill="url(#gs-di)" stroke="#c0e8ff" stroke-width="1.5"/><polygon points="50,10 82,36 50,90 18,64 18,36" fill="url(#gs-di2)"/><line x1="18" y1="36" x2="82" y2="36" stroke="#fff" stroke-width="1" opacity="0.7"/><ellipse cx="38" cy="28" rx="9" ry="4" fill="#fff" opacity="0.4" transform="rotate(-20,38,28)"/></svg>'
  }
];

export const WILD = {
  id: "wild", value: 0, wild: true,
  svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gs-wi" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#a0f8ff"/><stop offset="45%" stop-color="#49d7df"/><stop offset="100%" stop-color="#0a5060"/></linearGradient><linearGradient id="gs-wi2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="100%" stop-color="#49d7df" stop-opacity="0"/></linearGradient></defs><polygon points="50,8 84,42 50,92 16,42" fill="url(#gs-wi)" stroke="#a0f8ff" stroke-width="1.5"/><polygon points="50,8 84,42 50,92 16,42" fill="url(#gs-wi2)"/><line x1="16" y1="42" x2="84" y2="42" stroke="#a0f8ff" stroke-width="1" opacity="0.7"/><line x1="50" y1="8" x2="16" y2="42" stroke="#fff" stroke-width="0.8" opacity="0.4"/><line x1="50" y1="8" x2="84" y2="42" stroke="#fff" stroke-width="0.8" opacity="0.4"/><ellipse cx="40" cy="26" rx="9" ry="4" fill="#fff" opacity="0.45" transform="rotate(-25,40,26)"/><text x="50" y="62" text-anchor="middle" fill="#0b1a1c" font-size="12" font-weight="900" font-family="sans-serif">WILD</text></svg>'
};

function weightedGem(rng = Math.random) {
  const pool = [];
  for (const gem of GEMS) {
    const weight = Math.max(2, 10 - gem.value);
    for (let i = 0; i < weight; i += 1) pool.push(gem);
  }
  // Wild appears occasionally.
  pool.push(WILD, WILD, WILD);
  return pool[Math.floor(rng() * pool.length)];
}

// Grid is reels (columns); each column has ROWS symbols.
export function randomGrid(rng = Math.random) {
  return Array.from({ length: REELS }, () =>
    Array.from({ length: ROWS }, () => weightedGem(rng))
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
