import { lazy, Suspense } from "react";
import { useHashRoute } from "./hooks/useHashRoute.js";
import GameHub from "./pages/GameHub.jsx";

// GameHub is the landing page, so it stays eager. Every other page/game is
// code-split into its own chunk and loaded on demand the first time its route
// is visited — this keeps the initial bundle small (PixiJS-heavy games no
// longer ship up front).
const SlotGames = lazy(() => import("./pages/SlotGames.jsx"));
const PassAndPlay = lazy(() => import("./pages/PassAndPlay.jsx"));
const TicTacToe = lazy(() => import("./games/tic-tac-toe/TicTacToe.jsx"));
const NeonSnakeDuel = lazy(() => import("./games/neon-snake-duel/NeonSnakeDuel.jsx"));
const DiceDuel = lazy(() => import("./games/dice-duel/DiceDuel.jsx"));
const NeonReels = lazy(() => import("./games/neon-reels/NeonReels.jsx"));
const NumberRush = lazy(() => import("./games/number-rush/NumberRush.jsx"));
const Shooter = lazy(() => import("./games/shooter/Shooter.jsx"));
const KingQueenMinisterThief = lazy(() => import("./games/king-queen-minister-thief/KingQueenMinisterThief.jsx"));
const Blackjack = lazy(() => import("./games/blackjack/Blackjack.jsx"));
const CosmicCascade = lazy(() => import("./games/cosmic-cascade/CosmicCascade.jsx"));
const FruitFrenzy = lazy(() => import("./games/fruit-frenzy/FruitFrenzy.jsx"));
const GemStorm = lazy(() => import("./games/gem-storm/GemStorm.jsx"));
const Roulette = lazy(() => import("./games/roulette/Roulette.jsx"));
const VideoPoker = lazy(() => import("./games/video-poker/VideoPoker.jsx"));
const Keno = lazy(() => import("./games/keno/Keno.jsx"));
const ScratchCard = lazy(() => import("./games/scratch-card/ScratchCard.jsx"));
const CoinFlipStreak = lazy(() => import("./games/coin-flip-streak/CoinFlipStreak.jsx"));
const LuckyWheel = lazy(() => import("./games/lucky-wheel/LuckyWheel.jsx"));
const PlinkoDrop = lazy(() => import("./games/plinko-drop/PlinkoDrop.jsx"));
const HighCardWar = lazy(() => import("./games/high-card-war/HighCardWar.jsx"));

const routes = {
  "slot-games": SlotGames,
  "pass-and-play": PassAndPlay,
  "tic-tac-toe": TicTacToe,
  "neon-snake-duel": NeonSnakeDuel,
  "dice-duel": DiceDuel,
  "neon-reels": NeonReels,
  "number-rush": NumberRush,
  "duo-space-shooter": Shooter,
  "king-queen-minister-thief": KingQueenMinisterThief,
  "blackjack": Blackjack,
  "cosmic-cascade": CosmicCascade,
  "fruit-frenzy": FruitFrenzy,
  "gem-storm": GemStorm,
  "roulette": Roulette,
  "video-poker": VideoPoker,
  "keno": Keno,
  "scratch-card": ScratchCard,
  "coin-flip-streak": CoinFlipStreak,
  "lucky-wheel": LuckyWheel,
  "plinko-drop": PlinkoDrop,
  "high-card-war": HighCardWar,
};

export default function App() {
  const route = useHashRoute();
  const Page = routes[route] || GameHub;

  return (
    <Suspense fallback={<div className="route-fallback">Loading…</div>}>
      <Page />
    </Suspense>
  );
}
