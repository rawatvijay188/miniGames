import { describe, it, expect } from "vitest";
import { mulberry32, randInt, pick, weightedPick, shuffle, chance } from "./rng.js";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces floats in [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i += 1) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("differs across seeds", () => {
    expect(mulberry32(1)()).not.toEqual(mulberry32(2)());
  });
});

describe("randInt", () => {
  it("is inclusive of both bounds", () => {
    const rng = mulberry32(99);
    const seen = new Set();
    for (let i = 0; i < 500; i += 1) seen.add(randInt(1, 6, rng));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("returns the bound when min === max", () => {
    expect(randInt(5, 5, mulberry32(3))).toBe(5);
  });
});

describe("pick", () => {
  it("returns an element from the array", () => {
    const items = ["a", "b", "c"];
    expect(items).toContain(pick(items, mulberry32(11)));
  });
});

describe("weightedPick", () => {
  it("favours heavier weights", () => {
    const items = [
      { id: "rare", weight: 1 },
      { id: "common", weight: 99 },
    ];
    const rng = mulberry32(5);
    let common = 0;
    for (let i = 0; i < 1000; i += 1) {
      if (weightedPick(items, (it) => it.weight, rng).id === "common") common += 1;
    }
    expect(common).toBeGreaterThan(900);
  });

  it("can use a default weight property", () => {
    const only = [{ id: "x", weight: 3 }];
    expect(weightedPick(only).id).toBe("x");
  });
});

describe("shuffle", () => {
  it("does not mutate the input and preserves elements", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = input.slice();
    const out = shuffle(input, mulberry32(8));
    expect(input).toEqual(copy);
    expect(out.slice().sort((a, b) => a - b)).toEqual(copy);
  });
});

describe("chance", () => {
  it("respects the probability roughly", () => {
    const rng = mulberry32(13);
    let hits = 0;
    for (let i = 0; i < 1000; i += 1) if (chance(0.3, rng)) hits += 1;
    expect(hits).toBeGreaterThan(200);
    expect(hits).toBeLessThan(400);
  });

  it("never fires at p=0 and always fires at p=1", () => {
    expect(chance(0, mulberry32(1))).toBe(false);
    expect(chance(1, mulberry32(1))).toBe(true);
  });
});
