import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import {
  buildDeck,
  shuffle,
  handValue,
  isBlackjack,
  DEALER_STANDS_ON,
  BLACKJACK
} from "./deck.js";
import { useCoins } from "../../context/CoinContext.jsx";

const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;
const DEAL_DELAY_MS = 320;

// Phases: "betting" -> "player" -> "dealer" -> "done"
function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

function Card({ card, hidden }) {
  if (hidden) {
    return <div className="playing-card is-back" aria-label="Face down card" />;
  }
  return (
    <div className={`playing-card card-${card.color}`} aria-label={`${card.rank} of ${card.suit}`}>
      <span className="card-rank">{card.rank}</span>
      <span className="card-suit">{card.symbol}</span>
    </div>
  );
}

function Hand({ label, cards, total, hideHole, flash }) {
  const shownTotal = hideHole ? "?" : total;
  return (
    <div className="bj-hand">
      <div className="bj-hand-head">
        <span>{label}</span>
        <strong>{shownTotal}</strong>
      </div>
      <div className={`bj-cards ${flash ? `flash-${flash}` : ""}`}>
        {cards.map((card, index) => (
          <Card key={`${card.rank}-${card.suit}-${index}`} card={card} hidden={hideHole && index === 1} />
        ))}
      </div>
    </div>
  );
}

