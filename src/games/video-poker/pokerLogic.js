export { buildDeck, shuffle } from "../blackjack/deck.js";

const RANK_ORDER = { "2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14 };

function rankVal(rank) { return RANK_ORDER[rank] ?? 0; }

export const HAND_RANKS = [
  { name: "Royal Flush",     mult: 800 },
  { name: "Straight Flush",  mult: 50  },
  { name: "Four of a Kind",  mult: 25  },
  { name: "Full House",      mult: 9   },
  { name: "Flush",           mult: 6   },
  { name: "Straight",        mult: 4   },
  { name: "Three of a Kind", mult: 3   },
  { name: "Two Pair",        mult: 2   },
  { name: "Jacks or Better", mult: 1   },
  { name: "No win",          mult: 0   },
];

export function evaluateHand(cards) {
  const ranks = cards.map((c) => rankVal(c.rank));
  const suits = cards.map((c) => c.suit);

  const freq = {};
  for (const r of ranks) freq[r] = (freq[r] || 0) + 1;
  const counts = Object.values(freq).sort((a, b) => b - a);

  const isFlush = new Set(suits).size === 1;
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);

  let isStraight = false;
  if (uniqueRanks.length === 5) {
    if (uniqueRanks[4] - uniqueRanks[0] === 4) {
      isStraight = true;
    } else if (uniqueRanks[4] === 14 && uniqueRanks[3] === 5 && uniqueRanks[0] === 2) {
      // A-2-3-4-5 wheel
      isStraight = true;
    }
  }

  const isRoyal = isFlush && isStraight && uniqueRanks[0] === 10 && uniqueRanks[4] === 14;

  if (isRoyal)                               return HAND_RANKS[0];
  if (isFlush && isStraight)                 return HAND_RANKS[1];
  if (counts[0] === 4)                       return HAND_RANKS[2];
  if (counts[0] === 3 && counts[1] === 2)    return HAND_RANKS[3];
  if (isFlush)                               return HAND_RANKS[4];
  if (isStraight)                            return HAND_RANKS[5];
  if (counts[0] === 3)                       return HAND_RANKS[6];
  if (counts[0] === 2 && counts[1] === 2)    return HAND_RANKS[7];

  if (counts[0] === 2) {
    const pairRank = Number(Object.keys(freq).find((k) => freq[k] === 2));
    if (pairRank >= 11) return HAND_RANKS[8]; // J Q K A pair
  }

  return HAND_RANKS[9];
}
