export const SYMBOLS = [
  { id: "diamond",  emoji: "💎", mult: 50 },
  { id: "moneybag", emoji: "💰", mult: 20 },
  { id: "bell",     emoji: "🔔", mult: 10 },
  { id: "cherry",   emoji: "🍒", mult: 5  },
  { id: "star",     emoji: "⭐", mult: 3  },
  { id: "lemon",    emoji: "🍋", mult: 1  },
];

function weightedSymbol() {
  const pool = [];
  for (const s of SYMBOLS) {
    const weight = Math.max(1, Math.floor(60 / s.mult));
    for (let i = 0; i < weight; i += 1) pool.push(s);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// Returns a flat array of 9 symbols (3×3, row-major).
export function generateCard() {
  return Array.from({ length: 9 }, weightedSymbol);
}

// Returns { totalMult, winRows: Set<rowIndex> }.
export function evaluateCard(cells) {
  let totalMult = 0;
  const winRows = new Set();
  for (let row = 0; row < 3; row += 1) {
    const a = cells[row * 3];
    const b = cells[row * 3 + 1];
    const c = cells[row * 3 + 2];
    if (a.id === b.id && b.id === c.id) {
      totalMult += a.mult;
      winRows.add(row);
    }
  }
  return { totalMult, winRows };
}
