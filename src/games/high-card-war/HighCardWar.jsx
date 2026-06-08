import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import RulesModal from "../../components/RulesModal.jsx";
import { useCoins } from "../../context/CoinContext.jsx";

const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;

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

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
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
  const { balance, setBalance, refillWallet } = useCoins();
  const [bet, setBet] = useState(INITIAL_BET);
  const [player, setPlayer] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [result, setResult] = useState(null); // "win" | "lose" | "push"
  const [message, setMessage] = useState("Draw a card to battle the dealer.");
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const updateBet = (next) => {
    if (busy) return;
    playTone(soundOn, 320, 0.05);
    setBet(clampBet(next, balance));
  };

  const draw = async () => {
    if (busy || balance < bet) return;
    setBusy(true);
    setBalance((b) => b - bet);
    setResult(null);
    setPlayer(null);
    setDealer(null);
    setMessage("Drawing...");
    playTone(soundOn, 300, 0.06);

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

    if (p.value > d.value) {
      setBalance((b) => b + bet * 2);
      setResult("win");
      setMessage(`${p.rank} beats ${d.rank} — won ${money(bet)}!`);
      playTone(soundOn, 720, 0.14);
    } else if (p.value === d.value) {
      setBalance((b) => b + bet);
      setResult("push");
      setMessage(`Both ${p.rank} — push, bet returned.`);
      playTone(soundOn, 330, 0.12);
    } else {
      setResult("lose");
      setMessage(`${d.rank} beats ${p.rank} — lost ${money(bet)}.`);
      playTone(soundOn, 150, 0.26);
    }

    setBet((b) => clampBet(b, balance < bet ? balance : balance));
    setBusy(false);
  };

  const refill = () => {
    playTone(soundOn, 320, 0.05);
    refillWallet();
    setBet(INITIAL_BET);
    setResult(null);
    setPlayer(null);
    setDealer(null);
    setMessage("Chips refilled. Draw to battle.");
  };

  const broke = balance < MIN_BET;

  return (
    <main className="shell">
      <section className="mini-game" aria-label="High Card War game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">High card wins</p>
            <h1>High Card War</h1>
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
            <RulesModal title="High Card War">
              <p><strong>Goal:</strong> Draw a higher card than the dealer to win.</p>
              <ul>
                <li>Set your bet and press <strong>Draw</strong>. You and the dealer each get one card.</li>
                <li>The <strong>higher card wins</strong>. Card order is 2 (lowest) up to <strong>Ace (highest)</strong>.</li>
                <li>Win and you're paid <strong>1:1</strong> (double your bet).</li>
                <li>A <strong>tie</strong> is a push — your bet is returned.</li>
                <li>Draw a lower card and you lose the bet.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Status">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Bet</span><strong>{money(bet)}</strong></div>
          <div><span>Result</span><strong>{result ? cap(result) : "—"}</strong></div>
        </section>

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
            <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={busy || bet <= MIN_BET}>-</button>
            <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" disabled={busy} />
            <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={busy || bet >= MAX_BET || bet >= balance}>+</button>
            <button className="spin-button" type="button" onClick={draw} disabled={busy || balance < bet}>Draw</button>
          </section>
        )}

        <section className="paytable" aria-label="Rules">
          <div><span>Higher card</span><strong>Win 1:1</strong></div>
          <div><span>Tie</span><strong>Push</strong></div>
          <div><span>Lower card</span><strong>Lose</strong></div>
          <div><span>Ace</span><strong>Highest</strong></div>
        </section>
      </section>
    </main>
  );
}

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
