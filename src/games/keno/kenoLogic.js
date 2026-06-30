export const GRID_SIZE = 40;
export const DRAW_COUNT = 15;
export const MAX_PICKS = 8;

export const NUMBERS = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);

// Payout table: picks count -> [[matchCount, multiplier], ...]
export const PAY_TABLE = {
  1: [[1, 3]],
  2: [[2, 10]],
  3: [[3, 40], [2, 3]],
  4: [[4, 120], [3, 6], [2, 1]],
  5: [[5, 500], [4, 15], [3, 4]],
  6: [[6, 1200], [5, 50], [4, 8], [3, 2]],
  7: [[7, 3000], [6, 150], [5, 20], [4, 5], [3, 1]],
  8: [[8, 10000], [7, 500], [6, 80], [5, 15], [4, 4], [3, 1]],
};

// `rng` defaults to Math.random; tests inject a seeded generator for
// deterministic draws.
export function drawNumbers(rng = Math.random) {
  const pool = [...NUMBERS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, DRAW_COUNT);
}

export function calcPayout(picksArr, drawnArr, betUnit) {
  const drawnSet = new Set(drawnArr);
  const hits = picksArr.filter((n) => drawnSet.has(n)).length;
  const table = PAY_TABLE[picksArr.length] ?? [];
  const entry = table.find(([match]) => match === hits);
  const mult = entry ? entry[1] : 0;
  return { hits, payout: Math.round(mult * betUnit) };
}
