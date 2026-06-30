import { describe, it, expect } from "vitest";
import { mulberry32 } from "../../gdk";
import { rollDie } from "./diceConfig.js";

describe("rollDie", () => {
  it("only ever rolls 1–6", () => {
    const rng = mulberry32(7);
    const seen = new Set();
    for (let i = 0; i < 500; i += 1) {
      const v = rollDie(rng);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("is deterministic for a given seed", () => {
    const a = mulberry32(3);
    const b = mulberry32(3);
    expect([rollDie(a), rollDie(a), rollDie(a)]).toEqual([rollDie(b), rollDie(b), rollDie(b)]);
  });
});
