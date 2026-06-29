import { useState } from "react";
import { useGame, GameShell, ScoreStrip, Paytable, money, sleep, playTone } from "../../gdk";
import { NUMBERS, OUTSIDE_BETS, numColor, spinWheel, settle } from "./rouletteLogic.js";

export default function Roulette() {
  const game = useGame({
    bet: { initial: 20, min: 10, max: 100, step: 10 },
    idleMessage: "Choose a bet and spin.",
  });
  const { bet, balance, busy, message, lastWin, soundOn, toggle, sfx, min, max } = game;

  const [selection, setSelection] = useState("red");
  const [result, setResult] = useState(null);
  const [spinNum, setSpinNum] = useState(null);

  const select = (value) => {
    if (busy) return;
    playTone(soundOn, 340, 0.04);
    setSelection(value);
  };

  const spin = () =>
    game.run(async () => {
      game.stake();
      setResult(null);
      game.setLastWin(0);
      game.setMessage("Spinning…");
      sfx.start();

      const winNum = spinWheel();
      for (let i = 0; i < 16; i += 1) {
        setSpinNum(Math.floor(Math.random() * 37));
        playTone(soundOn, 280 + i * 14, 0.02);
        await sleep(55 + i * 11);
      }
      setSpinNum(null);
      setResult(winNum);

      // Roulette displays profit (not the full return) as "Last Win", and pays
      // stake + profit, so it settles manually rather than via game.settleBet.
      const mult = settle(selection, winNum);
      const won = mult > 0 ? bet * mult : 0;
      if (mult === 35) {
        game.setMessage(`${winNum}! Straight up — won ${money(won)}!`);
        sfx.jackpot();
      } else if (mult === 1) {
        game.setMessage(`${winNum} — won ${money(won)}!`);
        sfx.win();
      } else {
        game.setMessage(`${winNum} — no win.`);
        sfx.lose();
      }

      if (won > 0) game.setBalance((b) => b + bet + won);
      game.setLastWin(won);
      game.reclamp(balance - bet + (won > 0 ? bet + won : 0));
    });

  const displayNum = result !== null ? result : spinNum;
  const displayColor = displayNum !== null ? numColor(displayNum) : null;

  return (
    <GameShell
      label="Roulette game"
      kicker="European wheel"
      title="Roulette"
      soundOn={soundOn}
      onToggleSound={toggle}
      rules={
        <>
          <p><strong>Goal:</strong> Predict where the ball lands on the European wheel (numbers 0–36).</p>
          <ul>
            <li>Place a bet on an <strong>outside</strong> option — red/black, odd/even, or high/low — which pays <strong>1:1</strong>.</li>
            <li>Or bet <strong>straight-up</strong> on a single number for a <strong>35:1</strong> payout.</li>
            <li>Press <strong>Spin</strong> and the wheel picks a winning number.</li>
            <li>The green <strong>0</strong> is neither red/black nor odd/even — outside bets lose when it hits.</li>
            <li>Higher risk (single numbers) means a much bigger reward.</li>
          </ul>
        </>
      }
    >
      <ScoreStrip
        label="Score"
        items={[
          { label: "Balance", value: money(balance) },
          { label: "Bet", value: money(bet) },
          { label: "Last Win", value: money(lastWin) },
        ]}
      />

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
        <button className="stepper" type="button" onClick={game.decrease} disabled={busy || game.atMin}>-</button>
        <input type="range" min={min} max={max} step="10" value={bet} onChange={(e) => game.setBet(Number(e.target.value))} aria-label="Bet amount" disabled={busy} />
        <button className="stepper" type="button" onClick={game.increase} disabled={busy || game.atMax}>+</button>
        <button className="spin-button" type="button" onClick={spin} disabled={busy || !game.canBet}>
          {game.canBet ? "Spin" : "No funds"}
        </button>
      </section>

      <Paytable
        label="Payouts"
        rows={[
          { label: "Red / Black", value: "1:1" },
          { label: "Odd / Even", value: "1:1" },
          { label: "1–18 / 19–36", value: "1:1" },
          { label: "Any number", value: "35:1" },
        ]}
      />
    </GameShell>
  );
}
