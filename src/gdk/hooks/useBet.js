import { useCallback, useState } from "react";
import { useCoins } from "../../context/CoinContext.jsx";
import { clampBet, DEFAULT_BET } from "../logic/bet.js";

/**
 * Bet state + sizing for a wagering game. Pulls the live balance from the
 * wallet so every clamp respects what the player can actually afford, and
 * exposes the steppers/range handlers games wire to their controls.
 *
 *   const { bet, min, max, step, balance, canBet, increase, decrease, setBet } =
 *     useBet({ initial: 25, min: 5, max: 250, step: 5, onChange: () => sfx.bet() });
 *
 * After a round resolves, call `reclamp(newBalance)` so the bet never exceeds
 * the post-payout balance (matches the old `updateBet(bet, nextBalance)` calls).
 *
 * @param {{ initial?: number, min?: number, max?: number, step?: number,
 *           locked?: boolean, onChange?: (bet: number) => void }} [options]
 */
export function useBet(options = {}) {
  const {
    initial = DEFAULT_BET.initial,
    min = DEFAULT_BET.min,
    max = DEFAULT_BET.max,
    step = DEFAULT_BET.step,
    locked = false,
    onChange,
  } = options;

  const { balance } = useCoins();
  const [bet, setBetRaw] = useState(() => clampBet(initial, Infinity, { min, max }));

  const setBet = useCallback(
    (next, againstBalance = balance) => {
      if (locked) return;
      const value = clampBet(Number(next), againstBalance, { min, max });
      setBetRaw(value);
      onChange?.(value);
    },
    [balance, locked, min, max, onChange]
  );

  const increase = useCallback(() => setBet(bet + step), [bet, step, setBet]);
  const decrease = useCallback(() => setBet(bet - step), [bet, step, setBet]);

  // Re-clamp without firing onChange (used after settling a round).
  const reclamp = useCallback(
    (againstBalance) => setBetRaw((b) => clampBet(b, againstBalance, { min, max })),
    [min, max]
  );

  return {
    bet,
    setBet,
    increase,
    decrease,
    reclamp,
    min,
    max,
    step,
    balance,
    canBet: balance >= bet,
    atMin: bet <= min,
    atMax: bet >= max || bet >= balance,
  };
}
