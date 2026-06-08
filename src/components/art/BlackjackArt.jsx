export default function BlackjackArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="bj-felt" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="0.8" fill="#1a3a1f" opacity="0.6"/>
        </pattern>
        <filter id="bj-shadow">
          <feDropShadow dx="3" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.6"/>
        </filter>
        <filter id="bj-winshadow">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f7bd4a" floodOpacity="0.5"/>
        </filter>
      </defs>
      <rect width="145" height="190" fill="#0a1a0f"/>
      <rect width="145" height="190" fill="url(#bj-felt)"/>
      {/* K♥ card (back) */}
      <rect x="42" y="55" width="62" height="90" rx="7" fill="#f0f2f8" transform="rotate(-8,73,100)" filter="url(#bj-shadow)"/>
      <text x="50" y="80" fill="#f35f76" fontSize="14" fontWeight="900" transform="rotate(-8,73,100)">K</text>
      <text x="50" y="96" fill="#f35f76" fontSize="18" transform="rotate(-8,73,100)">♥</text>
      {/* A♠ card (front) */}
      <rect x="40" y="45" width="62" height="90" rx="7" fill="#fff" filter="url(#bj-winshadow)"/>
      <text x="48" y="70" fill="#1a1f2e" fontSize="14" fontWeight="900">A</text>
      <text x="48" y="86" fill="#1a1f2e" fontSize="18">♠</text>
      <text x="71" y="100" textAnchor="middle" fill="#1a1f2e" fontSize="28" fontWeight="900">♠</text>
      {/* 21 badge */}
      <rect x="88" y="112" width="38" height="20" rx="10" fill="#f7bd4a"/>
      <text x="107" y="126" textAnchor="middle" fill="#0b0d12" fontSize="11" fontWeight="900">21</text>
    </svg>
  );
}
