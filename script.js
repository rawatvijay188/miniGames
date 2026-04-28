const symbols = [
  {
    id: "wild",
    name: "Wild",
    weight: 4,
    svg: `<svg viewBox="0 0 100 100" role="img" aria-label="Wild star"><path fill="#f7bd4a" d="M50 5l11 29 31 2-24 20 8 30-26-17-26 17 8-30L8 36l31-2z"/><path fill="#11131a" d="M41 42h18v10H41zM36 58h28v9H36z"/></svg>`
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
    svg: `<svg viewBox="0 0 100 100" role="img" aria-label="Gem"><path fill="#49d7df" d="M21 30l13-15h32l13 15-29 55z"/><path fill="#9ff3f5" d="M34 15l16 70 16-70z"/><path fill="#11131a" opacity=".18" d="M21 30h58L50 85z"/></svg>`
  },
  {
    id: "bell",
    name: "Bell",
    weight: 11,
    svg: `<svg viewBox="0 0 100 100" role="img" aria-label="Bell"><path fill="#f7bd4a" d="M28 74h44l-6-12V40c0-13-8-22-16-22S34 27 34 40v22z"/><path fill="#d99127" d="M37 74h26c-2 7-7 11-13 11s-11-4-13-11z"/><path fill="#fff3bd" d="M42 28c-4 4-6 9-6 16v15h8V44c0-8 3-13 9-17-4-2-8-1-11 1z"/></svg>`
  },
  {
    id: "cherry",
    name: "Cherry",
    weight: 14,
    svg: `<svg viewBox="0 0 100 100" role="img" aria-label="Cherries"><path fill="none" stroke="#376c37" stroke-width="7" d="M39 53c10-24 25-31 38-35"/><path fill="#70d67a" d="M63 14c9-4 17-2 23 5-9 3-17 1-23-5z"/><circle cx="36" cy="65" r="17" fill="#f35f76"/><circle cx="59" cy="70" r="15" fill="#cc2e4b"/><circle cx="30" cy="58" r="5" fill="#ffb4bf"/></svg>`
  }
];

const reels = document.querySelector("#reels");
const balanceEl = document.querySelector("#balance");
const betEl = document.querySelector("#bet");
const lastWinEl = document.querySelector("#lastWin");
const banner = document.querySelector("#winBanner");
const spinButton = document.querySelector("#spinButton");
const slider = document.querySelector("#betSlider");
const betDown = document.querySelector("#betDown");
const betUp = document.querySelector("#betUp");
const soundToggle = document.querySelector("#soundToggle");
const forceButtons = Array.from(document.querySelectorAll("[data-force]"));

let balance = 500;
let bet = Number(slider.value);
let spinning = false;
let soundOn = true;
let audioContext;
let forcedResult = null;

const reelEls = Array.from({ length: 3 }, () => {
  const reel = document.createElement("div");
  reel.className = "reel";
  reel.innerHTML = `<div class="symbol"></div>`;
  reels.appendChild(reel);
  return reel;
});

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

function updateMeters() {
  balanceEl.textContent = money(balance);
  betEl.textContent = money(bet);
  slider.value = String(bet);
  betDown.disabled = spinning || bet <= Number(slider.min);
  betUp.disabled = spinning || bet >= Number(slider.max) || bet >= balance;
  spinButton.disabled = spinning || balance < bet;
  forceButtons.forEach((button) => {
    button.disabled = spinning || balance < bet;
  });
}

function setBet(nextBet) {
  const min = Number(slider.min);
  const max = Math.min(Number(slider.max), Math.max(min, balance));
  bet = Math.min(max, Math.max(min, nextBet));
  updateMeters();
}

function score(result) {
  const ids = result.map((symbol) => symbol.id);
  const counts = ids.reduce((map, id) => {
    map[id] = (map[id] || 0) + 1;
    return map;
  }, {});

  if (counts.wild === 3) return { multiplier: 10, label: "Triple Wild" };
  if (counts.seven === 3) return { multiplier: 8, label: "Lucky Sevens" };
  if (counts.gem === 3) return { multiplier: 6, label: "Crystal Match" };

  const hasThree = Object.values(counts).some((count) => count === 3);
  if (hasThree) return { multiplier: 4, label: "Triple Match" };

  const hasPair = Object.values(counts).some((count) => count === 2);
  if (hasPair) return { multiplier: 2, label: "Pair Win" };

  return { multiplier: 0, label: "No win" };
}

function playTone(frequency, duration = 0.08) {
  if (!soundOn) return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.frequency.value = frequency;
  oscillator.type = "triangle";
  gain.gain.setValueAtTime(0.06, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function spin() {
  if (spinning || balance < bet) return;

  spinning = true;
  balance -= bet;
  lastWinEl.textContent = "$0";
  banner.textContent = "Spinning";
  banner.classList.remove("is-win");
  reelEls.forEach((reel) => {
    reel.classList.remove("is-winning");
    reel.classList.add("is-spinning");
  });
  updateMeters();
  playTone(220);

  const result = [];
  for (let index = 0; index < reelEls.length; index += 1) {
    const reel = reelEls[index];
    const ticker = setInterval(() => renderSymbol(reel, weightedSymbol()), 90);
    await sleep(650 + index * 260);
    clearInterval(ticker);

    const symbol = forcedResult?.[index] || weightedSymbol();
    result.push(symbol);
    renderSymbol(reel, symbol);
    reel.classList.remove("is-spinning");
    playTone(300 + index * 90);
  }

  const outcome = score(result);
  const win = bet * outcome.multiplier;

  if (win > 0) {
    balance += win;
    lastWinEl.textContent = money(win);
    banner.textContent = `${outcome.label}: ${money(win)}`;
    banner.classList.add("is-win");
    reelEls.forEach((reel) => reel.classList.add("is-winning"));
    playTone(660, 0.16);
    await sleep(110);
    playTone(880, 0.18);
  } else {
    banner.textContent = balance >= bet ? "Try again" : "Out of credits";
  }

  spinning = false;
  forcedResult = null;
  setBet(Math.min(bet, Math.max(Number(slider.min), balance)));
  updateMeters();
}

window.forceSpin = async function forceSpin(symbolIds) {
  const pickedSymbols = symbolIds.map(symbolById);

  if (pickedSymbols.length !== reelEls.length || pickedSymbols.some((symbol) => !symbol)) {
    console.info("Use three symbols: wild, seven, gem, bell, cherry");
    return;
  }

  forcedResult = pickedSymbols;
  await spin();
};

forceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    window.forceSpin(button.dataset.force.split(","));
  });
});

slider.addEventListener("input", (event) => setBet(Number(event.target.value)));
betDown.addEventListener("click", () => setBet(bet - 5));
betUp.addEventListener("click", () => setBet(bet + 5));
spinButton.addEventListener("click", spin);
soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.classList.toggle("is-muted", !soundOn);
});

reelEls.forEach((reel) => renderSymbol(reel, weightedSymbol()));
updateMeters();
