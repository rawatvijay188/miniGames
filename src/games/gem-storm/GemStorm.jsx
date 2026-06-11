import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import RulesModal from "../../components/RulesModal.jsx";
import SpinningReels, { toVisualColumns } from "../../components/SpinningReels.jsx";
import { useSpinEasing } from "../../hooks/useSpinEasing.js";
import { defaultSpinSteps } from "../../utils/reelEasing.js";
import { buildReelStrips, stopReelsSequentially } from "../../utils/reelSpin.js";
import { REELS, ROWS, GEMS, WILD, randomGrid, expandWilds, evaluate } from "./gemLogic.js";
import { useCoins } from "../../context/CoinContext.jsx";

const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;
const STRIP_LEN = 12; // random symbols per reel during the scroll
const FIRST_STOP_MS = 520; // when the first reel stops
const STOP_GAP_MS = 230; // extra delay before each later reel stops
const REVEAL_MS = 240; // settle pause before the result grid is shown

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

export default function GemStorm() {
  const [grid, setGrid] = useState(randomGrid);
  const { balance, setBalance } = useCoins();
  const [bet, setBet] = useState(INITIAL_BET);
  const [lastWin, setLastWin] = useState(0);
  const [winCells, setWinCells] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());
  const [message, setMessage] = useState("Spin for expanding wild gems.");
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  // While set, the reels are scrolling: { columns, strips }. rolling[reel] is
  // true until that reel stops.
  const [reelSpin, setReelSpin] = useState(null);
  const [rolling, setRolling] = useState([]);
  const [spinSteps, setSpinSteps] = useState([]);

  // Inject sine-eased spin keyframes
  useSpinEasing();

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

    // Decide the result up front, then scroll the reels to land on it.
    let working = randomGrid();

    // gem-grid renders row-major (outer ROWS, inner REELS); flatten in that
    // same order so the stopped reels line up with the revealed grid.
    const flat = [];
    for (let row = 0; row < ROWS; row += 1) {
      for (let reel = 0; reel < REELS; reel += 1) flat.push(working[reel][row]);
    }
    setReelSpin({ columns: toVisualColumns(flat, REELS), strips: buildReelStrips(REELS, STRIP_LEN, randomGrid) });
    setSpinSteps(defaultSpinSteps(REELS));

    await stopReelsSequentially({
      reelCount: REELS,
      firstStopMs: FIRST_STOP_MS,
      stopGapMs: STOP_GAP_MS,
      setRolling,
      onStop: (reel) => playTone(soundOn, 300 + reel * 70, 0.05)
    });

    await sleep(REVEAL_MS);
    setGrid(working);
    setReelSpin(null);
    setRolling([]);
    setSpinSteps([]);

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
                <li>The <strong>cyan diamond (WILD)</strong> substitutes for any gem.</li>
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

        <section className="gem-grid" aria-live="polite" style={{ gridTemplateColumns: `repeat(${REELS}, 1fr)`, "--reel-roll-duration": "0.34s" }}>
          {reelSpin ? (
            <SpinningReels columns={reelSpin.columns} strips={reelSpin.strips} rolling={rolling} rows={ROWS} spinSteps={spinSteps} durationScale={0.34} />
          ) : (
            Array.from({ length: ROWS }).map((_, row) =>
              Array.from({ length: REELS }).map((__, reel) => {
                const sym = grid[reel][row];
                const isWin = winCells.has(`${reel}-${row}`);
                const isWild = sym.wild;
                return (
                  <div key={`${reel}-${row}`} className={`cascade-cell ${isWin ? "is-win" : ""} ${isWild ? "is-wild" : ""}`}>
                    <span dangerouslySetInnerHTML={{ __html: sym.svg }} />
                  </div>
                );
              })
            )
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
            <div key={g.id}><span dangerouslySetInnerHTML={{ __html: g.svg }} style={{ width: "2rem", height: "2rem", display: "block" }} /><strong>{g.value}x</strong></div>
          ))}
          <div><span dangerouslySetInnerHTML={{ __html: WILD.svg }} style={{ width: "2rem", height: "2rem", display: "block" }} /><strong>Wild</strong></div>
        </section>
      </section>
    </main>
  );
}
