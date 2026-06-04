import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import RulesModal from "../../components/RulesModal.jsx";

const INITIAL_BALANCE = 300;
const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;
const ROWS = 8; // peg rows; chip makes ROWS left/right decisions

// Multiplier for each of the ROWS+1 buckets (symmetric, edges pay most).
const BUCKETS = [18, 5, 2, 1, 0.5, 1, 2, 5, 18];

function bucketColor(mult) {
  if (mult >= 10) return "#f7bd4a";
  if (mult >= 2) return "#f35f76";
  if (mult >= 1) return "#49d7df";
  return "#364052";
}

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

export default function PlinkoDrop() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(INITIAL_BET);
  const [lastWin, setLastWin] = useState(0);
  const [dropping, setDropping] = useState(false);
  const [chip, setChip] = useState(null); // { row, pos } where pos is 0..row
  const [landedBucket, setLandedBucket] = useState(null);
  const [message, setMessage] = useState("Drop a chip and watch it bounce.");
  const [soundOn, setSoundOn] = useState(true);

  const updateBet = (next) => {
    if (dropping) return;
    playTone(soundOn, 320, 0.05);
    setBet(clampBet(next, balance));
  };

  const drop = async () => {
    if (dropping || balance < bet) return;
    setDropping(true);
    setBalance((b) => b - bet);
    setLastWin(0);
    setLandedBucket(null);
    setMessage("Dropping...");
    playTone(soundOn, 300, 0.05);

    let pos = 0; // number of right-moves so far == bucket index at the end
    setChip({ row: 0, pos: 0 });
    await sleep(160);

    for (let row = 1; row <= ROWS; row += 1) {
      const goRight = Math.random() < 0.5;
      if (goRight) pos += 1;
      setChip({ row, pos });
      playTone(soundOn, 380 + (row % 4) * 50, 0.03);
      await sleep(200);
    }

    const mult = BUCKETS[pos];
    const win = Math.round(bet * mult);
    setLandedBucket(pos);

    if (win > bet) {
      setMessage(`${mult}x — won ${money(win)}!`);
      playTone(soundOn, 760, 0.16);
    } else if (win > 0) {
      setMessage(`${mult}x — back ${money(win)}.`);
      playTone(soundOn, 420, 0.1);
    } else {
      setMessage("Missed. Try again!");
      playTone(soundOn, 150, 0.22);
    }

    setBalance((b) => b + win);
    setLastWin(win);
    setBet((b) => clampBet(b, balance - bet + win));
    setDropping(false);
  };

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Plinko Drop game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Bounce & win</p>
            <h1>Plinko Drop</h1>
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
            <RulesModal title="Plinko Drop">
              <p><strong>Goal:</strong> Drop a chip and let it bounce into a high-multiplier bucket.</p>
              <ul>
                <li>Set your bet and press <strong>Drop</strong>.</li>
                <li>The chip bounces left or right off each peg on its way down.</li>
                <li>It lands in one of the bottom <strong>buckets</strong>, and your bet is multiplied by that bucket's value.</li>
                <li>The <strong>edge buckets pay the most</strong> (up to 18×) but are the hardest to reach.</li>
                <li>The center buckets are common but pay little (as low as 0.5×).</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Status">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Bet</span><strong>{money(bet)}</strong></div>
          <div><span>Last Win</span><strong>{money(lastWin)}</strong></div>
        </section>

        <section className="plinko-board" aria-live="polite">
          {Array.from({ length: ROWS + 1 }).map((_, row) => (
            <div className="plinko-row" key={row}>
              {Array.from({ length: row + 1 }).map((__, p) => {
                const isChip = chip && chip.row === row && chip.pos === p;
                return (
                  <span key={p} className={`plinko-peg ${isChip ? "has-chip" : ""}`}>
                    {isChip ? "🔴" : "•"}
                  </span>
                );
              })}
            </div>
          ))}
        </section>

        <section className="plinko-buckets" aria-label="Payout buckets">
          {BUCKETS.map((mult, i) => (
            <div
              key={i}
              className={`plinko-bucket ${landedBucket === i ? "is-landed" : ""}`}
              style={{ background: bucketColor(mult) }}
            >
              {mult}x
            </div>
          ))}
        </section>

        <div className={`win-banner ${lastWin > bet ? "is-win" : ""}`} role="status">{message}</div>

        <section className="mini-controls" aria-label="Controls">
          <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={dropping || bet <= MIN_BET}>-</button>
          <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" disabled={dropping} />
          <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={dropping || bet >= MAX_BET || bet >= balance}>+</button>
          <button className="spin-button" type="button" onClick={drop} disabled={dropping || balance < bet}>
            {balance < bet ? "No funds" : "Drop"}
          </button>
        </section>
      </section>
    </main>
  );
}
