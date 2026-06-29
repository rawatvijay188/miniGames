import { useState } from "react";
import { useBet, useSound, useCoins, GameShell, ScoreStrip, Paytable, money, sleep, playTone } from "../../gdk";
import { generateCard, evaluateCard, SYMBOLS } from "./scratchLogic.js";

// Check which rows are fully revealed and winning — for progressive glow.
function partialWinRows(cells, rev) {
  const wins = new Set();
  for (let row = 0; row < 3; row += 1) {
    const indices = [row * 3, row * 3 + 1, row * 3 + 2];
    if (!indices.every((i) => rev.has(i))) continue;
    const [a, b, c] = indices.map((i) => cells[i]);
    if (a.id === b.id && b.id === c.id) wins.add(row);
  }
  return wins;
}

export default function ScratchCard() {
  const { balance, setBalance, refillWallet } = useCoins();
  const { soundOn, toggle, sfx } = useSound();
  const { bet, setBet, increase, decrease, atMin, atMax, min, max } = useBet({
    initial: 20, min: 10, max: 100, step: 10, onChange: () => sfx.bet(),
  });

  const [card, setCard] = useState(() => generateCard());
  const [revealed, setRevealed] = useState(new Set());
  const [winRows, setWinRows] = useState(new Set());
  const [totalWin, setTotalWin] = useState(0);
  const [phase, setPhase] = useState("buying"); // buying | scratching | done
  const [message, setMessage] = useState("Buy a card to scratch.");
  const [busy, setBusy] = useState(false);

  const buy = () => {
    if (balance < bet) return;
    playTone(soundOn, 480, 0.08);
    setBalance((b) => b - bet);
    setCard(generateCard());
    setRevealed(new Set());
    setWinRows(new Set());
    setTotalWin(0);
    setPhase("scratching");
    setMessage("Scratch the cells to reveal!");
  };

  const settle = (cells) => {
    const { totalMult, winRows: wr } = evaluateCard(cells);
    setWinRows(wr);
    const payout = totalMult * bet;
    if (payout > 0) {
      setBalance((b) => b + payout);
      setTotalWin(payout);
      setMessage(`You won ${money(payout)}!`);
      sfx.jackpot();
    } else {
      setMessage("No match. Try another card.");
      sfx.lose();
    }
    setPhase("done");
  };

  const scratch = (i) => {
    if (phase !== "scratching" || revealed.has(i)) return;
    playTone(soundOn, 340 + i * 12, 0.04);

    const nextRev = new Set(revealed);
    nextRev.add(i);
    setRevealed(nextRev);

    if (nextRev.size === 9) {
      settle(card);
    } else {
      setWinRows(partialWinRows(card, nextRev));
    }
  };

  const revealAll = async () => {
    if (phase !== "scratching" || busy) return;
    setBusy(true);

    const unrevealed = Array.from({ length: 9 }, (_, i) => i).filter((i) => !revealed.has(i));
    const all = new Set(revealed);

    for (const i of unrevealed) {
      all.add(i);
      setRevealed(new Set(all));
      setWinRows(partialWinRows(card, all));
      playTone(soundOn, 300 + i * 16, 0.03);
      await sleep(70);
    }

    setBusy(false);
    settle(card);
  };

  const newCard = () => {
    sfx.click();
    setPhase("buying");
    setTotalWin(0);
    setBet(bet, balance);
    setMessage("Buy a card to scratch.");
  };

  const refill = () => {
    sfx.click();
    refillWallet();
    setBet(20);
    setPhase("buying");
    setTotalWin(0);
    setMessage("Chips refilled. Buy a card.");
  };

  return (
    <GameShell
      label="Scratch Card game"
      kicker="Instant win"
      title="Scratch Card"
      soundOn={soundOn}
      onToggleSound={toggle}
      rules={
        <>
          <p><strong>Goal:</strong> Scratch the card to reveal symbols and match three in a row to win.</p>
          <ul>
            <li>Set your bet to buy a card, then <strong>scratch the panels</strong> to reveal what's underneath.</li>
            <li>Match <strong>three of the same symbol in a row</strong> to win a prize.</li>
            <li>Each symbol has its own payout — the <strong>diamond row pays 50×</strong> your bet.</li>
            <li>No matching row means no win — buy another card and try again.</li>
          </ul>
        </>
      }
    >
      <ScoreStrip
        label="Score"
        items={[
          { label: "Balance", value: money(balance) },
          { label: "Card cost", value: money(bet) },
          { label: "Won", value: money(totalWin) },
        ]}
      />

      <div className={`win-banner${totalWin > 0 ? " is-win" : ""}`} role="status">
        {message}
      </div>

      <section className="scratch-grid" aria-label="Scratch card" aria-live="polite">
        {card.map((sym, i) => {
          const row = Math.floor(i / 3);
          const isRevealed = revealed.has(i);
          const isWin = isRevealed && winRows.has(row);
          return (
            <button
              key={i}
              type="button"
              className={[
                "scratch-cell",
                isRevealed ? "is-revealed" : "",
                isWin ? "is-win-row" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => scratch(i)}
              disabled={isRevealed || phase !== "scratching"}
              aria-label={isRevealed ? `${sym.emoji}` : "Unscratched"}
            >
              {isRevealed ? sym.emoji : ""}
            </button>
          );
        })}
      </section>

      {phase === "buying" && (
        <section className="mini-controls">
          <button className="stepper" type="button" onClick={decrease} disabled={atMin}>-</button>
          <input type="range" min={min} max={max} step="10" value={bet} onChange={(e) => setBet(Number(e.target.value))} aria-label="Card cost" />
          <button className="stepper" type="button" onClick={increase} disabled={atMax}>+</button>
          <button className="spin-button" type="button" onClick={buy} disabled={balance < bet}>Buy Card</button>
        </section>
      )}

      {phase === "scratching" && (
        <section className="mini-controls">
          <button className="spin-button" type="button" onClick={revealAll} disabled={busy} style={{ gridColumn: "1 / -1" }}>
            Reveal All
          </button>
        </section>
      )}

      {phase === "done" && (
        <section className="mini-controls">
          {balance < min
            ? <button className="spin-button" type="button" onClick={refill} style={{ gridColumn: "1 / -1" }}>Refill chips</button>
            : <button className="spin-button" type="button" onClick={newCard} style={{ gridColumn: "1 / -1" }}>New card</button>
          }
        </section>
      )}

      <Paytable
        label="Payouts"
        rows={SYMBOLS.map((s) => ({ label: `${s.emoji} ${s.emoji} ${s.emoji}`, value: `${s.mult}x` }))}
      />
    </GameShell>
  );
}
