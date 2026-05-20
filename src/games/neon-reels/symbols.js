export const symbols = [
  {
    id: "wild",
    name: "Wild",
    weight: 4,
    svg: '<svg viewBox="0 0 100 100" role="img" aria-label="Wild star"><path fill="#f7bd4a" d="M50 5l11 29 31 2-24 20 8 30-26-17-26 17 8-30L8 36l31-2z"/><path fill="#11131a" d="M41 42h18v10H41zM36 58h28v9H36z"/></svg>'
  },
  {
    id: "seven",
    name: "Seven",
    weight: 6,
    text: "7",
    color: "#f35f76"
  },
  {
    id: "gem",
    name: "Gem",
    weight: 8,
    svg: '<svg viewBox="0 0 100 100" role="img" aria-label="Gem"><path fill="#49d7df" d="M21 30l13-15h32l13 15-29 55z"/><path fill="#9ff3f5" d="M34 15l16 70 16-70z"/><path fill="#11131a" opacity=".18" d="M21 30h58L50 85z"/></svg>'
  },
  {
    id: "bell",
    name: "Bell",
    weight: 11,
    svg: '<svg viewBox="0 0 100 100" role="img" aria-label="Bell"><path fill="#f7bd4a" d="M28 74h44l-6-12V40c0-13-8-22-16-22S34 27 34 40v22z"/><path fill="#d99127" d="M37 74h26c-2 7-7 11-13 11s-11-4-13-11z"/><path fill="#fff3bd" d="M42 28c-4 4-6 9-6 16v15h8V44c0-8 3-13 9-17-4-2-8-1-11 1z"/></svg>'
  },
  {
    id: "cherry",
    name: "Cherry",
    weight: 14,
    svg: '<svg viewBox="0 0 100 100" role="img" aria-label="Cherries"><path fill="none" stroke="#376c37" stroke-width="7" d="M39 53c10-24 25-31 38-35"/><path fill="#70d67a" d="M63 14c9-4 17-2 23 5-9 3-17 1-23-5z"/><circle cx="36" cy="65" r="17" fill="#f35f76"/><circle cx="59" cy="70" r="15" fill="#cc2e4b"/><circle cx="30" cy="58" r="5" fill="#ffb4bf"/></svg>'
  }
];

export function symbolById(id) {
  return symbols.find((symbol) => symbol.id === id);
}

export function weightedSymbol() {
  const total = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
  let pick = Math.random() * total;

  for (const symbol of symbols) {
    pick -= symbol.weight;
    if (pick <= 0) return symbol;
  }

  return symbols[symbols.length - 1];
}
