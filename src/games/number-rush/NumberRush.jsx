import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { isValidRange, MAX_ALLOWED_RANGE, MIN_ALLOWED_RANGE, pickTarget, STARTING_ATTEMPTS } from "./numberRushLogic.js";

const INITIAL_MIN_RANGE = 1;
const INITIAL_MAX_RANGE = 50;

export default function NumberRush() {
  const [minRange, setMinRange] = useState(INITIAL_MIN_RANGE);
  const [maxRange, setMaxRange] = useState(INITIAL_MAX_RANGE);
  const [target, setTarget] = useState(() => pickTarget(INITIAL_MIN_RANGE, INITIAL_MAX_RANGE));
  const [attempts, setAttempts] = useState(STARTING_ATTEMPTS);
  const [streak, setStreak] = useState(0);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Find the hidden number.");
  const [revealed, setRevealed] = useState(false);

  const validRange = isValidRange(minRange, maxRange);

  const newRound = () => {
    if (!validRange) {
      setMessage(`Use a range from ${MIN_ALLOWED_RANGE} to ${MAX_ALLOWED_RANGE}, with min below max.`);
      return;
    }

    setTarget(pickTarget(minRange, maxRange));
    setAttempts(STARTING_ATTEMPTS);
    setGuess("");
    setRevealed(false);
    setMessage("Find the hidden number.");
  };

  const submitGuess = (event) => {
    event.preventDefault();

    const nextGuess = Number(guess);
    if (!Number.isInteger(nextGuess) || nextGuess < minRange || nextGuess > maxRange) {
      setMessage(`Pick a number from ${minRange} to ${maxRange}.`);
      return;
    }

    const nextAttempts = attempts - 1;
    if (nextGuess === target) {
      setStreak((value) => value + 1);
      setAttempts(nextAttempts);
      setRevealed(true);
      setMessage(`Correct in ${STARTING_ATTEMPTS - nextAttempts} guesses.`);
      return;
    }

    if (nextAttempts <= 0) {
      setStreak(0);
      setAttempts(0);
      setRevealed(true);
      setMessage("Round over. Start a new one.");
      return;
    }

    setAttempts(nextAttempts);
    setGuess("");
    setMessage(nextGuess < target ? "Higher." : "Lower.");
  };

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Number Rush game">
        <GameNav />
        <header className="mini-header">
          <p className="kicker">Puzzle run</p>
          <h1>Number Rush</h1>
        </header>

        <section className="score-strip" aria-label="Round status">
          <div><span>Range</span><strong>{minRange}-{maxRange}</strong></div>
          <div><span>Attempts</span><strong>{attempts}</strong></div>
          <div><span>Streak</span><strong>{streak}</strong></div>
        </section>

        <section className="range-editor" aria-label="Number range">
          <label>
            <span>Min</span>
            <input type="number" min={MIN_ALLOWED_RANGE} max={MAX_ALLOWED_RANGE - 1} value={minRange} onChange={(event) => setMinRange(Number(event.target.value))} aria-label="Minimum number" />
          </label>
          <label>
            <span>Max</span>
            <input type="number" min={MIN_ALLOWED_RANGE + 1} max={MAX_ALLOWED_RANGE} value={maxRange} onChange={(event) => setMaxRange(Number(event.target.value))} aria-label="Maximum number" />
          </label>
        </section>

        <section className="number-stage" aria-live="polite">
          <div className="mystery-number">{revealed ? target : "?"}</div>
          <p>{message}</p>
        </section>

        <form className="guess-form" onSubmit={submitGuess}>
          <input type="number" min={minRange} max={maxRange} placeholder="Enter a number" value={guess} onChange={(event) => setGuess(event.target.value)} disabled={revealed} aria-label="Your guess" required />
          <button className="spin-button" type="submit" disabled={revealed}>Guess</button>
          <button className="stepper reset-button" type="button" onClick={newRound} aria-label="New round" title="New round">↻</button>
        </form>
      </section>
    </main>
  );
}
