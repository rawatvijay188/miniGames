// Random number generation for the Mini Games Arcade GDK.
//
// Every game's chance logic flows through this module instead of calling
// `Math.random()` directly. Two wins from that:
//   1. Fairness logic lives in one audited place (virtual coins only — but the
//      odds still need to be honest and consistent).
//   2. Tests can inject a seeded generator and assert exact outcomes, so game
//      payouts are deterministically verifiable (see rng.test.js).
//
// A "rng" here is just a function returning a float in [0, 1) — same contract
// as Math.random — so anything below accepts an optional `rng` and defaults to
// the real thing in production.

/**
 * Deterministic, seedable PRNG (mulberry32). Fast, tiny, good enough for game
 * feel — NOT for cryptography. Returns a function compatible with Math.random.
 *
 * @param {number} seed - any 32-bit integer
 * @returns {() => number} generator yielding floats in [0, 1)
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [min, max] inclusive. */
export function randInt(min, max, rng = Math.random) {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Uniformly pick one element from a non-empty array. */
export function pick(items, rng = Math.random) {
  return items[Math.floor(rng() * items.length)];
}

/**
 * Weighted pick. `items` may be objects carrying a numeric `weight`, or you can
 * pass a separate `weightOf` accessor. Heavier weights are more likely.
 *
 * @param {Array} items
 * @param {(item: any) => number} [weightOf] - defaults to item.weight
 * @param {() => number} [rng]
 */
export function weightedPick(items, weightOf = (item) => item.weight, rng = Math.random) {
  const total = items.reduce((sum, item) => sum + weightOf(item), 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= weightOf(item);
    if (roll < 0) return item;
  }
  return items[items.length - 1]; // floating-point safety net
}

/**
 * Return a new array with the elements shuffled (Fisher–Yates). Does not mutate
 * the input — important for React state where mutation causes stale renders.
 */
export function shuffle(items, rng = Math.random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** True with probability `p` (0–1). */
export function chance(p, rng = Math.random) {
  return rng() < p;
}
