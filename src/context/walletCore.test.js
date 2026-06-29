import { describe, it, expect } from "vitest";
import {
  STARTING_BALANCE,
  DAILY_BASE,
  DAILY_STEP,
  STREAK_CAP,
  dayKey,
  yesterdayKey,
  bonusForStreak,
  sanitizeBalance,
  freshState,
  parseState,
  reduceSetBalance,
  reduceRefill,
  reduceClaimDaily,
  canClaim,
  projectedStreak,
} from "./walletCore.js";

// A fixed reference "now" so date-dependent logic is deterministic.
const NOW = new Date(2026, 5, 28, 12, 0, 0); // 28 June 2026, local time

describe("dayKey / yesterdayKey", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(dayKey(NOW)).toBe("2026-06-28");
  });

  it("yesterdayKey is the calendar day before", () => {
    expect(yesterdayKey(NOW)).toBe("2026-06-27");
  });

  it("yesterdayKey crosses month boundaries", () => {
    expect(yesterdayKey(new Date(2026, 6, 1, 9, 0, 0))).toBe("2026-06-30");
  });

  it("yesterdayKey crosses year boundaries", () => {
    expect(yesterdayKey(new Date(2026, 0, 1, 9, 0, 0))).toBe("2025-12-31");
  });
});

describe("bonusForStreak", () => {
  it("pays the base amount on day one", () => {
    expect(bonusForStreak(1)).toBe(DAILY_BASE); // 200
  });

  it("adds a step per consecutive day", () => {
    expect(bonusForStreak(2)).toBe(DAILY_BASE + DAILY_STEP); // 225
    expect(bonusForStreak(3)).toBe(DAILY_BASE + 2 * DAILY_STEP); // 250
  });

  it("plateaus at the streak cap", () => {
    const capped = DAILY_BASE + (STREAK_CAP - 1) * DAILY_STEP; // 350
    expect(bonusForStreak(STREAK_CAP)).toBe(capped);
    expect(bonusForStreak(STREAK_CAP + 5)).toBe(capped);
    expect(bonusForStreak(999)).toBe(capped);
  });

  it("treats zero/negative streaks as day one", () => {
    expect(bonusForStreak(0)).toBe(DAILY_BASE);
    expect(bonusForStreak(-3)).toBe(DAILY_BASE);
  });
});

describe("sanitizeBalance", () => {
  it("rounds to the nearest integer", () => {
    expect(sanitizeBalance(100.6, 0)).toBe(101);
    expect(sanitizeBalance(100.4, 0)).toBe(100);
  });

  it("clamps negatives to zero", () => {
    expect(sanitizeBalance(-50, 999)).toBe(0);
  });

  it("keeps a legitimate zero balance", () => {
    expect(sanitizeBalance(0, 999)).toBe(0);
  });

  it("falls back for non-finite or non-number values", () => {
    expect(sanitizeBalance(NaN, 777)).toBe(777);
    expect(sanitizeBalance(Infinity, 777)).toBe(777);
    expect(sanitizeBalance("abc", 777)).toBe(777);
    expect(sanitizeBalance(undefined, 777)).toBe(777);
  });
});

describe("parseState", () => {
  it("returns a fresh wallet for empty/missing storage", () => {
    expect(parseState(null)).toEqual(freshState());
    expect(parseState("")).toEqual(freshState());
  });

  it("returns a fresh wallet for corrupt JSON", () => {
    expect(parseState("{not valid json")).toEqual(freshState());
  });

  it("reads a valid stored wallet", () => {
    const raw = JSON.stringify({ balance: 4200, lastClaim: "2026-06-27", streak: 3 });
    expect(parseState(raw)).toEqual({ balance: 4200, lastClaim: "2026-06-27", streak: 3 });
  });

  it("sanitizes a negative stored balance", () => {
    const raw = JSON.stringify({ balance: -999, lastClaim: null, streak: 0 });
    expect(parseState(raw).balance).toBe(0);
  });

  it("defaults invalid fields without throwing", () => {
    const raw = JSON.stringify({ balance: "lots", lastClaim: 12345, streak: "many" });
    expect(parseState(raw)).toEqual({
      balance: STARTING_BALANCE,
      lastClaim: null,
      streak: 0,
    });
  });
});

