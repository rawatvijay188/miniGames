import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import RulesModal from "../../components/RulesModal.jsx";
import { buildDeck, shuffle, evaluateHand, HAND_RANKS } from "./pokerLogic.js";
import { useCoins } from "../../context/CoinContext.jsx";

const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;

function clampBet(next, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, next));
}

function CardSlot({ card, held, phase, onToggle }) {
  if (!card) {
    return (
      <div className="vp-slot">
        <div className="playing-card is-back" aria-label="Empty slot" />
      </div>
    );
  }
  return (
    <div className={`vp-slot${held ? " is-held" : ""}`}>
      {phase === "dealt" && (
        <button
          className={`hold-badge${held ? " hold-active" : ""}`}
          type="button"
          onClick={onToggle}
          aria-label={held ? "Unhold" : "Hold"}
        >
          {held ? "HELD" : "HOLD"}
        </button>
      )}
      <div className={`playing-card card-${card.color}`} aria-label={`${card.rank} of ${card.suit}`}>
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{card.symbol}</span>
      </div>
    </div>
  );
}

export default function VideoPoker() {
  const { balance, setBalance, refillWallet } = useCoins();
  const [bet, setBet] = useState(INITIAL_BET);
  const [hand, setHand] = useState([null, null, null, null, null]);
  const [drawDeck, setDrawDeck] = useState([]);
  const [held, setHeld] = useState(new Set());
  const [phase, setPhase] = useState("betting"); // betting | dealt | drawn
  const [handResult, setHandResult] = useState(null);
  const [message, setMessage] = useState("Bet and deal to start.");
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const updateBet = (next) => {
    if (phase !== "betting") return;
    playTone(soundOn, 320, 0.05);
    setBet(clampBet(next, balance));
  };

  const deal = async () => {
    if (busy || balance < bet) return;
    setBusy(true);
    setBalance((b) => b - bet);
    setHeld(new Set());
    setHandResult(null);
    playTone(soundOn, 460, 0.06);

    const d = shuffle(buildDeck());
    const dealt = d.slice(0, 5);
    const rest = d.slice(5);

    const newHand = [null, null, null, null, null];
    for (let i = 0; i < 5; i += 1) {
      newHand[i] = dealt[i];
      setHand([...newHand]);
      playTone(soundOn, 400 + i * 18, 0.05);
      await sleep(150);
    }

    setDrawDeck(rest);
    setPhase("dealt");
    setMessage("Choose cards to hold, then Draw.");
    setBusy(false);
  };

  const toggleHold = (i) => {
    if (phase !== "dealt") return;
    playTone(soundOn, 380, 0.04);
    setHeld((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const draw = async () => {
    if (phase !== "dealt" || busy) return;
    setBusy(true);
    playTone(soundOn, 480, 0.06);

    let workDeck = [...drawDeck];
    const newHand = [...hand];

    for (let i = 0; i < 5; i += 1) {
      if (!held.has(i)) {
        newHand[i] = workDeck.shift();
        setHand([...newHand]);
        playTone(soundOn, 380 + i * 16, 0.05);
        await sleep(150);
      }
    }
    setDrawDeck(workDeck);

    const result = evaluateHand(newHand);
    setHandResult(result);
    setPhase("drawn");

    if (result.mult > 0) {
      const won = bet * result.mult;
      setBalance((b) => b + won);
      setMessage(`${result.name}! Won ${money(won)}.`);
      playTone(soundOn, 600, 0.12);
      setTimeout(() => playTone(soundOn, 760, 0.16), 120);
    } else {
      setMessage("No win. Try again.");
      playTone(soundOn, 160, 0.22);
    }
    setBusy(false);
  };

  const nextHand = () => {
    playTone(soundOn, 320, 0.05);
    setPhase("betting");
    setHand([null, null, null, null, null]);
    setHeld(new Set());
    setHandResult(null);
    setBet((b) => clampBet(b, balance));
    setMessage(balance < MIN_BET ? "Out of chips." : "Bet and deal to start.");
  };

  const refill = () => {
    playTone(soundOn, 320, 0.05);
    refillWallet();
    setBet(INITIAL_BET);
    setPhase("betting");
    setHand([null, null, null, null, null]);
    setHeld(new Set());
    setHandResult(null);
    setMessage("Chips refilled. Bet and deal.");
  };

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Video Poker game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Jacks or better</p>
            <h1>Video Poker</h1>
          </div>
          <div className="bj-header-actions">
            <button
              className={`icon-button ${soundOn ? "" : "is-muted"}`}
              type="button"
              onClick={() => { playTone(true, 320, 0.05); setSoundOn((s) => !s); }}
              aria-label="Toggle sound"
              title="Toggle sound"
            >♪</button>
            <RulesModal title="Video Poker">
              <p><strong>Goal:</strong> Make the best five-card poker hand — pairs of Jacks or better pay out.</p>
              <ul>
                <li>Set your bet and press <strong>Deal</strong> to get five cards.</li>
                <li><strong>Tap any cards to hold</strong> them, then press <strong>Draw</strong> to replace the rest.</li>
                <li>Your final hand is scored on the paytable, from a <strong>pair of Jacks</strong> up to a <strong>Royal Flush</strong>.</li>
                <li>Better hands pay much more — a flush, full house, or four of a kind are big wins.</li>
                <li>Anything lower than a pair of Jacks pays nothing.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Score">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Bet</span><strong>{money(bet)}</strong></div>
          <div><span>Hand</span><strong>{handResult ? handResult.name : "—"}</strong></div>
        </section>

        <div className={`win-banner${handResult?.mult > 0 ? " is-win" : ""}`} role="status">
          {message}
        </div>

        <section className="vp-hand" aria-label="Your hand" aria-live="polite">
          {hand.map((card, i) => (
            <CardSlot
              key={i}
              card={card}
              held={held.has(i)}
              phase={phase}
              onToggle={() => toggleHold(i)}
            />
          ))}
        </section>

        {phase === "betting" && (
          <section className="mini-controls">
            <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={bet <= MIN_BET}>-</button>
            <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" />
            <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={bet >= MAX_BET || bet >= balance}>+</button>
            <button className="spin-button" type="button" onClick={deal} disabled={busy || balance < bet}>Deal</button>
          </section>
        )}

        {phase === "dealt" && (
          <section className="mini-controls">
            <button className="spin-button" type="button" onClick={draw} disabled={busy} style={{ gridColumn: "1 / -1" }}>Draw</button>
          </section>
        )}

        {phase === "drawn" && (
          <section className="mini-controls">
            {balance < MIN_BET
              ? <button className="spin-button" type="button" onClick={refill} style={{ gridColumn: "1 / -1" }}>Refill chips</button>
              : <button className="spin-button" type="button" onClick={nextHand} style={{ gridColumn: "1 / -1" }}>Next hand</button>
            }
          </section>
        )}

        <section className="paytable vp-paytable" aria-label="Pay table">
          {HAND_RANKS.filter((h) => h.mult > 0).map((h) => (
            <div key={h.name} className={handResult?.name === h.name ? "is-hit" : ""}>
              <span>{h.name}</span>
              <strong>{h.mult}x</strong>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
