import { describe, it, expect } from "vitest";
import { mulberry32 } from "../../gdk";
import {
  COLS,
  ROWS,
  WIN_THRESHOLD,
  SYMBOLS,
  randomGrid,
  findWinningIds,
  countMatches,
  cascadePayout,
  collapse,
} from "./cascadeLogic.js";

const sym = (id) => SYMBOLS.find((s) => s.id === id);
// Build a COLS×ROWS grid (array of columns) from arrays of ids.
const grid = (cols) => cols.map((col) => col.map(sym));

describe("randomGrid", () => {
  it("builds COLS columns of ROWS symbols, deterministic per seed", () => {
    const g = randomGrid(mulberry32(2));
    expect(g).toHaveLength(COLS);
    expect(g[0]).toHaveLength(ROWS);
    expect(randomGrid(mulberry32(2))).toEqual(g);
  });
});

describe("findWinningIds", () => {
  it("returns ids appearing at least WIN_THRESHOLD times anywhere", () => {
    // 6 stars scattered across the grid, the rest a mix below threshold.
    const g = grid([
      ["star", "star", "moon", "planet"],
      ["star", "star", "comet", "rocket"],
      ["star", "star", "moon", "planet"],
      ["comet", "rocket", "alien", "comet"],
      ["moon", "planet", "rocket", "alien"],
    ]);
    expect(findWinningIds(g)).toEqual(["star"]);
    expect(WIN_THRESHOLD).toBe(6);
  });

  it("returns nothing when no symbol reaches the threshold", () => {
    const g = grid([
      ["star", "moon", "planet", "comet"],
      ["rocket", "alien", "star", "moon"],
      ["planet", "comet", "rocket", "alien"],
      ["star", "moon", "planet", "comet"],
      ["rocket", "alien", "star", "moon"],
    ]);
    expect(findWinningIds(g)).toEqual([]);
  });
});

describe("countMatches", () => {
  it("counts every cell matching the given ids", () => {
    const g = grid([
      ["star", "moon", "star", "moon"],
      ["star", "moon", "star", "moon"],
      ["planet", "planet", "planet", "planet"],
      ["comet", "comet", "comet", "comet"],
      ["rocket", "rocket", "rocket", "rocket"],
    ]);
    expect(countMatches(g, ["star"])).toBe(4);
    expect(countMatches(g, ["star", "moon"])).toBe(8);
  });
});

describe("cascadePayout", () => {
  it("sums matched symbol values × bet unit × multiplier", () => {
    const g = grid([
      ["alien", "alien", "moon", "moon"], // alien value 10
      ["alien", "moon", "moon", "moon"],
      ["moon", "moon", "moon", "moon"],
      ["moon", "moon", "moon", "moon"],
      ["moon", "moon", "moon", "moon"],
    ]);
    // 3 aliens * 10 = 30 points; * betUnit 2 * multiplier 3 = 180
    expect(cascadePayout(g, ["alien"], 2, 3)).toBe(180);
  });
});

describe("collapse", () => {
  it("removes winning symbols and refills from the top", () => {
    // Every column has stars on top and a surviving moon at the bottom.
    const g = grid([
      ["star", "star", "star", "moon"],
      ["star", "star", "star", "moon"],
      ["star", "star", "star", "moon"],
      ["star", "star", "star", "moon"],
      ["star", "star", "star", "moon"],
    ]);
    const next = collapse(g, ["star"], mulberry32(9));
    for (const col of next) {
      expect(col).toHaveLength(ROWS);
      // The surviving moon sinks to the bottom; the top three are freshly filled.
      expect(col[ROWS - 1].id).toBe("moon");
      for (const cell of col) expect(SYMBOLS).toContainEqual(cell);
    }
  });
});
