import GameCard from "../components/GameCard.jsx";
import WalletBar from "../components/WalletBar.jsx";
import NeonReelsArt from "../components/art/NeonReelsArt.jsx";
import DiceDuelArt from "../components/art/DiceDuelArt.jsx";
import NumberRushArt from "../components/art/NumberRushArt.jsx";
import ShooterArt from "../components/art/ShooterArt.jsx";
import KQMTArt from "../components/art/KQMTArt.jsx";
import BlackjackArt from "../components/art/BlackjackArt.jsx";
import CosmicCascadeArt from "../components/art/CosmicCascadeArt.jsx";
import FruitFrenzyArt from "../components/art/FruitFrenzyArt.jsx";
import GemStormArt from "../components/art/GemStormArt.jsx";
import RouletteArt from "../components/art/RouletteArt.jsx";
import VideoPokerArt from "../components/art/VideoPokerArt.jsx";
import KenoArt from "../components/art/KenoArt.jsx";
import ScratchCardArt from "../components/art/ScratchCardArt.jsx";
import CoinFlipStreakArt from "../components/art/CoinFlipStreakArt.jsx";
import LuckyWheelArt from "../components/art/LuckyWheelArt.jsx";
import PlinkoDropArt from "../components/art/PlinkoDropArt.jsx";
import HighCardWarArt from "../components/art/HighCardWarArt.jsx";

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
          <span>17 games</span>
          <span>React ready</span>
          <span>PixiJS next</span>
        </div>
      </section>

      <WalletBar />

      <section className="game-grid" aria-label="Available games">
        <GameCard route="neon-reels" kicker="Arcade slots" title="Neon Reel 1x3" description="Spin three reels, tune your bet, and chase bonus matches.">
          <NeonReelsArt />
        </GameCard>

        <GameCard route="dice-duel" kicker="Quick chance" title="Dice Duel" description="Roll against the dealer and win chips with the higher total.">
          <DiceDuelArt />
        </GameCard>

        <GameCard route="number-rush" kicker="Puzzle run" title="Number Rush" description="Guess the hidden number before your streak runs out.">
          <NumberRushArt />
        </GameCard>

        <GameCard route="duo-space-shooter" kicker="Arcade shooter" title="Duo Space Shooter" description="Team up, dodge enemy waves, and fire fast to protect the zone.">
          <ShooterArt />
        </GameCard>

        <GameCard route="king-queen-minister-thief" kicker="Regal reels" title="King, Queen, Minister, Thief" description="Spin the royal court for triple payouts and pair bonuses.">
          <KQMTArt />
        </GameCard>

        <GameCard route="blackjack" kicker="Card table" title="Blackjack" description="Beat the dealer to 21 without going bust. Hit, stand, or double down.">
          <BlackjackArt />
        </GameCard>

        <GameCard route="cosmic-cascade" kicker="Tumbling reels" title="Cosmic Cascade" description="Match clusters of cosmic symbols, then watch them tumble for chain-combo multipliers.">
          <CosmicCascadeArt />
        </GameCard>

        <GameCard route="fruit-frenzy" kicker="Cluster pays" title="Fruit Frenzy" description="Land touching groups of five or more fruits to score, then watch them tumble away.">
          <FruitFrenzyArt />
        </GameCard>

        <GameCard route="gem-storm" kicker="Expanding wilds" title="Gem Storm" description="Win both ways as diamond wilds expand to fill whole reels for bigger payouts.">
          <GemStormArt />
        </GameCard>

        <GameCard route="roulette" kicker="European wheel" title="Roulette" description="Bet on red, black, odd, even, high, low — or go straight-up on any number for 35:1.">
          <RouletteArt />
        </GameCard>

        <GameCard route="video-poker" kicker="Jacks or better" title="Video Poker" description="Deal five cards, hold the ones you want, draw to complete your best hand.">
          <VideoPokerArt />
        </GameCard>

        <GameCard route="keno" kicker="Pick your numbers" title="Keno" description="Pick up to 8 lucky numbers from 1–40, then watch 15 draw and collect your prize.">
          <KenoArt />
        </GameCard>

        <GameCard route="scratch-card" kicker="Instant win" title="Scratch Card" description="Buy a card and scratch three-in-a-row to win. Diamond rows pay 50× your bet.">
          <ScratchCardArt />
        </GameCard>

        <GameCard route="coin-flip-streak" kicker="Push your luck" title="Coin Flip Streak" description="Call heads or tails, double your pot on every win, and cash out before it breaks.">
          <CoinFlipStreakArt />
        </GameCard>

        <GameCard route="lucky-wheel" kicker="Wheel of fortune" title="Lucky Wheel" description="Spin the prize wheel for multipliers up to a 50x jackpot.">
          <LuckyWheelArt />
        </GameCard>

        <GameCard route="plinko-drop" kicker="Bounce & win" title="Plinko Drop" description="Drop a chip through the pegs and let it bounce into a multiplier bucket.">
          <PlinkoDropArt />
        </GameCard>

        <GameCard route="high-card-war" kicker="High card wins" title="High Card War" description="Draw against the dealer — the higher card takes the pot. Aces are highest.">
          <HighCardWarArt />
        </GameCard>
      </section>
    </main>
  );
}
