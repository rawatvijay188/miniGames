// Pure, framework-free wallet logic for the virtual-coin economy.
// No React, no localStorage here — just deterministic functions so the
// coin math can be unit-tested (see walletCore.test.js). CoinContext.jsx is
// the thin React + localStorage wrapper that drives these.

export const STORAGE_KEY = "minigames.wallet.v1";

export const STARTING_BALANCE = 1000; // new players + bankruptcy refill top-up
export const DAILY_BASE = 200;        // day-one daily bonus
export const DAILY_STEP = 25;         // extra coins per consecutive day
export const STREAK_CAP = 7;          // streak stops growing the bonus after 7 days

// Local-date day key (YYYY-MM-DD) so "daily" follows the player's calendar day.
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// The calendar day before `date` (defaults to today), as a day key.
export function yesterdayKey(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

// Daily bonus payout for a given streak length. Clamped to [1, STREAK_CAP] so
// the bonus grows for a week of play, then plateaus.
export function bonusForStreak(streak) {
  const capped = Math.min(Math.max(streak, 1), STREAK_CAP);
  return DAILY_BASE + (capped - 1) * DAILY_STEP;
}

// Coerce any stored/computed balance to a safe non-negative integer.
export function sanitizeBalance(value, fallback) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : fallback;
}

export function freshState() {
  return { balance: STARTING_BALANCE, lastClaim: null, streak: 0 };
}

// Parse a raw localStorage string into a valid wallet state, falling back to a
// clean wallet on missing/corrupt/invalid data rather than crashing.
export function parseState(raw) {
  if (!raw) return freshState();
  try {
    const parsed = JSON.parse(raw);
    return {
      balance: sanitizeBalance(parsed.balance, STARTING_BALANCE),
      lastClaim: typeof parsed.lastClaim === "string" ? parsed.lastClaim : null,
      streak: Number.isFinite(parsed.streak) ? parsed.streak : 0,
    };
  } catch {
    return freshState(); // corrupt storage — start clean rather than crash
  }
}

// Apply an absolute value or updater function to the balance, clamped to a
// non-negative integer. Returns the same reference when unchanged.
export function reduceSetBalance(prev, next) {
  const raw = typeof next === "function" ? next(prev.balance) : next;
  const value = sanitizeBalance(raw, prev.balance);
  if (value === prev.balance) return prev;
  return { ...prev, balance: value };
}

// Bankruptcy safety net: top a broke wallet up to the baseline. Never reduces a
// healthy balance, so it can't be abused to farm coins.
export function reduceRefill(prev) {
  return prev.balance >= STARTING_BALANCE
    ? prev
    : { ...prev, balance: STARTING_BALANCE };
}

// Claim today's daily bonus. No-op if already claimed today. Continues the
// streak when the last claim was yesterday, otherwise resets the streak to 1.
export function reduceClaimDaily(prev, now = new Date()) {
  const today = dayKey(now);
  if (prev.lastClaim === today) return prev; // already claimed today
  const nextStreak = prev.lastClaim === yesterdayKey(now) ? prev.streak + 1 : 1;
  return {
    ...prev,
    balance: prev.balance + bonusForStreak(nextStreak),
    lastClaim: today,
    streak: nextStreak,
  };
}

// Whether the daily bonus can be claimed right now.
export function canClaim(prev, now = new Date()) {
  return prev.lastClaim !== dayKey(now);
}

// What the next claim would be worth (continues the streak if claimed yesterday).
export function projectedStreak(prev, now = new Date()) {
  return prev.lastClaim === yesterdayKey(now) ? prev.streak + 1 : 1;
}
