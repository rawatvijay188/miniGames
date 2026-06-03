import DiceDuel from "./games/dice-duel/DiceDuel.jsx";
import NeonReels from "./games/neon-reels/NeonReels.jsx";
import NumberRush from "./games/number-rush/NumberRush.jsx";
import Shooter from "./games/shooter/Shooter.jsx";
import KingQueenMinisterThief from "./games/king-queen-minister-thief/KingQueenMinisterThief.jsx";
import Blackjack from "./games/blackjack/Blackjack.jsx";
import { useHashRoute } from "./hooks/useHashRoute.js";
import GameHub from "./pages/GameHub.jsx";

const routes = {
  "dice-duel": DiceDuel,
  "neon-reels": NeonReels,
  "number-rush": NumberRush,
  "duo-space-shooter": Shooter,
  "king-queen-minister-thief": KingQueenMinisterThief,
  "blackjack": Blackjack
};

export default function App() {
  const route = useHashRoute();
  const Page = routes[route] || GameHub;

  return <Page />;
}
