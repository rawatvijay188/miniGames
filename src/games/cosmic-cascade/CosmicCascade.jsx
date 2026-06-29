import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";
import { useBet, useSound, useCoins, useReelSpin, SpinningReels, money, sleep, playTone } from "../../gdk";
import {
  COLS,
  ROWS,
  SYMBOLS,
  randomGrid,
  findWinningIds,
  collapse,
  cascadePayout
} from "./cascadeLogic.js";

const STEP_MS = 480;
const STRIP_LEN = 12; // random symbols per reel during the scroll

export default function CosmicCascade() {
  const [grid, setGrid] = useState(randomGrid);
  const { balance, setBalance } = useCoins();
  const { soundOn, toggle, sfx } = useSound();
  const { bet, setBet, increase, decrease, reclamp, atMin, atMax, canBet, min, max } = useBet({
    initial: 20, min: 10, max: 100, step: 10, onChange: () => sfx.bet(),
  });
  const [lastWin, setLastWin] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [winningIds, setWinningIds] = useState([]);
  const [message, setMessage] = useState("Spin to start the cascade.");
  const [busy, setBusy] = useState(false);

  // Standard reel spin. The grid is stored as columns of rows (grid[col][row]);
  // flatten row-major so the stopped reels line up with the revealed grid.
  const reels = useReelSpin({
    cols: COLS,
    rows: ROWS,
    randomGrid,
    stripLen: STRIP_LEN,
    flatten: (g) => {
      const flat = [];
      for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < COLS; c += 1) flat.push(g[c][r]);
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
    setWinningIds([]);
    setMultiplier(1);
    setMessage("Spinning...");
    playTone(soundOn, 240, 0.08);

    // Decide the result up front, then scroll the reels to land on it.
    let working = randomGrid();
    await reels.spin(working, () => setGrid(working));

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
    reclamp(balance - bet + totalWin);
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
            <RulesModal title="Cosmic Cascade">
              <p><strong>Goal:</strong> Land six or more of the same cosmic symbol anywhere on the grid to win.</p>
              <ul>
                <li>Set your bet and press <strong>Spin</strong> to fill the 5×4 grid.</li>
                <li>Any symbol that appears <strong>6 or more times</strong> pays out and those symbols vanish.</li>
                <li>Surviving symbols stay put and new ones <strong>tumble down</strong> to fill the gaps — that's a cascade.</li>
                <li>Each cascade in a single spin raises the <strong>multiplier</strong> (×1, ×2, ×3…), so chains pay big.</li>
                <li>Rarer symbols like the rocket and alien are worth the most.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="meters" aria-label="Game totals">
          <div className="meter"><span>Balance</span><strong>{money(balance)}</strong></div>
          <div className="meter"><span>Bet</span><strong>{money(bet)}</strong></div>
          <div className="meter"><span>Last Win</span><strong>{money(lastWin)}</strong></div>
        </section>

        <section className="cascade-grid" aria-live="polite" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, "--reel-roll-duration": "0.34s" }}>
          {reels.reelSpin ? (
            <SpinningReels columns={reels.reelSpin.columns} strips={reels.reelSpin.strips} rolling={reels.rolling} rows={ROWS} spinSteps={reels.spinSteps} durationScale={reels.durationScale} />
          ) : (
            grid.map((col, c) =>
              col.map((symbol, r) => (
                <div
                  key={`${c}-${r}`}
                  className={`cascade-cell ${winSet.has(symbol.id) ? "is-win" : ""}`}
                >
                  <span dangerouslySetInnerHTML={{ __html: symbol.svg }} />
                </div>
              ))
            )
          )}
        </section>

        <div className={`win-banner ${lastWin > 0 ? "is-win" : ""}`} role="status">
          {message}
        </div>

        <section className="controls" aria-label="Slot controls">
          <button className="stepper" type="button" onClick={decrease} disabled={busy || atMin}>-</button>
          <input type="range" min={min} max={max} step="10" value={bet} onChange={(e) => setBet(Number(e.target.value))} aria-label="Bet amount" disabled={busy} />
          <button className="stepper" type="button" onClick={increase} disabled={busy || atMax}>+</button>
          <button className="spin-button" type="button" onClick={spin} disabled={busy || !canBet}>
            {canBet ? "Spin" : "No funds"}
          </button>
        </section>

        <section className="paytable" aria-label="Paytable">
          {SYMBOLS.map((s) => (
            <div key={s.id}><span dangerouslySetInnerHTML={{ __html: s.svg }} style={{ width: "2rem", height: "2rem", display: "block" }} /><strong>{s.value}</strong></div>
          ))}
        </section>
      </section>
    </main>
  );
}