describe("reduceSetBalance", () => {
  const prev = { balance: 500, lastClaim: null, streak: 0 };

  it("sets an absolute value", () => {
    expect(reduceSetBalance(prev, 750).balance).toBe(750);
  });

  it("accepts an updater function", () => {
    expect(reduceSetBalance(prev, (b) => b - 200).balance).toBe(300);
  });

  it("clamps a negative result to zero (can't overdraw)", () => {
    expect(reduceSetBalance(prev, (b) => b - 9999).balance).toBe(0);
  });

  it("rounds fractional results", () => {
    expect(reduceSetBalance(prev, 12.7).balance).toBe(13);
  });

  it("returns the same reference when unchanged", () => {
    expect(reduceSetBalance(prev, 500)).toBe(prev);
  });

  it("does not mutate other wallet fields", () => {
    const start = { balance: 500, lastClaim: "2026-06-27", streak: 4 };
    const next = reduceSetBalance(start, 600);
    expect(next.lastClaim).toBe("2026-06-27");
    expect(next.streak).toBe(4);
  });
});

describe("reduceRefill", () => {
  it("tops a broke wallet up to the baseline", () => {
    const next = reduceRefill({ balance: 0, lastClaim: null, streak: 0 });
    expect(next.balance).toBe(STARTING_BALANCE);
  });

  it("never reduces a healthy balance (no coin farming)", () => {
    const rich = { balance: 50000, lastClaim: null, streak: 0 };
    expect(reduceRefill(rich)).toBe(rich); // same ref, unchanged
  });

  it("is a no-op exactly at the baseline", () => {
    const atBase = { balance: STARTING_BALANCE, lastClaim: null, streak: 0 };
    expect(reduceRefill(atBase)).toBe(atBase);
  });
});

describe("reduceClaimDaily", () => {
  it("grants the base bonus and starts a streak on first claim", () => {
    const prev = { balance: 1000, lastClaim: null, streak: 0 };
    const next = reduceClaimDaily(prev, NOW);
    expect(next.streak).toBe(1);
    expect(next.balance).toBe(1000 + DAILY_BASE);
    expect(next.lastClaim).toBe("2026-06-28");
  });

  it("continues the streak when the last claim was yesterday", () => {
    const prev = { balance: 1000, lastClaim: yesterdayKey(NOW), streak: 3 };
    const next = reduceClaimDaily(prev, NOW);
    expect(next.streak).toBe(4);
    expect(next.balance).toBe(1000 + bonusForStreak(4));
  });

  it("resets the streak to 1 after a missed day", () => {
    const prev = { balance: 1000, lastClaim: "2026-06-25", streak: 5 }; // 3-day gap
    const next = reduceClaimDaily(prev, NOW);
    expect(next.streak).toBe(1);
    expect(next.balance).toBe(1000 + DAILY_BASE);
  });

  it("is a no-op when already claimed today (no double dipping)", () => {
    const prev = { balance: 1000, lastClaim: dayKey(NOW), streak: 2 };
    expect(reduceClaimDaily(prev, NOW)).toBe(prev); // same ref
  });

  it("respects the streak cap on the payout but keeps counting the streak", () => {
    const prev = { balance: 0, lastClaim: yesterdayKey(NOW), streak: STREAK_CAP + 2 };
    const next = reduceClaimDaily(prev, NOW);
    expect(next.streak).toBe(STREAK_CAP + 3);
    expect(next.balance).toBe(bonusForStreak(STREAK_CAP)); // payout plateaued
  });
});

describe("canClaim / projectedStreak", () => {
  it("canClaim is false only when already claimed today", () => {
    expect(canClaim({ lastClaim: dayKey(NOW) }, NOW)).toBe(false);
    expect(canClaim({ lastClaim: yesterdayKey(NOW) }, NOW)).toBe(true);
    expect(canClaim({ lastClaim: null }, NOW)).toBe(true);
  });

  it("projectedStreak continues from yesterday, else resets to 1", () => {
    expect(projectedStreak({ lastClaim: yesterdayKey(NOW), streak: 4 }, NOW)).toBe(5);
    expect(projectedStreak({ lastClaim: "2026-06-20", streak: 4 }, NOW)).toBe(1);
    expect(projectedStreak({ lastClaim: null, streak: 0 }, NOW)).toBe(1);
  });
});
