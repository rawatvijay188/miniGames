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
          <span>9 games</span>
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

        <GameCard
          route="duo-space-shooter"
          artClassName="shooter-art"
          kicker="Arcade shooter"
          title="Duo Space Shooter"
          description="Team up, dodge enemy waves, and fire fast to protect the zone."
        >
          <span>⇆</span>
          <span>✹</span>
          <span>↑</span>
        </GameCard>

        <GameCard
          route="king-queen-minister-thief"
          kicker="Regal reels"
          title="King, Queen, Minister, Thief"
          description="Spin the royal court for triple payouts and pair bonuses."
        >
          <span>♚</span>
          <span>♕</span>
          <span>🕵️</span>
        </GameCard>

        <GameCard
          route="blackjack"
          artClassName="blackjack-art"
          kicker="Card table"
          title="Blackjack"
          description="Beat the dealer to 21 without going bust. Hit, stand, or double down."
        >
          <span>A♠</span>
          <span>21</span>
          <span>K♥</span>
        </GameCard>

        <GameCard
          route="cosmic-cascade"
          artClassName="cosmic-art"
          kicker="Tumbling reels"
          title="Cosmic Cascade"
          description="Match clusters of cosmic symbols, then watch them tumble for chain-combo multipliers."
        >
          <span>🚀</span>
          <span>⭐</span>
          <span>👽</span>
        </GameCard>

        <GameCard
          route="fruit-frenzy"
          artClassName="fruit-art"
          kicker="Cluster pays"
          title="Fruit Frenzy"
          description="Land touching groups of five or more fruits to score, then watch them tumble away."
        >
          <span>🍒</span>
          <span>🍉</span>
          <span>🍌</span>
        </GameCard>

        <GameCard
          route="gem-storm"
          artClassName="gem-art"
          kicker="Expanding wilds"
          title="Gem Storm"
          description="Win both ways as diamond wilds expand to fill whole reels for bigger payouts."
        >
          <span>🔴</span>
          <span>💎</span>
          <span>🔵</span>
        </GameCard>
      </section>
    </main>
  );
}
