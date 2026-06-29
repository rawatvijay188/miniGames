// Bet sizing rules shared by every wagering game.
//
// Before the GDK each game re-declared the same `INITIAL_BET / MIN_BET /
// MAX_BET` constants and an identical `clampBet`. These are the single source
// of truth now; games override via the useBet() options when they need a
// different range.

export const DEFAULT_BET = Object.freeze({
  initial: 20,
  min: 10,
  max: 100,
  step: 10,
});

/**
 * Clamp a requested bet so it is:
 *   - at least `min`
 *   - no more than `max`
 *   - no more than the player can actually afford (`balance`)
 *
 * When the balance falls below `min` the player simply can't bet — we still
 * return `min` so the displayed bet is sane; callers gate the action on
 * `balance >= bet` separately.
 *
 * @param {number} nextBet
 * @param {number} balance
 * @param {{min?: number, max?: number}} [range]
 */
export function clampBet(nextBet, balance, { min = DEFAULT_BET.min, max = DEFAULT_BET.max } = {}) {
  const affordableMax = Math.min(max, Math.max(min, balance));
  return Math.min(affordableMax, Math.max(min, nextBet));
}
