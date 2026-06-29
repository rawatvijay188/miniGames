import { useState } from "react";
import { useBet, useSound, useCoins, GameShell, ScoreStrip, Paytable, money, sleep } from "../../gdk";

export default function CoinFlipStreak() {
  const { balance, setBalance, refillWallet } = useCoins();
  const { soundOn, toggle, sfx } = useSound();
  const { bet, setBet, increase, decrease, atMin, atMax, min } = useBet({
    initial: 20, min: 10, max: 100, step: 10, onChange: () => sfx.bet(),
  });

  const [streak, setStreak] = useState(0);
  const [pot, setPot] = useState(0); // current winnings riding on the streak
  const [face, setFace] = useState("heads");
  const [flipping, setFlipping] = useState(false);
  const [message, setMessage] = useState("Pick heads or tails to start a streak.");
  const [inRound, setInRound] = useState(false);

  const flip = async (call) => {
    if (flipping) return;
    if (!inRound && balance < bet) return;

    setFlipping(true);
    sfx.click();

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
      sfx.win();
    } else {
      setMessage(`${cap(outcome)}. Streak broken — lost ${money(stake)}.`);
      sfx.lose();
      setStreak(0);
      setPot(0);
      setInRound(false);
    }

    setFlipping(false);
  };

  const cashOut = () => {
    if (!inRound || flipping || pot <= 0) return;
    sfx.win();
    setBalance((b) => b + pot);
    setMessage(`Cashed out ${money(pot)} after a streak of ${streak}!`);
    setStreak(0);
    setPot(0);
    setInRound(false);
    setBet(bet, balance + pot);
  };

  const refill = () => {
    sfx.click();
    refillWallet();
    setBet(20);
    setStreak(0);
    setPot(0);
    setInRound(false);
    setMessage("Chips refilled. Pick heads or tails.");
  };

  const broke = balance < min && !inRound;

  return (
    <GameShell
      label="Coin Flip Streak game"
      kicker="Push your luck"
      title="Coin Flip Streak"
      soundOn={soundOn}
      onToggleSound={toggle}
      rules={
        <>
          <p><strong>Goal:</strong> Call the coin correctly again and again to grow your pot — then cash out before you miss.</p>
          <ul>
            <li>Set your bet, then call <strong>Heads</strong> or <strong>Tails</strong>. A correct call stakes your bet and starts the round.</li>
            <li>Every correct call <strong>doubles your pot</strong> (×2 each flip) and extends your streak.</li>
            <li>Press <strong>Cash out</strong> any time to bank the pot and keep your winnings.</li>
            <li>One <strong>wrong call</strong> ends the streak and you lose the whole pot.</li>
            <li>It's a push-your-luck gamble: the longer you ride, the more you risk.</li>
          </ul>
        </>
      }
    >
      <ScoreStrip
        items={[
          { label: "Balance", value: money(balance) },
          { label: "Streak", value: streak },
          { label: "Pot", value: money(pot) },
        ]}
      />

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
          <button className="stepper" type="button" onClick={decrease} disabled={atMin}>-</button>
          <input type="range" min={min} max={100} step="10" value={bet} onChange={(e) => setBet(Number(e.target.value))} aria-label="Bet amount" />
          <button className="stepper" type="button" onClick={increase} disabled={atMax}>+</button>
          <button className="spin-button" type="button" onClick={broke ? refill : undefined} disabled={!broke}>
            {broke ? "Refill" : `Bet ${money(bet)}`}
          </button>
        </section>
      )}

      <Paytable
        label="Odds"
        rows={[
          { label: "Each correct call", value: "2x" },
          { label: "Streak of 3", value: "8x" },
          { label: "Streak of 5", value: "32x" },
          { label: "Wrong call", value: "Lose pot" },
        ]}
      />
    </GameShell>
  );
}

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
