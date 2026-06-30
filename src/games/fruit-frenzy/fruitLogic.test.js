import { describe, it, expect } from "vitest";
import { mulberry32 } from "../../gdk";
import {
  COLS,
  ROWS,
  MIN_CLUSTER,
  FRUITS,
  randomGrid,
  findClusters,
  clusterPayout,
  collapse,
} from "./fruitLogic.js";

const fruit = (id) => FRUITS.find((f) => f.id === id);
// Build a ROWS×COLS grid (row-major) from a grid of single-letter ids.
const KEY = { c: "cherry", l: "lemon", g: "grape", w: "watermelon", s: "strawberry", b: "banana" };
const grid = (rows) => rows.map((row) => [...row].map((ch) => fruit(KEY[ch])));

describe("randomGrid", () => {
  it("builds a ROWS×COLS grid of real fruit, deterministic per seed", () => {
    const g = randomGrid(mulberry32(1));
    expect(g).toHaveLength(ROWS);
    expect(g[0]).toHaveLength(COLS);
    expect(randomGrid(mulberry32(1))).toEqual(g);
    for (const row of g) for (const cell of row) expect(FRUITS).toContainEqual(cell);
  });
});

describe("findClusters", () => {
  it("finds a connected group of MIN_CLUSTER or more", () => {
    // A 2×3 block of cherries (6 cells) plus filler that forms no other cluster.
    const g = grid([
      "ccclgl",
      "ccclgl",
      "lglglg",
      "glglgl",
      "lglglg",
    ]);
    const clusters = findClusters(g);
    const cherry = clusters.find((cl) => cl.id === "cherry");
    expect(cherry).toBeDefined();
    expect(cherry.cells.length).toBe(6);
    expect(clusters.every((cl) => cl.cells.length >= MIN_CLUSTER)).toBe(true);
  });

  it("ignores groups smaller than MIN_CLUSTER", () => {
    // Isolated pairs/triples, nothing reaches 5.
    const g = grid([
      "clclcl",
      "lclclc",
      "clclcl",
      "lclclc",
      "clclcl",
    ]);
    expect(findClusters(g)).toEqual([]);
  });

  it("does not connect diagonally", () => {
    const g = grid([
      "cllllc",
      "lcllll",
      "llclll",
      "lllcll",
      "llllcl",
    ]);
    // The cherries are only diagonal neighbours → no cherry cluster.
    expect(findClusters(g).some((cl) => cl.id === "cherry")).toBe(false);
  });
});

describe("clusterPayout", () => {
  it("scales with fruit value, cluster size, and bet unit", () => {
    const clusters = [{ id: "banana", value: 8, cells: new Array(6).fill([0, 0]) }];
    // 8 * 6 * 2 = 96
    expect(clusterPayout(clusters, 2)).toBe(96);
  });

  it("sums multiple clusters", () => {
    const clusters = [
      { id: "cherry", value: 2, cells: new Array(5).fill([0, 0]) }, // 10
      { id: "lemon", value: 3, cells: new Array(5).fill([0, 0]) },  // 15
    ];
    expect(clusterPayout(clusters, 1)).toBe(25);
  });
});

describe("collapse", () => {
  it("removes clustered cells and drops survivors to the bottom", () => {
    const g = grid([
      "cccccc",
      "llllll",
      "gggggg",
      "wwwwww",
      "bbbbbb",
    ]);
    // Remove the entire top row of cherries.
    const clusters = [{ id: "cherry", value: 2, cells: Array.from({ length: COLS }, (_, c) => [0, c]) }];
    const next = collapse(g, clusters, mulberry32(5));
    // Survivors keep their order and sit at the bottom; column 0 bottom is banana.
    expect(next[ROWS - 1][0].id).toBe("banana");
    // The top row is freshly filled with a valid fruit.
    expect(FRUITS).toContainEqual(next[0][0]);
    // No cell is null.
    expect(next.flat().every(Boolean)).toBe(true);
  });
});
