import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";
import Meter from "../../components/Meter.jsx";
import { useBet, useSound, useCoins, useSpinEasing, money, sleep, playTone } from "../../gdk";
import ReelSymbol from "./ReelSymbol.jsx";
import { scoreReels } from "./scoring.js";
import { symbolById, weightedSymbol } from "./symbols.js";

const MIN_BET = 5;
const STRIP_LENGTH = 6;

// A strip of random symbols used purely for the spinning animation.
function makeStrip() {
  return Array.from({ length: STRIP_LENGTH }, () => weightedSymbol());
}

export default function NeonReels() {
  const { balance, setBalance } = useCoins();
  const { soundOn, toggle, sfx } = useSound();
  const { bet, setBet, increase, decrease, reclamp, atMin, atMax, canBet, min, max } = useBet({
    initial: 25, min: MIN_BET, max: 100, step: 5, onChange: () => sfx.bet(),
  });
  const [lastWin, setLastWin] = useState(0);
  const [banner, setBanner] = useState("Ready");
  const [reels, setReels] = useState(() => [weightedSymbol(), weightedSymbol(), weightedSymbol()]);
  const [rolling, setRolling] = useState([false, false, false]);
  const [strips, setStrips] = useState(() => [makeStrip(), makeStrip(), makeStrip()]);
  const [spinning, setSpinning] = useState(false);
  const [winning, setWinning] = useState(false);
  // Dev controls: seconds per revolution, and how long the first reel rolls (ms).
  const [rollDuration, setRollDuration] = useState(0.34);
  const [spinTime, setSpinTime] = useState(700);

  // Inject sine-eased spin keyframes
  useSpinEasing();

  const spin = async (forcedIds) => {
    if (spinning || balance < bet) return;

    setSpinning(true);
    setWinning(false);
    setBalance((value) => value - bet);
    setLastWin(0);
    setBanner("Spinning");
    playTone(soundOn, 220);

    // Fresh symbol strips and start every reel revolving.
    setStrips([makeStrip(), makeStrip(), makeStrip()]);
    setRolling([true, true, true]);

    const result = [];

    for (let index = 0; index < reels.length; index += 1) {
      await sleep(spinTime + index * Math.round(spinTime * 0.55));

      const forcedSymbol = forcedIds?.[index] ? symbolById(forcedIds[index]) : null;
      const nextSymbol = forcedSymbol || weightedSymbol();
      result.push(nextSymbol);

      // Stop this reel: snap it to its final symbol.
      setReels((current) => current.map((symbol, reelIndex) => (reelIndex === index ? nextSymbol : symbol)));
      setRolling((current) => current.map((isRolling, reelIndex) => (reelIndex === index ? false : isRolling)));
      playTone(soundOn, 300 + index * 90);
    }

    const outcome = scoreReels(result);
    const win = bet * outcome.multiplier;
    const nextBalance = balance - bet + win;

    setBalance(nextBalance);

    if (win > 0) {
      setLastWin(win);
      setBanner(`${outcome.label}: ${money(win)}`);
      setWinning(true);
      playTone(soundOn, 660, 0.16);
      await sleep(110);
      playTone(soundOn, 880, 0.18);
    } else {
      setBanner(nextBalance >= bet ? "Try again" : "Out of credits");
    }

    setSpinning(false);
    reclamp(nextBalance);
  };

  return (
    <main className="shell">
      <section className="machine" aria-label="Neon Reels slot game">
        <GameNav />
        <header className="topbar">
          <div>
            <p className="kicker">Arcade slots</p>
            <h1>Neon Reels</h1>
          </div>
          <div className="bj-header-actions">
            <button
              className={`icon-button ${soundOn ? "" : "is-muted"}`}
              type="button"
              onClick={toggle}
              aria-label="Toggle sound"
              title="Toggle sound"
            >
              ♪
            </button>
            <RulesModal title="Neon Reels">
              <p><strong>Goal:</strong> Spin the three reels and line up matching symbols on the payline.</p>
              <ul>
                <li>Set your bet with the +/− controls and press <strong>Spin</strong>.</li>
                <li>The center row is the <strong>payline</strong> — match symbols there to win.</li>
                <li><strong>Three of a kind</strong> pays the most; some symbols also pay for a pair.</li>
                <li>Higher-value symbols (like the 7) give the biggest payouts.</li>
                <li>Your win is the symbol's multiplier times your bet.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="meters" aria-label="Game totals">
          <Meter label="Balance" value={money(balance)} />
          <Meter label="Bet" value={money(bet)} />
          <Meter label="Last Win" value={money(lastWin)} />
        </section>

        <section className="reel-window" aria-live="polite">
          <div className="payline" aria-hidden="true"></div>
          <div
            className="reels"
            style={{
              "--reel-roll-duration": `${rollDuration}s`,
              // Ease off the motion blur as the reel slows, so the upward
              // travel stays crisp when slowed down for inspection.
              "--reel-roll-blur": `${Math.max(0, 1.4 - (rollDuration - 0.4) * 1.6).toFixed(2)}px`
            }}
          >
            {reels.map((symbol, index) => (
              <div className={`reel ${rolling[index] ? "is-rolling" : ""} ${winning ? "is-winning" : ""}`} key={index}>
                {rolling[index] ? (
                  <div className="reel-strip">
                    {[...strips[index], ...strips[index]].map((stripSymbol, cellIndex) => (
                      <div className="reel-cell" key={cellIndex}>
                        <ReelSymbol symbol={stripSymbol} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ReelSymbol symbol={symbol} />
                )}
              </div>
            ))}
          </div>
          <div className={`win-banner ${winning ? "is-win" : ""}`} role="status">
            {banner}
          </div>
        </section>

        <section className="controls" aria-label="Slot controls">
          <button className="stepper" type="button" onClick={decrease} disabled={spinning || atMin}>-</button>
          <input type="range" min={min} max={max} step="5" value={bet} onChange={(event) => setBet(Number(event.target.value))} aria-label="Bet amount" />
          <button className="stepper" type="button" onClick={increase} disabled={spinning || atMax}>+</button>
          <button className="spin-button" type="button" onClick={() => spin()} disabled={spinning || !canBet}>Spin</button>
        </section>

        <section className="paytable" aria-label="Paytable">
          <div><span>3 Wilds</span><strong>10x</strong></div>
          <div><span>3 Sevens</span><strong>8x</strong></div>
          <div><span>3 Gems</span><strong>6x</strong></div>
          <div><span>Any pair</span><strong>2x</strong></div>
        </section>

        <section className="test-panel" aria-label="Dev reel speed">
          <span>Revolution {rollDuration.toFixed(2)}s</span>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={rollDuration}
            onChange={(event) => setRollDuration(Number(event.target.value))}
            aria-label="Seconds per reel revolution"
          />
          <span>Spin {(spinTime / 1000).toFixed(1)}s</span>
          <input
            type="range"
            min="400"
            max="5000"
            step="100"
            value={spinTime}
            onChange={(event) => setSpinTime(Number(event.target.value))}
            aria-label="Reel spin duration"
          />
        </section>

        <section className="test-panel" aria-label="Test outcomes">
          <span>Test Spin</span>
          <button type="button" onClick={() => spin(["wild", "wild", "wild"])} disabled={spinning || balance < bet}>Wilds</button>
          <button type="button" onClick={() => spin(["seven", "seven", "seven"])} disabled={spinning || balance < bet}>Sevens</button>
          <button type="button" onClick={() => spin(["gem", "gem", "gem"])} disabled={spinning || balance < bet}>Gems</button>
          <button type="button" onClick={() => spin(["cherry", "cherry", "bell"])} disabled={spinning || balance < bet}>Pair</button>
          <button type="button" onClick={() => spin(["cherry", "bell", "gem"])} disabled={spinning || balance < bet}>No Win</button>
        </section>
      </section>
    </main>
  );
}
