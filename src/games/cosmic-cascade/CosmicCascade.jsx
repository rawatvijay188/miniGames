import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import {
  COLS,
  ROWS,
  SYMBOLS,
  randomGrid,
  findWinningIds,
  collapse,
  cascadePayout
} from "./cascadeLogic.js";

const INITIAL_BALANCE = 500;
const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;
const STEP_MS = 480;

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

export default function CosmicCascade() {
  const [grid, setGrid] = useState(randomGrid);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(INITIAL_BET);
  const [lastWin, setLastWin] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [winningIds, setWinningIds] = useState([]);
  const [message, setMessage] = useState("Spin to start the cascade.");
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const updateBet = (next) => {
    if (busy) return;
    playTone(soundOn, 320, 0.05);
    setBet(clampBet(next, balance));
  };

  const spin = async () => {
    if (busy || balance < bet) return;
    setBusy(true);
    setBalance((b) => b - bet);
    setLastWin(0);
    setWinningIds([]);
    setMultiplier(1);
    setMessage("Spinning...");
    playTone(soundOn, 240, 0.08);

    let working = randomGrid();
    setGrid(working);
    await sleep(STEP_MS);

    const betUnit = bet / 10;
    let totalWin = 0;
    let chain = 0;

    // Keep cascading while the grid keeps producing wins.
    while (true) {
      const wins = findWinningIds(working);
      if (wins.length === 0) break;

      chain += 1;
      const stepMultiplier = chain; // x1, x2, x3... per cascade
      setMultiplier(stepMultiplier);
      setWinningIds(wins);
      const stepWin = cascadePayout(working, wins, betUnit, stepMultiplier);
      totalWin += stepWin;
      setMessage(`Cascade x${stepMultiplier}! +${money(stepWin)}`);
      playTone(soundOn, 480 + chain * 80, 0.1);
      await sleep(STEP_MS);

      working = collapse(working, wins);
      setGrid(working);
      setWinningIds([]);
      await sleep(STEP_MS);
    }

    if (totalWin > 0) {
      setBalance((b) => b + totalWin);
      setLastWin(totalWin);
      setMessage(`Won ${money(totalWin)} across ${chain} cascade${chain > 1 ? "s" : ""}!`);
      playTone(soundOn, 760, 0.14);
    } else {
      setMessage("No cluster. Spin again.");
    }

    setMultiplier(1);
    setBet((b) => clampBet(b, balance - bet + totalWin));
    setBusy(false);
  };

  const winSet = new Set(winningIds);

  return (
    <main className="shell">
      <section className="machine" aria-label="Cosmic Cascade slot game">
        <GameNav />
        <header className="topbar">
          <div>
            <p className="kicker">Tumbling reels</p>
            <h1>Cosmic Cascade</h1>
          </div>
          <button
            className={`icon-button ${soundOn ? "" : "is-muted"}`}
            type="button"
            onClick={() => { playTone(true, 320, 0.05); setSoundOn((s) => !s); }}
            aria-label="Toggle sound"
            title="Toggle sound"
          >
            ♪
          </button>
        </header>

        <section className="meters" aria-label="Game totals">
          <div className="meter"><span>Balance</span><strong>{money(balance)}</strong></div>
          <div className="meter"><span>Bet</span><strong>{money(bet)}</strong></div>
          <div className="meter"><span>Last Win</span><strong>{money(lastWin)}</strong></div>
        </section>

        <section className="cascade-grid" aria-live="polite" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((col, c) =>
            col.map((symbol, r) => (
              <div
                key={`${c}-${r}`}
                className={`cascade-cell ${winSet.has(symbol.id) ? "is-win" : ""}`}
              >
                <span>{symbol.emoji}</span>
              </div>
            ))
          )}
        </section>

        <div className={`win-banner ${lastWin > 0 ? "is-win" : ""}`} role="status">
          {message}{busy && multiplier > 1 ? "" : ""}
        </div>

        <section className="controls" aria-label="Slot controls">
          <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={busy || bet <= MIN_BET}>-</button>
          <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" disabled={busy} />
          <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={busy || bet >= MAX_BET || bet >= balance}>+</button>
          <button className="spin-button" type="button" onClick={spin} disabled={busy || balance < bet}>
            {balance < bet ? "No funds" : "Spin"}
          </button>
        </section>

        <section className="paytable" aria-label="Paytable">
          {SYMBOLS.map((s) => (
            <div key={s.id}><span>{s.emoji}</span><strong>{s.value}</strong></div>
          ))}
        </section>
      </section>
    </main>
  );
}
