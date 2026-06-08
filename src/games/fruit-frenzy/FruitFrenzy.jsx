import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import RulesModal from "../../components/RulesModal.jsx";
import {
  COLS,
  ROWS,
  FRUITS,
  randomGrid,
  findClusters,
  clusterPayout,
  collapse
} from "./fruitLogic.js";
import { useCoins } from "../../context/CoinContext.jsx";

const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;
const STEP_MS = 460;

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

export default function FruitFrenzy() {
  const [grid, setGrid] = useState(randomGrid);
  const { balance, setBalance } = useCoins();
  const [bet, setBet] = useState(INITIAL_BET);
  const [lastWin, setLastWin] = useState(0);
  const [winCells, setWinCells] = useState(new Set());
  const [message, setMessage] = useState("Spin to find fruit clusters.");
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
    setMessage("Spinning...");
    playTone(soundOn, 240, 0.08);

    // Spin animation: rapidly cycle random fruits to build anticipation.
    const SPIN_TICKS = 16;
    for (let i = 0; i < SPIN_TICKS; i += 1) {
      setGrid(randomGrid());
      playTone(soundOn, 300 + (i % 5) * 40, 0.02);
      await sleep(95);
    }

    let working = randomGrid();
    setGrid(working);
    await sleep(320);

    const betUnit = bet / 20;
    let totalWin = 0;
    let chain = 0;

    while (true) {
      const clusters = findClusters(working);
      if (clusters.length === 0) break;

      chain += 1;
      const stepWin = clusterPayout(clusters, betUnit) * chain;
      totalWin += stepWin;

      const cells = new Set();
      for (const cl of clusters) for (const [r, c] of cl.cells) cells.add(`${r}-${c}`);
      setWinCells(cells);
      setMessage(`${clusters.length} cluster${clusters.length > 1 ? "s" : ""} x${chain}! +${money(stepWin)}`);
      playTone(soundOn, 460 + chain * 70, 0.1);
      await sleep(STEP_MS);

      working = collapse(working, clusters);
      setGrid(working);
      setWinCells(new Set());
      await sleep(STEP_MS);
    }

    if (totalWin > 0) {
      setBalance((b) => b + totalWin);
      setLastWin(totalWin);
      setMessage(`Won ${money(totalWin)}!`);
      playTone(soundOn, 760, 0.14);
    } else {
      setMessage("No clusters. Spin again.");
    }

    setBet((b) => clampBet(b, balance - bet + totalWin));
    setBusy(false);
  };

  return (
    <main className="shell">
      <section className="machine" aria-label="Fruit Frenzy slot game">
        <GameNav />
        <header className="topbar">
          <div>
            <p className="kicker">Cluster pays</p>
            <h1>Fruit Frenzy</h1>
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
            <RulesModal title="Fruit Frenzy">
              <p><strong>Goal:</strong> Land touching groups (clusters) of the same fruit to win — no paylines needed.</p>
              <ul>
                <li>Set your bet and press <strong>Spin</strong> to fill the 6×5 grid.</li>
                <li>A <strong>cluster of 5 or more</strong> matching fruits connected up/down/left/right pays out.</li>
                <li>Winning clusters vanish and fruits above <strong>tumble down</strong>, with new ones filling the top.</li>
                <li>Every extra cascade in the same spin <strong>multiplies</strong> your winnings.</li>
                <li>Bigger clusters and higher-value fruits (banana, strawberry) pay more.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="meters" aria-label="Game totals">
          <div className="meter"><span>Balance</span><strong>{money(balance)}</strong></div>
          <div className="meter"><span>Bet</span><strong>{money(bet)}</strong></div>
          <div className="meter"><span>Last Win</span><strong>{money(lastWin)}</strong></div>
        </section>

        <section className="cluster-grid" aria-live="polite" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((row, r) =>
            row.map((fruit, c) => (
              <div
                key={`${r}-${c}`}
                className={`cascade-cell ${winCells.has(`${r}-${c}`) ? "is-win" : ""}`}
              >
                <span>{fruit.emoji}</span>
              </div>
            ))
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
          {FRUITS.map((f) => (
            <div key={f.id}><span>{f.emoji}</span><strong>{f.value}x</strong></div>
          ))}
        </section>
      </section>
    </main>
  );
}
