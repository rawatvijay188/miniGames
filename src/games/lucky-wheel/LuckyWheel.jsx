import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";
import { playTone } from "../../utils/audio.js";
import RulesModal from "../../components/RulesModal.jsx";

const INITIAL_BALANCE = 300;
const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;

// Wheel segments: multiplier applied to the bet. 0 = lose.
const SEGMENTS = [
  { label: "2x", mult: 2, color: "#49d7df" },
  { label: "0", mult: 0, color: "#364052" },
  { label: "5x", mult: 5, color: "#f7bd4a" },
  { label: "1x", mult: 1, color: "#70d67a" },
  { label: "0", mult: 0, color: "#364052" },
  { label: "3x", mult: 3, color: "#f35f76" },
  { label: "10x", mult: 10, color: "#f7bd4a" },
  { label: "0", mult: 0, color: "#364052" },
  { label: "2x", mult: 2, color: "#49d7df" },
  { label: "1x", mult: 1, color: "#70d67a" },
  { label: "0", mult: 0, color: "#364052" },
  { label: "50x", mult: 50, color: "#ffffff" }
];

const SEG_ANGLE = 360 / SEGMENTS.length;

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

export default function LuckyWheel() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(INITIAL_BET);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [message, setMessage] = useState("Spin the wheel of fortune!");
  const [soundOn, setSoundOn] = useState(true);

  const updateBet = (next) => {
    if (spinning) return;
    playTone(soundOn, 320, 0.05);
    setBet(clampBet(next, balance));
  };

  const spin = async () => {
    if (spinning || balance < bet) return;
    setSpinning(true);
    setBalance((b) => b - bet);
    setLastWin(0);
    setMessage("Spinning...");
    playTone(soundOn, 240, 0.08);

    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const turns = 5; // full rotations for effect
    // Land the winning segment under the top pointer.
    const target = turns * 360 + (360 - winningIndex * SEG_ANGLE - SEG_ANGLE / 2);
    const finalRotation = rotation - (rotation % 360) + target;
    setRotation(finalRotation);

    // Tick sounds while spinning.
    for (let i = 0; i < 10; i += 1) {
      playTone(soundOn, 400 + (i % 3) * 60, 0.03);
      await sleep(120);
    }
    await sleep(2600);

    const segment = SEGMENTS[winningIndex];
    const win = bet * segment.mult;
    if (win > 0) {
      setBalance((b) => b + win);
      setLastWin(win);
      setMessage(`Landed ${segment.label} — won ${money(win)}!`);
      playTone(soundOn, 760, 0.16);
    } else {
      setMessage("Landed on 0. Spin again!");
      playTone(soundOn, 150, 0.24);
    }

    setBet((b) => clampBet(b, balance - bet + win));
    setSpinning(false);
  };

  const gradient = SEGMENTS.map((seg, i) =>
    `${seg.color} ${i * SEG_ANGLE}deg ${(i + 1) * SEG_ANGLE}deg`
  ).join(", ");

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Lucky Wheel game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Wheel of fortune</p>
            <h1>Lucky Wheel</h1>
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
            <RulesModal title="Lucky Wheel">
              <p><strong>Goal:</strong> Spin the wheel and land on a multiplier to win that many times your bet.</p>
              <ul>
                <li>Set your bet and press <strong>Spin</strong>.</li>
                <li>Wherever the pointer lands, your bet is multiplied by that segment's value.</li>
                <li>Segments range from <strong>1× up to a 50× jackpot</strong>.</li>
                <li>Some segments are blanks (<strong>0×</strong>) — land there and you lose the bet.</li>
                <li>Bigger multipliers are rarer, so the jackpot is a long shot.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Status">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Bet</span><strong>{money(bet)}</strong></div>
          <div><span>Last Win</span><strong>{money(lastWin)}</strong></div>
        </section>

        <section className="wheel-stage" aria-live="polite">
          <div className="wheel-pointer" aria-hidden="true">▼</div>
          <div
            className="wheel"
            style={{
              background: `conic-gradient(${gradient})`,
              transform: `rotate(${rotation}deg)`
            }}
          >
            {SEGMENTS.map((seg, i) => (
              <span
                key={i}
                className="wheel-label"
                style={{ transform: `rotate(${i * SEG_ANGLE + SEG_ANGLE / 2}deg)` }}
              >
                {seg.label}
              </span>
            ))}
            <div className="wheel-hub" />
          </div>
          <p>{message}</p>
        </section>

        <section className="mini-controls" aria-label="Controls">
          <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={spinning || bet <= MIN_BET}>-</button>
          <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(e) => updateBet(Number(e.target.value))} aria-label="Bet amount" disabled={spinning} />
          <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={spinning || bet >= MAX_BET || bet >= balance}>+</button>
          <button className="spin-button" type="button" onClick={spin} disabled={spinning || balance < bet}>
            {balance < bet ? "No funds" : "Spin"}
          </button>
        </section>

        <section className="paytable" aria-label="Prizes">
          <div><span>Jackpot</span><strong>50x</strong></div>
          <div><span>Top prize</span><strong>10x</strong></div>
          <div><span>Mid prizes</span><strong>2–5x</strong></div>
          <div><span>Blanks</span><strong>0x</strong></div>
        </section>
      </section>
    </main>
  );
}
