import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import RulesModal from "../../components/RulesModal.jsx";
import { NUMBERS, OUTSIDE_BETS, numColor, spinWheel, settle } from "./rouletteLogic.js";

const INITIAL_BALANCE = 300;
const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;

function clampBet(next, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, next));
}

export default function Roulette() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(INITIAL_BET);
  const [selection, setSelection] = useState("red");
  const [result, setResult] = useState(null);
  const [spinNum, setSpinNum] = useState(null);
  const [message, setMessage] = useState("Choose a bet and spin.");
  const [lastWin, setLastWin] = useState(0);
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const updateBet = (next) => {
    if (busy) return;
    playTone(soundOn, 320, 0.05);
    setBet(clampBet(next, balance));
  };

  const select = (value) => {
    if (busy) return;
    playTone(soundOn, 340, 0.04);
    setSelection(value);
  };

  const spin = async () => {
    if (busy || balance < bet) return;
    setBusy(true);
    setResult(null);
    setBalance((b) => b - bet);
    setLastWin(0);
    setMessage("Spinning…");
    playTone(soundOn, 240, 0.12);

    const winNum = spinWheel();

    for (let i = 0; i < 16; i += 1) {
      setSpinNum(Math.floor(Math.random() * 37));
      playTone(soundOn, 280 + i * 14, 0.02);
      await sleep(55 + i * 11);
    }
    setSpinNum(null);
    setResult(winNum);

    const mult = settle(selection, winNum);
    if (mult === 35) {
      const won = bet * 35;
      setBalance((b) => b + bet + won);
      setLastWin(won);
      setMessage(`${winNum}! Straight up — won ${money(won)}!`);
      playTone(soundOn, 660, 0.14);
      setTimeout(() => playTone(soundOn, 880, 0.18), 120);
    } else if (mult === 1) {
      const won = bet;
      setBalance((b) => b + bet + won);
      setLastWin(won);
      setMessage(`${winNum} — won ${money(won)}!`);
      playTone(soundOn, 560, 0.12);
    } else {
      setMessage(`${winNum} — no win.`);
      playTone(soundOn, 160, 0.22);
    }

    setBusy(false);
  };

  const displayNum = result !== null ? result : spinNum;
  const displayColor = displayNum !== null ? numColor(displayNum) : null;

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Roulette game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">European wheel</p>
            <h1>Roulette</h1>
          </div>
          <div className="bj-header-actions">
            <button
              className={`icon-button ${soundOn ? "" : "is-muted"}`}
              type="button"
              onClick={() => { playTone(true, 320, 0.05); setSoundOn((s) => !s); }}
              aria-label="Toggle sound"
              title="Toggle sound"
            >♪</button>
            <RulesModal title="Roulette">
              <p><strong>Goal:</strong> Predict where the ball lands on the European wheel (numbers 0–36).</p>
              <ul>
                <li>Place a bet on an <strong>outside</strong> option — red/black, odd/even, or high/low — which pays <strong>1:1</strong>.</li>
                <li>Or bet <strong>straight-up</strong> on a single number for a <strong>35:1</strong> payout.</li>
                <li>Press <strong>Spin</strong> and the wheel picks a winning number.</li>
                <li>The green <strong>0</strong> is neither red/black nor odd/even — outside bets lose when it hits.</li>
                <li>Higher risk (single numbers) means a much bigger reward.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Score">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Bet</span><strong>{money(bet)}</strong></div>
          <div><span>Last Win</span><strong>{money(lastWin)}</strong></div>
        </section>

        <div className="roulette-display" aria-live="polite">
          <div className={`result-ball${displayColor ? ` result-${displayColor}` : " result-empty"}`}>
            {displayNum !== null ? displayNum : "?"}
          </div>
          <p className="roulette-msg" role="status">{message}</p>
        </div>

        <div className="outside-bets" role="group" aria-label="Outside bets">
          {OUTSIDE_BETS.map((ob) => (
            <button
              key={ob.id}
              type="button"
              className={`outside-bet ob-${ob.theme}${selection === ob.id ? " is-active" : ""}`}
              onClick={() => select(ob.id)}
              disabled={busy}
            >
              {ob.label}
            </button>
          ))}
        </div>

        <div className="num-grid" role="group" aria-label="Straight-up number bets">
          {NUMBERS.map((n) => (
            <button
              key={n}
              type="button"
              className={`num-cell num-${numColor(n)}${selection === n ? " is-selected" : ""}`}
              onClick={() => select(n)}
              disabled={busy}
              aria-pressed={selection === n}
            >
              {n}
            </button>
          ))}
        </div>

        <section className="mini-controls" aria-label="Bet controls">
          <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={busy || bet <= MIN_BET}>-</button>
          <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" disabled={busy} />
          <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={busy || bet >= MAX_BET || bet >= balance}>+</button>
          <button className="spin-button" type="button" onClick={spin} disabled={busy || balance < bet}>
            {balance < bet ? "No funds" : "Spin"}
          </button>
        </section>

        <section className="paytable" aria-label="Payouts">
          <div><span>Red / Black</span><strong>1:1</strong></div>
          <div><span>Odd / Even</span><strong>1:1</strong></div>
          <div><span>1–18 / 19–36</span><strong>1:1</strong></div>
          <div><span>Any number</span><strong>35:1</strong></div>
        </section>
      </section>
    </main>
  );
}
