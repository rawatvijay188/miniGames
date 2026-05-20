const attemptsEl = document.querySelector("#attempts");
const streakEl = document.querySelector("#streak");
const mysteryNumber = document.querySelector("#mysteryNumber");
const message = document.querySelector("#numberMessage");
const form = document.querySelector("#guessForm");
const input = document.querySelector("#guessInput");
const resetButton = document.querySelector("#resetNumber");
const rangeLabel = document.querySelector("#rangeLabel");
const minRangeInput = document.querySelector("#minRange");
const maxRangeInput = document.querySelector("#maxRange");

let target = 0;
let attempts = 6;
let streak = 0;
let minRange = 1;
let maxRange = 50;

function pickTarget() {
  return Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
}

function readRange() {
  const nextMin = Number(minRangeInput.value);
  const nextMax = Number(maxRangeInput.value);

  if (!Number.isInteger(nextMin) || !Number.isInteger(nextMax)) {
    message.textContent = "Use whole numbers for the range.";
    return false;
  }

  if (nextMin < 1 || nextMax > 1000 || nextMin >= nextMax) {
    message.textContent = "Use a range from 1 to 1000, with min below max.";
    return false;
  }

  minRange = nextMin;
  maxRange = nextMax;
  return true;
}

function updateNumberUi() {
  attemptsEl.textContent = String(attempts);
  streakEl.textContent = String(streak);
  rangeLabel.textContent = `${minRange}-${maxRange}`;
  input.min = String(minRange);
  input.max = String(maxRange);
  input.placeholder = "Enter a number";
}

function previewRange() {
  const nextMin = Number(minRangeInput.value);
  const nextMax = Number(maxRangeInput.value);

  if (!Number.isInteger(nextMin) || !Number.isInteger(nextMax) || nextMin >= nextMax) {
    return;
  }

  rangeLabel.textContent = `${nextMin}-${nextMax}`;
  input.min = String(nextMin);
  input.max = String(nextMax);
  input.placeholder = "Enter a number";
}

function newRound() {
  if (!readRange()) return;

  target = pickTarget();
  attempts = 6;
  mysteryNumber.textContent = "?";
  message.textContent = "Find the hidden number.";
  input.disabled = false;
  form.querySelector(".spin-button").disabled = false;
  input.value = "";
  input.focus();
  updateNumberUi();
}

function endRound(text, reveal) {
  message.textContent = text;
  mysteryNumber.textContent = String(reveal);
  input.disabled = true;
  form.querySelector(".spin-button").disabled = true;
  updateNumberUi();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const guess = Number(input.value);
  if (!Number.isInteger(guess) || guess < minRange || guess > maxRange) {
    message.textContent = `Pick a number from ${minRange} to ${maxRange}.`;
    return;
  }

  attempts -= 1;

  if (guess === target) {
    streak += 1;
    endRound(`Correct in ${6 - attempts} guesses.`, target);
    return;
  }

  if (attempts <= 0) {
    streak = 0;
    endRound("Round over. Start a new one.", target);
    return;
  }

  message.textContent = guess < target ? "Higher." : "Lower.";
  input.value = "";
  input.focus();
  updateNumberUi();
});

resetButton.addEventListener("click", newRound);
minRangeInput.addEventListener("input", previewRange);
maxRangeInput.addEventListener("input", previewRange);
newRound();
