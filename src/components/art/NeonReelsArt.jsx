export default function NeonReelsArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      <defs>
        <pattern id="nr-scan" width="2" height="4" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="#fff" opacity="0.3"/>
        </pattern>
        <filter id="nr-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="145" height="190" fill="url(#nr-scan)" opacity="0.08"/>
      {/* Left reel */}
      <rect x="8" y="45" width="38" height="100" rx="5" fill="#181d28" stroke="#49d7df" strokeWidth="1.5"/>
      <text x="27" y="107" textAnchor="middle" fill="#49d7df" fontSize="32" fontWeight="900">◆</text>
      {/* Center reel */}
      <rect x="53" y="35" width="38" height="120" rx="5" fill="#181d28" stroke="#f7bd4a" strokeWidth="2"/>
      <text x="72" y="107" textAnchor="middle" fill="#f7bd4a" fontSize="38" fontWeight="900" filter="url(#nr-glow)">7</text>
      {/* Right reel */}
      <rect x="98" y="45" width="38" height="100" rx="5" fill="#181d28" stroke="#f35f76" strokeWidth="1.5"/>
      <text x="117" y="107" textAnchor="middle" fill="#f35f76" fontSize="28" fontWeight="900">★</text>
      <text x="72" y="178" textAnchor="middle" fill="#364052" fontSize="9" fontWeight="700" letterSpacing="0.1em">NEON REELS</text>
    </svg>
  );
}
