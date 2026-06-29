// Pure payout math. Keeping the win/loss/push arithmetic here (rather than
// inline in each game) means the rules are testable and every game settles the
// same way: the stake is taken up front, and `settle` returns the net delta to
// apply to the balance plus a human-readable outcome.

/**
 * @typedef {"win" | "lose" | "push"} Outcome
 * @typedef {{ outcome: Outcome, multiplier: number, payout: number, net: number, won: number }} Settlement
 *   payout — total coins returned to the player (0 on a loss).
 *   net    — change vs. before the round (payout - bet).
 *   won    — profit on a win (payout - bet), else 0. Handy for "Last win" UI.
 */

/**
 * Settle a single wager.
 *
 * `multiplier` is the total return per coin staked, casino-style:
 *   0   → lose the stake          (net -bet)
 *   1   → push / stake returned   (net 0)
 *   2   → even-money win          (net +bet)
 *   N   → N× the stake returned   (net +(N-1)*bet)
 *
 * @param {{ bet: number, multiplier: number }} params
 * @returns {Settlement}
 */
export function settle({ bet, multiplier }) {
  const payout = Math.round(bet * multiplier);
  const net = payout - bet;
  const outcome = net > 0 ? "win" : net < 0 ? "lose" : "push";
  return {
    outcome,
    multiplier,
    payout,
    net,
    won: outcome === "win" ? net : 0,
  };
}

/** Convenience: settle from explicit win/push booleans (for non-multiplier games). */
export function settleResult({ bet, won, push = false }) {
  if (push) return settle({ bet, multiplier: 1 });
  return settle({ bet, multiplier: won ? 2 : 0 });
}
