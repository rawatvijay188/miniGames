import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Single source of truth for the player's virtual-coin wallet.
// Persisted to localStorage so the balance survives navigation, reloads, and
// app restarts (every game reads/writes the same wallet via useCoins()).
const STORAGE_KEY = "minigames.wallet.v1";

export const STARTING_BALANCE = 1000; // new players + bankruptcy refill top-up
const DAILY_BASE = 200;   // day-one daily bonus
const DAILY_STEP = 25;    // extra coins per consecutive day
const STREAK_CAP = 7;     // streak stops growing the bonus after 7 days

const CoinContext = createContext(null);

// Local-date day key (YYYY-MM-DD) so "daily" follows the player's calendar day.
function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

function bonusForStreak(streak) {
  const capped = Math.min(Math.max(streak, 1), STREAK_CAP);
  return DAILY_BASE + (capped - 1) * DAILY_STEP;
}

function sanitizeBalance(value, fallback) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : fallback;
}

function loadState() {
  const fresh = { balance: STARTING_BALANCE, lastClaim: null, streak: 0 };
  if (typeof localStorage === "undefined") return fresh;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw);
    return {
      balance: sanitizeBalance(parsed.balance, STARTING_BALANCE),
      lastClaim: typeof parsed.lastClaim === "string" ? parsed.lastClaim : null,
      streak: Number.isFinite(parsed.streak) ? parsed.streak : 0,
    };
  } catch {
    return fresh; // corrupt storage — start clean rather than crash
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
    setState((prev) => {
      const raw = typeof next === "function" ? next(prev.balance) : next;
      const value = sanitizeBalance(raw, prev.balance);
      if (value === prev.balance) return prev;
      return { ...prev, balance: value };
    });
  }, []);

  const addCoins = useCallback(
    (amount) => setBalance((b) => b + amount),
    [setBalance]
  );

  // Bankruptcy safety net: top a broke wallet back up to the baseline.
  // Never reduces a healthy balance, so it can't be abused to farm coins.
  const refillWallet = useCallback(() => {
    setState((prev) =>
      prev.balance >= STARTING_BALANCE ? prev : { ...prev, balance: STARTING_BALANCE }
    );
  }, []);

  const claimDailyBonus = useCallback(() => {
    setState((prev) => {
      const today = dayKey();
      if (prev.lastClaim === today) return prev; // already claimed today
      const nextStreak = prev.lastClaim === yesterdayKey() ? prev.streak + 1 : 1;
      return {
        ...prev,
        balance: prev.balance + bonusForStreak(nextStreak),
        lastClaim: today,
        streak: nextStreak,
      };
    });
  }, []);

  const canClaimBonus = state.lastClaim !== dayKey();
  // What the next claim is worth (continues the streak if claimed yesterday).
  const projectedStreak = state.lastClaim === yesterdayKey() ? state.streak + 1 : 1;
  const nextBonusAmount = bonusForStreak(projectedStreak);

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