export default function Blackjack() {
  const { balance, setBalance, refillWallet } = useCoins();
  const [bet, setBet] = useState(INITIAL_BET);
  const [deck, setDeck] = useState([]);
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [phase, setPhase] = useState("betting");
  const [message, setMessage] = useState("Place your bet and deal.");
  const [busy, setBusy] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [result, setResult] = useState(null); // "win" | "lose" | "push" — drives card flash

  const playerTotal = handValue(player);
  const dealerTotal = handValue(dealer);
  const canDouble = phase === "player" && player.length === 2 && balance >= bet;

  const playClick = () => playTone(soundOn, 320, 0.05);
  const playDeal = () => playTone(soundOn, 460, 0.06);
  const playWin = () => {
    playTone(soundOn, 523, 0.12);
    setTimeout(() => playTone(soundOn, 784, 0.16), 120);
  };
  const playLose = () => playTone(soundOn, 150, 0.26);
  const playPush = () => playTone(soundOn, 330, 0.12);

  const updateBet = (nextBet) => {
    if (phase !== "betting") return;
    playClick();
    setBet(clampBet(nextBet, balance));
  };

  // Draws a card from the working deck, reshuffling a fresh one if needed.
  const drawFrom = (workingDeck) => {
    let cards = workingDeck;
    if (cards.length === 0) {
      cards = shuffle(buildDeck());
    }
    const [card, ...rest] = cards;
    return [card, rest];
  };

  const deal = () => {
    if (busy || balance < bet) return;
    playDeal();
    setResult(null);

    let working = shuffle(buildDeck());
    const playerCards = [];
    const dealerCards = [];

    let card;
    [card, working] = drawFrom(working);
    playerCards.push(card);
    [card, working] = drawFrom(working);
    dealerCards.push(card);
    [card, working] = drawFrom(working);
    playerCards.push(card);
    [card, working] = drawFrom(working);
    dealerCards.push(card);

    setBalance((b) => b - bet);
    setDeck(working);
    setPlayer(playerCards);
    setDealer(dealerCards);

    const playerBj = isBlackjack(playerCards);
    const dealerBj = isBlackjack(dealerCards);

    if (playerBj || dealerBj) {
      settleBlackjack(playerCards, dealerCards, playerBj, dealerBj);
      return;
    }

    setPhase("player");
    setMessage("Hit or stand?");
  };

  const settleBlackjack = (playerCards, dealerCards, playerBj, dealerBj) => {
    setPhase("done");
    if (playerBj && dealerBj) {
      setBalance((b) => b + bet);
      setMessage("Both blackjack — push.");
      setResult("push");
      playPush();
    } else if (playerBj) {
      setBalance((b) => b + Math.floor(bet * 2.5));
      setMessage(`Blackjack! Won ${money(Math.floor(bet * 1.5))}.`);
      setResult("win");
      playWin();
    } else {
      setMessage("Dealer has blackjack. You lose.");
      setResult("lose");
      playLose();
    }
  };

  const hit = () => {
    if (phase !== "player" || busy) return;
    playDeal();
    const [card, rest] = drawFrom(deck);
    const nextPlayer = [...player, card];
    setDeck(rest);
    setPlayer(nextPlayer);

    const total = handValue(nextPlayer);
    if (total > BLACKJACK) {
      setPhase("done");
      setMessage(`Bust at ${total}. You lose.`);
      setResult("lose");
      playLose();
    } else if (total === BLACKJACK) {
      stand(nextPlayer);
    }
  };

  const doubleDown = async () => {
    if (!canDouble || busy) return;
    playDeal();
    setBalance((b) => b - bet);
    const doubled = bet * 2;
    setBet(doubled);

    const [card, rest] = drawFrom(deck);
    const nextPlayer = [...player, card];
    setDeck(rest);
    setPlayer(nextPlayer);

    const total = handValue(nextPlayer);
    if (total > BLACKJACK) {
      setPhase("done");
      setMessage(`Bust at ${total}. You lose.`);
      setResult("lose");
      playLose();
      return;
    }
    await dealerPlay(nextPlayer, rest, doubled);
  };

  const stand = (playerCards = player) => {
    if (phase !== "player" || busy) return;
    playClick();
    dealerPlay(playerCards, deck, bet);
  };

  const dealerPlay = async (playerCards, workingDeck, activeBet) => {
    setBusy(true);
    setPhase("dealer");
    setMessage("Dealer plays...");

    let working = workingDeck;
    let dealerCards = [...dealer];
    setDealer(dealerCards);
    await sleep(DEAL_DELAY_MS);

    while (handValue(dealerCards) < DEALER_STANDS_ON) {
      let card;
      [card, working] = drawFrom(working);
      dealerCards = [...dealerCards, card];
      setDealer(dealerCards);
      setDeck(working);
      playDeal();
      await sleep(DEAL_DELAY_MS);
    }

    settle(playerCards, dealerCards, activeBet);
    setBusy(false);
  };

  const settle = (playerCards, dealerCards, activeBet) => {
    const pTotal = handValue(playerCards);
    const dTotal = handValue(dealerCards);
    setPhase("done");

    if (dTotal > BLACKJACK) {
      setBalance((b) => b + activeBet * 2);
      setMessage(`Dealer busts at ${dTotal}. You win ${money(activeBet)}.`);
      setResult("win");
      playWin();
    } else if (pTotal > dTotal) {
      setBalance((b) => b + activeBet * 2);
      setMessage(`You win ${money(activeBet)} with ${pTotal}.`);
      setResult("win");
      playWin();
    } else if (pTotal === dTotal) {
      setBalance((b) => b + activeBet);
      setMessage(`Push at ${pTotal}.`);
      setResult("push");
      playPush();
    } else {
      setMessage(`Dealer wins ${dTotal} to ${pTotal}.`);
      setResult("lose");
      playLose();
    }
  };

  const nextRound = () => {
    playClick();
    setResult(null);
    setPhase("betting");
    setPlayer([]);
    setDealer([]);
    setBet((b) => clampBet(b, balance));
    setMessage(balance < MIN_BET ? "Out of chips. Refill to keep playing." : "Place your bet and deal.");
  };

  const refill = () => {
    playClick();
    setResult(null);
    refillWallet();
    setBet(INITIAL_BET);
    setPhase("betting");
    setPlayer([]);
    setDealer([]);
    setMessage("Chips refilled. Place your bet and deal.");
  };

  const toggleSound = () => {
    // Play the click first so unmuting still gives audible feedback.
    playTone(true, 320, 0.05);
    setSoundOn((on) => !on);
  };

  const openRules = () => {
    playClick();
    setShowRules(true);
  };

  const hideHole = phase === "player" || phase === "betting";

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Blackjack game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Card table</p>
            <h1>Blackjack</h1>
          </div>
          <div className="bj-header-actions">
            <button
              className={`icon-button ${soundOn ? "" : "is-muted"}`}
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? "Mute sound" : "Unmute sound"}
              title={soundOn ? "Mute sound" : "Unmute sound"}
            >
              {soundOn ? "♪" : "♪̸"}
            </button>
            <button className="rules-button" type="button" onClick={openRules}>
              Rules
            </button>
          </div>
        </header>

        <section className="score-strip" aria-label="Score">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Bet</span><strong>{money(bet)}</strong></div>
          <div><span>Result</span><strong>{phase === "done" ? "Round over" : phase === "betting" ? "Ready" : "In play"}</strong></div>
        </section>

        <section className="card-table" aria-live="polite">
          <Hand label="Dealer" cards={dealer} total={dealerTotal} hideHole={hideHole} flash={null} />
          <div className="bj-message" role="status">{message}</div>
          <Hand label="You" cards={player} total={playerTotal} hideHole={false} flash={result} />
        </section>

        {phase === "betting" && (
          <section className="mini-controls" aria-label="Bet controls">
            <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={bet <= MIN_BET}>-</button>
            <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" />
            <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={bet >= MAX_BET || bet >= balance}>+</button>
            <button className="spin-button" type="button" onClick={deal} disabled={balance < bet || balance < MIN_BET}>Deal</button>
          </section>
        )}

        {phase === "player" && (
          <section className="bj-actions" aria-label="Player actions">
            <button className="spin-button" type="button" onClick={hit} disabled={busy}>Hit</button>
            <button className="spin-button" type="button" onClick={() => stand()} disabled={busy}>Stand</button>
            <button className="stepper bj-double" type="button" onClick={doubleDown} disabled={!canDouble || busy}>Double</button>
          </section>
        )}

        {(phase === "dealer") && (
          <section className="bj-actions" aria-label="Dealer turn">
            <button className="spin-button" type="button" disabled>Dealer playing...</button>
          </section>
        )}

        {phase === "done" && (
          <section className="bj-actions" aria-label="Next round">
            {balance < MIN_BET ? (
              <button className="spin-button" type="button" onClick={refill}>Refill chips</button>
            ) : (
              <button className="spin-button" type="button" onClick={nextRound}>Next hand</button>
            )}
          </section>
        )}

        <section className="paytable" aria-label="Payouts">
          <div><span>Blackjack pays</span><strong>3:2</strong></div>
          <div><span>Win pays</span><strong>1:1</strong></div>
          <div><span>Dealer stands</span><strong>17</strong></div>
          <div><span>Ace</span><strong>1 / 11</strong></div>
        </section>
      </section>

      {showRules && (
        <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="Blackjack rules" onClick={() => setShowRules(false)}>
          <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
            <header className="rules-modal-head">
              <h2>How to play Blackjack</h2>
              <button className="icon-button" type="button" onClick={() => setShowRules(false)} aria-label="Close rules">×</button>
            </header>
            <div className="rules-body">
              <p><strong>Goal:</strong> Beat the dealer by getting a hand total closer to 21 — without going over.</p>
              <ul>
                <li>Place your bet, then press <strong>Deal</strong>. You and the dealer each get two cards; the dealer keeps one card face down.</li>
                <li>Number cards are worth their value, face cards (J, Q, K) are worth 10, and an <strong>Ace</strong> counts as <strong>1 or 11</strong> — whichever helps you most. (Example: Ace + 9 + 5 → the Ace becomes 1 so you total 15 instead of busting at 25.)</li>
                <li><strong>Hit</strong> to take another card. <strong>Stand</strong> to keep your hand and end your turn.</li>
                <li><strong>Double Down</strong> doubles your bet and gives you exactly one more card (available on your first two cards only).</li>
                <li>Go over 21 and you <strong>bust</strong> — you lose immediately.</li>
                <li>When you stand, the dealer reveals the hidden card and must keep drawing until reaching <strong>17</strong> or higher, then stops.</li>
              </ul>
              <p><strong>Payouts:</strong></p>
              <ul>
                <li>A natural <strong>Blackjack</strong> (Ace + a 10-value card on your first two cards) pays <strong>3:2</strong> — bet $20 and you win $30.</li>
                <li>Any other win pays <strong>1:1</strong> — bet $20 and you win $20 (you get $40 back).</li>
                <li>A tie is a <strong>push</strong> — your bet is returned, nobody wins.</li>
                <li>Lose or bust and you forfeit your bet.</li>
              </ul>
            </div>
            <button className="spin-button" type="button" onClick={() => setShowRules(false)}>Got it</button>
          </div>
        </div>
      )}
    </main>
  );
}
