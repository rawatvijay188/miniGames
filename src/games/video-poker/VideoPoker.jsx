import { useState } from "react";
import { useBet, useSound, useCoins, GameShell, ScoreStrip, money, sleep, playTone } from "../../gdk";
import { buildDeck, shuffle, evaluateHand, HAND_RANKS } from "./pokerLogic.js";

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
  const { soundOn, toggle, sfx } = useSound();
  const { bet, setBet, increase, decrease, atMin, atMax, min, max } = useBet({
    initial: 20, min: 10, max: 100, step: 10, onChange: () => sfx.bet(),
  });

  const [hand, setHand] = useState([null, null, null, null, null]);
  const [drawDeck, setDrawDeck] = useState([]);
  const [held, setHeld] = useState(new Set());
  const [phase, setPhase] = useState("betting"); // betting | dealt | drawn
  const [handResult, setHandResult] = useState(null);
  const [message, setMessage] = useState("Bet and deal to start.");
  const [busy, setBusy] = useState(false);

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
      sfx.jackpot();
    } else {
      setMessage("No win. Try again.");
      sfx.lose();
    }
    setBusy(false);
  };

  const nextHand = () => {
    sfx.click();
    setPhase("betting");
    setHand([null, null, null, null, null]);
    setHeld(new Set());
    setHandResult(null);
    setBet(bet, balance);
    setMessage(balance < min ? "Out of chips." : "Bet and deal to start.");
  };

  const refill = () => {
    sfx.click();
    refillWallet();
    setBet(20);
    setPhase("betting");
    setHand([null, null, null, null, null]);
    setHeld(new Set());
    setHandResult(null);
    setMessage("Chips refilled. Bet and deal.");
  };

  return (
    <GameShell
      label="Video Poker game"
      kicker="Jacks or better"
      title="Video Poker"
      soundOn={soundOn}
      onToggleSound={toggle}
      rules={
        <>
          <p><strong>Goal:</strong> Make the best five-card poker hand — pairs of Jacks or better pay out.</p>
          <ul>
            <li>Set your bet and press <strong>Deal</strong> to get five cards.</li>
            <li><strong>Tap any cards to hold</strong> them, then press <strong>Draw</strong> to replace the rest.</li>
            <li>Your final hand is scored on the paytable, from a <strong>pair of Jacks</strong> up to a <strong>Royal Flush</strong>.</li>
            <li>Better hands pay much more — a flush, full house, or four of a kind are big wins.</li>
            <li>Anything lower than a pair of Jacks pays nothing.</li>
          </ul>
        </>
      }
    >
      <ScoreStrip
        label="Score"
        items={[
          { label: "Balance", value: money(balance) },
          { label: "Bet", value: money(bet) },
          { label: "Hand", value: handResult ? handResult.name : "—" },
        ]}
      />

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
          <button className="stepper" type="button" onClick={decrease} disabled={atMin}>-</button>
          <input type="range" min={min} max={max} step="10" value={bet} onChange={(e) => setBet(Number(e.target.value))} aria-label="Bet amount" />
          <button className="stepper" type="button" onClick={increase} disabled={atMax}>+</button>
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
          {balance < min
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
    </GameShell>
  );
}
