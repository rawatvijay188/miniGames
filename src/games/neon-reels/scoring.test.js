import { describe, it, expect } from "vitest";
import { scoreReels } from "./scoring.js";

const reels = (...ids) => ids.map((id) => ({ id }));

describe("scoreReels", () => {
  it("pays the most for three wilds", () => {
    expect(scoreReels(reels("wild", "wild", "wild"))).toEqual({ multiplier: 10, label: "Triple Wild" });
  });

  it("pays lucky sevens", () => {
    expect(scoreReels(reels("seven", "seven", "seven"))).toEqual({ multiplier: 8, label: "Lucky Sevens" });
  });

  it("pays a crystal (gem) match", () => {
    expect(scoreReels(reels("gem", "gem", "gem"))).toEqual({ multiplier: 6, label: "Crystal Match" });
  });

  it("pays a generic triple for any other three of a kind", () => {
    expect(scoreReels(reels("bell", "bell", "bell"))).toEqual({ multiplier: 4, label: "Triple Match" });
  });

  it("pays a pair win for any two of a kind", () => {
    expect(scoreReels(reels("cherry", "cherry", "bell"))).toEqual({ multiplier: 2, label: "Pair Win" });
  });

  it("pays nothing with no matches", () => {
    expect(scoreReels(reels("cherry", "bell", "gem"))).toEqual({ multiplier: 0, label: "No win" });
  });

  it("prefers the wild jackpot over the generic triple", () => {
    // three wilds is also "three of a kind"; the specific rule must win.
    expect(scoreReels(reels("wild", "wild", "wild")).multiplier).toBe(10);
  });
});
