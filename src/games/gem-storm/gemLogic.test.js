import { describe, it, expect } from "vitest";
import { mulberry32 } from "../../gdk";
import { REELS, ROWS, GEMS, WILD, randomGrid, expandWilds, evaluate } from "./gemLogic.js";

const byId = (id) => (id === "wild" ? WILD : GEMS.find((g) => g.id === id));
// Build a reel-major grid (grid[reel][row]) from an array of visual rows.
const fromRows = (rows) =>
  Array.from({ length: REELS }, (_, reel) => rows.map((row) => byId(row[reel])));

describe("randomGrid", () => {
  it("builds REELS columns of ROWS symbols, deterministic per seed", () => {
    const g = randomGrid(mulberry32(3));
    expect(g).toHaveLength(REELS);
    expect(g[0]).toHaveLength(ROWS);
    expect(randomGrid(mulberry32(3))).toEqual(g);
  });
});

describe("expandWilds", () => {
  it("turns any reel containing a wild into a full wild reel", () => {
    const g = fromRows([
      ["ruby", "ruby", "wild", "topaz", "ruby"],
      ["ruby", "ruby", "ruby", "topaz", "ruby"],
      ["ruby", "ruby", "ruby", "topaz", "ruby"],
    ]);
    const { grid, expandedCols } = expandWilds(g);
    expect([...expandedCols]).toEqual([2]);
    expect(grid[2].every((s) => s.wild)).toBe(true);
    // Untouched reels are unchanged.
    expect(grid[0].every((s) => s.id === "ruby")).toBe(true);
  });

  it("reports no expansion when there are no wilds", () => {
    const g = fromRows([
      ["ruby", "sapphire", "topaz", "emerald", "diamond"],
      ["ruby", "sapphire", "topaz", "emerald", "diamond"],
      ["ruby", "sapphire", "topaz", "emerald", "diamond"],
    ]);
    expect(expandWilds(g).expandedCols.size).toBe(0);
  });
});

describe("evaluate", () => {
  it("pays a run of 3+ matching gems from the left", () => {
    const g = fromRows([
      ["ruby", "ruby", "ruby", "sapphire", "topaz"], // run of 3 rubies
      ["ruby", "sapphire", "ruby", "sapphire", "ruby"], // alternating → no run
      ["sapphire", "ruby", "sapphire", "ruby", "sapphire"], // alternating → no run
    ]);
    const ruby = GEMS.find((x) => x.id === "ruby");
    const { total, winningReels } = evaluate(g, 1);
    expect(total).toBe(ruby.value * 3); // 6 * 3
    expect(winningReels.has("0-0")).toBe(true);
    expect(winningReels.has("2-0")).toBe(true);
  });

  it("lets wilds substitute and count toward the run", () => {
    const g = fromRows([
      ["wild", "ruby", "ruby", "topaz", "sapphire"], // wild + 2 rubies = run of 3
      ["sapphire", "topaz", "emerald", "diamond", "topaz"],
      ["topaz", "emerald", "diamond", "topaz", "emerald"],
    ]);
    const ruby = GEMS.find((x) => x.id === "ruby");
    const { total, winningReels } = evaluate(g, 1);
    expect(total).toBe(ruby.value * 3);
    expect(winningReels.has("0-0")).toBe(true); // the leading wild reel counts
  });

  it("pays nothing when no row has a 3-run", () => {
    const g = fromRows([
      ["ruby", "sapphire", "ruby", "sapphire", "ruby"],
      ["sapphire", "ruby", "sapphire", "ruby", "sapphire"],
      ["ruby", "sapphire", "ruby", "sapphire", "ruby"],
    ]);
    expect(evaluate(g, 1).total).toBe(0);
  });
});
