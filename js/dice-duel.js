const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const playerDice = Array.from(document.querySelectorAll("#playerDice b"));
const dealerDice = Array.from(document.querySelectorAll("#dealerDice b"));
const balanceEl = document.querySelector("#diceBalance");
const betEl = document.querySelector("#diceBet");
const resultEl = document.querySelector("#diceResult");
const slider = document.querySelector("#diceBetSlider");
const betDown = document.querySelector("#diceBetDown");
const betUp = document.querySelector("#diceBetUp");
const rollButton = document.querySelector("#rollButton");

let balance = 300;
let bet = Number(slider.value);
let rolling = false;

function money(value) {
  return `$${value}`;
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function drawDice(elements, values) {
  elements.forEach((element, index) => {
    element.textContent = diceFaces[values[index] - 1];
  });
}

function updateDiceMeters() {
  balanceEl.textContent = money(balance);
  betEl.textContent = money(bet);
  slider.value = String(bet);
  betDown.disabled = rolling || bet <= Number(slider.min);
  betUp.disabled = rolling || bet >= Number(slider.max) || bet >= balance;
  rollButton.disabled = rolling || balance < bet;
}

function setDiceBet(nextBet) {
  const min = Number(slider.min);
  const max = Math.min(Number(slider.max), Math.max(min, balance));
  bet = Math.min(max, Math.max(min, nextBet));
  updateDiceMeters();
}

function finishRoll() {
  const player = [rollDie(), rollDie()];
  const dealer = [rollDie(), rollDie()];
  const playerTotal = player[0] + player[1];
  const dealerTotal = dealer[0] + dealer[1];

  drawDice(playerDice, player);
  drawDice(dealerDice, dealer);
  balance -= bet;

  if (playerTotal > dealerTotal) {
    balance += bet * 2;
    resultEl.textContent = `Won $${bet}`;
  } else if (playerTotal === dealerTotal) {
    balance += bet;
    resultEl.textContent = "Push";
  } else {
    resultEl.textContent = `Lost $${bet}`;
  }

  rolling = false;
  setDiceBet(Math.min(bet, Math.max(Number(slider.min), balance)));
  updateDiceMeters();
}

rollButton.addEventListener("click", () => {
  if (rolling || balance < bet) return;

  rolling = true;
  resultEl.textContent = "Rolling";
  updateDiceMeters();

  let ticks = 0;
  const ticker = setInterval(() => {
    drawDice(playerDice, [rollDie(), rollDie()]);
    drawDice(dealerDice, [rollDie(), rollDie()]);
    ticks += 1;

    if (ticks >= 10) {
      clearInterval(ticker);
      finishRoll();
    }
  }, 90);
});

slider.addEventListener("input", (event) => setDiceBet(Number(event.target.value)));
betDown.addEventListener("click", () => setDiceBet(bet - 10));
betUp.addEventListener("click", () => setDiceBet(bet + 10));
updateDiceMeters();
