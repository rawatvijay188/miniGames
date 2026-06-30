import { describe, it, expect } from "vitest";
import { mulberry32 } from "../../gdk";
import { drawNumbers, calcPayout, NUMBERS, DRAW_COUNT, GRID_SIZE } from "./kenoLogic.js";

describe("drawNumbers", () => {
  it("draws DRAW_COUNT distinct numbers within the grid", () => {
    const drawn = drawNumbers(mulberry32(7));
    expect(drawn).toHaveLength(DRAW_COUNT);
    expect(new Set(drawn).size).toBe(DRAW_COUNT);
    for (const n of drawn) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(GRID_SIZE);
    }
  });

  it("is deterministic for a given seed", () => {
    expect(drawNumbers(mulberry32(3))).toEqual(drawNumbers(mulberry32(3)));
    expect(drawNumbers(mulberry32(1))).not.toEqual(drawNumbers(mulberry32(2)));
  });

  it("draws only from the valid number pool", () => {
    const pool = new Set(NUMBERS);
    for (const n of drawNumbers(mulberry32(99))) expect(pool.has(n)).toBe(true);
  });
});

describe("calcPayout", () => {
  it("counts hits as picks present in the draw", () => {
    const { hits } = calcPayout([1, 2, 3, 4, 5], [1, 2, 3, 20, 21, 22], 1);
    expect(hits).toBe(3);
  });

  it("pays the top prize for a full match", () => {
    const drawn = [1, 2, 3, 4, 5];
    expect(calcPayout([1, 2, 3, 4, 5], drawn, 1)).toEqual({ hits: 5, payout: 500 });
  });

  it("pays the tier matching the hit count", () => {
    const drawn = [1, 2, 3, 4, 99];
    expect(calcPayout([1, 2, 3, 4, 5], drawn, 1)).toEqual({ hits: 4, payout: 15 });
  });

  it("pays nothing when hits fall below the lowest paying tier", () => {
    const drawn = [1, 2, 90, 91, 92];
    expect(calcPayout([1, 2, 3, 4, 5], drawn, 1)).toEqual({ hits: 2, payout: 0 });
  });

  it("scales the payout by the bet unit", () => {
    const drawn = [1, 2];
    expect(calcPayout([1, 2], drawn, 5)).toEqual({ hits: 2, payout: 50 }); // 10x * 5
  });

  it("returns zero for an unknown pick count", () => {
    expect(calcPayout([1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3], 1).payout).toBe(0);
  });
});
