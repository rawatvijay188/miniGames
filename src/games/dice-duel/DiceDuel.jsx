import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";
import { money } from "../../utils/format.js";
import DiceSide from "./DiceSide.jsx";
import { rollDie } from "./diceConfig.js";

const INITIAL_BALANCE = 300;
const INITIAL_BET = 20;
const MIN_BET = 10;
const MAX_BET = 100;
const ROLL_DURATION_MS = 900;

function clampBet(nextBet, balance) {
  const max = Math.min(MAX_BET, Math.max(MIN_BET, balance));
  return Math.min(max, Math.max(MIN_BET, nextBet));
}

export default function DiceDuel() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(INITIAL_BET);
  const [result, setResult] = useState("Ready");
  const [rolling, setRolling] = useState(false);
  const [player, setPlayer] = useState([1, 1]);
  const [dealer, setDealer] = useState([1, 1]);

  const updateBet = (nextBet, nextBalance = balance) => {
    setBet(clampBet(nextBet, nextBalance));
  };

  const roll = () => {
    if (rolling || balance < bet) return;

    setRolling(true);
    setResult("Rolling");

    const nextPlayer = [rollDie(), rollDie()];
    const nextDealer = [rollDie(), rollDie()];

    setTimeout(() => {
      const playerTotal = nextPlayer[0] + nextPlayer[1];
      const dealerTotal = nextDealer[0] + nextDealer[1];
      let nextBalance = balance - bet;

      setPlayer(nextPlayer);
      setDealer(nextDealer);

      if (playerTotal > dealerTotal) {
        nextBalance += bet * 2;
        setResult(`Won ${money(bet)}`);
      } else if (playerTotal === dealerTotal) {
        nextBalance += bet;
        setResult("Push");
      } else {
        setResult(`Lost ${money(bet)}`);
      }

      setBalance(nextBalance);
      setRolling(false);
      updateBet(Math.min(bet, Math.max(MIN_BET, nextBalance)), nextBalance);
    }, ROLL_DURATION_MS);
  };

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Dice Duel game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Quick chance</p>
            <h1>Dice Duel</h1>
          </div>
          <div className="bj-header-actions">
            <RulesModal title="Dice Duel">
              <p><strong>Goal:</strong> Roll a higher total than the dealer to win.</p>
              <ul>
                <li>Set your bet and press <strong>Roll</strong>. You and the dealer each roll two dice.</li>
                <li>The <strong>higher combined total wins</strong>.</li>
                <li>Win and you're paid <strong>1:1</strong> (double your bet).</li>
                <li>A <strong>tie</strong> is a push — your bet is returned.</li>
                <li>Roll lower and you lose the bet.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Score">
          <div><span>Balance</span><strong>{money(balance)}</strong></div>
          <div><span>Bet</span><strong>{money(bet)}</strong></div>
          <div><span>Result</span><strong>{result}</strong></div>
        </section>

        <section className="duel-table" aria-live="polite">
          <DiceSide label="You" values={player} rolling={rolling} />
          <div className="versus">VS</div>
          <DiceSide label="Dealer" values={dealer} rolling={rolling} />
        </section>

        <section className="mini-controls" aria-label="Dice controls">
          <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={rolling || bet <= MIN_BET}>-</button>
          <input type="range" min={MIN_BET} max={MAX_BET} step="10" value={bet} onChange={(event) => updateBet(Number(event.target.value))} aria-label="Bet amount" />
          <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={rolling || bet >= MAX_BET || bet >= balance}>+</button>
          <button className="spin-button" type="button" onClick={roll} disabled={rolling || balance < bet}>Roll</button>
        </section>
      </section>
    </main>
  );
}
