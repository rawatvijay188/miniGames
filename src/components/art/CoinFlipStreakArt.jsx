export default function CoinFlipStreakArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      {/* Motion blur lines above coin */}
      <line x1="72" y1="20" x2="72" y2="48" stroke="#364052" strokeWidth="1" opacity="0.5"/>
      <line x1="67" y1="22" x2="67" y2="44" stroke="#364052" strokeWidth="0.5" opacity="0.3"/>
      <line x1="77" y1="22" x2="77" y2="44" stroke="#364052" strokeWidth="0.5" opacity="0.3"/>
      {/* Coin */}
      <ellipse cx="72" cy="88" rx="38" ry="40" fill="#f7bd4a" transform="rotate(-10,72,88)"/>
      <ellipse cx="72" cy="88" rx="30" ry="32" fill="none" stroke="#c07a00" strokeWidth="2" transform="rotate(-10,72,88)"/>
      <text x="70" y="94" textAnchor="middle" fill="#0b0d12" fontSize="22" fontWeight="900" transform="rotate(-10,72,88)">H</text>
      {/* Streak counter */}
      <rect x="30" y="142" width="85" height="26" rx="13" fill="#181d28" stroke="#49d7df" strokeWidth="1.5"/>
      <text x="72" y="160" textAnchor="middle" fill="#49d7df" fontSize="14" fontWeight="900">3× STREAK</text>
    </svg>
  );
}
