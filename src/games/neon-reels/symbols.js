export const symbols = [
  {
    id: "wild",
    name: "Wild",
    weight: 4,
    svg: '<svg viewBox="0 0 100 100" role="img" aria-label="Wild star" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="nr-wi" cx="40%" cy="30%"><stop offset="0%" stop-color="#ffe680"/><stop offset="55%" stop-color="#f7bd4a"/><stop offset="100%" stop-color="#8a5e00"/></radialGradient></defs><path d="M50 6l11 29 31 2-24 20 8 30-26-17-26 17 8-30L8 37l31-2z" fill="url(#nr-wi)" stroke="#c09000" stroke-width="1"/><ellipse cx="43" cy="29" rx="7" ry="3" fill="#fff" opacity="0.35" transform="rotate(-30,43,29)"/><rect x="40" y="64" width="20" height="8" rx="2" fill="#11131a"/><rect x="35" y="76" width="30" height="8" rx="2" fill="#11131a"/><text x="50" y="71" text-anchor="middle" fill="#f7bd4a" font-size="7" font-weight="900" font-family="sans-serif">WILD</text><text x="50" y="83" text-anchor="middle" fill="#f7bd4a" font-size="7" font-weight="900" font-family="sans-serif">WILD</text></svg>'
  },
  {
    id: "seven",
    name: "Seven",
    weight: 6,
    svg: '<svg viewBox="0 0 100 100" role="img" aria-label="Seven" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="nr-se" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#ff9090"/><stop offset="45%" stop-color="#f35f76"/><stop offset="100%" stop-color="#8a1a28"/></linearGradient></defs><text x="50" y="78" text-anchor="middle" font-size="78" font-weight="900" font-family="Impact,Arial Black,sans-serif" fill="url(#nr-se)" stroke="#8a1a28" stroke-width="2">7</text><text x="47" y="75" text-anchor="middle" font-size="78" font-weight="900" font-family="Impact,Arial Black,sans-serif" fill="#ff9090" opacity="0.2">7</text></svg>'
  },
  {
    id: "gem",
    name: "Gem",
    weight: 8,
    svg: '<svg viewBox="0 0 100 100" role="img" aria-label="Gem" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="nr-ge" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#a0f8ff"/><stop offset="45%" stop-color="#49d7df"/><stop offset="100%" stop-color="#0a5060"/></linearGradient><linearGradient id="nr-ge2" x1="0%" y1="0%" x2="60%" y2="100%"><stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="100%" stop-color="#49d7df" stop-opacity="0"/></linearGradient></defs><polygon points="50,8 84,42 50,92 16,42" fill="url(#nr-ge)" stroke="#a0f8ff" stroke-width="1.5"/><polygon points="50,8 84,42 50,92 16,42" fill="url(#nr-ge2)"/><line x1="16" y1="42" x2="84" y2="42" stroke="#a0f8ff" stroke-width="1" opacity="0.7"/><line x1="50" y1="8" x2="16" y2="42" stroke="#fff" stroke-width="0.8" opacity="0.35"/><line x1="50" y1="8" x2="84" y2="42" stroke="#fff" stroke-width="0.8" opacity="0.35"/><ellipse cx="40" cy="26" rx="9" ry="4" fill="#fff" opacity="0.4" transform="rotate(-25,40,26)"/></svg>'
  },
  {
    id: "bell",
    name: "Bell",
    weight: 11,
    svg: '<svg viewBox="0 0 100 100" role="img" aria-label="Bell" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="nr-be" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#ffe88a"/><stop offset="50%" stop-color="#f7bd4a"/><stop offset="100%" stop-color="#8a5800"/></linearGradient></defs><path d="M28 75h44l-6-12V40c0-13-8-22-16-22S34 27 34 40v23z" fill="url(#nr-be)" stroke="#c09000" stroke-width="1"/><path d="M37 75h26c-2 7-7 11-13 11s-11-4-13-11z" fill="#c07a00"/><ellipse cx="36" cy="32" rx="6" ry="10" fill="#fff8d0" opacity="0.35" transform="rotate(-15,36,32)"/><ellipse cx="50" cy="18" rx="4" ry="4" fill="#ffe88a" stroke="#c09000" stroke-width="1"/></svg>'
  },
  {
    id: "cherry",
    name: "Cherry",
    weight: 14,
    svg: '<svg viewBox="0 0 100 100" role="img" aria-label="Cherries" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="nr-ca" cx="38%" cy="30%"><stop offset="0%" stop-color="#ffaabf"/><stop offset="55%" stop-color="#f35f76"/><stop offset="100%" stop-color="#8b1a2a"/></radialGradient><radialGradient id="nr-cb" cx="38%" cy="30%"><stop offset="0%" stop-color="#ff7090"/><stop offset="55%" stop-color="#c0392b"/><stop offset="100%" stop-color="#6a0f1a"/></radialGradient></defs><path d="M38 52 Q48 22 70 16" fill="none" stroke="#2a5c2a" stroke-width="4" stroke-linecap="round"/><path d="M44 48 Q56 28 70 16" fill="none" stroke="#70d67a" stroke-width="2.5" stroke-linecap="round"/><path fill="#70d67a" d="M66 12c7-3 14-1 18 4-7 2-13 0-18-4z"/><circle cx="31" cy="67" r="19" fill="url(#nr-ca)"/><circle cx="58" cy="71" r="17" fill="url(#nr-cb)"/><ellipse cx="25" cy="59" rx="5" ry="3" fill="#ffccd5" opacity="0.7" transform="rotate(-20,25,59)"/><ellipse cx="52" cy="63" rx="4" ry="3" fill="#ff9eb0" opacity="0.6" transform="rotate(-20,52,63)"/></svg>'
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
