import { useState } from "react";
import { useSound, useCoins, GameShell, ScoreStrip, Paytable, clampBet, money, sleep, playTone } from "../../gdk";
import {
  buildDeck,
  shuffle,
  handValue,
  isBlackjack,
  DEALER_STANDS_ON,
  BLACKJACK
} from "./deck.js";

const MIN_BET = 10;
const MAX_BET = 100;
const BET_RANGE = { min: MIN_BET, max: MAX_BET };
const DEAL_DELAY_MS = 320;

// Phases: "betting" -> "player" -> "dealer" -> "done"

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
  const { soundOn, toggle, sfx } = useSound();
  // Blackjack keeps its own bet state (not useBet) because Double Down sets the
  // bet to 2× — which can exceed the normal max — for the rest of the round.
  const [bet, setBet] = useState(20);
  const [deck, setDeck] = useState([]);
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [phase, setPhase] = useState("betting");
  const [message, setMessage] = useState("Place your bet and deal.");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // "win" | "lose" | "push" — drives card flash

  const playerTotal = handValue(player);
  const dealerTotal = handValue(dealer);
  const canDouble = phase === "player" && player.length === 2 && balance >= bet;

  const playWin = () => sfx.jackpot();
  const playLose = () => sfx.lose();
  const playPush = () => playTone(soundOn, 330, 0.12);

  const updateBet = (nextBet) => {
    if (phase !== "betting") return;
    sfx.click();
    setBet(clampBet(nextBet, balance, BET_RANGE));
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
    playTone(soundOn, 460, 0.06);
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
    playTone(soundOn, 460, 0.06);
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
    playTone(soundOn, 460, 0.06);
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
    sfx.click();
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
      playTone(soundOn, 460, 0.06);
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
    sfx.click();
    setResult(null);
    setPhase("betting");
    setPlayer([]);
    setDealer([]);
    setBet((b) => clampBet(b, balance, BET_RANGE));
    setMessage(balance < MIN_BET ? "Out of chips. Refill to keep playing." : "Place your bet and deal.");
  };

  const refill = () => {
    sfx.click();
    setResult(null);
    refillWallet();
    setBet(20);
    setPhase("betting");
    setPlayer([]);
    setDealer([]);
    setMessage("Chips refilled. Place your bet and deal.");
  };

  const hideHole = phase === "player" || phase === "betting";

  return (
    <GameShell
      label="Blackjack game"
      kicker="Card table"
      title="Blackjack"
      soundOn={soundOn}
      onToggleSound={toggle}
      rules={
        <>
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
        </>
      }
    >
      <ScoreStrip
        label="Score"
        items={[
          { label: "Balance", value: money(balance) },
          { label: "Bet", value: money(bet) },
          { label: "Result", value: phase === "done" ? "Round over" : phase === "betting" ? "Ready" : "In play" },
        ]}
      />

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

      <Paytable
        label="Payouts"
        rows={[
          { label: "Blackjack pays", value: "3:2" },
          { label: "Win pays", value: "1:1" },
          { label: "Dealer stands", value: "17" },
          { label: "Ace", value: "1 / 11" },
        ]}
      />
    </GameShell>
  );
}
