import { navigateTo } from "../utils/navigation.js";

export default function GameCard({ route, artClassName = "", kicker, title, description, children }) {
  return (
    <button className="game-card" type="button" onClick={() => navigateTo(route)}>
      <div className={`game-art ${artClassName}`} aria-hidden="true">
        {children}
      </div>
      <div>
        <p className="kicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <strong>Play</strong>
    </button>
  );
}
