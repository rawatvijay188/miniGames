import { useState } from "react";
import { useGame, useCoins, GameShell, ScoreStrip, Paytable, money, sleep } from "../../gdk";

const SUITS = [
  { symbol: "♠", color: "ink" },
  { symbol: "♥", color: "rose" },
  { symbol: "♦", color: "rose" },
  { symbol: "♣", color: "ink" }
];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function randomCard() {
  const rankIndex = Math.floor(Math.random() * RANKS.length);
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rank: RANKS[rankIndex], value: rankIndex, ...suit };
}

function CardFace({ card, flash }) {
  if (!card) {
    return <div className="playing-card is-back war-card" aria-hidden="true" />;
  }
  return (
    <div className={`playing-card card-${card.color} war-card ${flash ? `flash-${flash}` : ""}`}>
      <span className="card-rank">{card.rank}</span>
      <span className="card-suit">{card.symbol}</span>
    </div>
  );
}

export default function HighCardWar() {
  const { refillWallet } = useCoins();
  const game = useGame({
    bet: { initial: 20, min: 10, max: 100, step: 10 },
    idleMessage: "Draw a card to battle the dealer.",
  });
  const { bet, balance, busy, message, soundOn, toggle, sfx } = game;
  const [player, setPlayer] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [result, setResult] = useState(null); // "win" | "lose" | "push"

  const draw = () =>
    game.run(async () => {
      game.stake();
      setResult(null);
      setPlayer(null);
      setDealer(null);
      game.setMessage("Drawing...");
      sfx.click();

      // Flash a few random faces for a draw effect.
      for (let i = 0; i < 5; i += 1) {
        setPlayer(randomCard());
        setDealer(randomCard());
        await sleep(80);
      }

      const p = randomCard();
      const d = randomCard();
      setPlayer(p);
      setDealer(d);
      await sleep(260);

      const multiplier = p.value > d.value ? 2 : p.value === d.value ? 1 : 0;
      const { outcome } = game.settleBet({
        multiplier,
        winMessage: () => `${p.rank} beats ${d.rank} — won ${money(bet)}!`,
        loseMessage: () => `${d.rank} beats ${p.rank} — lost ${money(bet)}.`,
      });
      if (outcome === "push") game.setMessage(`Both ${p.rank} — push, bet returned.`);
      setResult(outcome);
    });

  const refill = () => {
    sfx.click();
    refillWallet();
    game.setBet(20);
    setResult(null);
    setPlayer(null);
    setDealer(null);
    game.setMessage("Chips refilled. Draw to battle.");
  };

  const broke = balance < game.min;

  return (
    <GameShell
      label="High Card War game"
      kicker="High card wins"
      title="High Card War"
      soundOn={soundOn}
      onToggleSound={toggle}
      rules={
        <>
          <p><strong>Goal:</strong> Draw a higher card than the dealer to win.</p>
          <ul>
            <li>Set your bet and press <strong>Draw</strong>. You and the dealer each get one card.</li>
            <li>The <strong>higher card wins</strong>. Card order is 2 (lowest) up to <strong>Ace (highest)</strong>.</li>
            <li>Win and you're paid <strong>1:1</strong> (double your bet).</li>
            <li>A <strong>tie</strong> is a push — your bet is returned.</li>
            <li>Draw a lower card and you lose the bet.</li>
          </ul>
        </>
      }
    >
      <ScoreStrip
        items={[
          { label: "Balance", value: money(balance) },
          { label: "Bet", value: money(bet) },
          { label: "Result", value: result ? cap(result) : "—" },
        ]}
      />

      <section className="war-table" aria-live="polite">
        <div className="war-side">
          <span>You</span>
          <CardFace card={player} flash={result} />
        </div>
        <div className="versus">VS</div>
        <div className="war-side">
          <span>Dealer</span>
          <CardFace card={dealer} flash={result === "win" ? "lose" : result === "lose" ? "win" : result} />
        </div>
      </section>

      <div className={`win-banner ${result === "win" ? "is-win" : ""}`} role="status">{message}</div>

      {broke ? (
        <section className="coin-controls">
          <button className="spin-button" type="button" onClick={refill}>Refill chips</button>
        </section>
      ) : (
        <section className="mini-controls" aria-label="Controls">
          <button className="stepper" type="button" onClick={game.decrease} disabled={busy || game.atMin}>-</button>
          <input type="range" min={game.min} max={game.max} step="10" value={bet} onChange={(e) => game.setBet(Number(e.target.value))} aria-label="Bet amount" disabled={busy} />
          <button className="stepper" type="button" onClick={game.increase} disabled={busy || game.atMax}>+</button>
          <button className="spin-button" type="button" onClick={draw} disabled={busy || !game.canBet}>Draw</button>
        </section>
      )}

      <Paytable
        label="Rules"
        rows={[
          { label: "Higher card", value: "Win 1:1" },
          { label: "Tie", value: "Push" },
          { label: "Lower card", value: "Lose" },
          { label: "Ace", value: "Highest" },
        ]}
      />
    </GameShell>
  );
}

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
