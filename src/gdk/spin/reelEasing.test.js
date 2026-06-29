import { describe, it, expect } from "vitest";
import {
  cellDuration,
  totalSpinTime,
  defaultSpinSteps,
  CELL_SLOW_MS,
  CELL_FAST_MS,
} from "./reelEasing.js";

describe("cellDuration", () => {
  it("returns 0 for a single cell (no travel)", () => {
    expect(cellDuration(0, 1)).toBe(0);
  });

  it("is slowest at the ends and fastest in the middle", () => {
    const cells = 11;
    const start = cellDuration(0, cells);
    const middle = cellDuration(5, cells);
    const end = cellDuration(cells - 1, cells);
    expect(start).toBeCloseTo(CELL_SLOW_MS);
    expect(end).toBeCloseTo(CELL_SLOW_MS);
    expect(middle).toBeCloseTo(CELL_FAST_MS);
    expect(middle).toBeLessThan(start);
  });

  it("never exceeds the slow bound or drops below the fast bound", () => {
    for (let step = 0; step < 20; step += 1) {
      const d = cellDuration(step, 20);
      expect(d).toBeLessThanOrEqual(CELL_SLOW_MS + 0.001);
      expect(d).toBeGreaterThanOrEqual(CELL_FAST_MS - 0.001);
    }
  });
});

describe("totalSpinTime", () => {
  it("sums every cell's duration", () => {
    const cells = 8;
    let expected = 0;
    for (let s = 0; s < cells; s += 1) expected += cellDuration(s, cells);
    expect(totalSpinTime(cells)).toBeCloseTo(expected);
  });
});

describe("defaultSpinSteps", () => {
  it("gives each later reel a longer spin so they land left-to-right", () => {
    const steps = defaultSpinSteps(4);
    expect(steps).toHaveLength(4);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });
});
