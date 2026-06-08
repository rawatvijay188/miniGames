import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import { NUMBERS, MAX_PICKS, PAY_TABLE, drawNumbers, calcPayout } from "./kenoLogic.js";
import { useCoins } from "../../context/CoinContext.jsx";

const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;

function clampBet(next, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, next));
}

export default function Keno() {
  const { balance, setBalance, refillWallet } = useCoins();
  const [bet, setBet] = useState(INITIAL_BET);
  const [picks, setPicks] = useState(new Set());
  const [drawn, setDrawn] = useState([]);
  const [revealed, setRevealed] = useState(new Set());
  const [phase, setPhase] = useState("picking"); // picking | drawing | done
  const [message, setMessage] = useState("Pick 1–8 numbers, then draw.");
  const [lastWin, setLastWin] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const updateBet = (next) => {
    if (phase !== "picking") return;
    playTone(soundOn, 320, 0.05);
    setBet(clampBet(next, balance));
  };

  const togglePick = (n) => {
    if (phase !== "picking") return;
    setPicks((prev) => {
      const next = new Set(prev);
      if (next.has(n)) {
        next.delete(n);
      } else if (next.size < MAX_PICKS) {
        next.add(n);
        playTone(soundOn, 380 + next.size * 18, 0.04);
      }
      return next;
    });
  };

  const quickPick = () => {
    if (phase !== "picking") return;
    playTone(soundOn, 420, 0.06);
    const pool = [...NUMBERS];
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const count = picks.size > 0 ? picks.size : 5;
    setPicks(new Set(pool.slice(0, count)));
  };

  const go = async () => {
    if (phase !== "picking" || picks.size === 0 || balance < bet) return;

    setPhase("drawing");
    setBalance((b) => b - bet);
    setLastWin(0);
    setRevealed(new Set());
    setMessage("Drawing…");
    playTone(soundOn, 240, 0.1);

    const drawnNums = drawNumbers();
    setDrawn(drawnNums);

    const revealedLocal = new Set();
    for (let i = 0; i < drawnNums.length; i += 1) {
      const n = drawnNums[i];
      revealedLocal.add(n);
      setRevealed(new Set(revealedLocal));
      playTone(soundOn, picks.has(n) ? 520 + i * 12 : 240, picks.has(n) ? 0.08 : 0.02);
      await sleep(90);
    }

    const betUnit = bet / 20;
    const { hits, payout } = calcPayout([...picks], drawnNums, betUnit);

    if (payout > 0) {
      setBalance((b) => b + payout);
      setLastWin(payout);
      setMessage(`${hits} of ${picks.size} matched — won ${money(payout)}!`);
      playTone(soundOn, 760, 0.16);
    } else {
      setMessage(`${hits} of ${picks.size} matched — no win.`);
      playTone(soundOn, 180, 0.22);
    }

    setPhase("done");
  };

  const newGame = () => {
    playTone(soundOn, 320, 0.05);
    setPicks(new Set());
    setDrawn([]);
    setRevealed(new Set());
    setPhase("picking");
    setBet((b) => clampBet(b, balance));
    setMessage(balance < MIN_BET ? "Out of chips." : "Pick 1–8 numbers, then draw.");
  };

  const refill = () => {
    playTone(soundOn, 320, 0.05);
    refillWallet();
    setBet(INITIAL_BET);
    setPicks(new Set());
    setDrawn([]);
    setRevealed(new Set());
    setPhase("picking");
    setMessage("Chips refilled. Pick numbers.");
  };

  const drawnSet = new Set(drawn);
  const payRows = picks.size >= 1 ? (PAY_TABLE[picks.size] ?? []) : [];

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Keno game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Pick your numbers</p>
            <h1>Keno</h1>
          </div>
          <button
            className={`icon-button ${soundOn ? "" : "is-muted"}`}
            type="button"
            onClick={() => { playTone(true, 320, 0.05); setSoundOn((s) => !s); }}
            aria-label="Toggle sound"
            title="Toggle sound"
          >♪</button>
        </header>

        <section className="score-strip" aria-label="Score">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Bet</span><strong>{money(bet)}</strong></div>
          <div><span>Last Win</span><strong>{money(lastWin)}</strong></div>
        </section>

        <div className={`win-banner${lastWin > 0 ? " is-win" : ""}`} role="status">
          {message}
        </div>

        <div className="keno-pick-info">
          <span>{picks.size} / {MAX_PICKS} picked</span>
          {phase === "picking" && (
            <button type="button" className="rules-button" onClick={quickPick}>Quick Pick</button>
          )}
        </div>

        <section className="keno-grid" aria-label="Number selection grid">
          {NUMBERS.map((n) => {
            const isPicked = picks.has(n);
            const isRevealed = revealed.has(n);
            const isHit = isPicked && isRevealed;
            const isMiss = !isPicked && isRevealed;
            return (
              <button
                key={n}
                type="button"
                className={[
                  "keno-num",
                  isPicked && !isHit ? "is-picked" : "",
                  isMiss ? "is-drawn" : "",
                  isHit ? "is-hit" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => togglePick(n)}
                disabled={phase !== "picking" || (!isPicked && picks.size >= MAX_PICKS)}
                aria-pressed={isPicked}
              >
                {n}
              </button>
            );
          })}
        </section>

        {phase === "picking" && (
          <section className="mini-controls">
            <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={bet <= MIN_BET}>-</button>
            <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" />
            <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={bet >= MAX_BET || bet >= balance}>+</button>
            <button className="spin-button" type="button" onClick={go} disabled={picks.size === 0 || balance < bet}>Draw</button>
          </section>
        )}

        {phase === "done" && (
          <section className="mini-controls">
            {balance < MIN_BET
              ? <button className="spin-button" type="button" onClick={refill} style={{ gridColumn: "1 / -1" }}>Refill chips</button>
              : <button className="spin-button" type="button" onClick={newGame} style={{ gridColumn: "1 / -1" }}>New game</button>
            }
          </section>
        )}

        {payRows.length > 0 && (
          <section className="paytable keno-paytable" aria-label="Payout table">
            {payRows.map(([match, mult]) => (
              <div key={match}>
                <span>Match {match}</span>
                <strong>{mult}x</strong>
              </div>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
