import { useState } from "react";
import { useGame, GameShell, ScoreStrip, BetControls, money, sleep } from "../../gdk";

const ROWS = 8; // peg rows; chip makes ROWS left/right decisions

// Multiplier for each of the ROWS+1 buckets (symmetric, edges pay most).
const BUCKETS = [18, 5, 2, 1, 0.5, 1, 2, 5, 18];

function bucketColor(mult) {
  if (mult >= 10) return "#f7bd4a";
  if (mult >= 2) return "#f35f76";
  if (mult >= 1) return "#49d7df";
  return "#364052";
}

export default function PlinkoDrop() {
  const game = useGame({
    bet: { initial: 20, min: 10, max: 100, step: 10 },
    idleMessage: "Drop a chip and watch it bounce.",
  });
  const { bet, balance, busy, message, lastWin, soundOn, toggle, sfx } = game;
  const [chip, setChip] = useState(null); // { row, pos } where pos is 0..row
  const [landedBucket, setLandedBucket] = useState(null);

  const drop = () =>
    game.run(async () => {
      game.stake();
      game.setLastWin(0);
      setLandedBucket(null);
      game.setMessage("Dropping...");
      sfx.click();

      let pos = 0; // number of right-moves so far == bucket index at the end
      setChip({ row: 0, pos: 0 });
      await sleep(160);

      for (let row = 1; row <= ROWS; row += 1) {
        if (Math.random() < 0.5) pos += 1;
        setChip({ row, pos });
        sfx.tick(row);
        await sleep(200);
      }

      // Plinko has a partial-return tier (0.5x) that isn't a clean win/lose, so
      // it settles manually rather than through game.settleBet.
      const mult = BUCKETS[pos];
      const win = Math.round(bet * mult);
      setLandedBucket(pos);

      if (win > bet) {
        game.setMessage(`${mult}x — won ${money(win)}!`);
        sfx.win();
      } else if (win > 0) {
        game.setMessage(`${mult}x — back ${money(win)}.`);
        sfx.bet();
      } else {
        game.setMessage("Missed. Try again!");
        sfx.lose();
      }

      if (win > 0) game.setBalance((b) => b + win);
      game.setLastWin(win);
      game.reclamp(balance - bet + win);
    });

  return (
    <GameShell
      label="Plinko Drop game"
      kicker="Bounce & win"
      title="Plinko Drop"
      soundOn={soundOn}
      onToggleSound={toggle}
      rules={
        <>
          <p><strong>Goal:</strong> Drop a chip and let it bounce into a high-multiplier bucket.</p>
          <ul>
            <li>Set your bet and press <strong>Drop</strong>.</li>
            <li>The chip bounces left or right off each peg on its way down.</li>
            <li>It lands in one of the bottom <strong>buckets</strong>, and your bet is multiplied by that bucket's value.</li>
            <li>The <strong>edge buckets pay the most</strong> (up to 18×) but are the hardest to reach.</li>
            <li>The center buckets are common but pay little (as low as 0.5×).</li>
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

      <section className="plinko-board" aria-live="polite">
        {Array.from({ length: ROWS + 1 }).map((_, row) => (
          <div className="plinko-row" key={row}>
            {Array.from({ length: row + 1 }).map((__, p) => {
              const isChip = chip && chip.row === row && chip.pos === p;
              return (
                <span key={p} className={`plinko-peg ${isChip ? "has-chip" : ""}`}>
                  {isChip ? "🔴" : "•"}
                </span>
              );
            })}
          </div>
        ))}
      </section>

      <section className="plinko-buckets" aria-label="Payout buckets">
        {BUCKETS.map((mult, i) => (
          <div
            key={i}
            className={`plinko-bucket ${landedBucket === i ? "is-landed" : ""}`}
            style={{ background: bucketColor(mult) }}
          >
            {mult}x
          </div>
        ))}
      </section>

      <div className={`win-banner ${lastWin > bet ? "is-win" : ""}`} role="status">{message}</div>

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
        actionLabel="Drop"
        onAction={drop}
      />
    </GameShell>
  );
}
