import { navigateTo } from "../utils/navigation.js";

export default function GameNav() {
  return (
    <nav className="game-nav" aria-label="Game navigation">
      <button type="button" onClick={() => navigateTo("home")}>
        All games
      </button>
    </nav>
  );
}
