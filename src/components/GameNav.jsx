import { navigateTo } from "../utils/navigation.js";
import { useCoins } from "../context/CoinContext.jsx";

export default function GameNav() {
  const { balance } = useCoins();

  return (
    <nav className="game-nav" aria-label="Game navigation">
      <button type="button" onClick={() => navigateTo("home")}>
        All games
      </button>
      <span className="nav-wallet" aria-label={`Coin balance: ${balance}`}>
        <span className="nav-wallet-coin" aria-hidden="true">🪙</span>
        {balance.toLocaleString()}
      </span>
    </nav>
  );
}
