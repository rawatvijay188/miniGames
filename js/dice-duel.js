const playerDice = Array.from(document.querySelectorAll("#playerDice b"));
const dealerDice = Array.from(document.querySelectorAll("#dealerDice b"));
const balanceEl = document.querySelector("#diceBalance");
const betEl = document.querySelector("#diceBet");
const resultEl = document.querySelector("#diceResult");
const slider = document.querySelector("#diceBetSlider");
const betDown = document.querySelector("#diceBetDown");
const betUp = document.querySelector("#diceBetUp");
const rollButton = document.querySelector("#rollButton");

const faceMarkup = {
  1: ["empty", "empty", "empty", "empty", "dot", "empty", "empty", "empty", "empty"],
  2: ["dot", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "dot"],
  3: ["dot", "empty", "empty", "empty", "dot", "empty", "empty", "empty", "dot"],
  4: ["dot", "empty", "dot", "empty", "empty", "empty", "dot", "empty", "dot"],
  5: ["dot", "empty", "dot", "empty", "dot", "empty", "dot", "empty", "dot"],
  6: ["dot", "empty", "dot", "dot", "empty", "dot", "dot", "empty", "dot"]
};

const rotations = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateY(180deg)",
  3: "rotateY(-90deg)",
  4: "rotateY(90deg)",
  5: "rotateX(-90deg)",
  6: "rotateX(90deg)"
};

let balance = 300;
let bet = Number(slider.value);
let rolling = false;

function makeFace(value, side) {
  const dots = faceMarkup[value]
    .map((className) => `<span class="${className}"></span>`)
    .join("");
  return `<span class="face ${side}" aria-hidden="true">${dots}</span>`;
}

function buildDie(element) {
  element.innerHTML = `
    <span class="dice-cube">
      ${makeFace(1, "front")}
      ${makeFace(2, "back")}
      ${makeFace(3, "right")}
      ${makeFace(4, "left")}
      ${makeFace(5, "top")}
      ${makeFace(6, "bottom")}
    </span>
  `;
}

function money(value) {
  return `$${value}`;
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function drawDice(elements, values) {
  elements.forEach((element, index) => {
    const value = values[index];
    const cube = element.querySelector(".dice-cube");

    element.dataset.value = String(value);
    element.setAttribute("aria-label", `Die showing ${value}`);
    cube.style.transform = rotations[value];
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
  playerDice.concat(dealerDice).forEach((die) => die.classList.remove("is-rolling"));
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
  playerDice.concat(dealerDice).forEach((die) => die.classList.add("is-rolling"));
  updateDiceMeters();

  let ticks = 0;
  const ticker = setInterval(() => {
    playerDice.concat(dealerDice).forEach((die) => {
      const cube = die.querySelector(".dice-cube");
      cube.style.transform = `rotateX(${720 + Math.random() * 360}deg) rotateY(${720 + Math.random() * 360}deg)`;
    });
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
playerDice.concat(dealerDice).forEach(buildDie);
drawDice(playerDice, [1, 1]);
drawDice(dealerDice, [1, 1]);
updateDiceMeters();
