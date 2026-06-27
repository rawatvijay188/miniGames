export default function PassAndPlayArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      <defs>
        <filter id="pnp-shadow">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
        </filter>
      </defs>
      {/* Player 1 (cyan) */}
      <circle cx="38" cy="74" r="15" fill="none" stroke="#49d7df" strokeWidth="3"/>
      <circle cx="38" cy="69" r="6" fill="#49d7df"/>
      <path d="M26 88 q12 -12 24 0" fill="none" stroke="#49d7df" strokeWidth="3" strokeLinecap="round"/>
      {/* Player 2 (gold) */}
      <circle cx="107" cy="74" r="15" fill="none" stroke="#f7bd4a" strokeWidth="3"/>
      <circle cx="107" cy="69" r="6" fill="#f7bd4a"/>
      <path d="M95 88 q12 -12 24 0" fill="none" stroke="#f7bd4a" strokeWidth="3" strokeLinecap="round"/>
      {/* VS */}
      <text x="72" y="80" textAnchor="middle" fill="#364052" fontSize="14" fontWeight="900">VS</text>
      {/* Shared device passing between them */}
      <rect x="56" y="118" width="33" height="48" rx="6" fill="#202738" stroke="#f6f7fb" strokeWidth="2"/>
      <rect x="61" y="125" width="23" height="30" rx="3" fill="#0b0d12"/>
      <circle cx="72" cy="160" r="2.5" fill="#9aa6b7"/>
      <path d="M40 142 h12 M93 142 h12" stroke="#9aa6b7" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M50 138 l4 4 l-4 4 M95 138 l-4 4 l4 4" fill="none" stroke="#9aa6b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
