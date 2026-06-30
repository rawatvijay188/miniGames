import { describe, it, expect } from "vitest";
import { mulberry32 } from "../../gdk";
import {
  buildDeck,
  shuffle,
  handValue,
  isSoft,
  isBlackjack,
  SUITS,
  RANKS,
  BLACKJACK,
} from "./deck.js";

const card = (rank, suit = "spades") => ({ rank, suit });

describe("buildDeck", () => {
  it("builds a standard 52-card deck", () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(SUITS.length * RANKS.length);
    expect(deck).toHaveLength(52);
  });

  it("has 52 distinct rank+suit cards", () => {
    const ids = new Set(buildDeck().map((c) => `${c.rank}-${c.suit}`));
    expect(ids.size).toBe(52);
  });
});

describe("shuffle", () => {
  it("preserves every card (no loss or duplication)", () => {
    const deck = buildDeck();
    const shuffled = shuffle(deck, mulberry32(1));
    expect(shuffled).toHaveLength(52);
    const ids = new Set(shuffled.map((c) => `${c.rank}-${c.suit}`));
    expect(ids.size).toBe(52);
  });

  it("does not mutate the input deck", () => {
    const deck = buildDeck();
    const snapshot = deck.map((c) => `${c.rank}-${c.suit}`);
    shuffle(deck, mulberry32(2));
    expect(deck.map((c) => `${c.rank}-${c.suit}`)).toEqual(snapshot);
  });

  it("is deterministic for a given seed", () => {
    const order = (seed) => shuffle(buildDeck(), mulberry32(seed)).map((c) => `${c.rank}-${c.suit}`);
    expect(order(42)).toEqual(order(42));
    expect(order(1)).not.toEqual(order(2));
  });
});

describe("handValue", () => {
  it("sums number and face cards", () => {
    expect(handValue([card("10"), card("7")])).toBe(17);
    expect(handValue([card("K"), card("Q")])).toBe(20);
    expect(handValue([card("J"), card("2"), card("5")])).toBe(17);
  });

  it("counts an ace as 11 when it does not bust", () => {
    expect(handValue([card("A"), card("9")])).toBe(20);
  });

  it("demotes aces to 1 to avoid busting", () => {
    expect(handValue([card("A"), card("9"), card("5")])).toBe(15); // 11->1
    expect(handValue([card("A"), card("A"), card("9")])).toBe(21); // one ace 11, one ace 1
  });

  it("handles many aces", () => {
    expect(handValue([card("A"), card("A"), card("A"), card("A")])).toBe(14);
  });
});

describe("isSoft", () => {
  it("is true when an ace still counts as 11", () => {
    expect(isSoft([card("A"), card("6")])).toBe(true);
  });

  it("is false once aces are forced to 1", () => {
    expect(isSoft([card("A"), card("9"), card("5")])).toBe(false);
  });

  it("is false with no ace", () => {
    expect(isSoft([card("10"), card("7")])).toBe(false);
  });
});

describe("isBlackjack", () => {
  it("is a natural 21 on exactly two cards", () => {
    expect(isBlackjack([card("A"), card("K")])).toBe(true);
    expect(isBlackjack([card("A"), card("10")])).toBe(true);
  });

  it("is not blackjack when 21 takes three cards", () => {
    expect(isBlackjack([card("7"), card("7"), card("7")])).toBe(false);
    expect(handValue([card("7"), card("7"), card("7")])).toBe(BLACKJACK);
  });

  it("is not blackjack below 21", () => {
    expect(isBlackjack([card("A"), card("9")])).toBe(false);
  });
});
