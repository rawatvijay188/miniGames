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
let forcedResult = null;

const reelEls = Array.from({ length: 3 }, () => {
  const reel = document.createElement("div");
  reel.className = "reel";
  reel.innerHTML = `<div class="symbol"></div>`;
  reels.appendChild(reel);
  return reel;
});

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

// Event listeners
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

// Initialization
reelEls.forEach((reel) => renderSymbol(reel, weightedSymbol()));
updateMeters();