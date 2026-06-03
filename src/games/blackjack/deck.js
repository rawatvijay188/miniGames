export const SUITS = [
  { id: "spades", symbol: "♠", color: "ink" },
  { id: "hearts", symbol: "♥", color: "rose" },
  { id: "diamonds", symbol: "♦", color: "rose" },
  { id: "clubs", symbol: "♣", color: "ink" }
];

export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export const DEALER_STANDS_ON = 17;
export const BLACKJACK = 21;

export function buildDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit: suit.id, symbol: suit.symbol, color: suit.color });
    }
  }
  return deck;
}

export function shuffle(deck) {
  const cards = [...deck];
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function cardValue(rank) {
  if (rank === "A") return 11;
  if (rank === "K" || rank === "Q" || rank === "J") return 10;
  return Number(rank);
}

// Returns the best hand total, counting aces as 1 when 11 would bust.
export function handValue(cards) {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    total += cardValue(card.rank);
    if (card.rank === "A") aces += 1;
  }

  while (total > BLACKJACK && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

// A "soft" hand has an ace still counted as 11.
export function isSoft(cards) {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    total += cardValue(card.rank);
    if (card.rank === "A") aces += 1;
  }
  return aces > 0 && total <= BLACKJACK;
}

export function isBlackjack(cards) {
  return cards.length === 2 && handValue(cards) === BLACKJACK;
}
