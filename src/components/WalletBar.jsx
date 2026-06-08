import { useCoins } from "../context/CoinContext.jsx";
import { playTone } from "../utils/audio.js";

// Hub-level wallet: always-visible coin total plus the daily bonus claim.
export default function WalletBar() {
  const { balance, streak, canClaimBonus, nextBonusAmount, claimDailyBonus } = useCoins();

  const claim = () => {
    if (!canClaimBonus) return;
    playTone(true, 660, 0.14);
    setTimeout(() => playTone(true, 880, 0.16), 120);
    claimDailyBonus();
  };

  return (
    <section className="wallet-bar" aria-label="Your wallet">
      <div className="wallet-balance">
        <span className="wallet-coin" aria-hidden="true">🪙</span>
        <div>
          <span className="wallet-label">Coins</span>
          <strong aria-label={`Coin balance: ${balance}`}>{balance.toLocaleString()}</strong>
        </div>
      </div>

      {canClaimBonus ? (
        <button type="button" className="daily-bonus-btn" onClick={claim}>
          <span>Claim daily bonus</span>
          <strong>+{nextBonusAmount}</strong>
        </button>
      ) : (
        <div className="daily-bonus-done" role="status">
          <span>Daily bonus claimed</span>
          <strong>{streak}-day streak · back tomorrow</strong>
        </div>
      )}
    </section>
  );
}
