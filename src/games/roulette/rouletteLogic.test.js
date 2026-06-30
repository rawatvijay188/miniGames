import { describe, it, expect } from "vitest";
import { mulberry32 } from "../../gdk";
import { numColor, settle, spinWheel, NUMBERS } from "./rouletteLogic.js";

describe("numColor", () => {
  it("calls 0 green", () => {
    expect(numColor(0)).toBe("green");
  });

  it("classifies the standard red numbers", () => {
    for (const n of [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]) {
      expect(numColor(n)).toBe("red");
    }
  });

  it("classifies the rest as black", () => {
    expect(numColor(2)).toBe("black");
    expect(numColor(4)).toBe("black");
    expect(numColor(35)).toBe("black");
  });
});

describe("settle (straight-up number bet)", () => {
  it("pays 35:1 on an exact hit", () => {
    expect(settle(17, 17)).toBe(35);
  });

  it("loses on a miss", () => {
    expect(settle(17, 18)).toBe(-1);
  });
});

describe("settle (outside bets)", () => {
  it("settles red / black by color", () => {
    expect(settle("red", 1)).toBe(1);
    expect(settle("red", 2)).toBe(-1);
    expect(settle("black", 2)).toBe(1);
    expect(settle("black", 1)).toBe(-1);
  });

  it("settles odd / even, excluding 0", () => {
    expect(settle("odd", 3)).toBe(1);
    expect(settle("odd", 2)).toBe(-1);
    expect(settle("even", 2)).toBe(1);
    expect(settle("even", 0)).toBe(-1);
    expect(settle("odd", 0)).toBe(-1);
  });

  it("settles low (1–18) and high (19–36)", () => {
    expect(settle("low", 18)).toBe(1);
    expect(settle("low", 19)).toBe(-1);
    expect(settle("high", 19)).toBe(1);
    expect(settle("high", 18)).toBe(-1);
  });

  it("loses every outside bet when 0 hits", () => {
    for (const bet of ["red", "black", "odd", "even", "low", "high"]) {
      expect(settle(bet, 0)).toBe(-1);
    }
  });
});

describe("spinWheel", () => {
  it("returns a number on the European wheel (0–36)", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 500; i += 1) {
      const n = spinWheel(rng);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(36);
    }
  });

  it("is deterministic for a given seed", () => {
    expect(spinWheel(mulberry32(8))).toBe(spinWheel(mulberry32(8)));
  });

  it("can land on every pocket over many spins", () => {
    const rng = mulberry32(123);
    const seen = new Set();
    for (let i = 0; i < 5000; i += 1) seen.add(spinWheel(rng));
    expect(seen.size).toBe(NUMBERS.length); // all 37 pockets
  });
});
