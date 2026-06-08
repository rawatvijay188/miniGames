import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";
import Meter from "../../components/Meter.jsx";
import { playTone } from "../../utils/audio.js";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import ReelSymbol from "./ReelSymbol.jsx";
import { scoreReels } from "./scoring.js";
import { symbolById, weightedSymbol } from "./symbols.js";
import { useCoins } from "../../context/CoinContext.jsx";

const INITIAL_BET = 25;
const MIN_BET = 5;
const MAX_BET = 100;

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

export default function NeonReels() {
  const { balance, setBalance } = useCoins();
  const [bet, setBet] = useState(INITIAL_BET);
  const [lastWin, setLastWin] = useState(0);
  const [banner, setBanner] = useState("Ready");
  const [reels, setReels] = useState(() => [weightedSymbol(), weightedSymbol(), weightedSymbol()]);
  const [spinning, setSpinning] = useState(false);
  const [winning, setWinning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const updateBet = (nextBet, nextBalance = balance) => {
    setBet(clampBet(nextBet, nextBalance));
  };

  const spin = async (forcedIds) => {
    if (spinning || balance < bet) return;

    setSpinning(true);
    setWinning(false);
    setBalance((value) => value - bet);
    setLastWin(0);
    setBanner("Spinning");
    playTone(soundOn, 220);

    const result = [];

    for (let index = 0; index < reels.length; index += 1) {
      const ticker = setInterval(() => {
        setReels((current) => current.map((symbol, reelIndex) => (reelIndex === index ? weightedSymbol() : symbol)));
      }, 90);

      await sleep(900 + index * 420);
      clearInterval(ticker);

      const forcedSymbol = forcedIds?.[index] ? symbolById(forcedIds[index]) : null;
      const nextSymbol = forcedSymbol || weightedSymbol();
      result.push(nextSymbol);
      setReels((current) => current.map((symbol, reelIndex) => (reelIndex === index ? nextSymbol : symbol)));
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
    updateBet(Math.min(bet, Math.max(MIN_BET, nextBalance)), nextBalance);
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
              onClick={() => setSoundOn(!soundOn)}
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
          <div className="reels">
            {reels.map((symbol, index) => (
              <div className={`reel ${spinning ? "is-spinning" : ""} ${winning ? "is-winning" : ""}`} key={`${symbol.id}-${index}`}>
                <ReelSymbol symbol={symbol} />
              </div>
            ))}
          </div>
          <div className={`win-banner ${winning ? "is-win" : ""}`} role="status">
            {banner}
          </div>
        </section>

        <section className="controls" aria-label="Slot controls">
          <button className="stepper" type="button" onClick={() => updateBet(bet - 5)} disabled={spinning || bet <= MIN_BET}>-</button>
          <input type="range" min={MIN_BET} max={MAX_BET} step="5" value={bet} onChange={(event) => updateBet(Number(event.target.value))} aria-label="Bet amount" />
          <button className="stepper" type="button" onClick={() => updateBet(bet + 5)} disabled={spinning || bet >= MAX_BET || bet >= balance}>+</button>
          <button className="spin-button" type="button" onClick={() => spin()} disabled={spinning || balance < bet}>Spin</button>
        </section>

        <section className="paytable" aria-label="Paytable">
          <div><span>3 Wilds</span><strong>10x</strong></div>
          <div><span>3 Sevens</span><strong>8x</strong></div>
          <div><span>3 Gems</span><strong>6x</strong></div>
          <div><span>Any pair</span><strong>2x</strong></div>
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
