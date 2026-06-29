import { describe, it, expect } from "vitest";
import { settle, settleResult } from "./payout.js";

describe("settle", () => {
  it("treats multiplier 0 as a loss", () => {
    const r = settle({ bet: 20, multiplier: 0 });
    expect(r).toMatchObject({ outcome: "lose", payout: 0, net: -20, won: 0 });
  });

  it("treats multiplier 1 as a push", () => {
    const r = settle({ bet: 20, multiplier: 1 });
    expect(r).toMatchObject({ outcome: "push", payout: 20, net: 0, won: 0 });
  });

  it("treats multiplier 2 as an even-money win", () => {
    const r = settle({ bet: 20, multiplier: 2 });
    expect(r).toMatchObject({ outcome: "win", payout: 40, net: 20, won: 20 });
  });

  it("handles large multipliers", () => {
    const r = settle({ bet: 10, multiplier: 50 });
    expect(r).toMatchObject({ outcome: "win", payout: 500, won: 490 });
  });

  it("rounds fractional payouts (e.g. 2.5x blackjack)", () => {
    const r = settle({ bet: 15, multiplier: 2.5 });
    expect(r.payout).toBe(38); // round(37.5)
  });
});

describe("settleResult", () => {
  it("maps won=true to an even-money win", () => {
    expect(settleResult({ bet: 20, won: true }).net).toBe(20);
  });

  it("maps won=false to a loss", () => {
    expect(settleResult({ bet: 20, won: false }).net).toBe(-20);
  });

  it("maps push to a returned stake", () => {
    expect(settleResult({ bet: 20, won: false, push: true }).net).toBe(0);
  });
});
