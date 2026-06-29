import { useState } from "react";
import { useBet, useSound, useCoins, GameShell, ScoreStrip, money, sleep, playTone, shuffle } from "../../gdk";
import { NUMBERS, MAX_PICKS, PAY_TABLE, drawNumbers, calcPayout } from "./kenoLogic.js";

export default function Keno() {
  const { balance, setBalance, refillWallet } = useCoins();
  const { soundOn, toggle, sfx } = useSound();
  const { bet, setBet, increase, decrease, atMin, atMax, min, max } = useBet({
    initial: 20, min: 10, max: 100, step: 10, onChange: () => sfx.bet(),
  });

  const [picks, setPicks] = useState(new Set());
  const [drawn, setDrawn] = useState([]);
  const [revealed, setRevealed] = useState(new Set());
  const [phase, setPhase] = useState("picking"); // picking | drawing | done
  const [message, setMessage] = useState("Pick 1–8 numbers, then draw.");
  const [lastWin, setLastWin] = useState(0);

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
    sfx.bet();
    const count = picks.size > 0 ? picks.size : 5;
    setPicks(new Set(shuffle(NUMBERS).slice(0, count)));
  };

  const go = async () => {
    if (phase !== "picking" || picks.size === 0 || balance < bet) return;

    setPhase("drawing");
    setBalance((b) => b - bet);
    setLastWin(0);
    setRevealed(new Set());
    setMessage("Drawing…");
    sfx.start();

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
      sfx.win();
    } else {
      setMessage(`${hits} of ${picks.size} matched — no win.`);
      sfx.lose();
    }

    setPhase("done");
  };

  const newGame = () => {
    sfx.click();
    setPicks(new Set());
    setDrawn([]);
    setRevealed(new Set());
    setPhase("picking");
    setBet(bet, balance);
    setMessage(balance < min ? "Out of chips." : "Pick 1–8 numbers, then draw.");
  };

  const refill = () => {
    sfx.click();
    refillWallet();
    setBet(20);
    setPicks(new Set());
    setDrawn([]);
    setRevealed(new Set());
    setPhase("picking");
    setMessage("Chips refilled. Pick numbers.");
  };

  const payRows = picks.size >= 1 ? (PAY_TABLE[picks.size] ?? []) : [];

  return (
    <GameShell
      label="Keno game"
      kicker="Pick your numbers"
      title="Keno"
      soundOn={soundOn}
      onToggleSound={toggle}
    >
      <ScoreStrip
        label="Score"
        items={[
          { label: "Balance", value: money(balance) },
          { label: "Bet", value: money(bet) },
          { label: "Last Win", value: money(lastWin) },
        ]}
      />

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
          <button className="stepper" type="button" onClick={decrease} disabled={atMin}>-</button>
          <input type="range" min={min} max={max} step="10" value={bet} onChange={(e) => setBet(Number(e.target.value))} aria-label="Bet amount" />
          <button className="stepper" type="button" onClick={increase} disabled={atMax}>+</button>
          <button className="spin-button" type="button" onClick={go} disabled={picks.size === 0 || balance < bet}>Draw</button>
        </section>
      )}

      {phase === "done" && (
        <section className="mini-controls">
          {balance < min
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
    </GameShell>
  );
}
