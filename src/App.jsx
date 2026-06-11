import DiceDuel from "./games/dice-duel/DiceDuel.jsx";
import NeonReels from "./games/neon-reels/NeonReels.jsx";
import NumberRush from "./games/number-rush/NumberRush.jsx";
import Shooter from "./games/shooter/Shooter.jsx";
import KingQueenMinisterThief from "./games/king-queen-minister-thief/KingQueenMinisterThief.jsx";
import Blackjack from "./games/blackjack/Blackjack.jsx";
import CosmicCascade from "./games/cosmic-cascade/CosmicCascade.jsx";
import FruitFrenzy from "./games/fruit-frenzy/FruitFrenzy.jsx";
import GemStorm from "./games/gem-storm/GemStorm.jsx";
import Roulette from "./games/roulette/Roulette.jsx";
import VideoPoker from "./games/video-poker/VideoPoker.jsx";
import Keno from "./games/keno/Keno.jsx";
import ScratchCard from "./games/scratch-card/ScratchCard.jsx";
import CoinFlipStreak from "./games/coin-flip-streak/CoinFlipStreak.jsx";
import LuckyWheel from "./games/lucky-wheel/LuckyWheel.jsx";
import PlinkoDrop from "./games/plinko-drop/PlinkoDrop.jsx";
import HighCardWar from "./games/high-card-war/HighCardWar.jsx";
import { useHashRoute } from "./hooks/useHashRoute.js";
import GameHub from "./pages/GameHub.jsx";
import SlotGames from "./pages/SlotGames.jsx";

const routes = {
  "slot-games": SlotGames,
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

  return <Page />;
}
