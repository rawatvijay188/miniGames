import { useState } from "react";
import { useGame, GameShell, ScoreStrip, BetControls, Paytable, money, sleep } from "../../gdk";

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

export default function LuckyWheel() {
  const game = useGame({
    bet: { initial: 20, min: 10, max: 100, step: 10 },
    idleMessage: "Spin the wheel of fortune!",
  });
  const { bet, balance, busy, message, lastWin, soundOn, toggle, sfx } = game;
  const [rotation, setRotation] = useState(0);

  const spin = () =>
    game.run(async () => {
      game.stake();
      game.setLastWin(0);
      game.setMessage("Spinning...");
      sfx.start();

      const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
      const turns = 5; // full rotations for effect
      // Land the winning segment under the top pointer.
      const target = turns * 360 + (360 - winningIndex * SEG_ANGLE - SEG_ANGLE / 2);
      setRotation((r) => r - (r % 360) + target);

      // Tick sounds while spinning.
      for (let i = 0; i < 10; i += 1) {
        sfx.tick(i);
        await sleep(120);
      }
      await sleep(2600);

      const segment = SEGMENTS[winningIndex];
      game.settleBet({
        multiplier: segment.mult,
        winMessage: (r) => `Landed ${segment.label} — won ${money(r.payout)}!`,
        loseMessage: () => "Landed on 0. Spin again!",
      });
    });

  const gradient = SEGMENTS.map((seg, i) =>
    `${seg.color} ${i * SEG_ANGLE}deg ${(i + 1) * SEG_ANGLE}deg`
  ).join(", ");

  return (
    <GameShell
      label="Lucky Wheel game"
      kicker="Wheel of fortune"
      title="Lucky Wheel"
      soundOn={soundOn}
      onToggleSound={toggle}
      rules={
        <>
          <p><strong>Goal:</strong> Spin the wheel and land on a multiplier to win that many times your bet.</p>
          <ul>
            <li>Set your bet and press <strong>Spin</strong>.</li>
            <li>Wherever the pointer lands, your bet is multiplied by that segment's value.</li>
            <li>Segments range from <strong>1× up to a 50× jackpot</strong>.</li>
            <li>Some segments are blanks (<strong>0×</strong>) — land there and you lose the bet.</li>
            <li>Bigger multipliers are rarer, so the jackpot is a long shot.</li>
          </ul>
        </>
      }
    >
      <ScoreStrip
        items={[
          { label: "Balance", value: money(balance) },
          { label: "Bet", value: money(bet) },
          { label: "Last Win", value: money(lastWin) },
        ]}
      />

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

      <BetControls
        bet={bet}
        min={game.min}
        max={game.max}
        step={game.step}
        onDecrease={game.decrease}
        onIncrease={game.increase}
        onChange={game.setBet}
        atMin={game.atMin}
        atMax={game.atMax}
        canBet={game.canBet}
        busy={busy}
        actionLabel="Spin"
        onAction={spin}
      />

      <Paytable
        rows={[
          { label: "Jackpot", value: "50x" },
          { label: "Top prize", value: "10x" },
          { label: "Mid prizes", value: "2–5x" },
          { label: "Blanks", value: "0x" },
        ]}
      />
    </GameShell>
  );
}
