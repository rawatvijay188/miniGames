import { describe, it, expect } from "vitest";
import { clampBet, DEFAULT_BET } from "./bet.js";

describe("clampBet", () => {
  const range = { min: 10, max: 100 };

  it("keeps a bet within range", () => {
    expect(clampBet(50, 1000, range)).toBe(50);
  });

  it("clamps below min up to min", () => {
    expect(clampBet(5, 1000, range)).toBe(10);
  });

  it("clamps above max down to max", () => {
    expect(clampBet(500, 1000, range)).toBe(100);
  });

  it("never exceeds the affordable balance", () => {
    expect(clampBet(100, 40, range)).toBe(40);
  });

  it("falls back to min when balance is below min", () => {
    expect(clampBet(100, 3, range)).toBe(10);
  });

  it("uses DEFAULT_BET range when none supplied", () => {
    expect(clampBet(9999, 99999)).toBe(DEFAULT_BET.max);
  });
});
