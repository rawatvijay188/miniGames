import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  STARTING_BALANCE,
  bonusForStreak,
  canClaim,
  freshState,
  parseState,
  projectedStreak,
  reduceClaimDaily,
  reduceRefill,
  reduceSetBalance,
} from "./walletCore.js";

// React + localStorage wrapper around the pure wallet logic in walletCore.js.
// Single source of truth for the player's virtual-coin wallet, persisted so the
// balance survives navigation, reloads, and app restarts (every game reads and
// writes the same wallet via useCoins()).

export { STARTING_BALANCE };

const CoinContext = createContext(null);

function loadState() {
  if (typeof localStorage === "undefined") return freshState();
  try {
    return parseState(localStorage.getItem(STORAGE_KEY));
  } catch {
    return freshState(); // storage unavailable — start clean rather than crash
  }
}

export function CoinProvider({ children }) {
  const [state, setState] = useState(loadState);

  // Persist the whole wallet whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private mode etc.) — wallet stays in memory.
    }
  }, [state]);

  // Drop-in replacement for a useState setter: accepts an absolute value or an
  // updater function, and persists. Clamped to a non-negative integer.
  const setBalance = useCallback((next) => {
    setState((prev) => reduceSetBalance(prev, next));
  }, []);

  const addCoins = useCallback(
    (amount) => setBalance((b) => b + amount),
    [setBalance]
  );

  const refillWallet = useCallback(() => {
    setState((prev) => reduceRefill(prev));
  }, []);

  const claimDailyBonus = useCallback(() => {
    setState((prev) => reduceClaimDaily(prev));
  }, []);

  const canClaimBonus = canClaim(state);
  const nextBonusAmount = bonusForStreak(projectedStreak(state));

  const value = useMemo(
    () => ({
      balance: state.balance,
      streak: state.streak,
      setBalance,
      addCoins,
      refillWallet,
      claimDailyBonus,
      canClaimBonus,
      nextBonusAmount,
      startingBalance: STARTING_BALANCE,
    }),
    [
      state.balance,
      state.streak,
      setBalance,
      addCoins,
      refillWallet,
      claimDailyBonus,
      canClaimBonus,
      nextBonusAmount,
    ]
  );

  return <CoinContext.Provider value={value}>{children}</CoinContext.Provider>;
}

export function useCoins() {
  const ctx = useContext(CoinContext);
  if (!ctx) {
    throw new Error("useCoins must be used within a CoinProvider");
  }
  return ctx;
}
