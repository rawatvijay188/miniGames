import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import RulesModal from "../../components/RulesModal.jsx";
import { generateCard, evaluateCard, SYMBOLS } from "./scratchLogic.js";

const INITIAL_BALANCE = 300;
const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;

function clampBet(next, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, next));
}

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
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(INITIAL_BET);
  const [card, setCard] = useState(() => generateCard());
  const [revealed, setRevealed] = useState(new Set());
  const [winRows, setWinRows] = useState(new Set());
  const [totalWin, setTotalWin] = useState(0);
  const [phase, setPhase] = useState("buying"); // buying | scratching | done
  const [message, setMessage] = useState("Buy a card to scratch.");
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const updateBet = (next) => {
    if (phase !== "buying") return;
    playTone(soundOn, 320, 0.05);
    setBet(clampBet(next, balance));
  };

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

  const settle = (cells, rev) => {
    const { totalMult, winRows: wr } = evaluateCard(cells);
    setWinRows(wr);
    const payout = totalMult * bet;
    if (payout > 0) {
      setBalance((b) => b + payout);
      setTotalWin(payout);
      setMessage(`You won ${money(payout)}!`);
      playTone(soundOn, 760, 0.16);
      setTimeout(() => playTone(soundOn, 880, 0.18), 120);
    } else {
      setMessage("No match. Try another card.");
      playTone(soundOn, 180, 0.22);
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
      settle(card, nextRev);
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
    settle(card, all);
  };

  const newCard = () => {
    playTone(soundOn, 320, 0.05);
    setPhase("buying");
    setTotalWin(0);
    setBet((b) => clampBet(b, balance));
    setMessage("Buy a card to scratch.");
  };

  const refill = () => {
    playTone(soundOn, 320, 0.05);
    setBalance(INITIAL_BALANCE);
    setBet(INITIAL_BET);
    setPhase("buying");
    setTotalWin(0);
    setMessage("Chips refilled. Buy a card.");
  };

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Scratch Card game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Instant win</p>
            <h1>Scratch Card</h1>
          </div>
          <div className="bj-header-actions">
            <button
              className={`icon-button ${soundOn ? "" : "is-muted"}`}
              type="button"
              onClick={() => { playTone(true, 320, 0.05); setSoundOn((s) => !s); }}
              aria-label="Toggle sound"
              title="Toggle sound"
            >♪</button>
            <RulesModal title="Scratch Card">
              <p><strong>Goal:</strong> Scratch the card to reveal symbols and match three in a row to win.</p>
              <ul>
                <li>Set your bet to buy a card, then <strong>scratch the panels</strong> to reveal what's underneath.</li>
                <li>Match <strong>three of the same symbol in a row</strong> to win a prize.</li>
                <li>Each symbol has its own payout — the <strong>diamond row pays 50×</strong> your bet.</li>
                <li>No matching row means no win — buy another card and try again.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Score">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Card cost</span><strong>{money(bet)}</strong></div>
          <div><span>Won</span><strong>{money(totalWin)}</strong></div>
        </section>

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
            <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={bet <= MIN_BET}>-</button>
            <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Card cost" />
            <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={bet >= MAX_BET || bet >= balance}>+</button>
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
            {balance < MIN_BET
              ? <button className="spin-button" type="button" onClick={refill} style={{ gridColumn: "1 / -1" }}>Refill chips</button>
              : <button className="spin-button" type="button" onClick={newCard} style={{ gridColumn: "1 / -1" }}>New card</button>
            }
          </section>
        )}

        <section className="paytable" aria-label="Payouts">
          {SYMBOLS.map((s) => (
            <div key={s.id}>
              <span>{s.emoji} {s.emoji} {s.emoji}</span>
              <strong>{s.mult}x</strong>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
