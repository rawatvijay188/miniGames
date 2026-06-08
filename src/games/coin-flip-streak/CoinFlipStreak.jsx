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

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

export default function CoinFlipStreak() {
  const { balance, setBalance, refillWallet } = useCoins();
  const [bet, setBet] = useState(INITIAL_BET);
  const [streak, setStreak] = useState(0);
  const [pot, setPot] = useState(0); // current winnings riding on the streak
  const [face, setFace] = useState("heads");
  const [flipping, setFlipping] = useState(false);
  const [message, setMessage] = useState("Pick heads or tails to start a streak.");
  const [inRound, setInRound] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const multiplier = streak === 0 ? 1 : Math.pow(2, streak);

  const updateBet = (next) => {
    if (inRound || flipping) return;
    playTone(soundOn, 320, 0.05);
    setBet(clampBet(next, balance));
  };

  const flip = async (call) => {
    if (flipping) return;
    if (!inRound && balance < bet) return;

    setFlipping(true);
    playTone(soundOn, 300, 0.06);

    // First flip of a round deducts the stake.
    let stake = pot;
    if (!inRound) {
      setBalance((b) => b - bet);
      stake = bet;
      setPot(bet);
      setInRound(true);
    }

    // Animate a few face changes.
    for (let i = 0; i < 6; i += 1) {
      setFace(i % 2 === 0 ? "tails" : "heads");
      await sleep(90);
    }

    const outcome = Math.random() < 0.5 ? "heads" : "tails";
    setFace(outcome);
    await sleep(220);

    if (outcome === call) {
      const newStreak = streak + 1;
      const newPot = stake * 2;
      setStreak(newStreak);
      setPot(newPot);
      setMessage(`${cap(outcome)}! Streak ${newStreak}. Pot ${money(newPot)} — cash out or risk it.`);
      playTone(soundOn, 560 + newStreak * 60, 0.12);
    } else {
      setMessage(`${cap(outcome)}. Streak broken — lost ${money(stake)}.`);
      playTone(soundOn, 150, 0.26);
      setStreak(0);
      setPot(0);
      setInRound(false);
    }

    setFlipping(false);
  };

  const cashOut = () => {
    if (!inRound || flipping || pot <= 0) return;
    playTone(soundOn, 720, 0.14);
    setBalance((b) => b + pot);
    setMessage(`Cashed out ${money(pot)} after a streak of ${streak}!`);
    setStreak(0);
    setPot(0);
    setInRound(false);
    setBet((b) => clampBet(b, balance + pot));
  };

  const refill = () => {
    playTone(soundOn, 320, 0.05);
    refillWallet();
    setBet(INITIAL_BET);
    setStreak(0);
    setPot(0);
    setInRound(false);
    setMessage("Chips refilled. Pick heads or tails.");
  };

  const broke = balance < MIN_BET && !inRound;

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Coin Flip Streak game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Push your luck</p>
            <h1>Coin Flip Streak</h1>
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
            <RulesModal title="Coin Flip Streak">
              <p><strong>Goal:</strong> Call the coin correctly again and again to grow your pot — then cash out before you miss.</p>
              <ul>
                <li>Set your bet, then call <strong>Heads</strong> or <strong>Tails</strong>. A correct call stakes your bet and starts the round.</li>
                <li>Every correct call <strong>doubles your pot</strong> (×2 each flip) and extends your streak.</li>
                <li>Press <strong>Cash out</strong> any time to bank the pot and keep your winnings.</li>
                <li>One <strong>wrong call</strong> ends the streak and you lose the whole pot.</li>
                <li>It's a push-your-luck gamble: the longer you ride, the more you risk.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Status">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Streak</span><strong>{streak}</strong></div>
          <div><span>Pot</span><strong>{money(pot)}</strong></div>
        </section>

        <section className="coin-stage" aria-live="polite">
          <div className={`coin ${flipping ? "is-flipping" : ""} face-${face}`}>
            <span>{face === "heads" ? "H" : "T"}</span>
          </div>
          <p>{message}</p>
        </section>

        <section className="coin-controls" aria-label="Flip controls">
          <button className="spin-button" type="button" onClick={() => flip("heads")} disabled={flipping || broke}>
            {inRound ? "Risk it: Heads" : "Heads"}
          </button>
          <button className="spin-button" type="button" onClick={() => flip("tails")} disabled={flipping || broke}>
            {inRound ? "Risk it: Tails" : "Tails"}
          </button>
        </section>

        {inRound ? (
          <section className="coin-controls" aria-label="Cash out">
            <button className="stepper coin-cash" type="button" onClick={cashOut} disabled={flipping || pot <= 0}>
              Cash out {money(pot)}
            </button>
          </section>
        ) : (
          <section className="mini-controls" aria-label="Bet controls">
            <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={bet <= MIN_BET}>-</button>
            <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" />
            <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={bet >= MAX_BET || bet >= balance}>+</button>
            <button className="spin-button" type="button" onClick={broke ? refill : undefined} disabled={!broke}>
              {broke ? "Refill" : `Bet ${money(bet)}`}
            </button>
          </section>
        )}

        <section className="paytable" aria-label="Odds">
          <div><span>Each correct call</span><strong>2x</strong></div>
          <div><span>Streak of 3</span><strong>8x</strong></div>
          <div><span>Streak of 5</span><strong>32x</strong></div>
          <div><span>Wrong call</span><strong>Lose pot</strong></div>
        </section>
      </section>
    </main>
  );
}

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
