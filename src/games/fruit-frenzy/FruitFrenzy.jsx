import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";
import { useBet, useSound, useCoins, useReelSpin, SpinningReels, money, sleep, playTone } from "../../gdk";
import {
  COLS,
  ROWS,
  FRUITS,
  randomGrid,
  findClusters,
  clusterPayout,
  collapse
} from "./fruitLogic.js";

const STEP_MS = 460;
const STRIP_LEN = 14; // random symbols per reel during the scroll
const STOP_GAP_MS = 200; // extra delay before each later reel stops

export default function FruitFrenzy() {
  const [grid, setGrid] = useState(randomGrid);
  const { balance, setBalance } = useCoins();
  const { soundOn, toggle, sfx } = useSound();
  const { bet, setBet, increase, decrease, reclamp, atMin, atMax, canBet, min, max } = useBet({
    initial: 20, min: 10, max: 100, step: 10, onChange: () => sfx.bet(),
  });
  const [lastWin, setLastWin] = useState(0);
  const [winCells, setWinCells] = useState(new Set());
  const [message, setMessage] = useState("Spin to find fruit clusters.");
  const [busy, setBusy] = useState(false);

  // Standard reel spin. The grid renders row-major (grid[r][c]); flatten in that
  // same order so the stopped reels line up with the revealed grid.
  const reels = useReelSpin({
    cols: COLS,
    rows: ROWS,
    randomGrid,
    stripLen: STRIP_LEN,
    stopGapMs: STOP_GAP_MS,
    flatten: (g) => {
      const flat = [];
      for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < COLS; c += 1) flat.push(g[r][c]);
      }
      return flat;
    },
    onStop: (c) => playTone(soundOn, 300 + c * 60, 0.05),
  });

  const spin = async () => {
    if (busy || balance < bet) return;
    setBusy(true);
    setBalance((b) => b - bet);
    setLastWin(0);
    setWinCells(new Set());
    setMessage("Spinning...");
    playTone(soundOn, 240, 0.08);

    // Decide the result up front, then scroll the reels to land on it.
    let working = randomGrid();
    await reels.spin(working, () => setGrid(working));

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

    reclamp(balance - bet + totalWin);
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
              onClick={toggle}
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

        <section className="cluster-grid" aria-live="polite" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, "--reel-roll-duration": "0.34s" }}>
          {reels.reelSpin ? (
            <SpinningReels columns={reels.reelSpin.columns} strips={reels.reelSpin.strips} rolling={reels.rolling} rows={ROWS} spinSteps={reels.spinSteps} durationScale={reels.durationScale} />
          ) : (
            grid.map((row, r) =>
              row.map((fruit, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`cascade-cell ${winCells.has(`${r}-${c}`) ? "is-win" : ""}`}
                >
                  <span dangerouslySetInnerHTML={{ __html: fruit.svg }} />
                </div>
              ))
            )
          )}
        </section>

        <div className={`win-banner ${lastWin > 0 ? "is-win" : ""}`} role="status">{message}</div>

        <section className="controls" aria-label="Slot controls">
          <button className="stepper" type="button" onClick={decrease} disabled={busy || atMin}>-</button>
          <input type="range" min={min} max={max} step="10" value={bet} onChange={(e) => setBet(Number(e.target.value))} aria-label="Bet amount" disabled={busy} />
          <button className="stepper" type="button" onClick={increase} disabled={busy || atMax}>+</button>
          <button className="spin-button" type="button" onClick={spin} disabled={busy || !canBet}>
            {canBet ? "Spin" : "No funds"}
          </button>
        </section>

        <section className="paytable" aria-label="Paytable">
          {FRUITS.map((f) => (
            <div key={f.id}><span dangerouslySetInnerHTML={{ __html: f.svg }} style={{ width: "2rem", height: "2rem", display: "block" }} /><strong>{f.value}x</strong></div>
          ))}
        </section>
      </section>
    </main>
  );
}
