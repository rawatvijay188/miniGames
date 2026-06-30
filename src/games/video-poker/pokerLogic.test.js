import { describe, it, expect } from "vitest";
import { evaluateHand, HAND_RANKS } from "./pokerLogic.js";

// Helper: card from "rank suit" e.g. card("A", "hearts").
const c = (rank, suit) => ({ rank, suit });
const named = (name) => HAND_RANKS.find((h) => h.name === name);

describe("evaluateHand", () => {
  it("ranks a Royal Flush", () => {
    const hand = [c("10", "s"), c("J", "s"), c("Q", "s"), c("K", "s"), c("A", "s")];
    expect(evaluateHand(hand)).toEqual(named("Royal Flush"));
  });

  it("ranks a Straight Flush", () => {
    const hand = [c("5", "h"), c("6", "h"), c("7", "h"), c("8", "h"), c("9", "h")];
    expect(evaluateHand(hand)).toEqual(named("Straight Flush"));
  });

  it("ranks Four of a Kind", () => {
    const hand = [c("7", "s"), c("7", "h"), c("7", "d"), c("7", "c"), c("K", "s")];
    expect(evaluateHand(hand)).toEqual(named("Four of a Kind"));
  });

  it("ranks a Full House", () => {
    const hand = [c("K", "s"), c("K", "h"), c("K", "d"), c("3", "c"), c("3", "s")];
    expect(evaluateHand(hand)).toEqual(named("Full House"));
  });

  it("ranks a Flush (same suit, not sequential)", () => {
    const hand = [c("2", "d"), c("5", "d"), c("9", "d"), c("J", "d"), c("K", "d")];
    expect(evaluateHand(hand)).toEqual(named("Flush"));
  });

  it("ranks a Straight (mixed suits)", () => {
    const hand = [c("4", "s"), c("5", "h"), c("6", "d"), c("7", "c"), c("8", "s")];
    expect(evaluateHand(hand)).toEqual(named("Straight"));
  });

  it("treats A-2-3-4-5 as a wheel Straight", () => {
    const hand = [c("A", "s"), c("2", "h"), c("3", "d"), c("4", "c"), c("5", "s")];
    expect(evaluateHand(hand)).toEqual(named("Straight"));
  });

  it("ranks Three of a Kind", () => {
    const hand = [c("8", "s"), c("8", "h"), c("8", "d"), c("2", "c"), c("4", "s")];
    expect(evaluateHand(hand)).toEqual(named("Three of a Kind"));
  });

  it("ranks Two Pair", () => {
    const hand = [c("K", "s"), c("K", "h"), c("3", "d"), c("3", "c"), c("7", "s")];
    expect(evaluateHand(hand)).toEqual(named("Two Pair"));
  });

  it("pays a pair of Jacks or better", () => {
    const hand = [c("J", "s"), c("J", "h"), c("3", "d"), c("5", "c"), c("8", "s")];
    expect(evaluateHand(hand)).toEqual(named("Jacks or Better"));
  });

  it("does not pay a low pair", () => {
    const hand = [c("5", "s"), c("5", "h"), c("2", "d"), c("8", "c"), c("K", "s")];
    expect(evaluateHand(hand)).toEqual(named("No win"));
  });

  it("does not pay an unconnected high card hand", () => {
    const hand = [c("2", "s"), c("5", "h"), c("9", "d"), c("J", "c"), c("K", "s")];
    expect(evaluateHand(hand)).toEqual(named("No win"));
  });
});
