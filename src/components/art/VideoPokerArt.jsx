export default function VideoPokerArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="vp-felt" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="0.8" fill="#1a3a1f" opacity="0.6"/>
        </pattern>
        <filter id="vp-shadow">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.6"/>
        </filter>
      </defs>
      <rect width="145" height="190" fill="#0a1a0f"/>
      <rect width="145" height="190" fill="url(#vp-felt)"/>
      {/* 5 fanned cards — Royal Flush */}
      <rect x="5" y="60" width="34" height="70" rx="5" fill="#fff" transform="rotate(-16,22,95)" filter="url(#vp-shadow)"/>
      <text x="9" y="75" fill="#1a1f2e" fontSize="9" fontWeight="900" transform="rotate(-16,22,95)">10</text>
      <text x="9" y="86" fill="#49d7df" fontSize="11" transform="rotate(-16,22,95)">♠</text>

      <rect x="22" y="50" width="34" height="70" rx="5" fill="#fff" transform="rotate(-8,39,85)" filter="url(#vp-shadow)"/>
      <text x="26" y="65" fill="#1a1f2e" fontSize="9" fontWeight="900" transform="rotate(-8,39,85)">J</text>
      <text x="26" y="76" fill="#49d7df" fontSize="11" transform="rotate(-8,39,85)">♠</text>

      <rect x="50" y="45" width="34" height="70" rx="5" fill="#fff" filter="url(#vp-shadow)"/>
      <text x="55" y="62" fill="#1a1f2e" fontSize="10" fontWeight="900">Q</text>
      <text x="55" y="74" fill="#49d7df" fontSize="12">♠</text>

      <rect x="78" y="50" width="34" height="70" rx="5" fill="#fff" transform="rotate(8,95,85)" filter="url(#vp-shadow)"/>
      <text x="82" y="65" fill="#1a1f2e" fontSize="9" fontWeight="900" transform="rotate(8,95,85)">K</text>
      <text x="82" y="76" fill="#49d7df" fontSize="11" transform="rotate(8,95,85)">♠</text>

      <rect x="96" y="60" width="34" height="70" rx="5" fill="#fff" transform="rotate(16,113,95)" filter="url(#vp-shadow)"/>
      <text x="100" y="75" fill="#f7bd4a" fontSize="10" fontWeight="900" transform="rotate(16,113,95)">A</text>
      <text x="100" y="86" fill="#49d7df" fontSize="11" transform="rotate(16,113,95)">♠</text>

      {/* Royal Flush badge */}
      <rect x="24" y="148" width="96" height="18" rx="9" fill="#f7bd4a"/>
      <text x="72" y="161" textAnchor="middle" fill="#0b0d12" fontSize="10" fontWeight="900">ROYAL FLUSH</text>
    </svg>
  );
}
