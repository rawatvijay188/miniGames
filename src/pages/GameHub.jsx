import GameCard from "../components/GameCard.jsx";

export default function GameHub() {
  return (
    <main className="platform-shell">
      <section className="platform-hero" aria-labelledby="platformTitle">
        <div className="hero-copy">
          <p className="kicker">Instant play arcade</p>
          <h1 id="platformTitle">Game Hub</h1>
          <p>Choose a game and jump straight into the table. Each tile opens its own playable screen.</p>
        </div>
        <div className="hero-badges" aria-label="Platform stats">
          <span>3 games</span>
          <span>React ready</span>
          <span>PixiJS next</span>
        </div>
      </section>

      <section className="game-grid" aria-label="Available games">
        <GameCard
          route="neon-reels"
          kicker="Arcade slots"
          title="Neon Reel 1x3"
          description="Spin three reels, tune your bet, and chase bonus matches."
        >
          <span>7</span>
          <span>◆</span>
          <span>★</span>
        </GameCard>

        <GameCard
          route="dice-duel"
          artClassName="dice-art"
          kicker="Quick chance"
          title="Dice Duel"
          description="Roll against the dealer and win chips with the higher total."
        >
          <span>3D</span>
          <span>6</span>
        </GameCard>

        <GameCard
          route="number-rush"
          artClassName="number-art"
          kicker="Puzzle run"
          title="Number Rush"
          description="Guess the hidden number before your streak runs out."
        >
          <span>?</span>
          <span>42</span>
        </GameCard>
      </section>
    </main>
  );
}
