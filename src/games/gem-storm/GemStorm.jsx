import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import RulesModal from "../../components/RulesModal.jsx";
import { REELS, ROWS, GEMS, WILD, randomGrid, expandWilds, evaluate } from "./gemLogic.js";

const INITIAL_BALANCE = 500;
const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

export default function GemStorm() {
  const [grid, setGrid] = useState(randomGrid);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(INITIAL_BET);
  const [lastWin, setLastWin] = useState(0);
  const [winCells, setWinCells] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());
  const [message, setMessage] = useState("Spin for expanding wild gems.");
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
    setWinCells(new Set());
    setExpanded(new Set());
    setMessage("Spinning...");
    playTone(soundOn, 240, 0.08);

    // Spin animation: rapidly cycle random gems to build anticipation.
    const SPIN_TICKS = 16;
    for (let i = 0; i < SPIN_TICKS; i += 1) {
      setGrid(randomGrid());
      playTone(soundOn, 300 + (i % 5) * 40, 0.02);
      await sleep(95);
    }

    let working = randomGrid();
    setGrid(working);
    await sleep(320);

    const { grid: expandedGrid, expandedCols } = expandWilds(working);
    if (expandedCols.size > 0) {
      setGrid(expandedGrid);
      setExpanded(expandedCols);
      setMessage("Expanding wild!");
      playTone(soundOn, 600, 0.12);
      await sleep(520);
      working = expandedGrid;
    }

    const betUnit = bet / 20;
    const { total, winningReels } = evaluate(working, betUnit);

    if (total > 0) {
      setWinCells(winningReels);
      setBalance((b) => b + total);
      setLastWin(total);
      setMessage(`Won ${money(total)}!`);
      playTone(soundOn, 760, 0.14);
    } else {
      setMessage("No win. Spin again.");
    }

    setBet((b) => clampBet(b, balance - bet + total));
    setBusy(false);
  };

  return (
    <main className="shell">
      <section className="machine" aria-label="Gem Storm slot game">
        <GameNav />
        <header className="topbar">
          <div>
            <p className="kicker">Expanding wilds</p>
            <h1>Gem Storm</h1>
          </div>
          <div className="bj-header-actions">
            <button
              className={`icon-button ${soundOn ? "" : "is-muted"}`}
              type="button"
              onClick={() => { playTone(true, 320, 0.05); setSoundOn((s) => !s); }}
              aria-label="Toggle sound"
              title="Toggle sound"
            >
              ♪
            </button>
            <RulesModal title="Gem Storm">
              <p><strong>Goal:</strong> Match gems on adjacent reels — and let diamond wilds expand for big wins.</p>
              <ul>
                <li>Set your bet and press <strong>Spin</strong> across the 5 reels.</li>
                <li>Wins pay <strong>both ways</strong> — 3 or more matching gems on consecutive reels from the left <em>or</em> the right.</li>
                <li>The <strong>diamond 💎 is wild</strong> and substitutes for any gem.</li>
                <li>Any reel containing a wild turns into a full <strong>expanding wild</strong>, covering the whole reel.</li>
                <li>Longer matching runs and higher-value gems (diamond, ruby) pay the most.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="meters" aria-label="Game totals">
          <div className="meter"><span>Balance</span><strong>{money(balance)}</strong></div>
          <div className="meter"><span>Bet</span><strong>{money(bet)}</strong></div>
          <div className="meter"><span>Last Win</span><strong>{money(lastWin)}</strong></div>
        </section>

        <section className="gem-grid" aria-live="polite" style={{ gridTemplateColumns: `repeat(${REELS}, 1fr)` }}>
          {Array.from({ length: ROWS }).map((_, row) =>
            Array.from({ length: REELS }).map((__, reel) => {
              const sym = grid[reel][row];
              const isWin = winCells.has(`${reel}-${row}`);
              const isWild = sym.wild;
              return (
                <div key={`${reel}-${row}`} className={`cascade-cell ${isWin ? "is-win" : ""} ${isWild ? "is-wild" : ""}`}>
                  <span>{sym.emoji}</span>
                </div>
              );
            })
          )}
        </section>

        <div className={`win-banner ${lastWin > 0 ? "is-win" : ""}`} role="status">{message}</div>

        <section className="controls" aria-label="Slot controls">
          <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={busy || bet <= MIN_BET}>-</button>
          <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" disabled={busy} />
          <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={busy || bet >= MAX_BET || bet >= balance}>+</button>
          <button className="spin-button" type="button" onClick={spin} disabled={busy || balance < bet}>
            {balance < bet ? "No funds" : "Spin"}
          </button>
        </section>

        <section className="paytable" aria-label="Paytable">
          {GEMS.map((g) => (
            <div key={g.id}><span>{g.emoji}</span><strong>{g.value}x</strong></div>
          ))}
          <div><span>{WILD.emoji}</span><strong>Wild</strong></div>
        </section>
      </section>
    </main>
  );
}
