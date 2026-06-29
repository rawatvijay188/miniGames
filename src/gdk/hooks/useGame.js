import { useCallback, useState } from "react";
import { useCoins } from "../../context/CoinContext.jsx";
import { useBet } from "./useBet.js";
import { useSound } from "./useSound.js";
import { settle } from "../logic/payout.js";
import { money } from "../../utils/format.js";

/**
 * The one hook most wagering games need. Composes the wallet, bet sizing, sound,
 * a `busy` round-lock, and shared win/loss messaging so a game can focus on its
 * own rules instead of re-implementing the betting loop.
 *
 *   const game = useGame({ bet: { initial: 20 }, idleMessage: "Spin to play!" });
 *   const onSpin = () => game.run(async () => {
 *     game.stake();                       // take the bet
 *     await animate();
 *     game.settleBet({ multiplier });     // pay out + message + sound
 *   });
 *
 * Returned fields:
 *   balance, setBalance, addCoins        — wallet passthrough
 *   bet, increase, decrease, setBet, …   — see useBet
 *   soundOn, toggle, sfx                 — see useSound
 *   busy                                 — true while a round is resolving
 *   message, setMessage                  — status line text
 *   lastWin, setLastWin                  — coins won on the most recent round
 *   run(fn)                              — busy-guarded async round runner
 *   stake()                              — deduct the current bet, returns it
 *   settleBet({ multiplier, ... })       — apply payout, message + sound, reclamp
 */
export function useGame({ bet: betOptions = {}, idleMessage = "" } = {}) {
  const { balance, setBalance, addCoins } = useCoins();
  const sound = useSound();
  const betApi = useBet({ ...betOptions, onChange: () => sound.sfx.bet() });

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(idleMessage);
  const [lastWin, setLastWin] = useState(0);

  // Guarded round runner: ignores re-entry while busy or when the player can't
  // cover the bet, and always clears the lock even if the round throws.
  const run = useCallback(
    async (round) => {
      if (busy || balance < betApi.bet) return;
      setBusy(true);
      try {
        await round();
      } finally {
        setBusy(false);
      }
    },
    [busy, balance, betApi.bet]
  );

  const stake = useCallback(() => {
    setBalance((b) => b - betApi.bet);
    return betApi.bet;
  }, [setBalance, betApi.bet]);

  /**
   * Resolve a staked round. Adds the payout back to the balance, updates the
   * status line + last-win, plays the matching sound, and reclamps the bet to
   * the post-round balance.
   *
   * @param {{ multiplier: number, jackpotAt?: number,
   *           winMessage?: (s) => string, loseMessage?: (s) => string }} params
   * @returns the settlement (see payout.settle)
   */
  const settleBet = useCallback(
    ({ multiplier, jackpotAt = 10, winMessage, loseMessage }) => {
      const result = settle({ bet: betApi.bet, multiplier });
      if (result.payout > 0) setBalance((b) => b + result.payout);

      if (result.outcome === "lose") {
        setLastWin(0);
        setMessage(loseMessage ? loseMessage(result) : "No win this time.");
        sound.sfx.lose();
      } else {
        // "Last win" shows the full amount returned (stake + profit), matching
        // how the arcade has always displayed it.
        setLastWin(result.payout);
        setMessage(
          winMessage
            ? winMessage(result)
            : result.outcome === "push"
              ? "Push — bet returned."
              : `Won ${money(result.won)}!`
        );
        if (multiplier >= jackpotAt) sound.sfx.jackpot();
        else sound.sfx.win();
      }

      // Bet must not exceed what's left after staking + payout.
      betApi.reclamp(balance - betApi.bet + result.payout);
      return result;
    },
    [balance, betApi, setBalance, sound]
  );

  return {
    // wallet
    balance,
    setBalance,
    addCoins,
    // bet
    ...betApi,
    // sound
    ...sound,
    // round state
    busy,
    setBusy,
    message,
    setMessage,
    lastWin,
    setLastWin,
    // actions
    run,
    stake,
    settleBet,
  };
}
