const attemptsEl = document.querySelector("#attempts");
const streakEl = document.querySelector("#streak");
const mysteryNumber = document.querySelector("#mysteryNumber");
const message = document.querySelector("#numberMessage");
const form = document.querySelector("#guessForm");
const input = document.querySelector("#guessInput");
const resetButton = document.querySelector("#resetNumber");

let target = 0;
let attempts = 6;
let streak = 0;

function pickTarget() {
  return Math.floor(Math.random() * 50) + 1;
}

function updateNumberUi() {
  attemptsEl.textContent = String(attempts);
  streakEl.textContent = String(streak);
}

function newRound() {
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
  if (!Number.isInteger(guess) || guess < 1 || guess > 50) {
    message.textContent = "Pick a number from 1 to 50.";
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
how 
  message.textContent = guess < target ? "Higher." : "Lower.";
  input.value = "";
  input.focus();
  updateNumberUi();
});

resetButton.addEventListener("click", newRound);
newRound();
