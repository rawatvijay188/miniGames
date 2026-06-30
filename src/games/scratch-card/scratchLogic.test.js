import { describe, it, expect } from "vitest";
import { mulberry32 } from "../../gdk";
import { evaluateCard, generateCard, SYMBOLS } from "./scratchLogic.js";

const sym = (id) => SYMBOLS.find((s) => s.id === id);
// Build a 9-cell card (row-major) from three rows of symbol ids.
const card = (...rows) => rows.flatMap((row) => row.map(sym));

describe("evaluateCard", () => {
  it("pays a matching row and reports its index", () => {
    const cells = card(
      ["diamond", "diamond", "diamond"],
      ["cherry", "lemon", "star"],
      ["bell", "bell", "lemon"]
    );
    const { totalMult, winRows } = evaluateCard(cells);
    expect(totalMult).toBe(sym("diamond").mult); // 50
    expect([...winRows]).toEqual([0]);
  });

  it("adds up multiple winning rows", () => {
    const cells = card(
      ["bell", "bell", "bell"],
      ["lemon", "cherry", "star"],
      ["cherry", "cherry", "cherry"]
    );
    const { totalMult, winRows } = evaluateCard(cells);
    expect(totalMult).toBe(sym("bell").mult + sym("cherry").mult); // 10 + 5
    expect([...winRows].sort()).toEqual([0, 2]);
  });

  it("pays nothing when no row matches", () => {
    const cells = card(
      ["diamond", "bell", "lemon"],
      ["cherry", "star", "diamond"],
      ["lemon", "moneybag", "bell"]
    );
    const { totalMult, winRows } = evaluateCard(cells);
    expect(totalMult).toBe(0);
    expect(winRows.size).toBe(0);
  });
});

describe("generateCard", () => {
  it("makes a 9-cell card of real symbols, deterministically per seed", () => {
    const a = generateCard(mulberry32(4));
    const b = generateCard(mulberry32(4));
    expect(a).toHaveLength(9);
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
    for (const cell of a) expect(SYMBOLS).toContainEqual(cell);
  });
});
