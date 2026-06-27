import GameCard from "../components/GameCard.jsx";
import WalletBar from "../components/WalletBar.jsx";
import NeonReelsArt from "../components/art/NeonReelsArt.jsx";
import PassAndPlayArt from "../components/art/PassAndPlayArt.jsx";

export default function GameHub() {
  return (
    <main className="platform-shell">
      <section className="platform-hero" aria-labelledby="platformTitle">
        <div className="hero-copy">
          <p className="kicker">Instant play arcade</p>
          <h1 id="platformTitle">Game Hub</h1>
          <p>Pick a category to jump in. More collections are on the way.</p>
        </div>
        <div className="hero-badges" aria-label="Platform stats">
          <span>17 games</span>
          <span>React ready</span>
          <span>PixiJS next</span>
        </div>
      </section>

      <WalletBar />

      <section className="category-grid" aria-label="Game categories">
        <GameCard route="slot-games" kicker="17 games inside" title="Slot Games" description="Classic reels, puzzle tumbles, card tables and more — all in one deck.">
          <NeonReelsArt />
        </GameCard>

        <GameCard route="pass-and-play" kicker="2 players · one device" title="Pass &amp; Play" description="Head-to-head games for two. Take turns on one screen and challenge a friend.">
          <PassAndPlayArt />
        </GameCard>
      </section>
    </main>
  );
}
