function money(value) {
  return `$${value}`;
}

function weightedSymbol() {
  const total = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
  let pick = Math.random() * total;

  for (const symbol of symbols) {
    pick -= symbol.weight;
    if (pick <= 0) return symbol;
  }

  return symbols[symbols.length - 1];
}

function symbolById(id) {
  return symbols.find((symbol) => symbol.id === id);
}

function renderSymbol(reel, symbol) {
  const slot = reel.querySelector(".symbol");
  slot.style.color = symbol.color || "";
  slot.innerHTML = symbol.svg || symbol.text;
  slot.setAttribute("aria-label", symbol.name);
}