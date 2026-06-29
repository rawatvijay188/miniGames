import { useState } from "react";
import { useGame, GameShell, ScoreStrip, BetControls, money, sleep } from "../../gdk";
import DiceSide from "./DiceSide.jsx";
import { rollDie } from "./diceConfig.js";

const ROLL_DURATION_MS = 900;

export default function DiceDuel() {
  const game = useGame({
    bet: { initial: 20, min: 10, max: 100, step: 10 },
    idleMessage: "Ready",
  });
  const { bet, balance, busy, message: result, soundOn, toggle, sfx } = game;
  const [player, setPlayer] = useState([1, 1]);
  const [dealer, setDealer] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);

  const roll = () =>
    game.run(async () => {
      game.stake();
      setRolling(true);
      game.setMessage("Rolling");
      sfx.start();

      const nextPlayer = [rollDie(), rollDie()];
      const nextDealer = [rollDie(), rollDie()];
      await sleep(ROLL_DURATION_MS);

      setPlayer(nextPlayer);
      setDealer(nextDealer);
      setRolling(false);

      const playerTotal = nextPlayer[0] + nextPlayer[1];
      const dealerTotal = nextDealer[0] + nextDealer[1];
      const multiplier = playerTotal > dealerTotal ? 2 : playerTotal === dealerTotal ? 1 : 0;

      game.settleBet({
        multiplier,
        winMessage: () => `Won ${money(bet)}`,
        loseMessage: () => `Lost ${money(bet)}`,
      });
      if (multiplier === 1) game.setMessage("Push");
    });

  return (
    <GameShell
      label="Dice Duel game"
      kicker="Quick chance"
      title="Dice Duel"
      soundOn={soundOn}
      onToggleSound={toggle}
      rules={
        <>
          <p><strong>Goal:</strong> Roll a higher total than the dealer to win.</p>
          <ul>
            <li>Set your bet and press <strong>Roll</strong>. You and the dealer each roll two dice.</li>
            <li>The <strong>higher combined total wins</strong>.</li>
            <li>Win and you're paid <strong>1:1</strong> (double your bet).</li>
            <li>A <strong>tie</strong> is a push — your bet is returned.</li>
            <li>Roll lower and you lose the bet.</li>
          </ul>
        </>
      }
    >
      <ScoreStrip
        label="Score"
        items={[
          { label: "Balance", value: money(balance) },
          { label: "Bet", value: money(bet) },
          { label: "Result", value: result },
        ]}
      />

      <section className="duel-table" aria-live="polite">
        <DiceSide label="You" values={player} rolling={rolling} />
        <div className="versus">VS</div>
        <DiceSide label="Dealer" values={dealer} rolling={rolling} />
      </section>

      <BetControls
        label="Dice controls"
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
        actionLabel="Roll"
        onAction={roll}
      />
    </GameShell>
  );
}
