import GameCard from "../components/GameCard.jsx";
import WalletBar from "../components/WalletBar.jsx";
import { navigateTo } from "../utils/navigation.js";
import TicTacToeArt from "../components/art/TicTacToeArt.jsx";
import NeonSnakeDuelArt from "../components/art/NeonSnakeDuelArt.jsx";

export default function PassAndPlay() {
  return (
    <main className="platform-shell">
      <section className="platform-hero" aria-labelledby="passAndPlayTitle">
        <div className="hero-copy">
          <button className="back-link" type="button" onClick={() => navigateTo("home")}>
            ← Back to Game Hub
          </button>
          <p className="kicker">2 players · one device</p>
          <h1 id="passAndPlayTitle">Pass &amp; Play</h1>
          <p>Head-to-head games for two people sharing a single screen. Take turns, pass the device, and settle who's the champ.</p>
        </div>
        <div className="hero-badges" aria-label="Category stats">
          <span>2 players</span>
          <span>No coins</span>
          <span>Bragging rights</span>
        </div>
      </section>

      <WalletBar />

      <section className="slot-games-grid" aria-label="Two-player games">
        <GameCard route="tic-tac-toe" kicker="Pass &amp; play" title="Tic-Tac-Toe" description="Classic 3-in-a-row for two. Take turns tapping the grid — X versus O on one screen.">
          <TicTacToeArt />
        </GameCard>

        <GameCard route="neon-snake-duel" kicker="Pass &amp; play" title="Neon Snake Duel" description="Steer your snake, box your rival in, and don't crash. Red versus blue, last one moving wins.">
          <NeonSnakeDuelArt />
        </GameCard>
      </section>
    </main>
  );
}
